const POLICY_KINDS = Object.freeze([
  "integer",
  "decimal",
  "fraction",
  "percent",
  "quotient-remainder",
  "multi-number"
]);

function getMatcher() {
  return globalThis.AnswerMatcher || require("../../answerMatcher.js");
}

function normalize(value) {
  return getMatcher().normalizeText(value);
}

function gcd(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b) [a, b] = [b, a % b];
  return a;
}

function nearlyEqual(left, right) {
  return Math.abs(left - right) < 1e-9;
}

function parseInteger(value) {
  const normalized = normalize(value);
  return /^[+-]?\d+$/.test(normalized) ? Number(normalized) : null;
}

function parseDecimal(value) {
  const normalized = normalize(value);
  const match = normalized.match(/^[+-]?(?:\d+\.(\d+)|\.(\d+))$/);
  if (!match) return null;
  return { value: Number(normalized), precision: (match[1] || match[2]).length };
}

function parseFraction(value) {
  const match = normalize(value).match(/^([+-]?\d+)\/(\d+)$/);
  if (!match || Number(match[2]) === 0) return null;
  return { numerator: Number(match[1]), denominator: Number(match[2]) };
}

function parsePercent(value) {
  const normalized = normalize(value);
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)%$/.test(normalized)) return null;
  return Number(normalized.slice(0, -1));
}

function parseQuotientRemainder(value) {
  const match = normalize(value).match(/^([+-]?\d+)(?:余|\.\.\.)([+-]?\d+)$/);
  return match ? { quotient: Number(match[1]), remainder: Number(match[2]) } : null;
}

function parseMultiNumber(value) {
  const matcher = getMatcher();
  const tokens = matcher.tokenizeAnswer(value);
  const values = tokens.map((token) => matcher.parseNumberLike(token));
  return values.some((number) => number === null) ? null : values;
}

function validatePolicyConfiguration(policy) {
  const errors = [];
  if (!policy || typeof policy !== "object" || Array.isArray(policy)) return ["answer policy must be an object"];
  if (!POLICY_KINDS.includes(policy.kind)) return ["invalid answer policy kind"];

  if (policy.kind === "decimal" && policy.precision !== undefined
    && (!Number.isInteger(policy.precision) || policy.precision < 0)) {
    errors.push("decimal policy precision must be a non-negative integer");
  }
  if (policy.kind === "fraction" && typeof policy.simplified !== "boolean") {
    errors.push("fraction policy simplified must be a boolean");
  }
  if (policy.kind === "multi-number") {
    if (!Number.isInteger(policy.count) || policy.count < 1) errors.push("multi-number policy count must be a positive integer");
    if (typeof policy.unordered !== "boolean") errors.push("multi-number policy unordered must be a boolean");
  }
  return errors;
}

function validateAnswerPolicy(answer, policy) {
  const errors = validatePolicyConfiguration(policy);
  if (!policy || typeof policy !== "object" || Array.isArray(policy) || !POLICY_KINDS.includes(policy.kind)) return errors;

  if (policy.kind === "integer" && parseInteger(answer) === null) {
    errors.push("integer answer must be an integer");
  }
  if (policy.kind === "decimal") {
    const decimal = parseDecimal(answer);
    if (!decimal) {
      errors.push("decimal answer must be a decimal");
    } else if (Number.isInteger(policy.precision) && decimal.precision !== policy.precision) {
      errors.push(`decimal answer must have ${policy.precision} decimal places`);
    }
  }
  if (policy.kind === "fraction") {
    const fraction = parseFraction(answer);
    if (!fraction) {
      errors.push("fraction answer must use numerator/denominator");
    } else if (policy.simplified === true && gcd(fraction.numerator, fraction.denominator) !== 1) {
      errors.push("fraction answer must be simplified");
    }
  }
  if (policy.kind === "percent" && parsePercent(answer) === null) {
    errors.push("percent answer must include %");
  }
  if (policy.kind === "quotient-remainder") {
    const quotientRemainder = parseQuotientRemainder(answer);
    if (!quotientRemainder) {
      errors.push("quotient-remainder answer must use quotient余remainder");
    } else if (quotientRemainder.remainder < 0) {
      errors.push("quotient-remainder remainder must be non-negative");
    }
  }
  if (policy.kind === "multi-number") {
    const numbers = parseMultiNumber(answer);
    if (!numbers) {
      errors.push("multi-number answer must contain only numbers");
    } else if (Number.isInteger(policy.count) && numbers.length !== policy.count) {
      errors.push(`multi-number answer must contain ${policy.count} numbers`);
    }
  }
  return errors;
}

function matchesAnswerPolicy(userAnswer, expectedAnswer, policy) {
  if (!policy) return null;
  if (validateAnswerPolicy(expectedAnswer, policy).length || validateAnswerPolicy(userAnswer, policy).length) return false;

  switch (policy.kind) {
    case "integer":
      return parseInteger(userAnswer) === parseInteger(expectedAnswer);
    case "decimal":
      return nearlyEqual(parseDecimal(userAnswer).value, parseDecimal(expectedAnswer).value);
    case "fraction": {
      const userFraction = parseFraction(userAnswer);
      const expectedFraction = parseFraction(expectedAnswer);
      return nearlyEqual(
        userFraction.numerator / userFraction.denominator,
        expectedFraction.numerator / expectedFraction.denominator
      );
    }
    case "percent":
      return nearlyEqual(parsePercent(userAnswer), parsePercent(expectedAnswer));
    case "quotient-remainder": {
      const user = parseQuotientRemainder(userAnswer);
      const expected = parseQuotientRemainder(expectedAnswer);
      return user.quotient === expected.quotient && user.remainder === expected.remainder;
    }
    case "multi-number": {
      const user = parseMultiNumber(userAnswer);
      const expected = parseMultiNumber(expectedAnswer);
      if (policy.unordered) {
        user.sort((left, right) => left - right);
        expected.sort((left, right) => left - right);
      }
      return user.every((value, index) => nearlyEqual(value, expected[index]));
    }
    default:
      return false;
  }
}

const api = {
  POLICY_KINDS,
  gcd,
  parseFraction,
  parseQuotientRemainder,
  validateAnswerPolicy,
  matchesAnswerPolicy
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}

globalThis.AnswerPolicy = api;
