(function (root) {
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

  function cloneDefaultState() {
    return structuredClone(defaultState);
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

  function formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function hashString(value) {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    }
    return hash;
  }

  const api = {
    calculateStats,
    cloneDefaultState,
    defaultState,
    formatDateKey,
    hashString,
    migrateLegacyState
  };

  root.AppState = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
