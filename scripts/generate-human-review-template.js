const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const { loadExpandedModules } = require("./validate-game-content.js");
const { getManifestContentHash, getQuestionContentHash } = require("./humanReviewIntegrity.js");
const builder = require(path.join(root, "game", "chapterBuilder.js"));
const { CHAPTER_IDS, FIRST_CHAPTER_ID } = require(path.join(root, "game", "chapterConfig.js"));

const REVIEW_CRITERIA = ["objective", "nonTemplate", "contextNecessary", "progressionClear", "reviewExecutable", "pitfallReal"];

function buildReviewTemplate(existing = {}, chapterId = FIRST_CHAPTER_ID, options = {}) {
  if (options.approve === true) throw new Error("Bulk approval is disabled; complete human review records manually.");
  const chapter = builder.buildChapter(chapterId, loadExpandedModules());
  const previousRecords = new Map((existing.records || []).map((record) => [record.questionId, record]));
  const records = chapter.levels.flatMap((level) => level.questions.map((question) => {
    const previous = previousRecords.get(question.id) || {};
    const contentHash = getQuestionContentHash(question);
    const canReuse = previous.contentHash === contentHash;
    return {
      questionId: question.id,
      title: question.title,
      prompt: question.prompt,
      contentHash,
      reviewer: canReuse ? previous.reviewer || null : null,
      reviewedAt: canReuse ? previous.reviewedAt || null : null,
      scores: Object.fromEntries(REVIEW_CRITERIA.map((criterion) => [criterion, canReuse ? previous.scores?.[criterion] ?? null : null])),
      notes: canReuse ? previous.notes || "" : ""
    };
  }));
  const contentHash = getManifestContentHash(records);
  const approved = existing.status === "approved"
    && existing.contentHash === contentHash
    && records.every((record) => record.reviewer && record.reviewedAt && REVIEW_CRITERIA.every((criterion) => record.scores?.[criterion] === 1));
  return {
    schemaVersion: 2,
    chapterId,
    status: approved ? "approved" : "pending-human-review",
    reviewer: approved ? existing.reviewer || null : null,
    reviewedAt: approved ? existing.reviewedAt || null : null,
    contentHash,
    notes: approved ? existing.notes || "人工逐题审核通过。" : "请由课程负责人逐题完成六项人工审阅。",
    records
  };
}

function runCli() {
  if (process.argv.includes("--approve")) {
    throw new Error("Bulk approval is disabled; complete human review records manually.");
  }
  const chapterArgument = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
  const chapterIds = process.argv.includes("--all") ? CHAPTER_IDS : [chapterArgument || FIRST_CHAPTER_ID];
  chapterIds.forEach((chapterId) => {
    const reviewPath = path.join(root, "content", "humanReview", `${chapterId}.json`);
    const existing = fs.existsSync(reviewPath) ? JSON.parse(fs.readFileSync(reviewPath, "utf8")) : {};
    const manifest = buildReviewTemplate(existing, chapterId);
    fs.writeFileSync(reviewPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    console.log(`Wrote ${manifest.records.length} review records to ${path.relative(root, reviewPath)}`);
  });
}

if (require.main === module) runCli();

module.exports = { REVIEW_CRITERIA, buildReviewTemplate };
