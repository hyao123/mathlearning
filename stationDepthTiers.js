(function attachStationDepthTiers(root) {
  const progressStorageKey = "mathlearning-progress-v2";
  let scheduled = false;

  const tierDefinitions = [
    {
      id: "platform",
      title: "站台层",
      subtitle: "先会基础模型",
      emoji: "🚉",
      difficulties: ["基础"],
      advice: "先确保能独立做出基础题，再进入车厢层。"
    },
    {
      id: "carriage",
      title: "车厢层",
      subtitle: "练会常见变式",
      emoji: "🚇",
      difficulties: ["进阶"],
      advice: "重点看题目变化了什么，模型有没有保持不变。"
    },
    {
      id: "tunnel",
      title: "隧道层",
      subtitle: "挑战迁移综合",
      emoji: "🌌",
      difficulties: ["提高", "挑战"],
      advice: "遇到难题先拆条件，再决定用哪个模型。"
    }
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
      return safeParse(root.localStorage?.getItem(progressStorageKey), { completed: {} });
    } catch (error) {
      return { completed: {} };
    }
  }

  function getModules() {
    return Array.isArray(root.MATH_LEARNING_DATA) ? root.MATH_LEARNING_DATA : [];
  }

  function getActiveModule() {
    const title = document.getElementById("module-title")?.textContent?.trim();
    return getModules().find((module) => module.title === title) || null;
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
    let panel = document.getElementById("station-depth-tiers-panel");
    if (panel) {
      return panel;
    }
    const lessonPanel = document.getElementById("lesson-panel");
    const header = lessonPanel?.querySelector(".panel__header");
    if (!lessonPanel || !header) {
      return null;
    }
    panel = document.createElement("section");
    panel.id = "station-depth-tiers-panel";
    panel.className = "station-depth-tiers-panel";
    const stationDetail = document.getElementById("station-detail-panel");
    (stationDetail || header).insertAdjacentElement("afterend", panel);
    return panel;
  }

  function getTierPractices(module, tier) {
    return (module.practices || []).filter((practice) => tier.difficulties.includes(practice.difficulty));
  }

  function getTierStatus(module, tier, state) {
    const practices = getTierPractices(module, tier);
    const completed = practices.filter((practice) => Boolean(state.completed?.[practice.id])).length;
    return {
      practices,
      completed,
      total: practices.length,
      done: practices.length > 0 && completed >= practices.length,
      ratio: practices.length === 0 ? 0 : completed / practices.length
    };
  }

  function scrollToPracticeTier(tier) {
    const list = document.getElementById("practice-list");
    if (!list) {
      return;
    }
    list.scrollIntoView({ behavior: "smooth", block: "start" });
    const titles = tier.difficulties.join(" / ");
    const cards = Array.from(list.querySelectorAll(".card--practice"));
    cards.forEach((card) => card.classList.remove("station-depth-flash"));
    const matched = cards.filter((card) => tier.difficulties.some((difficulty) => card.textContent.includes(difficulty)));
    matched.slice(0, 3).forEach((card) => {
      card.classList.add("station-depth-flash");
      root.setTimeout(() => card.classList.remove("station-depth-flash"), 1600);
    });
    if (matched.length === 0) {
      list.title = `本层难度：${titles}`;
    }
  }

  function renderTierCard(module, tier, state) {
    const status = getTierStatus(module, tier, state);
    const card = createElement("article", `station-depth-tier station-depth-tier--${tier.id}${status.done ? " is-done" : ""}`);
    const icon = createElement("div", "station-depth-tier__icon", tier.emoji);
    const body = createElement("div", "station-depth-tier__body");
    const progressText = status.total === 0 ? "暂无本层题目" : `${status.completed}/${status.total} 已完成`;
    body.append(createElement("span", "station-depth-tier__label", tier.subtitle), createElement("h4", "", tier.title), createElement("p", "", tier.advice));
    const progress = createElement("div", "station-depth-tier__progress");
    const bar = createElement("i", "");
    bar.style.width = `${Math.round(status.ratio * 100)}%`;
    progress.appendChild(bar);
    const meta = createElement("div", "station-depth-tier__meta");
    meta.append(createElement("span", "", progressText), createElement("span", "", tier.difficulties.join(" / ")));
    body.append(progress, meta);
    const action = createButton(status.done ? "复盘本层" : "练这一层", "button button--small button--ghost", () => scrollToPracticeTier(tier));
    card.append(icon, body, action);
    return card;
  }

  function renderDepthTiers() {
    const panel = ensurePanel();
    const module = getActiveModule();
    if (!panel || !module) {
      return;
    }
    const state = readState();
    panel.innerHTML = "";
    const header = createElement("div", "station-depth-header");
    const title = createElement("div", "");
    title.append(createElement("span", "station-depth-eyebrow", "站内三层难度"), createElement("h3", "", "站台 → 车厢 → 隧道，逐层通关"));
    const total = (module.practices || []).length;
    const completed = (module.practices || []).filter((practice) => Boolean(state.completed?.[practice.id])).length;
    header.append(title, createElement("span", "station-depth-badge", `${completed}/${total} 题`));
    const list = createElement("div", "station-depth-list");
    tierDefinitions.forEach((tier) => list.appendChild(renderTierCard(module, tier, state)));
    panel.append(header, list);
  }

  function scheduleRender() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    const callback = () => {
      scheduled = false;
      renderDepthTiers();
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
    ["module-title", "module-progress", "practice-list", "station-detail-panel"].forEach((id) => {
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
    renderDepthTiers();
    observe();
  }

  const api = {
    renderDepthTiers,
    tierDefinitions
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.StationDepthTiers = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
