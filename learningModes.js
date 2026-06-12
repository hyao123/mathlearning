(function attachLearningModes(root) {
  const storageKey = "mathlearning-learning-mode-v1";
  const modes = {
    grade: "grade",
    knowledge: "knowledge"
  };

  function normalizeMode(value) {
    return value === modes.knowledge ? modes.knowledge : modes.grade;
  }

  function getSavedMode() {
    try {
      return normalizeMode(root.localStorage?.getItem(storageKey));
    } catch (error) {
      return modes.grade;
    }
  }

  function saveMode(mode) {
    try {
      root.localStorage?.setItem(storageKey, normalizeMode(mode));
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

  function clickGradeAllIfNeeded() {
    const gradeFilter = document.getElementById("grade-filter");
    const activeGrade = getActiveChipText(gradeFilter);
    if (activeGrade === "全部") {
      return false;
    }
    const allButton = Array.from(gradeFilter.querySelectorAll("button")).find((button) => button.textContent.trim() === "全部");
    allButton?.click();
    return Boolean(allButton);
  }

  function createModeSwitcher(activeMode) {
    const wrapper = document.createElement("section");
    wrapper.className = "learning-mode-switcher";
    wrapper.innerHTML = `
      <div>
        <strong>学习方式</strong>
        <p class="muted">可以按年级循序学，也可以按知识点主线学。</p>
      </div>
      <div class="learning-mode-switcher__actions">
        <button type="button" data-mode="grade">按年级学习</button>
        <button type="button" data-mode="knowledge">按知识点学习</button>
      </div>
    `;
    wrapper.querySelectorAll("button").forEach((button) => {
      const buttonMode = normalizeMode(button.dataset.mode);
      button.className = `learning-mode-button${buttonMode === activeMode ? " is-active" : ""}`;
      button.addEventListener("click", () => {
        saveMode(buttonMode);
        applyLearningMode(buttonMode);
      });
    });
    return wrapper;
  }

  function ensureModeSwitcher() {
    if (document.querySelector(".learning-mode-switcher")) {
      return;
    }
    const gradeFilter = document.getElementById("grade-filter");
    if (!gradeFilter?.parentElement) {
      return;
    }
    gradeFilter.parentElement.insertBefore(createModeSwitcher(getSavedMode()), gradeFilter);
  }

  function updateModeButtons(activeMode) {
    document.querySelectorAll(".learning-mode-button").forEach((button) => {
      button.classList.toggle("is-active", normalizeMode(button.dataset.mode) === activeMode);
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
    overview.querySelector("strong").textContent = `按知识点学习 · ${difficulty === "全部" ? "全部难度" : difficulty}`;
    overview.querySelector("p").textContent = "按知识主线组织模块，适合围绕一个数学模型持续深入。";
    overview.querySelector(".badge").textContent = `${modules.length} 个知识点 · ${practiceCount} 道练习题`;
    return overview;
  }

  function createKnowledgeCard(module, index) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "knowledge-mode-card";
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
    card.addEventListener("click", () => {
      const originalButton = getOriginalModuleButton(module.title);
      if (originalButton) {
        originalButton.click();
      }
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

  function applyLearningMode(mode = getSavedMode()) {
    const activeMode = normalizeMode(mode);
    saveMode(activeMode);
    ensureModeSwitcher();
    updateModeButtons(activeMode);
    const gradeFilter = document.getElementById("grade-filter");
    const moduleList = document.getElementById("module-list");
    const knowledgeList = ensureKnowledgeContainer();

    if (activeMode === modes.knowledge) {
      if (clickGradeAllIfNeeded()) {
        return;
      }
      gradeFilter.hidden = true;
      moduleList.hidden = true;
      knowledgeList.hidden = false;
      renderKnowledgeModeList();
      return;
    }

    gradeFilter.hidden = false;
    moduleList.hidden = false;
    if (knowledgeList) {
      knowledgeList.hidden = true;
    }
  }

  function observeAppRenders() {
    const moduleList = document.getElementById("module-list");
    const difficultyFilter = document.getElementById("difficulty-filter");
    if (!("MutationObserver" in root)) {
      return;
    }
    const observer = new MutationObserver(() => {
      root.requestAnimationFrame?.(() => applyLearningMode(getSavedMode())) || root.setTimeout(() => applyLearningMode(getSavedMode()), 0);
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
    applyLearningMode(getSavedMode());
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
