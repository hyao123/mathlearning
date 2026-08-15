const { QUESTION_DIRECTIONS, REPRESENTATIONS } = require("./curriculumContract.js");
const { OPERATIONS } = require("./solutionEngine.js");

const TRANSFER_WEIGHTS = Object.freeze({
  direct: 0,
  "representation-shift": 1,
  "cross-concept": 2,
  "boss-integration": 4
});

const ABRUPT_JUMP = 5;
const MILD_DEPENDENCY_VARIATION = 1;
// Adjacent questions may vary by one structural score point without regressing.
const SCORE_TOLERANCE = 1;
const BINARY_OPERATIONS = new Set(["add", "subtract", "multiply", "divide", "ceilDivide", "remainder"]);

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function optionalArray(question, field) {
  const value = question[field];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : `${field} must be an array`;
}

function validateStringMembers(values, field, errors) {
  values.forEach((value, index) => {
    if (typeof value !== "string" || !value.trim()) {
      errors.push(`${field} member at index ${index} must be a non-empty string`);
    }
  });
}

function validateSteps(steps, errors) {
  const completedStepIds = new Set();

  steps.forEach((step, index) => {
    if (!isObject(step)) {
      errors.push(`step at index ${index} must be an object`);
      return;
    }
    if (!Object.hasOwn(OPERATIONS, step.operation)) {
      errors.push(`unsupported operation at step ${index}: ${String(step.operation)}`);
    }
    validateStepOperands(step, index, completedStepIds, errors);
    if (!Number.isFinite(step.result)) errors.push(`result at step ${index} must be a finite number`);

    if (typeof step.id === "string" && step.id.trim()) completedStepIds.add(step.id);
  });
}

function validateStepOperands(step, stepIndex, completedStepIds, errors) {
  if (!Array.isArray(step.operands)) {
    errors.push(`operands at step ${stepIndex} must be an array`);
    return;
  }
  if (!step.operands.length) errors.push(`operands at step ${stepIndex} must be a non-empty array`);
  if (BINARY_OPERATIONS.has(step.operation) && step.operands.length !== 2) {
    errors.push(`${step.operation} at step ${stepIndex} requires exactly two operands`);
  }

  step.operands.forEach((operand, operandIndex) => {
    if (Number.isFinite(operand)) return;

    const reference = typeof operand === "string" && /^\$(\S+)$/.exec(operand);
    if (reference) {
      if (!completedStepIds.has(reference[1])) {
        errors.push(`operand at step ${stepIndex} index ${operandIndex} has an invalid or forward reference: ${operand}`);
      }
      return;
    }

    errors.push(`operand at step ${stepIndex} index ${operandIndex} must be a finite number or a prior-step reference`);
  });
}

function validateQuestionStructure(question) {
  if (!isObject(question)) return ["question must be an object"];

  const errors = [];

  try {
    if (!isObject(question.solution)) {
      errors.push("solution must be an object");
    } else if (!Array.isArray(question.solution.steps) || !question.solution.steps.length) {
      errors.push("solution steps must be a non-empty array");
    } else {
      validateSteps(question.solution.steps, errors);
    }
    if (!Array.isArray(question.conditionRoles)) {
      errors.push("conditionRoles must be an array");
    } else {
      validateStringMembers(question.conditionRoles, "conditionRoles", errors);
    }
    if (!REPRESENTATIONS.includes(question.representation)) {
      errors.push(`invalid representation: ${String(question.representation)}`);
    }
    if (!QUESTION_DIRECTIONS.includes(question.questionDirection)) {
      errors.push(`invalid questionDirection: ${String(question.questionDirection)}`);
    }

    const supportingConcepts = optionalArray(question, "supportingConcepts");
    if (typeof supportingConcepts === "string") {
      errors.push(supportingConcepts);
    } else {
      validateStringMembers(supportingConcepts, "supportingConcepts", errors);
      if (new Set(supportingConcepts).size !== supportingConcepts.length) {
        errors.push("supportingConcepts must not contain duplicates");
      }
    }
    const strategyChoices = optionalArray(question, "strategyChoices");
    if (typeof strategyChoices === "string") errors.push(strategyChoices);
    if (question.representationShift !== undefined && typeof question.representationShift !== "boolean") {
      errors.push("representationShift must be a boolean");
    }
    if (question.transfer !== undefined && !Object.hasOwn(TRANSFER_WEIGHTS, question.transfer)) {
      errors.push(`invalid transfer: ${String(question.transfer)}`);
    }

    return errors;
  } catch {
    return ["question structure could not be read"];
  }
}

function extractStructure(question) {
  const errors = validateQuestionStructure(question);
  if (errors.length) return errors[0];

  const supportingConcepts = optionalArray(question, "supportingConcepts");
  const strategyChoices = optionalArray(question, "strategyChoices");
  return {
    steps: question.solution.steps.length,
    conditions: question.conditionRoles.length,
    representation: question.representation,
    direction: question.questionDirection,
    transfer: determineTransfer(question.representationShift === true, supportingConcepts, strategyChoices)
  };
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
  const errors = validateQuestionStructure(question);
  if (errors.length) return { errors };

  const structure = extractStructure(question);

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
    if (difficulty.errors) {
      errors.push(...difficulty.errors.map((error) => `question at index ${index}: ${error}`));
      return;
    }
    const dependencies = dependencyComplexity(question);
    if (typeof dependencies === "string") {
      errors.push(`question at index ${index}: ${dependencies}`);
      return;
    }

    if (previous) {
      const transferGain = Math.max(
        0,
        TRANSFER_WEIGHTS[difficulty.transfer] - TRANSFER_WEIGHTS[previous.difficulty.transfer]
      );
      const permittedScoreDrop = SCORE_TOLERANCE + transferGain;
      if (previous.difficulty.score - difficulty.score > permittedScoreDrop) {
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
