const crypto = require("node:crypto");

const REVIEWED_CONTENT_FIELDS = Object.freeze([
  "id",
  "title",
  "prompt",
  "answer",
  "explanation",
  "difficulty",
  "knowledgeGoal",
  "typicalModel",
  "commonPitfall",
  "transferType",
  "verificationMethod",
  "learningObjective",
  "storyBeat"
]);

function hash(value) {
  return crypto.createHash("sha256").update(String(value), "utf8").digest("hex");
}

function normalizeReviewedPrompt(value) {
  return String(value || "").replace(/【[^】]+任务】$/u, "");
}

function getQuestionContentHash(question) {
  const content = Object.fromEntries(REVIEWED_CONTENT_FIELDS.map((field) => [
    field,
    field === "prompt" ? normalizeReviewedPrompt(question?.[field]) : question?.[field] ?? null
  ]));
  return hash(JSON.stringify(content));
}

function getManifestContentHash(records) {
  const entries = (Array.isArray(records) ? records : [])
    .map((record) => `${record?.questionId || ""}:${record?.contentHash || ""}`)
    .sort();
  return hash(entries.join("\n"));
}

module.exports = { REVIEWED_CONTENT_FIELDS, getQuestionContentHash, getManifestContentHash, normalizeReviewedPrompt };
