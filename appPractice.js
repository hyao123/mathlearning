(function attachMathLearningPractice(root) {
  function createPracticeController(app) {
    function getTodayKey() {
      return root.ReviewScheduler?.toDateKey ? root.ReviewScheduler.toDateKey(new Date()) : app.formatDateKey(new Date());
    }

    function getDailyStorageKey() {
      return `${getTodayKey()}::${app.selectors.activeGrade}::${app.selectors.activeDifficulty}`;
    }

    function hashString(value) {
      let hash = 0;
      for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
      }
      return hash;
    }

    function matchesDifficulty(item) {
      return app.selectors.activeDifficulty === "全部" || item.difficulty === app.selectors.activeDifficulty;
    }

    function getModuleExamples(module) {
      return (module.examples || []).filter(matchesDifficulty);
    }

    function getModulePractices(module) {
      return (module.practices || []).filter(matchesDifficulty);
    }

    function getVisibleModules() {
      const gradeMatchedModules = app.selectors.activeGrade === "全部"
        ? app.modules
        : app.modules.filter((module) => module.grades.includes(app.selectors.activeGrade));
      return gradeMatchedModules.filter((module) => getModuleExamples(module).length > 0 || getModulePractices(module).length > 0);
    }

    function getPracticePool() {
      return getVisibleModules().flatMap((module) =>
        getModulePractices(module).map((practice) => ({ ...practice, moduleId: module.id, moduleTitle: module.title, grades: module.grades }))
      );
    }

    function getDailyPracticeItems() {
      const pool = getPracticePool();
      const dailyKey = getDailyStorageKey();
      const state = app.getState();
      if (root.AdaptivePractice?.selectDailyPracticeItems) {
        return root.AdaptivePractice.selectDailyPracticeItems({
          pool,
          state,
          dailyKey,
          targetCount: Math.min(3, pool.length),
          seed: hashString(dailyKey)
        });
      }

      const seed = hashString(dailyKey);
      return [...pool]
        .map((item, index) => ({ item, score: hashString(`${seed}-${item.id}-${index}`) }))
        .sort((left, right) => left.score - right.score)
        .slice(0, Math.min(3, pool.length))
        .map((entry) => entry.item);
    }

    function isCorrectAnswer(userAnswer, practice) {
      return root.AnswerMatcher.isAnswerCorrect(userAnswer, practice.answer, {
        acceptedAnswers: practice.acceptedAnswers || []
      });
    }

    function getAnswerRecord(practiceId) {
      const state = app.getState();
      if (!state.answerHistory[practiceId]) {
        state.answerHistory[practiceId] = {
          attempts: 0,
          correct: 0,
          latestCorrect: false,
          firstCorrect: null,
          lastAnswer: ""
        };
      }
      return state.answerHistory[practiceId];
    }

    function getPracticeForReview(practice, module) {
      return {
        ...practice,
        moduleId: module?.id || practice.moduleId,
        moduleTitle: module?.title || practice.moduleTitle || "综合练习"
      };
    }

    function updateReviewQueue(practice, module, isCorrect) {
      const state = app.getState();
      const wasInWrongBook = state.wrongBook.some((item) => item.id === practice.id);
      if (isCorrect && !wasInWrongBook) {
        return;
      }

      app.setState(root.ReviewQueueModel.updateWrongBookAfterAnswer({
        state,
        practice: getPracticeForReview(practice, module),
        isCorrect,
        todayKey: getTodayKey()
      }));
    }

    function updatePracticeResult(practice, module, isCorrect, userAnswer) {
      const state = app.getState();
      const record = getAnswerRecord(practice.id);
      record.attempts += 1;
      record.lastAnswer = userAnswer;
      record.latestCorrect = isCorrect;
      record.lastAnsweredAt = new Date().toISOString();

      if (record.firstCorrect === null) {
        record.firstCorrect = isCorrect;
      }

      if (isCorrect) {
        record.correct += 1;
        state.completed[practice.id] = true;
        updateReviewQueue(practice, module, true);
        return `回答正确：${practice.explanation}`;
      }

      updateReviewQueue(practice, module, false);
      return `这题答错了。正确答案：${practice.answer}。${practice.explanation}`;
    }

    function getModuleByPracticeId(practiceId) {
      return app.modules.find((module) => module.practices.some((practice) => practice.id === practiceId));
    }

    function getActiveModule() {
      const visibleModules = getVisibleModules();
      return visibleModules.find((module) => module.id === app.selectors.activeModuleId) || visibleModules[0] || null;
    }

    function getModuleCompletedCount(moduleId, visiblePractices = null) {
      const state = app.getState();
      const completedIds = Object.entries(state.completed)
        .filter(([, value]) => value)
        .map(([key]) => key);
      const practiceIds = (visiblePractices || app.modules.find((module) => module.id === moduleId)?.practices || []).map((practice) => practice.id);
      return completedIds.filter((id) => practiceIds.includes(id)).length;
    }

    function getTotalPracticeCount() {
      return app.modules.reduce((sum, module) => sum + module.practices.length, 0);
    }

    function getCorrectRate() {
      const state = app.getState();
      if (state.stats.attempts === 0) {
        return "0%";
      }
      return `${Math.round((state.stats.correct / state.stats.attempts) * 100)}%`;
    }

    return {
      getActiveModule,
      getCorrectRate,
      getDailyPracticeItems,
      getDailyStorageKey,
      getModuleByPracticeId,
      getModuleCompletedCount,
      getModuleExamples,
      getModulePractices,
      getPracticePool,
      getTodayKey,
      getTotalPracticeCount,
      getVisibleModules,
      hashString,
      isCorrectAnswer,
      matchesDifficulty,
      updatePracticeResult
    };
  }

  const api = { createPracticeController };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MathLearningPractice = api;
})(typeof window !== "undefined" ? window : globalThis);
