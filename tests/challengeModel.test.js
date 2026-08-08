const assert = require("node:assert/strict");
const test = require("node:test");

const ChallengeModel = require("../game/challengeModel.js");
const ProgressionModel = require("../game/progressionModel.js");
const matcher = require("../answerMatcher.js");

function createChapter() {
  return {
    chapterId: "chapter-01",
    levels: [1, 2].map((number) => ({
      levelId: `chapter-01-level-${number}`,
      questions: Array.from({ length: 10 }, (_, index) => ({
        id: `challenge-level-${number}-question-${index + 1}`,
        title: `题目 ${index + 1}`,
        prompt: `算式 ${number} + ${index}`,
        difficulty: index < 2 ? "基础" : "进阶",
        answer: String(number + index),
        acceptedAnswers: [String(number + index)],
        storyBeat: "补给站发来一条线索。",
        learningObjective: "识别数量关系",
        explanation: "按题意计算。",
        hints: ["先找已知量。"],
        solutionSteps: ["列出关系", "完成计算", "检查答案"],
        solutionReview: { observation: "先找已知量。", steps: ["列出关系", "完成计算", "检查答案"], answer: String(number + index), check: "代回题目", pitfall: "注意单位。" },
        isBoss: false,
        slot: index + 1
      }))
    }))
  };
}

test("missing-material analysis follows the project chain down to raw rewards", () => {
  const missing = ChallengeModel.getMissingRawMaterials("chapter-05", {});
  assert.equal(missing.length > 0, true);
  assert.equal(missing[0].itemId, "carbon-titanium-plate");
  assert.equal(missing[0].quantity > 0, true);
});

test("missing-material analysis aggregates duplicate raw materials before subtracting inventory", () => {
  const deepSeaMissing = ChallengeModel.getMissingRawMaterials("chapter-02", { "prismarine-shard": 3 });
  assert.equal(deepSeaMissing.find((entry) => entry.itemId === "prismarine-shard")?.quantity, 3);

  const armoredMissing = ChallengeModel.getMissingRawMaterials("chapter-05", { "carbon-titanium-plate": 3 });
  assert.equal(armoredMissing.find((entry) => entry.itemId === "carbon-titanium-plate")?.quantity, 3);
});

test("missing-material analysis respects multi-output processing recipes", () => {
  const missing = ChallengeModel.getMissingRawMaterials("chapter-05", {});
  assert.equal(missing.find((entry) => entry.itemId === "carbon-titanium-plate")?.quantity, 6);
});

test("review challenge prefers mistakes, awards one capped target material, and persists", () => {
  const chapter = createChapter();
  const initial = ProgressionModel.createInitialState(chapter);
  const ready = ProgressionModel.hydrate(JSON.stringify({
    activeChapterId: chapter.chapterId,
    unlockedLevelIds: chapter.levels.map((level) => level.levelId),
    levelRecords: Object.fromEntries(chapter.levels.map((level) => [level.levelId, { starCount: 2 }])),
    mistakeQuestionIds: { "challenge-level-2-question-3": true },
    inventory: {}
  }), chapter);
  assert.equal(ProgressionModel.getChapterCompletion(ready, chapter).isChapterCleared, true);
  const started = ProgressionModel.startChallenge(ready, "review", { random: () => 0 });
  assert.equal(started.activeChallengeRun.questions[0].questionId, "challenge-level-2-question-3");

  const entry = started.activeChallengeRun.questions[0];
  const answer = chapter.levels.find((level) => level.levelId === entry.levelId).questions[entry.questionIndex].answer;
  const resolved = ProgressionModel.submitChallengeAnswer(started, answer, matcher);
  assert.equal(resolved.activeChallengeRun.status, "resolved");
  assert.equal(Object.values(resolved.inventory).some((quantity) => quantity === 1), true);

  const hydrated = ProgressionModel.hydrate(ProgressionModel.serialize(resolved), chapter);
  assert.equal(hydrated.activeChallengeRun.status, "resolved");
  assert.equal(hydrated.activeChallengeRun.question.questionId, undefined);
  assert.equal(hydrated.activeChallengeRun.question.id, entry.questionId);
});

test("challenge hydration rejects inconsistent counters, resolution metadata, and target state", () => {
  const chapter = createChapter();
  const initial = ProgressionModel.createInitialState(chapter);
  const started = ProgressionModel.hydrate(JSON.stringify({
    activeChapterId: chapter.chapterId,
    unlockedLevelIds: chapter.levels.map((level) => level.levelId),
    levelRecords: Object.fromEntries(chapter.levels.map((level) => [level.levelId, { starCount: 2 }])),
    inventory: {}
  }), chapter);
  const run = ProgressionModel.startChallenge(started, "random", { random: () => 0 });
  const stored = JSON.parse(ProgressionModel.serialize(run));

  const badCounts = JSON.parse(JSON.stringify(stored));
  badCounts.activeChallengeRun.correctCount = 1;
  const hydratedCounts = ProgressionModel.hydrate(JSON.stringify(badCounts), chapter);
  assert.equal(hydratedCounts.activeChallengeRun, null);

  const badTarget = JSON.parse(JSON.stringify(stored));
  badTarget.activeChallengeRun.targetRemaining += 1;
  const hydratedTarget = ProgressionModel.hydrate(JSON.stringify(badTarget), chapter);
  assert.equal(hydratedTarget.activeChallengeRun, null);

  const firstEntry = run.activeChallengeRun.questions[0];
  const answer = chapter.levels.find((level) => level.levelId === firstEntry.levelId).questions[firstEntry.questionIndex].answer;
  const resolved = ProgressionModel.submitChallengeAnswer(run, answer, matcher);
  const badResolution = JSON.parse(ProgressionModel.serialize(resolved));
  badResolution.activeChallengeRun.resolved.questionId = "not-a-question";
  const hydratedResolution = ProgressionModel.hydrate(JSON.stringify(badResolution), chapter);
  assert.equal(hydratedResolution.activeChallengeRun, null);
});
