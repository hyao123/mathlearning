(function attachQuestMap(root) {
  const questStatuses = {
    cleared: {
      id: "cleared",
      label: "已通关",
      emoji: "🏁",
      order: 0
    },
    needsReview: {
      id: "needs-review",
      label: "回访关",
      emoji: "🔁",
      order: 1
    },
    current: {
      id: "current",
      label: "当前推荐",
      emoji: "🎯",
      order: 2
    },
    unlocked: {
      id: "unlocked",
      label: "可挑战",
      emoji: "✨",
      order: 3
    },
    locked: {
      id: "locked",
      label: "未解锁",
      emoji: "🔒",
      order: 4
    }
  };

  const honorTitles = [
    { title: "启程探索员", emoji: "🚇" },
    { title: "规律观察员", emoji: "🔎" },
    { title: "模型搭建师", emoji: "🧩" },
    { title: "细节检查官", emoji: "🧐" },
    { title: "思路转化师", emoji: "🔄" },
    { title: "错题修复师", emoji: "🛠️" },
    { title: "方法迁移者", emoji: "🧭" },
    { title: "综合闯关者", emoji: "🚀" },
    { title: "稳定通关王", emoji: "🏅" },
    { title: "数学小导师", emoji: "🏆" }
  ];

  const strandHonorPrefix = {
    "观察与周期": "观察线",
    "计数与集合": "计数线",
    "数量关系": "数量线",
    "变化与效率": "变化线",
    "空间与离散结构": "空间线",
    "逻辑推理": "推理线",
    "综合拓展": "综合线"
  };

  function getPracticeIds(module = {}) {
    return (module.practices || []).map((practice) => practice.id);
  }

  function getCompletedCount(module = {}, state = {}) {
    const ids = getPracticeIds(module);
    return ids.filter((id) => Boolean(state.completed?.[id])).length;
  }

  function getCompletionRate(module = {}, state = {}) {
    const total = getPracticeIds(module).length;
    return total === 0 ? 0 : getCompletedCount(module, state) / total;
  }

  function isCleared(module = {}, state = {}, mastery = null) {
    if (mastery?.status?.id === "mastered") {
      return true;
    }
    const total = getPracticeIds(module).length;
    return total > 0 && getCompletedCount(module, state) >= total;
  }

  function needsReview(mastery = null) {
    return mastery?.status?.id === "needs-review";
  }

  function getMasteryById(masteries = [], moduleId) {
    return masteries.find((item) => item.moduleId === moduleId) || null;
  }

  function getFirstOpenIndex(modules = [], state = {}, masteries = []) {
    const index = modules.findIndex((module) => !isCleared(module, state, getMasteryById(masteries, module.id)));
    return index === -1 ? modules.length - 1 : index;
  }

  function getQuestStatusForModule({ module, index, firstOpenIndex, state = {}, mastery = null }) {
    if (isCleared(module, state, mastery)) {
      return questStatuses.cleared;
    }
    if (needsReview(mastery)) {
      return questStatuses.needsReview;
    }
    if (index === firstOpenIndex) {
      return questStatuses.current;
    }
    if (index < firstOpenIndex + 2) {
      return questStatuses.unlocked;
    }
    return questStatuses.locked;
  }

  function getUnlockHint(index, firstOpenIndex, modules = []) {
    if (index <= firstOpenIndex + 1) {
      return "可以挑战这个关卡。";
    }
    const anchor = modules[firstOpenIndex];
    return anchor ? `建议先完成「${anchor.title}」再挑战这一关。` : "建议先完成前面的关卡。";
  }

  function getStationCode(index) {
    return `M${String(index + 1).padStart(2, "0")}`;
  }

  function getHonorForStation(module = {}, index = 0) {
    const baseHonor = honorTitles[Math.min(index, honorTitles.length - 1)];
    const strand = module.knowledgeTopology?.strand || "综合拓展";
    const prefix = strandHonorPrefix[strand] || strandHonorPrefix["综合拓展"];
    return {
      ...baseHonor,
      title: `${prefix} · ${baseHonor.title}`,
      description: `通关「${module.title || "当前关卡"}」后获得「${prefix}」荣誉。`
    };
  }

  function getDifficultyBonus(practice = {}) {
    const difficulty = practice.difficulty || "基础";
    if (difficulty.includes("挑战")) {
      return 6;
    }
    if (difficulty.includes("提高") || difficulty.includes("进阶")) {
      return 4;
    }
    return 2;
  }

  function calculateStationReward(module = {}, index = 0) {
    const practices = module.practices || [];
    const difficultyBonus = practices.reduce((sum, practice) => sum + getDifficultyBonus(practice), 0);
    return 30 + (index + 1) * 6 + practices.length * 4 + difficultyBonus;
  }

  function getStationReward(module = {}, index = 0) {
    const honor = getHonorForStation(module, index);
    return {
      stationCode: getStationCode(index),
      stationName: `${getStationCode(index)} · ${module.title || "学习站"}`,
      points: calculateStationReward(module, index),
      honorTitle: honor.title,
      honorEmoji: honor.emoji,
      honorDescription: honor.description
    };
  }

  function calculateQuestStates(modules = [], state = {}, masteries = []) {
    const firstOpenIndex = getFirstOpenIndex(modules, state, masteries);
    return modules.map((module, index) => {
      const mastery = getMasteryById(masteries, module.id);
      const status = getQuestStatusForModule({ module, index, firstOpenIndex, state, mastery });
      const total = getPracticeIds(module).length;
      const completed = getCompletedCount(module, state);
      const reward = getStationReward(module, index);
      return {
        moduleId: module.id,
        moduleTitle: module.title,
        index,
        levelNumber: index + 1,
        stationCode: reward.stationCode,
        stationName: reward.stationName,
        status,
        masteryStatus: mastery?.status || null,
        reward,
        completed,
        total,
        completionRate: getCompletionRate(module, state),
        hint: getUnlockHint(index, firstOpenIndex, modules)
      };
    });
  }

  function summarizeQuest(states = []) {
    const counts = Object.fromEntries(Object.values(questStatuses).map((status) => [status.id, 0]));
    states.forEach((state) => {
      counts[state.status.id] = (counts[state.status.id] || 0) + 1;
    });
    const current = states.find((state) => state.status.id === questStatuses.needsReview.id) || states.find((state) => state.status.id === questStatuses.current.id) || states.find((state) => state.status.id === questStatuses.unlocked.id) || null;
    const earnedPoints = states
      .filter((state) => state.status.id === questStatuses.cleared.id)
      .reduce((sum, state) => sum + Number(state.reward?.points || 0), 0);
    const totalPoints = states.reduce((sum, state) => sum + Number(state.reward?.points || 0), 0);
    return {
      total: states.length,
      counts,
      cleared: counts.cleared || 0,
      current,
      earnedPoints,
      totalPoints,
      progressText: `${counts.cleared || 0}/${states.length} 站已通关`,
      rewardText: `${earnedPoints}/${totalPoints} 地铁积分`
    };
  }

  function groupQuestStates(groups = [], state = {}, masteries = []) {
    return groups.map((group) => ({
      ...group,
      states: calculateQuestStates(group.modules || [], state, masteries)
    }));
  }

  const api = {
    calculateQuestStates,
    calculateStationReward,
    getCompletionRate,
    getCompletedCount,
    getFirstOpenIndex,
    getHonorForStation,
    getPracticeIds,
    getStationCode,
    getStationReward,
    groupQuestStates,
    honorTitles,
    isCleared,
    questStatuses,
    strandHonorPrefix,
    summarizeQuest
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.QuestMap = api;
})(typeof window !== "undefined" ? window : globalThis);
