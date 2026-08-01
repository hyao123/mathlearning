const AnswerMatcher = globalThis.AnswerMatcher || require("../answerMatcher.js");

const REASONING_TYPES = Object.freeze(["直接计算", "规律归纳", "关系建模", "分类计数", "空间想象", "逻辑推理", "策略选择"]);
const REVIEW_SCORES = Object.freeze(["objective", "nonTemplate", "contextNecessary", "progressionClear", "reviewExecutable", "pitfallReal"]);

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateQuestionQuality(question) {
  const errors = [];
  if (!question || typeof question !== "object") return ["question must be an object"];
  ["id", "title", "prompt", "answer", "learningObjective", "reasoningType", "storyBeat"].forEach((field) => {
    if (!hasText(question[field])) errors.push(`missing ${field}`);
  });
  if (hasText(question.learningObjective) && /以及|并且|和.+和/.test(question.learningObjective)) errors.push("learningObjective should contain one primary objective");
  if (!REASONING_TYPES.includes(question.reasoningType)) errors.push("invalid reasoningType");
  const profile = question.difficultyProfile;
  if (!profile || !Number.isInteger(profile.steps) || profile.steps < 1 || !Number.isInteger(profile.conditions) || profile.conditions < 1 || !hasText(profile.representation) || !hasText(profile.direction) || !hasText(profile.transfer)) {
    errors.push("invalid difficultyProfile");
  }
  const review = question.solutionReview;
  if (!review || typeof review !== "object") return [...errors, "missing solutionReview"];
  if (!hasText(review.observation)) errors.push("missing solutionReview.observation");
  if (!Array.isArray(review.steps) || review.steps.length === 0 || review.steps.some((step) => !hasText(step))) errors.push("invalid solutionReview.steps");
  ["answer", "check", "pitfall"].forEach((field) => { if (!hasText(review[field])) errors.push(`missing solutionReview.${field}`); });
  if (hasText(review.answer) && hasText(question.answer) && !AnswerMatcher.isAnswerCorrect(review.answer, question.answer, { acceptedAnswers: question.acceptedAnswers })) errors.push("solutionReview.answer does not match answer");
  return errors;
}

function normalizePrompt(prompt) {
  return String(prompt || "").replace(/\d+(?:\.\d+)?/g, "#").replace(/\s+/g, "").trim();
}

function detectTemplateDuplicates(questions) {
  const groups = new Map();
  (questions || []).forEach((question) => {
    const normalizedPrompt = normalizePrompt(question?.prompt);
    if (!normalizedPrompt || !question?.id) return;
    const ids = groups.get(normalizedPrompt) || [];
    ids.push(question.id);
    groups.set(normalizedPrompt, ids);
  });
  return [...groups.entries()]
    .filter(([, questionIds]) => questionIds.length > 1)
    .map(([normalizedPrompt, questionIds]) => ({ normalizedPrompt, questionIds }));
}

function validateHumanReviewRecords(records, questionIds) {
  const errors = [];
  const expected = new Set(questionIds || []);
  const byQuestion = new Map();
  if (!Array.isArray(records)) return ["human review records must be an array"];
  records.forEach((record) => {
    if (!record || typeof record !== "object" || !expected.has(record.questionId)) return;
    if (byQuestion.has(record.questionId)) errors.push(`duplicate human review: ${record.questionId}`);
    byQuestion.set(record.questionId, record);
    if (!hasText(record.reviewer) || !hasText(record.reviewedAt)) errors.push(`incomplete human review metadata: ${record.questionId}`);
    REVIEW_SCORES.forEach((score) => { if (record.scores?.[score] !== 1) errors.push(`human review failed ${score}: ${record.questionId}`); });
  });
  expected.forEach((questionId) => { if (!byQuestion.has(questionId)) errors.push(`missing human review: ${questionId}`); });
  return errors;
}

module.exports = { REASONING_TYPES, REVIEW_SCORES, validateQuestionQuality, detectTemplateDuplicates, validateHumanReviewRecords, normalizePrompt };
