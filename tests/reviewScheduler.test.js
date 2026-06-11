const assert = require("node:assert/strict");
const test = require("node:test");
const {
  addDays,
  getReviewStatus,
  isDue,
  scheduleCorrectAttempt,
  scheduleWrongAttempt,
  toDateKey
} = require("../reviewScheduler.js");

test("formats dates and adds days", () => {
  assert.equal(toDateKey(new Date(2026, 5, 11)), "2026-06-11");
  assert.equal(addDays("2026-06-11", 3), "2026-06-14");
});

test("schedules wrong attempts with expanding intervals", () => {
  const first = scheduleWrongAttempt({}, "2026-06-11");
  assert.equal(first.wrongCount, 1);
  assert.equal(first.correctStreak, 0);
  assert.equal(first.dueDate, "2026-06-11");

  const second = scheduleWrongAttempt(first, "2026-06-11");
  assert.equal(second.wrongCount, 2);
  assert.equal(second.dueDate, "2026-06-12");

  const third = scheduleWrongAttempt(second, "2026-06-11");
  assert.equal(third.wrongCount, 3);
  assert.equal(third.dueDate, "2026-06-14");
});

test("correct attempts clear a card after two consecutive correct reviews", () => {
  const firstCorrect = scheduleCorrectAttempt({ wrongCount: 1, correctStreak: 0 }, "2026-06-11");
  assert.equal(firstCorrect.correctStreak, 1);
  assert.equal(firstCorrect.dueDate, "2026-06-12");

  const secondCorrect = scheduleCorrectAttempt(firstCorrect, "2026-06-12");
  assert.equal(secondCorrect.correctStreak, 2);
  assert.equal(secondCorrect.dueDate, null);
});

test("detects due and future review cards", () => {
  assert.equal(isDue({ dueDate: "2026-06-11" }, "2026-06-11"), true);
  assert.equal(isDue({ dueDate: "2026-06-10" }, "2026-06-11"), true);
  assert.equal(isDue({ dueDate: "2026-06-12" }, "2026-06-11"), false);
});

test("renders review status labels", () => {
  assert.equal(getReviewStatus({ dueDate: "2026-06-11" }, "2026-06-11"), "今日待复习");
  assert.equal(getReviewStatus({ dueDate: "2026-06-12" }, "2026-06-11"), "下次复习：2026-06-12");
  assert.equal(getReviewStatus({ dueDate: null }, "2026-06-11"), "已巩固");
});
