const assert = require("node:assert/strict");
const test = require("node:test");

const quality = require("../game/questionQuality.js");
const contract = require("../game/questionContract.js");

function validQuestion(overrides = {}) {
  return {
    id: "quality-1",
    title: "雷达配对",
    prompt: "雷达的两个刻度相加是 18，相差是 4，较小刻度是多少？",
    answer: "7",
    explanation: "(18-4)/2=7",
    answerType: "numeric",
    answerFormat: "integer",
    difficulty: "进阶",
    slot: 3,
    learningObjective: "用和差关系求较小数",
    knowledgeGoal: "用和差关系求较小数",
    typicalModel: "equation",
    commonPitfall: "不要忘记先用 18-4，再除以 2。",
    transferType: "contextual",
    verificationMethod: "把 7 和 11 代回题目条件，确认和为 18、差为 4。",
    reasoningType: "关系建模",
    difficultyProfile: { steps: 2, conditions: 2, representation: "equation", direction: "forward", transfer: "direct" },
    storyBeat: "校准两组雷达刻度。",
    solutionReview: {
      schemaVersion: 2,
      method: "equation",
      stepKinds: ["observe", "model", "calculate", "verify"],
      observation: "Observe the sum and difference relationship.",
      steps: ["Model: (18-4)/2", "Calculate 7", "Check the values", "Substitute to verify"],
      calculation: "(18-4)/2=7",
      answer: "7",
      answerFormat: "integer",
      verification: "把 7 和 11 代回题目条件，确认和为 18、差为 4。",
      check: "7+11=18; 11-7=4.",
      errorTrap: "不要忘记先用 18-4，再除以 2。",
      pitfall: "不要忘记先用 18-4，再除以 2。"
    },
    ...overrides
  };
}

test("quality validator rejects incomplete reviews and answers that disagree", () => {
  const errors = quality.validateQuestionQuality(validQuestion({ solutionReview: { observation: "o", steps: [], answer: "8", check: "c", pitfall: "p" } }));
  assert.equal(errors.some((error) => /solutionReview\.steps/.test(error)), true);
  assert.equal(errors.some((error) => /solutionReview\.answer/.test(error)), true);
});

test("quality validator requires a three-step basic review and a four-step advanced review", () => {
  const basic = quality.validateQuestionQuality(validQuestion({
    difficultyProfile: { steps: 1, conditions: 1, representation: "equation", direction: "forward", transfer: "direct" },
    solutionReview: { observation: "o", steps: ["a", "b"], answer: "7", check: "c", pitfall: "p" }
  }));
  const advanced = quality.validateQuestionQuality(validQuestion({
    difficultyProfile: { steps: 2, conditions: 2, representation: "equation", direction: "forward", transfer: "direct" },
    solutionReview: { observation: "o", steps: ["a", "b", "c"], answer: "7", check: "c", pitfall: "p" }
  }));
  assert.equal(basic.some((error) => /solutionReview\.steps are too shallow/.test(error)), true);
  assert.equal(advanced.some((error) => /solutionReview\.steps are too shallow/.test(error)), true);
});

test("quality validator accepts a complete structured review", () => {
  assert.deepEqual(quality.validateQuestionQuality(validQuestion()), []);
});

test("quality validator requires structured review metadata and answer-format consistency", () => {
  const question = validQuestion({
    solutionReview: {
      observation: "o",
      steps: ["观察", "建模", "计算", "验算"],
      answer: "7",
      check: "c",
      pitfall: "p"
    }
  });
  const errors = quality.validateQuestionQuality(question);
  assert.equal(errors.some((error) => /solutionReview\.schemaVersion/.test(error)), true);
  assert.equal(errors.some((error) => /solutionReview\.stepKinds/.test(error)), true);
  assert.equal(errors.some((error) => /solutionReview\.method/.test(error)), true);
});

test("duplicate detector flags same templates after numeric substitution", () => {
  const suspects = quality.detectTemplateDuplicates([
    validQuestion({ id: "a", prompt: "补给箱里有 12 个零件，再放入 3 个，一共有多少个？" }),
    validQuestion({ id: "b", prompt: "补给箱里有 18 个零件，再放入 5 个，一共有多少个？" })
  ]);
  assert.deepEqual(suspects, [{ normalizedPrompt: "补给箱里有#个零件，再放入#个，一共有多少个？", questionIds: ["a", "b"] }]);
});

test("human review records require six passed criteria for every question", () => {
  const records = [{ questionId: "a", reviewer: "内容组", reviewedAt: "2026-07-29", scores: { objective: 1, nonTemplate: 1, contextNecessary: 1, progressionClear: 1, reviewExecutable: 1, pitfallReal: 1 } }];
  assert.deepEqual(quality.validateHumanReviewRecords(records, ["a"]), []);
  assert.equal(quality.validateHumanReviewRecords([{ ...records[0], scores: { ...records[0].scores, pitfallReal: 0 } }], ["a"]).length > 0, true);
  assert.equal(quality.validateHumanReviewRecords([...records, { ...records[0], questionId: "unexpected" }], ["a"]).some((error) => /unexpected review/.test(error)), true);
});

test("numeric answer contract accepts numbers, decimals, fractions, and percentages", () => {
  assert.equal(contract.isNumericAnswer("42"), true);
  assert.equal(contract.isNumericAnswer("7.65"), true);
  assert.equal(contract.isNumericAnswer("3/5"), true);
  assert.equal(contract.isNumericAnswer("25%"), true);
  assert.equal(contract.getAnswerFormat("42"), "integer");
  assert.equal(contract.getAnswerFormat("7.65"), "decimal");
  assert.equal(contract.getAnswerFormat("3/5"), "fraction");
  assert.equal(contract.getAnswerFormat("25%"), "percent");
});

test("numeric answer contract rejects text answers and mixed explanatory sentences", () => {
  assert.equal(contract.isNumericAnswer("是"), false);
  assert.equal(contract.isNumericAnswer("黄盒"), false);
  assert.equal(contract.isNumericAnswer("因为可分成 10 对"), false);
  assert.deepEqual(contract.validateQuestionContract({ answerType: "numeric", answer: "黄盒" }), [
    "numeric answer must be a number, decimal, fraction, or percentage"
  ]);
});
