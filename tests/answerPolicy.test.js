const assert = require("node:assert/strict");
const test = require("node:test");

const policy = require("../game/curriculum/answerPolicy.js");
const contract = require("../game/questionContract.js");

test("simplified fraction policy rejects non-simplified authored and learner answers", () => {
  assert.deepEqual(
    policy.validateAnswerPolicy("2/6", { kind: "fraction", simplified: true }),
    ["fraction answer must be simplified"]
  );
  assert.equal(policy.matchesAnswerPolicy("2/6", "1/3", { kind: "fraction", simplified: true }), false);
  assert.equal(policy.matchesAnswerPolicy("1/3", "1/3", { kind: "fraction", simplified: true }), true);
});

test("quotient-remainder and unordered multi-number policies keep automatic matching", () => {
  assert.equal(policy.matchesAnswerPolicy("5余2", "5...2", { kind: "quotient-remainder" }), true);
  assert.equal(
    policy.matchesAnswerPolicy("7,3", "3,7", { kind: "multi-number", count: 2, unordered: true }),
    true
  );
});

test("answer policies validate required configuration and answer shapes", () => {
  assert.deepEqual(
    policy.validateAnswerPolicy("5余-2", { kind: "quotient-remainder" }),
    ["quotient-remainder remainder must be non-negative"]
  );
  assert.deepEqual(
    policy.validateAnswerPolicy("3,7", { kind: "multi-number", count: 3, unordered: false }),
    ["multi-number answer must contain 3 numbers"]
  );
  assert.deepEqual(
    policy.validateAnswerPolicy("1.25", { kind: "decimal", precision: 1 }),
    ["decimal answer must have 1 decimal places"]
  );
  assert.deepEqual(
    policy.validateAnswerPolicy("3", { kind: "fraction" }),
    ["fraction policy simplified must be a boolean", "fraction answer must use numerator/denominator"]
  );
});
test("V3 answer contracts delegate to structured answer policies", () => {
  assert.deepEqual(contract.validateQuestionContract({
    schemaVersion: 3,
    answerType: "numeric",
    answer: "5...2",
    answerPolicy: { kind: "quotient-remainder" },
    answerFormat: "quotient-remainder"
  }), []);
  assert.deepEqual(contract.validateQuestionContract({
    schemaVersion: 3,
    answerType: "numeric",
    answer: "3,7",
    answerPolicy: { kind: "multi-number", count: 2, unordered: true },
    answerFormat: "integer"
  }), ["answerFormat must equal answerPolicy.kind"]);
});
test("policy matcher declines to replace legacy matching without an explicit policy", () => {
  assert.equal(policy.matchesAnswerPolicy("0.5", "1/2"), null);
});