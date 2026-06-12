const assert = require("node:assert/strict");
const test = require("node:test");

const mastery = require("../masteryModel.js");

const module = {
  id: "patterns",
  title: "找规律",
  knowledgeTopology: { strand: "观察与周期", stage: "结构观察" },
  practices: [{ id: "p1" }, { id: "p2" }, { id: "p3" }, { id: "p4" }, { id: "p5" }]
};

test("marks untouched module as not started", () => {
  const result = mastery.calculateModuleMastery(module, {}, { todayKey: "2026-06-12" });
  assert.equal(result.status.id, "not-started");
  assert.equal(result.stats.completed, 0);
});

test("marks partially completed module as learning", () => {
  const state = {
    completed: { p1: true, p2: true },
    answerHistory: {
      p1: { attempts: 1, correct: 1, latestCorrect: true },
      p2: { attempts: 1, correct: 1, latestCorrect: true }
    },
    wrongBook: []
  };
  const result = mastery.calculateModuleMastery(module, state, { todayKey: "2026-06-12" });
  assert.equal(result.status.id, "learning");
  assert.equal(result.stats.completionRateText, "40%");
});

test("marks module with due wrong book items as needs review", () => {
  const state = {
    completed: { p1: true, p2: true, p3: true, p4: true },
    answerHistory: {
      p1: { attempts: 1, correct: 1, latestCorrect: true },
      p2: { attempts: 1, correct: 1, latestCorrect: true },
      p3: { attempts: 1, correct: 1, latestCorrect: true },
      p4: { attempts: 1, correct: 1, latestCorrect: true }
    },
    wrongBook: [{ id: "p5", nextReviewAt: "2026-06-12" }]
  };
  const result = mastery.calculateModuleMastery(module, state, { todayKey: "2026-06-12" });
  assert.equal(result.status.id, "needs-review");
  assert.equal(result.stats.dueWrongBook, 1);
});

test("marks strong module without wrong book as mastered", () => {
  const state = {
    completed: { p1: true, p2: true, p3: true, p4: true },
    answerHistory: {
      p1: { attempts: 1, correct: 1, latestCorrect: true },
      p2: { attempts: 1, correct: 1, latestCorrect: true },
      p3: { attempts: 1, correct: 1, latestCorrect: true },
      p4: { attempts: 1, correct: 1, latestCorrect: true }
    },
    wrongBook: []
  };
  const result = mastery.calculateModuleMastery(module, state, { todayKey: "2026-06-12" });
  assert.equal(result.status.id, "mastered");
  assert.equal(result.stats.completionRateText, "80%");
  assert.equal(result.stats.accuracyText, "100%");
});

test("summarizes mastery statuses", () => {
  const masteries = [
    { status: mastery.masteryStatuses.notStarted, score: 0, moduleTitle: "A" },
    { status: mastery.masteryStatuses.learning, score: 40, moduleTitle: "B" },
    { status: mastery.masteryStatuses.needsReview, score: 30, moduleTitle: "C" },
    { status: mastery.masteryStatuses.mastered, score: 90, moduleTitle: "D" }
  ];
  const summary = mastery.summarizeMastery(masteries);
  assert.equal(summary.total, 4);
  assert.equal(summary.averageScore, 40);
  assert.equal(summary.counts["not-started"], 1);
  assert.equal(summary.counts.learning, 1);
  assert.equal(summary.counts["needs-review"], 1);
  assert.equal(summary.counts.mastered, 1);
  assert.equal(summary.needsReview[0].moduleTitle, "C");
  assert.equal(summary.nextLearning.moduleTitle, "B");
});
