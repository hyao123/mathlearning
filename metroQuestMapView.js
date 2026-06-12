(function attachMetroQuestMapView(root) {
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
      return safeParse(root.localStorage?.getItem(progressStorageKey), {});
    } catch (error) {
      return {};
    }
  }

  function getTodayKey() {
    if (root.ReviewScheduler?.toDateKey) {
      return root.ReviewScheduler.toDateKey(new Date());
    }
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function getMasteries(state) {
    if (!root.MasteryModel || !Array.isArray(root.MATH_LEARNING_DATA)) {
      return [];
    }
    return root.MasteryModel.calculateAllMastery(root.MATH_LEARNING_DATA, state, { todayKey: getTodayKey() });
  }

  function getCardTitle(card) {
    return card.querySelector("strong")?.textContent?.trim() || "";
  }

  function getModuleByTitle(title) {
    return (root.MATH_LEARNING_DATA || []).find((module) => module.title === title) || null;
  }

  function isVisible(element) {
    return Boolean(element) && !element.closest("[hidden]");
  }

  function getCards(path, selector) {
    return Array.from(path.querySelectorAll(selector));
  }

  function getModulesForCards(cards) {
    return cards.map((card) => getModuleByTitle(getCardTitle(card))).filter(Boolean);
  }

  function upsertStationMeta(card, station) {
    const content = card.querySelector(".module-path__content") || card.querySelector(".knowledge-mode-card__content") || card;
    let meta = content.querySelector(".metro-quest-station-meta");
    if (!meta) {
      meta = document.createElement("span");
      meta.className = "metro-quest-station-meta";
      content.appendChild(meta);
    }
    const text = `${station.stationCode}站 · ${station.reward.points}积分 · ${station.reward.honorEmoji} ${station.reward.honorTitle}`;
    if (meta.textContent !== text) {
      meta.textContent = text;
    }
    meta.title = station.reward.honorDescription;
  }

  function decorateStationNode(card, station) {
    card.classList.add("metro-quest-node");
    card.dataset.stationCode = station.stationCode;
    card.dataset.stationPoints = String(station.reward.points);
    const step = card.querySelector(".module-path__step") || card.querySelector(".knowledge-mode-card__step");
    if (step) {
      step.dataset.level = `${station.stationCode}站`;
      step.title = `${station.stationName} · ${station.reward.points}积分 · ${station.reward.honorTitle}`;
    }
    upsertStationMeta(card, station);
  }

  function decoratePath(path, selector) {
    const cards = getCards(path, selector);
    const modules = getModulesForCards(cards);
    if (modules.length === 0) {
      return [];
    }
    const state = readState();
    const stations = root.QuestMap.calculateQuestStates(modules, state, getMasteries(state));
    cards.forEach((card, index) => {
      if (stations[index]) {
        decorateStationNode(card, stations[index]);
      }
    });
    path.classList.add("metro-quest-line");
    return stations;
  }

  function createSummaryText(summary) {
    const next = summary.current;
    if (!next) {
      return `${summary.progressText} · ${summary.rewardText} · 全线已通关，荣誉全部点亮。`;
    }
    return `${summary.progressText} · ${summary.rewardText} · 下一站：${next.stationCode} ${next.moduleTitle}，通关可得 ${next.reward.points} 积分与「${next.reward.honorTitle}」。`;
  }

  function renderMetroSummary(stations) {
    const summaryPanel = document.getElementById("quest-map-summary");
    if (!summaryPanel || stations.length === 0) {
      return;
    }
    const summary = root.QuestMap.summarizeQuest(stations);
    summaryPanel.classList.add("metro-quest-summary");
    const title = summaryPanel.querySelector("strong");
    const text = summaryPanel.querySelector("p");
    const badge = summaryPanel.querySelector(".badge");
    if (title && title.textContent !== "地铁闯关路线") {
      title.textContent = "地铁闯关路线";
    }
    const nextText = createSummaryText(summary);
    if (text && text.textContent !== nextText) {
      text.textContent = nextText;
    }
    const badgeText = `${summary.counts["needs-review"] || 0} 个回访站`;
    if (badge && badge.textContent !== badgeText) {
      badge.textContent = badgeText;
    }
  }

  function decorateMetroQuestMap() {
    if (!root.QuestMap || typeof document === "undefined") {
      return;
    }
    const visibleStations = [];
    document.querySelectorAll("#module-list .module-path").forEach((path) => {
      const stations = decoratePath(path, ".module-path__item");
      if (isVisible(path)) {
        visibleStations.push(...stations);
      }
    });
    document.querySelectorAll("#knowledge-mode-list .knowledge-strand-path").forEach((path) => {
      const stations = decoratePath(path, ".knowledge-mode-card");
      if (isVisible(path)) {
        visibleStations.push(...stations);
      }
    });
    renderMetroSummary(visibleStations);
  }

  function scheduleRender() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    const callback = () => {
      scheduled = false;
      decorateMetroQuestMap();
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
    ["module-list", "knowledge-mode-list", "quest-map-summary"].forEach((id) => {
      const element = document.getElementById(id);
      if (!element) {
        return;
      }
      const observer = new MutationObserver(scheduleRender);
      observer.observe(element, { childList: true, subtree: true, characterData: true });
    });
  }

  function boot() {
    decorateMetroQuestMap();
    observe();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
