const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const { loadExpandedModules, V3_REVIEW_CRITERIA } = require("./validate-game-content.js");
const { getManifestContentHash, getQuestionContentHash } = require("./humanReviewIntegrity.js");
const builder = require(path.join(root, "game", "chapterBuilder.js"));
const { CHAPTER_IDS, FIRST_CHAPTER_ID } = require(path.join(root, "game", "chapterConfig.js"));
const chickenRabbitQuestions = require(path.join(root, "game", "curriculum", "gold", "chickenRabbit.js"));
const shortestPathQuestions = require(path.join(root, "game", "curriculum", "gold", "shortestPath.js"));
const integratedModelingQuestions = require(path.join(root, "game", "curriculum", "gold", "integratedModeling.js"));

const REVIEW_CRITERIA = ["objective", "nonTemplate", "contextNecessary", "progressionClear", "reviewExecutable", "pitfallReal"];
const GOLD_V3_BATCH_ID = "gold-v3";
const GOLD_V3_CONTENT_VERSION = "2026.08.13-gold.1";

function deepFreeze(value, seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  Object.values(value).forEach((child) => deepFreeze(child, seen));
  return Object.freeze(value);
}

const GOLD_V3_BATCH = deepFreeze({
  id: GOLD_V3_BATCH_ID,
  schemaVersion: 3,
  status: "candidate",
  contentVersion: GOLD_V3_CONTENT_VERSION,
  topics: [
    { chapterId: "chapter-01", moduleId: "chicken-rabbit", questions: chickenRabbitQuestions },
    { chapterId: "chapter-08", moduleId: "shortest-path", questions: shortestPathQuestions },
    { chapterId: "chapter-09", moduleId: "integrated-modeling", questions: integratedModelingQuestions }
  ]
});

function buildGoldV3Batch() {
  return structuredClone(GOLD_V3_BATCH);
}

function buildCurriculumBatchReviewTemplate(batch) {
  const questions = Array.isArray(batch?.topics)
    ? batch.topics.flatMap((topic) => Array.isArray(topic?.questions) ? topic.questions : [])
    : [];
  const records = questions.map((question) => ({
    questionId: question.id,
    contentHash: getQuestionContentHash(question),
    reviewer: null,
    reviewedAt: null,
    evidence: "",
    decisions: Object.fromEntries(V3_REVIEW_CRITERIA.map((criterion) => [criterion, null]))
  }));
  return {
    schemaVersion: 3,
    batchId: batch?.id || null,
    contentVersion: batch?.contentVersion || null,
    status: "pending",
    contentHash: getManifestContentHash(records),
    records
  };
}

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
  const batchIndex = process.argv.indexOf("--batch");
  if (batchIndex !== -1) {
    const batchId = process.argv[batchIndex + 1];
    if (batchId !== GOLD_V3_BATCH_ID) throw new Error(`Unknown curriculum batch: ${batchId || "missing"}`);
    const reviewPath = path.join(root, "content", "humanReview", "candidates", `${batchId}.json`);
    const manifest = buildCurriculumBatchReviewTemplate(buildGoldV3Batch());
    fs.mkdirSync(path.dirname(reviewPath), { recursive: true });
    fs.writeFileSync(reviewPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    console.log(`Wrote ${manifest.records.length} pending review records to ${path.relative(root, reviewPath)}`);
    return;
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

module.exports = {
  REVIEW_CRITERIA,
  V3_REVIEW_CRITERIA,
  GOLD_V3_BATCH,
  buildGoldV3Batch,
  buildReviewTemplate,
  buildCurriculumBatchReviewTemplate
};
