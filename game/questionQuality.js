const AnswerMatcher = globalThis.AnswerMatcher || require("../answerMatcher.js");
const QuestionContract = require("./questionContract.js");

const REASONING_TYPES = Object.freeze(["直接计算", "规律归纳", "关系建模", "分类计数", "空间想象", "逻辑推理", "策略选择"]);
const REVIEW_SCORES = Object.freeze(["objective", "nonTemplate", "contextNecessary", "progressionClear", "reviewExecutable", "pitfallReal"]);
const REVIEW_STEP_KINDS = Object.freeze(["observe", "model", "calculate", "verify"]);

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateSolutionReviewConsistency(question) {
  const review = question?.solutionReview;
  if (!review || typeof review !== "object" || Array.isArray(review)) return ["missing solutionReview"];
  const errors = [];
  if (review.schemaVersion !== 2) errors.push("invalid solutionReview.schemaVersion");
  if (!hasText(review.method)) errors.push("missing solutionReview.method");
  if (!hasText(review.calculation)) errors.push("missing solutionReview.calculation");
  if (!hasText(review.verification)) errors.push("missing solutionReview.verification");
  if (!hasText(review.errorTrap)) errors.push("missing solutionReview.errorTrap");
  if (!Array.isArray(review.stepKinds)
    || review.stepKinds.length !== review.steps?.length
    || review.stepKinds.some((kind) => !REVIEW_STEP_KINDS.includes(kind))) {
    errors.push("invalid solutionReview.stepKinds");
  } else if (!review.stepKinds.includes("verify")) {
    errors.push("solutionReview.stepKinds must include verify");
  }
  if (review.verification !== question.verificationMethod) errors.push("solutionReview.verification does not match verificationMethod");
  if (review.method !== question.typicalModel) errors.push("solutionReview.method does not match typicalModel");
  if (review.errorTrap !== question.commonPitfall) errors.push("solutionReview.errorTrap does not match commonPitfall");
  if (review.answerFormat !== question.answerFormat) errors.push("solutionReview.answerFormat does not match answer");
  if (hasText(review.answer) && hasText(question.answer) && !AnswerMatcher.isAnswerCorrect(review.answer, question.answer, { acceptedAnswers: question.acceptedAnswers })) {
    errors.push("solutionReview.answer does not match answer");
  }
  return errors;
}

function validateQuestionQuality(question) {
  const errors = [];
  if (!question || typeof question !== "object") return ["question must be an object"];
  errors.push(...QuestionContract.validateQuestionContract(question));
  ["id", "title", "prompt", "answer", "explanation", "learningObjective", "knowledgeGoal", "typicalModel", "commonPitfall", "transferType", "verificationMethod", "reasoningType", "storyBeat"].forEach((field) => {
    if (!hasText(question[field])) errors.push(`missing ${field}`);
  });
  if (hasText(question.learningObjective) && /\u4ee5\u53ca|\u5e76\u4e14|\u548c.+\u548c/.test(question.learningObjective)) errors.push("learningObjective should contain one primary objective");
  if (!REASONING_TYPES.includes(question.reasoningType)) errors.push("invalid reasoningType");
  errors.push(...validateSemanticProfile(question));
  const profile = question.difficultyProfile;
  if (!profile || !Number.isInteger(profile.steps) || profile.steps < 1 || !Number.isInteger(profile.conditions) || profile.conditions < 1 || !hasText(profile.representation) || !hasText(profile.direction) || !hasText(profile.transfer)) {
    errors.push("invalid difficultyProfile");
  }
  const review = question.solutionReview;
  if (!review || typeof review !== "object") return [...errors, "missing solutionReview"];
  if (!hasText(review.observation)) errors.push("missing solutionReview.observation");
  if (!Array.isArray(review.steps) || review.steps.length === 0 || review.steps.some((step) => !hasText(step))) errors.push("invalid solutionReview.steps");
  const minimumReviewSteps = profile?.steps === 1 ? 3 : 4;
  if (Array.isArray(review.steps) && review.steps.length < minimumReviewSteps) errors.push("solutionReview.steps are too shallow");
  ["answer", "check", "pitfall"].forEach((field) => { if (!hasText(review[field])) errors.push(`missing solutionReview.${field}`); });
  errors.push(...validateSolutionReviewConsistency(question));
  return errors;
}

function validateSemanticProfile(question) {
  const profile = question?.semanticProfile;
  if (profile === undefined) return [];
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) return ["invalid semanticProfile"];
  const errors = [];
  if (!hasText(profile.templateFamily)) errors.push("missing semanticProfile.templateFamily");
  if (!Number.isInteger(profile.variantId) || profile.variantId < 0) errors.push("invalid semanticProfile.variantId");
  if (!hasText(profile.unit)) errors.push("missing semanticProfile.unit");
  if (typeof profile.integerAnswer !== "boolean") errors.push("invalid semanticProfile.integerAnswer");
  if (profile.integerAnswer === true && QuestionContract.getAnswerFormat(question.answer) !== "integer") {
    errors.push("semanticProfile.integerAnswer requires an integer answer");
  }
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

function validateTopicTemplateDiversity(questions, minimumFamilies = 4) {
  const rows = (questions || []).filter((question) => question?.semanticProfile);
  if (!rows.length) return [];
  const families = new Set(rows.map((question) => question.semanticProfile.templateFamily).filter(hasText));
  return families.size >= minimumFamilies
    ? []
    : [`semantic template diversity requires at least ${minimumFamilies} families; found ${families.size}`];
}

function validateHumanReviewRecords(records, questionIds) {
  const errors = [];
  const expected = new Set(questionIds || []);
  const byQuestion = new Map();
  if (!Array.isArray(records)) return ["human review records must be an array"];
  records.forEach((record) => {
    if (!record || typeof record !== "object" || !expected.has(record.questionId)) {
      errors.push(`unexpected review: ${record?.questionId || "unknown"}`);
      return;
    }
    if (byQuestion.has(record.questionId)) errors.push(`duplicate human review: ${record.questionId}`);
    byQuestion.set(record.questionId, record);
    if (!hasText(record.reviewer) || !hasText(record.reviewedAt)) errors.push(`incomplete human review metadata: ${record.questionId}`);
    REVIEW_SCORES.forEach((score) => { if (record.scores?.[score] !== 1) errors.push(`human review failed ${score}: ${record.questionId}`); });
  });
  expected.forEach((questionId) => { if (!byQuestion.has(questionId)) errors.push(`missing human review: ${questionId}`); });
  return errors;
}

module.exports = { REASONING_TYPES, REVIEW_SCORES, REVIEW_STEP_KINDS, validateQuestionQuality, validateSemanticProfile, validateSolutionReviewConsistency, detectTemplateDuplicates, validateTopicTemplateDiversity, validateHumanReviewRecords, normalizePrompt };
