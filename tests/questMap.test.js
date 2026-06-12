const assert = require("node:assert/strict");
const test = require("node:test");

const questMap = require("../questMap.js");

const modules = [
  { id: "a", title: "第一关", practices: [{ id: "a1" }, { id: "a2" }] },
  { id: "b", title: "第二关", practices: [{ id: "b1" }] },
  { id: "c", title: "第三关", practices: [{ id: "c1" }] },
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

test("summarizes quest progress", () => {
  const states = questMap.calculateQuestStates(modules, { completed: { a1: true, a2: true } }, []);
  const summary = questMap.summarizeQuest(states);
  assert.equal(summary.total, 4);
  assert.equal(summary.cleared, 1);
  assert.equal(summary.current.moduleId, "b");
  assert.equal(summary.progressText, "1/4 关已通关");
});

test("groups quest states", () => {
  const groups = questMap.groupQuestStates([{ title: "路线一", modules }], { completed: { a1: true, a2: true } }, []);
  assert.equal(groups[0].states.length, 4);
  assert.equal(groups[0].states[0].status.id, "cleared");
});
