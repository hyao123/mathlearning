const AnswerPolicy = require("./answerPolicy.js");

const TOLERANCE = 1e-9;
const BINARY_OPERATIONS = new Set(["add", "subtract", "multiply", "divide", "ceilDivide", "remainder"]);

const OPERATIONS = Object.freeze({
  add: ([left, right]) => left + right,
  subtract: ([left, right]) => left - right,
  multiply: ([left, right]) => left * right,
  divide: ([left, right]) => divide(left, right),
  sum: (values) => values.reduce((total, value) => total + value, 0),
  min: (values) => Math.min(...values),
  max: (values) => Math.max(...values),
  ceilDivide: ([left, right]) => Math.ceil(divide(left, right)),
  remainder: ([left, right]) => remainder(left, right)
});

function divide(left, right) {
  if (right === 0) throw new Error("division by zero");
  return left / right;
}

function remainder(left, right) {
  if (right === 0) throw new Error("division by zero");
  return left % right;
}

function nearlyEqual(left, right) {
  return Math.abs(left - right) <= TOLERANCE;
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function evaluateSteps(steps) {
  if (!Array.isArray(steps)) throw new Error("steps must be an array");
  if (!steps.length) throw new Error("steps must not be empty");

  const values = new Map();
  for (const step of steps) {
    if (!isObject(step)) throw new Error("step must be an object");
    if (typeof step.id !== "string" || !step.id.trim()) throw new Error("step id must be a non-empty string");
    if (values.has(step.id)) throw new Error(`duplicate step id: ${step.id}`);
    if (!Object.hasOwn(OPERATIONS, step.operation)) throw new Error(`unsupported operation: ${String(step.operation)}`);
    if (!Array.isArray(step.operands) || !step.operands.length) throw new Error(`malformed operands for step: ${step.id}`);
    if (BINARY_OPERATIONS.has(step.operation) && step.operands.length !== 2) {
      throw new Error(`${step.operation} requires exactly two operands`);
    }
    if (!Number.isFinite(step.result)) throw new Error(`declared result for step ${step.id} must be a finite number`);

    const operands = step.operands.map((operand) => resolveOperand(operand, values));
    const actual = OPERATIONS[step.operation](operands);
    if (!Number.isFinite(actual)) throw new Error(`computed result for step ${step.id} must be a finite number`);
    if (!nearlyEqual(actual, step.result)) {
      throw new Error(`declared result ${step.result} does not equal ${actual} for step ${step.id}`);
    }
    values.set(step.id, actual);
  }

  return { values, finalValue: values.get(steps.at(-1).id) };
}

function resolveOperand(operand, values) {
  if (Number.isFinite(operand)) return operand;
  if (typeof operand === "string" && /^\$\S+$/.test(operand)) {
    const id = operand.slice(1);
    if (values.has(id)) return values.get(id);
    throw new Error(`invalid or forward reference: ${operand}`);
  }
  throw new Error(`malformed operand: ${String(operand)}`);
}

function validateSolution(question) {
  if (!isObject(question)) return ["question must be an object"];

  const errors = [];
  const solutionResult = evaluatePath(question.solution, "solution", errors);
  const verificationResult = evaluatePath(question.verification, "verification", errors);

  if (isObject(question.solution) && isObject(question.verification)
    && typeof question.solution.strategy === "string" && question.solution.strategy.trim()
    && typeof question.verification.strategy === "string" && question.verification.strategy.trim()
    && question.solution.strategy === question.verification.strategy) {
    errors.push("verification strategy must differ from solution strategy");
  }

  if (!isObject(question.answerPolicy)) {
    errors.push("answerPolicy must be an object");
  } else {
    if (solutionResult && !AnswerPolicy.matchesAnswerPolicy(String(solutionResult.finalValue), question.answer, question.answerPolicy)) {
      errors.push("solution final result does not match answer policy");
    }
    if (verificationResult && !AnswerPolicy.matchesAnswerPolicy(String(verificationResult.finalValue), question.answer, question.answerPolicy)) {
      errors.push("verification final result does not match answer policy");
    }
  }

  return errors;
}

function evaluatePath(path, label, errors) {
  if (!isObject(path)) {
    errors.push(`${label} must be an object`);
    return null;
  }
  if (typeof path.strategy !== "string" || !path.strategy.trim()) errors.push(`${label} strategy must be a non-empty string`);
  if (!Array.isArray(path.steps) || !path.steps.length) {
    errors.push(`${label} steps must not be empty`);
    return null;
  }
  try {
    return evaluateSteps(path.steps);
  } catch (error) {
    errors.push(`${label}: ${error.message}`);
    return null;
  }
}

module.exports = { OPERATIONS, TOLERANCE, evaluateSteps, validateSolution };
