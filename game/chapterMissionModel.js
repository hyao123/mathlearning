const GameItemCatalog = require("./itemCatalog.js");
const InventoryModel = require("./inventoryModel.js");

function getMissionProgress(mission, state, inventory, project) {
  const records = Object.values(state?.levelRecords || {});
  if (mission.trigger === "levels-cleared") return records.length;
  if (mission.trigger === "part-crafted") return project.partRecipes.filter((recipe) => (inventory[recipe.output.itemId] || 0) > 0).length;
  if (mission.trigger === "three-star-levels") return records.filter((record) => record.starCount === 3).length;
  if (mission.trigger === "streak") return state?.streak || 0;
  if (mission.trigger === "project-crafted") return (inventory[project.id] || 0) > 0 ? 1 : 0;
  return 0;
}

function getMissionStatus(chapterId, state, inventory) {
  const project = GameItemCatalog.getSuperProject(chapterId);
  const claimed = state?.claimedMissionRewards || {};
  if (!project) return [];
  return GameItemCatalog.getChapterMissions(chapterId).map((mission) => ({
    ...mission,
    progress: getMissionProgress(mission, state, inventory, project),
    claimed: claimed[mission.id] === true
  }));
}

function claimEligibleMissions(chapterId, state) {
  const inventory = { ...(state?.inventory || {}) };
  const claimedMissionRewards = { ...(state?.claimedMissionRewards || {}) };
  const transactions = [];
  getMissionStatus(chapterId, state, inventory).forEach((mission) => {
    if (mission.claimed || mission.progress < mission.value) return;
    const result = InventoryModel.grantItem(inventory, mission.reward.itemId, mission.reward.quantity);
    inventory[mission.reward.itemId] = result.inventory[mission.reward.itemId] || 0;
    claimedMissionRewards[mission.id] = true;
    transactions.push({ missionId: mission.id, rewardType: "mission", ...result.transaction });
  });
  return { inventory, claimedMissionRewards, transactions };
}

module.exports = { getMissionStatus, claimEligibleMissions };
