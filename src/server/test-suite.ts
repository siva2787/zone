import { runJudgeStressTests, runTwoLearnerSimulation } from './engines/simulation-engine.ts';

console.log('=== ZONE INTELLIGENCE SUITE TEST ===\n');

console.log('1. TWO-LEARNER DIVERGENT PATH SIMULATION:');
const sim = runTwoLearnerSimulation();
console.log(`Learner A (Aarav): ${sim.learnerA.decision.action} on ${sim.learnerA.decision.targetConceptName}`);
console.log(`Learner B (Siva):  ${sim.learnerB.decision.action} on ${sim.learnerB.decision.targetConceptName}`);
console.log(`Explanation: ${sim.comparisonExplanation}\n`);

console.log('2. 8 JUDGE STRESS TESTS:');
const tests = runJudgeStressTests();
let passed = 0;
tests.forEach((t) => {
  if (t.passed) {
    passed += 1;
    console.log(`✅ [PASS] ${t.name}`);
    console.log(`   Expected: ${t.expected}`);
    console.log(`   Actual:   ${t.actual}`);
  } else {
    console.log(`❌ [FAIL] ${t.name}`);
    console.log(`   Expected: ${t.expected}`);
    console.log(`   Actual:   ${t.actual}`);
  }
});

console.log(`\nResults: ${passed} / ${tests.length} tests passed.`);
if (passed === tests.length) {
  console.log('🎉 ALL 8 JUDGE STRESS TESTS PASSED PERFECTLY!');
}
