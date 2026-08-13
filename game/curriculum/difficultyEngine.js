const TRANSFER_WEIGHTS = Object.freeze({
  direct: 0,
  "representation-shift": 1,
  "cross-concept": 2,
  "boss-integration": 4
});

const ABRUPT_JUMP = 5;
const MILD_DEPENDENCY_VARIATION = 1;

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function optionalArray(question, field) {
  const value = question[field];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : `${field} must be an array`;
}

function extractStructure(question) {
  if (!isObject(question)) return "question must be an object";

  try {
    if (!isObject(question.solution)) return "solution must be an object";
    if (!Array.isArray(question.solution.steps) || !question.solution.steps.length) {
      return "solution steps must be a non-empty array";
    }
    if (!Array.isArray(question.conditionRoles)) return "conditionRoles must be an array";
    if (typeof question.representation !== "string" || !question.representation.trim()) {
      return "representation must be a non-empty string";
    }
    if (typeof question.questionDirection !== "string" || !question.questionDirection.trim()) {
      return "questionDirection must be a non-empty string";
    }

    const supportingConcepts = optionalArray(question, "supportingConcepts");
    if (typeof supportingConcepts === "string") return supportingConcepts;
    const strategyChoices = optionalArray(question, "strategyChoices");
    if (typeof strategyChoices === "string") return strategyChoices;
    if (question.representationShift !== undefined && typeof question.representationShift !== "boolean") {
      return "representationShift must be a boolean";
    }

    return {
      steps: question.solution.steps.length,
      conditions: question.conditionRoles.length,
      representation: question.representation,
      direction: question.questionDirection,
      transfer: determineTransfer(question.representationShift === true, supportingConcepts, strategyChoices)
    };
  } catch {
    return "question structure could not be read";
  }
}

function determineTransfer(representationShift, supportingConcepts, strategyChoices) {
  if (supportingConcepts.length >= 2 || (supportingConcepts.length >= 1 && strategyChoices.length >= 2)) {
    return "boss-integration";
  }
  if (supportingConcepts.length >= 1) return "cross-concept";
  if (representationShift) return "representation-shift";
  return "direct";
}

function evaluateDifficulty(question) {
  const structure = extractStructure(question);
  if (typeof structure === "string") return structure;

  const reverseDirection = structure.direction === "reverse" || structure.direction === "find-parameter";
  return {
    score: structure.steps + structure.conditions + TRANSFER_WEIGHTS[structure.transfer] + (reverseDirection ? 1 : 0),
    ...structure
  };
}

function dependencyComplexity(question) {
  try {
    const supportingConcepts = optionalArray(question, "supportingConcepts");
    if (typeof supportingConcepts === "string") return supportingConcepts;
    const dependentSteps = question.solution.steps.filter((step) => (
      isObject(step) && Array.isArray(step.operands) && step.operands.some((operand) => (
        typeof operand === "string" && operand.startsWith("$")
      ))
    )).length;
    return new Set(supportingConcepts).size + dependentSteps;
  } catch {
    return "prerequisite/dependency complexity could not be read";
  }
}

function validateTopicProgression(questions) {
  if (!Array.isArray(questions)) return ["questions must be an array"];

  const errors = [];
  let previous = null;

  questions.forEach((question, index) => {
    const difficulty = evaluateDifficulty(question);
    const dependencies = dependencyComplexity(question);
    if (typeof difficulty === "string") {
      errors.push(`question at index ${index}: ${difficulty}`);
      return;
    }
    if (typeof dependencies === "string") {
      errors.push(`question at index ${index}: ${dependencies}`);
      return;
    }

    if (previous) {
      const transferStrengthened = TRANSFER_WEIGHTS[difficulty.transfer] > TRANSFER_WEIGHTS[previous.difficulty.transfer];
      if (difficulty.score < previous.difficulty.score && !transferStrengthened) {
        errors.push(`score regression at index ${index}`);
      }
      if (difficulty.score - previous.difficulty.score > ABRUPT_JUMP) {
        errors.push(`abrupt difficulty jump at index ${index}`);
      }
      if (dependencies < previous.dependencies - MILD_DEPENDENCY_VARIATION) {
        errors.push(`prerequisite/dependency complexity regression at index ${index}`);
      }
    }

    previous = { difficulty, dependencies };
  });

  return errors;
}

module.exports = { extractStructure, evaluateDifficulty, validateTopicProgression };
