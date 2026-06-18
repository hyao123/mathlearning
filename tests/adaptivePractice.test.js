const assert = require("node:assert/strict");
const test = require("node:test");

const adaptivePractice = require("../adaptivePractice.js");

const pool = [
  { id: "patterns-1", title: "A", moduleId: "patterns" },
  { id: "patterns-2", title: "B", moduleId: "patterns" },
  { id: "geometry-1", title: "C", moduleId: "geometry" },
  { id: "logic-1", title: "D", moduleId: "logic" }
];

test("prioritizes wrong-book items", () => {
  const state = {
    wrongBook: [{ id: "geometry-1" }],
    completed: {},
    answerHistory: {}
  };

  const selected = adaptivePractice.selectDailyPracticeItems({ pool, state, dailyKey: "2026-06-12", targetCount: 3 });
  assert.equal(selected[0].id, "geometry-1");
  assert.equal(selected[0].adaptiveReason, "错题回访");
  assert.deepEqual(selected[0].adaptiveReasonDetails, ["错题回访", "薄弱模块", "新题探索"]);
});

test("prioritizes recently wrong answers", () => {
  const state = {
    wrongBook: [],
    completed: {},
    answerHistory: {
      "logic-1": { attempts: 2, correct: 1, latestCorrect: false }
    }
  };

  const selected = adaptivePractice.selectDailyPracticeItems({ pool, state, dailyKey: "2026-06-12", targetCount: 3 });
  assert.equal(selected[0].id, "logic-1");
  assert.equal(selected[0].adaptiveReason, "最近答错");
  assert.ok(selected[0].adaptiveReasonDetails.includes("正确率偏低"));
  assert.equal(selected[0].adaptiveScoreBreakdown.latestWrongBoost, adaptivePractice.defaultAdaptiveConfig.latestWrongBoost);
});

test("selects unique items and keeps target count", () => {
  const state = {
    wrongBook: [{ id: "patterns-1" }],
    completed: { "patterns-2": true },
    answerHistory: {
      "patterns-1": { attempts: 1, correct: 0, latestCorrect: false },
      "patterns-2": { attempts: 1, correct: 1, latestCorrect: true }
    }
  };

  const selected = adaptivePractice.selectDailyPracticeItems({ pool, state, dailyKey: "2026-06-12", targetCount: 3 });
  assert.equal(selected.length, 3);
  assert.equal(new Set(selected.map((item) => item.id)).size, 3);
});

test("accepts configurable weights", () => {
  const state = {
    wrongBook: [{ id: "geometry-1" }],
    completed: {},
    answerHistory: {
      "logic-1": { attempts: 3, correct: 0, latestCorrect: false }
    }
  };

  const selected = adaptivePractice.selectDailyPracticeItems({
    pool,
    state,
    dailyKey: "2026-06-12",
    targetCount: 1,
    config: {
      wrongBookBoost: 1,
      latestWrongBoost: 100,
      accuracyPenaltyMax: 100
    }
  });

  assert.equal(selected[0].id, "logic-1");
  assert.equal(selected[0].adaptiveScoreBreakdown.latestWrongBoost, 100);
});

test("allows configurable reason labels", () => {
  const state = {
    wrongBook: [{ id: "patterns-1" }],
    completed: {},
    answerHistory: {}
  };

  const reasons = adaptivePractice.getRecommendationReasons(pool[0], pool, state, {
    reasonLabels: {
      wrongBook: "复盘错题"
    }
  });

  assert.equal(reasons[0], "复盘错题");
});

test("returns stable hashes for the same key", () => {
  assert.equal(adaptivePractice.stableHash("daily-key"), adaptivePractice.stableHash("daily-key"));
});
