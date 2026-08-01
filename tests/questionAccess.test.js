const assert = require("node:assert/strict");
const test = require("node:test");

const matcher = require("../answerMatcher.js");
const access = require("../game/questionAccess.js");

const fullQuestion = {
  id: "patterns-03",
  title: "扫描范围",
  prompt: "雷达扫描范围依次是 3、6、12、24 千米，下一轮是多少千米？",
  answer: "48",
  acceptedAnswers: ["48千米"],
  difficulty: "进阶",
  slot: 3,
  isBoss: false,
  learningObjective: "识别倍增规律",
  storyBeat: "校准逐轮扩大的雷达扫描范围。",
  hints: ["看倍数"],
  explanation: "旧字段不应出现在挑战题面。",
  difficultyProfile: { steps: 1 },
  solutionReview: {
    observation: "相邻两个数都扩大为原来的 2 倍。",
    steps: ["6 ÷ 3 = 2", "24 × 2 = 48"],
    answer: "48 千米",
    check: "48 ÷ 24 = 2",
    pitfall: "不要误认为每次加同一个数。"
  }
};

test("toChallengeQuestion strips answer and review secrets while keeping learner fields", () => {
  const question = access.toChallengeQuestion(fullQuestion, { rewardPreview: ["iron-ingot"] });

  assert.deepEqual(question, {
    id: "patterns-03",
    title: "扫描范围",
    prompt: "雷达扫描范围依次是 3、6、12、24 千米，下一轮是多少千米？",
    difficulty: "进阶",
    slot: 3,
    isBoss: false,
    learningObjective: "识别倍增规律",
    storyBeat: "校准逐轮扩大的雷达扫描范围。",
    rewardPreview: ["iron-ingot"]
  });
  for (const key of ["answer", "acceptedAnswers", "hints", "solutionReview", "explanation", "difficultyProfile"]) {
    assert.equal(Object.hasOwn(question, key), false, key);
  }
});

test("judgeAnswer reports correctness without returning answer data", () => {
  const correct = access.judgeAnswer(fullQuestion, "48千米", matcher);
  const incorrect = access.judgeAnswer(fullQuestion, "47", matcher);

  assert.deepEqual(correct, { correct: true });
  assert.deepEqual(incorrect, { correct: false });
  assert.equal(Object.hasOwn(correct, "answer"), false);
});

test("buildSolutionReview returns a detached, display-ready review only after resolution", () => {
  const review = access.buildSolutionReview(fullQuestion);

  assert.deepEqual(review, fullQuestion.solutionReview);
  assert.notEqual(review, fullQuestion.solutionReview);
  assert.notEqual(review.steps, fullQuestion.solutionReview.steps);
  assert.equal(access.buildSolutionReview({}), null);
});
