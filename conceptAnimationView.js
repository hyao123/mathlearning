(function attachConceptAnimationView(root) {
  const autoplayTimers = new Map();

  function getActiveModule() {
    const title = document.getElementById("module-title")?.textContent?.trim();
    if (!title) {
      return null;
    }
    return (root.MATH_LEARNING_DATA || []).find((module) => module.title === title) || null;
  }

  function clearAutoplay(panel) {
    const timer = autoplayTimers.get(panel);
    if (timer) {
      root.clearInterval(timer);
      autoplayTimers.delete(panel);
    }
    const playButton = panel?.querySelector('[data-action="play"]');
    if (playButton) {
      playButton.textContent = "自动播放";
      playButton.dataset.playing = "false";
    }
  }

  function createSceneElement(className, text = "") {
    const element = document.createElement("span");
    element.className = className;
    element.textContent = text;
    return element;
  }

  function renderFlowScene(scene, step) {
    const tokens = step.tokens || [];
    tokens.forEach((token, index) => {
      const chip = createSceneElement("concept-animation__flow-chip", token);
      chip.style.setProperty("--delay", `${index * 120}ms`);
      scene.appendChild(chip);
    });
  }

  function renderBarsScene(scene, step) {
    const values = step.values || [];
    const maxValue = Math.max(...values, 1);
    const bars = document.createElement("div");
    bars.className = "concept-animation__bars";
    values.forEach((value, index) => {
      const bar = document.createElement("span");
      bar.className = `concept-animation__bar${index === step.highlightIndex ? " is-active" : ""}`;
      bar.style.setProperty("--bar-height", `${Math.max(18, (value / maxValue) * 120)}px`);
      bar.textContent = value;
      bars.appendChild(bar);
    });
    scene.appendChild(bars);
    if (Array.isArray(step.deltas)) {
      const deltas = document.createElement("div");
      deltas.className = "concept-animation__deltas";
      step.deltas.forEach((delta) => {
        deltas.appendChild(createSceneElement("concept-animation__delta", `+${delta}`));
      });
      scene.appendChild(deltas);
    }
  }

  function renderCycleScene(scene, step) {
    const cycle = step.cycle || [];
    const cycleWrapper = document.createElement("div");
    cycleWrapper.className = "concept-animation__cycle";
    cycle.forEach((item, index) => {
      const node = createSceneElement(`concept-animation__cycle-node${index === step.activeIndex ? " is-active" : ""}`, item);
      cycleWrapper.appendChild(node);
    });
    scene.appendChild(cycleWrapper);
    const formula = createSceneElement("concept-animation__formula", step.remainder ? `${step.target} ÷ ${cycle.length} = ${step.quotient} 余 ${step.remainder}` : `周期长度：${cycle.length}`);
    scene.appendChild(formula);
  }

  function renderTreeScene(scene, step) {
    const tree = document.createElement("div");
    tree.className = "concept-animation__tree";
    (step.levels || []).forEach((level, levelIndex) => {
      const row = document.createElement("div");
      row.className = `concept-animation__tree-level${levelIndex === step.activeLevel ? " is-active" : ""}`;
      level.forEach((item) => row.appendChild(createSceneElement("concept-animation__tree-node", item)));
      tree.appendChild(row);
    });
    scene.appendChild(tree);
  }

  function renderVennScene(scene, step) {
    const venn = document.createElement("div");
    venn.className = `concept-animation__venn is-${step.active || "left-right"}`;
    const left = createSceneElement("concept-animation__venn-circle concept-animation__venn-circle--left", `A ${step.left}`);
    const right = createSceneElement("concept-animation__venn-circle concept-animation__venn-circle--right", `B ${step.right}`);
    const overlap = createSceneElement("concept-animation__venn-overlap", step.overlap ? `重叠 ${step.overlap}` : "重叠");
    venn.append(left, right, overlap);
    scene.appendChild(venn);
    if (step.formula) {
      scene.appendChild(createSceneElement("concept-animation__formula", step.formula));
    }
  }

  function renderSegmentsScene(scene, step) {
    const wrapper = document.createElement("div");
    wrapper.className = "concept-animation__segments";
    (step.bars || []).forEach((barData, index) => {
      const row = document.createElement("div");
      row.className = `concept-animation__segment-row${index === step.active ? " is-active" : ""}`;
      const label = createSceneElement("concept-animation__segment-label", barData.label);
      const bar = document.createElement("span");
      bar.className = "concept-animation__segment-bar";
      bar.style.setProperty("--segment-width", `${Math.max(40, Number(barData.units || 1) * 16)}px`);
      if (barData.extra) {
        bar.dataset.extra = `+${barData.extra}`;
      }
      row.append(label, bar);
      wrapper.appendChild(row);
    });
    scene.appendChild(wrapper);
    if (step.formula) {
      scene.appendChild(createSceneElement("concept-animation__formula", step.formula));
    }
  }

  function renderReplacementScene(scene, step) {
    const animals = document.createElement("div");
    animals.className = "concept-animation__replacement";
    for (let index = 0; index < Number(step.count || 0); index += 1) {
      const isRabbit = index < Number(step.rabbits || 0);
      animals.appendChild(createSceneElement(`concept-animation__animal${isRabbit ? " is-rabbit" : ""}`, isRabbit ? "兔" : "鸡"));
    }
    scene.appendChild(animals);
    const summary = createSceneElement("concept-animation__formula", step.diff ? `实际腿数 ${step.legs}，多出 ${step.diff} 条` : `假设腿数：${step.legs}`);
    scene.appendChild(summary);
  }

  function renderMotionScene(scene, step) {
    const track = document.createElement("div");
    track.className = "concept-animation__motion-track";
    const left = createSceneElement("concept-animation__runner concept-animation__runner--left", "甲");
    const right = createSceneElement("concept-animation__runner concept-animation__runner--right", "乙");
    const progress = Math.min(Math.max(Number(step.progress || 0), 0), 1);
    left.style.setProperty("--progress", progress);
    right.style.setProperty("--progress", progress);
    track.append(left, right);
    scene.appendChild(track);
    scene.appendChild(createSceneElement("concept-animation__formula", step.formula || `距离 ${step.distance} 米，速度和 ${step.leftSpeed + step.rightSpeed} 米/分`));
  }

  function renderPointsScene(scene, step) {
    const points = document.createElement("div");
    points.className = `concept-animation__points is-${step.active || "points"}`;
    const total = Number(step.points || 0);
    for (let index = 0; index < total; index += 1) {
      const point = createSceneElement("concept-animation__point", "树");
      points.appendChild(point);
      if (index < total - 1) {
        points.appendChild(createSceneElement("concept-animation__interval", "间隔"));
      }
    }
    scene.appendChild(points);
    if (step.formula) {
      scene.appendChild(createSceneElement("concept-animation__formula", step.formula));
    }
  }

  function renderScene(scene, animation, step) {
    scene.innerHTML = "";
    scene.dataset.sceneType = animation.sceneType;
    const renderers = {
      bars: renderBarsScene,
      cycle: renderCycleScene,
      tree: renderTreeScene,
      venn: renderVennScene,
      segments: renderSegmentsScene,
      replacement: renderReplacementScene,
      motion: renderMotionScene,
      points: renderPointsScene,
      flow: renderFlowScene
    };
    (renderers[animation.sceneType] || renderFlowScene)(scene, step);
  }

  function updatePanel(panel, animation, nextIndex) {
    const index = root.ConceptAnimations.normalizeStepIndex(nextIndex, animation.steps.length);
    panel.dataset.stepIndex = String(index);
    const step = root.ConceptAnimations.getStep(animation, index);
    panel.querySelector(".concept-animation__step-label").textContent = `步骤 ${index + 1}/${animation.steps.length} · ${step.label}`;
    panel.querySelector(".concept-animation__narration").textContent = step.narration;
    renderScene(panel.querySelector(".concept-animation__scene"), animation, step);
    panel.querySelectorAll(".concept-animation__step-button").forEach((button, buttonIndex) => {
      button.classList.toggle("is-active", buttonIndex === index);
    });
  }

  function createPanel(module) {
    const animation = root.ConceptAnimations.getAnimationForModule(module);
    const panel = document.createElement("section");
    panel.className = "concept-animation";
    panel.dataset.moduleId = module.id;
    panel.dataset.stepIndex = "0";
    panel.innerHTML = `
      <div class="concept-animation__header">
        <div>
          <span class="section-tag">动画讲解</span>
          <h3></h3>
          <p class="muted"></p>
        </div>
        <div class="concept-animation__controls">
          <button class="button button--small button--ghost" type="button" data-action="prev">上一步</button>
          <button class="button button--small button--ghost" type="button" data-action="play" data-playing="false">自动播放</button>
          <button class="button button--small button--primary" type="button" data-action="next">下一步</button>
        </div>
      </div>
      <div class="concept-animation__body">
        <div class="concept-animation__scene" aria-live="polite"></div>
        <div class="concept-animation__script">
          <strong class="concept-animation__step-label"></strong>
          <p class="concept-animation__narration"></p>
          <div class="concept-animation__steps"></div>
        </div>
      </div>
    `;
    panel.querySelector("h3").textContent = animation.title;
    panel.querySelector(".concept-animation__header .muted").textContent = animation.intro;
    const stepButtons = panel.querySelector(".concept-animation__steps");
    animation.steps.forEach((step, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "concept-animation__step-button";
      button.textContent = step.label;
      button.addEventListener("click", () => {
        clearAutoplay(panel);
        updatePanel(panel, animation, index);
      });
      stepButtons.appendChild(button);
    });
    panel.querySelector('[data-action="prev"]').addEventListener("click", () => {
      clearAutoplay(panel);
      updatePanel(panel, animation, Number(panel.dataset.stepIndex) - 1);
    });
    panel.querySelector('[data-action="next"]').addEventListener("click", () => {
      clearAutoplay(panel);
      updatePanel(panel, animation, Number(panel.dataset.stepIndex) + 1);
    });
    panel.querySelector('[data-action="play"]').addEventListener("click", (event) => {
      const button = event.currentTarget;
      const playing = button.dataset.playing === "true";
      if (playing) {
        clearAutoplay(panel);
        return;
      }
      button.dataset.playing = "true";
      button.textContent = "暂停播放";
      const timer = root.setInterval(() => {
        const current = Number(panel.dataset.stepIndex || 0);
        updatePanel(panel, animation, current + 1 >= animation.steps.length ? 0 : current + 1);
      }, 1800);
      autoplayTimers.set(panel, timer);
    });
    updatePanel(panel, animation, 0);
    return panel;
  }

  function renderConceptAnimation() {
    if (!root.ConceptAnimations || typeof document === "undefined") {
      return;
    }
    const lessonPanel = document.getElementById("lesson-panel");
    const anchor = lessonPanel?.querySelector(".knowledge-topology") || lessonPanel?.querySelector(".math-essence") || lessonPanel?.querySelector(".panel__header");
    if (!lessonPanel || !anchor) {
      return;
    }
    const module = getActiveModule();
    const existing = lessonPanel.querySelector(".concept-animation");
    if (!module) {
      existing?.remove();
      return;
    }
    if (existing?.dataset.moduleId === module.id) {
      return;
    }
    if (existing) {
      clearAutoplay(existing);
      existing.remove();
    }
    anchor.insertAdjacentElement("afterend", createPanel(module));
  }

  function boot() {
    renderConceptAnimation();
    const title = document.getElementById("module-title");
    if (title && "MutationObserver" in root) {
      const observer = new MutationObserver(renderConceptAnimation);
      observer.observe(title, { childList: true, characterData: true, subtree: true });
    }
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
