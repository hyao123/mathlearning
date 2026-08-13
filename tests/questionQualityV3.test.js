const assert = require("node:assert/strict");
const test = require("node:test");

const quality = require("../game/curriculum/questionQualityV3.js");
const curriculum = require("../game/curriculum/curriculumMap.js");

function validQuestion(overrides = {}) {
  return {
    schemaVersion: 3,
    id: "chicken-rabbit-v3-01",
    topicId: "chicken-rabbit",
    level: 1,
    title: "鸡兔同笼",
    prompt: "鸡和兔一共有 10 只，脚一共有 28 只。兔有多少只？",
    answer: "4",
    answerType: "numeric",
    answerFormat: "integer",
    answerPolicy: { kind: "integer" },
    conditionRoles: ["animal-total", "leg-total"],
    representation: "table",
    questionDirection: "find-parameter",
    reasoningMoves: ["assume", "substitute", "verify"],
    supportingConcepts: [],
    strategyChoices: [],
    solution: {
      strategy: "assume-all-chickens",
      observation: "先假设全是鸡。",
      summary: "(28 - 20) / 2 = 4",
      steps: [
        { id: "difference", kind: "calculate", operation: "subtract", operands: [28, 20], result: 8, explanation: "多出的脚数是 8。" },
        { id: "rabbits", kind: "verify", operation: "divide", operands: ["$difference", 2], result: 4, explanation: "每只兔比鸡多 2 只脚。" }
      ]
    },
    verification: {
      strategy: "substitute-counts",
      summary: "4 只兔和 6 只鸡共有 28 只脚。",
      steps: [
        { id: "rabbit-legs", kind: "calculate", operation: "multiply", operands: [4, 4], result: 16, explanation: "兔脚数。" },
        { id: "chicken-legs", kind: "calculate", operation: "multiply", operands: [6, 2], result: 12, explanation: "鸡脚数。" },
        { id: "total-legs", kind: "verify", operation: "add", operands: ["$rabbit-legs", "$chicken-legs"], result: 28, explanation: "脚数符合条件。" },
        { id: "answer", kind: "verify", operation: "divide", operands: ["$rabbit-legs", 4], result: 4, explanation: "兔的数量是 4。" }
      ]
    },
    reviewMetadata: {
      reviewer: "课程组",
      reviewedAt: "2026-08-13T00:00:00.000Z",
      evidence: "独立复算并核对课程动作。"
    },
    commonPitfall: "不要把每只兔多出的脚数算成 4。",
    storyBeat: "帮助农场管理员核对动物数量。",
    readingProfile: { unfamiliarTerms: [] },
    ...overrides
  };
}

test("composes the curriculum, answer-policy, solution, and difficulty contracts", () => {
  const invalid = validQuestion({
    prompt: "",
    reasoningMoves: ["assume"],
    solution: { strategy: "", steps: [] }
  });
  const errors = quality.validateQuestionV3(invalid, curriculum.getCurriculumTopic("chicken-rabbit"));

  assert.ok(errors.includes("missing prompt"));
  assert.ok(errors.includes("missing required actions: substitute, verify"));
  assert.ok(errors.some((error) => error.startsWith("solution: solution strategy")));
  assert.ok(errors.some((error) => error.startsWith("difficulty: solution steps")));
});

test("requires answerFormat to equal the authored answer policy kind", () => {
  const errors = quality.validateQuestionV3(
    validQuestion({ answerFormat: "decimal" }),
    curriculum.getCurriculumTopic("chicken-rabbit")
  );

  assert.ok(errors.includes("answerFormat must equal answerPolicy.kind"));
});

test("rejects authored computed difficulty overrides", () => {
  const errors = quality.validateQuestionV3(
    validQuestion({ difficultyProfile: { score: 1 }, computedDifficulty: { score: 1 } }),
    curriculum.getCurriculumTopic("chicken-rabbit")
  );

  assert.ok(errors.includes("difficultyProfile must not be authored"));
  assert.ok(errors.includes("computedDifficulty must not be authored"));
});

test("returns errors instead of throwing for malformed V3 values", () => {
  assert.doesNotThrow(() => quality.validateQuestionV3(null, null));
  assert.deepEqual(quality.validateQuestionV3(null, null), ["question must be an object"]);
});

test("composes readability errors with the registered topic grade band", () => {
  const errors = quality.validateQuestionV3(
    validQuestion({
      prompt: "a".repeat(71),
      readingProfile: { unfamiliarTerms: ["term one", "term two"] }
    }),
    curriculum.getCurriculumTopic("chicken-rabbit")
  );

  assert.ok(errors.includes("prompt exceeds 70 characters"));
  assert.ok(errors.includes("unfamiliar terms exceed 1"));
});
