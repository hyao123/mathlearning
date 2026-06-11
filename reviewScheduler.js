(function attachReviewScheduler(root) {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const REVIEW_STEPS = [0, 1, 3, 7];

  function toDateKey(date = new Date()) {
    const value = date instanceof Date ? date : new Date(date);
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }

  function addDays(dateKey, days) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setTime(date.getTime() + days * ONE_DAY_MS);
    return toDateKey(date);
  }

  function scheduleWrongAttempt(review = {}, todayKey = toDateKey()) {
    const wrongCount = Number(review.wrongCount || 0) + 1;
    const intervalDays = REVIEW_STEPS[Math.min(wrongCount - 1, REVIEW_STEPS.length - 1)];
    return {
      wrongCount,
      correctStreak: 0,
      dueDate: addDays(todayKey, intervalDays),
      lastReviewedAt: todayKey
    };
  }

  function scheduleCorrectAttempt(review = {}, todayKey = toDateKey()) {
    const correctStreak = Number(review.correctStreak || 0) + 1;
    return {
      wrongCount: Number(review.wrongCount || 0),
      correctStreak,
      dueDate: correctStreak >= 2 ? null : addDays(todayKey, 1),
      lastReviewedAt: todayKey
    };
  }

  function isDue(review = {}, todayKey = toDateKey()) {
    return !review.dueDate || review.dueDate <= todayKey;
  }

  function getReviewStatus(review = {}, todayKey = toDateKey()) {
    if (!review.dueDate) {
      return "已巩固";
    }
    if (isDue(review, todayKey)) {
      return "今日待复习";
    }
    return `下次复习：${review.dueDate}`;
  }

  const api = {
    addDays,
    getReviewStatus,
    isDue,
    scheduleCorrectAttempt,
    scheduleWrongAttempt,
    toDateKey
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.ReviewScheduler = api;
})(typeof window !== "undefined" ? window : globalThis);
