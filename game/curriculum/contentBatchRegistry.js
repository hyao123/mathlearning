const CurriculumMap = require("./curriculumMap.js");
const CompatibilityMap = require("./compatibilityMap.js");
const QuestionQualityV3 = require("./questionQualityV3.js");
const { validateTopicProgression } = require("./difficultyEngine.js");

const BATCH_STATUSES = Object.freeze(["candidate", "approved", "active", "rejected"]);
const activeContentByTopic = new Map();

function clone(value) {
  return structuredClone(value);
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getTopicKey(chapterId, moduleId) {
  return `${chapterId}:${moduleId}`;
}

function compareContentVersions(left, right) {
  const leftParts = String(left).match(/\d+|\D+/g) || [];
  const rightParts = String(right).match(/\d+|\D+/g) || [];
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index += 1) {
    const leftPart = leftParts[index] || "";
    const rightPart = rightParts[index] || "";
    if (leftPart === rightPart) continue;
    if (/^\d+$/.test(leftPart) && /^\d+$/.test(rightPart)) {
      const leftNumber = Number(leftPart);
      const rightNumber = Number(rightPart);
      if (leftNumber !== rightNumber) return leftNumber > rightNumber ? 1 : -1;
      continue;
    }
    return leftPart > rightPart ? 1 : -1;
  }
  return 0;
}

function validateContentBatch(batch) {
  if (!isObject(batch)) return ["batch must be an object"];
  const errors = [];
  if (batch.schemaVersion !== 3) errors.push("batch schemaVersion must be 3");
  if (typeof batch.id !== "string" || !batch.id.trim()) errors.push("batch id must be a non-empty string");
  if (!BATCH_STATUSES.includes(batch.status)) errors.push("batch status is invalid");
  if (typeof batch.contentVersion !== "string" || !batch.contentVersion.trim()) errors.push("contentVersion must be a non-empty string");
  if (!Array.isArray(batch.topics) || !batch.topics.length) return [...errors, "batch topics must be a non-empty array"];

  const topicKeys = new Set();
  batch.topics.forEach((topicBatch, index) => {
    const label = `topics[${index}]`;
    if (!isObject(topicBatch)) {
      errors.push(`${label} must be an object`);
      return;
    }
    const key = getTopicKey(topicBatch.chapterId, topicBatch.moduleId);
    if (topicKeys.has(key)) errors.push(`${label} duplicates ${key}`);
    topicKeys.add(key);
    const entry = CompatibilityMap.getCompatibilityEntry(topicBatch.chapterId, topicBatch.moduleId);
    if (!entry) {
      errors.push(`${label}: no compatible slot for ${key}`);
      return;
    }
    const topic = CurriculumMap.getCurriculumTopic(entry.topicId);
    if (!topic) {
      errors.push(`${label}: registered curriculum topic ${entry.topicId} is unavailable`);
      return;
    }
    errors.push(...CompatibilityMap.validateCompatibilityMap(topicBatch).map((error) => `${label}: ${error}`));
    if (!Array.isArray(topicBatch.questions)) return;
    const questionIds = new Set();
    topicBatch.questions.forEach((question, questionIndex) => {
      const questionLabel = `${label}.questions[${questionIndex}]`;
      if (isObject(question) && typeof question.id === "string") {
        if (questionIds.has(question.id)) errors.push(`${questionLabel}: duplicate question id ${question.id}`);
        questionIds.add(question.id);
      }
      errors.push(...QuestionQualityV3.validateQuestionV3(question, topic).map((error) => `${questionLabel}: ${error}`));
    });
    errors.push(...validateTopicProgression(topicBatch.questions).map((error) => `${label}: progression: ${error}`));
  });
  return errors;
}

function hasApprovedReview(batch) {
  return batch.status === "approved"
    && isObject(batch.reviewManifest)
    && batch.reviewManifest.schemaVersion === 3
    && batch.reviewManifest.status === "approved";
}

function registerContentBatch(batch) {
  const errors = validateContentBatch(batch);
  if (errors.length || !hasApprovedReview(batch)) return false;
  const replacements = batch.topics.map((topicBatch) => ({
    key: getTopicKey(topicBatch.chapterId, topicBatch.moduleId),
    questions: clone(topicBatch.questions),
    contentVersion: batch.contentVersion
  }));
  if (replacements.some(({ key, contentVersion }) => {
    const current = activeContentByTopic.get(key);
    return current && compareContentVersions(current.contentVersion, contentVersion) >= 0;
  })) return false;
  replacements.forEach(({ key, questions, contentVersion }) => activeContentByTopic.set(key, { questions, contentVersion }));
  return true;
}

function getActiveTopicQuestions(chapterId, moduleId) {
  const active = activeContentByTopic.get(getTopicKey(chapterId, moduleId));
  return active ? clone(active) : null;
}

module.exports = { BATCH_STATUSES, registerContentBatch, getActiveTopicQuestions, validateContentBatch };
