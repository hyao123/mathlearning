const DIFFICULTY_SLOTS = Object.freeze(["基础", "基础", "进阶", "进阶", "进阶", "提高", "提高", "提高", "挑战", "挑战"]);
const FEATURE_FLAGS = Object.freeze({ crafting: false, shop: false, equipment: false });
const FIRST_CHAPTER_ID = "chapter-01";
const SECOND_CHAPTER_ID = "chapter-02";
const THIRD_CHAPTER_ID = "chapter-03";
const FOURTH_CHAPTER_ID = "chapter-04";
const FIFTH_CHAPTER_ID = "chapter-05";

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
  }
});

const CHAPTER_IDS = Object.freeze([FIRST_CHAPTER_ID, SECOND_CHAPTER_ID, THIRD_CHAPTER_ID, FOURTH_CHAPTER_ID, FIFTH_CHAPTER_ID]);

module.exports = { CHAPTERS, CHAPTER_IDS, DIFFICULTY_SLOTS, FEATURE_FLAGS, FIRST_CHAPTER_ID, SECOND_CHAPTER_ID, THIRD_CHAPTER_ID, FOURTH_CHAPTER_ID, FIFTH_CHAPTER_ID };
