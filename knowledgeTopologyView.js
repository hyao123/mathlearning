(function attachKnowledgeTopologyView(root) {
  function getActiveModule() {
    const title = document.getElementById("module-title")?.textContent?.trim();
    if (!title) {
      return null;
    }
    return (root.MATH_LEARNING_DATA || []).find((module) => module.title === title) || null;
  }

  function createPillList(items = [], emptyText) {
    const list = document.createElement("div");
    list.className = "knowledge-topology__pills";
    if (items.length === 0) {
      const empty = document.createElement("span");
      empty.className = "knowledge-topology__pill knowledge-topology__pill--empty";
      empty.textContent = emptyText;
      list.appendChild(empty);
      return list;
    }
    items.forEach((item) => {
      const pill = document.createElement("span");
      pill.className = "knowledge-topology__pill";
      pill.textContent = item;
      list.appendChild(pill);
    });
    return list;
  }

  function createLinkGroup(title, items, emptyText) {
    const group = document.createElement("div");
    group.className = "knowledge-topology__group";
    const heading = document.createElement("h4");
    heading.textContent = title;
    group.append(heading, createPillList(items, emptyText));
    return group;
  }

  function createPanel(module) {
    const topology = module.knowledgeTopology || root.KnowledgeTopology.getTopologyForModule(module);
    const panel = document.createElement("section");
    panel.className = "knowledge-topology";
    panel.dataset.moduleId = module.id;

    const header = document.createElement("div");
    header.className = "knowledge-topology__header";
    const tag = document.createElement("span");
    tag.className = "section-tag";
    tag.textContent = "知识谱系";
    const title = document.createElement("h3");
    title.textContent = `${topology.strand} · ${topology.stage}`;
    header.append(tag, title);

    const reason = document.createElement("p");
    reason.className = "knowledge-topology__reason";
    reason.textContent = topology.whyNow;

    const continuity = document.createElement("p");
    continuity.className = "knowledge-topology__continuity";
    continuity.textContent = topology.continuity;

    const grid = document.createElement("div");
    grid.className = "knowledge-topology__grid";
    grid.append(
      createLinkGroup("先修知识", topology.prerequisiteTitles || [], "可直接开始"),
      createLinkGroup("后续连接", topology.nextTitles || [], "阶段终点"),
      createLinkGroup("当前阶段", [topology.stage], "模型迁移")
    );

    panel.append(header, reason, continuity, grid);
    return panel;
  }

  function renderKnowledgeTopology() {
    if (!root.KnowledgeTopology || typeof document === "undefined") {
      return;
    }
    const lessonPanel = document.getElementById("lesson-panel");
    const mathEssence = lessonPanel?.querySelector(".math-essence");
    const header = lessonPanel?.querySelector(".panel__header");
    if (!lessonPanel || !header) {
      return;
    }
    const module = getActiveModule();
    const existing = lessonPanel.querySelector(".knowledge-topology");
    if (!module) {
      existing?.remove();
      return;
    }
    if (existing?.dataset.moduleId === module.id) {
      return;
    }
    existing?.remove();
    const panel = createPanel(module);
    if (mathEssence) {
      mathEssence.insertAdjacentElement("afterend", panel);
    } else {
      header.insertAdjacentElement("afterend", panel);
    }
  }

  function boot() {
    renderKnowledgeTopology();
    const title = document.getElementById("module-title");
    if (title && "MutationObserver" in root) {
      const observer = new MutationObserver(renderKnowledgeTopology);
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
