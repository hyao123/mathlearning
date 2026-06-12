(function attachAdaptivePractice(root) {
  function stableHash(value) {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    }
    return hash;
  }

  function getAnswerRecord(state, practiceId) {
    return state?.answerHistory?.[practiceId] || null;
  }

  function isWrongBookItem(state, practiceId) {
    return Array.isArray(state?.wrongBook) && state.wrongBook.some((item) => item.id === practiceId);
  }

  function getModuleCompletionRate(pool, state, moduleId) {
    const moduleItems = pool.filter((item) => item.moduleId === moduleId);
    if (moduleItems.length === 0) {
      return 0;
    }
    const completedCount = moduleItems.filter((item) => state?.completed?.[item.id]).length;
    return completedCount / moduleItems.length;
  }

  function getWeaknessScore(item, pool, state) {
    const record = getAnswerRecord(state, item.id);
    const attempts = Number(record?.attempts || 0);
    const correct = Number(record?.correct || 0);
    const latestWrong = record && record.latestCorrect === false ? 28 : 0;
    const wrongBookBoost = isWrongBookItem(state, item.id) ? 42 : 0;
    const accuracyPenalty = attempts > 0 ? Math.round((1 - correct / attempts) * 28) : 0;
    const completionRate = getModuleCompletionRate(pool, state, item.moduleId);
    const moduleWeakness = Math.round((1 - completionRate) * 16);
    const newItemBoost = attempts === 0 ? 8 : 0;
    return wrongBookBoost + latestWrong + accuracyPenalty + moduleWeakness + newItemBoost;
  }

  function getReason(item, pool, state) {
    const record = getAnswerRecord(state, item.id);
    if (isWrongBookItem(state, item.id)) {
      return "错题回访";
    }
    if (record?.latestCorrect === false) {
      return "最近答错";
    }
    if (!record) {
      return "新题探索";
    }
    const completionRate = getModuleCompletionRate(pool, state, item.moduleId);
    if (completionRate < 0.5) {
      return "薄弱模块";
    }
    return "巩固练习";
  }

  function rankPracticeItems({ pool = [], state = {}, dailyKey = "", seed = 0 }) {
    return pool
      .map((item, index) => {
        const weaknessScore = getWeaknessScore(item, pool, state);
        const tieBreaker = stableHash(`${dailyKey}-${seed}-${item.id}-${index}`) / 10000000000;
        return {
          item: { ...item, adaptiveReason: getReason(item, pool, state), adaptiveScore: weaknessScore },
          score: weaknessScore - tieBreaker
        };
      })
      .sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title, "zh-CN"));
  }

  function selectDailyPracticeItems({ pool = [], state = {}, dailyKey = "", targetCount = 3, seed = 0 }) {
    const ranked = rankPracticeItems({ pool, state, dailyKey, seed });
    const selected = [];
    const selectedIds = new Set();

    ranked.forEach((entry) => {
      if (selected.length >= targetCount || selectedIds.has(entry.item.id)) {
        return;
      }
      selected.push(entry.item);
      selectedIds.add(entry.item.id);
    });

    return selected;
  }

  const api = {
    getReason,
    getWeaknessScore,
    rankPracticeItems,
    selectDailyPracticeItems,
    stableHash
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.AdaptivePractice = api;
})(typeof window !== "undefined" ? window : globalThis);
