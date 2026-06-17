(function attachMathLearningState(root) {
  const defaultState = {
    completed: {},
    wrongBook: [],
    dailyPractice: {},
    paperGenerator: {
      grade: "全部",
      difficulty: "全部",
      count: 5,
      source: "random",
      practiceIds: [],
      answers: {}
    },
    answerHistory: {},
    stats: {
      attempts: 0,
      correct: 0
    }
  };

  function cloneValue(value) {
    if (typeof root.structuredClone === "function") {
      return root.structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
  }

  function cloneDefaultState() {
    return cloneValue(defaultState);
  }

  function calculateStats(answerHistory) {
    return Object.values(answerHistory || {}).reduce(
      (stats, record) => {
        stats.attempts += Number(record.attempts || 0);
        stats.correct += Number(record.correct || 0);
        return stats;
      },
      { attempts: 0, correct: 0 }
    );
  }

  function migrateLegacyState(parsed = {}) {
    const nextState = cloneDefaultState();
    nextState.completed = parsed.completed || {};
    nextState.wrongBook = Array.isArray(parsed.wrongBook) ? parsed.wrongBook : [];
    nextState.dailyPractice = parsed.dailyPractice || {};
    nextState.paperGenerator = {
      grade: parsed.paperGenerator?.grade || "全部",
      difficulty: parsed.paperGenerator?.difficulty || "全部",
      count: Number(parsed.paperGenerator?.count || 5),
      source: parsed.paperGenerator?.source || "random",
      practiceIds: Array.isArray(parsed.paperGenerator?.practiceIds) ? parsed.paperGenerator.practiceIds : [],
      answers: parsed.paperGenerator?.answers || {}
    };
    nextState.answerHistory = parsed.answerHistory || {};

    if (Object.keys(nextState.answerHistory).length === 0) {
      Object.entries(nextState.completed).forEach(([practiceId, completed]) => {
        if (completed) {
          nextState.answerHistory[practiceId] = {
            attempts: 1,
            correct: 1,
            latestCorrect: true,
            firstCorrect: true
          };
        }
      });
      nextState.wrongBook.forEach((item) => {
        if (!nextState.answerHistory[item.id]) {
          nextState.answerHistory[item.id] = {
            attempts: 1,
            correct: 0,
            latestCorrect: false,
            firstCorrect: false
          };
        }
      });
    }

    nextState.stats = calculateStats(nextState.answerHistory);
    return nextState;
  }

  function createStateStore({ storageKey, legacyStorageKey, storage = root.localStorage } = {}) {
    function loadState() {
      try {
        const saved = storage?.getItem(storageKey) || storage?.getItem(legacyStorageKey);
        return saved ? migrateLegacyState(JSON.parse(saved)) : cloneDefaultState();
      } catch (error) {
        return cloneDefaultState();
      }
    }

    let state = loadState();

    function getState() {
      return state;
    }

    function setState(nextState) {
      state = nextState || cloneDefaultState();
      return state;
    }

    function recalculateStats() {
      state.stats = calculateStats(state.answerHistory);
      return state.stats;
    }

    function saveState() {
      recalculateStats();
      storage?.setItem(storageKey, JSON.stringify(state));
    }

    return {
      getState,
      setState,
      saveState,
      recalculateStats
    };
  }

  const api = {
    calculateStats,
    cloneDefaultState,
    createStateStore,
    defaultState,
    migrateLegacyState
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MathLearningState = api;
})(typeof window !== "undefined" ? window : globalThis);
