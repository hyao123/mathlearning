(function attachStationExperience(root) {
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
      return safeParse(root.localStorage?.getItem(progressStorageKey), {});
    } catch (error) {
      return {};
    }
  }

  function getTodayKey() {
    if (root.ReviewScheduler?.toDateKey) {
      return root.ReviewScheduler.toDateKey(new Date());
    }
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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

  function getActiveModule() {
    const title = document.getElementById("module-title")?.textContent?.trim();
    return getModuleByTitle(title) || getModules()[0] || null;
  }

  function getMasteries(state) {
    if (!root.MasteryModel?.calculateAllMastery) {
      return [];
    }
    return root.MasteryModel.calculateAllMastery(getModules(), state, { todayKey: getTodayKey() });
  }

  function getMastery(module, state) {
    if (!module) {
      return null;
    }
    if (root.MasteryModel?.calculateModuleMastery) {
      return root.MasteryModel.calculateModuleMastery(module, state, { todayKey: getTodayKey() });
    }
    return null;
  }

  function getQuestStates(state) {
    if (!root.QuestMap?.calculateQuestStates) {
      return [];
    }
    return root.QuestMap.calculateQuestStates(getModules(), state, getMasteries(state));
  }

  function getQuestState(module, state) {
    return getQuestStates(state).find((item) => item.moduleId === module?.id) || null;
  }

  function getTitleList(ids = [], titles = []) {
    const byIds = ids.map((id) => getModuleById(id)?.title).filter(Boolean);
    return titles.length > 0 ? titles : byIds;
  }

  function toPercent(value) {
    return `${Math.round(Math.min(Math.max(Number(value) || 0, 0), 1) * 100)}%`;
  }

  function isVisible(element) {
    return Boolean(element) && !element.closest("[hidden]");
  }

  function getCardTitle(card) {
    return card.querySelector("strong")?.textContent?.trim() || "";
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

  function scrollToElement(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  function createButton(text, variant, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `button button--small ${variant}`;
    button.textContent = text;
    button.addEventListener("click", onClick);
    return button;
  }

  function ensureRecommendationCard() {
    let panel = document.getElementById("station-next-recommendation");
    if (panel) {
      return panel;
    }
    const modulesPanel = document.getElementById("modules");
    const header = modulesPanel?.querySelector(".panel__header");
    if (!modulesPanel || !header) {
      return null;
    }
    panel = document.createElement("section");
    panel.id = "station-next-recommendation";
    panel.className = "station-next-card";
    header.insertAdjacentElement("afterend", panel);
    return panel;
  }

  function ensureStationDetail() {
    let panel = document.getElementById("station-detail-panel");
    if (panel) {
      return panel;
    }
    const lessonPanel = document.getElementById("lesson-panel");
    const header = lessonPanel?.querySelector(".panel__header");
    if (!lessonPanel || !header) {
      return null;
    }
    panel = document.createElement("section");
    panel.id = "station-detail-panel";
    panel.className = "station-detail-panel";
    header.insertAdjacentElement("beforebegin", panel);
    return panel;
  }

  function getDueWrongItems(state) {
    const todayKey = getTodayKey();
    if (root.ReviewQueueModel?.getDueWrongBookItems) {
      return root.ReviewQueueModel.getDueWrongBookItems(state, todayKey);
    }
    return Array.isArray(state?.wrongBook) ? state.wrongBook : [];
  }

  function buildRecommendation(state) {
    const modules = getModules();
    const dueItems = getDueWrongItems(state);
    if (dueItems.length > 0) {
      const targetModule = getModuleById(dueItems[0].moduleId) || getModuleByTitle(dueItems[0].moduleTitle);
      return {
        tone: "review",
        emoji: "🛠️",
        eyebrow: "下一步推荐 · 维修站",
        title: `先修复 ${dueItems.length} 道今日待复习错题`,
        focus: targetModule ? `关联站点：${targetModule.title}` : "关联站点：错题本",
        reason: "复习队列里已有到期错题，先修复薄弱点，比继续开新站更稳。",
        primaryText: "错题重新组卷",
        primaryAction: () => {
          document.getElementById("generate-wrong-paper")?.click();
          scrollToElement("paper-generator-panel");
        },
        secondaryText: targetModule ? "查看关联站点" : "查看错题本",
        secondaryAction: () => (targetModule ? openModule(targetModule) : scrollToElement("wrong-book"))
      };
    }

    const questStates = getQuestStates(state);
    const summary = root.QuestMap?.summarizeQuest ? root.QuestMap.summarizeQuest(questStates) : null;
    const nextStation = summary?.current;
    if (nextStation) {
      const targetModule = getModuleById(nextStation.moduleId) || getModuleByTitle(nextStation.moduleTitle);
      const isNewStation = nextStation.status.id === "unlocked" || nextStation.status.id === "current";
      return {
        tone: isNewStation ? "current" : "review",
        emoji: nextStation.status.emoji || "🚉",
        eyebrow: "下一步推荐 · 当前站",
        title: `${nextStation.stationCode}「${nextStation.moduleTitle}」`,
        focus: `${nextStation.status.label} · 完成 ${nextStation.completed}/${nextStation.total} 题`,
        reason: nextStation.hint || "从当前推荐站开始推进，路线最连贯。",
        primaryText: "进入当前站",
        primaryAction: () => openModule(targetModule),
        secondaryText: "查看路线图",
        secondaryAction: () => scrollToElement("modules")
      };
    }

    const masteries = getMasteries(state);
    const nextLearning = root.MasteryModel?.summarizeMastery ? root.MasteryModel.summarizeMastery(masteries).nextLearning : null;
    const targetModule = nextLearning ? getModuleById(nextLearning.moduleId) : modules[0];
    return {
      tone: "free",
      emoji: "🏆",
      eyebrow: "下一步推荐 · 自由探索",
      title: targetModule ? `复盘或挑战「${targetModule.title}」` : "全线已通关",
      focus: "可以复盘已掌握知识，也可以生成一套综合卷。",
      reason: "当前没有明显到期错题，适合做综合巩固或继续探索。",
      primaryText: targetModule ? "进入站点" : "生成综合卷",
      primaryAction: () => (targetModule ? openModule(targetModule) : document.getElementById("generate-paper")?.click()),
      secondaryText: "随机组卷",
      secondaryAction: () => scrollToElement("paper-generator-panel")
    };
  }

  function renderRecommendation() {
    const panel = ensureRecommendationCard();
    if (!panel) {
      return;
    }
    const recommendation = buildRecommendation(readState());
    panel.className = `station-next-card station-next-card--${recommendation.tone}`;
    panel.innerHTML = "";

    const icon = createElement("div", "station-next-card__icon", recommendation.emoji);
    const content = createElement("div", "station-next-card__content");
    const eyebrow = createElement("span", "station-next-card__eyebrow", recommendation.eyebrow);
    const title = createElement("strong", "station-next-card__title", recommendation.title);
    const focus = createElement("p", "station-next-card__focus", recommendation.focus);
    const reason = createElement("p", "station-next-card__reason", recommendation.reason);
    content.append(eyebrow, title, focus, reason);

    const actions = createElement("div", "station-next-card__actions");
    actions.append(
      createButton(recommendation.primaryText, "button--primary", recommendation.primaryAction),
      createButton(recommendation.secondaryText, "button--ghost", recommendation.secondaryAction)
    );
    panel.append(icon, content, actions);
  }

  function renderStat(label, value, extraClass = "") {
    const stat = createElement("div", `station-detail-stat ${extraClass}`.trim());
    stat.append(createElement("span", "", label), createElement("strong", "", value));
    return stat;
  }

  function createChip(text, tone = "") {
    return createElement("span", `station-detail-chip ${tone}`.trim(), text);
  }

  function renderList(title, items, emptyText) {
    const block = createElement("div", "station-detail-block");
    block.appendChild(createElement("h4", "", title));
    if (!items || items.length === 0) {
      block.appendChild(createElement("p", "muted", emptyText));
      return block;
    }
    const list = createElement("div", "station-detail-chip-list");
    items.forEach((item) => list.appendChild(createChip(item)));
    block.appendChild(list);
    return block;
  }

  function getEssence(module) {
    return module?.mathEssence || {};
  }

  function renderStationDetail() {
    const panel = ensureStationDetail();
    const module = getActiveModule();
    if (!panel || !module) {
      return;
    }

    const state = readState();
    const mastery = getMastery(module, state);
    const questState = getQuestState(module, state);
    const topology = module.knowledgeTopology || {};
    const essence = getEssence(module);
    const stats = mastery?.stats || {};
    const stationCode = questState?.stationCode || "M--";
    const stationStatus = questState?.status?.label || mastery?.status?.label || "准备出发";
    const completed = Number(stats.completed ?? questState?.completed ?? 0);
    const total = Number(stats.total ?? questState?.total ?? module.practices?.length ?? 0);
    const accuracy = stats.accuracyText || (stats.attempts > 0 ? toPercent(stats.accuracy) : "暂无");
    const scoreText = mastery?.scoreText || `${Math.round((total === 0 ? 0 : completed / total) * 100)} 分`;
    const prerequisiteTitles = getTitleList(topology.prerequisiteIds || [], topology.prerequisiteTitles || []);
    const nextTitles = getTitleList(topology.nextIds || [], topology.nextTitles || []);

    panel.innerHTML = "";
    panel.className = `station-detail-panel station-detail-panel--${questState?.status?.id || mastery?.status?.id || "ready"}`;

    const header = createElement("div", "station-detail-hero");
    const badge = createElement("div", "station-detail-hero__badge", stationCode);
    const titleWrap = createElement("div", "station-detail-hero__text");
    titleWrap.append(
      createElement("span", "station-detail-hero__eyebrow", `${topology.strand || "综合拓展"} · ${topology.stage || "模型迁移"}`),
      createElement("h3", "", module.title),
      createElement("p", "", topology.whyNow || module.description || "从本站开始理解这一类题背后的数学模型。")
    );
    const status = createElement("div", "station-detail-hero__status");
    status.append(createElement("span", "", "本站状态"), createElement("strong", "", stationStatus));
    header.append(badge, titleWrap, status);

    const statsGrid = createElement("div", "station-detail-stats");
    statsGrid.append(
      renderStat("通关进度", `${completed}/${total} 题`),
      renderStat("正确率", accuracy),
      renderStat("掌握分", scoreText),
      renderStat("错题回访", `${stats.dueWrongBook || 0} 道`, Number(stats.dueWrongBook || 0) > 0 ? "is-warning" : "")
    );

    const body = createElement("div", "station-detail-body");
    const core = createElement("div", "station-detail-block station-detail-block--core");
    core.append(
      createElement("h4", "", "本站核心"),
      createElement("p", "station-detail-bigidea", essence.bigIdea || "把题目中的数量关系转成可操作的模型，再用稳定步骤解决。"),
      createElement("p", "station-detail-question", essence.essentialQuestion ? `关键追问：${essence.essentialQuestion}` : "关键追问：这道题最重要的关系是什么？")
    );

    const route = createElement("div", "station-detail-block");
    route.appendChild(createElement("h4", "", "推荐学习动作"));
    const routeSteps = createElement("ol", "station-detail-steps");
    ["先看本站核心模型和例题思路", "完成闯关练习，优先独立作答", "答错后进入维修站，复盘提示与常见错误"].forEach((step) => {
      const item = document.createElement("li");
      item.textContent = step;
      routeSteps.appendChild(item);
    });
    route.appendChild(routeSteps);

    body.append(
      core,
      route,
      renderList("先修站点", prerequisiteTitles, "可直接从本站开始。"),
      renderList("后续站点", nextTitles, "这是当前线路的阶段终点。"),
      renderList("可迁移模型", essence.coreModels || [], "先掌握本站例题，再提炼模型。"),
      renderList("推荐表征", essence.representations || [], "可以先画图、列表或线段图帮助理解。")
    );

    const actions = createElement("div", "station-detail-actions");
    actions.append(
      createButton("看例题", "button--ghost", () => scrollToElement("examples")),
      createButton("开始闯关", "button--primary", () => scrollToElement("practice-list")),
      createButton("回到路线图", "button--ghost", () => scrollToElement("modules"))
    );

    panel.append(header, statsGrid, body, actions);
  }

  function renderAll() {
    renderRecommendation();
    renderStationDetail();
  }

  function scheduleRender() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    const callback = () => {
      scheduled = false;
      renderAll();
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
    ["module-title", "module-progress", "practice-list", "wrong-book-list", "module-list", "knowledge-mode-list"].forEach((id) => {
      const element = document.getElementById(id);
      if (!element) {
        return;
      }
      const observer = new MutationObserver(scheduleRender);
      observer.observe(element, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class", "hidden"] });
    });
    root.addEventListener?.("storage", scheduleRender);
  }

  function boot() {
    if (typeof document === "undefined") {
      return;
    }
    renderAll();
    observe();
  }

  const api = {
    buildRecommendation,
    getActiveModule,
    renderAll
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.StationExperience = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
