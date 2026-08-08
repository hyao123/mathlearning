const assert = require("node:assert/strict");
const test = require("node:test");

const validation = require("../scripts/validate-game-content.js");
const reviewTemplate = require("../scripts/generate-human-review-template.js");

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
