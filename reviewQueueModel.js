(function attachReviewQueueModel(root) {
  function createWrongItem(practice) {
    return {
      id: practice.id,
      moduleId: practice.moduleId,
      moduleTitle: practice.moduleTitle || "综合练习",
      title: practice.title,
      prompt: practice.prompt,
      answer: practice.answer,
      explanation: practice.explanation,
      difficulty: practice.difficulty,
      mistakeTags: root.MistakeDiagnosis?.getTagsForPractice(practice, { id: practice.moduleId, title: practice.moduleTitle }) || practice.mistakeTags || []
    };
  }

  function normalizeWrongBook(state) {
    return Array.isArray(state?.wrongBook) ? state.wrongBook : [];
  }

  function getReview(item, todayKey, scheduler = root.ReviewScheduler) {
    return item.review || scheduler.scheduleWrongAttempt({}, todayKey);
  }

  function updateWrongBookAfterAnswer({ state, practice, isCorrect, todayKey, scheduler = root.ReviewScheduler }) {
    const nextState = { ...state, wrongBook: [...normalizeWrongBook(state)] };
    const existing = nextState.wrongBook.find((item) => item.id === practice.id);
    const baseItem = existing || createWrongItem(practice);
    const nextReview = isCorrect
      ? scheduler.scheduleCorrectAttempt(baseItem.review || {}, todayKey)
      : scheduler.scheduleWrongAttempt(baseItem.review || {}, todayKey);

    if (isCorrect && nextReview.correctStreak >= 2) {
      nextState.wrongBook = nextState.wrongBook.filter((item) => item.id !== practice.id);
      return nextState;
    }

    const nextTags = root.MistakeDiagnosis?.getTagsForWrongItem({ ...baseItem, ...practice }) || baseItem.mistakeTags || practice.mistakeTags || [];
    const nextItem = { ...baseItem, mistakeTags: nextTags, review: nextReview };
    nextState.wrongBook = [nextItem, ...nextState.wrongBook.filter((item) => item.id !== practice.id)];
    return nextState;
  }

  function getDueWrongBookItems(state, todayKey, scheduler = root.ReviewScheduler) {
    return normalizeWrongBook(state).filter((item) => scheduler.isDue(getReview(item, todayKey, scheduler), todayKey));
  }

  function buildWrongPaperState({ state, dueItems, requestedCount }) {
    return {
      ...state,
      paperGenerator: {
        grade: "全部",
        difficulty: "全部",
        count: requestedCount,
        source: "wrongBook",
        practiceIds: dueItems.slice(0, Math.min(requestedCount, dueItems.length)).map((item) => item.id),
        answers: {}
      }
    };
  }

  function getReviewStatusText(item, todayKey, scheduler = root.ReviewScheduler) {
    const review = getReview(item, todayKey, scheduler);
    return `复习状态：${scheduler.getReviewStatus(review, todayKey)} · 已错 ${review.wrongCount || 0} 次 · 连续答对 ${review.correctStreak || 0} 次`;
  }

  const api = {
    buildWrongPaperState,
    createWrongItem,
    getDueWrongBookItems,
    getReview,
    getReviewStatusText,
    normalizeWrongBook,
    updateWrongBookAfterAnswer
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.ReviewQueueModel = api;
})(typeof window !== "undefined" ? window : globalThis);
