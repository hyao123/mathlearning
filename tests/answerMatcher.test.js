const assert = require("node:assert/strict");
const test = require("node:test");
const { isAnswerCorrect, parseNumberLike, tokenizeAnswer } = require("../answerMatcher.js");

test("accepts exact answers and ignores common units", () => {
  assert.equal(isAnswerCorrect("6", "6 张"), true);
  assert.equal(isAnswerCorrect("6张", "6"), true);
  assert.equal(isAnswerCorrect("  14  ", "14"), true);
});

test("accepts Chinese integers", () => {
  assert.equal(parseNumberLike("二十三"), 23);
  assert.equal(isAnswerCorrect("二十三", "23"), true);
  assert.equal(isAnswerCorrect("十六", "16"), true);
});

test("accepts decimal and fraction equivalents", () => {
  assert.equal(isAnswerCorrect("1/2", "0.5"), true);
  assert.equal(isAnswerCorrect("0.25", "1/4"), true);
});

test("accepts yes/no synonyms", () => {
  assert.equal(isAnswerCorrect("对", "是"), true);
  assert.equal(isAnswerCorrect("不对", "不是"), true);
  assert.equal(isAnswerCorrect("错", "不是"), true);
});

test("accepts unordered multi-part answers", () => {
  assert.deepEqual(tokenizeAnswer("12 和 8"), ["12", "8"]);
  assert.equal(isAnswerCorrect("8和12", "12 和 8"), true);
  assert.equal(isAnswerCorrect("8,12", "12 和 8"), true);
});

test("accepts explicitly configured alternate answers", () => {
  assert.equal(isAnswerCorrect("A", "甲", { acceptedAnswers: ["A", "小明"] }), true);
});

test("rejects different answers", () => {
  assert.equal(isAnswerCorrect("7", "6"), false);
  assert.equal(isAnswerCorrect("不是", "是"), false);
  assert.equal(isAnswerCorrect("12", "12 和 8"), false);
});
