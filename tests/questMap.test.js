const assert = require("node:assert/strict");
const test = require("node:test");

const questMap = require("../questMap.js");

const modules = [
  { id: "a", title: "第一关", knowledgeTopology: { strand: "观察与周期" }, practices: [{ id: "a1", difficulty: "基础" }, { id: "a2", difficulty: "提高" }] },
  { id: "b", title: "第二关", knowledgeTopology: { strand: "数量关系" }, practices: [{ id: "b1", difficulty: "基础" }] },
  { id: "c", title: "第三关", knowledgeTopology: { strand: "逻辑推理" }, practices: [{ id: "c1", difficulty: "挑战" }] },
  { id: "d", title: "第四关", practices: [{ id: "d1" }] }
];

test("marks completed modules as cleared", () => {
  const states = questMap.calculateQuestStates(modules, { completed: { a1: true, a2: true } }, []);
  assert.equal(states[0].status.id, "cleared");
  assert.equal(states[1].status.id, "current");
  assert.equal(states[2].status.id, "unlocked");
  assert.equal(states[3].status.id, "locked");
});

test("uses mastery status to mark a quest as cleared", () => {
  const states = questMap.calculateQuestStates(
    modules,
    { completed: {} },
    [{ moduleId: "a", status: { id: "mastered" } }]
  );
  assert.equal(states[0].status.id, "cleared");
});

test("uses needs-review mastery status before current recommendation", () => {
  const states = questMap.calculateQuestStates(
    modules,
    { completed: { a1: true, a2: true } },
    [{ moduleId: "b", status: { id: "needs-review" } }]
  );
  assert.equal(states[1].status.id, "needs-review");
});

test("adds metro station code, reward points, and honor title", () => {
  const states = questMap.calculateQuestStates(modules, { completed: {} }, []);
  assert.equal(states[0].stationCode, "M01");
  assert.equal(states[0].stationName, "M01 · 第一关");
  assert.equal(states[0].reward.stationCode, "M01");
  assert.ok(states[0].reward.points > 0);
  assert.match(states[0].reward.honorTitle, /观察线/);
  assert.equal(questMap.getStationCode(9), "M10");
});

test("calculates station reward using level and difficulty", () => {
  const firstReward = questMap.calculateStationReward(modules[0], 0);
  const challengeReward = questMap.calculateStationReward(modules[2], 2);
  assert.ok(challengeReward > firstReward - 10);
  assert.equal(questMap.getStationReward(modules[1], 1).stationCode, "M02");
});

test("summarizes quest progress and metro reward points", () => {
  const states = questMap.calculateQuestStates(modules, { completed: { a1: true, a2: true } }, []);
  const summary = questMap.summarizeQuest(states);
  assert.equal(summary.total, 4);
  assert.equal(summary.cleared, 1);
  assert.equal(summary.current.moduleId, "b");
  assert.equal(summary.progressText, "1/4 站已通关");
  assert.ok(summary.earnedPoints > 0);
  assert.ok(summary.totalPoints > summary.earnedPoints);
  assert.match(summary.rewardText, /地铁积分/);
});

test("groups quest states", () => {
  const groups = questMap.groupQuestStates([{ title: "路线一", modules }], { completed: { a1: true, a2: true } }, []);
  assert.equal(groups[0].states.length, 4);
  assert.equal(groups[0].states[0].status.id, "cleared");
});
