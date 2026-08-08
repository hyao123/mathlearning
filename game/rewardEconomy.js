const GameItemCatalog = require("./itemCatalog.js");
const InventoryModel = require("./inventoryModel.js");
const LevelRewardConfig = require("./levelRewardConfig.js");

const DIFFICULTY_RANK = Object.freeze({ "基础": 1, "练习": 1, "进阶": 2, "提高": 3, "挑战": 4 });
const RARE_RARITIES = new Set(["rare", "epic", "legendary", "mythic"]);
const PITY_THRESHOLD = 5;

function cloneObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
}

function normalizeRandom(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(Math.max(number, 0), Number.MAX_SAFE_INTEGER) % 1;
}

function grantReward(inventory, { itemId, quantity }, rewardType, questionId) {
  const grant = InventoryModel.grantItem(inventory, itemId, quantity);
  return {
    inventory: grant.inventory,
    transaction: {
      questionId,
      rewardType,
      ...grant.transaction
    }
  };
}

function eligibleBonusRewards(pool, difficulty) {
  const rank = DIFFICULTY_RANK[difficulty] || 0;
  return (pool || [])
    .filter((reward) => reward.purpose !== "mainline-required" && (DIFFICULTY_RANK[reward.minDifficulty] || Infinity) <= rank);
}

function rollWeighted(pool, randomValue) {
  const totalWeight = pool.reduce((sum, entry) => sum + (entry.weight || 1), 0);
  if (totalWeight <= 0) return null;
  let cursor = normalizeRandom(randomValue) * totalWeight;
  return pool.find((entry) => {
    cursor -= entry.weight || 1;
    return cursor < 0;
  }) || pool.at(-1);
}

function settleResolution(args) {
  const chapterId = args?.chapterId || LevelRewardConfig.FIRST_CHAPTER_ID;
  const attemptId = args?.attemptId;
  if (typeof attemptId !== "string" || !attemptId) throw new Error("A stable attemptId is required");
  const attemptSettlements = cloneObject(args?.attemptSettlements);
  const inventory = cloneObject(args?.inventory);
  const claimedFixedRewards = cloneObject(args?.claimedFixedRewards);
  const questionId = args?.questionId;
  const resolution = args?.resolution;
  if (typeof questionId !== "string" || !questionId) throw new Error("A questionId is required");
  if (resolution !== "correct" && resolution !== "skipped") throw new Error("Invalid resolution");
  if (attemptSettlements[attemptId]) {
    return {
      inventory,
      claimedFixedRewards,
      pityEnergy: Number.isInteger(args?.pityEnergy) && args.pityEnergy >= 0 ? args.pityEnergy : 0,
      streak: Number.isInteger(args?.streak) && args.streak >= 0 ? args.streak : 0,
      transactions: [],
      attemptSettlements
    };
  }

  const pityEnergy = Number.isInteger(args?.pityEnergy) && args.pityEnergy >= 0 ? args.pityEnergy : 0;
  const streak = Number.isInteger(args?.streak) && args.streak >= 0 ? args.streak : 0;
  const transactions = [];
  if (resolution === "skipped") {
    attemptSettlements[attemptId] = { questionId, resolution, transactionIds: [] };
    return { inventory, claimedFixedRewards, pityEnergy, streak: 0, transactions, attemptSettlements };
  }

  const rewardTrack = LevelRewardConfig.getQuestionRewardTrack(args.levelId, args.questionSlot);
  const fixedReward = rewardTrack?.fixedReward;
  let nextInventory = inventory;
  if (fixedReward && !claimedFixedRewards[questionId]) {
    const result = grantReward(nextInventory, fixedReward, "fixed", questionId);
    nextInventory = result.inventory;
    transactions.push(result.transaction);
    claimedFixedRewards[questionId] = true;
  }

  let nextPityEnergy = pityEnergy;
  const bonusPool = eligibleBonusRewards(rewardTrack?.bonusPool || GameItemCatalog.getBonusRewardPool(chapterId), args.difficulty);
  if (bonusPool.length) {
    const rarePool = bonusPool.filter((reward) => RARE_RARITIES.has(reward.rarity));
    const selected = pityEnergy >= PITY_THRESHOLD - 1 && rarePool.length
      ? rollWeighted(rarePool, typeof args.random === "function" ? args.random() : Math.random())
      : rollWeighted(bonusPool, typeof args.random === "function" ? args.random() : Math.random());
    if (selected) {
      const result = grantReward(nextInventory, { ...selected, quantity: 1 }, "random", questionId);
      nextInventory = result.inventory;
      transactions.push(result.transaction);
      nextPityEnergy = RARE_RARITIES.has(selected.rarity) ? 0 : pityEnergy + 1;
    }
  }

  const nextStreak = streak + 1;
  if (nextStreak % 3 === 0) {
    const chestReward = grantReward(nextInventory, { itemId: rewardTrack?.streakItemId || GameItemCatalog.getStreakRewardItem(chapterId), quantity: 1 }, "streak-chest", questionId);
    nextInventory = chestReward.inventory;
    transactions.push(chestReward.transaction);
  }
  attemptSettlements[attemptId] = { questionId, resolution, transactionIds: transactions.map((_, index) => `${attemptId}:${index}`) };
  return {
    inventory: nextInventory,
    claimedFixedRewards,
    pityEnergy: nextPityEnergy,
    streak: nextStreak,
    transactions,
    attemptSettlements
  };
}

module.exports = {
  DIFFICULTY_RANK,
  PITY_THRESHOLD,
  settleResolution
};
