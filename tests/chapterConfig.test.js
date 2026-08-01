const assert = require("node:assert/strict");
const test = require("node:test");
const config = require("../game/chapterConfig.js");

test("chapter one exposes the approved 12 knowledge-point levels", () => {
  const levels = config.CHAPTERS[config.FIRST_CHAPTER_ID].levels;
  assert.deepEqual(levels.map((level) => level.moduleId), [
    "patterns", "quick-calculation", "arithmetic-series", "periodicity",
    "enumeration", "add-multiply-principle", "inclusion-exclusion", "sum-diff",
    "unit-rate", "surplus-deficit", "chicken-rabbit", "average"
  ]);
  assert.equal(levels.every((level) => level.rewardSlots.length === 10), true);
  assert.equal(config.FEATURE_FLAGS.crafting, false);
  assert.equal(config.FEATURE_FLAGS.shop, false);
  assert.equal(config.FEATURE_FLAGS.equipment, false);
});

test("campaign config exposes sequential twelve-topic expansion chapters", () => {
  assert.deepEqual(config.CHAPTER_IDS, ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05"]);
  assert.deepEqual(config.CHAPTERS["chapter-02"].levels.map((level) => level.moduleId), [
    "pigeonhole-principle", "counting-transfer", "motion", "engineering", "train-bridge", "age",
    "efficiency-transfer", "tree-planting", "geometry", "logic", "geometry-counting", "parity-divisibility"
  ]);
  assert.equal(config.CHAPTERS["chapter-03"].prerequisiteChapterId, "chapter-02");
  assert.equal(config.CHAPTER_IDS.every((chapterId) => config.CHAPTERS[chapterId].levels.length === 12), true);
});

test("chapter four routes from the completed orbital station through twelve geometry topics", () => {
  assert.equal(config.FOURTH_CHAPTER_ID, "chapter-04");
  assert.equal(config.CHAPTERS[config.FOURTH_CHAPTER_ID].prerequisiteChapterId, "chapter-03");
  assert.deepEqual(config.CHAPTERS[config.FOURTH_CHAPTER_ID].levels.map((level) => level.moduleId), [
    "angles", "triangles", "quadrilaterals", "perimeter", "area", "composite-figures",
    "area-units", "volume", "capacity", "surface-area", "scale", "coordinates-routes"
  ]);
  assert.equal(config.CHAPTERS[config.FOURTH_CHAPTER_ID].levels.every((level) => level.rewardSlots.length === 10), true);
});

test("chapter five unlocks after the polar expedition with twelve algebra-and-equation topics", () => {
  assert.equal(config.FIFTH_CHAPTER_ID, "chapter-05");
  assert.deepEqual(config.CHAPTER_IDS, ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05"]);
  assert.equal(config.CHAPTERS[config.FIFTH_CHAPTER_ID].name, "装甲突击演练");
  assert.equal(config.CHAPTERS[config.FIFTH_CHAPTER_ID].prerequisiteChapterId, "chapter-04");
  assert.equal(config.CHAPTERS[config.FIFTH_CHAPTER_ID].projectId, "99a-main-battle-tank");
  assert.deepEqual(config.CHAPTERS[config.FIFTH_CHAPTER_ID].levels.map((level) => level.moduleId), [
    "algebraic-expressions", "equations-unknowns", "linear-equations", "equation-applications",
    "fraction-modeling", "decimal-modeling", "percent-basics", "discount-tax", "profit-loss-modeling",
    "concentration-configuration", "savings-interest", "supply-integration"
  ]);
});
