(function attachRouteMission(root) {
  const progressStorageKey = "mathlearning-progress-v2";
  let scheduled = false;

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function readState() {
    try {
      return safeParse(root.localStorage?.getItem(progressStorageKey), { completed: {}, wrongBook: [], answerHistory: {} });
    } catch (error) {
      return { completed: {}, wrongBook: [], answerHistory: {} };
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

  function toDateKey(value) {
    if (!value) {
      return "";
    }
    if (root.RewardSystem?.toDateKey) {
      return root.RewardSystem.toDateKey(value) || "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function getModules() {
    return Array.isArray(root.MATH_LEARNING_DATA) ? root.MATH_LEARNING_DATA : [];
  }

  function getMasteries(state) {
    if (!root.MasteryModel?.calculateAllMastery) {
      return [];
    }
    return root.MasteryModel.calculateAllMastery(getModules(), state, { todayKey: getTodayKey() });
  }

  function getQuestStates(state) {
    if (!root.QuestMap?.calculateQuestStates) {
      return [];
    }
    return root.QuestMap.calculateQuestStates(getModules(), state, getMasteries(state));
  }

  function getRewardProfile(state, masteries) {
    if (!root.RewardSystem?.calculateRewardProfile) {
      return null;
    }
    return root.RewardSystem.calculateRewardProfile({ modules: getModules(), state, masteries, todayKey: getTodayKey() });
  }

  function getCardTitle(card) {
    return card.querySelector("strong")?.textContent?.trim() || "";
  }

  function findModuleCard(moduleTitle) {
    const cards = Array.from(document.querySelectorAll("#knowledge-mode-list .knowledge-mode-card, #module-list .module-path__item"));
    return cards.find((card) => getCardTitle(card) === moduleTitle) || null;
  }

  function openModule(moduleTitle) {
    const card = findModuleCard(moduleTitle);
    if (card) {
      card.click();
      return;
    }
    document.getElementById("modules")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToWrongPractice() {
    const button = document.getElementById("generate-wrong-paper");
    if (button) {
      button.click();
    }
    document.getElementById("paper-generator-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  function createButton(text, className, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = text;
    button.addEventListener("click", onClick);
    return button;
  }

  function ensurePanel() {
    let panel = document.getElementById("route-mission-panel");
    if (panel) {
      return panel;
    }
    const dailyPanel = document.getElementById("daily-practice-panel");
    const header = dailyPanel?.querySelector(".panel__header");
    if (!dailyPanel || !header) {
      return null;
    }
    panel = document.createElement("section");
    panel.id = "route-mission-panel";
    panel.className = "route-mission-panel";
    header.insertAdjacentElement("afterend", panel);
    return panel;
  }

  function getNextStation(questStates, current) {
    if (!current) {
      return questStates.find((station) => station.status?.id !== root.QuestMap?.questStatuses?.locked?.id) || null;
    }
    const index = questStates.findIndex((station) => station.moduleId === current.moduleId);
    return questStates.slice(index + 1).find((station) => station.status?.id !== root.QuestMap?.questStatuses?.locked?.id) || questStates[index + 1] || null;
  }

  function countTodayAnswers(state) {
    const todayKey = getTodayKey();
    return Object.values(state.answerHistory || {}).filter((record) => toDateKey(record.lastAnsweredAt) === todayKey).length;
  }

  function buildMissions() {
    const state = readState();
    const masteries = getMasteries(state);
    const questStates = getQuestStates(state);
    const summary = root.QuestMap?.summarizeQuest ? root.QuestMap.summarizeQuest(questStates) : { current: questStates[0] || null };
    const current = summary.current || questStates.find((station) => station.status?.id === "current") || questStates[0] || null;
    const next = getNextStation(questStates, current);
    const dueWrongBook = root.ReviewQueueModel?.getDueWrongBookItems ? root.ReviewQueueModel.getDueWrongBookItems(state, getTodayKey()) : state.wrongBook || [];
    const reward = getRewardProfile(state, masteries);
    const todayAnswers = countTodayAnswers(state);

    return [
      {
        id: "repair",
        emoji: "🛠️",
        title: "维修任务",
        status: dueWrongBook.length > 0 ? `${dueWrongBook.length} 道待复习错题` : "暂无到期错题",
        detail: dueWrongBook.length > 0 ? "先修补错因，再开新站。" : "可以直接进入主线任务。",
        actionText: dueWrongBook.length > 0 ? "错题组卷" : "查看错因地图",
        onClick: dueWrongBook.length > 0 ? scrollToWrongPractice : () => document.getElementById("wrong-book")?.scrollIntoView({ behavior: "smooth", block: "start" })
      },
      {
        id: "mainline",
        emoji: "🚇",
        title: "主线任务",
        status: current ? `${current.stationCode}「${current.moduleTitle}」` : "等待路线生成",
        detail: current ? current.hint || "完成当前站闯关。" : "先完成入门诊断或打开学习地图。",
        actionText: "进入当前站",
        onClick: () => current && openModule(current.moduleTitle)
      },
      {
        id: "explore",
        emoji: "🔭",
        title: "探索任务",
        status: next ? `${next.stationCode}「${next.moduleTitle}」` : "全线复盘",
        detail: next ? "预览下一站，建立知识连接。" : "可用随机组卷保持手感。",
        actionText: next ? "看看下一站" : "随机组卷",
        onClick: () => {
          if (next) {
            openModule(next.moduleTitle);
          } else {
            document.getElementById("generate-paper")?.click();
            document.getElementById("paper-generator-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      },
      {
        id: "reward",
        emoji: "🏅",
        title: "奖励任务",
        status: reward?.nextBadge ? `${reward.nextBadge.emoji} ${reward.nextBadge.title}` : `今日已作答 ${todayAnswers} 次`,
        detail: reward?.nextBadge ? reward.nextBadge.description : "继续完成每日一练，保持学习连续性。",
        actionText: "查看徽章剧情",
        onClick: () => document.getElementById("character-story-panel")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    ];
  }

  function renderMissionCard(mission) {
    const card = createElement("article", `route-mission-card route-mission-card--${mission.id}`);
    const icon = createElement("span", "route-mission-icon", mission.emoji);
    const body = createElement("div", "route-mission-card__body");
    body.append(createElement("span", "route-mission-card__label", mission.title), createElement("strong", "", mission.status), createElement("p", "", mission.detail));
    card.append(icon, body, createButton(mission.actionText, "button button--small button--ghost", mission.onClick));
    return card;
  }

  function renderRouteMission() {
    const panel = ensurePanel();
    if (!panel) {
      return;
    }
    const missions = buildMissions();
    panel.innerHTML = "";
    const header = createElement("div", "route-mission-header");
    const title = createElement("div", "");
    title.append(createElement("span", "route-mission-eyebrow", "今日路线任务"), createElement("h3", "", "先维修，再进站，最后领奖励"));
    header.append(title, createElement("span", "route-mission-badge", getTodayKey()));
    const list = createElement("div", "route-mission-list");
    missions.forEach((mission) => list.appendChild(renderMissionCard(mission)));
    panel.append(header, list);
  }

  function scheduleRender() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    const callback = () => {
      scheduled = false;
      renderRouteMission();
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
    ["daily-practice-list", "wrong-book-list", "module-list", "knowledge-mode-list", "reward-system-panel"].forEach((id) => {
      const element = document.getElementById(id);
      if (!element) {
        return;
      }
      const observer = new MutationObserver(scheduleRender);
      observer.observe(element, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class", "hidden"] });
    });
    root.addEventListener?.("storage", scheduleRender);
  }

  function boot() {
    if (typeof document === "undefined") {
      return;
    }
    renderRouteMission();
    observe();
  }

  const api = {
    buildMissions,
    renderRouteMission
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.RouteMission = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
