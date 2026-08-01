const assert = require("node:assert/strict");
const test = require("node:test");

const economy = require("../game/rewardEconomy.js");

function settlementArgs(overrides = {}) {
  return {
    inventory: {},
    claimedFixedRewards: {},
    pityEnergy: 0,
    streak: 0,
    attemptSettlements: {},
    questionId: "level-1-question-1",
    questionSlot: 1,
    levelId: "chapter-01-level-1",
    difficulty: "基础",
    resolution: "correct",
    attemptId: "attempt-1",
    random: () => 0,
    ...overrides
  };
}

test("a fixed mainline reward is claimed only once per question", () => {
  const first = economy.settleResolution(settlementArgs());
  assert.equal(first.transactions.some((transaction) => transaction.rewardType === "fixed" && transaction.status === "awarded"), true);

  const replay = economy.settleResolution(settlementArgs({
    ...first,
    attemptId: "attempt-2"
  }));
  assert.equal(replay.transactions.some((transaction) => transaction.rewardType === "fixed" && transaction.status === "awarded"), false);
  assert.equal(replay.claimedFixedRewards["level-1-question-1"], true);
});

test("skipping records the attempt, breaks streak, and grants neither fixed nor random loot", () => {
  const result = economy.settleResolution(settlementArgs({
    resolution: "skipped",
    attemptId: "skip-1",
    pityEnergy: 3,
    streak: 2,
    difficulty: "进阶"
  }));

  assert.deepEqual(result.inventory, {});
  assert.equal(result.pityEnergy, 3);
  assert.equal(result.streak, 0);
  assert.deepEqual(result.transactions, []);
  assert.deepEqual(result.attemptSettlements["skip-1"], {
    questionId: "level-1-question-1",
    resolution: "skipped",
    transactionIds: []
  });
});

test("the same attempt identifier is idempotent", () => {
  const first = economy.settleResolution(settlementArgs({ difficulty: "进阶", questionSlot: 3 }));
  const repeat = economy.settleResolution(settlementArgs({
    ...first,
    difficulty: "进阶",
    questionSlot: 3
  }));

  assert.deepEqual(repeat.inventory, first.inventory);
  assert.equal(repeat.transactions.length, 0);
  assert.deepEqual(repeat.attemptSettlements, first.attemptSettlements);
});

test("advanced questions add a non-mainline random bonus without gating fixed rewards", () => {
  const result = economy.settleResolution(settlementArgs({
    questionId: "level-1-question-3",
    questionSlot: 3,
    difficulty: "进阶",
    random: () => 0.99
  }));

  assert.equal(result.transactions.some((transaction) => transaction.rewardType === "fixed"), true);
  assert.equal(result.transactions.some((transaction) => transaction.rewardType === "random"), true);
});
