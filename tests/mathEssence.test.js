const assert = require("node:assert/strict");
const test = require("node:test");

const mathEssence = require("../mathEssence.js");
const { expansionModules } = require("../contentExpansion.js");

function assertCompleteEssence(essence) {
  assert.ok(essence.bigIdea);
  assert.ok(essence.essentialQuestion);
  assert.ok(Array.isArray(essence.coreModels) && essence.coreModels.length > 0);
  assert.ok(Array.isArray(essence.representations) && essence.representations.length > 0);
  assert.ok(Array.isArray(essence.transferTips) && essence.transferTips.length > 0);
  assert.ok(Array.isArray(essence.misconceptions) && essence.misconceptions.length > 0);
  assert.ok(Array.isArray(essence.progression) && essence.progression.length > 0);
}

test("provides explicit essence for expanded Olympiad modules", () => {
  expansionModules.forEach((module) => {
    const essence = mathEssence.getEssenceForModule(module);
    assertCompleteEssence(essence);
    assert.notEqual(essence.bigIdea, mathEssence.defaultEssence.bigIdea, `${module.id} should have explicit essence`);
  });
});

test("falls back to a complete general essence for unknown modules", () => {
  const essence = mathEssence.getEssenceForModule({ id: "unknown" });
  assertCompleteEssence(essence);
  assert.equal(essence.bigIdea, mathEssence.defaultEssence.bigIdea);
});

test("applies math essence without mutating original module objects", () => {
  const modules = [{ id: "tree-planting", title: "植树问题", examples: [], practices: [] }];
  const enhanced = mathEssence.applyMathEssenceToModules(modules);
  assert.equal(modules[0].mathEssence, undefined);
  assert.ok(enhanced[0].mathEssence);
  assert.equal(mathEssence.hasMathEssence(enhanced[0]), true);
});

test("keeps existing module essence when present", () => {
  const customEssence = {
    bigIdea: "custom",
    essentialQuestion: "custom question",
    coreModels: ["model"],
    representations: ["representation"],
    transferTips: ["tip"],
    misconceptions: ["mistake"],
    progression: ["step"]
  };
  const [enhanced] = mathEssence.applyMathEssenceToModules([{ id: "patterns", mathEssence: customEssence }]);
  assert.equal(enhanced.mathEssence, customEssence);
});
