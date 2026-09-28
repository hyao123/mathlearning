// achievementModel.js - Commercial Grade Achievement and Military Honor System
const ACHIEVEMENTS_STORAGE_KEY = "math-quest-achievements-v1";

const ACHIEVEMENT_DEFINITIONS = [
  {
    id: "first_victory",
    title: "启航之星",
    description: "完成首道数学关卡解算，成功启动大国重器建造序列",
    icon: "⭐",
    badgeClass: "badge-bronze",
    category: "combat",
    points: 10,
    check: (state, campaign, context) => {
      if (context?.solvedCount > 0) return { unlocked: true, current: 1, max: 1 };
      if ((state?.streak || 0) > 0) return { unlocked: true, current: 1, max: 1 };
      if ((state?.activeRun?.correctCount || 0) > 0) return { unlocked: true, current: 1, max: 1 };
      if (Object.keys(state?.claimedFixedRewards || {}).length > 0) return { unlocked: true, current: 1, max: 1 };
      const records = state?.levelRecords || {};
      const hasSolved = Object.values(records).some((r) => (r?.correctCount || 0) > 0);
      if (hasSolved) return { unlocked: true, current: 1, max: 1 };
      const settlements = state?.attemptSettlements || {};
      const hasSettled = Object.values(settlements).some((s) => s?.resolution === "correct" || s?.resolution === "solved");
      return { unlocked: hasSettled, current: hasSettled ? 1 : 0, max: 1 };
    }
  },
  {
    id: "streak_3",
    title: "锋芒毕露",
    description: "在推演中保持专注，达成 3 连击连续破解",
    icon: "🔥",
    badgeClass: "badge-bronze",
    category: "combat",
    points: 20,
    check: (state, campaign, context) => {
      const maxStreak = Math.max(state?.streak || 0, context?.maxStreak || 0);
      return { unlocked: maxStreak >= 3, current: Math.min(maxStreak, 3), max: 3 };
    }
  },
  {
    id: "streak_6",
    title: "势如破竹",
    description: "心流爆发！连续解算 6 道题目无一失误",
    icon: "⚡",
    badgeClass: "badge-silver",
    category: "combat",
    points: 40,
    check: (state, campaign, context) => {
      const maxStreak = Math.max(state?.streak || 0, context?.maxStreak || 0);
      return { unlocked: maxStreak >= 6, current: Math.min(maxStreak, 6), max: 6 };
    }
  },
  {
    id: "streak_10",
    title: "百步穿杨",
    description: "不可思议的计算力！达成 10 连胜巅峰神迹",
    icon: "🎯",
    badgeClass: "badge-gold",
    category: "combat",
    points: 80,
    check: (state, campaign, context) => {
      const maxStreak = Math.max(state?.streak || 0, context?.maxStreak || 0);
      return { unlocked: maxStreak >= 10, current: Math.min(maxStreak, 10), max: 10 };
    }
  },
  {
    id: "first_craft",
    title: "智能制造",
    description: "在工业总装车间合成第一件先进工业级材料",
    icon: "🛠️",
    badgeClass: "badge-bronze",
    category: "industrial",
    points: 15,
    check: (state, campaign, context) => {
      const count = Object.keys(state?.craftedProjectRecipeIds || {}).length;
      return { unlocked: count > 0, current: Math.min(count, 1), max: 1 };
    }
  },
  {
    id: "first_assembly",
    title: "大国重器",
    description: "全模块契合装配！总装落成第一座战略级国家工程",
    icon: "🚀",
    badgeClass: "badge-gold",
    category: "industrial",
    points: 50,
    check: (state, campaign, context) => {
      let completedProjects = 0;
      if (campaign?.chapterStates) {
        Object.values(campaign.chapterStates).forEach((cs) => {
          if (cs?.craftedProjectRecipeIds && Object.keys(cs.craftedProjectRecipeIds).length >= 4) {
            completedProjects++;
          }
        });
      }
      if (state?.craftedProjectRecipeIds && Object.keys(state.craftedProjectRecipeIds).length >= 4) {
        completedProjects = Math.max(completedProjects, 1);
      }
      if (context?.completedProjectCount) {
        completedProjects = Math.max(completedProjects, context.completedProjectCount);
      }
      return { unlocked: completedProjects >= 1, current: Math.min(completedProjects, 1), max: 1 };
    }
  },
  {
    id: "chapter_clear",
    title: "星域拓荒",
    description: "全面通关任一主题战区的所有科研攻关关卡",
    icon: "🌌",
    badgeClass: "badge-silver",
    category: "strategic",
    points: 30,
    check: (state, campaign, context) => {
      const checkChapterCleared = (st) => {
        if (!st?.levelRecords) return false;
        const records = Object.values(st.levelRecords);
        return records.length >= 10 && records.every((r) => (r?.correctCount || 0) >= 7);
      };
      let cleared = checkChapterCleared(state);
      if (!cleared && campaign?.chapterStates) {
        cleared = Object.values(campaign.chapterStates).some(checkChapterCleared);
      }
      if (context?.hasClearedChapter) cleared = true;
      return { unlocked: cleared, current: cleared ? 1 : 0, max: 1 };
    }
  },
  {
    id: "speed_master",
    title: "零失误解算",
    description: "单关 10 题一气呵成，0 跳过且满分通关",
    icon: "💎",
    badgeClass: "badge-gold",
    category: "academic",
    points: 50,
    check: (state, campaign, context) => {
      const checkPerfect = (st) => {
        if (!st?.levelRecords) return false;
        return Object.values(st.levelRecords).some(
          (r) => (r?.correctCount || 0) >= 10 && (r?.skippedCount || 0) === 0
        );
      };
      let perfect = checkPerfect(state);
      if (!perfect && campaign?.chapterStates) {
        perfect = Object.values(campaign.chapterStates).some(checkPerfect);
      }
      if (context?.hasPerfectLevel) perfect = true;
      return { unlocked: perfect, current: perfect ? 1 : 0, max: 1 };
    }
  },
  {
    id: "fleet_admiral",
    title: "空天统帅",
    description: "总装落成全部 9 大国之重器旗舰项目，打造无敌科研矩阵",
    icon: "👑",
    badgeClass: "badge-platinum",
    category: "strategic",
    points: 100,
    check: (state, campaign, context) => {
      let count = 0;
      if (campaign?.chapterStates) {
        Object.values(campaign.chapterStates).forEach((cs) => {
          if (cs?.craftedProjectRecipeIds && Object.keys(cs.craftedProjectRecipeIds).length >= 4) {
            count++;
          }
        });
      }
      if (context?.totalCompletedProjects) {
        count = Math.max(count, context.totalCompletedProjects);
      }
      return { unlocked: count >= 9, current: Math.min(count, 9), max: 9 };
    }
  },
  {
    id: "math_grandmaster",
    title: "奥数泰斗",
    description: "在解题征程中累计完成 30 道以上高难度数学建模题目",
    icon: "🧠",
    badgeClass: "badge-platinum",
    category: "academic",
    points: 60,
    check: (state, campaign, context) => {
      let totalSolved = 0;
      const countStateSolved = (st) => {
        if (!st) return 0;
        let c = 0;
        if (st.levelRecords) {
          c += Object.values(st.levelRecords).reduce((acc, r) => acc + (r?.correctCount || 0), 0);
        }
        if (st.claimedFixedRewards) {
          c = Math.max(c, Object.keys(st.claimedFixedRewards).length);
        }
        if (st.activeRun?.correctCount) {
          c = Math.max(c, st.activeRun.correctCount);
        }
        return c;
      };
      if (campaign?.chapterStates) {
        Object.values(campaign.chapterStates).forEach((cs) => {
          totalSolved += countStateSolved(cs);
        });
      } else {
        totalSolved = countStateSolved(state);
      }
      if (context?.totalSolvedQuestions) {
        totalSolved = Math.max(totalSolved, context.totalSolvedQuestions);
      }
      return { unlocked: totalSolved >= 30, current: Math.min(totalSolved, 30), max: 30 };
    }
  }
];

function loadSavedAchievements() {
  try {
    if (typeof localStorage === "undefined") return { unlocked: {}, maxStreak: 0 };
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!raw) return { unlocked: {}, maxStreak: 0 };
    const parsed = JSON.parse(raw);
    return {
      unlocked: parsed?.unlocked && typeof parsed.unlocked === "object" ? parsed.unlocked : {},
      maxStreak: Number.isInteger(parsed?.maxStreak) && parsed.maxStreak >= 0 ? parsed.maxStreak : 0
    };
  } catch {
    return { unlocked: {}, maxStreak: 0 };
  }
}

function saveAchievements(saved) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Ignore storage write failures
  }
}

function evaluateAchievements(state, campaign, customSaved = null) {
  const saved = customSaved || loadSavedAchievements();
  const currentStreak = state?.streak || 0;
  if (currentStreak > saved.maxStreak) {
    saved.maxStreak = currentStreak;
    saveAchievements(saved);
  }

  const context = {
    maxStreak: saved.maxStreak
  };

  let totalPoints = 0;
  let maxPoints = 0;
  const unlockedIds = [];
  const list = ACHIEVEMENT_DEFINITIONS.map((def) => {
    maxPoints += def.points;
    const previouslyUnlocked = Boolean(saved.unlocked[def.id]);
    const evalResult = def.check(state, campaign, context);
    const isUnlocked = previouslyUnlocked || evalResult.unlocked;

    if (isUnlocked) {
      totalPoints += def.points;
      unlockedIds.push(def.id);
      if (!previouslyUnlocked) {
        saved.unlocked[def.id] = Date.now();
        saveAchievements(saved);
      }
    }

    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      badgeClass: def.badgeClass,
      category: def.category,
      points: def.points,
      unlocked: isUnlocked,
      current: isUnlocked ? evalResult.max : evalResult.current,
      max: evalResult.max,
      unlockedAt: saved.unlocked[def.id] || null
    };
  });

  return {
    list,
    unlockedIds,
    totalPoints,
    maxPoints,
    unlockCount: unlockedIds.length,
    totalCount: ACHIEVEMENT_DEFINITIONS.length,
    saved
  };
}

function getNewlyUnlockedAchievements(previousUnlockedIds, currentResult) {
  const prevSet = new Set(Array.isArray(previousUnlockedIds) ? previousUnlockedIds : []);
  return currentResult.list.filter((ach) => ach.unlocked && !prevSet.has(ach.id));
}

module.exports = {
  ACHIEVEMENTS_STORAGE_KEY,
  ACHIEVEMENT_DEFINITIONS,
  loadSavedAchievements,
  saveAchievements,
  evaluateAchievements,
  getNewlyUnlockedAchievements
};
