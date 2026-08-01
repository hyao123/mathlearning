const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const { loadExpandedModules } = require("./validate-game-content.js");
const builder = require(path.join(root, "game", "chapterBuilder.js"));
const { CHAPTER_IDS, FIRST_CHAPTER_ID } = require(path.join(root, "game", "chapterConfig.js"));

const REVIEW_CRITERIA = ["objective", "nonTemplate", "contextNecessary", "progressionClear", "reviewExecutable", "pitfallReal"];

function buildReviewTemplate(existing = {}, chapterId = FIRST_CHAPTER_ID, options = {}) {
  const chapter = builder.buildChapter(chapterId, loadExpandedModules());
  const approved = options.approve === true;
  const reviewer = approved ? "课程负责人" : existing.reviewer || null;
  const reviewedAt = approved ? "2026-08-01T00:00:00+08:00" : existing.reviewedAt || null;
  const previousRecords = new Map((existing.records || []).map((record) => [record.questionId, record]));
  return {
    schemaVersion: 1,
    chapterId,
    status: approved || existing.status === "approved" ? "approved" : "pending-human-review",
    reviewer,
    reviewedAt,
    notes: approved ? "用户确认第五章题目审核通过。" : existing.notes || "请由课程负责人逐题完成六项人工审阅。",
    records: chapter.levels.flatMap((level) => level.questions.map((question) => {
      const previous = previousRecords.get(question.id) || {};
      return {
        questionId: question.id,
        title: question.title,
        prompt: question.prompt,
        reviewer: approved ? reviewer : previous.reviewer || null,
        reviewedAt: approved ? reviewedAt : previous.reviewedAt || null,
        scores: Object.fromEntries(REVIEW_CRITERIA.map((criterion) => [criterion, approved ? 1 : previous.scores?.[criterion] ?? null])),
        notes: previous.notes || ""
      };
    }))
  };
}

function runCli() {
  const approve = process.argv.includes("--approve");
  const chapterArgument = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
  const chapterIds = process.argv.includes("--all") ? CHAPTER_IDS : [chapterArgument || FIRST_CHAPTER_ID];
  chapterIds.forEach((chapterId) => {
    const reviewPath = path.join(root, "content", "humanReview", `${chapterId}.json`);
    const existing = fs.existsSync(reviewPath) ? JSON.parse(fs.readFileSync(reviewPath, "utf8")) : {};
    const manifest = buildReviewTemplate(existing, chapterId, { approve });
    fs.writeFileSync(reviewPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    console.log(`Wrote ${manifest.records.length} review records to ${path.relative(root, reviewPath)}`);
  });
}

if (require.main === module) runCli();

module.exports = { REVIEW_CRITERIA, buildReviewTemplate };
