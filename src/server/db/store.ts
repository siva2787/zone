import {
  User,
  StudentProfile,
  TeacherProfile,
  Subject,
  Topic,
  Concept,
  ConceptPrerequisite,
  LearningTwin,
  LearningTwinConcept,
  KnowledgeGap,
  Question,
  Assessment,
  AssessmentAttempt,
  TutorConversation,
  TutorMessage,
  RetentionRecord,
  LearningGoal,
  NotificationItem,
  TeacherStudentSummary,
  Intervention,
  AttemptEvidence,
  DecisionRecord,
  TeacherOverride,
} from '../../types.ts';
import fs from 'fs';
import path from 'path';

export interface DatabaseState {
  _seedVersion?: number;
  users: User[];
  studentProfiles: StudentProfile[];
  teacherProfiles: TeacherProfile[];
  subjects: Subject[];
  topics: Topic[];
  concepts: Concept[];
  prerequisites: ConceptPrerequisite[];
  learningTwins: LearningTwin[];
  learningTwinConcepts: LearningTwinConcept[];
  knowledgeGaps: KnowledgeGap[];
  questions: Question[];
  assessments: Assessment[];
  assessmentAttempts: AssessmentAttempt[];
  attemptEvidences: AttemptEvidence[];
  decisionRecords: DecisionRecord[];
  teacherOverrides: TeacherOverride[];
  tutorConversations: TutorConversation[];
  tutorMessages: TutorMessage[];
  retentionRecords: RetentionRecord[];
  learningGoals: LearningGoal[];
  notifications: NotificationItem[];
  teacherStudents: TeacherStudentSummary[];
  interventions: Intervention[];
}

const DATA_FILE = path.join(process.cwd(), 'data', 'learntwin_db.json');

// Bump SEED_VERSION to force clean-slate reseed on next startup
const SEED_VERSION = 11;

// Initialize with clean-slate runtime state (educational curriculum content preserved)
export function getInitialSeed(): DatabaseState {
  // ===== RUNTIME DATA: starts completely empty =====
  const users: User[] = [];
  const studentProfiles: StudentProfile[] = [];
  const teacherProfiles: TeacherProfile[] = [];
  const learningTwins: LearningTwin[] = [];
  const learningTwinConcepts: LearningTwinConcept[] = [];
  const knowledgeGaps: KnowledgeGap[] = [];
  const assessmentAttempts: AssessmentAttempt[] = [];
  const attemptEvidences: AttemptEvidence[] = [];
  const decisionRecords: DecisionRecord[] = [];
  const teacherOverrides: TeacherOverride[] = [];
  const tutorConversations: TutorConversation[] = [];
  const tutorMessages: TutorMessage[] = [];
  const retentionRecords: RetentionRecord[] = [];
  const learningGoals: LearningGoal[] = [];
  const notifications: NotificationItem[] = [];
  const teacherStudents: TeacherStudentSummary[] = [];
  const interventions: Intervention[] = [];

  // ===== EDUCATIONAL CONTENT: preserved for fresh diagnostic/assessment workflows =====
  const subjects: Subject[] = [
    {
      id: 'sub_ml',
      name: 'Machine Learning',
      code: 'ML301',
      description: 'Supervised and unsupervised models, statistical foundations, and inductive learning.',
      iconName: 'Cpu',
      color: '#6366f1',
    },
    {
      id: 'sub_stat',
      name: 'Statistics & Probability',
      code: 'STAT202',
      description: 'Probability theory, distributions, hypothesis testing, and Bayesian reasoning.',
      iconName: 'BarChart2',
      color: '#ec4899',
    },
    {
      id: 'sub_py',
      name: 'Python for AI',
      code: 'PY101',
      description: 'NumPy, Pandas, vectorized computing, and AI pipeline orchestration.',
      iconName: 'Code',
      color: '#10b981',
    },
    {
      id: 'sub_ds',
      name: 'Data Structures & Algorithms',
      code: 'DS201',
      description: 'Graph theory, tree traversal, dynamic programming, and complexity analysis.',
      iconName: 'Network',
      color: '#3b82f6',
    },
    {
      id: 'sub_os',
      name: 'Operating Systems',
      code: 'OS301',
      description: 'Process scheduling, virtual memory, concurrency, and system calls.',
      iconName: 'Terminal',
      color: '#8b5cf6',
    },
  ];

  const topics: Topic[] = [
    {
      id: 'top_prob',
      subjectId: 'sub_ml',
      name: 'Probability Foundations',
      description: 'Sample spaces, axioms, conditioning, and independence.',
      orderIndex: 1,
    },
    {
      id: 'top_bayes',
      subjectId: 'sub_ml',
      name: 'Bayesian Inference & Classifiers',
      description: 'Prior and posterior likelihoods, Naive Bayes, and decision theory.',
      orderIndex: 2,
    },
    {
      id: 'top_regr',
      subjectId: 'sub_ml',
      name: 'Regression Analysis',
      description: 'Ordinary least squares, gradient descent, and regularization.',
      orderIndex: 3,
    },
    {
      id: 'top_class',
      subjectId: 'sub_ml',
      name: 'Classification & Evaluation',
      description: 'Logistic regression, precision, recall, and ROC curves.',
      orderIndex: 4,
    },
    {
      id: 'top_nn',
      subjectId: 'sub_ml',
      name: 'Neural Networks',
      description: 'Perceptrons, backpropagation, and activation functions.',
      orderIndex: 5,
    },
  ];

  const concepts: Concept[] = [
    {
      id: 'c_prob',
      topicId: 'top_prob',
      subjectId: 'sub_ml',
      name: 'Probability Fundamentals',
      description: 'Core rules of sample spaces, mutually exclusive events, and basic probability axioms.',
      difficulty: 'Beginner',
      estimatedMinutes: 15,
      summaryNotes: 'P(A union B) = P(A) + P(B) - P(A intersect B). Total probability over sample space S equals 1.',
    },
    {
      id: 'c_rand_vars',
      topicId: 'top_prob',
      subjectId: 'sub_ml',
      name: 'Random Variables',
      description: 'Discrete vs continuous random variables, probability mass functions, and expectation.',
      difficulty: 'Beginner',
      parentConceptId: 'c_prob',
      estimatedMinutes: 20,
      summaryNotes: 'A random variable assigns real numbers to outcomes. Expected value E[X] = sum(x * P(X=x)).',
    },
    {
      id: 'c_cond_prob',
      topicId: 'top_prob',
      subjectId: 'sub_ml',
      name: 'Conditional Probability',
      description: 'The probability of event A given event B has already occurred: P(A|B) = P(A ∩ B) / P(B).',
      difficulty: 'Intermediate',
      parentConceptId: 'c_prob',
      estimatedMinutes: 25,
      summaryNotes: 'Conditioning reduces the sample space to B. If events are independent, P(A|B) = P(A).',
    },
    {
      id: 'c_distr',
      topicId: 'top_prob',
      subjectId: 'sub_ml',
      name: 'Probability Distributions',
      description: 'Gaussian (Normal), Bernoulli, Binomial, and Poisson probability distributions.',
      difficulty: 'Intermediate',
      parentConceptId: 'c_rand_vars',
      estimatedMinutes: 30,
      summaryNotes: 'Gaussian is parameterized by mean mu and variance sigma^2. Central limit theorem applies.',
    },
    {
      id: 'c_bayes',
      topicId: 'top_bayes',
      subjectId: 'sub_ml',
      name: 'Bayes Theorem',
      description: 'Formulating posterior beliefs from likelihood and priors: P(A|B) = [P(B|A) * P(A)] / P(B).',
      difficulty: 'Intermediate',
      parentConceptId: 'c_cond_prob',
      estimatedMinutes: 20,
      summaryNotes: 'Posterior = (Likelihood * Prior) / Evidence. Crucial when inverting conditional statements.',
    },
    {
      id: 'c_naive_bayes',
      topicId: 'top_bayes',
      subjectId: 'sub_ml',
      name: 'Naive Bayes',
      description: 'Applying Bayes theorem with conditional independence assumption between every pair of features.',
      difficulty: 'Intermediate',
      parentConceptId: 'c_bayes',
      estimatedMinutes: 30,
      summaryNotes: 'Assumes features are conditionally independent given class y. P(x1, x2 | y) = P(x1|y) * P(x2|y).',
    },
    {
      id: 'c_classif',
      topicId: 'top_class',
      subjectId: 'sub_ml',
      name: 'Classification',
      description: 'Mapping inputs to discrete categories; decision boundaries and multi-class schemes.',
      difficulty: 'Intermediate',
      parentConceptId: 'c_naive_bayes',
      estimatedMinutes: 25,
      summaryNotes: 'Predicts categorical target labels using learned decision boundary.',
    },
    {
      id: 'c_eval',
      topicId: 'top_class',
      subjectId: 'sub_ml',
      name: 'Model Evaluation',
      description: 'Confusion matrix, precision, recall, F1-score, and ROC-AUC metrics.',
      difficulty: 'Intermediate',
      parentConceptId: 'c_classif',
      estimatedMinutes: 25,
      summaryNotes: 'Precision = TP / (TP + FP). Recall = TP / (TP + FN). F1 balances both harmonic mean.',
    },
    {
      id: 'c_hyp_test',
      topicId: 'top_prob',
      subjectId: 'sub_stat',
      name: 'Hypothesis Testing',
      description: 'Null hypothesis, alternative hypothesis, p-values, and significance level alpha.',
      difficulty: 'Intermediate',
      parentConceptId: 'c_distr',
      estimatedMinutes: 35,
      summaryNotes: 'Reject null hypothesis if p-value < alpha (e.g. 0.05). Type I and Type II errors.',
    },
    {
      id: 'c_lin_reg',
      topicId: 'top_regr',
      subjectId: 'sub_ml',
      name: 'Linear Regression',
      description: 'Modeling relationship between scalar response and one or more explanatory variables.',
      difficulty: 'Beginner',
      estimatedMinutes: 20,
      summaryNotes: 'y = beta_0 + beta_1 * x + epsilon. Cost function minimizes sum of squared residuals.',
    },
  ];

  const prerequisites: ConceptPrerequisite[] = [
    {
      id: 'prereq_1',
      conceptId: 'c_rand_vars',
      prerequisiteConceptId: 'c_prob',
      relationshipType: 'FOUNDATIONAL',
    },
    {
      id: 'prereq_2',
      conceptId: 'c_cond_prob',
      prerequisiteConceptId: 'c_prob',
      relationshipType: 'DIRECT',
    },
    {
      id: 'prereq_3',
      conceptId: 'c_distr',
      prerequisiteConceptId: 'c_rand_vars',
      relationshipType: 'FOUNDATIONAL',
    },
    {
      id: 'prereq_4',
      conceptId: 'c_bayes',
      prerequisiteConceptId: 'c_cond_prob',
      relationshipType: 'DIRECT',
    },
    {
      id: 'prereq_5',
      conceptId: 'c_naive_bayes',
      prerequisiteConceptId: 'c_bayes',
      relationshipType: 'DIRECT',
    },
    {
      id: 'prereq_6',
      conceptId: 'c_classif',
      prerequisiteConceptId: 'c_naive_bayes',
      relationshipType: 'DIRECT',
    },
    {
      id: 'prereq_7',
      conceptId: 'c_eval',
      prerequisiteConceptId: 'c_classif',
      relationshipType: 'DIRECT',
    },
    {
      id: 'prereq_8',
      conceptId: 'c_hyp_test',
      prerequisiteConceptId: 'c_distr',
      relationshipType: 'FOUNDATIONAL',
    },
  ];



      retentionHealth: 81,
      activeGapsCount: 7,
      conceptsMasteredCount: 18,
      totalStudyHours: 28,
      assessmentsCompletedCount: 8,
      avgAssessmentScore: 76,
      subjectMastery: {
        sub_ml: 64,
        sub_stat: 48,
        sub_py: 82,
        sub_ds: 71,
        sub_os: 54,
      },
      updatedAt: new Date().toISOString(),
    },
  ];

  const learningTwinConcepts: LearningTwinConcept[] = [
    {
      id: 'ltc_1',
      studentId: 'usr_student_1',
      conceptId: 'c_prob',
      masteryScore: 82,
      confidenceLevel: 85,
      attemptsCount: 6,
      lastAssessedAt: '2026-09-18T10:30:00.000Z',
      status: 'Mastered',
    },
    {
      id: 'ltc_2',
      studentId: 'usr_student_1',
      conceptId: 'c_cond_prob',
      masteryScore: 45,
      confidenceLevel: 40,
      attemptsCount: 7,
      lastAssessedAt: '2026-09-19T09:15:00.000Z',
      status: 'Gap',
    },
    {
      id: 'ltc_3',
      studentId: 'usr_student_1',
      conceptId: 'c_bayes',
      masteryScore: 38,
      confidenceLevel: 35,
      attemptsCount: 5,
      lastAssessedAt: '2026-09-19T11:00:00.000Z',
      status: 'Gap',
    },
    {
      id: 'ltc_4',
      studentId: 'usr_student_1',
      conceptId: 'c_rand_vars',
      masteryScore: 75,
      confidenceLevel: 78,
      attemptsCount: 4,
      lastAssessedAt: '2026-09-15T14:00:00.000Z',
      status: 'Learning',
    },
    {
      id: 'ltc_5',
      studentId: 'usr_student_1',
      conceptId: 'c_distr',
      masteryScore: 58,
      confidenceLevel: 60,
      attemptsCount: 3,
      lastAssessedAt: '2026-09-12T16:00:00.000Z',
      status: 'Learning',
    },
    {
      id: 'ltc_6',
      studentId: 'usr_student_1',
      conceptId: 'c_naive_bayes',
      masteryScore: 20,
      confidenceLevel: 25,
      attemptsCount: 0,
      status: 'Not Learned',
    },
    {
      id: 'ltc_7',
      studentId: 'usr_student_1',
      conceptId: 'c_classif',
      masteryScore: 15,
      confidenceLevel: 20,
      attemptsCount: 0,
      status: 'Not Learned',
    },
    {
      id: 'ltc_8',
      studentId: 'usr_student_1',
      conceptId: 'c_eval',
      masteryScore: 10,
      confidenceLevel: 15,
      attemptsCount: 0,
      status: 'Not Learned',
    },
    {
      id: 'ltc_9',
      studentId: 'usr_student_1',
      conceptId: 'c_hyp_test',
      masteryScore: 40,
      confidenceLevel: 38,
      attemptsCount: 4,
      lastAssessedAt: '2026-09-07T11:00:00.000Z',
      status: 'Gap',
    },
    {
      id: 'ltc_10',
      studentId: 'usr_student_1',
      conceptId: 'c_lin_reg',
      masteryScore: 88,
      confidenceLevel: 90,
      attemptsCount: 5,
      lastAssessedAt: '2026-09-16T12:00:00.000Z',
      status: 'Mastered',
    },
  ];

  const knowledgeGaps: KnowledgeGap[] = [
    {
      id: 'gap_1',
      studentId: 'usr_student_1',
      conceptId: 'c_bayes',
      conceptName: 'Bayes Theorem',
      severity: 'Critical',
      masteryScore: 38,
      reason: 'Repeated incorrect inverse probability calculations. Missed 3 out of 4 conditional likelihood questions.',
      missingPrerequisiteId: 'c_cond_prob',
      missingPrerequisiteName: 'Conditional Probability',
      underlyingGapConcept: 'Independent Events & Sample Space Reduction',
      status: 'UNRESOLVED',
      detectedAt: '2026-09-19T11:15:00.000Z',
    },
    {
      id: 'gap_2',
      studentId: 'usr_student_1',
      conceptId: 'c_cond_prob',
      conceptName: 'Conditional Probability',
      severity: 'Moderate',
      masteryScore: 45,
      reason: 'Frequent confusion between joint probability P(A ∩ B) and conditional probability P(A|B).',
      missingPrerequisiteId: 'c_prob',
      missingPrerequisiteName: 'Probability Fundamentals',
      underlyingGapConcept: 'Probability Axioms',
      status: 'UNRESOLVED',
      detectedAt: '2026-09-19T09:30:00.000Z',
    },
    {
      id: 'gap_3',
      studentId: 'usr_student_1',
      conceptId: 'c_hyp_test',
      conceptName: 'Hypothesis Testing',
      severity: 'Critical',
      masteryScore: 40,
      reason: 'Misinterpretation of p-value threshold leading to false rejection of Null Hypothesis.',
      missingPrerequisiteId: 'c_distr',
      missingPrerequisiteName: 'Probability Distributions',
      underlyingGapConcept: 'Z-score & T-score normal distributions',
      status: 'UNRESOLVED',
      detectedAt: '2026-09-07T11:30:00.000Z',
    },
  ];

  const questions: Question[] = [
    // --- MACHINE LEARNING & PROBABILITY ---
    {
      id: 'q_diag_1',
      conceptId: 'c_prob',
      difficulty: 'Easy',
      question: 'What is the probability of getting a head in a fair coin toss?',
      options: ['1/2', '1/3', '1/4', '1'],
      correctAnswer: '1/2',
      explanation: 'A fair coin has 2 equally likely outcomes (Head, Tail). The probability of Head is 1/2.',
    },
    {
      id: 'q_diag_2',
      conceptId: 'c_prob',
      difficulty: 'Easy',
      question: 'If two fair dice are rolled, what is the probability that the sum is 7?',
      options: ['1/6', '7/36', '1/12', '5/36'],
      correctAnswer: '1/6',
      explanation: 'There are 6 winning pairs: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) out of 36 total outcomes: 6/36 = 1/6.',
    },
    {
      id: 'q_diag_3',
      conceptId: 'c_cond_prob',
      difficulty: 'Medium',
      question: 'Given P(A) = 0.5, P(B) = 0.4, and P(A ∩ B) = 0.2. What is P(A | B)?',
      options: ['0.50', '0.40', '0.20', '0.70'],
      correctAnswer: '0.50',
      explanation: 'P(A | B) = P(A ∩ B) / P(B) = 0.2 / 0.4 = 0.50.',
    },
    {
      id: 'q_adapt_1',
      conceptId: 'c_bayes',
      difficulty: 'Medium',
      question: 'Given P(A) = 0.6, P(B|A) = 0.7, and P(B|Aᶜ) = 0.2. Find P(A | B).',
      options: ['0.84', '0.72', '0.61', '0.48'],
      correctAnswer: '0.84',
      explanation: 'By Bayes Theorem: P(B) = P(B|A)P(A) + P(B|Aᶜ)P(Aᶜ) = (0.7*0.6) + (0.2*0.4) = 0.42 + 0.08 = 0.50. P(A|B) = P(B|A)P(A)/P(B) = 0.42/0.50 = 0.84.',
    },
    {
      id: 'q_adapt_2',
      conceptId: 'c_bayes',
      difficulty: 'Hard',
      question: 'A test for a rare disease is 99% accurate (sensitivity = 99%, specificity = 99%). The disease prevalence is 0.1% (1 in 1000). A patient tests positive. What is the approximate probability they actually have the disease?',
      options: ['~9%', '~99%', '~50%', '~1%'],
      correctAnswer: '~9%',
      explanation: 'Base rate fallacy! Out of 100,000 people, 100 have it (99 test +), while 99,900 are healthy (999 test false +). P(Disease|Positive) = 99 / (99 + 999) ≈ 9%.',
    },
    {
      id: 'q_naive_1',
      conceptId: 'c_naive_bayes',
      difficulty: 'Medium',
      question: 'What is the foundational assumption that gives Naive Bayes its name?',
      options: [
        'Features are conditionally independent given the class label',
        'Features are normally distributed with zero mean',
        'Classes are mutually exclusive and collectively exhaustive',
        'The loss function is strictly convex',
      ],
      correctAnswer: 'Features are conditionally independent given the class label',
      explanation: 'Naive Bayes assumes that all feature predictors are conditionally independent given the target class label.',
    },
    {
      id: 'q_class_1',
      conceptId: 'c_classif',
      difficulty: 'Medium',
      question: 'Which metric is best when dealing with high class imbalance where false negatives are very costly (e.g. cancer detection)?',
      options: ['Recall (Sensitivity)', 'Accuracy', 'Specificity', 'Precision alone'],
      correctAnswer: 'Recall (Sensitivity)',
      explanation: 'Recall = TP / (TP + FN). When false negatives must be minimized at all costs, recall is paramount.',
    },
    {
      id: 'q_rand_var_1',
      conceptId: 'c_rand_vars',
      difficulty: 'Medium',
      question: 'If X is a discrete random variable with outcomes {1, 2, 3} and probabilities {0.2, 0.5, 0.3}, what is its expected value E[X]?',
      options: ['2.1', '2.0', '1.8', '2.5'],
      correctAnswer: '2.1',
      explanation: 'E[X] = (1 × 0.2) + (2 × 0.5) + (3 × 0.3) = 0.2 + 1.0 + 0.9 = 2.1.',
    },
    {
      id: 'q_rand_var_2',
      conceptId: 'c_rand_vars',
      difficulty: 'Easy',
      question: 'What mathematical function describes the probability distribution of a continuous random variable?',
      options: ['Probability Density Function (PDF)', 'Probability Mass Function (PMF)', 'Categorical Matrix', 'Discrete Step Function'],
      correctAnswer: 'Probability Density Function (PDF)',
      explanation: 'Continuous random variables are defined by a Probability Density Function (PDF), where probabilities correspond to integrals over intervals.',
    },

    // --- STATISTICS & HYPOTHESIS TESTING ---
    {
      id: 'q_stat_1',
      conceptId: 'c_hyp_test',
      difficulty: 'Medium',
      question: 'In hypothesis testing, what does a p-value of 0.03 mean if your significance level α = 0.05?',
      options: [
        'Reject the null hypothesis because p ≤ α',
        'Fail to reject the null hypothesis because p > α',
        'The probability that H₀ is true is 3%',
        'The experiment failed due to insufficient data',
      ],
      correctAnswer: 'Reject the null hypothesis because p ≤ α',
      explanation: 'Since p (0.03) is less than α (0.05), the observed data is statistically significant evidence against the null hypothesis H₀.',
    },
    {
      id: 'q_stat_2',
      conceptId: 'c_distr',
      difficulty: 'Easy',
      question: 'According to the Central Limit Theorem, what happens to the sampling distribution of the sample mean as sample size n increases?',
      options: [
        'Approaches a Normal (Gaussian) distribution',
        'Becomes heavily skewed to the right',
        'Variance approaches infinity',
        'Converts to a Poisson distribution',
      ],
      correctAnswer: 'Approaches a Normal (Gaussian) distribution',
      explanation: 'The Central Limit Theorem proves that sample means approach a Normal distribution for large sample sizes (n ≥ 30).',
    },

    // --- PYTHON FOR AI ---
    {
      id: 'q_py_1',
      conceptId: 'c_lin_reg',
      difficulty: 'Easy',
      question: 'Which NumPy function computes element-wise matrix multiplication (dot product)?',
      options: ['np.dot()', 'np.sum()', 'np.concat()', 'np.cross()'],
      correctAnswer: 'np.dot()',
      explanation: 'np.dot(a, b) calculates matrix dot product required for linear algebra operations in ML models.',
    },
    {
      id: 'q_py_2',
      conceptId: 'c_lin_reg',
      difficulty: 'Medium',
      question: 'In Pandas, which method is used to filter rows based on boolean conditional logic?',
      options: ['df[df["column"] > threshold]', 'df.group_by()', 'df.transpose()', 'df.head()'],
      correctAnswer: 'df[df["column"] > threshold]',
      explanation: 'Boolean indexing in Pandas passes a conditional expression inside square brackets to select rows.',
    },

    // --- DATA STRUCTURES & ALGORITHMS ---
    {
      id: 'q_ds_1',
      conceptId: 'c_eval',
      difficulty: 'Medium',
      question: 'What is the average time complexity of searching an element in a balanced Binary Search Tree (BST)?',
      options: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'],
      correctAnswer: 'O(log n)',
      explanation: 'Balanced BSTs halve the search space at each comparison step, yielding logarithmic O(log n) time complexity.',
    },

    // --- OPERATING SYSTEMS ---
    {
      id: 'q_os_1',
      conceptId: 'c_eval',
      difficulty: 'Hard',
      question: 'Which of the following is NOT one of Coffman’s four necessary conditions for OS deadlock?',
      options: [
        'Preemption enabled',
        'Mutual exclusion',
        'Hold and wait',
        'Circular wait',
      ],
      correctAnswer: 'Preemption enabled',
      explanation: 'No preemption (preemption disabled) is required for deadlock. If preemption is enabled, deadlocks can be broken by forcibly taking resources.',
    },
  ];

  const assessments: Assessment[] = [
    {
      id: 'asmt_diag',
      title: 'Machine Learning Diagnostic Baseline',
      type: 'DIAGNOSTIC',
      subjectId: 'sub_ml',
      questionIds: ['q_diag_1', 'q_diag_2', 'q_diag_3', 'q_rand_var_1'],
      totalQuestions: 4,
    },
    {
      id: 'c_rand_vars',
      title: 'Random Variables Practice Quiz',
      type: 'ADAPTIVE',
      subjectId: 'sub_ml',
      conceptId: 'c_rand_vars',
      questionIds: ['q_rand_var_1', 'q_rand_var_2', 'q_diag_1'],
      totalQuestions: 3,
    },
    {
      id: 'c_prob',
      title: 'Probability Fundamentals Quiz',
      type: 'ADAPTIVE',
      subjectId: 'sub_ml',
      conceptId: 'c_prob',
      questionIds: ['q_diag_1', 'q_diag_2'],
      totalQuestions: 2,
    },
    {
      id: 'c_cond_prob',
      title: 'Conditional Probability Practice Quiz',
      type: 'ADAPTIVE',
      subjectId: 'sub_ml',
      conceptId: 'c_cond_prob',
      questionIds: ['q_diag_3', 'q_adapt_1'],
      totalQuestions: 2,
    },
    {
      id: 'c_distr',
      title: 'Probability Distributions Practice Quiz',
      type: 'ADAPTIVE',
      subjectId: 'sub_ml',
      conceptId: 'c_distr',
      questionIds: ['q_stat_2', 'q_rand_var_2'],
      totalQuestions: 2,
    },
    {
      id: 'asmt_bayes_adaptive',
      title: 'Adaptive Assessment: Bayesian Reasoning & Likelihood',
      type: 'ADAPTIVE',
      subjectId: 'sub_ml',
      conceptId: 'c_bayes',
      questionIds: ['q_adapt_1', 'q_adapt_2', 'q_naive_1', 'q_class_1', 'q_rand_var_2'],
      totalQuestions: 5,
    },
    {
      id: 'c_bayes',
      title: 'Bayes Theorem & Reasoning Quiz',
      type: 'ADAPTIVE',
      subjectId: 'sub_ml',
      conceptId: 'c_bayes',
      questionIds: ['q_adapt_1', 'q_adapt_2', 'q_naive_1'],
      totalQuestions: 3,
    },
    {
      id: 'c_naive_bayes',
      title: 'Naive Bayes Classifiers Quiz',
      type: 'ADAPTIVE',
      subjectId: 'sub_ml',
      conceptId: 'c_naive_bayes',
      questionIds: ['q_naive_1', 'q_adapt_1'],
      totalQuestions: 2,
    },
    {
      id: 'c_classif',
      title: 'Classification & Decision Boundaries Quiz',
      type: 'ADAPTIVE',
      subjectId: 'sub_ml',
      conceptId: 'c_classif',
      questionIds: ['q_class_1', 'q_naive_1'],
      totalQuestions: 2,
    },
    {
      id: 'c_eval',
      title: 'Model Evaluation & Metrics Quiz',
      type: 'ADAPTIVE',
      subjectId: 'sub_ml',
      conceptId: 'c_eval',
      questionIds: ['q_class_1', 'q_ds_1'],
      totalQuestions: 2,
    },
    {
      id: 'asmt_stat_prob',
      title: 'Applied Statistics & Hypothesis Testing Benchmark',
      type: 'ADAPTIVE',
      subjectId: 'sub_stat',
      conceptId: 'c_hyp_test',
      questionIds: ['q_stat_1', 'q_stat_2', 'q_diag_2', 'q_diag_3'],
      totalQuestions: 4,
    },
    {
      id: 'c_hyp_test',
      title: 'Hypothesis Testing & p-values Quiz',
      type: 'ADAPTIVE',
      subjectId: 'sub_stat',
      conceptId: 'c_hyp_test',
      questionIds: ['q_stat_1', 'q_stat_2'],
      totalQuestions: 2,
    },
    {
      id: 'asmt_python_ai',
      title: 'Python for AI & Data Pipelines Quiz',
      type: 'ADAPTIVE',
      subjectId: 'sub_py',
      questionIds: ['q_py_1', 'q_py_2', 'q_class_1'],
      totalQuestions: 3,
    },
    {
      id: 'c_lin_reg',
      title: 'Linear Regression & NumPy Quiz',
      type: 'ADAPTIVE',
      subjectId: 'sub_py',
      conceptId: 'c_lin_reg',
      questionIds: ['q_py_1', 'q_py_2'],
      totalQuestions: 2,
    },
    {
      id: 'asmt_ds_algo',
      title: 'Data Structures & Algorithmic Complexity Quiz',
      type: 'ADAPTIVE',
      subjectId: 'sub_ds',
      questionIds: ['q_ds_1', 'q_diag_2'],
      totalQuestions: 2,
    },
    {
      id: 'asmt_os_sys',
      title: 'Operating Systems & Concurrency Quiz',
      type: 'ADAPTIVE',
      subjectId: 'sub_os',
      questionIds: ['q_os_1', 'q_ds_1'],
      totalQuestions: 2,
    },
  ];

  const assessmentAttempts: AssessmentAttempt[] = [
    {
      id: 'att_1',
      studentId: 'usr_student_1',
      assessmentId: 'asmt_diag',
      score: 66,
      totalQuestions: 3,
      correctAnswersCount: 2,
      answers: {
        q_diag_1: '1/2',
        q_diag_2: '1/6',
        q_diag_3: '0.40', // answered wrong
      },
      startedAt: '2026-09-18T09:00:00.000Z',
      completedAt: '2026-09-18T09:12:00.000Z',
      status: 'COMPLETED',
    },
  ];

  const tutorConversations: TutorConversation[] = [
    {
      id: 'conv_bayes_siva',
      studentId: 'usr_student_1',
      conceptId: 'c_bayes',
      conceptName: 'Bayes Theorem',
      createdAt: '2026-09-19T11:20:00.000Z',
      updatedAt: '2026-09-19T11:25:00.000Z',
    },
  ];

  const tutorMessages: TutorMessage[] = [
    {
      id: 'msg_1',
      conversationId: 'conv_bayes_siva',
      sender: 'USER',
      content: "I don't understand Bayes theorem. Why do we divide by P(B)?",
      timestamp: '2026-09-19T11:20:00.000Z',
    },
    {
      id: 'msg_2',
      conversationId: 'conv_bayes_siva',
      sender: 'TUTOR',
      content: "No worries! Let's start with conditional probability, since that's the key prerequisite. Here's a simple explanation with an example:\n\nWhen we ask for P(A|B), we already know that event B HAS occurred. That means our entire universe has shrunk from the whole sample space down to just the area inside circle B.\n\nP(B) in the denominator normalizes our probability so that everything inside B sums up to 100%! Would you like me to give a medical test or coin example?",
      actionUsed: 'Explain',
      timestamp: '2026-09-19T11:20:04.000Z',
    },
  ];

  const retentionRecords: RetentionRecord[] = [
    {
      id: 'ret_1',
      studentId: 'usr_student_1',
      conceptId: 'c_hyp_test',
      conceptName: 'Hypothesis Testing',
      subjectName: 'Statistics & Probability',
      learnedAt: '2026-09-01T08:00:00.000Z',
      lastPracticedAt: '2026-09-07T08:00:00.000Z',
      practiceCount: 3,
      masteryScore: 40,
      reviewCount: 2,
      daysSincePractice: 12,
      status: 'Needs Revision',
      nextScheduledReview: '2026-09-19T12:00:00.000Z',
    },
    {
      id: 'ret_2',
      studentId: 'usr_student_1',
      conceptId: 'c_distr',
      conceptName: 'Probability Distributions',
      subjectName: 'Statistics & Probability',
      learnedAt: '2026-09-05T08:00:00.000Z',
      lastPracticedAt: '2026-09-12T08:00:00.000Z',
      practiceCount: 4,
      masteryScore: 58,
      reviewCount: 3,
      daysSincePractice: 7,
      status: 'Fading',
      nextScheduledReview: '2026-09-20T12:00:00.000Z',
    },
    {
      id: 'ret_3',
      studentId: 'usr_student_1',
      conceptId: 'c_bayes',
      conceptName: 'Bayes Theorem',
      subjectName: 'Machine Learning',
      learnedAt: '2026-09-10T08:00:00.000Z',
      lastPracticedAt: '2026-09-15T08:00:00.000Z',
      practiceCount: 5,
      masteryScore: 38,
      reviewCount: 4,
      daysSincePractice: 4,
      status: 'Healthy',
      nextScheduledReview: '2026-09-22T12:00:00.000Z',
    },
    {
      id: 'ret_4',
      studentId: 'usr_student_1',
      conceptId: 'c_lin_reg',
      conceptName: 'Linear Regression',
      subjectName: 'Machine Learning',
      learnedAt: '2026-09-12T08:00:00.000Z',
      lastPracticedAt: '2026-09-16T08:00:00.000Z',
      practiceCount: 7,
      masteryScore: 88,
      reviewCount: 5,
      daysSincePractice: 3,
      status: 'Healthy',
      nextScheduledReview: '2026-09-25T12:00:00.000Z',
    },
  ];

  const learningGoals: LearningGoal[] = [
    {
      id: 'goal_ml_ready',
      studentId: 'usr_student_1',
      title: 'Become ML-Ready',
      targetDate: '2026-10-31',
      overallProgress: 72,
      milestones: [
        { id: 'm1', skill: 'Python Fundamentals', progress: 100, status: 'Completed' },
        { id: 'm2', skill: 'Statistics for ML', progress: 100, status: 'Completed' },
        { id: 'm3', skill: 'Machine Learning', progress: 70, status: 'In Progress' },
        { id: 'm4', skill: 'Deep Learning', progress: 24, status: 'In Progress' },
        { id: 'm5', skill: 'Projects & Portfolio', progress: 10, status: 'In Progress' },
      ],
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif_1',
      studentId: 'usr_student_1',
      title: 'Revision Recommended',
      message: 'You are likely to forget Hypothesis Testing soon.',
      category: 'Reminders',
      timestamp: '10 min ago',
      read: false,
      actionUrl: '/retention',
    },
    {
      id: 'notif_2',
      studentId: 'usr_student_1',
      title: 'Goal Update',
      message: "You've reached 70% progress in Machine Learning!",
      category: 'Progress',
      timestamp: '2 hours ago',
      read: false,
      actionUrl: '/goals',
    },
    {
      id: 'notif_3',
      studentId: 'usr_student_1',
      title: 'New Learning Path',
      message: 'Your personalized path has been updated based on your gap analysis.',
      category: 'Learning',
      timestamp: '5 hours ago',
      read: true,
      actionUrl: '/learning-path',
    },
    {
      id: 'notif_4',
      studentId: 'usr_student_1',
      title: 'Assessment Completed',
      message: 'You scored 66% in the Diagnostic Quiz.',
      category: 'Learning',
      timestamp: '1 day ago',
      read: true,
      actionUrl: '/assessments',
    },
  ];

  const teacherStudents: TeacherStudentSummary[] = [
    {
      id: 'ts_siva',
      studentId: 'usr_student_1',
      name: 'Siva',
      email: 'siva@example.com',
      department: 'AI & DS - 3rd Year',
      overallMastery: 72,
      learningMomentum: 16,
      retentionHealth: 76,
      status: 'On Track',
      strengths: ['Python', 'Data Visualization', 'Problem Solving'],
      knowledgeGaps: ['Probability', 'Hypothesis Testing'],
      recommendedIntervention: 'Assign probability micro-course and monitor progress.',
      lastActive: '10 min ago',
    },
    {
      id: 'ts_arun',
      studentId: 'usr_student_2',
      name: 'Arun',
      email: 'arun@example.com',
      department: 'AI & DS - 3rd Year',
      overallMastery: 66,
      learningMomentum: 8,
      retentionHealth: 68,
      status: 'Need Support',
      strengths: ['Linear Regression', 'Data Cleaning'],
      knowledgeGaps: ['Bayes Theorem', 'Conditional Probability'],
      recommendedIntervention: 'Schedule peer mentoring with Priya on Bayesian logic.',
      lastActive: '2 hours ago',
    },
    {
      id: 'ts_priya',
      studentId: 'usr_student_3',
      name: 'Priya',
      email: 'priya@example.com',
      department: 'AI & DS - 3rd Year',
      overallMastery: 81,
      learningMomentum: 22,
      retentionHealth: 88,
      status: 'On Track',
      strengths: ['Calculus', 'Neural Networks', 'Python'],
      knowledgeGaps: ['Model Evaluation'],
      recommendedIntervention: 'Advance to Deep Learning specialization.',
      lastActive: '30 min ago',
    },
    {
      id: 'ts_karthik',
      studentId: 'usr_student_4',
      name: 'Karthik',
      email: 'karthik@example.com',
      department: 'AI & DS - 3rd Year',
      overallMastery: 54,
      learningMomentum: -4,
      retentionHealth: 51,
      status: 'At Risk',
      strengths: ['Basic Python'],
      knowledgeGaps: ['Probability', 'Linear Regression', 'Gradient Descent'],
      recommendedIntervention: 'Provide one-on-one intervention and foundational math review.',
      lastActive: '3 days ago',
    },
    {
      id: 'ts_divya',
      studentId: 'usr_student_5',
      name: 'Divya',
      email: 'divya@example.com',
      department: 'AI & DS - 3rd Year',
      overallMastery: 78,
      learningMomentum: 14,
      retentionHealth: 80,
      status: 'On Track',
      strengths: ['Statistics', 'Hypothesis Testing', 'Data Wrangling'],
      knowledgeGaps: ['Naive Bayes'],
      recommendedIntervention: 'Assign Naive Bayes practice problem set.',
      lastActive: '1 hour ago',
    },
  ];

  const interventions: Intervention[] = [
    {
      id: 'int_1',
      topicName: 'Probability',
      concept: 'Probability Foundations',
      groupName: 'Probability Prerequisites Cohort',
      severity: 'HIGH',
      affectedStudents: ['Siva', 'Priya', 'Karthik', 'Rahul', 'Ananya'],
      affectedCount: 12,
      issue: '12 students need urgent prerequisite support in Probability Foundations',
      reason: '12 students need urgent prerequisite support in Probability Foundations',
      suggestedAction: 'Deploy interactive coin toss & tree diagram simulation module to class.',
      status: 'Pending',
      createdAt: '2026-09-19T08:00:00.000Z',
    },
    {
      id: 'int_2',
      topicName: 'Regression',
      concept: 'Cost Functions & Gradients',
      groupName: 'Gradient Descent Geometry Cohort',
      severity: 'HIGH',
      affectedStudents: ['Vikram', 'Meera', 'Karthik', 'Divya'],
      affectedCount: 8,
      issue: '8 students struggling with ordinary least squares cost function gradients',
      reason: '8 students struggling with ordinary least squares cost function gradients',
      suggestedAction: 'Release supplementary visual walkthrough on gradient descent steps.',
      status: 'Pending',
      createdAt: '2026-09-18T14:00:00.000Z',
    },
    {
      id: 'int_3',
      topicName: 'Student Activity',
      concept: 'Consistent Study Habits',
      groupName: 'Engagement Retention Squad',
      severity: 'MEDIUM',
      affectedStudents: ['Arun', 'Sneha', 'Rohan'],
      affectedCount: 5,
      issue: '5 students recorded low activity (< 1 session) this week',
      reason: '5 students recorded low activity (< 1 session) this week',
      suggestedAction: 'Send automated AI study nudge and reminder email.',
      status: 'In Progress',
      createdAt: '2026-09-17T09:00:00.000Z',
    },
    {
      id: 'int_4',
      topicName: 'At-Risk Performance',
      concept: 'Bayes Theorem & Conditional Probability',
      groupName: 'At-Risk Mastery Support Group',
      severity: 'HIGH',
      affectedStudents: ['Karthik', 'Arun', 'Pooja'],
      affectedCount: 3,
      issue: '3 students (including Karthik) at acute risk of falling below 60% threshold',
      reason: '3 students (including Karthik) at acute risk of falling below 60% threshold',
      suggestedAction: 'Offer TA office hours session and diagnostic re-test.',
      status: 'Pending',
      createdAt: '2026-09-19T10:00:00.000Z',
    },
  ];

  const attemptEvidences: AttemptEvidence[] = [];
  const decisionRecords: DecisionRecord[] = [];
  const teacherOverrides: TeacherOverride[] = [];
  const learningTwins: LearningTwin[] = [];
  const learningTwinConcepts: LearningTwinConcept[] = [];
  const knowledgeGaps: KnowledgeGap[] = [];
  const learningGoals: LearningGoal[] = [];
  const notifications: NotificationItem[] = [];
  const teacherStudents: TeacherStudentSummary[] = [];
  const interventions: Intervention[] = [];

  return {
    _seedVersion: SEED_VERSION,
    users,
    studentProfiles,
    teacherProfiles,
    subjects,
    topics,
    concepts,
    prerequisites,
    learningTwins,
    learningTwinConcepts,
    knowledgeGaps,
    questions,
    assessments,
    assessmentAttempts,
    attemptEvidences,
    decisionRecords,
    teacherOverrides,
    tutorConversations,
    tutorMessages,
    retentionRecords,
    learningGoals,
    notifications,
    teacherStudents,
    interventions,
  };
}

class Store {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseState;
        if (parsed._seedVersion === SEED_VERSION) {
          return parsed;
        }
        // Stale file from an older build (e.g. missing the per-concept practice
        // quizzes) — reseed with the current built-in content.
      }
    } catch {
      // fallback to initial seed
    }
    const seed = getInitialSeed();
    this.save(seed);
    return seed;
  }

  public save(data?: DatabaseState) {
    try {
      const toSave = data || this.state;
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving state:', err);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public resetToSeed(): DatabaseState {
    this.state = getInitialSeed();
    this.save();
    return this.state;
  }

  public resetToCleanSlate(): DatabaseState {
    this.state = getInitialSeed();
    this.save();
    return this.state;
  }

  // Generic query helpers
  public getStudentTwin(studentId: string): LearningTwin | undefined {
    return this.state.learningTwins.find((t) => t.studentId === studentId);
  }

  public getTwinConcepts(studentId: string): LearningTwinConcept[] {
    return this.state.learningTwinConcepts.filter((c) => c.studentId === studentId);
  }

  public getKnowledgeGaps(studentId: string): KnowledgeGap[] {
    return this.state.knowledgeGaps.filter((g) => g.studentId === studentId && g.status !== 'RESOLVED');
  }

  public getAllKnowledgeGaps(studentId: string): KnowledgeGap[] {
    return this.state.knowledgeGaps.filter((g) => g.studentId === studentId);
  }

  public getRetentionRecords(studentId: string): RetentionRecord[] {
    return this.state.retentionRecords.filter((r) => r.studentId === studentId);
  }

  public getGoals(studentId: string): LearningGoal[] {
    return this.state.learningGoals.filter((g) => g.studentId === studentId);
  }

  public getNotifications(studentId: string): NotificationItem[] {
    return this.state.notifications.filter((n) => n.studentId === studentId);
  }

  public getStudentProfile(userId: string): StudentProfile | undefined {
    return this.state.studentProfiles.find((p) => p.userId === userId);
  }
}

export const db = new Store();