const GameItemCatalog = require("./itemCatalog.js");
const { CHAPTER_IDS, FIRST_CHAPTER_ID } = require("./chapterConfig.js");
const MaterialProcessingData = require("./materialProcessingData.js");

function createRepeatedRewards(questionSlotItems) {
  return questionSlotItems.map((itemId, index) => ({ questionSlot: index + 1, itemId, quantity: 1 }));
}

function cloneReward(reward) {
  return { questionSlot: reward.questionSlot, itemId: reward.itemId, quantity: reward.quantity };
}

function cloneRecipe(recipe) {
  return recipe ? {
    id: recipe.id,
    ...(recipe.type ? { type: recipe.type } : {}),
    name: recipe.name,
    inputs: recipe.inputs.map(({ itemId, quantity }) => ({ itemId, quantity })),
    output: { ...recipe.output }
  } : null;
}

function materialPlanForChapter(chapterId, project) {
  const rawIds = MaterialProcessingData.getRewardMaterialIds(chapterId);
  if (rawIds.length !== project.materialRecipes.length) {
    throw new Error(`${chapterId} raw reward ledger must have one source per material recipe`);
  }
  return rawIds.map((itemId) => Array.from({ length: 10 }, () => itemId));
}

function createConfigs() {
  return Object.freeze(CHAPTER_IDS.flatMap((chapterId) => {
    const project = GameItemCatalog.getSuperProject(chapterId);
    if (!project || project.componentRecipes.length !== 12 || project.partRecipes.length !== 4) {
      throw new Error(`${chapterId} project recipes are incomplete`);
    }
    const materials = materialPlanForChapter(chapterId, project);
    return project.componentRecipes.map((componentRecipe, index) => {
      const stageIndex = Math.floor(index / 3);
      const stageRecipe = project.partRecipes[stageIndex];
      return Object.freeze({
        chapterId,
        levelId: `${chapterId}-level-${index + 1}`,
        componentId: componentRecipe.output.itemId,
        materialRecipe: cloneRecipe(project.materialRecipes[index]),
        componentRecipe: cloneRecipe(componentRecipe),
        fixedRewards: Object.freeze(createRepeatedRewards(materials[index]).map((reward) => Object.freeze(reward))),
        stagePartId: stageRecipe.output.itemId,
        stageRecipe: cloneRecipe(stageRecipe)
      });
    });
  }));
}

const CONFIGS = createConfigs();
const CONFIG_BY_LEVEL_ID = Object.freeze(Object.fromEntries(CONFIGS.map((config) => [config.levelId, config])));

function getLevelRewardConfig(levelId) {
  const config = CONFIG_BY_LEVEL_ID[levelId];
  if (!config) return null;
  return {
    ...config,
    fixedRewards: config.fixedRewards.map(cloneReward),
    materialRecipe: cloneRecipe(config.materialRecipe),
    componentRecipe: cloneRecipe(config.componentRecipe),
    stageRecipe: cloneRecipe(config.stageRecipe)
  };
}

function getRewardTrack(levelId) {
  const config = CONFIG_BY_LEVEL_ID[levelId];
  if (!config) return null;
  const bonusPool = GameItemCatalog.getBonusRewardPool(config.chapterId);
  return {
    chapterId: config.chapterId,
    levelId: config.levelId,
    componentId: config.componentId,
    stagePartId: config.stagePartId,
    materialRecipe: cloneRecipe(config.materialRecipe),
    componentRecipe: cloneRecipe(config.componentRecipe),
    stageRecipe: cloneRecipe(config.stageRecipe),
    rewardChain: {
      rawItemId: config.fixedRewards[0]?.itemId,
      materialItemId: config.materialRecipe?.output.itemId,
      componentItemId: config.componentRecipe?.output.itemId,
      partItemId: config.stagePartId
    },
    bonusPool: bonusPool.map((reward) => ({ ...reward })),
    streakItemId: GameItemCatalog.getStreakRewardItem(config.chapterId),
    questionSlots: config.fixedRewards.map((fixedReward) => ({
      questionSlot: fixedReward.questionSlot,
      fixedReward: cloneReward(fixedReward),
      bonusPool: bonusPool.map((reward) => ({ ...reward })),
      streakItemId: GameItemCatalog.getStreakRewardItem(config.chapterId)
    }))
  };
}

function getQuestionRewardTrack(levelId, questionSlot) {
  const track = getRewardTrack(levelId);
  if (!track || !Number.isInteger(questionSlot)) return null;
  const entry = track.questionSlots.find((slot) => slot.questionSlot === questionSlot);
  return entry ? { ...entry, rewardChain: { ...track.rewardChain } } : null;
}

function listLevelIds(chapterId) {
  return CONFIGS.filter((config) => config.chapterId === chapterId).map((config) => config.levelId);
}

function addToInventory(inventory, itemId, quantity) {
  inventory[itemId] = (inventory[itemId] || 0) + quantity;
}

function craft(inventory, recipe, errors) {
  const missing = recipe.inputs.filter(({ itemId, quantity }) => (inventory[itemId] || 0) < quantity);
  if (missing.length) {
    errors.push(`${recipe.id} 缺少 ${missing.map(({ itemId, quantity }) => `${itemId}×${quantity}`).join("、")}`);
    return false;
  }
  recipe.inputs.forEach(({ itemId, quantity }) => { inventory[itemId] -= quantity; });
  addToInventory(inventory, recipe.output.itemId, recipe.output.quantity);
  return true;
}

function simulateFullClearCraft(chapterId) {
  const errors = [];
  const inventory = {};
  const configs = CONFIGS.filter((config) => config.chapterId === chapterId);
  const project = GameItemCatalog.getSuperProject(chapterId);
  if (!project) return { ok: false, canCraftFinal: false, usedOnlyFixedRewards: true, inventory, errors: [`缺少章节项目：${chapterId}`] };

  configs.forEach((config) => config.fixedRewards.forEach(({ itemId, quantity }) => addToInventory(inventory, itemId, quantity)));
  project.materialRecipes.forEach((recipe) => craft(inventory, recipe, errors));
  const processingComplete = errors.length === 0;
  project.componentRecipes.forEach((recipe) => craft(inventory, recipe, errors));
  project.partRecipes.forEach((recipe) => craft(inventory, recipe, errors));
  const canCraftFinal = craft(inventory, project.finalRecipe, errors);
  return {
    ok: errors.length === 0 && canCraftFinal,
    canCraftFinal,
    processingComplete,
    usedOnlyFixedRewards: true,
    inventory: { ...inventory },
    errors
  };
}

function validateMainlineEconomy(chapterId = FIRST_CHAPTER_ID) {
  const errors = [];
  const levelIds = listLevelIds(chapterId);
  if (levelIds.length !== 12) errors.push(`预期 12 个关卡配置，实际 ${levelIds.length}`);
  levelIds.forEach((levelId) => {
    const config = CONFIG_BY_LEVEL_ID[levelId];
    const slots = config.fixedRewards.map(({ questionSlot }) => questionSlot);
    if (slots.length !== 10 || slots.some((slot, index) => slot !== index + 1)) errors.push(`${levelId} 的固定奖励题位不完整`);
  });
  errors.push(...validateRewardAssemblyAlignment(chapterId).errors);
  const simulation = simulateFullClearCraft(chapterId);
  errors.push(...simulation.errors);
  return { ok: errors.length === 0, errors, simulation };
}

function validateRewardAssemblyAlignment(chapterId) {
  const errors = [];
  const project = GameItemCatalog.getSuperProject(chapterId);
  const rows = listLevelIds(chapterId).map((levelId) => CONFIG_BY_LEVEL_ID[levelId]);
  if (!project || rows.length !== 12) {
    return { ok: false, errors: [`${chapterId} reward chain requires a 12-level project`] };
  }

  rows.forEach((row, index) => {
    const fixedIds = new Set(row.fixedRewards.map((reward) => reward.itemId));
    const rawInputId = row.materialRecipe?.inputs?.[0]?.itemId;
    if (fixedIds.size !== 1 || !fixedIds.has(rawInputId)) {
      errors.push(`${row.levelId} fixed reward must match ${rawInputId || "material input"}`);
    }
    if (row.componentRecipe?.inputs?.[0]?.itemId !== row.materialRecipe?.output?.itemId) {
      errors.push(`${row.levelId} refined material must feed its component`);
    }
    if (!row.stageRecipe?.inputs?.some(({ itemId }) => itemId === row.componentRecipe?.output?.itemId)) {
      errors.push(`${row.levelId} component must feed ${row.stagePartId || "its stage part"}`);
    }
    if (index === 0 && row.fixedRewards[0]?.itemId === rows.at(-1)?.fixedRewards[0]?.itemId) {
      errors.push(`${chapterId} final raw source must not repeat the first raw source`);
    }
  });

  const partIds = new Set(project.partRecipes.map((recipe) => recipe.output.itemId));
  const finalInputs = new Set(project.finalRecipe.inputs.map(({ itemId }) => itemId));
  partIds.forEach((partId) => {
    if (!finalInputs.has(partId)) errors.push(`${chapterId} final recipe is missing ${partId}`);
  });
  return { ok: errors.length === 0, errors };
}

module.exports = {
  FIRST_CHAPTER_ID,
  getLevelRewardConfig,
  getRewardTrack,
  getQuestionRewardTrack,
  listLevelIds,
  simulateFullClearCraft,
  validateMainlineEconomy,
  validateRewardAssemblyAlignment
};
