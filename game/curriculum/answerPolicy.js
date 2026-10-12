const POLICY_KINDS = Object.freeze([
  "integer",
  "decimal",
  "fraction",
  "percent",
  "quotient-remainder",
  "multi-number",
  "coordinate",
  "radical",
  "algebraic",
  "solution-set"
]);

function getMatcher() {
  return globalThis.AnswerMatcher || require("../../answerMatcher.js");
}

function normalize(value) {
  return getMatcher().normalizeText(value);
}

function normalizeMathText(value) {
  return String(value ?? "")
    .trim()
    .replace(/[\uff01-\uff5e]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[￥$¥]/g, "")
    .replace(/[，。！？；：、]/g, (mark) => ({ "，": ",", "。": ".", "！": "!", "？": "?", "；": ";", "：": ":", "、": "," }[mark]))
    .replace(/[（）]/g, (mark) => (mark === "（" ? "(" : ")"))
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/\s+/g, "");
}

function gcd(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b) [a, b] = [b, a % b];
  return a;
}

function nearlyEqual(left, right) {
  if (left === right) return true;
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

function parseCoordinate(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  let normalized = normalizeMathText(value).trim();
  if ((normalized.startsWith("(") && normalized.endsWith(")")) || (normalized.startsWith("（") && normalized.endsWith("）"))) {
    normalized = normalized.slice(1, -1).trim();
  }
  const parts = normalized.split(/[,，]/);
  if (parts.length !== 2) return null;
  const parsePart = (p) => {
    p = p.trim();
    const intVal = parseInteger(p);
    if (intVal !== null) return intVal;
    const decVal = parseDecimal(p);
    if (decVal !== null) return decVal.value;
    const fracVal = parseFraction(p);
    if (fracVal !== null) return fracVal.numerator / fracVal.denominator;
    return null;
  };
  const x = parsePart(parts[0]);
  const y = parsePart(parts[1]);
  if (x === null || y === null) return null;
  return { x, y };
}

function isRadicalSimplified(radicand) {
  if (radicand <= 1) return true;
  for (let d = 2; d * d <= radicand; d++) {
    if (radicand % (d * d) === 0) return false;
  }
  return true;
}

function parseRadical(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const normalized = normalizeMathText(value).replace(/\s+/g, "");
  const plainInt = parseInteger(normalized);
  if (plainInt !== null) {
    return { coeff: plainInt, radicand: 1, value: plainInt };
  }
  const match = normalized.match(/^([+-]?\d*)\s*\*?\s*(?:√|sqrt\(|sqrt)\s*(\d+)\)?$/);
  if (!match) return null;
  let coeffStr = match[1];
  let coeff = 1;
  if (coeffStr === "" || coeffStr === "+") coeff = 1;
  else if (coeffStr === "-") coeff = -1;
  else coeff = Number(coeffStr);
  const radicand = Number(match[2]);
  if (!Number.isInteger(radicand) || radicand <= 0) return null;
  return { coeff, radicand, value: coeff * Math.sqrt(radicand) };
}

function safeMathEval(s) {
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let num = "";
      while (i < s.length && /[0-9.]/.test(s[i])) { num += s[i++]; }
      tokens.push(Number(num));
      continue;
    }
    if ("+-*/^()".includes(c)) {
      tokens.push(c);
      i++;
      continue;
    }
    return null;
  }
  const resolved = [];
  for (let j = 0; j < tokens.length; j++) {
    const t = tokens[j];
    if (t === "-" && (j === 0 || "+-*/^(".includes(tokens[j - 1]))) {
      resolved.push(0);
      resolved.push("-");
    } else {
      resolved.push(t);
    }
  }
  const prec = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
  const rightAssoc = { "^": true };
  const rpn = [];
  const ops = [];
  for (const tok of resolved) {
    if (typeof tok === "number") {
      rpn.push(tok);
    } else if (tok === "(") {
      ops.push(tok);
    } else if (tok === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") rpn.push(ops.pop());
      if (!ops.length) return null;
      ops.pop();
    } else if (prec[tok]) {
      while (ops.length && ops[ops.length - 1] !== "(" &&
        (prec[ops[ops.length - 1]] > prec[tok] || (prec[ops[ops.length - 1]] === prec[tok] && !rightAssoc[tok]))) {
        rpn.push(ops.pop());
      }
      ops.push(tok);
    } else {
      return null;
    }
  }
  while (ops.length) {
    const top = ops.pop();
    if (top === "(" || top === ")") return null;
    rpn.push(top);
  }
  const stack = [];
  for (const tok of rpn) {
    if (typeof tok === "number") {
      stack.push(tok);
    } else {
      if (stack.length < 2) return null;
      const b = stack.pop();
      const a = stack.pop();
      if (tok === "+") stack.push(a + b);
      else if (tok === "-") stack.push(a - b);
      else if (tok === "*") stack.push(a * b);
      else if (tok === "/") {
        if (nearlyEqual(b, 0)) return null;
        stack.push(a / b);
      }
      else if (tok === "^") stack.push(Math.pow(a, b));
    }
  }
  return stack.length === 1 ? stack[0] : null;
}

function evaluateSimplePoly(exprStr, varMap = { x: 0 }) {
  if (typeof exprStr !== "string") return null;
  let s = exprStr.replace(/\s+/g, "");
  s = s.replace(/(\d)([a-zA-Z])/g, "$1*$2");
  s = s.replace(/\)([\d(a-zA-Z])/g, ")*$1");
  s = s.replace(/(\d)\(/g, "$1*(");
  for (const [v, val] of Object.entries(varMap)) {
    const repl = val < 0 ? `(0 - ${Math.abs(val)})` : `(${val})`;
    s = s.split(v).join(repl);
  }
  return safeMathEval(s);
}

function parseAlgebraic(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const normalized = normalizeMathText(String(value)).trim().toLowerCase();
  if (!normalized || !/^[0-9a-z+\-*/^().\s]+$/.test(normalized)) return null;
  const testVal = evaluateSimplePoly(normalized, { x: 1 });
  if (testVal === null || !Number.isFinite(testVal)) return null;
  return normalized;
}

function parseSolutionSet(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const normalized = normalizeMathText(String(value)).trim();
  if (!normalized) return null;
  const ineqMatch = normalized.match(/^(?:([+-]?\d+(?:\.\d+)?)\s*(<=|<)\s*)?([a-zA-Z])\s*(>=|>|<=|<)\s*([+-]?\d+(?:\.\d+)?)$/);
  if (ineqMatch) {
    return {
      type: "inequality",
      variable: ineqMatch[3].toLowerCase(),
      lower: ineqMatch[1] !== undefined ? Number(ineqMatch[1]) : -Infinity,
      lowerOp: ineqMatch[2] || null,
      upperOp: ineqMatch[4],
      upper: Number(ineqMatch[5])
    };
  }
  const tokens = normalized.split(/[,，;；]/).map((t) => t.trim()).filter(Boolean);
  if (tokens.length === 0) return null;
  const roots = [];
  for (const tok of tokens) {
    const rootMatch = tok.match(/(?:[a-zA-Z]\d*\s*=\s*)?([+-]?(?:\d+\/\d+|\d+(?:\.\d+)?))$/);
    if (!rootMatch) return null;
    const num = rootMatch[1];
    if (num.includes("/")) {
      const fr = parseFraction(num);
      if (!fr) return null;
      roots.push(fr.numerator / fr.denominator);
    } else {
      roots.push(Number(num));
    }
  }
  return { type: "roots", roots };
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
  if (policy.kind === "radical" && policy.simplified !== undefined && typeof policy.simplified !== "boolean") {
    errors.push("radical policy simplified must be a boolean");
  }
  if (policy.kind === "solution-set" && policy.expectedType !== undefined && !["roots", "inequality"].includes(policy.expectedType)) {
    errors.push("solution-set expectedType must be roots or inequality");
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
  if (policy.kind === "coordinate" && !parseCoordinate(answer)) {
    errors.push("coordinate answer must be in format (x, y)");
  }
  if (policy.kind === "radical") {
    const rad = parseRadical(answer);
    if (!rad) {
      errors.push("radical answer must be in format a√b or a*sqrt(b)");
    } else if (policy.simplified === true && !isRadicalSimplified(rad.radicand)) {
      errors.push("radical answer must be simplified");
    }
  }
  if (policy.kind === "algebraic" && !parseAlgebraic(answer)) {
    errors.push("algebraic answer must be a valid algebraic expression");
  }
  if (policy.kind === "solution-set") {
    const sol = parseSolutionSet(answer);
    if (!sol) {
      errors.push("solution-set answer must be roots or inequality");
    } else if (policy.expectedType && sol.type !== policy.expectedType) {
      errors.push(`solution-set answer must be of type ${policy.expectedType}`);
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
    case "coordinate": {
      const user = parseCoordinate(userAnswer);
      const expected = parseCoordinate(expectedAnswer);
      return nearlyEqual(user.x, expected.x) && nearlyEqual(user.y, expected.y);
    }
    case "radical": {
      const user = parseRadical(userAnswer);
      const expected = parseRadical(expectedAnswer);
      if (policy.simplified) {
        return user.coeff === expected.coeff && user.radicand === expected.radicand;
      }
      return nearlyEqual(user.value, expected.value);
    }
    case "algebraic": {
      const user = parseAlgebraic(userAnswer);
      const expected = parseAlgebraic(expectedAnswer);
      const testPoints = [-3, -1, 0, 2, 5];
      for (const pt of testPoints) {
        const uVal = evaluateSimplePoly(user, { x: pt });
        const eVal = evaluateSimplePoly(expected, { x: pt });
        if (uVal === null || eVal === null || !nearlyEqual(uVal, eVal)) {
          return false;
        }
      }
      return true;
    }
    case "solution-set": {
      const user = parseSolutionSet(userAnswer);
      const expected = parseSolutionSet(expectedAnswer);
      if (!user || !expected || user.type !== expected.type) return false;
      if (user.type === "inequality") {
        return nearlyEqual(user.lower, expected.lower)
          && user.lowerOp === expected.lowerOp
          && user.upperOp === expected.upperOp
          && nearlyEqual(user.upper, expected.upper);
      }
      if (user.type === "roots") {
        if (user.roots.length !== expected.roots.length) return false;
        const uSorted = [...user.roots].sort((a, b) => a - b);
        const eSorted = [...expected.roots].sort((a, b) => a - b);
        return uSorted.every((val, idx) => nearlyEqual(val, eSorted[idx]));
      }
      return false;
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
  parseCoordinate,
  parseRadical,
  parseAlgebraic,
  parseSolutionSet,
  validateAnswerPolicy,
  matchesAnswerPolicy
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}

globalThis.AnswerPolicy = api;
