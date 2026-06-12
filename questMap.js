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

  function calculateQuestStates(modules = [], state = {}, masteries = []) {
    const firstOpenIndex = getFirstOpenIndex(modules, state, masteries);
    return modules.map((module, index) => {
      const mastery = getMasteryById(masteries, module.id);
      const status = getQuestStatusForModule({ module, index, firstOpenIndex, state, mastery });
      const total = getPracticeIds(module).length;
      const completed = getCompletedCount(module, state);
      return {
        moduleId: module.id,
        moduleTitle: module.title,
        index,
        levelNumber: index + 1,
        status,
        masteryStatus: mastery?.status || null,
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
    return {
      total: states.length,
      counts,
      cleared: counts.cleared || 0,
      current,
      progressText: `${counts.cleared || 0}/${states.length} 关已通关`
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
    getCompletionRate,
    getCompletedCount,
    getFirstOpenIndex,
    getPracticeIds,
    groupQuestStates,
    isCleared,
    questStatuses,
    summarizeQuest
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.QuestMap = api;
})(typeof window !== "undefined" ? window : globalThis);
