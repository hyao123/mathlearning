const assert = require("node:assert/strict");
const test = require("node:test");

const model = require("../game/progressionModel.js");
const matcher = require("../answerMatcher.js");

function createChapter() {
  return {
    chapterId: "chapter-01",
    levels: [1, 2].map((number) => ({
      levelId: `chapter-01-level-${number}`,
      questions: Array.from({ length: 10 }, (_, index) => ({
        id: `level-${number}-question-${index + 1}`,
        title: `Question ${index + 1}`,
        prompt: `Prompt ${index + 1}`,
        difficulty: "practice",
        answer: `answer-${index + 1}`,
        acceptedAnswers: [`accepted-${index + 1}`],
        learningObjective: `Objective ${index + 1}`,
        storyBeat: `Story ${index + 1}`,
        explanation: `Explanation ${index + 1}`,
        hints: [`Hint ${index + 1}`],
        solutionSteps: [`Step ${index + 1}`],
        solutionReview: {
          observation: `Observation ${index + 1}`,
          steps: [`Review step ${index + 1}`],
          answer: `answer-${index + 1}`,
          check: `Check ${index + 1}`,
          pitfall: `Pitfall ${index + 1}`
        },
        isBoss: index === 9,
        slot: index + 1
      }))
    }))
  };
}

function getCurrentAnswer(state, chapter) {
  const level = chapter.levels.find((entry) => entry.levelId === state.activeRun.levelId);
  return level.questions[state.activeRun.questionIndex].answer;
}

function finishRunWithSkips(chapter, skipCount, options = { random: () => 0 }) {
  let state = model.startLevel(model.createInitialState(chapter), "chapter-01-level-1");
  for (let index = 0; index < 10; index += 1) {
    state = index < skipCount
      ? model.skipQuestion(state)
      : model.submitAnswer(state, getCurrentAnswer(state, chapter), matcher, options);
    state = model.continueFromResolved(state);
  }
  return state;
}

function clearLevel(state, chapter, levelId, options = { random: () => 0 }) {
  let next = model.startLevel(state, levelId);
  for (let index = 0; index < 10; index += 1) {
    next = model.submitAnswer(next, getCurrentAnswer(next, chapter), matcher, options);
    next = model.continueFromResolved(next);
  }
  return next;
}

test("starts only the unlocked first level and unlocks the next level after ten questions", () => {
  const chapter = createChapter();
  const initial = model.createInitialState(chapter);

  assert.deepEqual(initial.unlockedLevelIds, ["chapter-01-level-1"]);
  assert.throws(() => model.startLevel(initial, "chapter-01-level-2"), /locked/);

  const settled = finishRunWithSkips(chapter, 0);
  assert.equal(settled.activeRun, null);
  assert.equal(settled.unlockedLevelIds.includes("chapter-01-level-2"), true);
});

test("reports first-chapter finale progress separately from final project assembly", () => {
  const chapter = createChapter();
  let state = model.createInitialState(chapter);

  assert.deepEqual(model.getChapterCompletion(state, chapter), {
    chapterId: "chapter-01",
    clearedLevels: 0,
    totalLevels: 2,
    isChapterCleared: false,
    finalProjectId: "j20-sky-fighter",
    isFinalProjectComplete: false,
    status: "in-progress"
  });

  state = clearLevel(state, chapter, "chapter-01-level-1");
  assert.equal(model.getChapterCompletion(state, chapter).status, "in-progress");

  state = clearLevel(state, chapter, "chapter-01-level-2");
  assert.deepEqual(model.getChapterCompletion(state, chapter), {
    chapterId: "chapter-01",
    clearedLevels: 2,
    totalLevels: 2,
    isChapterCleared: true,
    finalProjectId: "j20-sky-fighter",
    isFinalProjectComplete: false,
    status: "chapter-cleared"
  });

  const completed = model.hydrate(JSON.stringify({
    unlockedLevelIds: ["chapter-01-level-1", "chapter-01-level-2"],
    levelRecords: {
      "chapter-01-level-1": { starCount: 1 },
      "chapter-01-level-2": { starCount: 1 }
    },
    inventory: { "j20-sky-fighter": 1 }
  }), chapter);
  assert.equal(model.getChapterCompletion(completed, chapter).status, "project-complete");
});

test("migrates a legacy completed final project into persistent component and assembly milestones", () => {
  const chapter = createChapter();
  const completed = model.hydrate(JSON.stringify({
    unlockedLevelIds: ["chapter-01-level-1", "chapter-01-level-2"],
    levelRecords: {
      "chapter-01-level-1": { starCount: 3 },
      "chapter-01-level-2": { starCount: 3 }
    },
    inventory: { "j20-sky-fighter": 1 }
  }), chapter);

  assert.equal(completed.craftedProjectRecipeIds["craft-j20-frame-rib"], true);
  assert.equal(completed.craftedProjectRecipeIds["assemble-j20-airframe"], true);
  assert.equal(completed.craftedProjectRecipeIds["assemble-j20-sky-fighter"], true);
  assert.equal(Object.keys(completed.craftedProjectRecipeIds).length, 29);
});

test("correct answers award each previewed item once and retries do not duplicate rewards", () => {
  const chapter = createChapter();
  let state = model.startLevel(model.createInitialState(chapter), "chapter-01-level-1");

  state = model.submitAnswer(state, "wrong", matcher);
  assert.equal(state.activeRun.status, "retry");
  assert.deepEqual(state.inventory, {});
  assert.equal(state.activeRun.correctCount, 0);

  state = model.retryQuestion(state);
  state = model.submitAnswer(state, getCurrentAnswer(state, chapter), matcher);
  assert.equal(state.activeRun.status, "resolved");
  assert.equal(state.inventory["oak-log"], 1);
  assert.equal(state.activeRun.correctCount, 1);
  assert.deepEqual(state.activeRun.rewardedQuestionIds, ["level-1-question-1"]);
});

test("advanced questions award their fixed material plus one random bonus", () => {
  const chapter = createChapter();
  chapter.levels[0].questions[2].difficulty = "进阶";
  let state = model.startLevel(model.createInitialState(chapter), "chapter-01-level-1");

  state = model.skipQuestion(state);
  state = model.continueFromResolved(state);
  state = model.skipQuestion(state);
  state = model.continueFromResolved(state);
  state = model.submitAnswer(state, getCurrentAnswer(state, chapter), matcher, { random: () => 0.99 });

  assert.equal(state.inventory["oak-log"], 1);
  assert.equal(state.inventory["iron-ingot"], 1);
  assert.deepEqual(state.activeRun.rewardTransactions, [{
    questionId: "level-1-question-3",
    rewardType: "fixed",
    itemId: "oak-log",
    requestedQuantity: 1,
    awardedQuantity: 1,
    status: "awarded"
  }, {
    questionId: "level-1-question-3",
    rewardType: "random",
    itemId: "iron-ingot",
    requestedQuantity: 1,
    awardedQuantity: 1,
    status: "awarded"
  }]);

  const hydrated = model.hydrate(model.serialize(state), chapter);
  assert.deepEqual(hydrated.activeRun.rewardTransactions, state.activeRun.rewardTransactions);
  assert.deepEqual(hydrated.activeRun.earnedItems, [{ itemId: "oak-log", quantity: 1 }, { itemId: "iron-ingot", quantity: 1 }]);
});

test("active questions expose only learner-safe prompt data through retry and skip", () => {
  const chapter = createChapter();
  let state = model.startLevel(model.createInitialState(chapter), "chapter-01-level-1");
  const assertSafeQuestion = (question, id) => {
    assert.deepEqual(question, {
      id,
      title: id.endsWith("-1") ? "Question 1" : "Question 2",
      prompt: id.endsWith("-1") ? "Prompt 1" : "Prompt 2",
      difficulty: "practice",
      isBoss: false,
      slot: id.endsWith("-1") ? 1 : 2,
      learningObjective: id.endsWith("-1") ? "Objective 1" : "Objective 2",
      storyBeat: id.endsWith("-1") ? "Story 1" : "Story 2"
    });
    ["answer", "acceptedAnswers", "explanation", "hints", "solutionSteps"].forEach((field) => {
      assert.equal(Object.hasOwn(question, field), false);
    });
  };

  assertSafeQuestion(state.activeRun.question, "level-1-question-1");
  state = model.submitAnswer(state, "wrong", matcher);
  assert.equal(state.activeRun.status, "retry");
  assertSafeQuestion(state.activeRun.question, "level-1-question-1");
  state = model.skipQuestion(state);
  assert.equal(state.activeRun.status, "resolved");
  assert.equal(state.inventory["oak-log"] || 0, 0);
  assert.deepEqual(state.activeRun.skippedQuestionIds, ["level-1-question-1"]);
  assertSafeQuestion(state.activeRun.question, "level-1-question-1");
  state = model.continueFromResolved(state);
  assertSafeQuestion(state.activeRun.question, "level-1-question-2");
});

test("skipping retains the better star record", () => {
  const chapter = createChapter();

  const settled = finishRunWithSkips(chapter, 2);
  assert.equal(settled.levelRecords["chapter-01-level-1"].starCount, 2);
  assert.equal(model.getSettlement(settled).starCount, 2);

  let replay = model.startLevel(settled, "chapter-01-level-1");
  for (let index = 0; index < 10; index += 1) {
    replay = model.skipQuestion(replay);
    replay = model.continueFromResolved(replay);
  }
  assert.equal(model.getSettlement(replay).starCount, 1);
  assert.equal(replay.levelRecords["chapter-01-level-1"].starCount, 2);
});

test("skipped questions grant no mainline materials while a full clear grants all ten", () => {
  const chapter = createChapter();
  const skippedBoss = finishRunWithSkips(chapter, 10);
  assert.equal(skippedBoss.inventory["oak-log"] || 0, 0);

  const solvedBoss = finishRunWithSkips(chapter, 0);
  assert.equal(solvedBoss.inventory["oak-log"], 10);
  assert.equal(solvedBoss.levelRecords["chapter-01-level-1"].starCount, 3);
});

test("a solved replay does not duplicate first-claim materials", () => {
  const chapter = createChapter();
  const firstClear = finishRunWithSkips(chapter, 0);
  let replay = model.startLevel(firstClear, "chapter-01-level-1");

  for (let index = 0; index < 10; index += 1) {
    replay = model.submitAnswer(replay, getCurrentAnswer(replay, chapter), matcher, { random: () => 0 });
    replay = model.continueFromResolved(replay);
  }

  assert.equal(replay.activeRun, null);
  assert.equal(replay.inventory["oak-log"], 10);
  assert.equal(replay.inventory.coal, 6, "three streak chests per completed run remain extra rewards");
  assert.equal(model.getSettlement(replay).starCount, 3);
  assert.deepEqual(model.getSettlement(replay).earnedItems, [{ itemId: "coal", quantity: 3 }]);
  assert.equal(model.getSettlement(replay).rewardTransactions.every((transaction) => transaction.rewardType === "streak-chest"), true);
});

test("settlement reports only current-run earnings and all-skip replay reports none", () => {
  const chapter = createChapter();
  const firstClear = finishRunWithSkips(chapter, 0);
  let replay = model.startLevel(firstClear, "chapter-01-level-1");

  for (let index = 0; index < 10; index += 1) {
    replay = model.skipQuestion(replay);
    replay = model.continueFromResolved(replay);
  }

  const settlement = model.getSettlement(replay);
  assert.ok(Object.keys(replay.inventory).length > 0, "prior inventory remains available");
  assert.deepEqual(settlement.earnedItems, []);
  assert.deepEqual(settlement.rewardTransactions, []);
});

test("stack-capped rewards are explicit and never appear as newly earned", () => {
  const chapter = createChapter();
  const hydrated = model.hydrate(JSON.stringify({ inventory: { "oak-log": 999 } }), chapter);
  let state = model.startLevel(hydrated, "chapter-01-level-1");

  state = model.submitAnswer(state, getCurrentAnswer(state, chapter), matcher);

  assert.equal(state.inventory["oak-log"], 999);
  assert.deepEqual(state.activeRun.earnedItems, []);
  assert.deepEqual(state.activeRun.rewardTransactions, [{
    questionId: "level-1-question-1",
    rewardType: "fixed",
    itemId: "oak-log",
    requestedQuantity: 1,
    awardedQuantity: 0,
    status: "stack-capped"
  }]);
});

test("correct and skipped questions remain resolved until the learner continues", () => {
  const chapter = createChapter();
  let state = model.startLevel(model.createInitialState(chapter), "chapter-01-level-1");

  state = model.submitAnswer(state, getCurrentAnswer(state, chapter), matcher, { now: () => 1000 });
  assert.equal(state.activeRun.status, "resolved");
  assert.equal(state.activeRun.questionIndex, 0);
  assert.deepEqual(state.activeRun.resolved, {
    questionId: "level-1-question-1",
    resolution: "correct",
    attemptId: "chapter-01-level-1:level-1-question-1:1",
    resolvedAt: 1000,
    advanced: false
  });
  assert.deepEqual(model.getResolvedReview(state), {
    observation: "Observation 1",
    steps: ["Review step 1"],
    answer: "answer-1",
    check: "Check 1",
    pitfall: "Pitfall 1"
  });

  const serialized = model.serialize(state);
  assert.equal(serialized.includes("Observation 1"), false);
  state = model.hydrate(serialized, chapter);
  assert.equal(state.activeRun.status, "resolved");
  state = model.continueFromResolved(state);
  assert.equal(state.activeRun.status, "active");
  assert.equal(state.activeRun.questionIndex, 1);
  assert.equal(state.activeRun.resolved, undefined);

  state = model.skipQuestion(state, { now: () => 1001 });
  assert.equal(state.activeRun.status, "resolved");
  assert.equal(state.activeRun.resolved.resolution, "skipped");
  assert.equal(state.activeRun.resolved.attemptId, "chapter-01-level-1:level-1-question-2:2");
  assert.equal(state.inventory.cobblestone || 0, 0);
});

test("wrong answers stay retry and do not expose a tactical review", () => {
  const chapter = createChapter();
  let state = model.startLevel(model.createInitialState(chapter), "chapter-01-level-1");

  state = model.submitAnswer(state, "wrong", matcher);

  assert.equal(state.activeRun.status, "retry");
  assert.equal(model.getResolvedReview(state), null);
});

test("fixed-claim and attempt ledgers survive reload without exposing review text", () => {
  const chapter = createChapter();
  let state = model.startLevel(model.createInitialState(chapter), "chapter-01-level-1");

  state = model.submitAnswer(state, getCurrentAnswer(state, chapter), matcher, { now: () => 2000 });
  const serialized = JSON.parse(model.serialize(state));
  assert.equal(serialized.claimedFixedRewards["level-1-question-1"], true);
  assert.deepEqual(serialized.attemptSettlements["chapter-01-level-1:level-1-question-1:1"], {
    questionId: "level-1-question-1",
    resolution: "correct",
    transactionIds: ["chapter-01-level-1:level-1-question-1:1:0"]
  });
  assert.equal(JSON.stringify(serialized).includes("Observation 1"), false);

  state = model.hydrate(serialized, chapter);
  assert.equal(state.claimedFixedRewards["level-1-question-1"], true);
  assert.equal(state.attemptSequence, 1);
  assert.equal(state.activeRun.status, "resolved");
});

test("serializes only game state and hydrates malformed storage without invalid data", () => {
  const chapter = createChapter();
  const hydrated = model.hydrate(JSON.stringify({
    activeChapterId: "wrong-chapter",
    unlockedLevelIds: ["chapter-01-level-2", "missing-level"],
    levelRecords: {
      "chapter-01-level-2": { starCount: 3 },
      "missing-level": { starCount: 3 }
    },
    inventory: { diamond: -2, "oak-log": 1, missing: 4 },
    activeRun: { levelId: "missing-level", questionIndex: 0 },
    unknown: "discarded"
  }), chapter);

  assert.equal(hydrated.inventory.diamond || 0, 0);
  assert.equal(hydrated.inventory["oak-log"], 1);
  assert.equal(hydrated.inventory.missing, undefined);
  assert.deepEqual(hydrated.unlockedLevelIds, ["chapter-01-level-1", "chapter-01-level-2"]);
  assert.deepEqual(hydrated.levelRecords, { "chapter-01-level-2": { starCount: 3 } });
  assert.equal(hydrated.activeRun, null);
  assert.equal(Object.hasOwn(JSON.parse(model.serialize(hydrated)), "unknown"), false);
  assert.equal(model.hydrate("not JSON", chapter).activeRun, null);
});

test("hydration rejects locked active runs, reconciles stars, and keeps release-disabled extensions disabled", () => {
  const chapter = createChapter();
  const hydrated = model.hydrate(JSON.stringify({
    activeChapterId: "chapter-01",
    unlockedLevelIds: ["chapter-01-level-1"],
    levelRecords: { "chapter-01-level-1": { starCount: 1 }, "chapter-01-level-2": { starCount: 3 } },
    inventory: { "oak-log": 1 },
    activeRun: {
      levelId: "chapter-01-level-2",
      questionIndex: 0,
      questionId: "level-2-question-1",
      status: "active",
      correctCount: 0,
      skippedCount: 0,
      rewardedQuestionIds: [],
      skippedQuestionIds: []
    },
    lastSettlement: { levelId: "chapter-01-level-1", starCount: 3, correctCount: 0, skippedCount: 10 },
    crafting: { enabled: true, unsupported: "discard" },
    equipment: { enabled: true, slots: { tool: "oak-log", weapon: "oak-log", bad: "missing" } },
    shop: { enabled: true, purchases: { "oak-log-offer": 2, invalid: 0 } }
  }), chapter);

  assert.equal(hydrated.activeRun, null);
  assert.deepEqual(hydrated.levelRecords, { "chapter-01-level-1": { starCount: 1 } });
  assert.deepEqual(model.getSettlement(hydrated), {
    levelId: "chapter-01-level-1",
    starCount: 1,
    correctCount: 0,
    skippedCount: 10,
    earnedItems: [],
    rewardTransactions: []
  });
  assert.deepEqual(hydrated.crafting, { enabled: false });
  assert.deepEqual(hydrated.equipment, { enabled: false, slots: {} });
  assert.deepEqual(hydrated.shop, { enabled: false, purchases: { "oak-log-offer": 2 } });

  const roundTripped = model.hydrate(model.serialize(hydrated), chapter);
  assert.deepEqual(roundTripped.crafting, hydrated.crafting);
  assert.deepEqual(roundTripped.equipment, hydrated.equipment);
  assert.deepEqual(roundTripped.shop, hydrated.shop);
});
