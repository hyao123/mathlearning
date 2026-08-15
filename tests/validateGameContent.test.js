const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
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
    difficulty: "introductory",
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
    explanation: {
      summary: "Replace each rabbit with a chicken, then divide the extra legs by two.",
      cues: ["extra legs", "two per rabbit"]
    },
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

function approvedCurriculumManifest(batch = reviewTemplate.GOLD_V3_BATCH) {
  const manifest = reviewTemplate.buildCurriculumBatchReviewTemplate(batch);
  return {
    ...manifest,
    status: "approved",
    records: manifest.records.map((record) => ({
      ...record,
      reviewer: "Curriculum reviewer",
      reviewedAt: "2026-08-13T00:00:00.000Z",
      evidence: "Checked the mathematical model, answer, and learner-facing solution.",
      decisions: Object.fromEntries(reviewTemplate.V3_REVIEW_CRITERIA.map((criterion) => [criterion, true]))
    }))
  };
}

test("gold V3 review templates are deterministic pending manifests for every candidate question", () => {
  const before = reviewTemplate.GOLD_V3_BATCH.topics.map((topic) => topic.questions.map((question) => question.id));
  const batch = reviewTemplate.buildGoldV3Batch();
  const manifest = reviewTemplate.buildCurriculumBatchReviewTemplate(batch);

  assert.equal(batch.id, "gold-v3");
  assert.equal(batch.contentVersion, "2026.08.13-gold.1");
  assert.equal(batch.topics.length, 3);
  assert.equal(batch.topics.flatMap((topic) => topic.questions).length, 30);
  assert.deepEqual(reviewTemplate.GOLD_V3_BATCH.topics.map((topic) => topic.questions.map((question) => question.id)), before);
  assert.equal(manifest.schemaVersion, 3);
  assert.equal(manifest.status, "pending");
  assert.equal(manifest.records.length, 30);
  assert.equal(manifest.records.every((record) => /^[a-f0-9]{64}$/.test(record.contentHash)), true);
  assert.equal(manifest.records.every((record) => record.reviewer === null && record.reviewedAt === null && record.evidence === ""), true);
  assert.equal(manifest.records.every((record) => reviewTemplate.V3_REVIEW_CRITERIA.every((criterion) => record.decisions[criterion] === null)), true);
});

test("curriculum review validation requires evidence and true decisions before approval", () => {
  const manifest = approvedCurriculumManifest();
  const approved = validation.validateCurriculumBatch(reviewTemplate.GOLD_V3_BATCH, manifest);
  assert.equal(approved.publishable, true);
  manifest.records[0].evidence = "";
  const report = validation.validateCurriculumBatch(reviewTemplate.GOLD_V3_BATCH, manifest);

  assert.equal(report.questionCount, 30);
  assert.equal(report.publishable, false);
  assert.match(report.errors.join("\n"), /evidence is required/);
});

test("curriculum review validation catches V3 teaching-field hash mutations", () => {
  const manifest = approvedCurriculumManifest();
  const alteredBatch = structuredClone(reviewTemplate.GOLD_V3_BATCH);
  alteredBatch.topics[0].questions[0].solution.summary = "A different child-executable teaching summary.";
  const report = validation.validateCurriculumBatch(alteredBatch, manifest);

  assert.equal(report.publishable, false);
  assert.match(report.errors.join("\n"), /content hash mismatch/);
});

test("curriculum review validation rejects incomplete records and non-publishable statuses", () => {
  const manifest = approvedCurriculumManifest();
  manifest.records.pop();
  const incomplete = validation.validateCurriculumBatch(reviewTemplate.GOLD_V3_BATCH, manifest);
  assert.match(incomplete.errors.join("\n"), /exactly 30 records/);

  const duplicate = approvedCurriculumManifest();
  duplicate.records[1].questionId = duplicate.records[0].questionId;
  const duplicateReport = validation.validateCurriculumBatch(reviewTemplate.GOLD_V3_BATCH, duplicate);
  assert.match(duplicateReport.errors.join("\n"), /duplicate review record/);

  const pending = reviewTemplate.buildCurriculumBatchReviewTemplate(reviewTemplate.GOLD_V3_BATCH);
  const pendingReport = validation.validateCurriculumBatch(reviewTemplate.GOLD_V3_BATCH, pending);
  assert.equal(pendingReport.publishable, false);
  assert.match(pendingReport.errors.join("\n"), /pending.*publishable/i);

  const rejected = approvedCurriculumManifest();
  rejected.status = "rejected";
  const rejectedReport = validation.validateCurriculumBatch(reviewTemplate.GOLD_V3_BATCH, rejected);
  assert.equal(rejectedReport.publishable, false);
  assert.match(rejectedReport.errors.join("\n"), /rejected.*false decision/i);
});

test("curriculum candidate CLI accepts the reviewed gold batch while automated gates remain clean", () => {
  const result = childProcess.spawnSync(process.execPath, ["scripts/validate-curriculum-batch.js", "--batch", "gold-v3"], {
    cwd: require("node:path").resolve(__dirname, ".."),
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /active, 3 topics, 30 questions/i);
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /automated question errors: [1-9]/i);
});

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
    ["difficulty", "advanced"],
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
    ["explanation", { summary: "Changed explanation.", cues: [] }],
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
