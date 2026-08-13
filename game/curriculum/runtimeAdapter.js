function getModule(globalName, request) {
  if (globalThis[globalName]) return globalThis[globalName];
  if (typeof require === "function") return require(request);
  return null;
}

const DifficultyEngine = getModule("DifficultyEngine", "./difficultyEngine.js");

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function adaptQuestionV3(question, topic) {
  try {
    if (!isObject(question) || !isObject(topic)) return null;
    if (!Number.isInteger(question.level) || question.level < 1) return null;
    if (typeof question.id !== "string" || !question.id.trim() || question.topicId !== topic.id) return null;
    if (typeof question.prompt !== "string" || !question.prompt.trim()) return null;
    if (!isObject(question.answerPolicy) || typeof question.answer !== "string") return null;
    if (!isObject(question.solution) || !Array.isArray(question.solution.steps)) return null;

    const difficulty = DifficultyEngine?.evaluateDifficulty?.(question);
    if (!isObject(difficulty) || Array.isArray(difficulty.errors)) return null;

    const solutionReview = createSolutionReview(question);
    if (!solutionReview) return null;

    const runtime = {
      schemaVersion: 3,
      id: question.id,
      topicId: question.topicId,
      level: question.level,
      slot: question.level,
      title: typeof question.title === "string" && question.title.trim() ? question.title : topic.title,
      prompt: question.prompt,
      difficulty: difficulty.score,
      difficultyProfile: difficulty,
      isBoss: question.level === 10,
      learningObjective: topic.title,
      storyBeat: typeof question.storyBeat === "string" ? question.storyBeat : ""
    };

    defineInternalResolution(runtime, question, solutionReview);
    return runtime;
  } catch {
    return null;
  }
}

function createSolutionReview(question) {
  try {
    const steps = question.solution.steps;
    if (!steps.length || steps.some((step) => !isObject(step) || typeof step.kind !== "string" || typeof step.explanation !== "string")) {
      return null;
    }
    if (!isObject(question.verification) || typeof question.verification.summary !== "string") return null;
    return {
      schemaVersion: 3,
      method: question.solution.strategy,
      observation: typeof question.solution.observation === "string" ? question.solution.observation : "",
      steps: steps.map((step) => step.explanation),
      stepKinds: steps.map((step) => step.kind),
      calculation: typeof question.solution.summary === "string" ? question.solution.summary : "",
      answer: question.answer,
      answerFormat: question.answerPolicy.kind,
      verification: question.verification.summary,
      check: question.verification.summary,
      errorTrap: typeof question.commonPitfall === "string" ? question.commonPitfall : "",
      pitfall: typeof question.commonPitfall === "string" ? question.commonPitfall : ""
    };
  } catch {
    return null;
  }
}

function defineInternalResolution(runtime, question, solutionReview) {
  Object.defineProperties(runtime, {
    answer: { value: question.answer, enumerable: false },
    answerType: { value: "numeric", enumerable: false },
    answerFormat: { value: question.answerPolicy.kind, enumerable: false },
    answerPolicy: { value: question.answerPolicy, enumerable: false },
    solution: { value: question.solution, enumerable: false },
    verification: { value: question.verification, enumerable: false },
    reviewMetadata: { value: question.reviewMetadata, enumerable: false },
    solutionReview: { value: solutionReview, enumerable: false }
  });
}

const api = { adaptQuestionV3 };

if (typeof module !== "undefined" && module.exports) module.exports = api;
globalThis.RuntimeAdapter = api;
