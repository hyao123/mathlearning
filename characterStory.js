(function attachCharacterStory(root) {
  const progressStorageKey = "mathlearning-progress-v2";
  let scheduled = false;

  const characterStages = [
    { minLevel: 1, name: "阿圆", role: "规律线乘务员", emoji: "🐣", line: "我会陪你从第一站开始，先看清规律，再大胆作答。" },
    { minLevel: 2, name: "小探", role: "模型侦探", emoji: "🕵️", line: "你已经能发现线索了，下一步是把线索变成模型。" },
    { minLevel: 3, name: "咕噜", role: "模型工程师", emoji: "🧩", line: "我们开始搭建自己的解题工具箱，每一站都是一个新零件。" },
    { minLevel: 4, name: "修修", role: "错题维修师", emoji: "🛠️", line: "错题不是失败，是地图上亮起的维修点。" },
    { minLevel: 5, name: "星车长", role: "地铁车长", emoji: "🚇", line: "你已经能自己开动数学小火车，继续去下一条线换乘吧。" },
    { minLevel: 6, name: "小导师", role: "思维讲解员", emoji: "⭐", line: "试着把解法讲给别人听，真正掌握就是能说清楚。" },
    { minLevel: 7, name: "冠军喵", role: "奥数总站长", emoji: "🏆", line: "全城线路都在等你点亮，综合挑战就是你的舞台。" }
  ];

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function readState() {
    try {
      return safeParse(root.localStorage?.getItem(progressStorageKey), {});
    } catch (error) {
      return {};
    }
  }

  function getTodayKey() {
    if (root.ReviewScheduler?.toDateKey) {
      return root.ReviewScheduler.toDateKey(new Date());
    }
    if (root.RewardSystem?.toDateKey) {
      return root.RewardSystem.toDateKey(new Date());
    }
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function getMasteries(state) {
    if (!root.MasteryModel?.calculateAllMastery || !Array.isArray(root.MATH_LEARNING_DATA)) {
      return [];
    }
    return root.MasteryModel.calculateAllMastery(root.MATH_LEARNING_DATA, state, { todayKey: getTodayKey() });
  }

  function getRewardProfile() {
    if (!root.RewardSystem?.calculateRewardProfile) {
      return null;
    }
    const state = readState();
    return root.RewardSystem.calculateRewardProfile({
      modules: root.MATH_LEARNING_DATA || [],
      state,
      masteries: getMasteries(state),
      todayKey: getTodayKey()
    });
  }

  function getCharacter(level = 1) {
    return [...characterStages].reverse().find((stage) => level >= stage.minLevel) || characterStages[0];
  }

  function getStoryChapter(profile) {
    const unlockedCount = profile.unlockedBadges.length;
    if (unlockedCount === 0) {
      return "序章：数学地铁刚刚发车，完成第一道题就能点亮第一枚徽章。";
    }
    if (unlockedCount < 4) {
      return `第一章：你已经收集 ${unlockedCount} 枚徽章，正在熟悉每条地铁线的基础站。`;
    }
    if (unlockedCount < 8) {
      return `第二章：${unlockedCount} 枚徽章让你的列车升级，可以挑战更多换乘站。`;
    }
    if (unlockedCount < profile.badges.length) {
      return `第三章：你已经拥有 ${unlockedCount} 枚徽章，开始向总站长任务前进。`;
    }
    return "终章：徽章墙已全部点亮，你成为数学地铁总站长！";
  }

  function createElement(tagName, className, textContent = "") {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (textContent) {
      element.textContent = textContent;
    }
    return element;
  }

  function ensurePanel() {
    let panel = document.getElementById("character-story-panel");
    if (panel) {
      return panel;
    }
    const rewardPanel = document.getElementById("reward-system-panel");
    const hero = document.querySelector(".hero");
    if (!rewardPanel && !hero) {
      return null;
    }
    panel = document.createElement("section");
    panel.id = "character-story-panel";
    panel.className = "character-story-panel";
    (rewardPanel || hero).insertAdjacentElement("afterend", panel);
    return panel;
  }

  function createBadgeStory(badge) {
    const item = createElement("article", `character-story-badge${badge.unlocked ? " is-unlocked" : ""}`);
    item.append(
      createElement("span", "", badge.unlocked ? badge.emoji : "🔒"),
      createElement("strong", "", badge.title),
      createElement("small", "", badge.unlocked ? badge.description : `${badge.progress.current}/${badge.progress.target}`)
    );
    return item;
  }

  function renderStory() {
    const profile = getRewardProfile();
    const panel = ensurePanel();
    if (!profile || !panel) {
      return;
    }
    const character = getCharacter(profile.level.level);
    const nextBadge = profile.nextBadge;
    const recentBadges = profile.badges
      .filter((badge) => badge.unlocked)
      .slice(-3)
      .reverse();
    panel.innerHTML = "";

    const hero = createElement("div", "character-story-hero");
    const avatar = createElement("div", "character-story-avatar", character.emoji);
    const text = createElement("div", "character-story-text");
    text.append(
      createElement("span", "character-story-eyebrow", "角色剧情 · 数学地铁小队"),
      createElement("h3", "", `${character.name} · ${character.role}`),
      createElement("p", "", character.line)
    );
    const level = createElement("div", "character-story-level");
    level.append(createElement("span", "", "当前等级"), createElement("strong", "", `Lv.${profile.level.level}`));
    hero.append(avatar, text, level);

    const chapter = createElement("div", "character-story-chapter");
    chapter.append(createElement("strong", "", getStoryChapter(profile)), createElement("p", "", profile.summary.nextLevelText));

    const quest = createElement("div", "character-story-quest");
    quest.appendChild(createElement("h4", "", "下一段剧情任务"));
    if (nextBadge) {
      const progress = Math.round(nextBadge.progress.ratio * 100);
      const bar = createElement("span", "character-story-progress");
      const fill = createElement("i", "");
      fill.style.width = `${progress}%`;
      bar.appendChild(fill);
      quest.append(
        createElement("p", "", `解锁「${nextBadge.emoji} ${nextBadge.title}」：${nextBadge.description}`),
        createElement("small", "", `${nextBadge.progress.current}/${nextBadge.progress.target}`),
        bar
      );
    } else {
      quest.appendChild(createElement("p", "", "全部徽章剧情已解锁，继续用综合卷保持手感。"));
    }

    const badges = createElement("div", "character-story-badges");
    badges.appendChild(createElement("h4", "", "最近点亮的徽章"));
    const badgeList = createElement("div", "character-story-badge-list");
    const visibleBadges = recentBadges.length > 0 ? recentBadges : profile.badges.slice(0, 3);
    visibleBadges.forEach((badge) => badgeList.appendChild(createBadgeStory(badge)));
    badges.appendChild(badgeList);

    panel.append(hero, chapter, quest, badges);
  }

  function scheduleRender() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    const callback = () => {
      scheduled = false;
      renderStory();
    };
    if (root.requestAnimationFrame) {
      root.requestAnimationFrame(callback);
    } else {
      root.setTimeout(callback, 0);
    }
  }

  function observe() {
    if (!("MutationObserver" in root)) {
      return;
    }
    ["reward-system-panel", "hero-stats", "practice-list", "wrong-book-list"].forEach((id) => {
      const element = document.getElementById(id);
      if (!element) {
        return;
      }
      const observer = new MutationObserver(scheduleRender);
      observer.observe(element, { childList: true, subtree: true, characterData: true });
    });
    root.addEventListener?.("storage", scheduleRender);
  }

  function boot() {
    if (typeof document === "undefined") {
      return;
    }
    renderStory();
    observe();
  }

  const api = {
    characterStages,
    getCharacter,
    renderStory
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.CharacterStory = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
