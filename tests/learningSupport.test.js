const assert = require("node:assert/strict");
const test = require("node:test");

const learningSupport = require("../learningSupport.js");

test("adds default learning support to practices", () => {
  const modules = [
    {
      id: "patterns",
      title: "Patterns",
      practices: [
        {
          id: "patterns-default",
          title: "Practice",
          prompt: "1, 3, 5, (?)",
          answer: "7",
          explanation: "Each step adds 2."
        }
      ]
    }
  ];

  const enhanced = learningSupport.applySupportToModules(modules);
  const practice = enhanced[0].practices[0];

  assert.ok(practice.hints.length > 0);
  assert.ok(practice.solutionSteps.length > 0);
  assert.ok(practice.commonMistakes.length > 0);
  assert.equal(learningSupport.hasLearningSupport(practice), true);
});

test("uses explicit support when available", () => {
  const modules = [
    {
      id: "patterns",
      title: "Patterns",
      practices: [
        {
          id: "patterns-1",
          title: "Practice",
          prompt: "4, 7, 10, 13, (?)",
          answer: "16",
          explanation: "Each step adds 3."
        }
      ]
    }
  ];

  const practice = learningSupport.applySupportToModules(modules)[0].practices[0];
  assert.equal(practice.hints[0], "先看每次相邻两项相差多少。");
  assert.equal(practice.solutionSteps[2], "13+3=16。");
});

test("preserves support already provided on a practice", () => {
  const modules = [
    {
      id: "logic",
      title: "Logic",
      practices: [
        {
          id: "custom-1",
          title: "Practice",
          prompt: "Who is first?",
          answer: "C",
          explanation: "Use exclusion.",
          hints: ["custom hint"],
          solutionSteps: ["custom step"],
          commonMistakes: ["custom mistake"]
        }
      ]
    }
  ];

  const practice = learningSupport.applySupportToModules(modules)[0].practices[0];
  assert.deepEqual(learningSupport.getSupportForPractice(practice), {
    hints: ["custom hint"],
    solutionSteps: ["custom step"],
    commonMistakes: ["custom mistake"]
  });
});
