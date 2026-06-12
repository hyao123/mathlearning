(function attachMasteryModel(root) {
  const masteryStatuses = {
    notStarted: {
      id: "not-started",
      label: "未开始",
      tone: "neutral",
      priority: 0
    },
    learning: {
      id: "learning",
      label: "学习中",
      tone: "active",
      priority: 1
    },
    needsReview: {
      id: "needs-review",
      label: "需复习",
      tone: "warning",
      priority: 2
    },
    mastered: {
      id: "mastered",
      label: "已掌握",
      tone: "success",
      priority: 3
    }
  };

  const defaultThresholds = {
    masteredCompletionRate: 0.8,
    masteredAccuracy: 0.85,
    reviewAccuracy: 0.65,
    reviewWrongBookRatio: 0.25
  };

  function toPercent(value) {
    return `${Math.round(Math.min(Math.max(value, 0), 1) * 100)}%`;
  }

  function getPracticeIds(module = {}) {
    return (module.practices || []).map((practice) => practice.id);
  }

  function getAnswerRecord(state = {}, practiceId) {
    return state.answerHistory?.[practiceId] || null;
  }

  function isCompleted(state = {}, practiceId) {
    return Boolean(state.completed?.[practiceId]);
  }

  function isWrongBookItem(state = {}, practiceId) {
    return (state.wrongBook || []).some((item) => item.id === practiceId);
  }

  function isDueWrongBookItem(item = {}, todayKey = "") {
    if (item.consolidated) {
      return false;
    }
    if (!item.nextReviewAt) {
      return true;
    }
    return item.nextReviewAt <= todayKey;
  }

  function getModuleWrongBookItems(module = {}, state = {}) {
    const ids = new Set(getPracticeIds(module));
    return (state.wrongBook || []).filter((item) => ids.has(item.id));
  }

  function calculateModuleStats(module = {}, state = {}, todayKey = "") {
    const practiceIds = getPracticeIds(module);
    const total = practiceIds.length;
    const completed = practiceIds.filter((id) => isCompleted(state, id)).length;
    const answeredIds = practiceIds.filter((id) => getAnswerRecord(state, id));
    const answered = answeredIds.length;
    const attempts = answeredIds.reduce((sum, id) => sum + Number(getAnswerRecord(state, id)?.attempts || 0), 0);
    const correct = answeredIds.reduce((sum, id) => sum + Number(getAnswerRecord(state, id)?.correct || 0), 0);
    const latestWrong = answeredIds.filter((id) => getAnswerRecord(state, id)?.latestCorrect === false).length;
    const wrongBookItems = getModuleWrongBookItems(module, state);
    const dueWrongBook = wrongBookItems.filter((item) => isDueWrongBookItem(item, todayKey)).length;
    const completionRate = total === 0 ? 0 : completed / total;
    const accuracy = attempts === 0 ? 0 : correct / attempts;
    const answeredRate = total === 0 ? 0 : answered / total;
    const wrongBookRatio = total === 0 ? 0 : wrongBookItems.length / total;

    return {
      total,
      completed,
      answered,
      attempts,
      correct,
      latestWrong,
      wrongBookCount: wrongBookItems.length,
      dueWrongBook,
      completionRate,
      accuracy,
      answeredRate,
      wrongBookRatio
    };
  }

  function getStatusFromStats(stats, thresholds = defaultThresholds) {
    if (stats.total === 0 || (stats.answered === 0 && stats.completed === 0 && stats.wrongBookCount === 0)) {
      return masteryStatuses.notStarted;
    }

    if (
      stats.dueWrongBook > 0 ||
      stats.latestWrong > 0 ||
      (stats.attempts > 0 && stats.accuracy < thresholds.reviewAccuracy) ||
      stats.wrongBookRatio >= thresholds.reviewWrongBookRatio
    ) {
      return masteryStatuses.needsReview;
    }

    if (
      stats.completionRate >= thresholds.masteredCompletionRate &&
      stats.accuracy >= thresholds.masteredAccuracy &&
      stats.wrongBookCount === 0
    ) {
      return masteryStatuses.mastered;
    }

    return masteryStatuses.learning;
  }

  function getReason(status, stats) {
    if (status.id === masteryStatuses.notStarted.id) {
      return "还没有开始练习这个知识点。";
    }
    if (status.id === masteryStatuses.mastered.id) {
      return `完成率 ${toPercent(stats.completionRate)}，正确率 ${toPercent(stats.accuracy)}，暂无待复习错题。`;
    }
    if (stats.dueWrongBook > 0) {
      return `有 ${stats.dueWrongBook} 道今日待复习错题。`;
    }
    if (stats.latestWrong > 0) {
      return `最近仍有 ${stats.latestWrong} 道题答错。`;
    }
    if (stats.wrongBookCount > 0) {
      return `错题本中还有 ${stats.wrongBookCount} 道相关题。`;
    }
    return `已完成 ${stats.completed}/${stats.total} 题，正确率 ${toPercent(stats.accuracy)}。`;
  }

  function calculateMasteryScore(stats) {
    if (stats.total === 0) {
      return 0;
    }
    const completionScore = stats.completionRate * 45;
    const accuracyScore = stats.accuracy * 35;
    const activityScore = stats.answeredRate * 10;
    const stabilityScore = Math.max(0, 10 - stats.wrongBookRatio * 30 - stats.latestWrong * 4);
    return Math.round(Math.min(100, completionScore + accuracyScore + activityScore + stabilityScore));
  }

  function calculateModuleMastery(module = {}, state = {}, options = {}) {
    const thresholds = { ...defaultThresholds, ...(options.thresholds || {}) };
    const todayKey = options.todayKey || "";
    const stats = calculateModuleStats(module, state, todayKey);
    const status = getStatusFromStats(stats, thresholds);
    const score = calculateMasteryScore(stats);
    return {
      moduleId: module.id,
      moduleTitle: module.title,
      strand: module.knowledgeTopology?.strand || "综合拓展",
      stage: module.knowledgeTopology?.stage || "模型迁移",
      status,
      score,
      scoreText: `${score} 分`,
      reason: getReason(status, stats),
      stats: {
        ...stats,
        completionRateText: toPercent(stats.completionRate),
        accuracyText: stats.attempts === 0 ? "暂无" : toPercent(stats.accuracy)
      }
    };
  }

  function calculateAllMastery(modules = [], state = {}, options = {}) {
    return modules.map((module) => calculateModuleMastery(module, state, options));
  }

  function summarizeMastery(masteries = []) {
    const counts = Object.fromEntries(Object.values(masteryStatuses).map((status) => [status.id, 0]));
    masteries.forEach((item) => {
      counts[item.status.id] = (counts[item.status.id] || 0) + 1;
    });
    const total = masteries.length;
    const averageScore = total === 0 ? 0 : Math.round(masteries.reduce((sum, item) => sum + item.score, 0) / total);
    const needsReview = masteries.filter((item) => item.status.id === masteryStatuses.needsReview.id);
    const nextLearning = masteries.find((item) => item.status.id === masteryStatuses.learning.id) || masteries.find((item) => item.status.id === masteryStatuses.notStarted.id) || null;
    return {
      total,
      averageScore,
      counts,
      needsReview,
      nextLearning
    };
  }

  function getMasteryByModuleId(masteries = [], moduleId) {
    return masteries.find((item) => item.moduleId === moduleId) || null;
  }

  const api = {
    calculateAllMastery,
    calculateMasteryScore,
    calculateModuleMastery,
    calculateModuleStats,
    defaultThresholds,
    getMasteryByModuleId,
    getPracticeIds,
    getStatusFromStats,
    isDueWrongBookItem,
    masteryStatuses,
    summarizeMastery,
    toPercent
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MasteryModel = api;
})(typeof window !== "undefined" ? window : globalThis);
