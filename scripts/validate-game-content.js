const path = require("node:path");
const fs = require("node:fs");

const root = path.resolve(__dirname, "..");
const GameChapterBuilder = require(path.join(root, "game", "chapterBuilder.js"));
const QuestionQuality = require(path.join(root, "game", "questionQuality.js"));
const { CHAPTER_IDS } = require(path.join(root, "game", "chapterConfig.js"));
const { RUNTIME_SOURCE_FILES } = require(path.join(root, "game", "runtimeSources.js"));

const contentFiles = RUNTIME_SOURCE_FILES;

function loadExpandedModules() {
  global.window = globalThis;
  contentFiles.forEach((file) => require(path.join(root, file)));
  return globalThis.MATH_LEARNING_DATA || [];
}

function loadReviewManifest(chapterId = "chapter-01", reviewPath = path.join(root, "content", "humanReview", `${chapterId}.json`)) {
  if (!fs.existsSync(reviewPath)) return null;
  const payload = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Human review manifest must be an object");
  }
  return payload;
}

function validateBuiltChapter(chapter, { requireHumanReview = false, reviewManifest = null } = {}) {
  const questions = chapter.levels.flatMap((level) => level.questions);
  const errors = questions.flatMap((question) => QuestionQuality
    .validateQuestionQuality(question)
    .map((error) => `${question.id}: ${error}`));
  const warnings = QuestionQuality.detectTemplateDuplicates(questions)
    .map(({ questionIds }) => `suspected numeric template duplicate: ${questionIds.join(", ")}`);

  if (requireHumanReview) {
    if (!reviewManifest) {
      errors.push(`missing human review manifest: content/humanReview/${chapter.chapterId}.json`);
    } else if (reviewManifest.status !== "approved") {
      errors.push(`human review manifest is not approved: ${reviewManifest.status || "unknown"}`);
    } else {
      errors.push(...QuestionQuality.validateHumanReviewRecords(reviewManifest.records, questions.map((question) => question.id)));
    }
  }
  return { valid: errors.length === 0, errors, warnings, questionCount: questions.length };
}

function runCli() {
  const modules = loadExpandedModules();
  const reports = CHAPTER_IDS.map((chapterId) => ({ chapterId, report: GameChapterBuilder.validateChapter(chapterId, modules) }));
  const invalid = reports.filter(({ report }) => !report.valid);
  if (invalid.length) {
    console.error(`FAIL game content validation found ${invalid.reduce((sum, entry) => sum + entry.report.errors.length, 0)} issue(s):`);
    invalid.flatMap(({ chapterId, report }) => report.errors.map((error) => `${chapterId}: ${error}`)).forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  const qualityReports = [];
  for (const chapterId of CHAPTER_IDS) {
    const chapter = GameChapterBuilder.buildChapter(chapterId, modules);
    let reviewManifest;
    try { reviewManifest = loadReviewManifest(chapterId); } catch (error) {
      console.error(`FAIL game content validation: ${error.message}`);
      process.exitCode = 1;
      return;
    }
    qualityReports.push({ chapterId, reviewManifest, report: validateBuiltChapter(chapter, { requireHumanReview: process.env.REQUIRE_HUMAN_REVIEW === "1", reviewManifest }) });
  }
  const failed = qualityReports.filter(({ report }) => !report.valid);
  if (failed.length) {
    console.error(`FAIL game quality validation found ${failed.reduce((sum, entry) => sum + entry.report.errors.length, 0)} issue(s):`);
    failed.flatMap(({ chapterId, report }) => report.errors.map((error) => `${chapterId}: ${error}`)).forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  qualityReports.forEach(({ chapterId, reviewManifest, report }) => {
    report.warnings.forEach((warning) => console.warn(`WARN game content: ${chapterId}: ${warning}`));
  });
  const count = qualityReports.reduce((sum, entry) => sum + entry.report.questionCount, 0);
  console.log(`OK game content: ${CHAPTER_IDS.length} chapters, ${count} questions; human review: ${qualityReports.map(({ chapterId, reviewManifest }) => `${chapterId}=${reviewManifest?.status || "not-started"}`).join(", ")}`);
}

if (require.main === module) {
  runCli();
}

module.exports = { contentFiles, loadExpandedModules, loadReviewManifest, validateBuiltChapter, runCli };
