(function attachAnswerMatcher(root) {
  const YES_WORDS = new Set(["是", "对", "正确", "yes", "y", "true"]);
  const NO_WORDS = new Set(["不是", "否", "不对", "错误", "错", "no", "n", "false"]);
  const CHINESE_DIGITS = {
    零: 0,
    〇: 0,
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9
  };
  const CHINESE_UNITS = { 十: 10, 百: 100, 千: 1000 };

  function normalizeText(value) {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[，。！？；：、]/g, (mark) => ({ "，": ",", "。": ".", "！": "!", "？": "?", "；": ";", "：": ":", "、": "," }[mark]))
      .replace(/[（）]/g, (mark) => (mark === "（" ? "(" : ")"))
      .replace(/[×xX]/g, "*")
      .replace(/[÷]/g, "/")
      .replace(/\s+/g, "");
  }

  function stripCommonUnits(value) {
    return value.replace(/(个|只|条|张|支|本|颗|块|箱|袋|瓶|米|厘米|千克|克|元|角|分|岁|人|次|道|题|页|排|盒)$/g, "");
  }

  function parseChineseInteger(value) {
    if (!value || !/^[零〇一二两三四五六七八九十百千]+$/.test(value)) {
      return null;
    }

    let total = 0;
    let current = 0;
    for (const char of value) {
      if (char in CHINESE_DIGITS) {
        current = CHINESE_DIGITS[char];
        continue;
      }
      const unit = CHINESE_UNITS[char];
      if (!unit) {
        return null;
      }
      total += (current || 1) * unit;
      current = 0;
    }
    return total + current;
  }

  function parseNumberLike(value) {
    const normalized = stripCommonUnits(normalizeText(value));
    if (/^-?\d+(\.\d+)?$/.test(normalized)) {
      return Number(normalized);
    }

    const fractionMatch = normalized.match(/^(-?\d+)\/(\d+)$/);
    if (fractionMatch && Number(fractionMatch[2]) !== 0) {
      return Number(fractionMatch[1]) / Number(fractionMatch[2]);
    }

    const chineseInteger = parseChineseInteger(normalized);
    if (chineseInteger !== null) {
      return chineseInteger;
    }

    return null;
  }

  function nearlyEqual(left, right) {
    return Math.abs(left - right) < 1e-9;
  }

  function normalizeBoolean(value) {
    const normalized = normalizeText(value);
    if (YES_WORDS.has(normalized)) {
      return "yes";
    }
    if (NO_WORDS.has(normalized)) {
      return "no";
    }
    return null;
  }

  function tokenizeAnswer(value) {
    const normalized = normalizeText(value)
      .replace(/和|与|及|以及/g, ",")
      .replace(/[;；]/g, ",");
    return normalized.split(",").filter(Boolean).map(stripCommonUnits);
  }

  function exactOrUnitMatch(userAnswer, expectedAnswer) {
    const left = normalizeText(userAnswer);
    const right = normalizeText(expectedAnswer);
    return left === right || stripCommonUnits(left) === stripCommonUnits(right);
  }

  function numericMatch(userAnswer, expectedAnswer) {
    const userNumber = parseNumberLike(userAnswer);
    const expectedNumber = parseNumberLike(expectedAnswer);
    return userNumber !== null && expectedNumber !== null && nearlyEqual(userNumber, expectedNumber);
  }

  function booleanMatch(userAnswer, expectedAnswer) {
    const userBoolean = normalizeBoolean(userAnswer);
    const expectedBoolean = normalizeBoolean(expectedAnswer);
    return userBoolean !== null && expectedBoolean !== null && userBoolean === expectedBoolean;
  }

  function unorderedTokenMatch(userAnswer, expectedAnswer) {
    const userTokens = tokenizeAnswer(userAnswer);
    const expectedTokens = tokenizeAnswer(expectedAnswer);
    if (userTokens.length < 2 || userTokens.length !== expectedTokens.length) {
      return false;
    }

    return [...userTokens].sort().join("|") === [...expectedTokens].sort().join("|");
  }

  function getAcceptedAnswers(expectedAnswer, acceptedAnswers = []) {
    return [expectedAnswer, ...acceptedAnswers].filter((answer) => answer !== undefined && answer !== null && String(answer).trim() !== "");
  }

  function isAnswerCorrect(userAnswer, expectedAnswer, options = {}) {
    const acceptedAnswers = getAcceptedAnswers(expectedAnswer, options.acceptedAnswers);
    return acceptedAnswers.some((acceptedAnswer) =>
      exactOrUnitMatch(userAnswer, acceptedAnswer) ||
      numericMatch(userAnswer, acceptedAnswer) ||
      booleanMatch(userAnswer, acceptedAnswer) ||
      unorderedTokenMatch(userAnswer, acceptedAnswer)
    );
  }

  const api = {
    isAnswerCorrect,
    normalizeText,
    parseNumberLike,
    tokenizeAnswer
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.AnswerMatcher = api;
})(typeof window !== "undefined" ? window : globalThis);
