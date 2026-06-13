(function attachMistakeMap(root) {
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
      return safeParse(root.localStorage?.getItem(progressStorageKey), { wrongBook: [] });
    } catch (error) {
      return { wrongBook: [] };
    }
  }

  function getWrongBook(state = readState()) {
    return Array.isArray(state.wrongBook) ? state.wrongBook : [];
  }

  function getModules() {
    return Array.isArray(root.MATH_LEARNING_DATA) ? root.MATH_LEARNING_DATA : [];
  }

  function getModuleById(moduleId) {
    return getModules().find((module) => module.id === moduleId) || null;
  }

  function getModuleByTitle(title) {
    return getModules().find((module) => module.title === title) || null;
  }

  function getItemModule(item = {}) {
    return getModuleById(item.moduleId) || getModuleByTitle(item.moduleTitle) || null;
  }

  function getCardTitle(card) {
    return card.querySelector("strong")?.textContent?.trim() || "";
  }

  function isVisible(element) {
    return Boolean(element) && !element.closest("[hidden]");
  }

  function findStationCard(module) {
    if (!module) {
      return null;
    }
    const cards = Array.from(document.querySelectorAll("#knowledge-mode-list .knowledge-mode-card, #module-list .module-path__item"));
    return (
      cards.find((card) => card.dataset.moduleId === module.id && isVisible(card)) ||
      cards.find((card) => getCardTitle(card) === module.title && isVisible(card)) ||
      cards.find((card) => card.dataset.moduleId === module.id) ||
      cards.find((card) => getCardTitle(card) === module.title) ||
      null
    );
  }

  function openModule(module) {
    const card = findStationCard(module);
    if (card) {
      card.click();
      return;
    }
    document.getElementById("lesson-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToWrongBook() {
    document.getElementById("wrong-book")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  function ensureMapPanel() {
    let panel = document.getElementById("mistake-map-panel");
    if (panel) {
      return panel;
    }
    const wrongBookPanel = document.getElementById("wrong-book");
    const wrongBookList = document.getElementById("wrong-book-list");
    if (!wrongBookPanel || !wrongBookList) {
      return null;
    }
    panel = document.createElement("section");
    panel.id = "mistake-map-panel";
    panel.className = "mistake-map-panel";
    const diagnosisPanel = document.getElementById("mistake-diagnosis-panel");
    (diagnosisPanel || wrongBookList).insertAdjacentElement("beforebegin", panel);
    return panel;
  }

  function ensureDashboardMapPanel() {
    let panel = document.getElementById("mistake-map-dashboard-panel");
    if (panel) {
      return panel;
    }
    const parentDashboard = document.getElementById("parent-dashboard");
    const anchor = document.getElementById("mistake-dashboard-panel") || document.getElementById("mastery-ranking") || document.getElementById("dashboard-cards");
    if (!parentDashboard || !anchor) {
      return null;
    }
    panel = document.createElement("section");
    panel.id = "mistake-map-dashboard-panel";
    panel.className = "mistake-map-dashboard-panel";
    anchor.insertAdjacentElement("afterend", panel);
    return panel;
  }

  function summarizeByModule(items = []) {
    const groups = new Map();
    items.forEach((item) => {
      const module = getItemModule(item);
      const key = module?.id || item.moduleId || item.moduleTitle || "unknown";
      if (!groups.has(key)) {
        groups.set(key, {
          module,
          title: module?.title || item.moduleTitle || "综合练习",
          count: 0
        });
      }
      groups.get(key).count += 1;
    });
    return [...groups.values()].sort((left, right) => right.count - left.count || left.title.localeCompare(right.title, "zh-CN"));
  }

  function getSummary() {
    const wrongBook = getWrongBook();
    const tagSummary = root.MistakeDiagnosis?.summarizeWrongBook ? root.MistakeDiagnosis.summarizeWrongBook(wrongBook) : [];
    const totalTagged = tagSummary.reduce((sum, item) => sum + item.count, 0);
    return {
      wrongBook,
      tagSummary,
      moduleSummary: summarizeByModule(wrongBook),
      totalTagged
    };
  }

  function createEmptyState() {
    const empty = createElement("div", "mistake-map-empty");
    empty.append(
      createElement("strong", "", "错因地图正在等待数据"),
      createElement("p", "muted", "做题答错后，错题会自动进入维修站；这里会把错因连成地图，帮助你看出真正薄弱点。")
    );
    return empty;
  }

  function createMapNode(item, index, maxCount) {
    const node = document.createElement("button");
    const level = item.count === maxCount ? "hot" : item.count >= Math.max(2, maxCount * 0.6) ? "warm" : "calm";
    node.type = "button";
    node.className = `mistake-map-node mistake-map-node--${level}`;
    node.dataset.index = String(index + 1);
    node.title = `${item.description} 建议：${item.advice}`;

    const count = createElement("strong", "", `${item.count}`);
    const label = createElement("span", "", item.label);
    const advice = createElement("small", "", item.advice);
    node.append(count, label, advice);
    node.addEventListener("click", scrollToWrongBook);
    return node;
  }

  function createModuleLink(moduleItem) {
    const button = createButton(`${moduleItem.title} · ${moduleItem.count}题`, "mistake-map-module", () => {
      if (moduleItem.module) {
        openModule(moduleItem.module);
      } else {
        scrollToWrongBook();
      }
    });
    return button;
  }

  function renderMainMap() {
    const panel = ensureMapPanel();
    if (!panel || !root.MistakeDiagnosis) {
      return;
    }
    const { wrongBook, tagSummary, moduleSummary } = getSummary();
    panel.innerHTML = "";

    const header = createElement("div", "mistake-map-header");
    const titleBlock = createElement("div", "");
    titleBlock.append(createElement("span", "mistake-map-eyebrow", "错因地图 · 维修站"), createElement("h3", "", "看见真正卡住的地方"));
    const badge = createElement("span", "mistake-map-badge", `${wrongBook.length} 道错题`);
    header.append(titleBlock, badge);
    panel.appendChild(header);

    if (tagSummary.length === 0) {
      panel.appendChild(createEmptyState());
      return;
    }

    const primary = tagSummary[0];
    const intro = createElement("p", "mistake-map-intro", `当前最大错因是「${primary.label}」：${primary.description} 建议先做这一类维修，再继续开新站。`);
    panel.appendChild(intro);

    const map = createElement("div", "mistake-map-canvas");
    const center = createElement("div", "mistake-map-center");
    center.append(createElement("span", "", "主维修点"), createElement("strong", "", primary.label), createElement("small", "", `${primary.count} 道相关错题`));
    map.appendChild(center);
    const maxCount = Math.max(...tagSummary.map((item) => item.count));
    tagSummary.slice(0, 6).forEach((item, index) => map.appendChild(createMapNode(item, index, maxCount)));
    panel.appendChild(map);

    const repair = createElement("div", "mistake-map-repair");
    const repairText = createElement("div", "");
    repairText.append(createElement("strong", "", "维修建议"), createElement("p", "muted", primary.advice));
    const actions = createElement("div", "mistake-map-actions");
    actions.append(
      createButton("查看错题", "button button--small button--ghost", scrollToWrongBook),
      createButton("错题重新组卷", "button button--small button--primary", () => {
        document.getElementById("generate-wrong-paper")?.click();
        document.getElementById("paper-generator-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      })
    );
    repair.append(repairText, actions);
    panel.appendChild(repair);

    if (moduleSummary.length > 0) {
      const modules = createElement("div", "mistake-map-modules");
      modules.appendChild(createElement("h4", "", "关联站点"));
      const list = createElement("div", "mistake-map-module-list");
      moduleSummary.slice(0, 5).forEach((moduleItem) => list.appendChild(createModuleLink(moduleItem)));
      modules.appendChild(list);
      panel.appendChild(modules);
    }
  }

  function renderDashboardMap() {
    const panel = ensureDashboardMapPanel();
    if (!panel || !root.MistakeDiagnosis) {
      return;
    }
    const { wrongBook, tagSummary } = getSummary();
    panel.innerHTML = "";
    const title = createElement("h3", "", "错因热力地图");
    panel.appendChild(title);
    if (tagSummary.length === 0) {
      panel.appendChild(createElement("p", "muted", "暂无错题，继续完成闯关后这里会显示主要错因。"));
      return;
    }
    const maxCount = Math.max(...tagSummary.map((item) => item.count));
    const rows = createElement("div", "mistake-map-heat-list");
    tagSummary.slice(0, 6).forEach((item) => {
      const row = createElement("div", "mistake-map-heat-row");
      const label = createElement("span", "", item.label);
      const barWrap = createElement("div", "mistake-map-heat-bar");
      const bar = createElement("i", "");
      bar.style.width = `${Math.max(12, Math.round((item.count / maxCount) * 100))}%`;
      barWrap.appendChild(bar);
      const count = createElement("strong", "", `${item.count}`);
      row.append(label, barWrap, count);
      rows.appendChild(row);
    });
    const summary = createElement("p", "muted mistake-map-dashboard-summary", `共 ${wrongBook.length} 道错题，优先处理最高热力错因。`);
    panel.append(rows, summary);
  }

  function render() {
    renderMainMap();
    renderDashboardMap();
  }

  function scheduleRender() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    const callback = () => {
      scheduled = false;
      render();
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
    ["wrong-book-list", "mistake-diagnosis-panel", "mistake-dashboard-panel", "parent-dashboard"].forEach((id) => {
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
    render();
    observe();
  }

  const api = {
    getSummary,
    render
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MistakeMap = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
