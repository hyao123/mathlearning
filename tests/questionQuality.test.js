const assert = require("node:assert/strict");
const test = require("node:test");

const quality = require("../game/questionQuality.js");

function validQuestion(overrides = {}) {
  return {
    id: "quality-1",
    title: "雷达配对",
    prompt: "雷达的两个刻度相加是 18，相差是 4，较小刻度是多少？",
    answer: "7",
    difficulty: "进阶",
    slot: 3,
    learningObjective: "用和差关系求较小数",
    reasoningType: "关系建模",
    difficultyProfile: { steps: 2, conditions: 2, representation: "equation", direction: "forward", transfer: "direct" },
    storyBeat: "校准两组雷达刻度。",
    solutionReview: {
      observation: "先把和与差对应到两个刻度。",
      steps: ["较小刻度=(18-4)÷2", "得到 7"],
      answer: "7",
      check: "7+11=18，11-7=4。",
      pitfall: "不要把 18-4 后忘记再除以 2。"
    },
    ...overrides
  };
}

test("quality validator rejects incomplete reviews and answers that disagree", () => {
  const errors = quality.validateQuestionQuality(validQuestion({ solutionReview: { observation: "o", steps: [], answer: "8", check: "c", pitfall: "p" } }));
  assert.equal(errors.some((error) => /solutionReview\.steps/.test(error)), true);
  assert.equal(errors.some((error) => /solutionReview\.answer/.test(error)), true);
});

test("quality validator accepts a complete structured review", () => {
  assert.deepEqual(quality.validateQuestionQuality(validQuestion()), []);
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
});
