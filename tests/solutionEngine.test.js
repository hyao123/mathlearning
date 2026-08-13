const assert = require("node:assert/strict");
const test = require("node:test");

const engine = require("../game/curriculum/solutionEngine.js");

function validQuestion() {
  return {
    answer: "6",
    answerPolicy: { kind: "integer" },
    solution: {
      strategy: "uniform-assumption",
      steps: [
        { id: "allChickenLegs", operation: "multiply", operands: [14, 2], result: 28 },
        { id: "extraLegs", operation: "subtract", operands: [40, "$allChickenLegs"], result: 12 },
        { id: "rabbits", operation: "divide", operands: ["$extraLegs", 2], result: 6 }
      ]
    },
    verification: {
      strategy: "total-legs-check",
      steps: [
        { id: "rabbitLegs", operation: "multiply", operands: [6, 4], result: 24 },
        { id: "chickenLegs", operation: "multiply", operands: [8, 2], result: 16 },
        { id: "totalLegs", operation: "add", operands: ["$rabbitLegs", "$chickenLegs"], result: 40 },
        { id: "verifiedRabbits", operation: "divide", operands: ["$rabbitLegs", 4], result: 6 }
      ]
    }
  };
}

test("evaluates completed-step references using only the supported operations", () => {
  const result = engine.evaluateSteps([
    { id: "sum", operation: "sum", operands: [2, 3, 4], result: 9 },
    { id: "lowest", operation: "min", operands: ["$sum", 5, 7], result: 5 },
    { id: "highest", operation: "max", operands: ["$lowest", 8, 6], result: 8 },
    { id: "groups", operation: "ceilDivide", operands: ["$highest", 3], result: 3 },
    { id: "leftover", operation: "remainder", operands: ["$sum", "$groups"], result: 0 }
  ]);

  assert.equal(result.values.get("sum"), 9);
  assert.equal(result.finalValue, 0);
});

test("rejects division by zero", () => {
  assert.throws(
    () => engine.evaluateSteps([{ id: "a", operation: "divide", operands: [1, 0], result: 0 }]),
    /division by zero/
  );
});

test("rejects duplicate and invalid forward step references", () => {
  assert.throws(
    () => engine.evaluateSteps([
      { id: "a", operation: "add", operands: [1, 2], result: 3 },
      { id: "a", operation: "add", operands: [2, 2], result: 4 }
    ]),
    /duplicate step id: a/
  );
  assert.throws(
    () => engine.evaluateSteps([
      { id: "first", operation: "add", operands: ["$later", 1], result: 2 },
      { id: "later", operation: "add", operands: [1, 0], result: 1 }
    ]),
    /invalid or forward reference: \$later/
  );
});

test("validates declared intermediate results and a separate verification path", () => {
  const forged = validQuestion();
  forged.solution.steps[1].result = 13;
  const errors = engine.validateSolution(forged);

  assert.match(errors.join("\n"), /declared result 13 does not equal 12/);
  assert.deepEqual(engine.validateSolution(validQuestion()), []);
});

test("requires a distinct, non-empty verification and policy-matching final values", () => {
  const missingVerification = validQuestion();
  missingVerification.verification = { strategy: "total-legs-check", steps: [] };
  assert.match(engine.validateSolution(missingVerification).join("\n"), /verification steps must not be empty/);

  const repeatedStrategy = validQuestion();
  repeatedStrategy.verification.strategy = repeatedStrategy.solution.strategy;
  assert.match(engine.validateSolution(repeatedStrategy).join("\n"), /verification strategy must differ/);

  const wrongPolicyAnswer = validQuestion();
  wrongPolicyAnswer.answer = "7";
  assert.match(engine.validateSolution(wrongPolicyAnswer).join("\n"), /solution final result does not match answer policy/);

  const wrongVerificationAnswer = validQuestion();
  wrongVerificationAnswer.verification.steps.at(-1).result = 5;
  wrongVerificationAnswer.verification.steps.at(-1).operands = ["$rabbitLegs", 4.8];
  assert.match(engine.validateSolution(wrongVerificationAnswer).join("\n"), /verification final result does not match answer policy/);
});

test("returns validation errors instead of throwing for malformed questions", () => {
  assert.deepEqual(engine.validateSolution(null), ["question must be an object"]);
  assert.match(engine.validateSolution({ solution: null }).join("\n"), /solution must be an object/);
});
