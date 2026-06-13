(function attachStationClearSummary(root) {
  const progressStorageKey = "mathlearning-progress-v2";
  const dismissedStorageKey = "mathlearning-station-clear-dismissed-v1";
  let scheduled = false;
  let initialized = false;
  let previousCompletion = new Map();

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

  function readDismissed() {
    try {
      return safeParse(root.localStorage?.getItem(dismissedStorageKey), {});
    } catch (error) {
      return {};
    }
  }

  function writeDismissed(value) {
    try {
      root.localStorage?.setItem(dismissedStorageKey, JSON.stringify(value));
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function getTodayKey() {
    if (root.ReviewScheduler?.toDateKey) {
      return root.ReviewScheduler.toDateKey(new Date());
    }
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function getModules() {
    return Array.isArray(root.MATH_LEARNING_DATA) ? root.MATH_LEARNING_DATA : [];
  }

  function getModuleByTitle(title) {
    return getModules().find((module) => module.title === title) || null;
  }

  function getActiveModule() {
    const title = document.getElementById("module-title")?.textContent?.trim();
    return getModuleByTitle(title) || null;
  }

  function getPracticeIds(module = {}) {
    return (module.practices || []).map((practice) => practice.id);
  }

  function getCompletedCount(module = {}, state = readState()) {
    return getPracticeIds(module).filter((id) => Boolean(state.completed?.[id])).length;
  }

  function getModuleStats(module = {}, state = readState()) {
    const ids = getPracticeIds(module);
    const completed = ids.filter((id) => Boolean(state.completed?.[id])).length;
    const answeredIds = ids.filter((id) => state.answerHistory?.[id]);
    const attempts = answeredIds.reduce((sum, id) => sum + Number(state.answerHistory?.[id]?.attempts || 0), 0);
    const correct = answeredIds.reduce((sum, id) => sum + Number(state.answerHistory?.[id]?.correct || 0), 0);
    const wrongItems = (state.wrongBook || []).filter((item) => ids.includes(item.id));
    return {
      total: ids.length,
      completed,
      attempts,
      correct,
      accuracy: attempts === 0 ? 0 : correct / attempts,
      wrongCount: wrongItems.length
    };
  }

  function getMasteries(state) {
    if (!root.MasteryModel?.calculateAllMastery) {
      return [];
    }
    return root.MasteryModel.calculateAllMastery(getModules(), state, { todayKey: getTodayKey() });
  }

  function getQuestState(module, state) {
    if (!root.QuestMap?.calculateQuestStates || !module) {
      return null;
    }
    return root.QuestMap.calculateQuestStates(getModules(), state, getMasteries(state)).find((item) => item.moduleId === module.id) || null;
  }

  function getNextStation(module, state) {
    if (!root.QuestMap?.calculateQuestStates || !module) {
      return null;
    }
    const states = root.QuestMap.calculateQuestStates(getModules(), state, getMasteries(state));
    const currentIndex = states.findIndex((item) => item.moduleId === module.id);
    if (currentIndex === -1) {
      return null;
    }
    return states.slice(currentIndex + 1).find((item) => item.status.id !== root.QuestMap.questStatuses?.locked?.id) || states[currentIndex + 1] || null;
  }

  function getDismissKey(module, state) {
    const completed = getCompletedCount(module, state);
    return `${module.id}:${completed}`;
  }

  function isVisible(element) {
    return Boolean(element) && !element.closest("[hidden]");
  }

  function getCardTitle(card) {
    return card.querySelector("strong")?.textContent?.trim() || "";
  }

  function findStationCard(moduleTitle) {
    const cards = Array.from(document.querySelectorAll("#knowledge-mode-list .knowledge-mode-card, #module-list .module-path__item"));
    return cards.find((card) => getCardTitle(card) === moduleTitle && isVisible(card)) || cards.find((card) => getCardTitle(card) === moduleTitle) || null;
  }

  function openStation(moduleTitle) {
    const card = findStationCard(moduleTitle);
    if (card) {
      card.click();
      return;
    }
    document.getElementById("modules")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  function closeModal(modal, module, state) {
    const dismissed = readDismissed();
    dismissed[getDismissKey(module, state)] = true;
    writeDismissed(dismissed);
    modal.classList.remove("is-visible");
    root.setTimeout(() => modal.remove(), 220);
  }

  function createStat(label, value) {
    const item = createElement("div", "station-clear-stat");
    item.append(createElement("span", "", label), createElement("strong", "", value));
    return item;
  }

  function formatAccuracy(value) {
    return `${Math.round(Math.min(Math.max(value, 0), 1) * 100)}%`;
  }

  function buildModal(module, state) {
    const questState = getQuestState(module, state);
    const nextStation = getNextStation(module, state);
    const stats = getModuleStats(module, state);
    const reward = questState?.reward;
    const stationCode = questState?.stationCode || reward?.stationCode || "M--";
    const points = reward?.points || root.QuestMap?.calculateStationReward?.(module, 0) || 0;
    const honorTitle = reward?.honorTitle || "数学探索荣誉";
    const honorEmoji = reward?.honorEmoji || "🏅";

    const overlay = createElement("section", "station-clear-overlay");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", `${module.title} 通关结算`);

    const modal = createElement("div", "station-clear-modal");
    const hero = createElement("div", "station-clear-hero");
    hero.append(
      createElement("div", "station-clear-train", "🚇✨"),
      createElement("span", "station-clear-eyebrow", `${stationCode} 通关结算`),
      createElement("h3", "", `恭喜通关「${module.title}」`),
      createElement("p", "", "本站任务已完成，可以领取地铁积分与荣誉称号。")
    );

    const statsGrid = createElement("div", "station-clear-stats");
    statsGrid.append(
      createStat("完成题目", `${stats.completed}/${stats.total}`),
      createStat("正确率", stats.attempts === 0 ? "暂无" : formatAccuracy(stats.accuracy)),
      createStat("地铁积分", `+${points}`),
      createStat("错题留存", `${stats.wrongCount} 道`)
    );

    const rewardCard = createElement("div", "station-clear-reward");
    rewardCard.append(createElement("span", "", honorEmoji), createElement("div", "", ""));
    const rewardText = rewardCard.querySelector("div");
    rewardText.append(createElement("strong", "", honorTitle), createElement("p", "", reward?.honorDescription || "继续沿知识路线前进，解锁更多数学荣誉。"));

    const next = createElement("div", "station-clear-next");
    next.append(
      createElement("strong", "", nextStation ? `下一站：${nextStation.stationCode}「${nextStation.moduleTitle}」` : "全线已完成"),
      createElement("p", "", nextStation ? nextStation.hint || "继续沿地铁路线挑战下一站。" : "可以随机组卷复盘，也可以回到路线图查看全部荣誉。")
    );

    const actions = createElement("div", "station-clear-actions");
    actions.append(
      createButton(nextStation ? "去下一站" : "随机组卷", "button button--primary", () => {
        closeModal(overlay, module, state);
        if (nextStation) {
          openStation(nextStation.moduleTitle);
        } else {
          document.getElementById("generate-paper")?.click();
          document.getElementById("paper-generator-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }),
      createButton("查看本站", "button button--ghost", () => {
        closeModal(overlay, module, state);
        document.getElementById("lesson-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }),
      createButton("回路线图", "button button--ghost", () => {
        closeModal(overlay, module, state);
        document.getElementById("modules")?.scrollIntoView({ behavior: "smooth", block: "start" });
      })
    );

    modal.append(hero, statsGrid, rewardCard, next, actions);
    overlay.appendChild(modal);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeModal(overlay, module, state);
      }
    });
    root.setTimeout(() => overlay.classList.add("is-visible"), 20);
    return overlay;
  }

  function showClearSummary(module, state) {
    if (!module || document.querySelector(".station-clear-overlay")) {
      return;
    }
    const dismissed = readDismissed();
    const key = getDismissKey(module, state);
    if (dismissed[key]) {
      return;
    }
    document.body.appendChild(buildModal(module, state));
  }

  function snapshotCompletion(state) {
    previousCompletion = new Map(getModules().map((module) => [module.id, getCompletedCount(module, state)]));
  }

  function checkForClearTransition() {
    const state = readState();
    const activeModule = getActiveModule();
    if (!initialized) {
      snapshotCompletion(state);
      initialized = true;
      return;
    }

    getModules().forEach((module) => {
      const total = getPracticeIds(module).length;
      const currentCompleted = getCompletedCount(module, state);
      const previousCompleted = previousCompletion.get(module.id) || 0;
      if (total > 0 && previousCompleted < total && currentCompleted >= total && activeModule?.id === module.id) {
        showClearSummary(module, state);
      }
      previousCompletion.set(module.id, currentCompleted);
    });
  }

  function scheduleCheck() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    const callback = () => {
      scheduled = false;
      checkForClearTransition();
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
    ["module-progress", "practice-list", "wrong-book-list", "module-title"].forEach((id) => {
      const element = document.getElementById(id);
      if (!element) {
        return;
      }
      const observer = new MutationObserver(scheduleCheck);
      observer.observe(element, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"] });
    });
  }

  function boot() {
    if (typeof document === "undefined") {
      return;
    }
    checkForClearTransition();
    observe();
  }

  const api = {
    checkForClearTransition,
    showClearSummary
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.StationClearSummary = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
