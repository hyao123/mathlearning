const assert = require("node:assert/strict");
const test = require("node:test");

const validation = require("../scripts/validate-game-content.js");
const reviewTemplate = require("../scripts/generate-human-review-template.js");
const integrity = require("../scripts/humanReviewIntegrity.js");

function validV3Question(overrides = {}) {
  return {
    schemaVersion: 3,
    id: "v3-hash-1",
    topicId: "chicken-rabbit",
    level: 1,
    title: "Chicken and rabbit count",
    prompt: "Ten animals have 28 legs. How many rabbits are there?",
    answer: "4",
    answerType: "numeric",
    answerFormat: "integer",
    answerPolicy: { kind: "integer", min: 0 },
    primaryConcept: "assumption method",
    supportingConcepts: ["substitution"],
    structureFamily: "assume-and-adjust",
    conditionRoles: ["animal-total", "leg-total"],
    reasoningMoves: ["assume", "substitute", "verify"],
    representation: "table",
    representationShift: true,
    questionDirection: "find-parameter",
    strategyChoices: ["assume-all-chickens", "equation"],
    shortcutType: "none",
    transfer: "representation-shift",
    solution: {
      strategy: "assume-all-chickens",
      observation: "Assume every animal is a chicken.",
      summary: "(28 - 20) / 2 = 4",
      steps: [{ id: "difference", kind: "calculate", operation: "subtract", operands: [28, 20], result: 8, explanation: "There are eight extra legs." }]
    },
    verification: {
      strategy: "substitute-counts",
      summary: "Four rabbits and six chickens have 28 legs.",
      steps: [{ id: "total", kind: "verify", operation: "add", operands: [16, 12], result: 28, explanation: "The total matches." }]
    },
    commonPitfall: "Do not count each rabbit leg as an extra leg.",
    storyBeat: "Check the animal inventory.",
    readingProfile: { unfamiliarTerms: ["inventory"], sentenceCount: 2 },
    authorNotes: "Use after the introductory assumption lesson.",
    ...overrides
  };
}

function reverseObjectKeys(value) {
  if (Array.isArray(value)) return value.map(reverseObjectKeys);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).reverse().map((key) => [key, reverseObjectKeys(value[key])]));
}

test("built first chapter has 120 structured questions before human approval", () => {
  const modules = validation.loadExpandedModules();
  const builder = require("../game/chapterBuilder.js");
  const chapter = builder.buildChapter("chapter-01", modules);
  const report = validation.validateBuiltChapter(chapter);
  assert.equal(report.valid, true);
  assert.equal(report.questionCount, 120);
  assert.deepEqual(report.warnings, []);
});

test("built levels require at least four stable story variants", () => {
  const modules = validation.loadExpandedModules();
  const builder = require("../game/chapterBuilder.js");
  const chapter = builder.buildChapter("chapter-05", modules);
  const report = validation.validateBuiltChapter(chapter);
  assert.equal(report.storyCoverage.every((entry) => entry.uniqueBeats >= 4), true);
  assert.equal(report.errors.some((error) => /story variants/.test(error)), false);
});

test("release gate rejects a pending human-review manifest", () => {
  const modules = validation.loadExpandedModules();
  const builder = require("../game/chapterBuilder.js");
  const chapter = builder.buildChapter("chapter-01", modules);
  const approvedManifest = validation.loadReviewManifest();
  const pendingManifest = { ...approvedManifest, status: "pending-human-review" };
  const report = validation.validateBuiltChapter(chapter, { requireHumanReview: true, reviewManifest: pendingManifest });
  assert.equal(report.valid, false);
  assert.match(report.errors.join("\n"), /not approved/);
});

test("a fresh review template covers every built chapter question without marking it approved", () => {
  const modules = validation.loadExpandedModules();
  const builder = require("../game/chapterBuilder.js");
  const chapter = builder.buildChapter("chapter-01", modules);
  const manifest = reviewTemplate.buildReviewTemplate();
  assert.equal(manifest.status, "pending-human-review");
  assert.equal(manifest.records.length, 120);
  assert.equal(new Set(manifest.records.map((record) => record.questionId)).size, 120);
  assert.equal(manifest.records.every((record) => reviewTemplate.REVIEW_CRITERIA.every((criterion) => Object.hasOwn(record.scores, criterion))), true);
  assert.equal(chapter.levels.flatMap((level) => level.questions).every((question) => manifest.records.some((record) => record.questionId === question.id)), true);
});

test("human review templates cannot bulk approve and carry content fingerprints", () => {
  assert.throws(
    () => reviewTemplate.buildReviewTemplate({}, "chapter-01", { approve: true }),
    /Bulk approval is disabled/
  );
  const manifest = reviewTemplate.buildReviewTemplate({}, "chapter-01");
  assert.equal(manifest.schemaVersion, 2);
  assert.match(manifest.contentHash, /^[a-f0-9]{64}$/);
  assert.equal(manifest.records.every((record) => /^[a-f0-9]{64}$/.test(record.contentHash)), true);
});

test("release validation rejects a review record whose question content changed", () => {
  const modules = validation.loadExpandedModules();
  const builder = require("../game/chapterBuilder.js");
  const chapter = builder.buildChapter("chapter-01", modules);
  const template = reviewTemplate.buildReviewTemplate({}, "chapter-01");
  const approved = {
    ...template,
    status: "approved",
    reviewer: "课程负责人",
    reviewedAt: "2026-08-05T00:00:00+08:00",
    records: template.records.map((record) => ({
      ...record,
      reviewer: "课程负责人",
      reviewedAt: "2026-08-05T00:00:00+08:00",
      scores: Object.fromEntries(reviewTemplate.REVIEW_CRITERIA.map((criterion) => [criterion, 1]))
    }))
  };
  const tampered = {
    ...approved,
    records: approved.records.map((record, index) => index === 0 ? { ...record, prompt: `${record.prompt} 修改` } : record)
  };
  const report = validation.validateBuiltChapter(chapter, { requireHumanReview: true, reviewManifest: tampered });
  assert.equal(report.valid, false);
  assert.match(report.errors.join("\n"), /content hash/);
});

test("release validation is strict unless content-only mode is explicitly requested", () => {
  assert.equal(validation.shouldRequireHumanReview(["node", "validate-game-content.js"], {}), true);
  assert.equal(validation.shouldRequireHumanReview(["node", "validate-game-content.js", "--strict"], {}), true);
  assert.equal(validation.shouldRequireHumanReview(["node", "validate-game-content.js", "--content-only"], {}), false);
  assert.equal(validation.shouldRequireHumanReview(["node", "validate-game-content.js"], { REQUIRE_HUMAN_REVIEW: "0" }), true);
});

test("every chapter uses the same raw-to-material-to-component reward contract", () => {
  const { CHAPTER_IDS } = require("../game/chapterConfig.js");
  CHAPTER_IDS.forEach((chapterId) => {
    assert.deepEqual(validation.validateProjectChain(chapterId), [], chapterId);
  });
});

test("legacy reviewed question hashes retain their established payload", () => {
  const legacy = {
    id: "legacy-hash-1",
    title: "Legacy title",
    prompt: "Solve 2 + 2.",
    answer: "4",
    explanation: "Add the two values.",
    difficulty: 2,
    knowledgeGoal: "addition",
    typicalModel: "number line",
    commonPitfall: "Do not subtract.",
    transferType: "direct",
    verificationMethod: "Add again.",
    learningObjective: "Practice addition.",
    storyBeat: "A short legacy story."
  };

  assert.equal(integrity.getQuestionContentHash(legacy), "59bf3477220a2a7eac5e6f1bdf8bb89931faffdd55d47d5a69d7de5ec134739c");
});

test("V3 hashes cover each pedagogical field", () => {
  const base = validV3Question();
  const changes = [
    ["id", "v3-hash-2"],
    ["topicId", "shortest-path"],
    ["level", 2],
    ["title", "Changed title"],
    ["prompt", "Changed prompt"],
    ["answer", "5"],
    ["answerType", "structured"],
    ["answerFormat", "decimal"],
    ["answerPolicy", { kind: "integer", min: 1 }],
    ["primaryConcept", "equation model"],
    ["supportingConcepts", ["substitution", "comparison"]],
    ["structureFamily", "equation"],
    ["conditionRoles", ["animal-total"]],
    ["reasoningMoves", ["assume", "compare", "verify"]],
    ["representation", "equation"],
    ["representationShift", false],
    ["questionDirection", "reverse"],
    ["strategyChoices", ["equation"]],
    ["shortcutType", "guess"],
    ["transfer", "cross-concept"],
    ["solution", { ...base.solution, strategy: "changed-strategy" }],
    ["verification", { ...base.verification, summary: "Changed verification." }],
    ["commonPitfall", "Changed pitfall."],
    ["storyBeat", "Changed story beat."],
    ["readingProfile", { unfamiliarTerms: ["different"], sentenceCount: 2 }],
    ["authorNotes", "Changed teaching note."]
  ];

  const baseHash = integrity.getQuestionContentHash(base);
  for (const [field, value] of changes) {
    assert.notEqual(integrity.getQuestionContentHash({ ...base, [field]: value }), baseHash, field);
  }
});

test("V3 pedagogical hashes are recursive-key-order independent and ignore runtime review fields", () => {
  const base = validV3Question();
  const reordered = reverseObjectKeys(base);

  assert.equal(integrity.getQuestionContentHash(reordered), integrity.getQuestionContentHash(base));
  assert.equal(
    integrity.getQuestionContentHash({
      ...base,
      reviewMetadata: { reviewer: "Different reviewer", reviewedAt: "2099-01-01T00:00:00.000Z" },
      rewardPreview: { coins: 999 },
      contentVersion: "2099.01.01",
      batchStatus: "pending",
      slot: "different runtime slot",
      slotText: "Different slot text",
      difficultyProfile: { score: 999 },
      computedDifficulty: { score: 999 },
      isBoss: true,
      learningObjective: "Runtime-derived objective",
      solutionReview: { method: "Runtime review" }
    }),
    integrity.getQuestionContentHash(base)
  );
});
