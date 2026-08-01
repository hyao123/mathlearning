const ExpansionData = require("./chapterExpansionData.js");

const freezeItem = (item) => Object.freeze({
  ...item,
  icon: Object.freeze({ ...item.icon, palette: Object.freeze([...item.icon.palette]) }),
  equipmentSlots: Object.freeze([...(item.equipmentSlots || [])]),
  tags: Object.freeze([...item.tags])
});

const BASE_ITEMS = Object.freeze([
  ["oak-log", "橡木原木", "building-material", "common", "log", 999, 1, 2, "nature", ["craft-material", "chapter-01"]],
  ["cobblestone", "圆石", "building-material", "common", "stone", 999, 1, 2, "nature", ["craft-material", "chapter-01"]],
  ["coal", "煤炭", "fuel-material", "common", "coal", 999, 3, 5, "mechanism", ["craft-material", "chapter-01"]],
  ["iron-ingot", "铁锭", "mechanism-material", "uncommon", "ingot", 999, 8, 12, "mechanism", ["craft-material", "chapter-01"]],
  ["redstone-dust", "红石粉", "mechanism-material", "uncommon", "dust", 999, 6, 10, "mechanism", ["craft-material", "chapter-01"]],
  ["lapis-lazuli", "青金石", "trade-material", "uncommon", "gem", 999, 10, 15, "trade", ["trade-material", "chapter-01"]],
  ["gold-ingot", "金锭", "trade-material", "rare", "ingot", 999, 14, 22, "trade", ["craft-material", "chapter-01"]],
  ["emerald", "绿宝石", "trade-material", "rare", "emerald", 999, 20, 30, "trade", ["trade-material", "chapter-01"]],
  ["diamond", "钻石", "gem", "epic", "diamond", 64, 40, 75, "discovery", ["rare-material", "chapter-01"]],
  ["netherite-scrap", "下界合金碎片", "boss-loot", "legendary", "scrap", 64, 80, 140, "expedition", ["boss-loot", "chapter-01"]],
  ["expedition-core", "启程核心", "chapter-relic", "legendary", "core", 1, 0, 200, "expedition", ["chapter-relic", "chapter-01"]],
  ["j20-frame-rib", "机体肋梁", "j20-component", "uncommon", "ingot", 1, 18, 42, "aerospace", ["project-component", "j20", "chapter-01"]],
  ["j20-wing-spar", "翼面梁架", "j20-component", "uncommon", "stone", 1, 18, 42, "aerospace", ["project-component", "j20", "chapter-01"]],
  ["j20-skin-panel", "机体蒙皮", "j20-component", "uncommon", "coal", 1, 18, 42, "aerospace", ["project-component", "j20", "chapter-01"]],
  ["j20-sensor-array", "传感阵列", "j20-component", "rare", "gem", 1, 24, 58, "aerospace", ["project-component", "j20", "chapter-01"]],
  ["j20-flight-computer", "飞控计算机", "j20-component", "rare", "dust", 1, 24, 58, "aerospace", ["project-component", "j20", "chapter-01"]],
  ["j20-radar-dish", "雷达天线", "j20-component", "rare", "emerald", 1, 24, 58, "aerospace", ["project-component", "j20", "chapter-01"]],
  ["j20-absorbing-coat", "吸波涂层", "j20-component", "rare", "gem", 1, 30, 72, "aerospace", ["project-component", "j20", "chapter-01"]],
  ["j20-weapon-rail", "挂载导轨", "j20-component", "rare", "ingot", 1, 30, 72, "aerospace", ["project-component", "j20", "chapter-01"]],
  ["j20-edge-flap", "机翼边条", "j20-component", "rare", "diamond", 1, 30, 72, "aerospace", ["project-component", "j20", "chapter-01"]],
  ["j20-turbine-ring", "涡轮环", "j20-component", "epic", "scrap", 1, 38, 90, "aerospace", ["project-component", "j20", "chapter-01"]],
  ["j20-vector-vane", "矢量喷片", "j20-component", "epic", "diamond", 1, 38, 90, "aerospace", ["project-component", "j20", "chapter-01"]],
  ["j20-energy-bus", "能量总线", "j20-component", "epic", "core", 1, 38, 90, "aerospace", ["project-component", "j20", "chapter-01"]],
  ["j20-airframe", "机身结构部件", "j20-part", "rare", "ingot", 1, 80, 180, "aerospace", ["project-part", "j20", "chapter-01"]],
  ["j20-avionics", "航电雷达部件", "j20-part", "rare", "emerald", 1, 92, 210, "aerospace", ["project-part", "j20", "chapter-01"]],
  ["j20-stealth-wing", "隐身武装部件", "j20-part", "epic", "diamond", 1, 110, 260, "aerospace", ["project-part", "j20", "chapter-01"]],
  ["j20-vector-engine", "矢量动力部件", "j20-part", "legendary", "scrap", 1, 140, 320, "aerospace", ["project-part", "j20", "chapter-01"]],
  ["j20-sky-fighter", "J-20 苍穹战机", "super-project", "mythic", "diamond", 1, 0, 1000, "aerospace", ["super-project", "j20", "chapter-01"]]
].map(([id, name, category, rarity, shape, stackLimit, craftValue, shopValue, affinity, tags]) => freezeItem({
  id,
  name,
  category,
  rarity,
  icon: { kind: "pixel-svg", palette: ["#7c5cff", "#f5d06f"], shape },
  stackLimit,
  craftValue,
  shopValue,
  affinity,
  setKey: "chapter-01-expedition",
  equipmentStats: null,
  equipmentSlots: [],
  tags
})));
const ITEMS = Object.freeze([...BASE_ITEMS, ...ExpansionData.ITEMS.map(freezeItem)]);

const ITEM_BY_ID = Object.freeze(Object.fromEntries(ITEMS.map((item) => [item.id, item])));
const CHAPTER_THEMES = Object.freeze({
  "chapter-01": Object.freeze({
    id: "chapter-01",
    rewardCategory: "expedition-materials",
    rewardPool: Object.freeze(["oak-log", "cobblestone", "coal", "iron-ingot", "redstone-dust", "lapis-lazuli", "gold-ingot", "emerald", "diamond", "netherite-scrap", "expedition-core"]),
    affinity: "expedition",
    setKey: "chapter-01-expedition"
  }),
  ...ExpansionData.CHAPTER_THEMES
});
const freezeReward = (reward) => Object.freeze({
  itemId: reward.itemId,
  quantity: reward.quantity,
  weight: reward.weight
});
const fixedReward = (...itemIds) => Object.freeze({
  type: "fixed",
  label: "固定奖励",
  rewards: Object.freeze(itemIds.map((itemId) => freezeReward({ itemId, quantity: 1 })))
});
const randomReward = (...itemIds) => Object.freeze({
  type: "random",
  label: "随机奖励",
  pool: Object.freeze(itemIds.map((itemId) => freezeReward({ itemId, quantity: 1, weight: 1 })))
});
const REWARD_PLANS = Object.freeze([
  fixedReward("oak-log"),
  fixedReward("cobblestone"),
  randomReward("coal", "oak-log", "cobblestone"),
  fixedReward("iron-ingot"),
  randomReward("redstone-dust", "coal", "iron-ingot"),
  fixedReward("lapis-lazuli"),
  randomReward("gold-ingot", "lapis-lazuli", "emerald"),
  fixedReward("emerald"),
  randomReward("diamond", "gold-ingot", "emerald"),
  fixedReward("netherite-scrap", "expedition-core")
]);
const BONUS_REWARD_POOL = Object.freeze([
  Object.freeze({ itemId: "coal", rarity: "common", minDifficulty: "进阶", weight: 8, purpose: "collection" }),
  Object.freeze({ itemId: "iron-ingot", rarity: "uncommon", minDifficulty: "进阶", weight: 6, purpose: "collection" }),
  Object.freeze({ itemId: "gold-ingot", rarity: "rare", minDifficulty: "提高", weight: 3, purpose: "collection" }),
  Object.freeze({ itemId: "emerald", rarity: "rare", minDifficulty: "提高", weight: 3, purpose: "collection" }),
  Object.freeze({ itemId: "diamond", rarity: "epic", minDifficulty: "挑战", weight: 1, purpose: "collection" })
]);

const freezeRecipe = (recipe) => Object.freeze({
  ...recipe,
  inputs: Object.freeze(recipe.inputs.map(freezeReward)),
  output: freezeReward(recipe.output)
});
const J20_COMPONENT_RECIPES = Object.freeze([
  ["craft-j20-frame-rib", 1, "合成机体肋梁", [{ itemId: "oak-log", quantity: 2 }], { itemId: "j20-frame-rib", quantity: 1 }],
  ["craft-j20-wing-spar", 2, "合成翼面梁架", [{ itemId: "cobblestone", quantity: 2 }], { itemId: "j20-wing-spar", quantity: 1 }],
  ["craft-j20-skin-panel", 3, "合成机体蒙皮", [{ itemId: "coal", quantity: 2 }], { itemId: "j20-skin-panel", quantity: 1 }],
  ["craft-j20-sensor-array", 4, "合成传感阵列", [{ itemId: "redstone-dust", quantity: 2 }], { itemId: "j20-sensor-array", quantity: 1 }],
  ["craft-j20-flight-computer", 5, "合成飞控计算机", [{ itemId: "iron-ingot", quantity: 2 }], { itemId: "j20-flight-computer", quantity: 1 }],
  ["craft-j20-radar-dish", 6, "合成雷达天线", [{ itemId: "lapis-lazuli", quantity: 2 }], { itemId: "j20-radar-dish", quantity: 1 }],
  ["craft-j20-absorbing-coat", 7, "合成吸波涂层", [{ itemId: "emerald", quantity: 1 }, { itemId: "lapis-lazuli", quantity: 1 }], { itemId: "j20-absorbing-coat", quantity: 1 }],
  ["craft-j20-weapon-rail", 8, "合成挂载导轨", [{ itemId: "gold-ingot", quantity: 1 }, { itemId: "iron-ingot", quantity: 1 }], { itemId: "j20-weapon-rail", quantity: 1 }],
  ["craft-j20-edge-flap", 9, "合成机翼边条", [{ itemId: "diamond", quantity: 1 }], { itemId: "j20-edge-flap", quantity: 1 }],
  ["craft-j20-turbine-ring", 10, "合成涡轮环", [{ itemId: "netherite-scrap", quantity: 1 }], { itemId: "j20-turbine-ring", quantity: 1 }],
  ["craft-j20-vector-vane", 11, "合成矢量喷片", [{ itemId: "diamond", quantity: 1 }, { itemId: "redstone-dust", quantity: 1 }], { itemId: "j20-vector-vane", quantity: 1 }],
  ["craft-j20-energy-bus", 12, "合成能量总线", [{ itemId: "expedition-core", quantity: 1 }], { itemId: "j20-energy-bus", quantity: 1 }]
].map(([id, unlockLevelNumber, name, inputs, output]) => freezeRecipe({ id, unlockLevelNumber, name, inputs, output })));
const J20_PART_RECIPES = Object.freeze([
  ["assemble-j20-airframe", 3, "拼装机身结构部件", ["j20-frame-rib", "j20-wing-spar", "j20-skin-panel"], { itemId: "j20-airframe", quantity: 1 }],
  ["assemble-j20-avionics", 6, "拼装航电雷达部件", ["j20-sensor-array", "j20-flight-computer", "j20-radar-dish"], { itemId: "j20-avionics", quantity: 1 }],
  ["assemble-j20-stealth-wing", 9, "拼装隐身武装部件", ["j20-absorbing-coat", "j20-weapon-rail", "j20-edge-flap"], { itemId: "j20-stealth-wing", quantity: 1 }],
  ["assemble-j20-vector-engine", 12, "拼装矢量动力部件", ["j20-turbine-ring", "j20-vector-vane", "j20-energy-bus"], { itemId: "j20-vector-engine", quantity: 1 }]
].map(([id, unlockLevelNumber, name, inputIds, output]) => freezeRecipe({
  id,
  unlockLevelNumber,
  name,
  inputs: inputIds.map((itemId) => ({ itemId, quantity: 1 })),
  output
})));
const J20_FINAL_RECIPE = freezeRecipe({
  id: "assemble-j20-sky-fighter",
  unlockLevelNumber: 12,
  name: "组装 J-20 苍穹战机",
  inputs: J20_PART_RECIPES.map((recipe) => ({ itemId: recipe.output.itemId, quantity: 1 })),
  output: { itemId: "j20-sky-fighter", quantity: 1 }
});
const BASE_SUPER_PROJECTS = Object.freeze({
  "chapter-01": Object.freeze({
    id: "j20-sky-fighter",
    name: "J-20 苍穹战机",
    chapterId: "chapter-01",
    description: "答题收集原材料，先合成 12 个中间组件，再把每 3 个专题组件拼装成大型部件，最终组装一架苍穹战机。",
    componentRecipes: J20_COMPONENT_RECIPES,
    partRecipes: J20_PART_RECIPES,
    finalRecipe: J20_FINAL_RECIPE
  })
});
const SUPER_PROJECTS = Object.freeze({ ...BASE_SUPER_PROJECTS, ...ExpansionData.SUPER_PROJECTS });

const getItem = (itemId) => ITEM_BY_ID[itemId];
const getChapterTheme = (chapterId) => CHAPTER_THEMES[chapterId];
const cloneReward = ({ itemId, quantity, weight }) => ({
  itemId,
  quantity,
  ...(weight === undefined ? {} : { weight })
});
const getRewardPlanForSlot = (chapterId, slotIndex) => {
  if (!CHAPTER_THEMES[chapterId]) return { type: "fixed", label: "固定奖励", rewards: [] };
  const plan = (CHAPTER_THEMES[chapterId].rewardPlans || REWARD_PLANS)[slotIndex];
  if (!plan) return { type: "fixed", label: "固定奖励", rewards: [] };
  if (plan.type === "random") {
    return { type: "random", label: plan.label, pool: plan.pool.map(cloneReward) };
  }
  return { type: "fixed", label: plan.label, rewards: plan.rewards.map(cloneReward) };
};
const getRewardForSlot = (chapterId, slotIndex) => {
  const plan = getRewardPlanForSlot(chapterId, slotIndex);
  return plan.type === "fixed" ? plan.rewards.map(({ itemId, quantity }) => ({ itemId, quantity })) : [];
};
const getRandomRewardPool = (chapterId, slotIndex) => {
  if (!Number.isInteger(slotIndex)) {
    return getBonusRewardPool(chapterId);
  }
  const plan = getRewardPlanForSlot(chapterId, slotIndex);
  return plan.type === "random" ? plan.pool.map(cloneReward) : [];
};
const getBonusRewardPool = (chapterId) => CHAPTER_THEMES[chapterId]
  ? (CHAPTER_THEMES[chapterId].bonusPool || BONUS_REWARD_POOL).map((reward) => ({ ...reward }))
  : [];
const cloneRecipe = (recipe) => ({
  id: recipe.id,
  unlockLevelNumber: recipe.unlockLevelNumber,
  name: recipe.name,
  inputs: recipe.inputs.map(({ itemId, quantity }) => ({ itemId, quantity })),
  output: { itemId: recipe.output.itemId, quantity: recipe.output.quantity }
});
const getSuperProject = (chapterId) => {
  const project = SUPER_PROJECTS[chapterId];
  if (!project) return null;
  return {
    id: project.id,
    name: project.name,
    chapterId: project.chapterId,
    description: project.description,
    componentRecipes: project.componentRecipes.map(cloneRecipe),
    partRecipes: project.partRecipes.map(cloneRecipe),
    finalRecipe: cloneRecipe(project.finalRecipe)
  };
};
const listProjectRecipes = (chapterId) => {
  const project = getSuperProject(chapterId);
  return project ? [...project.componentRecipes, ...project.partRecipes, project.finalRecipe] : [];
};
const normalizeRandomValue = (randomValue) => {
  const value = Number(randomValue);
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), Number.MAX_SAFE_INTEGER) % 1;
};
const rollRewardForSlot = (chapterId, slotIndex, randomValue = Math.random()) => {
  const plan = getRewardPlanForSlot(chapterId, slotIndex);
  if (plan.type === "fixed") {
    return { type: "fixed", rewards: plan.rewards.map(({ itemId, quantity }) => ({ itemId, quantity })) };
  }
  const totalWeight = plan.pool.reduce((sum, reward) => sum + (reward.weight || 1), 0);
  if (totalWeight <= 0) return { type: "random", rewards: [] };
  let cursor = normalizeRandomValue(randomValue) * totalWeight;
  const selected = plan.pool.find((reward) => {
    cursor -= reward.weight || 1;
    return cursor < 0;
  }) || plan.pool.at(-1);
  return { type: "random", rewards: [{ itemId: selected.itemId, quantity: selected.quantity }] };
};
const getChapterMissions = (chapterId) => (ExpansionData.MISSION_DEFINITIONS[chapterId] || []).map((mission) => ({ ...mission, reward: { ...mission.reward } }));
const getStreakRewardItem = (chapterId) => CHAPTER_THEMES[chapterId]?.streakItemId || "coal";
const listItems = () => [...ITEMS];

module.exports = { getItem, getChapterTheme, getSuperProject, getChapterMissions, getStreakRewardItem, listProjectRecipes, getRewardPlanForSlot, getRewardForSlot, getRandomRewardPool, getBonusRewardPool, rollRewardForSlot, listItems };
