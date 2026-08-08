const DIFFICULTY_SLOTS = Object.freeze(["基础", "基础", "进阶", "进阶", "进阶", "提高", "提高", "提高", "挑战", "挑战"]);
const FEATURE_FLAGS = Object.freeze({ crafting: false, shop: false, equipment: false });
const FIRST_CHAPTER_ID = "chapter-01";
const SECOND_CHAPTER_ID = "chapter-02";
const THIRD_CHAPTER_ID = "chapter-03";
const FOURTH_CHAPTER_ID = "chapter-04";
const FIFTH_CHAPTER_ID = "chapter-05";
const SIXTH_CHAPTER_ID = "chapter-06";
const SEVENTH_CHAPTER_ID = "chapter-07";
const EIGHTH_CHAPTER_ID = "chapter-08";
const NINTH_CHAPTER_ID = "chapter-09";

function createLevels(chapterId, moduleIds) {
  return Object.freeze(moduleIds.map((moduleId, index) => Object.freeze({
    id: `${chapterId}-level-${index + 1}`,
    moduleId,
    rewardSlots: Object.freeze(Array.from({ length: 10 }, (_, slotIndex) => slotIndex))
  })));
}

const CHAPTERS = Object.freeze({
  [FIRST_CHAPTER_ID]: {
    id: FIRST_CHAPTER_ID,
    name: "启程试炼",
    rewardTheme: "expedition-materials",
    prerequisiteChapterId: null,
    projectId: "j20-sky-fighter",
    levels: createLevels(FIRST_CHAPTER_ID, [
      "patterns", "quick-calculation", "arithmetic-series", "periodicity", "enumeration", "add-multiply-principle",
      "inclusion-exclusion", "sum-diff", "unit-rate", "surplus-deficit", "chicken-rabbit", "average"
    ])
  },
  [SECOND_CHAPTER_ID]: {
    id: SECOND_CHAPTER_ID,
    name: "深海探测行动",
    rewardTheme: "deep-sea-materials",
    prerequisiteChapterId: FIRST_CHAPTER_ID,
    projectId: "deep-sea-explorer",
    levels: createLevels(SECOND_CHAPTER_ID, [
      "pigeonhole-principle", "counting-transfer", "motion", "engineering", "train-bridge", "age",
      "efficiency-transfer", "tree-planting", "geometry", "logic", "geometry-counting", "parity-divisibility"
    ])
  },
  [THIRD_CHAPTER_ID]: {
    id: THIRD_CHAPTER_ID,
    name: "轨道科学计划",
    rewardTheme: "orbital-materials",
    prerequisiteChapterId: SECOND_CHAPTER_ID,
    projectId: "orbital-science-station",
    levels: createLevels(THIRD_CHAPTER_ID, [
      "factors-multiples", "ratio-proportion", "pigeonhole-intro", "recurrence-intro", "plan-design", "square-array",
      "tiered-pricing", "prime-factorization", "case-analysis-intro", "work-problems", "unitary-method", "restoration-problems"
    ])
  },
  [FOURTH_CHAPTER_ID]: {
    id: FOURTH_CHAPTER_ID,
    name: "极地破冰远征",
    rewardTheme: "polar-materials",
    prerequisiteChapterId: THIRD_CHAPTER_ID,
    projectId: "polar-icebreaker",
    levels: createLevels(FOURTH_CHAPTER_ID, [
      "angles", "triangles", "quadrilaterals", "perimeter", "area", "composite-figures",
      "area-units", "volume", "capacity", "surface-area", "scale", "coordinates-routes"
    ])
  },
  [FIFTH_CHAPTER_ID]: {
    id: FIFTH_CHAPTER_ID,
    name: "装甲突击演练",
    rewardTheme: "armored-materials",
    prerequisiteChapterId: FOURTH_CHAPTER_ID,
    projectId: "99a-main-battle-tank",
    levels: createLevels(FIFTH_CHAPTER_ID, [
      "algebraic-expressions", "equations-unknowns", "linear-equations", "equation-applications",
      "fraction-modeling", "decimal-modeling", "percent-basics", "discount-tax", "profit-loss-modeling",
      "concentration-configuration", "savings-interest", "supply-integration"
    ])
  },
  [SIXTH_CHAPTER_ID]: {
    id: SIXTH_CHAPTER_ID,
    name: "星海数据与概率远征",
    rewardTheme: "quantum-materials",
    prerequisiteChapterId: FIFTH_CHAPTER_ID,
    projectId: "quantum-communication-satellite",
    levels: createLevels(SIXTH_CHAPTER_ID, [
      "data-collection", "frequency-tables", "bar-charts", "line-charts", "mean", "median-mode",
      "data-range", "possibility-basics", "probability-fractions", "tree-counting", "data-inference", "statistics-probability-boss"
    ])
  },
  [SEVENTH_CHAPTER_ID]: {
    id: SEVENTH_CHAPTER_ID,
    name: "思维工具工坊",
    rewardTheme: "math-tools-materials",
    prerequisiteChapterId: SIXTH_CHAPTER_ID,
    projectId: "math-explorer-rover",
    levels: createLevels(SEVENTH_CHAPTER_ID, [
      "read-conditions", "draw-bar-model", "diagram-model", "table-method", "enumeration-method", "tree-diagram",
      "assumption-method", "reverse-thinking", "transformation-method", "unit-method", "estimation-method", "verify-eliminate"
    ])
  },
  [EIGHTH_CHAPTER_ID]: {
    id: EIGHTH_CHAPTER_ID,
    name: "逻辑策略指挥部",
    rewardTheme: "strategy-materials",
    prerequisiteChapterId: SEVENTH_CHAPTER_ID,
    projectId: "deep-space-navigation-ship",
    levels: createLevels(EIGHTH_CHAPTER_ID, [
      "case-discussion", "parity-invariant", "worst-case", "recurrence-strategy", "reverse-reasoning", "elimination-table",
      "scheduling", "shortest-path", "optimal-strategy", "construction", "contradiction", "integrated-strategy"
    ])
  },
  [NINTH_CHAPTER_ID]: {
    id: NINTH_CHAPTER_ID,
    name: "综合建模竞赛场",
    rewardTheme: "smart-city-materials",
    prerequisiteChapterId: EIGHTH_CHAPTER_ID,
    projectId: "smart-city-hub",
    levels: createLevels(NINTH_CHAPTER_ID, [
      "decompose-conditions", "equation-model", "ratio-model", "change-model", "data-decision", "probability-risk",
      "geometry-decomposition", "motion-model", "compare-plans", "optimization", "result-verification", "integrated-modeling"
    ])
  }
});

const CHAPTER_IDS = Object.freeze([FIRST_CHAPTER_ID, SECOND_CHAPTER_ID, THIRD_CHAPTER_ID, FOURTH_CHAPTER_ID, FIFTH_CHAPTER_ID, SIXTH_CHAPTER_ID, SEVENTH_CHAPTER_ID, EIGHTH_CHAPTER_ID, NINTH_CHAPTER_ID]);

module.exports = { CHAPTERS, CHAPTER_IDS, DIFFICULTY_SLOTS, FEATURE_FLAGS, FIRST_CHAPTER_ID, SECOND_CHAPTER_ID, THIRD_CHAPTER_ID, FOURTH_CHAPTER_ID, FIFTH_CHAPTER_ID, SIXTH_CHAPTER_ID, SEVENTH_CHAPTER_ID, EIGHTH_CHAPTER_ID, NINTH_CHAPTER_ID };
