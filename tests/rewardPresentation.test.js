const assert = require("node:assert/strict");
const test = require("node:test");

const presentation = require("../game/rewardPresentation.js");

const getItem = (itemId) => ({
  "oak-log": { rarity: "common" },
  "iron-ingot": { rarity: "uncommon" },
  emerald: { rarity: "rare" }
}[itemId]);

test("ordinary fixed material rewards use a non-blocking toast", () => {
  const result = presentation.getRewardPresentation([
    { itemId: "oak-log", rewardType: "fixed", status: "awarded", awardedQuantity: 1 }
  ], getItem);
  assert.equal(result.mode, "toast");
  assert.equal(result.hasStreakChest, false);
});

test("random, rare, and streak rewards use a full reveal", () => {
  const random = presentation.getRewardPresentation([
    { itemId: "iron-ingot", rewardType: "random", status: "awarded", awardedQuantity: 1 }
  ], getItem);
  const rare = presentation.getRewardPresentation([
    { itemId: "emerald", rewardType: "fixed", status: "awarded", awardedQuantity: 1 }
  ], getItem);
  const streak = presentation.getRewardPresentation([
    { itemId: "oak-log", rewardType: "streak-chest", status: "awarded", awardedQuantity: 1 }
  ], getItem);
  assert.equal(random.mode, "reveal");
  assert.equal(rare.mode, "reveal");
  assert.equal(streak.mode, "reveal");
  assert.equal(streak.hasStreakChest, true);
});

test("non-awarded transactions are never presented", () => {
  const result = presentation.getRewardPresentation([
    { itemId: "oak-log", rewardType: "fixed", status: "already-owned", awardedQuantity: 0 }
  ], getItem);
  assert.deepEqual(result, { mode: "toast", transactions: [], hasStreakChest: false });
});

test("combines repeated awarded items into one display entry", () => {
  const result = presentation.getRewardPresentation([
    { itemId: "oak-log", rewardType: "fixed", status: "awarded", awardedQuantity: 1 },
    { itemId: "oak-log", rewardType: "random", status: "awarded", awardedQuantity: 2 }
  ], getItem);
  assert.equal(result.transactions.length, 1);
  assert.equal(result.transactions[0].awardedQuantity, 3);
});

test("combines repeated blocked items into one settlement entry", () => {
  const result = presentation.nonAwardedTransactions([
    { itemId: "oak-log", rewardType: "fixed", status: "stack-capped", requestedQuantity: 1, awardedQuantity: 0 },
    { itemId: "oak-log", rewardType: "random", status: "stack-capped", requestedQuantity: 2, awardedQuantity: 0 }
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].requestedQuantity, 3);
  assert.deepEqual(result[0].rewardTypes, ["fixed", "random"]);
});
