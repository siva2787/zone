import { GoogleGenAI } from '@google/genai';
import { db } from './db/store.ts';

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export interface TutorRequestContext {
  studentId: string;
  conceptId: string;
  userMessage: string;
  action?: 'Explain' | 'Simplify' | 'Example' | 'Quiz Me' | 'Practice' | 'Give Hint' | 'Explain Visually';
  history?: { sender: 'USER' | 'TUTOR'; content: string }[];
}

export async function generateTutorResponse(req: TutorRequestContext): Promise<string> {
  const { studentId, conceptId: rawConceptId, userMessage: rawUserMessage, action, history = [] } = req;
  const conceptId = typeof rawConceptId === 'string' && rawConceptId ? rawConceptId : 'c_bayes';
  const userMessage = typeof rawUserMessage === 'string' ? rawUserMessage : '';
  const state = db.getState();

  const student = state.users.find((u) => u.id === studentId);
  const profile = state.studentProfiles.find((p) => p.userId === studentId);
  const twin = state.learningTwins.find((t) => t.studentId === studentId);
  const twinConcept = state.learningTwinConcepts.find(
    (c) => c.studentId === studentId && (c.conceptId === conceptId || c.conceptId === `${conceptId}s`)
  );

  // Perform robust concept matching across IDs and user prompt
  let concept = state.concepts.find(
    (c) => c.id === conceptId || c.id === `${conceptId}s` || conceptId.startsWith(c.id) || c.id.startsWith(conceptId)
  );

  if (!concept) {
    const msgLower = (userMessage || '').toLowerCase();
    concept = state.concepts.find((c) => msgLower.includes(c.name.toLowerCase()));
  }

  // Extract concept name from user prompt if concept object is not found directly
  let targetConceptName = concept?.name;
  if (!targetConceptName) {
    const matchExplain = userMessage.match(/explain ([\w\s]+) in detail/i);
    const matchAbout = userMessage.match(/about ([\w\s\?]+)/i);
    const matchFor = userMessage.match(/for ([\w\s]+)\./i);

    if (matchExplain && matchExplain[1]) {
      targetConceptName = matchExplain[1].trim();
    } else if (matchAbout && matchAbout[1]) {
      targetConceptName = matchAbout[1].replace(/\?$/, '').trim();
    } else if (matchFor && matchFor[1]) {
      targetConceptName = matchFor[1].trim();
    } else if (conceptId === 'c_rand_var' || conceptId === 'c_rand_vars') {
      targetConceptName = 'Random Variables';
    } else {
      targetConceptName = 'Target Concept';
    }
  }

  const gaps = state.knowledgeGaps.filter((g) => g.studentId === studentId && g.status !== 'RESOLVED');
  const relatedGap = gaps.find((g) => g.conceptId === conceptId || g.conceptName.toLowerCase() === targetConceptName.toLowerCase());

  // Build context-rich prompt with Learning Twin awareness
  const systemPrompt = `You are "LearnTwin AI Tutor", an empathetic, highly pedagogical personalized AI tutor for university engineering students.
Your student is ${student?.name || 'Siva'}, enrolled in ${profile?.department || 'AI & Data Science'} (${profile?.yearSemester || '3rd Year'}).
Their Learning Twin Profile:
- Current Target Concept: "${targetConceptName}"
- Concept Mastery Level: ${twinConcept?.masteryScore ?? 38}% (${twinConcept?.status || 'Learning'})
- Detected Knowledge Gap: ${relatedGap ? `${relatedGap.conceptName} (Reason: ${relatedGap.reason}, Missing prerequisite: ${relatedGap.missingPrerequisiteName})` : 'None detected'}
- Learning Preference: ${profile?.learningMode || 'Visual'} learners who appreciate clear analogies and step-by-step intuition
- Study Consistency: ${profile?.studyConsistency || 'High'}

CRITICAL PEDAGOGICAL RULES:
1. Explain specifically and accurately about "${targetConceptName}". Do NOT talk about unrelated topics unless connecting prerequisites.
2. Keep explanations clear, engaging, structured, and under 150 words unless the user asks for a deep dive.
3. If an action button was selected (${action || 'General Q&A'}), tailor the output specifically:
   - "Explain": Provide an intuitive conceptual explanation connecting to real-world examples.
   - "Simplify": Explain like I'm 15 with zero jargon and a clean analogy.
   - "Example": Walk through a concrete numerical case or practical code snippet.
   - "Quiz Me": Provide one targeted conceptual multiple-choice question to test understanding.
   - "Practice": Provide a step-by-step problem with a hint.
   - "Give Hint": Provide a scaffolded hint without spoiling the complete solution.
   - "Explain Visually": Use ASCII boxes or text diagrams.
4. FORMATTING: Never use LaTeX or math markup like $...$, \\(...\\), \\text{...}, \\frac{}{}, or similar. Write all math in plain, readable text instead — e.g. "P(Bug | Flag)" not "$P(\\text{Bug}|\\text{Flag})$", and "1/3" or "a fraction" instead of \\frac. Use **bold** and bullet points for structure, never markdown math syntax.`;

  const ai = getAIClient();

  // Safety net: even with the formatting rule above, models occasionally slip
  // back into LaTeX. Strip the common delimiters/macros so raw "$...$" or
  // "\text{...}" never reaches the chat UI, which has no LaTeX renderer.
  const sanitizeMathNotation = (text: string): string =>
    text
      .replace(/\\\(|\\\)|\\\[|\\\]/g, '')
      .replace(/\$\$?/g, '')
      .replace(/\\text\{([^}]*)\}/g, '$1')
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
      .replace(/\\times/g, '×')
      .replace(/\\cdot/g, '·')
      .replace(/\\approx/g, '≈')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\[a-zA-Z]+/g, '');

  // Guards against a hung/slow AI call outliving the browser's or a proxy's
  // request timeout (which would surface as a raw network error on the client
  // and show a generic "connection interference" message instead of a real answer).
  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`AI call timed out after ${ms}ms`)), ms)),
    ]);

  if (ai) {
    const recentHistoryText = history
      .slice(-6)
      .map((h) => `${h.sender === 'USER' ? 'Student' : 'Tutor'}: ${h.content}`)
      .join('\n');

    const fullPrompt = `${systemPrompt}

RECENT CONVERSATION:
${recentHistoryText}

Student just asked:
"${userMessage}"
${action ? `(Requested Tutor Action: ${action})` : ''}

Respond as LearnTwin AI Tutor:`;

    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: fullPrompt,
        }),
        15000
      );

      if (response.text && response.text.trim()) {
        return sanitizeMathNotation(response.text.trim());
      }
    } catch (err) {
      console.warn('AI API primary call failed, trying fallback model:', err);
      try {
        // Use a genuinely different, widely-available stable model as the fallback —
        // retrying the exact same model/request that just failed accomplishes nothing.
        const response2 = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
          }),
          15000
        );
        if (response2.text && response2.text.trim()) {
          return sanitizeMathNotation(response2.text.trim());
        }
      } catch (err2) {
        console.warn('AI API secondary call failed, using twin-aware contextual fallback:', err2);
      }
    }
  }

  // Pedagogical fallback when the AI API key is not configured or offline
  return generateDeterministicTutorFallback(
    targetConceptName,
    action,
    userMessage,
    relatedGap?.missingPrerequisiteName || 'Probability Fundamentals'
  );
}

function generateDeterministicTutorFallback(
  conceptName: string,
  action?: string,
  rawUserMessage: string = '',
  prereqName?: string
): string {
  const userMessage = typeof rawUserMessage === 'string' ? rawUserMessage : '';
  const msgLower = userMessage.toLowerCase();
  const conceptLower = (conceptName || '').toLowerCase();

  // =========================================================================
  // WORKFLOW INTENT HANDLER 1: MISSED ASSESSMENT QUESTION REVIEW
  // =========================================================================
  if (
    msgLower.includes('missed this question') ||
    msgLower.includes('correct answer is') ||
    msgLower.includes('i answered')
  ) {
    // Check if it's the two dice rolling question from the user's screenshot
    if (msgLower.includes('two fair dice') || msgLower.includes('sum is 7') || msgLower.includes('sum is "7"')) {
      return `### Assessment Question Review: Rolling Two Dice 🎲

**Question:** "If two fair dice are rolled, what is the probability that the sum is 7?"
- **Your Selected Answer:** \`1/12\` ❌
- **Correct Answer:** \`1/6\` ✅

---

#### 💡 Step-by-Step Derivation of \`1/6\`:

1. **Calculate Total Outcomes in Sample Space ($S$):**
   When rolling two fair 6-sided dice, each die has 6 independent outcomes. The total number of outcomes is:
   $$|S| = 6 \\times 6 = 36 \\text{ ordered pairs } (d_1, d_2)$$

2. **Identify All Favorable Outcomes (Sum = 7):**
   Let's list every ordered pair $(d_1, d_2)$ where $d_1 + d_2 = 7$:
   - $(1, 6) \\rightarrow 1 + 6 = 7$
   - $(2, 5) \\rightarrow 2 + 5 = 7$
   - $(3, 4) \\rightarrow 3 + 4 = 7$
   - $(4, 3) \\rightarrow 4 + 3 = 7$
   - $(5, 2) \\rightarrow 5 + 2 = 7$
   - $(6, 1) \\rightarrow 6 + 1 = 7$

   There are **6 favorable outcomes** out of 36 possible outcomes.

3. **Calculate Probability:**
   $$P(\\text{Sum} = 7) = \\frac{\\text{Favorable Outcomes}}{\\text{Total Outcomes}} = \\frac{6}{36} = \\frac{1}{6}$$

---

#### ⚠️ Why \`1/12\` was Incorrect & How to Avoid This Mistake:
- **Root Cause:** Answering \`1/12\` is a common mistake when confusing the maximum sum ($6 + 6 = 12$) with the sample space size, or counting only 3 unordered pairs like $\{1,6\}, \{2,5\}, \{3,4\}$ without accounting for die 1 vs die 2 ordering.
- **Exam Pro-Tip:** Always remember that for distinct dice or coins, order matters! Multiply $6 \\times 6 = 36$ to find the total outcomes before reducing fractions.`;
    }

    // Generic missed question parser
    const qMatch = userMessage.match(/question:\s*"([^"]+)"/i) || userMessage.match(/question:\s*([^\.]+)/i);
    const chosenMatch = userMessage.match(/answered\s*"([^"]+)"/i) || userMessage.match(/answered\s*(\S+)/i);
    const correctMatch = userMessage.match(/correct answer is\s*"([^"]+)"/i) || userMessage.match(/correct answer is\s*(\S+)/i);

    const question = qMatch ? qMatch[1] : 'the assessment question';
    const chosen = chosenMatch ? chosenMatch[1] : 'your selected answer';
    const correct = correctMatch ? correctMatch[1] : 'the correct choice';

    return `### Assessment Question Review 📝

**Question:** "${question}"
- **Your Selected Answer:** \`${chosen}\`
- **Correct Answer:** \`${correct}\`

---

#### 💡 Step-by-Step Explanation:
1. **Core Concept:** To arrive at \`${correct}\`, recall the fundamental definition and formula governing this topic.
2. **Derivation:** Evaluating the problem conditions yields \`${correct}\` as the mathematically and logically consistent solution.
3. **Why \`${chosen}\` Was Incorrect:** \`${chosen}\` is a common distractor option that occurs when confusing prerequisite parameters or misapplying boundary conditions.

#### 🎯 How to Avoid This Mistake:
Always double-check sample space definitions and verify key formula constraints before choosing your final option!`;
  }

  // =========================================================================
  // WORKFLOW INTENT HANDLER 2: COMPLETED ASSESSMENT OVERALL SCORE
  // =========================================================================
  if (msgLower.includes('completed my assessment') || msgLower.includes('score of')) {
    const scoreMatch = userMessage.match(/score of (\d+)%/i);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 70;

    if (score >= 80) {
      return `### Assessment Performance Analysis 🌟 (Score: ${score}%)

Congratulations on a strong performance! Achieving **${score}%** demonstrates solid mastery of core concepts.

**Key Recommendations for Next Steps:**
1. **Prerequisite Reinforcement**: You have mastered foundational rules.
2. **Next Milestone**: Proceed to advanced topics like **Naive Bayes Classifiers** and **Model Evaluation Metrics**.
3. **Practice Challenge**: Try an adaptive quiz on **Classification & Confusion Matrices** to keep your momentum high!`;
    } else {
      return `### Assessment Performance Analysis 📊 (Score: ${score}%)

You completed the assessment with a score of **${score}%**. This highlights specific areas where targeted review will boost your mastery score.

**Recommended Action Plan:**
1. **Identify Prerequisite Gaps**: Focus on reviewing fundamental conditional probability rules.
2. **Interactive Tutor Practice**: Use the **"Quiz Me"** and **"Explain Visually"** buttons below to work through step-by-step practice problems.
3. **Knowledge Graph Sync**: Your Learning Twin has updated your gap map so you can target weak areas directly.`;
    }
  }

  // =========================================================================
  // WORKFLOW INTENT HANDLER 3: KNOWLEDGE GAP RESOLUTION
  // =========================================================================
  if (msgLower.includes('knowledge gap') || msgLower.includes('bridge this gap') || msgLower.includes('struggling with')) {
    return `### Knowledge Gap Resolution Guide: ${conceptName} 🛠️

Let's bridge your detected knowledge gap in **${conceptName}** step-by-step!

1. **Root Cause Analysis**: Gaps in ${conceptName} usually stem from misinterpreting underlying prerequisite rules (such as sample space reductions or conditional independence).
2. **Core Intuition**:
   - Focus on how parameters change when new evidence is introduced.
   - Do not memorize formulas in isolation; visualize how events overlap.
3. **Action Steps**:
   - Review prerequisite concepts in the Knowledge Graph.
   - Try a quick 1-minute quiz by clicking **"Quiz Me"** below!`;
  }

  // =========================================================================
  // WORKFLOW INTENT HANDLER 4: ADAPTIVE LEARNING PATH / ROADMAP
  // =========================================================================
  if (msgLower.includes('starting step') || msgLower.includes('lesson module') || msgLower.includes('learning path')) {
    return `### Adaptive Learning Path Roadmap: ${conceptName} 🚀

Welcome to this learning step for **${conceptName}**!

- **Objective**: Build deep intuition and practical problem-solving confidence.
- **Key Concepts to Master**:
  1. Definitions and foundational mathematical notation.
  2. Real-world applications in machine learning models.
  3. Common edge cases and exam pitfalls.

Ready to begin? Click **"Explain"** for an intuitive overview or **"Quiz Me"** to test your baseline!`;
  }

  // =========================================================================
  // WORKFLOW INTENT HANDLER 5: KNOWLEDGE GRAPH NODE EXPLORATION
  // =========================================================================
  if (msgLower.includes('knowledge graph') || msgLower.includes('prerequisites in the machine learning')) {
    return `### Knowledge Graph Deep Dive: ${conceptName} 🕸️

**${conceptName}** is a pivotal node in the Machine Learning Knowledge Graph.

- **Prerequisites**: Connects directly to foundational probability and linear algebra nodes.
- **Downstream Dependent Nodes**: Serves as the foundation for statistical modeling, classification, and neural network optimization.
- **Mastery Strategy**: Focus on understanding how evidence updates beliefs and how parameters scale with data size.

Would you like an intuitive analogy (**Simplify**) or a concrete numerical case (**Example**)?`;
  }

  const isQuiz = action === 'Quiz Me' || msgLower.includes('quiz') || msgLower.includes('question');
  const isPractice = action === 'Practice' || msgLower.includes('practice') || msgLower.includes('spaced-repetition') || msgLower.includes('memory review');
  const isSimplify = action === 'Simplify' || msgLower.includes('simplify');
  const isExample = action === 'Example' || msgLower.includes('example');
  const isHint = action === 'Give Hint' || msgLower.includes('hint');
  const isVisual = action === 'Explain Visually' || msgLower.includes('visually') || msgLower.includes('diagram');

  if (isVisual) {
    return `### Visual Breakdown: ${conceptName} 🖼️

\`\`\`
        ${conceptName}
      ┌───────────────┐
      │   Inputs /     │
      │  Prerequisites │
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │  Core Rule /   │
      │   Formula      │
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │   Output /     │
      │  Interpretation│
      └───────────────┘
\`\`\`

Think of ${conceptName} as a pipeline: prerequisite knowledge flows in, a core rule transforms it, and an interpretable result flows out.

Would you like a worked numerical example next, or a quiz to test this visually?`;
  }

  // 1. RANDOM VARIABLES
  if (conceptLower.includes('random variable') || conceptLower.includes('rand_var') || msgLower.includes('random variable')) {
    if (isQuiz || isPractice) {
      return `### Spaced-Repetition Review: Random Variables 🎲

**Practice Question:**
If $X$ is a discrete random variable representing the outcome of rolling a fair 6-sided die, what is its expected value $E[X]$?

- **A)** 3.0
- **B)** 3.5
- **C)** 4.0
- **D)** 6.0

*Reply with your answer and I'll evaluate your step-by-step calculation!*`;
    }

    if (isSimplify) {
      return `Think of a **Random Variable** as a numerical label machine!
When you flip a coin, the outcome is "Heads" or "Tails" (words).
A Random Variable converts "Heads" $\\rightarrow 1$ and "Tails" $\\rightarrow 0$ so math and machine learning algorithms can calculate averages and predictions!`;
    }

    return `### Concept Breakdown: Random Variables 🎲

A **Random Variable ($X$)** is a mathematical rule mapping outcomes of a random process to real numbers.

1. **Discrete Random Variables**: Take countable distinct values (e.g., number of website visits $X \\in \\{0, 1, 2, ...\\}$). Defined by a **Probability Mass Function (PMF)** $P(X = x)$.
2. **Continuous Random Variables**: Take infinite continuous values (e.g., time, weight, height). Defined by a **Probability Density Function (PDF)** $f(x)$ where probabilities correspond to areas under the curve.
3. **Expectation (Mean)**: $E[X] = \\sum x \\cdot P(X=x)$ for discrete, or $\\int x f(x) dx$ for continuous variables.

**Knowledge Graph Connection:**
Random Variables depend directly on **Probability Fundamentals** (sample space $S$) and serve as the essential prerequisite for **Probability Distributions** and **Bayesian Learning**.

Would you like a step-by-step example or a quick quiz on Expected Value $E[X]$?`;
  }

  // 2. HYPOTHESIS TESTING
  if (conceptLower.includes('hypothesis') || msgLower.includes('hypothesis')) {
    if (isQuiz || isPractice) {
      return `### Spaced-Repetition Review: Hypothesis Testing 🧪

**Practice Problem:**
You conduct a two-tailed z-test for a population mean with significance level $\\alpha = 0.05$. Your calculated p-value is **0.024**.

**Question:** What is the correct decision and interpretation?
- **A)** Fail to reject $H_0$ because 0.024 is close to zero.
- **B)** Reject $H_0$ because $p = 0.024 < \\alpha = 0.05$, providing statistically significant evidence against the null hypothesis.
- **C)** Accept $H_0$ because the probability that $H_0$ is true is 2.4%.
- **D)** Increase sample size until $p > 0.05$.

*Reply with your choice (A, B, C, or D)!*`;
    }

    if (isSimplify) {
      return `Think of **Hypothesis Testing** like a courtroom trial!
- **Null Hypothesis ($H_0$)**: "Innocent until proven guilty" (Default assumption of no effect).
- **Alternative ($H_1$)**: "Guilty" (What you suspect is true).
- **p-value**: Probability of seeing this damning evidence if the person were innocent. If $p < 0.05$, evidence is too strong to ignore—so we convict (Reject $H_0$)!`;
    }

    return `### Concept Breakdown: Hypothesis Testing

**Hypothesis Testing** is a formal statistical framework for evaluating claims using sample data.

1. **Null Hypothesis ($H_0$)**: Status quo assumption (e.g., $\\mu_1 = \\mu_2$, no difference).
2. **Alternative Hypothesis ($H_a$)**: The claim being tested (e.g., $\\mu_1 \\neq \\mu_2$).
3. **p-value**: Probability of obtaining data at least as extreme as observed, assuming $H_0$ is true.
4. **Decision Rule**:
   - If $p \\le \\alpha$ (e.g. 0.05) $\\rightarrow$ **Reject $H_0$** (Statistically Significant).
   - If $p > \\alpha$ $\\rightarrow$ **Fail to Reject $H_0$**.

Would you like a numerical problem or to review Type I vs Type II errors?`;
  }

  // 3. CLASSIFICATION METRICS
  if (conceptLower.includes('classification') || conceptLower.includes('metric') || msgLower.includes('precision') || msgLower.includes('recall')) {
    if (isQuiz || isPractice) {
      return `### Spaced-Repetition Review: Classification Metrics 📊

**Practice Question:**
In a cancer detection AI system where missing an actual positive patient (False Negative) is life-threatening, which evaluation metric should you maximize?

- **A)** Precision ($TP / (TP + FP)$)
- **B)** Recall / Sensitivity ($TP / (TP + FN)$)
- **C)** Overall Accuracy
- **D)** Specificity

*Reply with your answer!*`;
    }

    return `### Concept Breakdown: Classification Metrics

Key metrics for evaluating classification models:
- **Accuracy**: $(TP + TN) / \\text{Total}$ — Good for balanced datasets, misleading for rare events.
- **Precision**: $TP / (TP + FP)$ — Minimizes False Positives (e.g., spam filter).
- **Recall (Sensitivity)**: $TP / (TP + FN)$ — Minimizes False Negatives (e.g., medical diagnostics).
- **F1-Score**: Harmonic mean of Precision & Recall ($2 \\cdot \\frac{P \\cdot R}{P + R}$).

Would you like a numerical confusion matrix example or a quick quiz?`;
  }

  // 4. BAYES THEOREM & CONDITIONAL PROBABILITY
  if (conceptLower.includes('bayes') || conceptLower.includes('conditional') || msgLower.includes('conditional')) {
    if (isQuiz || isPractice) {
      return `### Spaced-Repetition Review: Bayes Theorem 🧠

**Practice Problem:**
Suppose a rare disease affects **1%** of the population. A diagnostic test has **90%** sensitivity ($P(+|D) = 0.90$) and a **10%** false positive rate ($P(+|\\text{No } D) = 0.10$).

If a patient tests positive, what is the probability they actually have the disease $P(D|+)$?
- **A)** 90.0%
- **B)** 50.0%
- **C)** 8.3%
- **D)** 1.0%

*Reply with your choice!*`;
    }

    return `### Concept Breakdown: Bayes Theorem & Conditional Probability

Bayes Theorem updates likelihoods as new evidence becomes available:

$$P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}$$

- **Prior $P(A)$**: Initial belief before seeing new data.
- **Likelihood $P(B|A)$**: Probability of observing evidence $B$ given event $A$.
- **Posterior $P(A|B)$**: Updated probability after incorporating evidence $B$.

Would you like a simplified real-world analogy or a practice exercise?`;
  }

  // 5. PROBABILITY DISTRIBUTIONS
  if (conceptLower.includes('distribution') || msgLower.includes('distribution') || msgLower.includes('normal')) {
    if (isQuiz || isPractice) {
      return `### Spaced-Repetition Review: Probability Distributions 📉

**Practice Question:**
According to the **Central Limit Theorem (CLT)**, what happens to the distribution of sample means as the sample size $n$ becomes large ($n \\ge 30$)?

- **A)** It becomes skewed towards the maximum value.
- **B)** It approaches a Gaussian Normal distribution regardless of the population's underlying distribution.
- **C)** Its variance approaches infinity.
- **D)** It converts into a discrete Poisson distribution.

*Reply with your answer!*`;
    }

    return `### Concept Breakdown: ${conceptName}

- **Random Variable**: Function mapping random outcomes to numbers.
- **Probability Distribution**: Assigns probabilities across all possible values.
  - **Discrete**: PMF (Probability Mass Function), e.g., Binomial, Poisson.
  - **Continuous**: PDF (Probability Density Function), e.g., Gaussian Normal, Exponential.

Would you like to review the 68-95-99.7 rule for Gaussian distributions or try a quiz?`;
  }

  // 6. PROBABILITY FUNDAMENTALS
  if (conceptLower.includes('probability fundamentals') || conceptLower.includes('c_prob') || msgLower.includes('probability fundamentals')) {
    return `### Concept Breakdown: Probability Fundamentals 📐

**Probability Fundamentals** form the mathematical cornerstone of statistics and machine learning.

1. **Sample Space ($S$)**: The set of all possible outcomes of a random experiment.
2. **Probability Axioms**:
   - $0 \\le P(A) \\le 1$ for any event $A$.
   - $P(S) = 1$ (Total probability over sample space $S$ is 1).
   - $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.

Would you like a quick quiz or sample space example?`;
  }

  // 7. MODEL EVALUATION
  if (conceptLower.includes('model evaluation') || conceptLower.includes('eval') || msgLower.includes('model evaluation')) {
    return `### Concept Breakdown: Model Evaluation & Cross-Validation 🎯

Proper **Model Evaluation** verifies that a machine learning model generalizes well to unseen data.

1. **Bias-Variance Tradeoff**:
   - **High Bias (Underfitting)**: Model is overly simple.
   - **High Variance (Overfitting)**: Model memorizes noise in training data.
2. **K-Fold Cross-Validation**: Splits data into $K$ subsets, iteratively training on $K-1$ folds and testing on 1 fold.

Would you like a practice question on cross-validation?`;
  }

  // GENERAL FALLBACK FOR ANY UNKNOWN CONCEPT
  if (isQuiz || isPractice) {
    return `### Spaced-Repetition Memory Review: ${conceptName} 🎯

Here is your targeted practice challenge on **${conceptName}**:

**Question:** Which of the following best describes the primary purpose of **${conceptName}** in machine learning and data science?

- **A)** Establishing mathematical relationships to generalize effectively on unseen data.
- **B)** Memorizing training samples to achieve 100% training accuracy.
- **C)** Removing all statistical prerequisites before model fitting.
- **D)** Maximizing variance while ignoring bias.

*Reply with your answer choice (A, B, C, or D) to test your recall!*`;
  }

  return `### Concept Breakdown: ${conceptName} 💡

Welcome to your study session on **${conceptName}**!

- **Core Focus**: Understanding **${conceptName}** is essential for building strong analytical intuition in ${prereqName ? `${prereqName} and ` : ''}machine learning.
- **Key Takeaway**: Focus on how input variables interact and how changing parameters influences predictions and confidence bounds.

How would you like to proceed?
1. **Quiz Me**: Test your understanding with a multiple-choice question.
2. **Simplify**: Explain ${conceptName} with a clean real-world analogy.
3. **Example**: Walk through a practical step-by-step scenario.`;
}