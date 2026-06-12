(function attachRewardSystem(root) {
  const levelTiers = [
    { level: 1, title: "小小探索者", emoji: "🌱", minPoints: 0 },
    { level: 2, title: "规律发现者", emoji: "🔎", minPoints: 80 },
    { level: 3, title: "模型建造师", emoji: "🧩", minPoints: 180 },
    { level: 4, title: "错题修复师", emoji: "🛠️", minPoints: 340 },
    { level: 5, title: "奥数闯关者", emoji: "🚀", minPoints: 560 },
    { level: 6, title: "思维小达人", emoji: "⭐", minPoints: 880 },
    { level: 7, title: "数学小导师", emoji: "🏆", minPoints: 1280 }
  ];

  const badgeDefinitions = [
    {
      id: "first-attempt",
      title: "勇敢开始",
      emoji: "🌟",
      description: "完成第一次作答。",
      metric: "attempts",
      target: 1
    },
    {
      id: "first-correct",
      title: "首胜达成",
      emoji: "✅",
      description: "第一次答对题目。",
      metric: "correct",
      target: 1
    },
    {
      id: "five-completed",
      title: "五题热身",
      emoji: "🔥",
      description: "完成 5 道练习题。",
      metric: "completedCount",
      target: 5
    },
    {
      id: "ten-completed",
      title: "十题闯关",
      emoji: "🎯",
      description: "完成 10 道练习题。",
      metric: "completedCount",
      target: 10
    },
    {
      id: "streak-3",
      title: "三日连学",
      emoji: "📅",
      description: "连续学习 3 天。",
      metric: "currentStreak",
      target: 3
    },
    {
      id: "streak-7",
      title: "一周坚持",
      emoji: "🗓️",
      description: "连续学习 7 天。",
      metric: "currentStreak",
      target: 7
    },
    {
      id: "accuracy-star",
      title: "稳定命中",
      emoji: "🎖️",
      description: "至少作答 10 次，正确率达到 85%。",
      metric: "accuracyScore",
      target: 85,
      unlocks: (metrics) => metrics.attempts >= 10 && metrics.accuracy >= 0.85
    },
    {
      id: "mastery-one",
      title: "掌握一城",
      emoji: "🏅",
      description: "掌握 1 个知识点。",
      metric: "masteredCount",
      target: 1
    },
    {
      id: "mastery-three",
      title: "三点成线",
      emoji: "🌈",
      description: "掌握 3 个知识点。",
      metric: "masteredCount",
      target: 3
    },
    {
      id: "review-helper",
      title: "错题修复",
      emoji: "🧰",
      description: "至少 3 道错题进入连续答对状态。",
      metric: "reviewProgressCount",
      target: 3
    },
    {
      id: "clean-wrong-book",
      title: "错题清零",
      emoji: "🧼",
      description: "完成至少 8 道题后，错题本保持为空。",
      metric: "cleanWrongBookScore",
      target: 1,
      unlocks: (metrics) => metrics.completedCount >= 8 && metrics.wrongBookCount === 0
    },
    {
      id: "strand-explorer",
      title: "跨域探索",
      emoji: "🧭",
      description: "在 3 条不同知识主线上完成练习。",
      metric: "strandsTouched",
      target: 3
    },
    {
      id: "module-explorer",
      title: "模块探险家",
      emoji: "🗺️",
      description: "开始学习 5 个不同知识点。",
      metric: "modulesStarted",
      target: 5
    },
    {
      id: "perseverance",
      title: "坚持练习者",
      emoji: "💪",
      description: "累计作答 30 次。",
      metric: "attempts",
      target: 30
    }
  ];

  function toDateKey(value) {
    if (!value) {
      return null;
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function addDays(dateKey, offset) {
    const date = new Date(`${dateKey}T00:00:00`);
    date.setDate(date.getDate() + offset);
    return toDateKey(date);
  }

  function getAnswerHistory(state = {}) {
    return state.answerHistory || {};
  }

  function getCompletedIds(state = {}) {
    return Object.entries(state.completed || {})
      .filter(([, completed]) => Boolean(completed))
      .map(([practiceId]) => practiceId);
  }

  function getActiveDayKeys(state = {}) {
    const keys = Object.values(getAnswerHistory(state))
      .map((record) => toDateKey(record.lastAnsweredAt))
      .filter(Boolean);
    return [...new Set(keys)].sort();
  }

  function calculateCurrentStreak(activeDayKeys = [], todayKey = toDateKey(new Date())) {
    const active = new Set(activeDayKeys);
    if (active.size === 0 || !todayKey) {
      return 0;
    }
    let cursor = active.has(todayKey) ? todayKey : addDays(todayKey, -1);
    let streak = 0;
    while (active.has(cursor)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  function getPracticeModuleMap(modules = []) {
    const map = new Map();
    modules.forEach((module) => {
      (module.practices || []).forEach((practice) => {
        map.set(practice.id, module);
      });
    });
    return map;
  }

  function summarizeAnswerHistory(state = {}) {
    return Object.values(getAnswerHistory(state)).reduce(
      (summary, record) => {
        summary.attempts += Number(record.attempts || 0);
        summary.correct += Number(record.correct || 0);
        return summary;
      },
      { attempts: 0, correct: 0 }
    );
  }

  function getMasteredCount(masteries = []) {
    return masteries.filter((item) => item.status?.id === "mastered").length;
  }

  function calculateRewardMetrics({ modules = [], state = {}, masteries = [], todayKey = toDateKey(new Date()) } = {}) {
    const answerSummary = summarizeAnswerHistory(state);
    const completedIds = getCompletedIds(state);
    const moduleByPractice = getPracticeModuleMap(modules);
    const modulesStarted = new Set();
    const strandsTouched = new Set();

    completedIds.forEach((practiceId) => {
      const module = moduleByPractice.get(practiceId);
      if (module) {
        modulesStarted.add(module.id);
        strandsTouched.add(module.knowledgeTopology?.strand || "综合拓展");
      }
    });

    Object.keys(getAnswerHistory(state)).forEach((practiceId) => {
      const module = moduleByPractice.get(practiceId);
      if (module) {
        modulesStarted.add(module.id);
      }
    });

    const activeDays = getActiveDayKeys(state);
    const wrongBook = Array.isArray(state.wrongBook) ? state.wrongBook : [];
    const reviewProgressCount = wrongBook.filter((item) => Number(item.review?.correctStreak || 0) > 0).length;
    const accuracy = answerSummary.attempts === 0 ? 0 : answerSummary.correct / answerSummary.attempts;

    return {
      attempts: answerSummary.attempts,
      correct: answerSummary.correct,
      accuracy,
      accuracyScore: Math.round(accuracy * 100),
      completedCount: completedIds.length,
      activeDays: activeDays.length,
      currentStreak: calculateCurrentStreak(activeDays, todayKey),
      wrongBookCount: wrongBook.length,
      reviewProgressCount,
      masteredCount: getMasteredCount(masteries),
      modulesStarted: modulesStarted.size,
      strandsTouched: strandsTouched.size,
      cleanWrongBookScore: completedIds.length >= 8 && wrongBook.length === 0 ? 1 : 0
    };
  }

  function calculatePoints(metrics = {}) {
    const accuracyBonus = metrics.attempts >= 10 && metrics.accuracy >= 0.85 ? 50 : metrics.attempts >= 5 && metrics.accuracy >= 0.75 ? 25 : 0;
    const wrongBookPenalty = Math.min(metrics.wrongBookCount * 4, 40);
    const raw =
      metrics.completedCount * 12 +
      metrics.correct * 6 +
      metrics.attempts * 2 +
      metrics.activeDays * 6 +
      metrics.currentStreak * 8 +
      metrics.masteredCount * 55 +
      metrics.reviewProgressCount * 10 +
      metrics.strandsTouched * 15 +
      accuracyBonus -
      wrongBookPenalty;
    return Math.max(0, Math.round(raw));
  }

  function getLevel(points = 0) {
    let current = levelTiers[0];
    for (const tier of levelTiers) {
      if (points >= tier.minPoints) {
        current = tier;
      }
    }
    const next = levelTiers.find((tier) => tier.minPoints > current.minPoints) || null;
    const nextPoints = next ? next.minPoints - points : 0;
    const progress = next ? (points - current.minPoints) / (next.minPoints - current.minPoints) : 1;
    return {
      ...current,
      points,
      next,
      nextPoints: Math.max(0, nextPoints),
      progress: Math.min(Math.max(progress, 0), 1)
    };
  }

  function getMetricValue(metrics, badge) {
    return Number(metrics[badge.metric] || 0);
  }

  function isBadgeUnlocked(metrics, badge) {
    if (typeof badge.unlocks === "function") {
      return badge.unlocks(metrics);
    }
    return getMetricValue(metrics, badge) >= badge.target;
  }

  function getBadgeProgress(metrics, badge) {
    const current = Math.min(getMetricValue(metrics, badge), badge.target);
    return {
      current,
      target: badge.target,
      ratio: badge.target === 0 ? 1 : Math.min(current / badge.target, 1)
    };
  }

  function calculateBadges(metrics = {}) {
    return badgeDefinitions.map((badge) => ({
      ...badge,
      unlocked: isBadgeUnlocked(metrics, badge),
      progress: getBadgeProgress(metrics, badge)
    }));
  }

  function getNextBadge(badges = []) {
    return badges
      .filter((badge) => !badge.unlocked)
      .sort((left, right) => right.progress.ratio - left.progress.ratio || left.target - right.target)[0] || null;
  }

  function calculateRewardProfile({ modules = [], state = {}, masteries = [], todayKey = toDateKey(new Date()) } = {}) {
    const metrics = calculateRewardMetrics({ modules, state, masteries, todayKey });
    const points = calculatePoints(metrics);
    const level = getLevel(points);
    const badges = calculateBadges(metrics);
    const unlockedBadges = badges.filter((badge) => badge.unlocked);
    const nextBadge = getNextBadge(badges);
    return {
      metrics,
      points,
      level,
      badges,
      unlockedBadges,
      nextBadge,
      summary: {
        title: `${level.emoji} ${level.title}`,
        subtitle: `成长值 ${points} · 已获得 ${unlockedBadges.length}/${badges.length} 枚徽章`,
        nextLevelText: level.next ? `距离「${level.next.title}」还差 ${level.nextPoints} 成长值` : "已达到当前最高等级"
      }
    };
  }

  function diffUnlockedBadges(previousIds = [], badges = []) {
    const previous = new Set(previousIds);
    return badges.filter((badge) => badge.unlocked && !previous.has(badge.id));
  }

  const api = {
    badgeDefinitions,
    calculateBadges,
    calculateCurrentStreak,
    calculatePoints,
    calculateRewardMetrics,
    calculateRewardProfile,
    diffUnlockedBadges,
    getActiveDayKeys,
    getBadgeProgress,
    getLevel,
    getNextBadge,
    levelTiers,
    toDateKey
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.RewardSystem = api;
})(typeof window !== "undefined" ? window : globalThis);
