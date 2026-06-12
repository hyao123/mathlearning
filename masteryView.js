(function attachMasteryView(root) {
  const progressStorageKey = "mathlearning-progress-v2";
  let renderScheduled = false;

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function getTodayKey() {
    if (root.ReviewScheduler?.toDateKey) {
      return root.ReviewScheduler.toDateKey(new Date());
    }
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function readProgressState() {
    try {
      return safeParse(root.localStorage?.getItem(progressStorageKey), {});
    } catch (error) {
      return {};
    }
  }

  function getMasteries() {
    if (!root.MasteryModel || !Array.isArray(root.MATH_LEARNING_DATA)) {
      return [];
    }
    return root.MasteryModel.calculateAllMastery(root.MATH_LEARNING_DATA, readProgressState(), { todayKey: getTodayKey() });
  }

  function getActiveModule() {
    const title = document.getElementById("module-title")?.textContent?.trim();
    if (!title) {
      return null;
    }
    return (root.MATH_LEARNING_DATA || []).find((module) => module.title === title) || null;
  }

  function createStatusPill(mastery) {
    const pill = document.createElement("span");
    pill.className = `mastery-pill mastery-pill--${mastery.status.id}`;
    pill.textContent = mastery.status.label;
    pill.title = mastery.reason;
    return pill;
  }

  function updateOrAppendStatus(container, mastery) {
    if (!container || !mastery) {
      return;
    }
    let pill = container.querySelector(".mastery-pill");
    if (!pill) {
      pill = createStatusPill(mastery);
      container.appendChild(pill);
      return;
    }
    pill.className = `mastery-pill mastery-pill--${mastery.status.id}`;
    pill.textContent = mastery.status.label;
    pill.title = mastery.reason;
  }

  function decorateModuleMap(masteries) {
    const byTitle = new Map(masteries.map((item) => [item.moduleTitle, item]));
    document.querySelectorAll("#module-list .module-path__item, #knowledge-mode-list .knowledge-mode-card").forEach((card) => {
      const title = card.querySelector("strong")?.textContent?.trim();
      const mastery = byTitle.get(title);
      if (!mastery) {
        return;
      }
      const target = card.querySelector(".module-path__tags") || card.querySelector(".knowledge-mode-card__links") || card;
      updateOrAppendStatus(target, mastery);
    });
  }

  function createMetric(label, value) {
    const item = document.createElement("div");
    item.className = "mastery-metric";
    const labelElement = document.createElement("span");
    const valueElement = document.createElement("strong");
    labelElement.textContent = label;
    valueElement.textContent = value;
    item.append(labelElement, valueElement);
    return item;
  }

  function renderModuleMasteryPanel(masteries) {
    const lessonPanel = document.getElementById("lesson-panel");
    if (!lessonPanel) {
      return;
    }
    const module = getActiveModule();
    const existing = lessonPanel.querySelector(".mastery-panel");
    if (!module) {
      existing?.remove();
      return;
    }
    const mastery = root.MasteryModel.getMasteryByModuleId(masteries, module.id);
    if (!mastery) {
      existing?.remove();
      return;
    }

    let panel = existing;
    if (!panel) {
      panel = document.createElement("section");
      panel.className = "mastery-panel";
      const anchor = lessonPanel.querySelector(".concept-animation") || lessonPanel.querySelector(".knowledge-topology") || lessonPanel.querySelector(".math-essence") || lessonPanel.querySelector(".panel__header");
      anchor?.insertAdjacentElement("afterend", panel);
    }
    panel.dataset.moduleId = module.id;
    panel.innerHTML = "";

    const header = document.createElement("div");
    header.className = "mastery-panel__header";
    const titleGroup = document.createElement("div");
    const tag = document.createElement("span");
    tag.className = "section-tag";
    tag.textContent = "掌握度";
    const title = document.createElement("h3");
    title.textContent = `${module.title} · ${mastery.status.label}`;
    titleGroup.append(tag, title);
    header.append(titleGroup, createStatusPill(mastery));

    const reason = document.createElement("p");
    reason.className = "mastery-panel__reason";
    reason.textContent = mastery.reason;

    const metrics = document.createElement("div");
    metrics.className = "mastery-metrics";
    metrics.append(
      createMetric("掌握分", mastery.scoreText),
      createMetric("完成率", mastery.stats.completionRateText),
      createMetric("正确率", mastery.stats.accuracyText),
      createMetric("错题", `${mastery.stats.wrongBookCount} 道`),
      createMetric("待复习", `${mastery.stats.dueWrongBook} 道`)
    );

    panel.append(header, reason, metrics);
  }

  function renderDashboardMastery(masteries) {
    const parentDashboard = document.getElementById("parent-dashboard");
    const dashboardCards = document.getElementById("dashboard-cards");
    if (!parentDashboard || !dashboardCards || !root.MasteryModel) {
      return;
    }
    const summary = root.MasteryModel.summarizeMastery(masteries);
    let panel = document.getElementById("mastery-overview-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "mastery-overview-panel";
      panel.className = "mastery-overview-panel";
      dashboardCards.insertAdjacentElement("afterend", panel);
    }
    const needsReviewTitles = summary.needsReview.slice(0, 3).map((item) => item.moduleTitle).join("、") || "暂无";
    const nextLearning = summary.nextLearning?.moduleTitle || "暂无";
    panel.innerHTML = "";
    const title = document.createElement("h3");
    title.textContent = "知识点掌握度概览";
    const grid = document.createElement("div");
    grid.className = "mastery-overview-grid";
    grid.append(
      createMetric("平均掌握分", `${summary.averageScore} 分`),
      createMetric("未开始", `${summary.counts["not-started"] || 0} 个`),
      createMetric("学习中", `${summary.counts.learning || 0} 个`),
      createMetric("需复习", `${summary.counts["needs-review"] || 0} 个`),
      createMetric("已掌握", `${summary.counts.mastered || 0} 个`)
    );
    const advice = document.createElement("p");
    advice.className = "mastery-overview-advice muted";
    advice.textContent = `优先复习：${needsReviewTitles}；下一步学习：${nextLearning}。`;
    panel.append(title, grid, advice);
  }

  function renderMasteryView() {
    if (!root.MasteryModel || typeof document === "undefined") {
      return;
    }
    const masteries = getMasteries();
    decorateModuleMap(masteries);
    renderModuleMasteryPanel(masteries);
    renderDashboardMastery(masteries);
  }

  function scheduleRender() {
    if (renderScheduled) {
      return;
    }
    renderScheduled = true;
    const callback = () => {
      renderScheduled = false;
      renderMasteryView();
    };
    if (root.requestAnimationFrame) {
      root.requestAnimationFrame(callback);
    } else {
      root.setTimeout(callback, 0);
    }
  }

  function observeRenders() {
    if (!("MutationObserver" in root)) {
      return;
    }
    ["module-list", "knowledge-mode-list", "module-title", "dashboard-cards", "practice-list", "wrong-book-list"].forEach((id) => {
      const element = document.getElementById(id);
      if (!element) {
        return;
      }
      const observer = new MutationObserver(scheduleRender);
      observer.observe(element, { childList: true, subtree: true, characterData: true });
    });
  }

  function boot() {
    renderMasteryView();
    observeRenders();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
