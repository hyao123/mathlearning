(function attachMathEssenceView(root) {
  function getActiveModule() {
    const title = document.getElementById("module-title")?.textContent?.trim();
    if (!title) {
      return null;
    }
    return (root.MATH_LEARNING_DATA || []).find((module) => module.title === title) || null;
  }

  function createList(items = []) {
    const list = document.createElement("ul");
    items.forEach((item) => {
      const row = document.createElement("li");
      row.textContent = item;
      list.appendChild(row);
    });
    return list;
  }

  function createGroup(title, items) {
    const group = document.createElement("div");
    group.className = "math-essence__group";
    const heading = document.createElement("h4");
    heading.textContent = title;
    group.appendChild(heading);
    group.appendChild(createList(items));
    return group;
  }

  function createEssencePanel(module) {
    const essence = module.mathEssence || root.MathEssence.getEssenceForModule(module);
    const panel = document.createElement("section");
    panel.className = "math-essence";
    panel.dataset.moduleId = module.id;

    const header = document.createElement("div");
    header.className = "math-essence__header";
    const label = document.createElement("span");
    label.className = "section-tag";
    label.textContent = "数学本源";
    const title = document.createElement("h3");
    title.textContent = "先理解模型，再做题";
    header.append(label, title);

    const bigIdea = document.createElement("p");
    bigIdea.className = "math-essence__big-idea";
    bigIdea.textContent = essence.bigIdea;

    const question = document.createElement("p");
    question.className = "math-essence__question";
    question.textContent = `核心追问：${essence.essentialQuestion}`;

    const grid = document.createElement("div");
    grid.className = "math-essence__grid";
    grid.append(
      createGroup("核心模型", essence.coreModels),
      createGroup("推荐表征", essence.representations),
      createGroup("迁移提醒", essence.transferTips),
      createGroup("本质易错点", essence.misconceptions),
      createGroup("学习路径", essence.progression)
    );

    panel.append(header, bigIdea, question, grid);
    return panel;
  }

  function renderMathEssence() {
    if (!root.MathEssence || typeof document === "undefined") {
      return;
    }
    const lessonPanel = document.getElementById("lesson-panel");
    const header = lessonPanel?.querySelector(".panel__header");
    if (!lessonPanel || !header) {
      return;
    }

    const module = getActiveModule();
    const existing = lessonPanel.querySelector(".math-essence");
    if (!module) {
      existing?.remove();
      return;
    }

    if (existing?.dataset.moduleId === module.id) {
      return;
    }

    existing?.remove();
    header.insertAdjacentElement("afterend", createEssencePanel(module));
  }

  function boot() {
    renderMathEssence();
    const title = document.getElementById("module-title");
    if (title && "MutationObserver" in root) {
      const observer = new MutationObserver(renderMathEssence);
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
