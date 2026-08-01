const material = (id, name, rarity, shape, chapterId, affinity) => ({ id, name, category: "craft-material", rarity, icon: { kind: "pixel-svg", palette: ["#4cc9f0", "#b8f2e6"], shape }, stackLimit: 999, craftValue: 8, shopValue: 12, affinity, setKey: `${chapterId}-collection`, equipmentStats: null, equipmentSlots: [], tags: ["craft-material", chapterId] });
const projectItem = (id, name, category, rarity, shape, chapterId, affinity, tag) => ({ id, name, category, rarity, icon: { kind: "pixel-svg", palette: ["#5a7dff", "#f5d06f"], shape }, stackLimit: 1, craftValue: 48, shopValue: 96, affinity, setKey: `${chapterId}-collection`, equipmentStats: null, equipmentSlots: [], tags: [tag, chapterId] });
const missionItem = (id, name, chapterId, affinity) => ({ id, name, category: "mission-collectible", rarity: "rare", icon: { kind: "pixel-svg", palette: ["#f5d06f", "#7c5cff"], shape: "gem" }, stackLimit: 1, craftValue: 0, shopValue: 0, affinity, setKey: `${chapterId}-collection`, equipmentStats: null, equipmentSlots: [], tags: ["mission-collectible", chapterId] });

function createProject(chapterId, prefix, finalId, finalName, materialIds, componentNames, partNames, affinity, description) {
  const componentIds = componentNames.map((name, index) => `${prefix}-${index + 1}`);
  const partIds = partNames.map((name, index) => `${prefix}-part-${index + 1}`);
  const components = componentIds.map((id, index) => projectItem(id, componentNames[index], `${prefix}-component`, index >= 9 ? "epic" : index >= 3 ? "rare" : "uncommon", index % 3 === 0 ? "core" : index % 3 === 1 ? "ring" : "panel", chapterId, affinity, "project-component"));
  const parts = partIds.map((id, index) => projectItem(id, partNames[index], `${prefix}-part`, index >= 2 ? "epic" : "rare", index % 2 ? "engine" : "airframe", chapterId, affinity, "project-part"));
  const finalItem = projectItem(finalId, finalName, "super-project", "mythic", "diamond", chapterId, affinity, "super-project");
  const componentRecipes = componentIds.map((id, index) => ({ id: `craft-${id}`, unlockLevelNumber: index + 1, name: `合成${componentNames[index]}`, inputs: [{ itemId: materialIds[index % materialIds.length], quantity: 2 }], output: { itemId: id, quantity: 1 } }));
  const partRecipes = partIds.map((id, index) => ({ id: `assemble-${id}`, unlockLevelNumber: index * 3 + 3, name: `拼装${partNames[index]}`, inputs: componentIds.slice(index * 3, index * 3 + 3).map((itemId) => ({ itemId, quantity: 1 })), output: { itemId: id, quantity: 1 } }));
  return { items: [...components, ...parts, finalItem], project: { id: finalId, name: finalName, chapterId, description, componentRecipes, partRecipes, finalRecipe: { id: `assemble-${finalId}`, unlockLevelNumber: 12, name: `组装${finalName}`, inputs: partIds.map((itemId) => ({ itemId, quantity: 1 })), output: { itemId: finalId, quantity: 1 } } }, componentIds };
}

const deepMaterials = [
  ["prismarine-shard", "海晶碎片", "common", "gem"], ["nautilus-shell", "鹦鹉螺壳", "uncommon", "core"], ["sponge", "海绵", "common", "stone"], ["ink-sac", "墨囊", "uncommon", "coal"], ["glow-ink-sac", "发光墨囊", "rare", "gem"], ["turtle-scute", "海龟壳", "rare", "panel"], ["clay-ball", "黏土球", "common", "stone"], ["amethyst-shard", "紫水晶碎片", "rare", "diamond"], ["conduit-core", "潮涌核心", "legendary", "core"], ["coral-fan", "珊瑚扇", "uncommon", "gem"], ["heart-of-the-sea", "海洋之心", "epic", "core"]
];
const orbitMaterials = [
  ["quartz", "石英", "common", "gem"], ["glowstone-dust", "荧石粉", "uncommon", "dust"], ["ender-pearl", "末影珍珠", "rare", "emerald"], ["echo-shard", "回响碎片", "rare", "scrap"], ["blaze-rod", "烈焰棒", "uncommon", "ingot"], ["phantom-membrane", "幻翼膜", "rare", "panel"], ["obsidian", "黑曜石", "epic", "stone"], ["nether-star", "下界之星", "legendary", "core"], ["shulker-shell", "潜影壳", "rare", "core"], ["slimeball", "粘液球", "uncommon", "gem"], ["firework-star", "烟花之星", "epic", "diamond"]
];
const deepMaterialItems = deepMaterials.map(([id, name, rarity, shape]) => material(id, name, rarity, shape, "chapter-02", "ocean"));
const orbitMaterialItems = orbitMaterials.map(([id, name, rarity, shape]) => material(id, name, rarity, shape, "chapter-03", "orbit"));
const deepProject = createProject("chapter-02", "sub", "deep-sea-explorer", "深海探测艇", deepMaterials.map(([id]) => id), ["耐压艇骨", "压载舱", "潜航翼", "声呐阵列", "导航陀螺", "探照灯组", "密封环", "取样机械臂", "数据记录仪", "螺旋桨环", "能量导管", "深海核心"], ["耐压艇体", "深海探测系统", "推进控制模块", "海洋研究舱"], "ocean", "收集深海材料，合成 12 个探测组件，拼装四大舱段，最终组装深海探测艇。");
const orbitProject = createProject("chapter-03", "station", "orbital-science-station", "轨道科学站", orbitMaterials.map(([id]) => id), ["空间桁架", "太阳能电池", "散热面板", "星敏传感器", "通信阵列", "导航陀螺", "实验控制台", "观测窗", "对接环", "轨道推进器", "能量总线", "轨道核心"], ["空间站框架", "通信导航舱", "科学实验舱", "轨道动力模块"], "orbit", "收集轨道材料，合成 12 个空间组件，拼装四大模块，最终组装轨道科学站。");

const chapterMissions = (chapterId, names, affinity) => names.map((name, index) => missionItem(`${chapterId}-mission-${index + 1}`, name, chapterId, affinity));
const deepMissionItems = chapterMissions("chapter-02", ["深海启航徽章", "耐压舱蓝图", "三星探测记录", "十连胜潮汐徽记", "深海艇完工纪念"], "ocean");
const orbitMissionItems = chapterMissions("chapter-03", ["轨道启航徽章", "空间桁架蓝图", "三星观测记录", "十连胜星轨徽记", "科学站完工纪念"], "orbit");
const polarMaterials = [["ice-crystal-shard","冰晶碎片","common","gem"],["cold-iron-ingot","寒铁锭","uncommon","ingot"],["aurora-core","极光能源芯","rare","core"],["thermal-alloy","耐寒合金","uncommon","ingot"],["polar-quartz","极地石英","common","gem"],["compass-core","磁针核心","rare","core"],["icebreaker-plate","破冰钢板","uncommon","panel"],["insulation-fiber","保温纤维","common","panel"],["deep-sea-battery","深海电池","rare","core"],["snow-beacon","雪原信标","rare","gem"],["aurora-prism","极光棱镜","epic","diamond"]];
const polarMaterialItems = polarMaterials.map(([id,name,rarity,shape]) => material(id,name,rarity,shape,"chapter-04","polar"));
const polarProject = createProject("chapter-04","icebreaker","polar-icebreaker","大型冰原破冰船",polarMaterials.map(([id])=>id),["船艏冰刃","耐压龙骨","极地舷窗","导航陀螺","声呐阵列","破冰推进器","热能导管","甲板起重机","冰层雷达","极光天线","燃料分配器","破冰核心"],["破冰船体","极地动力系统","导航雷达模块","极地研究舱"],"polar","收集极地材料，合成组件与大型部件，最终组装大型冰原破冰船。");
const polarMissionItems = chapterMissions("chapter-04",["极地启航徽章","冰层勘测图","三星极光记录","十连胜雪原徽记","破冰船完工纪念章"],"polar");
const armorMaterials = [["carbon-titanium-plate","碳钛复合板","common","panel"],["nano-ceramic-chip","纳米陶瓷片","uncommon","gem"],["quantum-armor-fiber","量子装甲纤维","rare","panel"],["reactive-armor-unit","反应装甲单元","rare","core"],["thermal-imaging-chip","热成像晶片","uncommon","gem"],["pulse-circuit","脉冲电路","uncommon","dust"],["maglev-track-link","磁悬履带节","rare","ingot"],["coolant-gel","冷却凝胶","common","gem"],["plasma-energy-core","等离子能量芯","epic","core"],["tactical-data-core","战术数据芯","rare","core"],["fusion-drive-rod","聚变驱动棒","legendary","ingot"]];
const armorMaterialItems = armorMaterials.map(([id,name,rarity,shape]) => material(id,name,rarity,shape,"chapter-05","armor"));
const armorProject = createProject("chapter-05","tank","99a-main-battle-tank","99A 主战坦克",armorMaterials.map(([id])=>id),["主动防护阵列","复合装甲模块","数字火控核心","炮塔稳定框架","热成像组件","脉冲通信器","智能履带模块","矢量动力总成","低温散热装置","动力分配器","战术联控模块","装甲工程核心"],["重型装甲车体","智能火控炮塔","全地形动力平台","战术感知指挥模块"],"armor","收集科幻装甲材料，合成 12 个工程组件与 4 个大型部件，最终组装 99A 主战坦克。");
const armorMissionItems = chapterMissions("chapter-05",["装甲启程徽章","合金车体蓝图","三星战术记录","十连胜突击徽记","99A 竣工纪念章"],"armor");

const makeRewardPlans = (ids) => [
  { type: "fixed", label: "固定奖励", rewards: [{ itemId: ids[0], quantity: 1 }] },
  { type: "fixed", label: "固定奖励", rewards: [{ itemId: ids[1], quantity: 1 }] },
  { type: "random", label: "随机奖励", pool: [{ itemId: ids[2], quantity: 1, weight: 2 }, { itemId: ids[0], quantity: 1, weight: 1 }] },
  { type: "fixed", label: "固定奖励", rewards: [{ itemId: ids[3], quantity: 1 }] },
  { type: "random", label: "随机奖励", pool: [{ itemId: ids[4], quantity: 1, weight: 2 }, { itemId: ids[3], quantity: 1, weight: 1 }] },
  { type: "fixed", label: "固定奖励", rewards: [{ itemId: ids[5], quantity: 1 }] },
  { type: "random", label: "随机奖励", pool: [{ itemId: ids[6], quantity: 1, weight: 2 }, { itemId: ids[5], quantity: 1, weight: 1 }] },
  { type: "fixed", label: "固定奖励", rewards: [{ itemId: ids[7], quantity: 1 }] },
  { type: "random", label: "随机奖励", pool: [{ itemId: ids[8], quantity: 1, weight: 2 }, { itemId: ids[7], quantity: 1, weight: 1 }] },
  { type: "fixed", label: "固定奖励", rewards: [{ itemId: ids[10], quantity: 1 }] }
];
const makeBonusPool = (ids) => [{ itemId: ids[0], rarity: "common", minDifficulty: "进阶", weight: 8, purpose: "collection" }, { itemId: ids[3], rarity: "uncommon", minDifficulty: "进阶", weight: 6, purpose: "collection" }, { itemId: ids[7], rarity: "rare", minDifficulty: "提高", weight: 3, purpose: "collection" }, { itemId: ids[10], rarity: "epic", minDifficulty: "挑战", weight: 1, purpose: "collection" }];

const missionDefinitions = (chapterId, project) => Object.freeze([
  { id: `${chapterId}-mission-1`, trigger: "levels-cleared", value: 3, reward: { itemId: `${chapterId}-mission-1`, quantity: 1 } },
  { id: `${chapterId}-mission-2`, trigger: "part-crafted", value: 1, reward: { itemId: `${chapterId}-mission-2`, quantity: 1 } },
  { id: `${chapterId}-mission-3`, trigger: "three-star-levels", value: 3, reward: { itemId: `${chapterId}-mission-3`, quantity: 1 } },
  { id: `${chapterId}-mission-4`, trigger: "streak", value: 10, reward: { itemId: `${chapterId}-mission-4`, quantity: 1 } },
  { id: `${chapterId}-mission-5`, trigger: "project-crafted", value: 1, reward: { itemId: `${chapterId}-mission-5`, quantity: 1, projectId: project.id } }
]);

const DEEP_IDS = deepMaterials.map(([id]) => id);
const ORBIT_IDS = orbitMaterials.map(([id]) => id);
const ARMOR_IDS = armorMaterials.map(([id]) => id);
module.exports = {
  ITEMS: Object.freeze([...deepMaterialItems, ...deepProject.items, ...deepMissionItems, ...orbitMaterialItems, ...orbitProject.items, ...orbitMissionItems, ...polarMaterialItems, ...polarProject.items, ...polarMissionItems, ...armorMaterialItems, ...armorProject.items, ...armorMissionItems]),
  CHAPTER_THEMES: Object.freeze({
    "chapter-02": { id: "chapter-02", rewardCategory: "deep-sea-materials", rewardPool: DEEP_IDS, affinity: "ocean", setKey: "chapter-02-collection", rewardPlans: makeRewardPlans(DEEP_IDS), bonusPool: makeBonusPool(DEEP_IDS), streakItemId: "prismarine-shard" },
    "chapter-03": { id: "chapter-03", rewardCategory: "orbital-materials", rewardPool: ORBIT_IDS, affinity: "orbit", setKey: "chapter-03-collection", rewardPlans: makeRewardPlans(ORBIT_IDS), bonusPool: makeBonusPool(ORBIT_IDS), streakItemId: "quartz" },
    "chapter-04": { id: "chapter-04", rewardCategory: "polar-materials", rewardPool: polarMaterials.map(([id])=>id), affinity: "polar", setKey: "chapter-04-collection", rewardPlans: makeRewardPlans(polarMaterials.map(([id])=>id)), bonusPool: makeBonusPool(polarMaterials.map(([id])=>id)), streakItemId: "ice-crystal-shard" },
    "chapter-05": { id: "chapter-05", rewardCategory: "armored-materials", rewardPool: ARMOR_IDS, affinity: "armor", setKey: "chapter-05-collection", rewardPlans: makeRewardPlans(ARMOR_IDS), bonusPool: makeBonusPool(ARMOR_IDS), streakItemId: "carbon-titanium-plate" }
  }),
  SUPER_PROJECTS: Object.freeze({ "chapter-02": deepProject.project, "chapter-03": orbitProject.project, "chapter-04": polarProject.project, "chapter-05": armorProject.project }),
  MISSION_DEFINITIONS: Object.freeze({ "chapter-02": missionDefinitions("chapter-02", deepProject.project), "chapter-03": missionDefinitions("chapter-03", orbitProject.project), "chapter-04": missionDefinitions("chapter-04", polarProject.project), "chapter-05": missionDefinitions("chapter-05", armorProject.project) })
};
