const assert = require("node:assert/strict");
const test = require("node:test");

global.window = globalThis;
require("../data.js");
require("../contentExpansion.js");
require("../knowledgeContinuityExpansion.js");
require("../priorityContentExpansion.js");
require("../supplementalContentExpansion.js");
require("../supplementalContentFixes.js");
require("../knowledgeTopology.js");
require("../supplementalTopologyExpansion.js");
require("../mathEssence.js");
require("../conceptAnimations.js");
require("../priorityConceptAnimations.js");
require("../supplementalConceptAnimations.js");
require("../mistakeDiagnosis.js");
require("../supplementalMistakeTags.js");
require("../learningSupport.js");
require("../learningEffectEnhancements.js");

const modules = globalThis.MATH_LEARNING_DATA;

test("reassigns broad comprehensive content to specific learning strands", () => {
  const comprehensiveCount = modules.filter((module) => module.knowledgeTopology?.strand === "综合拓展").length;
  assert.ok(comprehensiveCount <= 5);
  assert.equal(modules.find((module) => module.id === "ratio-proportion").knowledgeTopology.strand, "数量关系建模");
  assert.equal(modules.find((module) => module.id === "gcd-lcm").knowledgeTopology.strand, "数论与整除");
});

test("adds learning plans and tiered practice metadata", () => {
  const module = modules.find((item) => item.id === "ratio-proportion");
  const practice = module.practices[0];

  assert.ok(module.learningPlan.goals.length >= 3);
  assert.ok(module.learningPlan.masteryCriteria.length >= 3);
  assert.ok(practice.tieredHints.length >= 3);
  assert.ok(practice.methodChoices.length >= 2);
  assert.equal(practice.modelType, "数量关系建模");
});

test("replaces generic hints and creates review sets", () => {
  const genericCount = modules.reduce(
    (sum, module) => sum + module.practices.filter((practice) => (practice.hints || []).join("|") === globalThis.LearningEffectEnhancements.genericHintKey).length,
    0
  );

  assert.ok(genericCount <= 100);
  assert.ok(globalThis.LEARNING_EFFECT_REVIEW_SETS.length >= 6);
});

test("provides remediation mappings for common mistake tags", () => {
  assert.ok(globalThis.LearningEffectEnhancements.remediationCatalog["arithmetic-care"]);
  assert.ok(globalThis.LearningEffectEnhancements.remediationCatalog["missing-cases"]);
});

test("maps parity divisibility content to the number theory strand", () => {
  const module = modules.find((item) => item.id === "parity-divisibility");
  const reviewSet = globalThis.LEARNING_EFFECT_REVIEW_SETS.find((item) => item.strand === "数论与整除");

  assert.equal(module.knowledgeTopology.strand, "数论与整除");
  assert.ok(reviewSet.moduleIds.includes("parity-divisibility"));
});

test("only engineering efficiency content receives work-unit remediation", () => {
  const engineering = modules.find((item) => item.id === "engineering");
  const unitRate = modules.find((item) => item.id === "unit-rate");
  const motion = modules.find((item) => item.id === "motion");
  const trainBridge = modules.find((item) => item.id === "train-bridge");

  assert.ok(engineering.practices.some((practice) => practice.remediationTags.includes("work-unit")));
  assert.ok(unitRate.practices.every((practice) => !practice.remediationTags.includes("work-unit")));
  assert.ok(motion.practices.every((practice) => !practice.remediationTags.includes("work-unit")));
  assert.ok(trainBridge.practices.every((practice) => !practice.remediationTags.includes("work-unit")));
});

test("adds practice-level recommended and accepted methods", () => {
  const unitRatePractice = modules.find((item) => item.id === "unit-rate").practices[0];
  const engineeringPractice = modules.find((item) => item.id === "engineering").practices[0];

  assert.equal(unitRatePractice.recommendedMethod, "单位量");
  assert.ok(unitRatePractice.acceptedMethods.includes("单位量"));
  assert.equal(engineeringPractice.recommendedMethod, "效率和");
  assert.ok(engineeringPractice.acceptedMethods.includes("效率和"));
});
