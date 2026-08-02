const MATERIAL_LAYERS = Object.freeze({
  "chapter-01": {
    rawIds: ["oak-log", "cobblestone", "coal", "redstone-dust", "iron-ingot", "lapis-lazuli", "emerald", "gold-ingot", "diamond", "netherite-scrap", "diamond", "diamond"],
    refined: [
      ["j20-processed-frame-plate", "机体框架板", "uncommon", "panel"],
      ["j20-structural-steel", "结构钢锭", "uncommon", "ingot"],
      ["j20-carbon-shell", "碳纤蒙皮料", "uncommon", "coal"],
      ["j20-signal-board", "信号电路板", "rare", "dust"],
      ["j20-optical-lens", "光学镜片", "rare", "gem"],
      ["j20-gold-alloy", "金属复合片", "rare", "ingot"],
      ["j20-emerald-conductor", "绿宝石导体", "rare", "emerald"],
      ["j20-diamond-edge", "钻石边缘件", "epic", "diamond"],
      ["j20-netherite-composite", "下界合金复材", "epic", "scrap"],
      ["j20-turbine-alloy", "涡轮合金", "legendary", "ingot"],
      ["j20-energy-crystal", "能量晶体", "legendary", "core"],
      ["j20-expedition-alloy", "远征特种合金", "legendary", "core"]
    ]
  },
  "chapter-02": {
    rawIds: ["prismarine-shard", "nautilus-shell", "sponge", "ink-sac", "glow-ink-sac", "turtle-scute", "clay-ball", "amethyst-shard", "conduit-core", "coral-fan", "heart-of-the-sea", "prismarine-shard"],
    refined: [
      ["sub-pressure-steel", "耐压钢板", "uncommon", "panel"],
      ["sub-ballast-ceramic", "压载陶瓷", "uncommon", "stone"],
      ["sub-wing-composite", "潜航复合材", "rare", "panel"],
      ["sub-sonar-crystal", "声呐晶片", "rare", "gem"],
      ["sub-navigation-gyro", "导航陀螺", "rare", "core"],
      ["sub-searchlight-lens", "探照镜片", "uncommon", "gem"],
      ["sub-seal-ring", "密封环坯", "uncommon", "ring"],
      ["sub-sampling-armature", "取样骨架", "rare", "core"],
      ["sub-data-storage", "深海存储芯", "rare", "core"],
      ["sub-propeller-alloy", "螺旋桨合金", "epic", "ingot"],
      ["sub-energy-conduit", "能量导管", "epic", "core"],
      ["sub-deep-core", "深海核心", "legendary", "core"]
    ]
  },
  "chapter-03": {
    rawIds: ["quartz", "glowstone-dust", "ender-pearl", "echo-shard", "blaze-rod", "phantom-membrane", "obsidian", "nether-star", "shulker-shell", "slimeball", "firework-star", "quartz"],
    refined: [
      ["station-truss-alloy", "桁架合金", "uncommon", "ingot"],
      ["station-solar-cell", "太阳能电池片", "uncommon", "panel"],
      ["station-thermal-panel", "散热面板", "rare", "panel"],
      ["station-star-sensor", "星敏传感器", "rare", "gem"],
      ["station-communication-crystal", "通信晶体", "rare", "gem"],
      ["station-navigation-gyro", "轨道陀螺", "rare", "core"],
      ["station-lab-console", "实验控制台", "uncommon", "core"],
      ["station-observation-lens", "观测镜片", "rare", "gem"],
      ["station-docking-ring", "对接环坯", "rare", "ring"],
      ["station-orbit-thruster", "轨道推进合金", "epic", "ingot"],
      ["station-energy-bus", "能量总线", "epic", "core"],
      ["station-orbit-core", "轨道核心", "legendary", "core"]
    ]
  },
  "chapter-04": {
    rawIds: ["ice-crystal-shard", "cold-iron-ingot", "aurora-core", "thermal-alloy", "polar-quartz", "compass-core", "icebreaker-plate", "insulation-fiber", "deep-sea-battery", "snow-beacon", "aurora-prism", "cold-iron-ingot"],
    refined: [
      ["icebreaker-steel", "破冰钢锭", "uncommon", "ingot"],
      ["icebreaker-keel-core", "龙骨核心", "rare", "core"],
      ["icebreaker-window-glass", "极地舷窗玻璃", "uncommon", "gem"],
      ["icebreaker-navigation-gyro", "极地导航陀螺", "rare", "core"],
      ["icebreaker-sonar-crystal", "冰层声呐晶体", "rare", "gem"],
      ["icebreaker-propulsion-alloy", "破冰推进合金", "rare", "ingot"],
      ["icebreaker-thermal-pipe", "耐寒热管", "uncommon", "ingot"],
      ["icebreaker-crane-frame", "甲板起重骨架", "rare", "panel"],
      ["icebreaker-radar-lens", "冰层雷达镜", "rare", "gem"],
      ["icebreaker-aurora-antenna", "极光天线芯", "epic", "core"],
      ["icebreaker-fuel-bus", "燃料分配总线", "epic", "core"],
      ["icebreaker-ice-core", "破冰核心", "legendary", "core"]
    ]
  },
  "chapter-05": {
    rawIds: ["carbon-titanium-plate", "nano-ceramic-chip", "quantum-armor-fiber", "reactive-armor-unit", "thermal-imaging-chip", "pulse-circuit", "maglev-track-link", "coolant-gel", "plasma-energy-core", "tactical-data-core", "fusion-drive-rod", "carbon-titanium-plate"],
    materialInputs: { 6: [{ itemId: "tank-steel-ingot", quantity: 1 }] },
    materialOutputQuantities: { 0: 2 },
    refined: [
      ["tank-steel-ingot", "装甲钢锭", "uncommon", "ingot"],
      ["tank-armor-ceramic", "装甲陶瓷板", "uncommon", "panel"],
      ["tank-fire-control-chip", "火控芯片", "rare", "gem"],
      ["tank-turret-ring", "炮塔环坯", "rare", "ring"],
      ["tank-thermal-lens", "热成像镜片", "rare", "gem"],
      ["tank-pulse-module", "脉冲模块", "rare", "core"],
      ["tank-track-steel", "履带钢节", "rare", "ingot"],
      ["tank-vector-core", "矢量动力芯", "epic", "core"],
      ["tank-coolant-canister", "冷却凝胶罐", "uncommon", "gem"],
      ["tank-power-bus", "动力总线", "epic", "core"],
      ["tank-tactical-chip", "战术联控芯片", "epic", "gem"],
      ["tank-engineering-alloy", "装甲工程合金", "legendary", "ingot"]
    ]
  },
  "chapter-06": {
    rawIds: ["starlight-crystal", "spectral-glass", "signal-dust", "quantum-sand", "ion-battery", "photon-chip", "nebula-alloy", "gravity-lens", "data-prism", "pulse-core", "cosmic-iron", "cosmic-iron"],
    refined: [
      ["satellite-truss-alloy", "卫星桁架合金", "uncommon", "ingot"],
      ["satellite-solar-film", "太阳能薄膜", "uncommon", "panel"],
      ["satellite-data-board", "数据总线板", "rare", "panel"],
      ["satellite-sensor-lens", "观测传感镜", "rare", "gem"],
      ["satellite-gyro-core", "姿态陀螺核心", "rare", "core"],
      ["satellite-antenna-array", "定向天线阵列", "rare", "core"],
      ["satellite-telemetry-chip", "遥测芯片", "uncommon", "gem"],
      ["satellite-signal-filter", "信号滤波器", "rare", "dust"],
      ["satellite-thermal-shell", "隔热外壳", "uncommon", "panel"],
      ["satellite-orbit-engine", "轨道推进器", "epic", "core"],
      ["satellite-quantum-core", "量子同步核心", "legendary", "core"],
      ["satellite-command-core", "卫星指挥核心", "legendary", "core"]
    ]
  }
});

function createMaterialLayer(chapterId, project) {
  const definition = MATERIAL_LAYERS[chapterId];
  if (!definition || definition.refined.length !== 12) return null;
  const refinedItems = definition.refined.map(([id, name, rarity, shape]) => ({
    id,
    name,
    category: "processed-material",
    rarity,
    icon: { kind: "pixel-svg", palette: ["#f5d06f", "#8ce7ff"], shape },
    stackLimit: 999,
    craftValue: 24,
    shopValue: 42,
    affinity: project?.chapterId === "chapter-05" ? "armor" : project?.chapterId,
    setKey: `${chapterId}-collection`,
    equipmentStats: null,
    equipmentSlots: [],
    tags: ["processed-material", chapterId]
  }));
  const materialRecipes = refinedItems.map((item, index) => ({
    id: `refine-${item.id}`,
    type: "material-processing",
    unlockLevelNumber: index + 1,
    name: `精炼${item.name}`,
    inputs: (definition.materialInputs?.[index] || [{ itemId: definition.rawIds[index], quantity: 3 }]).map((entry) => ({ ...entry })),
    output: { itemId: item.id, quantity: definition.materialOutputQuantities?.[index] || 1 }
  }));
  const componentRecipes = project.componentRecipes.map((recipe, index) => ({
    ...recipe,
    inputs: [{ itemId: refinedItems[index].id, quantity: 1 }]
  }));
  return { refinedItems, materialRecipes, componentRecipes };
}

function getMaterialLayer(chapterId) {
  return MATERIAL_LAYERS[chapterId] || null;
}

module.exports = { MATERIAL_LAYERS, createMaterialLayer, getMaterialLayer };
