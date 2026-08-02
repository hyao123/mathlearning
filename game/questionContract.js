const ANSWER_FORMATS = Object.freeze(["integer", "decimal", "fraction", "percent"]);

const INTEGER_PATTERN = /^[+-]?\d+$/;
const DECIMAL_PATTERN = /^[+-]?(?:\d+\.\d+|\.\d+)$/;
const FRACTION_PATTERN = /^([+-]?\d+)\/(\d+)$/;
const PERCENT_PATTERN = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)%$/;

function normalizeAnswer(value) {
  return String(value ?? "").trim().replace(/\s+/g, "");
}

function getAnswerFormat(value) {
  const answer = normalizeAnswer(value);
  if (INTEGER_PATTERN.test(answer)) return "integer";
  if (DECIMAL_PATTERN.test(answer)) return "decimal";
  const fraction = answer.match(FRACTION_PATTERN);
  if (fraction && Number(fraction[2]) !== 0) return "fraction";
  if (PERCENT_PATTERN.test(answer)) return "percent";
  return null;
}

function isNumericAnswer(value) {
  return getAnswerFormat(value) !== null;
}

function validateQuestionContract(question) {
  const errors = [];
  if (!question || typeof question !== "object" || Array.isArray(question)) {
    return ["question must be an object"];
  }
  if (question.answerType !== "numeric") errors.push("answerType must be numeric");
  if (!isNumericAnswer(question.answer)) {
    errors.push("numeric answer must be a number, decimal, fraction, or percentage");
  }
  if (question.answerFormat !== undefined && !ANSWER_FORMATS.includes(question.answerFormat)) {
    errors.push("answerFormat must be integer, decimal, fraction, or percent");
  }
  if (question.answerFormat && isNumericAnswer(question.answer) && question.answerFormat !== getAnswerFormat(question.answer)) {
    errors.push("answerFormat does not match answer");
  }
  return errors;
}

module.exports = { ANSWER_FORMATS, normalizeAnswer, getAnswerFormat, isNumericAnswer, validateQuestionContract };
