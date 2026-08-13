const assert = require("node:assert/strict");
const test = require("node:test");

const difficultyEngine = require("../game/curriculum/difficultyEngine.js");

function question({
  stepCount = 1,
  conditions = 1,
  representation = "equation",
  direction = "forward",
  representationShift = false,
  supportingConcepts = [],
  strategyChoices = [],
  difficulty
} = {}) {
  return {
    difficulty,
    solution: {
      steps: Array.from({ length: stepCount }, (_, index) => ({
        id: `step-${index + 1}`,
        operation: "add",
        operands: [index, 1],
        result: index + 1
      }))
    },
    conditionRoles: Array.from({ length: conditions }, (_, index) => `condition-${index + 1}`),
    representation,
    questionDirection: direction,
    representationShift,
    supportingConcepts,
    strategyChoices
  };
}

test("derives direct, representation-shift, and boss-integration difficulty from V3 structure", () => {
  const direct = difficultyEngine.evaluateDifficulty(question());
  const shifted = difficultyEngine.evaluateDifficulty(question({
    representation: "table",
    representationShift: true
  }));
  const boss = difficultyEngine.evaluateDifficulty(question({
    stepCount: 4,
    conditions: 3,
    representation: "diagram",
    direction: "reverse",
    supportingConcepts: ["ratio", "area"],
    strategyChoices: ["equation", "assume"]
  }));

  assert.deepEqual(direct, {
    score: 2,
    steps: 1,
    conditions: 1,
    representation: "equation",
    direction: "forward",
    transfer: "direct"
  });
  assert.equal(shifted.transfer, "representation-shift");
  assert.equal(boss.transfer, "boss-integration");
  assert.ok(direct.score < shifted.score);
  assert.ok(shifted.score < boss.score);
});

test("keeps difficulty scores monotonic as structural demands increase", () => {
  const base = difficultyEngine.evaluateDifficulty(question());
  const extraStep = difficultyEngine.evaluateDifficulty(question({ stepCount: 2 }));
  const extraCondition = difficultyEngine.evaluateDifficulty(question({ conditions: 2 }));
  const shiftedRepresentation = difficultyEngine.evaluateDifficulty(question({ representationShift: true }));
  const reverse = difficultyEngine.evaluateDifficulty(question({ direction: "reverse" }));
  const crossConcept = difficultyEngine.evaluateDifficulty(question({ supportingConcepts: ["ratio"] }));
  const boss = difficultyEngine.evaluateDifficulty(question({ supportingConcepts: ["ratio", "area"] }));

  for (const moreDemanding of [extraStep, extraCondition, shiftedRepresentation, reverse, crossConcept, boss]) {
    assert.ok(moreDemanding.score >= base.score);
  }
  assert.ok(crossConcept.score >= shiftedRepresentation.score);
  assert.ok(boss.score >= crossConcept.score);
});

test("ignores authored difficulty fields and counts actual solution steps", () => {
  const lowLabel = difficultyEngine.evaluateDifficulty(question({ difficulty: "基础", stepCount: 2 }));
  const highLabel = difficultyEngine.evaluateDifficulty(question({ difficulty: "挑战", stepCount: 2 }));

  assert.deepEqual(highLabel, lowLabel);
});

test("reports an uncompensated score regression in ordered topic progression", () => {
  const errors = difficultyEngine.validateTopicProgression([
    question({ stepCount: 4, conditions: 3, supportingConcepts: ["ratio", "area", "table"] }),
    question({ stepCount: 1, conditions: 1, supportingConcepts: ["ratio"] })
  ]);

  assert.match(errors.join("\n"), /score regression at index 1/);
  assert.match(errors.join("\n"), /prerequisite\/dependency complexity regression at index 1/);
});

test("returns string validation errors instead of throwing on malformed input", () => {
  assert.doesNotThrow(() => difficultyEngine.extractStructure(null));
  assert.equal(difficultyEngine.extractStructure(null), "question must be an object");
  assert.equal(difficultyEngine.evaluateDifficulty({ solution: { steps: [{}] } }), "conditionRoles must be an array");
  assert.deepEqual(difficultyEngine.validateTopicProgression(null), ["questions must be an array"]);
});
