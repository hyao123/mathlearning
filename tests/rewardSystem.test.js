const assert = require("node:assert/strict");
const test = require("node:test");

const rewards = require("../rewardSystem.js");

const modules = [
  {
    id: "patterns",
    title: "找规律",
    knowledgeTopology: { strand: "观察与周期" },
    practices: [{ id: "p1" }, { id: "p2" }]
  },
  {
    id: "motion",
    title: "行程问题",
    knowledgeTopology: { strand: "变化与效率" },
    practices: [{ id: "m1" }]
  },
  {
    id: "geometry",
    title: "几何问题",
    knowledgeTopology: { strand: "空间与离散结构" },
    practices: [{ id: "g1" }]
  }
];

const state = {
  completed: { p1: true, p2: true, m1: true },
  answerHistory: {
    p1: { attempts: 1, correct: 1, lastAnsweredAt: "2026-06-10T09:00:00.000Z" },
    p2: { attempts: 2, correct: 1, lastAnsweredAt: "2026-06-11T09:00:00.000Z" },
    m1: { attempts: 1, correct: 1, lastAnsweredAt: "2026-06-12T09:00:00.000Z" },
    g1: { attempts: 1, correct: 0, lastAnsweredAt: "2026-06-12T10:00:00.000Z" }
  },
  wrongBook: [{ id: "g1", review: { correctStreak: 1 } }]
};

test("calculates active day streak", () => {
  const activeDays = rewards.getActiveDayKeys(state);
  assert.deepEqual(activeDays, ["2026-06-10", "2026-06-11", "2026-06-12"]);
  assert.equal(rewards.calculateCurrentStreak(activeDays, "2026-06-12"), 3);
});

test("calculates reward metrics from learning state", () => {
  const metrics = rewards.calculateRewardMetrics({
    modules,
    state,
    masteries: [{ status: { id: "mastered" } }],
    todayKey: "2026-06-12"
  });
  assert.equal(metrics.attempts, 5);
  assert.equal(metrics.correct, 3);
  assert.equal(metrics.completedCount, 3);
  assert.equal(metrics.currentStreak, 3);
  assert.equal(metrics.reviewProgressCount, 1);
  assert.equal(metrics.masteredCount, 1);
  assert.equal(metrics.strandsTouched, 2);
  assert.equal(metrics.modulesStarted, 3);
});

test("unlocks badges and recommends next badge", () => {
  const profile = rewards.calculateRewardProfile({
    modules,
    state,
    masteries: [{ status: { id: "mastered" } }],
    todayKey: "2026-06-12"
  });
  const unlockedIds = profile.unlockedBadges.map((badge) => badge.id);
  assert.ok(unlockedIds.includes("first-attempt"));
  assert.ok(unlockedIds.includes("first-correct"));
  assert.ok(unlockedIds.includes("streak-3"));
  assert.ok(unlockedIds.includes("mastery-one"));
  assert.ok(profile.nextBadge);
});

test("calculates levels and badge diffs", () => {
  assert.equal(rewards.getLevel(0).level, 1);
  assert.equal(rewards.getLevel(180).level, 3);
  const badges = rewards.calculateBadges({ attempts: 1, correct: 1, completedCount: 0, currentStreak: 0 });
  const diff = rewards.diffUnlockedBadges(["first-attempt"], badges);
  assert.deepEqual(diff.map((badge) => badge.id), ["first-correct"]);
});
