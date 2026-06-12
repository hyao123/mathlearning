const assert = require("node:assert/strict");
const test = require("node:test");

const { continuityModules, mergeContinuityModules } = require("../knowledgeContinuityExpansion.js");

function getPractices() {
  return continuityModules.flatMap((module) => module.practices.map((practice) => ({ ...practice, moduleId: module.id })));
}

test("adds bridge modules that improve knowledge continuity", () => {
  assert.deepEqual(
    continuityModules.map((module) => module.id),
    ["periodicity", "enumeration", "inclusion-exclusion", "unit-rate", "surplus-deficit"]
  );
});

test("new continuity modules include examples and practice support", () => {
  continuityModules.forEach((module) => {
    assert.ok(module.examples.length >= 3, `${module.id} should include examples`);
    assert.ok(module.practices.length >= 6, `${module.id} should include practices`);
  });
  assert.equal(getPractices().length, 30);
});

test("each continuity practice has explanation scaffolding", () => {
  getPractices().forEach((practice) => {
    assert.ok(practice.id);
    assert.ok(practice.prompt);
    assert.ok(practice.answer);
    assert.ok(practice.explanation);
    assert.ok(Array.isArray(practice.hints) && practice.hints.length > 0, `${practice.id} needs hints`);
    assert.ok(Array.isArray(practice.solutionSteps) && practice.solutionSteps.length > 0, `${practice.id} needs steps`);
    assert.ok(Array.isArray(practice.commonMistakes) && practice.commonMistakes.length > 0, `${practice.id} needs mistakes`);
  });
});

test("continuity practice ids are unique", () => {
  const ids = getPractices().map((practice) => practice.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("mergeContinuityModules appends only missing modules", () => {
  const existing = [{ id: "periodicity", title: "Existing", examples: [], practices: [] }];
  const merged = mergeContinuityModules(existing, continuityModules);
  assert.equal(merged.filter((module) => module.id === "periodicity").length, 1);
  assert.ok(merged.some((module) => module.id === "surplus-deficit"));
  assert.equal(merged.length, continuityModules.length);
});
