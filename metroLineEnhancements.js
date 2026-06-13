(function attachMetroLineEnhancements(root) {
  let scheduled = false;

  const strandClassMap = {
    "观察与周期": "observation",
    "计数与集合": "counting",
    "数量关系": "quantity",
    "变化与效率": "change",
    "空间与离散结构": "space",
    "逻辑推理": "logic",
    "综合拓展": "mixed"
  };

  function getModules() {
    return Array.isArray(root.MATH_LEARNING_DATA) ? root.MATH_LEARNING_DATA : [];
  }

  function getModuleByTitle(title) {
    return getModules().find((module) => module.title === title) || null;
  }

  function getCardTitle(card) {
    return card.querySelector("strong")?.textContent?.trim() || "";
  }

  function getStationCards(path) {
    return Array.from(path.querySelectorAll(".metro-quest-node"));
  }

  function getStrandClass(strand) {
    return strandClassMap[strand] || strandClassMap["综合拓展"];
  }

  function addClassOnce(element, className) {
    if (!element.classList.contains(className)) {
      element.classList.add(className);
    }
  }

  function setDatasetOnce(element, key, value) {
    if (element.dataset[key] !== value) {
      element.dataset[key] = value;
    }
  }

  function syncTrainMarker(card, shouldShow) {
    const train = card.querySelector(".metro-current-train");
    if (!shouldShow) {
      if (train) {
        train.remove();
      }
      card.classList.remove("has-current-train");
      return;
    }
    addClassOnce(card, "has-current-train");
    if (!train) {
      const nextTrain = document.createElement("span");
      nextTrain.className = "metro-current-train";
      nextTrain.textContent = "🚇";
      nextTrain.setAttribute("aria-label", "小火车停靠在当前站");
      card.appendChild(nextTrain);
    }
  }

  function decoratePath(path) {
    const cards = getStationCards(path);
    if (cards.length === 0) {
      return;
    }
    const strands = cards.map((card) => getModuleByTitle(getCardTitle(card))?.knowledgeTopology?.strand || "综合拓展");
    const primaryStrand = strands[0] || "综合拓展";
    setDatasetOnce(path, "metroStrand", primaryStrand);
    addClassOnce(path, "metro-colored-line");
    addClassOnce(path, `metro-colored-line--${getStrandClass(primaryStrand)}`);

    cards.forEach((card) => {
      const module = getModuleByTitle(getCardTitle(card));
      const strand = module?.knowledgeTopology?.strand || "综合拓展";
      const strandClass = getStrandClass(strand);
      setDatasetOnce(card, "metroStrand", strand);
      addClassOnce(card, "metro-colored-node");
      addClassOnce(card, `metro-colored-node--${strandClass}`);
      syncTrainMarker(card, card.classList.contains("is-quest-current") || card.classList.contains("is-quest-needs-review"));
    });
  }

  function renderLegend() {
    const modulesPanel = document.getElementById("modules");
    if (!modulesPanel || document.getElementById("metro-line-legend")) {
      return;
    }
    const legend = document.createElement("div");
    legend.id = "metro-line-legend";
    legend.className = "metro-line-legend";
    Object.entries(strandClassMap).forEach(([strand, className]) => {
      const item = document.createElement("span");
      item.className = `metro-line-legend__item metro-line-legend__item--${className}`;
      item.textContent = strand;
      legend.appendChild(item);
    });
    const recommendation = document.getElementById("station-next-recommendation");
    (recommendation || modulesPanel.querySelector(".panel__header") || modulesPanel).insertAdjacentElement("afterend", legend);
  }

  function decorate() {
    if (typeof document === "undefined") {
      return;
    }
    document.querySelectorAll(".metro-quest-line").forEach(decoratePath);
    renderLegend();
  }

  function scheduleDecorate() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    const callback = () => {
      scheduled = false;
      decorate();
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
    ["module-list", "knowledge-mode-list", "quest-map-summary", "station-next-recommendation"].forEach((id) => {
      const element = document.getElementById(id);
      if (!element) {
        return;
      }
      const observer = new MutationObserver(scheduleDecorate);
      observer.observe(element, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class", "hidden"] });
    });
  }

  function boot() {
    decorate();
    observe();
  }

  const api = {
    decorate,
    strandClassMap
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MetroLineEnhancements = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
