(function attachMathLearningApp(root) {
  const progressStorageKey = "mathlearning-progress-v2";

  function getRuntime() {
    return root.MathLearningRuntime || null;
  }

  function getModules() {
    return Array.isArray(getRuntime()?.modules) ? getRuntime().modules : Array.isArray(root.MATH_LEARNING_DATA) ? root.MATH_LEARNING_DATA : [];
  }

  function findModuleById(moduleId) {
    return getModules().find((module) => module.id === moduleId) || null;
  }

  function findModuleByTitle(moduleTitle) {
    return getModules().find((module) => module.title === moduleTitle) || null;
  }

  function getActiveChipText(containerId, fallback = "全部") {
    const container = root.document?.getElementById(containerId);
    return container?.querySelector(".is-active")?.textContent?.trim() || fallback;
  }

  function getActiveFilters() {
    const runtime = getRuntime();
    if (runtime?.selectors) {
      return {
        grade: runtime.selectors.activeGrade,
        difficulty: runtime.selectors.activeDifficulty
      };
    }

    return {
      grade: getActiveChipText("grade-filter"),
      difficulty: getActiveChipText("difficulty-filter")
    };
  }

  function clickChip(containerId, label) {
    const container = root.document?.getElementById(containerId);
    const button = Array.from(container?.querySelectorAll("button") || []).find((item) => item.textContent.trim() === label);
    if (!button || button.classList.contains("is-active")) {
      return false;
    }
    button.click();
    return true;
  }

  function getOriginalModuleButton(module) {
    if (!module) {
      return null;
    }
    return Array.from(root.document?.querySelectorAll("#module-list .module-path__item") || []).find(
      (button) => button.querySelector("strong")?.textContent?.trim() === module.title
    );
  }

  function scrollToLessonPanel() {
    root.document?.getElementById("lesson-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openModule(moduleId, options = {}) {
    const module = findModuleById(moduleId);
    if (!module) {
      return false;
    }

    const runtime = getRuntime();
    if (runtime?.selectors && typeof runtime.render === "function") {
      runtime.selectors.activeGrade = "全部";
      runtime.setActiveModuleId(moduleId);
      runtime.render();
      if (options.scroll !== false) {
        scrollToLessonPanel();
      }
      return true;
    }

    const openVisibleModule = () => {
      const button = getOriginalModuleButton(module);
      if (!button) {
        return false;
      }
      button.click();
      if (options.scroll !== false) {
        scrollToLessonPanel();
      }
      return true;
    };

    if (clickChip("grade-filter", "全部")) {
      root.setTimeout(openVisibleModule, 0);
      return true;
    }

    return openVisibleModule();
  }

  function getActiveModuleId() {
    const runtime = getRuntime();
    if (runtime?.selectors) {
      return runtime.selectors.activeModuleId || "";
    }

    const activeTitle = root.document
      ?.querySelector("#module-list .module-path__item.is-active strong")
      ?.textContent
      ?.trim();
    return activeTitle ? findModuleByTitle(activeTitle)?.id || "" : "";
  }

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function getState() {
    const runtime = getRuntime();
    if (typeof runtime?.getState === "function") {
      return runtime.getState();
    }
    return safeParse(root.localStorage?.getItem(progressStorageKey), null);
  }

  function saveState(nextState, options = {}) {
    if (!nextState || typeof nextState !== "object") {
      return false;
    }

    const runtime = getRuntime();
    if (runtime?.setState && runtime?.saveState) {
      runtime.setState(nextState);
      runtime.saveState();
    } else {
      root.localStorage?.setItem(progressStorageKey, JSON.stringify(nextState));
    }

    if (options.reload) {
      root.location?.reload();
    }
    return true;
  }

  const api = {
    findModuleById,
    getActiveFilters,
    getActiveModuleId,
    getState,
    openModule,
    saveState
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MathLearningApp = api;
})(typeof window !== "undefined" ? window : globalThis);
