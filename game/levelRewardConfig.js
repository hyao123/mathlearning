const GameItemCatalog = require("./itemCatalog.js");
const { CHAPTER_IDS, FIRST_CHAPTER_ID } = require("./chapterConfig.js");

function createRepeatedRewards(questionSlotItems) {
  return questionSlotItems.map((itemId, index) => ({ questionSlot: index + 1, itemId, quantity: 1 }));
}

const CHAPTER_ONE_FIXED_MATERIALS = Object.freeze([
  ["oak-log", "oak-log", "oak-log", "oak-log", "oak-log", "oak-log", "oak-log", "oak-log", "oak-log", "oak-log"],
  ["cobblestone", "cobblestone", "cobblestone", "cobblestone", "cobblestone", "cobblestone", "cobblestone", "cobblestone", "cobblestone", "cobblestone"],
  ["coal", "coal", "coal", "coal", "coal", "coal", "coal", "coal", "coal", "coal"],
  ["redstone-dust", "redstone-dust", "redstone-dust", "redstone-dust", "redstone-dust", "redstone-dust", "redstone-dust", "redstone-dust", "redstone-dust", "redstone-dust"],
  ["iron-ingot", "iron-ingot", "iron-ingot", "iron-ingot", "iron-ingot", "iron-ingot", "iron-ingot", "iron-ingot", "iron-ingot", "iron-ingot"],
  ["lapis-lazuli", "lapis-lazuli", "lapis-lazuli", "lapis-lazuli", "lapis-lazuli", "lapis-lazuli", "lapis-lazuli", "lapis-lazuli", "lapis-lazuli", "lapis-lazuli"],
  ["emerald", "lapis-lazuli", "emerald", "lapis-lazuli", "emerald", "lapis-lazuli", "emerald", "lapis-lazuli", "emerald", "lapis-lazuli"],
  ["gold-ingot", "iron-ingot", "gold-ingot", "iron-ingot", "gold-ingot", "iron-ingot", "gold-ingot", "iron-ingot", "gold-ingot", "iron-ingot"],
  ["diamond", "diamond", "diamond", "diamond", "diamond", "diamond", "diamond", "diamond", "diamond", "diamond"],
  ["netherite-scrap", "netherite-scrap", "netherite-scrap", "netherite-scrap", "netherite-scrap", "netherite-scrap", "netherite-scrap", "netherite-scrap", "netherite-scrap", "netherite-scrap"],
  ["diamond", "redstone-dust", "diamond", "redstone-dust", "diamond", "redstone-dust", "diamond", "redstone-dust", "diamond", "redstone-dust"],
  ["expedition-core", "expedition-core", "expedition-core", "expedition-core", "expedition-core", "expedition-core", "expedition-core", "expedition-core", "expedition-core", "expedition-core"]
]);

function cloneReward(reward) {
  return { questionSlot: reward.questionSlot, itemId: reward.itemId, quantity: reward.quantity };
}

function cloneRecipe(recipe) {
  return recipe ? {
    id: recipe.id,
    name: recipe.name,
    inputs: recipe.inputs.map(({ itemId, quantity }) => ({ itemId, quantity })),
    output: { ...recipe.output }
  } : null;
}

function materialPlanForChapter(chapterId, project) {
  if (chapterId === FIRST_CHAPTER_ID) return CHAPTER_ONE_FIXED_MATERIALS;
  return project.componentRecipes.map((recipe) => Array.from({ length: 10 }, () => recipe.inputs[0].itemId));
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
    componentRecipe: cloneRecipe(config.componentRecipe),
    stageRecipe: cloneRecipe(config.stageRecipe)
  };
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
  project.componentRecipes.forEach((recipe) => craft(inventory, recipe, errors));
  project.partRecipes.forEach((recipe) => craft(inventory, recipe, errors));
  const canCraftFinal = craft(inventory, project.finalRecipe, errors);
  return {
    ok: errors.length === 0 && canCraftFinal,
    canCraftFinal,
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
  const simulation = simulateFullClearCraft(chapterId);
  errors.push(...simulation.errors);
  return { ok: errors.length === 0, errors, simulation };
}

module.exports = {
  FIRST_CHAPTER_ID,
  getLevelRewardConfig,
  listLevelIds,
  simulateFullClearCraft,
  validateMainlineEconomy
};
