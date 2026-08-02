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

test("every chapter uses the same raw-to-material-to-component reward contract", () => {
  const { CHAPTER_IDS } = require("../game/chapterConfig.js");
  CHAPTER_IDS.forEach((chapterId) => {
    assert.deepEqual(validation.validateProjectChain(chapterId), [], chapterId);
  });
});
