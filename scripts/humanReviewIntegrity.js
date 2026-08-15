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

const V3_PEDAGOGICAL_CONTENT_FIELDS = Object.freeze([
  "schemaVersion",
  "id",
  "chapterId",
  "moduleId",
  "topicId",
  "level",
  "title",
  "prompt",
  "answer",
  "answerType",
  "answerFormat",
  "answerPolicy",
  "difficulty",
  "primaryConcept",
  "supportingConcepts",
  "structureFamily",
  "conditionRoles",
  "reasoningMoves",
  "representation",
  "representationShift",
  "questionDirection",
  "strategyChoices",
  "shortcutType",
  "transfer",
  "explanation",
  "solution",
  "verification",
  "commonPitfall",
  "storyBeat",
  "readingProfile",
  "authorNotes"
]);

function hash(value) {
  return crypto.createHash("sha256").update(String(value), "utf8").digest("hex");
}

function normalizeReviewedPrompt(value) {
  return String(value || "").replace(/【[^】]+任务】$/u, "");
}

function getLegacyReviewedQuestionPayload(question) {
  return Object.fromEntries(REVIEWED_CONTENT_FIELDS.map((field) => [
    field,
    field === "prompt" ? normalizeReviewedPrompt(question?.[field]) : question?.[field] ?? null
  ]));
}

function sortCanonical(value) {
  if (Array.isArray(value)) return value.map(sortCanonical);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortCanonical(value[key])]));
}

function getV3ReviewedQuestionPayload(question) {
  return sortCanonical(Object.fromEntries(V3_PEDAGOGICAL_CONTENT_FIELDS.map((field) => [
    field,
    question?.[field] ?? null
  ])));
}

function getQuestionContentHash(question) {
  const content = question?.schemaVersion === 3
    ? getV3ReviewedQuestionPayload(question)
    : getLegacyReviewedQuestionPayload(question);
  return hash(JSON.stringify(content));
}

function getManifestContentHash(records) {
  const entries = (Array.isArray(records) ? records : [])
    .map((record) => `${record?.questionId || ""}:${record?.contentHash || ""}`)
    .sort();
  return hash(entries.join("\n"));
}

module.exports = {
  REVIEWED_CONTENT_FIELDS,
  V3_PEDAGOGICAL_CONTENT_FIELDS,
  getLegacyReviewedQuestionPayload,
  getV3ReviewedQuestionPayload,
  getQuestionContentHash,
  getManifestContentHash,
  normalizeReviewedPrompt,
  sortCanonical
};
