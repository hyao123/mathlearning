(function attachLearningModes(root) {
  const storageKey = "mathlearning-learning-mode-v1";
  const modes = {
    knowledge: "knowledge"
  };

  function normalizeMode() {
    return modes.knowledge;
  }

  function getSavedMode() {
    return modes.knowledge;
  }

  function saveMode() {
    try {
      root.localStorage?.setItem(storageKey, modes.knowledge);
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function moduleMatchesDifficulty(module, difficulty = "全部") {
    if (difficulty === "全部") {
      return true;
    }
    const examples = Array.isArray(module.examples) ? module.examples : [];
    const practices = Array.isArray(module.practices) ? module.practices : [];
    return examples.some((item) => item.difficulty === difficulty) || practices.some((item) => item.difficulty === difficulty);
  }

  function getStrandOrder() {
    if (Array.isArray(root.KnowledgeTopology?.strandOrder)) {
      return root.KnowledgeTopology.strandOrder;
    }
    return ["观察与周期", "计数与集合", "数量关系", "变化与效率", "空间与离散结构", "逻辑推理", "综合拓展"];
  }

  function groupModulesByKnowledgeStrand(modules = [], difficulty = "全部") {
    const groups = new Map();
    modules.filter((module) => moduleMatchesDifficulty(module, difficulty)).forEach((module) => {
      const strand = module.knowledgeTopology?.strand || "综合拓展";
      if (!groups.has(strand)) {
        groups.set(strand, []);
      }
      groups.get(strand).push(module);
    });
    return groups;
  }

  function getActiveChipText(container, fallback = "全部") {
    return container?.querySelector(".is-active")?.textContent?.trim() || fallback;
  }

  function getOriginalModuleButton(moduleTitle) {
    return Array.from(document.querySelectorAll("#module-list .module-path__item")).find((button) => button.querySelector("strong")?.textContent?.trim() === moduleTitle);
  }

  function getOriginalProgress(moduleTitle) {
    return getOriginalModuleButton(moduleTitle)?.querySelector(".module-path__progress")?.textContent?.trim() || "";
  }

  function scrollToLessonPanel() {
    document.getElementById("lesson-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openOriginalModule(moduleTitle) {
    const originalButton = getOriginalModuleButton(moduleTitle);
    if (!originalButton) {
      return false;
    }

    root.setTimeout(() => originalButton.click(), 0);
    return true;
  }

  function openKnowledgeModule(module) {
    const appNavigator = root.MathLearningApp;
    if (typeof appNavigator?.openModule === "function" && appNavigator.openModule(module.id)) {
      return;
    }

    if (openOriginalModule(module.title)) {
      return;
    }

    scrollToLessonPanel();
  }

  function clickGradeAllIfNeeded() {
    const gradeFilter = document.getElementById("grade-filter");
    const activeGrade = getActiveChipText(gradeFilter);
    if (activeGrade === "全部") {
      return false;
    }
    const allButton = Array.from(gradeFilter?.querySelectorAll("button") || []).find((button) => button.textContent.trim() === "全部");
    allButton?.click();
    return Boolean(allButton);
  }

  function createRouteIntro() {
    const wrapper = document.createElement("section");
    wrapper.className = "learning-mode-switcher knowledge-route-intro";
    wrapper.innerHTML = `
      <div>
        <strong>知识点地铁路线</strong>
        <p class="muted">不再按年级分类；只沿数学知识的内在逻辑，从先修模型一站一站闯关。</p>
      </div>
      <span class="knowledge-route-intro__badge">数学主线</span>
    `;
    return wrapper;
  }

  function ensureModeSwitcher() {
    const existing = document.querySelector(".learning-mode-switcher");
    if (existing) {
      existing.classList.add("knowledge-route-intro");
      const strong = existing.querySelector("strong");
      const text = existing.querySelector("p");
      const actions = existing.querySelector(".learning-mode-switcher__actions");
      if (strong) {
        strong.textContent = "知识点地铁路线";
      }
      if (text) {
        text.textContent = "不再按年级分类；只沿数学知识的内在逻辑，从先修模型一站一站闯关。";
      }
      actions?.remove();
      if (!existing.querySelector(".knowledge-route-intro__badge")) {
        const badge = document.createElement("span");
        badge.className = "knowledge-route-intro__badge";
        badge.textContent = "数学主线";
        existing.appendChild(badge);
      }
      return;
    }
    const gradeFilter = document.getElementById("grade-filter");
    if (!gradeFilter?.parentElement) {
      return;
    }
    gradeFilter.parentElement.insertBefore(createRouteIntro(), gradeFilter);
  }

  function updateModeButtons() {
    document.querySelectorAll(".learning-mode-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.mode === modes.knowledge);
    });
  }

  function ensureKnowledgeContainer() {
    let container = document.getElementById("knowledge-mode-list");
    const moduleList = document.getElementById("module-list");
    if (!container && moduleList?.parentElement) {
      container = document.createElement("div");
      container.id = "knowledge-mode-list";
      container.className = "knowledge-mode-list";
      moduleList.insertAdjacentElement("afterend", container);
    }
    return container;
  }

  function createEmptyBox(text) {
    const box = document.createElement("div");
    box.className = "empty-state-box";
    box.textContent = text;
    return box;
  }

  function createKnowledgeOverview(modules, difficulty) {
    const overview = document.createElement("div");
    overview.className = "knowledge-mode-overview";
    const practiceCount = modules.reduce((sum, module) => {
      const practices = difficulty === "全部" ? module.practices : module.practices.filter((practice) => practice.difficulty === difficulty);
      return sum + practices.length;
    }, 0);
    overview.innerHTML = `
      <div>
        <strong></strong>
        <p class="muted"></p>
      </div>
      <span class="badge"></span>
    `;
    overview.querySelector("strong").textContent = `数学内在逻辑路线 · ${difficulty === "全部" ? "全部难度" : difficulty}`;
    overview.querySelector("p").textContent = "按知识主线和先后依赖组织模块，不展示年级标签，也不按年级分组。";
    overview.querySelector(".badge").textContent = `${modules.length} 个知识点 · ${practiceCount} 道练习题`;
    return overview;
  }

  function createKnowledgeCard(module, index) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "knowledge-mode-card";
    card.dataset.moduleId = module.id;
    card.innerHTML = `
      <span class="knowledge-mode-card__step"></span>
      <span class="knowledge-mode-card__content">
        <strong></strong>
        <span class="knowledge-mode-card__stage"></span>
        <span class="knowledge-mode-card__description"></span>
        <span class="knowledge-mode-card__links"></span>
      </span>
      <span class="knowledge-mode-card__progress"></span>
    `;
    card.querySelector(".knowledge-mode-card__step").textContent = index + 1;
    card.querySelector("strong").textContent = module.title;
    card.querySelector(".knowledge-mode-card__stage").textContent = module.knowledgeTopology?.stage || "模型迁移";
    card.querySelector(".knowledge-mode-card__description").textContent = module.knowledgeTopology?.continuity || module.description;
    const links = card.querySelector(".knowledge-mode-card__links");
    const prerequisites = module.knowledgeTopology?.prerequisiteTitles || [];
    const next = module.knowledgeTopology?.nextTitles || [];
    links.textContent = `先修：${prerequisites.length ? prerequisites.join("、") : "可直接开始"} · 后续：${next.length ? next.join("、") : "阶段终点"}`;
    card.querySelector(".knowledge-mode-card__progress").textContent = getOriginalProgress(module.title);
    card.addEventListener("click", (event) => {
      event.preventDefault();
      openKnowledgeModule(module);
    });
    return card;
  }

  function renderKnowledgeModeList() {
    const container = ensureKnowledgeContainer();
    if (!container) {
      return;
    }
    const difficulty = getActiveChipText(document.getElementById("difficulty-filter"));
    const modules = root.MATH_LEARNING_DATA || [];
    const groups = groupModulesByKnowledgeStrand(modules, difficulty);
    const visibleModules = Array.from(groups.values()).flat();
    container.innerHTML = "";

    if (visibleModules.length === 0) {
      container.appendChild(createEmptyBox("当前难度下暂时没有可学知识点，试试切换难度。"));
      return;
    }

    container.appendChild(createKnowledgeOverview(visibleModules, difficulty));
    const orderedStrands = getStrandOrder().filter((strand) => groups.has(strand));
    const extraStrands = [...groups.keys()].filter((strand) => !orderedStrands.includes(strand));
    [...orderedStrands, ...extraStrands].forEach((strand) => {
      const section = document.createElement("section");
      section.className = "knowledge-strand-group";
      const header = document.createElement("div");
      header.className = "knowledge-strand-group__header";
      const title = document.createElement("span");
      const count = document.createElement("small");
      title.textContent = strand;
      count.textContent = `${groups.get(strand).length} 个知识点`;
      header.append(title, count);
      const list = document.createElement("div");
      list.className = "knowledge-strand-path";
      groups.get(strand).forEach((module, index) => {
        list.appendChild(createKnowledgeCard(module, index));
      });
      section.append(header, list);
      container.appendChild(section);
    });
  }

  function updateModulePanelCopy() {
    const modulesTitle = document.querySelector("#modules .panel__header h2");
    const modulesHint = document.querySelector("#modules .panel__hint");
    if (modulesTitle) {
      modulesTitle.textContent = "按知识点内在逻辑循序闯关";
    }
    if (modulesHint) {
      modulesHint.textContent = "不按年级分类；沿数学主线、先修关系和后续连接推进。";
    }
    document.getElementById("module-grades")?.setAttribute("hidden", "true");
  }

  function applyLearningMode() {
    saveMode();
    ensureModeSwitcher();
    updateModeButtons();
    updateModulePanelCopy();
    const gradeFilter = document.getElementById("grade-filter");
    const moduleList = document.getElementById("module-list");
    const knowledgeList = ensureKnowledgeContainer();

    if (clickGradeAllIfNeeded()) {
      return;
    }

    if (gradeFilter) {
      gradeFilter.hidden = true;
    }
    if (moduleList) {
      moduleList.hidden = true;
    }
    if (knowledgeList) {
      knowledgeList.hidden = false;
      renderKnowledgeModeList();
    }
  }

  function observeAppRenders() {
    const moduleList = document.getElementById("module-list");
    const difficultyFilter = document.getElementById("difficulty-filter");
    if (!("MutationObserver" in root)) {
      return;
    }
    const observer = new MutationObserver(() => {
      root.requestAnimationFrame?.(() => applyLearningMode()) || root.setTimeout(() => applyLearningMode(), 0);
    });
    if (moduleList) {
      observer.observe(moduleList, { childList: true, subtree: true });
    }
    if (difficultyFilter) {
      observer.observe(difficultyFilter, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    }
  }

  function boot() {
    if (typeof document === "undefined") {
      return;
    }
    ensureModeSwitcher();
    ensureKnowledgeContainer();
    applyLearningMode();
    observeAppRenders();
  }

  const api = {
    groupModulesByKnowledgeStrand,
    moduleMatchesDifficulty,
    normalizeMode
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.LearningModes = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);