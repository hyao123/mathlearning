const test = require("node:test");
const assert = require("node:assert/strict");
const AchievementModel = require("../game/achievementModel.js");

test("AchievementModel exports definitions and helper functions", () => {
  assert.equal(Array.isArray(AchievementModel.ACHIEVEMENT_DEFINITIONS), true);
  assert.equal(AchievementModel.ACHIEVEMENT_DEFINITIONS.length, 10);
  assert.equal(typeof AchievementModel.evaluateAchievements, "function");
  assert.equal(typeof AchievementModel.getNewlyUnlockedAchievements, "function");
});

test("AchievementModel starts locked with clean state", () => {
  const customSaved = { unlocked: {}, maxStreak: 0 };
  const state = {
    streak: 0,
    levelRecords: {},
    attemptSettlements: {},
    craftedProjectRecipeIds: {}
  };
  const result = AchievementModel.evaluateAchievements(state, null, customSaved);
  assert.equal(result.unlockCount, 0);
  assert.equal(result.totalPoints, 0);
  assert.equal(result.totalCount, 10);
  assert.equal(result.unlockedIds.length, 0);
});

test("AchievementModel unlocks first_victory on first correct answer", () => {
  const customSaved = { unlocked: {}, maxStreak: 0 };
  const state = {
    streak: 1,
    levelRecords: {
      "level-01": { correctCount: 1, skippedCount: 0 }
    },
    attemptSettlements: {
      "att-1": { resolution: "solved" }
    }
  };
  const result = AchievementModel.evaluateAchievements(state, null, customSaved);
  assert.equal(result.unlockedIds.includes("first_victory"), true);
  assert.equal(result.totalPoints >= 10, true);
  const firstVic = result.list.find((a) => a.id === "first_victory");
  assert.equal(firstVic.unlocked, true);
  assert.equal(firstVic.current, 1);
});

test("AchievementModel unlocks streak milestones at 3, 6, and 10", () => {
  const customSaved = { unlocked: {}, maxStreak: 0 };
  const state = { streak: 3 };
  const res3 = AchievementModel.evaluateAchievements(state, null, customSaved);
  assert.equal(res3.unlockedIds.includes("streak_3"), true);
  assert.equal(res3.unlockedIds.includes("streak_6"), false);

  state.streak = 7;
  const res7 = AchievementModel.evaluateAchievements(state, null, customSaved);
  assert.equal(res7.unlockedIds.includes("streak_3"), true);
  assert.equal(res7.unlockedIds.includes("streak_6"), true);
  assert.equal(res7.unlockedIds.includes("streak_10"), false);

  state.streak = 10;
  const res10 = AchievementModel.evaluateAchievements(state, null, customSaved);
  assert.equal(res10.unlockedIds.includes("streak_10"), true);
  assert.equal(customSaved.maxStreak, 10);
});

test("AchievementModel unlocks first_craft and first_assembly", () => {
  const customSaved = { unlocked: {}, maxStreak: 0 };
  const state = {
    craftedProjectRecipeIds: {
      "recipe-1": true
    }
  };
  const resCraft = AchievementModel.evaluateAchievements(state, null, customSaved);
  assert.equal(resCraft.unlockedIds.includes("first_craft"), true);
  assert.equal(resCraft.unlockedIds.includes("first_assembly"), false);

  state.craftedProjectRecipeIds = {
    "recipe-1": true,
    "recipe-2": true,
    "recipe-3": true,
    "recipe-4": true
  };
  const resAssembly = AchievementModel.evaluateAchievements(state, null, customSaved);
  assert.equal(resAssembly.unlockedIds.includes("first_assembly"), true);
});

test("AchievementModel detects newly unlocked achievements", () => {
  const customSaved = { unlocked: {}, maxStreak: 0 };
  const state = { streak: 3 };
  const res = AchievementModel.evaluateAchievements(state, null, customSaved);
  const newlyUnlocked = AchievementModel.getNewlyUnlockedAchievements([], res);
  assert.equal(newlyUnlocked.some((a) => a.id === "streak_3"), true);

  const secondCheck = AchievementModel.getNewlyUnlockedAchievements(["streak_3"], res);
  assert.equal(secondCheck.some((a) => a.id === "streak_3"), false);
});
