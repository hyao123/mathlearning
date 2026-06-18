(function attachAdaptivePractice(root) {
  const defaultAdaptiveConfig = {
    wrongBookBoost: 42,
    latestWrongBoost: 28,
    accuracyPenaltyMax: 28,
    moduleWeaknessMax: 16,
    newItemBoost: 8,
    weakModuleThreshold: 0.5,
    maxReasonDetails: 3,
    reasonLabels: {
      wrongBook: "错题回访",
      latestWrong: "最近答错",
      lowAccuracy: "正确率偏低",
      weakModule: "薄弱模块",
      newItem: "新题探索",
      consolidation: "巩固练习"
    }
  };

  function createAdaptiveConfig(overrides = {}) {
    return {
      ...defaultAdaptiveConfig,
      ...overrides,
      reasonLabels: {
        ...defaultAdaptiveConfig.reasonLabels,
        ...(overrides.reasonLabels || {})
      }
    };
  }

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

  function getScoreBreakdown(item, pool, state, configOverrides = {}) {
    const config = createAdaptiveConfig(configOverrides);
    const record = getAnswerRecord(state, item.id);
    const attempts = Number(record?.attempts || 0);
    const correct = Number(record?.correct || 0);
    const accuracy = attempts > 0 ? correct / attempts : null;
    const completionRate = getModuleCompletionRate(pool, state, item.moduleId);
    const components = {
      wrongBookBoost: isWrongBookItem(state, item.id) ? config.wrongBookBoost : 0,
      latestWrongBoost: record && record.latestCorrect === false ? config.latestWrongBoost : 0,
      accuracyPenalty: attempts > 0 ? Math.round((1 - accuracy) * config.accuracyPenaltyMax) : 0,
      moduleWeakness: Math.round((1 - completionRate) * config.moduleWeaknessMax),
      newItemBoost: attempts === 0 ? config.newItemBoost : 0
    };

    return {
      attempts,
      correct,
      accuracy,
      completionRate,
      components,
      score: Object.values(components).reduce((sum, value) => sum + value, 0)
    };
  }

  function getWeaknessScore(item, pool, state, configOverrides = {}) {
    return getScoreBreakdown(item, pool, state, configOverrides).score;
  }

  function getRecommendationReasons(item, pool, state, configOverrides = {}) {
    const config = createAdaptiveConfig(configOverrides);
    const labels = config.reasonLabels;
    const record = getAnswerRecord(state, item.id);
    const breakdown = getScoreBreakdown(item, pool, state, config);
    const reasons = [];

    if (breakdown.components.wrongBookBoost > 0) {
      reasons.push(labels.wrongBook);
    }
    if (breakdown.components.latestWrongBoost > 0) {
      reasons.push(labels.latestWrong);
    }
    if (breakdown.components.accuracyPenalty > 0 && record) {
      reasons.push(labels.lowAccuracy);
    }
    if (breakdown.completionRate < config.weakModuleThreshold) {
      reasons.push(labels.weakModule);
    }
    if (!record) {
      reasons.push(labels.newItem);
    }

    if (reasons.length === 0) {
      reasons.push(labels.consolidation);
    }

    return [...new Set(reasons)].slice(0, config.maxReasonDetails);
  }

  function getReason(item, pool, state, configOverrides = {}) {
    return getRecommendationReasons(item, pool, state, configOverrides)[0];
  }

  function rankPracticeItems({ pool = [], state = {}, dailyKey = "", seed = 0, config = {} }) {
    const adaptiveConfig = createAdaptiveConfig(config);
    return pool
      .map((item, index) => {
        const breakdown = getScoreBreakdown(item, pool, state, adaptiveConfig);
        const reasons = getRecommendationReasons(item, pool, state, adaptiveConfig);
        const tieBreaker = stableHash(`${dailyKey}-${seed}-${item.id}-${index}`) / 10000000000;
        return {
          item: {
            ...item,
            adaptiveReason: reasons[0],
            adaptiveReasonDetails: reasons,
            adaptiveScore: breakdown.score,
            adaptiveScoreBreakdown: breakdown.components
          },
          score: breakdown.score - tieBreaker
        };
      })
      .sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title, "zh-CN"));
  }

  function selectDailyPracticeItems({ pool = [], state = {}, dailyKey = "", targetCount = 3, seed = 0, config = {} }) {
    const ranked = rankPracticeItems({ pool, state, dailyKey, seed, config });
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
    createAdaptiveConfig,
    defaultAdaptiveConfig,
    getRecommendationReasons,
    getReason,
    getScoreBreakdown,
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
