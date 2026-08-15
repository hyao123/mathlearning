const test = require("node:test");
const assert = require("node:assert/strict");
const contract = require("../game/curriculum/curriculumContract.js");
const map = require("../game/curriculum/curriculumMap.js");

test("three gold-sample topics contain grade, core model, required moves, and excluded shortcuts", () => {
  for (const id of ["chicken-rabbit", "shortest-path", "integrated-modeling"]) {
    const topic = map.getCurriculumTopic(id);
    assert.ok(topic, id);
    assert.deepEqual(contract.validateTopicDefinition(topic), [], id);
    assert.ok(topic.requiredActions.length >= 2, id);
    assert.ok(topic.excludedShortcuts.length >= 1, id);
  }
});

test("curriculum graph rejects an unknown prerequisite and detects cycles", () => {
  const unknownErrors = contract.validateCurriculumGraph([
    { ...map.getCurriculumTopic("shortest-path"), prerequisites: ["missing"] }
  ]);
  assert.match(unknownErrors.join("\n"), /unknown prerequisite: missing/);

  const cycleErrors = contract.validateCurriculumGraph([
    { ...map.getCurriculumTopic("chicken-rabbit"), prerequisites: ["shortest-path"] },
    { ...map.getCurriculumTopic("shortest-path"), prerequisites: ["chicken-rabbit"] }
  ]);
  assert.match(cycleErrors.join("\n"), /prerequisite cycle: chicken-rabbit -> shortest-path -> chicken-rabbit/);
});

test("topic validation enforces controlled grade bands and required reasoning moves", () => {
  const invalidTopic = {
    ...map.getCurriculumTopic("chicken-rabbit"),
    gradeBand: "grade-7",
    requiredActions: ["guess"]
  };

  assert.deepEqual(contract.validateTopicDefinition(invalidTopic), [
    "invalid gradeBand: grade-7",
    "invalid required action"
  ]);
});

test("graph accepts known legacy prerequisite IDs only when declared externally", () => {
  const topic = map.getCurriculumTopic("chicken-rabbit");
  assert.match(
    contract.validateCurriculumGraph([topic]).join("\n"),
    /unknown prerequisite: sum-diff/
  );
  assert.deepEqual(
    contract.validateCurriculumGraph([topic], { externalPrerequisiteIds: ["sum-diff"] }),
    []
  );
});
