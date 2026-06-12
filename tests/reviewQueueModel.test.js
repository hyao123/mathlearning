const assert = require("node:assert/strict");
const test = require("node:test");

const scheduler = require("../reviewScheduler.js");
const model = require("../reviewQueueModel.js");

const practice = {
  id: "patterns-1",
  moduleId: "patterns",
  moduleTitle: "patterns",
  title: "practice 1",
  prompt: "4, 7, 10, 13, (?)",
  answer: "16",
  explanation: "add 3",
  difficulty: "basic"
};

test("adds and updates review queue entries", () => {
  const first = model.updateWrongBookAfterAnswer({
    state: { wrongBook: [] },
    practice,
    isCorrect: false,
    todayKey: "2026-06-11",
    scheduler
  });
  assert.equal(first.wrongBook.length, 1);
  assert.equal(first.wrongBook[0].review.wrongCount, 1);

  const second = model.updateWrongBookAfterAnswer({
    state: first,
    practice,
    isCorrect: false,
    todayKey: "2026-06-11",
    scheduler
  });
  assert.equal(second.wrongBook.length, 1);
  assert.equal(second.wrongBook[0].review.wrongCount, 2);
  assert.equal(second.wrongBook[0].review.dueDate, "2026-06-12");
});

test("removes an item after two correct reviews", () => {
  const wrong = model.updateWrongBookAfterAnswer({
    state: { wrongBook: [] },
    practice,
    isCorrect: false,
    todayKey: "2026-06-11",
    scheduler
  });
  const firstCorrect = model.updateWrongBookAfterAnswer({
    state: wrong,
    practice,
    isCorrect: true,
    todayKey: "2026-06-11",
    scheduler
  });
  assert.equal(firstCorrect.wrongBook.length, 1);
  assert.equal(firstCorrect.wrongBook[0].review.correctStreak, 1);

  const secondCorrect = model.updateWrongBookAfterAnswer({
    state: firstCorrect,
    practice,
    isCorrect: true,
    todayKey: "2026-06-12",
    scheduler
  });
  assert.equal(secondCorrect.wrongBook.length, 0);
});

test("filters due items and builds paper state", () => {
  const state = {
    wrongBook: [
      { id: "due", review: { dueDate: "2026-06-11" } },
      { id: "future", review: { dueDate: "2026-06-12" } }
    ]
  };
  const due = model.getDueWrongBookItems(state, "2026-06-11", scheduler);
  assert.deepEqual(due.map((item) => item.id), ["due"]);

  const next = model.buildWrongPaperState({ state, dueItems: due, requestedCount: 3 });
  assert.deepEqual(next.paperGenerator.practiceIds, ["due"]);
  assert.equal(next.paperGenerator.source, "wrongBook");
});
