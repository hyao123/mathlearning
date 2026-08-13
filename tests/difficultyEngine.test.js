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

test("allows the documented one-point same-transfer score tolerance", () => {
  const errors = difficultyEngine.validateTopicProgression([
    question({ stepCount: 2 }),
    question({ stepCount: 1 })
  ]);

  assert.doesNotMatch(errors.join("\n"), /score regression at index 1/);
});

test("rejects a regression that a small transfer increase cannot compensate", () => {
  const errors = difficultyEngine.validateTopicProgression([
    question({ stepCount: 9 }),
    question({ representationShift: true })
  ]);

  assert.match(errors.join("\n"), /score regression at index 1/);
});

test("returns explicit validation errors instead of throwing on malformed input", () => {
  assert.doesNotThrow(() => difficultyEngine.extractStructure(null));
  assert.equal(difficultyEngine.extractStructure(null), "question must be an object");
  assert.ok(difficultyEngine.evaluateDifficulty({ solution: { steps: [{}] } }).errors.includes("conditionRoles must be an array"));
  assert.deepEqual(difficultyEngine.validateTopicProgression(null), ["questions must be an array"]);
});

test("returns explicit errors for malformed V3 difficulty inputs", () => {
  const malformedQuestions = [
    [question({ stepCount: 0 }), "solution steps must be a non-empty array"],
    [question({ conditions: 1, }), "step at index 0 must be an object", (value) => { value.solution.steps[0] = null; }],
    [question(), "unsupported operation at step 0: power", (value) => { value.solution.steps[0].operation = "power"; }],
    [question(), "operands at step 0 must be an array", (value) => { value.solution.steps[0].operands = "1, 2"; }],
    [question(), "result at step 0 must be a finite number", (value) => { value.solution.steps[0].result = Infinity; }],
    [question(), "conditionRoles member at index 0 must be a non-empty string", (value) => { value.conditionRoles[0] = " "; }],
    [question({ supportingConcepts: ["ratio", "ratio"] }), "supportingConcepts must not contain duplicates"],
    [question({ supportingConcepts: [""] }), "supportingConcepts member at index 0 must be a non-empty string"],
    [question({ representation: "poster" }), "invalid representation: poster"],
    [question({ direction: "sideways" }), "invalid questionDirection: sideways"],
    [question({ representationShift: "yes" }), "representationShift must be a boolean"]
  ];

  for (const [malformed, expectedError, mutate] of malformedQuestions) {
    if (mutate) mutate(malformed);
    const result = difficultyEngine.evaluateDifficulty(malformed);
    assert.ok(Array.isArray(result.errors), expectedError);
    assert.ok(result.errors.includes(expectedError), result.errors.join("\n"));
    assert.match(difficultyEngine.validateTopicProgression([malformed]).join("\n"), new RegExp(expectedError));
  }
});
