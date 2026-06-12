(function attachQuestMapView(root) {
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

  function getModuleByTitle(title) {
    return (root.MATH_LEARNING_DATA || []).find((module) => module.title === title) || null;
  }

  function getCardTitle(card) {
    return card.querySelector("strong")?.textContent?.trim() || "";
  }

  function isVisible(element) {
    return Boolean(element) && !element.closest("[hidden]");
  }

  function findModuleCardByTitle(moduleTitle) {
    const cards = Array.from(document.querySelectorAll("#knowledge-mode-list .knowledge-mode-card, #module-list .module-path__item"));
    return cards.find((card) => getCardTitle(card) === moduleTitle && isVisible(card)) || cards.find((card) => getCardTitle(card) === moduleTitle) || null;
  }

  function openModuleFromSummary(state) {
    if (!state) {
      return;
    }
    const card = findModuleCardByTitle(state.moduleTitle);
    if (card) {
      card.click();
      return;
    }
    document.getElementById("lesson-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function createStatusPill(state) {
    const pill = document.createElement("span");
    pill.className = `quest-map__status quest-map__status--${state.status.id}`;
    pill.textContent = `${state.status.emoji} ${state.status.label}`;
    pill.title = state.hint;
    return pill;
  }

  function upsertStatusPill(card, state) {
    const target = card.querySelector(".module-path__tags") || card.querySelector(".knowledge-mode-card__links") || card;
    let pill = target.querySelector(".quest-map__status");
    if (!pill) {
      pill = createStatusPill(state);
      target.appendChild(pill);
      return;
    }
    const nextClass = `quest-map__status quest-map__status--${state.status.id}`;
    const nextText = `${state.status.emoji} ${state.status.label}`;
    if (pill.className !== nextClass) {
      pill.className = nextClass;
    }
    if (pill.textContent !== nextText) {
      pill.textContent = nextText;
    }
    if (pill.title !== state.hint) {
      pill.title = state.hint;
    }
  }

  function updateStepBadge(card, state) {
    const step = card.querySelector(".module-path__step") || card.querySelector(".knowledge-mode-card__step");
    if (!step) {
      return;
    }
    const nextLevel = `第 ${state.levelNumber} 关`;
    const nextTitle = `第 ${state.levelNumber} 关 · ${state.status.label}`;
    if (step.textContent !== state.status.emoji) {
      step.textContent = state.status.emoji;
    }
    if (step.dataset.level !== nextLevel) {
      step.dataset.level = nextLevel;
    }
    if (step.title !== nextTitle) {
      step.title = nextTitle;
    }
  }

  function getStatusClasses() {
    return Object.values(root.QuestMap.questStatuses).map((status) => `is-quest-${status.id}`);
  }

  function decorateCard(card, state) {
    if (card.dataset.questStatus !== state.status.id) {
      card.dataset.questStatus = state.status.id;
    }
    if (card.dataset.questLevel !== String(state.levelNumber)) {
      card.dataset.questLevel = String(state.levelNumber);
    }
    card.classList.add("quest-map-node");
    card.classList.remove(...getStatusClasses(), "is-quest-shaking");
    card.classList.add(`is-quest-${state.status.id}`);
    updateStepBadge(card, state);
    upsertStatusPill(card, state);
    bindLockedHint(card);
  }

  function createToast(message) {
    const toast = document.createElement("div");
    toast.className = "quest-map-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    root.setTimeout(() => toast.classList.add("is-visible"), 20);
    root.setTimeout(() => {
      toast.classList.remove("is-visible");
      root.setTimeout(() => toast.remove(), 240);
    }, 2600);
  }

  function bindLockedHint(card) {
    if (card.dataset.questBound === "true") {
      return;
    }
    card.dataset.questBound = "true";
    card.addEventListener(
      "click",
      () => {
        if (card.dataset.questStatus !== root.QuestMap.questStatuses.locked.id) {
          return;
        }
        card.classList.add("is-quest-shaking");
        root.setTimeout(() => card.classList.remove("is-quest-shaking"), 420);
        const status = card.querySelector(".quest-map__status")?.title || "建议先完成前面的关卡。";
        createToast(`${status} 也可以先进入了解这一站内容。`);
      },
      true
    );
  }

  function decoratePath(pathElement, cardSelector) {
    const cards = Array.from(pathElement.querySelectorAll(cardSelector));
    const modules = cards.map((card) => getModuleByTitle(getCardTitle(card))).filter(Boolean);
    if (modules.length === 0) {
      return [];
    }
    const state = readState();
    const masteries = getMasteries(state);
    const states = root.QuestMap.calculateQuestStates(modules, state, masteries);
    cards.forEach((card, index) => {
      const questState = states[index];
      if (questState) {
        decorateCard(card, questState);
      }
    });
    pathElement.classList.add("quest-map-path");
    return states;
  }

  function createSummaryContent(summary) {
    const wrapper = document.createElement("div");
    wrapper.className = "quest-map-summary__content";
    const title = document.createElement("strong");
    const text = document.createElement("p");
    const badge = document.createElement("span");
    const currentText = summary.current ? `下一步：${summary.current.status.emoji} ${summary.current.moduleTitle}` : "所有关卡都已通关";
    title.textContent = "闯关地图";
    text.className = "muted";
    text.textContent = `${summary.progressText} · ${currentText}`;
    badge.className = "badge";
    badge.textContent = `${summary.counts["needs-review"] || 0} 个回访关`;
    wrapper.append(title, text, badge);
    if (summary.current) {
      const action = document.createElement("button");
      action.type = "button";
      action.className = "button button--small button--primary quest-map-summary__action";
      action.textContent = "进入当前知识点";
      action.addEventListener("click", () => openModuleFromSummary(summary.current));
      wrapper.appendChild(action);
    }
    return wrapper;
  }

  function renderQuestSummary(allStates) {
    const modulesPanel = document.getElementById("modules");
    const anchor = document.querySelector(".learning-mode-switcher") || document.getElementById("grade-filter");
    if (!modulesPanel || !anchor) {
      return;
    }
    let panel = document.getElementById("quest-map-summary");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "quest-map-summary";
      panel.className = "quest-map-summary";
      anchor.insertAdjacentElement("beforebegin", panel);
    }
    const summary = root.QuestMap.summarizeQuest(allStates);
    const nextContentKey = `${summary.progressText}|${summary.current?.moduleId || "done"}|${summary.counts["needs-review"] || 0}`;
    if (panel.dataset.summaryKey === nextContentKey) {
      return;
    }
    panel.dataset.summaryKey = nextContentKey;
    panel.innerHTML = "";
    panel.appendChild(createSummaryContent(summary));
  }

  function updateOverviewText() {
    const gradeOverview = document.querySelector("#module-list .module-map__overview .muted");
    const gradeText = "像闯关地图一样从当前推荐关开始推进；已通关会点亮，需复习会变成回访关。";
    if (gradeOverview && gradeOverview.textContent !== gradeText) {
      gradeOverview.textContent = gradeText;
    }
    const knowledgeOverview = document.querySelector("#knowledge-mode-list .knowledge-mode-overview .muted");
    const knowledgeText = "沿知识主线循序闯关，先打通前置模型，再挑战后续综合关。";
    if (knowledgeOverview && knowledgeOverview.textContent !== knowledgeText) {
      knowledgeOverview.textContent = knowledgeText;
    }
  }

  function renderQuestMap() {
    if (!root.QuestMap || typeof document === "undefined") {
      return;
    }
    const allStates = [];
    document.querySelectorAll("#module-list .module-path").forEach((path) => {
      const states = decoratePath(path, ".module-path__item");
      if (isVisible(path)) {
        allStates.push(...states);
      }
    });
    document.querySelectorAll("#knowledge-mode-list .knowledge-strand-path").forEach((path) => {
      const states = decoratePath(path, ".knowledge-mode-card");
      if (isVisible(path)) {
        allStates.push(...states);
      }
    });
    updateOverviewText();
    if (allStates.length > 0) {
      renderQuestSummary(allStates);
    }
  }

  function scheduleRender() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    const callback = () => {
      scheduled = false;
      renderQuestMap();
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
    ["module-list", "knowledge-mode-list", "grade-filter", "difficulty-filter"].forEach((id) => {
      const element = document.getElementById(id);
      if (!element) {
        return;
      }
      const observer = new MutationObserver(scheduleRender);
      observer.observe(element, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden"] });
    });
  }

  function boot() {
    renderQuestMap();
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