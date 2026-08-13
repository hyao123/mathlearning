function getModule(globalName, request) {
  if (globalThis[globalName]) return globalThis[globalName];
  if (typeof require === "function") return require(request);
  return null;
}

const CurriculumContract = getModule("CurriculumContract", "./curriculumContract.js");
const AnswerPolicy = getModule("AnswerPolicy", "./answerPolicy.js");
const QuestionContract = getModule("QuestionContract", "../questionContract.js");
const SolutionEngine = getModule("SolutionEngine", "./solutionEngine.js");
const DifficultyEngine = getModule("DifficultyEngine", "./difficultyEngine.js");

const STEP_KINDS = new Set(["observe", "model", "calculate", "verify"]);

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function unique(errors) {
  return [...new Set(errors)];
}

function validateQuestionV3(question, topic) {
  if (!isObject(question)) return ["question must be an object"];

  try {
    const errors = [];
    if (question.schemaVersion !== 3) errors.push("schemaVersion must be 3");
    if (!hasText(question.id)) errors.push("missing id");
    if (!hasText(question.topicId)) errors.push("missing topicId");
    if (!Number.isInteger(question.level) || question.level < 1) errors.push("invalid level");
    if (!hasText(question.prompt)) errors.push("missing prompt");
    if (!hasText(question.answer)) errors.push("missing answer");
    if (!hasText(question.answerFormat)) errors.push("missing answerFormat");

    validateTopic(question, topic, errors);
    validateAnswer(question, errors);
    validateSolutionFields(question, errors);
    validateReviewMetadata(question.reviewMetadata, errors);
    validateLearnerVisibleFields(question, errors);

    if (Object.hasOwn(question, "difficultyProfile")) errors.push("difficultyProfile must not be authored");
    if (Object.hasOwn(question, "computedDifficulty")) errors.push("computedDifficulty must not be authored");

    composeContractChecks(question, errors);
    return unique(errors);
  } catch {
    return ["question could not be read"];
  }
}

function validateTopic(question, topic, errors) {
  if (!isObject(topic)) {
    errors.push("topic must be an object");
    return;
  }

  const topicErrors = CurriculumContract?.validateTopicDefinition?.(topic) || ["topic contract is unavailable"];
  errors.push(...topicErrors.map((error) => `topic: ${error}`));
  if (hasText(question.topicId) && question.topicId !== topic.id) errors.push("topicId does not match topic.id");

  if (!Array.isArray(question.reasoningMoves) || !question.reasoningMoves.length) {
    errors.push("missing reasoningMoves");
    return;
  }
  if (question.reasoningMoves.some((move) => !CurriculumContract?.REASONING_MOVES?.includes(move))) {
    errors.push("invalid reasoningMoves");
  }
  const missingActions = (topic.requiredActions || []).filter((move) => !question.reasoningMoves.includes(move));
  if (missingActions.length) errors.push(`missing required actions: ${missingActions.join(", ")}`);
  if (typeof question.shortcutType === "string" && topic.excludedShortcuts?.includes(question.shortcutType)) {
    errors.push(`excluded shortcut: ${question.shortcutType}`);
  }
}

function validateAnswer(question, errors) {
  if (!isObject(question.answerPolicy)) {
    errors.push("missing answerPolicy");
    return;
  }
  if (question.answerFormat !== question.answerPolicy.kind) {
    errors.push("answerFormat must equal answerPolicy.kind");
  }
}

function validateSolutionFields(question, errors) {
  for (const field of ["solution", "verification"]) {
    const path = question[field];
    if (!isObject(path)) {
      errors.push(`missing ${field}`);
      continue;
    }
    if (!hasText(path.strategy)) errors.push(`missing ${field}.strategy`);
    if (!Array.isArray(path.steps) || !path.steps.length) {
      errors.push(`missing ${field}.steps`);
      continue;
    }
    path.steps.forEach((step, index) => {
      if (!isObject(step)) {
        errors.push(`invalid ${field}.steps[${index}]`);
        return;
      }
      if (!STEP_KINDS.has(step.kind)) errors.push(`invalid ${field}.steps[${index}].kind`);
      if (!hasText(step.explanation)) errors.push(`missing ${field}.steps[${index}].explanation`);
    });
  }
}

function validateReviewMetadata(metadata, errors) {
  if (!isObject(metadata)) {
    errors.push("missing reviewMetadata");
    return;
  }
  for (const field of ["reviewer", "reviewedAt", "evidence"]) {
    if (!hasText(metadata[field])) errors.push(`missing reviewMetadata.${field}`);
  }
}

function validateLearnerVisibleFields(question, errors) {
  if (question.learnerVisible === undefined) return;
  if (!isObject(question.learnerVisible)) {
    errors.push("learnerVisible must be an object");
    return;
  }
  const secretFields = ["answer", "answerPolicy", "solution", "verification", "reviewMetadata", "solutionReview"];
  if (secretFields.some((field) => Object.hasOwn(question.learnerVisible, field))) {
    errors.push("learnerVisible must not contain resolution secrets");
  }
}

function composeContractChecks(question, errors) {
  const questionErrors = QuestionContract?.validateQuestionContract?.(question) || ["question contract is unavailable"];
  const policyErrors = AnswerPolicy?.validateAnswerPolicy?.(question.answer, question.answerPolicy) || ["answer policy is unavailable"];
  const solutionErrors = SolutionEngine?.validateSolution?.(question) || ["solution engine is unavailable"];
  const difficulty = DifficultyEngine?.evaluateDifficulty?.(question);

  errors.push(...questionErrors);
  errors.push(...policyErrors);
  errors.push(...solutionErrors.map((error) => `solution: ${error}`));
  if (!difficulty || typeof difficulty !== "object") {
    errors.push("difficulty evaluation failed");
  } else if (Array.isArray(difficulty.errors)) {
    errors.push(...difficulty.errors.map((error) => `difficulty: ${error}`));
  }
}

const api = { validateQuestionV3 };

if (typeof module !== "undefined" && module.exports) module.exports = api;
globalThis.QuestionQualityV3 = api;
