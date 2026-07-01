const lazyState = {};

function observeOnce(element, callback, key) {
  if (!element) { callback(); lazyState[key] = true; return; }
  if (lazyState[key]) { callback(); return; }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        lazyState[key] = true;
        callback();
      }
    }, { rootMargin: '200px' });
    observer.observe(element);
  } else {
    lazyState[key] = true;
    setTimeout(callback, 0);
  }
}

const modules = window.MATH_LEARNING_DATA;
const appStateModel = window.AppState;
const appSelectors = window.AppSelectors;
const appDom = window.AppDom;
const storageKey = "mathlearning-progress-v2";
const legacyStorageKey = "mathlearning-progress-v1";

const gradeFilter = document.getElementById("grade-filter");
const difficultyFilter = document.getElementById("difficulty-filter");
const dailyPracticeDate = document.getElementById("daily-practice-date");
const dailyPracticeList = document.getElementById("daily-practice-list");
const paperCount = document.getElementById("paper-count");
const generatePaperButton = document.getElementById("generate-paper");
const generateWrongPaperButton = document.getElementById("generate-wrong-paper");
const paperGeneratorTip = document.getElementById("paper-generator-tip");
const paperSummary = document.getElementById("paper-summary");
const paperList = document.getElementById("paper-list");
const moduleList = document.getElementById("module-list");
const moduleTitle = document.getElementById("module-title");
const moduleDescription = document.getElementById("module-description");
const moduleGrades = document.getElementById("module-grades");
const moduleRouteContext = document.getElementById("module-route-context");
const moduleProgress = document.getElementById("module-progress");
const examplesContainer = document.getElementById("examples");
const practiceList = document.getElementById("practice-list");
const wrongBookList = document.getElementById("wrong-book-list");
const dashboardCards = document.getElementById("dashboard-cards");
const recentPaperSummary = document.getElementById("recent-paper-summary");
const masteryRanking = document.getElementById("mastery-ranking");
const moduleSummary = document.getElementById("module-summary");
const heroStats = document.getElementById("hero-stats");
const clearWrongBookButton = document.getElementById("clear-wrong-book");
const exportReportButton = document.getElementById("export-report");
const exportProgressButton = document.getElementById("export-progress");
const importProgressButton = document.getElementById("import-progress");
const importProgressFile = document.getElementById("import-progress-file");
const exampleTemplate = document.getElementById("example-template");
const practiceTemplate = document.getElementById("practice-template");

const gradeOptions = ["全部", "一年级", "二年级", "三年级", "四年级", "五年级", "六年级"];
const difficultyOptions = ["全部", "基础", "进阶", "提高", "挑战"];

let appState = loadState();
let activeGrade = "全部";
let activeDifficulty = "全部";
let activeModuleId = modules[0]?.id || "";

function loadState() {
  try {
    const saved = localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey);
    return saved ? appStateModel.migrateLegacyState(JSON.parse(saved)) : appStateModel.cloneDefaultState();
  } catch (error) {
    return appStateModel.cloneDefaultState();
  }
}

function saveState() {
  appState.stats = appStateModel.calculateStats(appState.answerHistory);
  localStorage.setItem(storageKey, JSON.stringify(appState));
}

function getTodayKey() {
  return window.ReviewScheduler?.toDateKey ? window.ReviewScheduler.toDateKey(new Date()) : formatDateKey(new Date());
}

function formatDateKey(date) {
  return appStateModel.formatDateKey(date);
}

function getDailyStorageKey() {
  return `${getTodayKey()}::${activeGrade}::${activeDifficulty}`;
}

function hashString(value) {
  return appStateModel.hashString(value);
}

function matchesDifficulty(item) {
  return appSelectors.matchesDifficulty(item, activeDifficulty);
}

function getModuleExamples(module) {
  return appSelectors.getModuleExamples(module, activeDifficulty);
}

function getModulePractices(module) {
  return appSelectors.getModulePractices(module, activeDifficulty);
}

function getVisibleModules() {
  return appSelectors.getVisibleModules(modules, activeGrade, activeDifficulty);
}

function getPracticePool() {
  return appSelectors.getPracticePool(modules, activeGrade, activeDifficulty);
}

function getDailyPracticeItems() {
  const pool = getPracticePool();
  const dailyKey = getDailyStorageKey();
  if (window.AdaptivePractice?.selectDailyPracticeItems) {
    return window.AdaptivePractice.selectDailyPracticeItems({
      pool,
      state: appState,
      dailyKey,
      targetCount: Math.min(3, pool.length),
      seed: hashString(dailyKey)
    });
  }

  const seed = hashString(dailyKey);
  return [...pool]
    .map((item, index) => ({ item, score: hashString(`${seed}-${item.id}-${index}`) }))
    .sort((left, right) => left.score - right.score)
    .slice(0, Math.min(3, pool.length))
    .map((entry) => entry.item);
}

function isCorrectAnswer(userAnswer, practice) {
  return window.AnswerMatcher.isAnswerCorrect(userAnswer, practice.answer, {
    acceptedAnswers: practice.acceptedAnswers || []
  });
}

function getAnswerRecord(practiceId) {
  if (!appState.answerHistory[practiceId]) {
    appState.answerHistory[practiceId] = {
      attempts: 0,
      correct: 0,
      latestCorrect: false,
      firstCorrect: null,
      lastAnswer: ""
    };
  }
  return appState.answerHistory[practiceId];
}

function getPracticeForReview(practice, module) {
  return {
    ...practice,
    moduleId: module?.id || practice.moduleId,
    moduleTitle: module?.title || practice.moduleTitle || "综合练习"
  };
}

function updateReviewQueue(practice, module, isCorrect) {
  const wasInWrongBook = appState.wrongBook.some((item) => item.id === practice.id);
  if (isCorrect && !wasInWrongBook) {
    return;
  }

  appState = window.ReviewQueueModel.updateWrongBookAfterAnswer({
    state: appState,
    practice: getPracticeForReview(practice, module),
    isCorrect,
    todayKey: getTodayKey()
  });
}

function updatePracticeResult(practice, module, isCorrect, userAnswer) {
  const record = getAnswerRecord(practice.id);
  record.attempts += 1;
  record.lastAnswer = userAnswer;
  record.latestCorrect = isCorrect;
  record.lastAnsweredAt = new Date().toISOString();

  if (record.firstCorrect === null) {
    record.firstCorrect = isCorrect;
  }

  if (isCorrect) {
    record.correct += 1;
    appState.completed[practice.id] = true;
    updateReviewQueue(practice, module, true);
    return `回答正确：${practice.explanation}`;
  }

  updateReviewQueue(practice, module, false);
  return `这题答错了。正确答案：${practice.answer}。${practice.explanation}`;
}

function createFeedbackClass(isCorrect) {
  return `feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
}

function getModuleByPracticeId(practiceId) {
  return modules.find((module) => module.practices.some((practice) => practice.id === practiceId));
}

function getActiveModule() {
  const visibleModules = getVisibleModules();
  return visibleModules.find((module) => module.id === activeModuleId) || visibleModules[0] || null;
}

function getModuleById(moduleId) {
  return modules.find((module) => module.id === moduleId) || null;
}

function getNextModule(module) {
  const explicitNextId = module?.knowledgeTopology?.nextIds?.[0];
  if (explicitNextId) {
    return getModuleById(explicitNextId);
  }
  const visibleModules = getVisibleModules();
  const index = visibleModules.findIndex((item) => item.id === module?.id);
  return index >= 0 ? visibleModules[index + 1] || null : null;
}

function getModuleCompletedCount(moduleId, visiblePractices = null) {
  return appSelectors.getModuleCompletedCount(modules.find((module) => module.id === moduleId), appState.completed, visiblePractices);
}

function getTotalPracticeCount() {
  return appSelectors.getTotalPracticeCount(modules);
}

function getCorrectRate() {
  return appSelectors.getCorrectRate(appState.stats);
}

function setChildrenText(element, values, className) {
  appDom.setChildrenText(element, values, className);
}

function renderEmptyBox(container, text) {
  appDom.renderEmptyBox(container, text);
}

function renderRouteContext(module) {
  moduleRouteContext.innerHTML = "";
  if (!module) {
    return;
  }
  const nextModule = getNextModule(module);
  const topology = module.knowledgeTopology || {};
  [
    `当前阶段：${topology.stage || "知识建模"}`,
    `为什么现在学：${topology.whyNow || topology.continuity || "按照知识路线继续推进。"}`,
    `下一站：${nextModule?.title || "完成当前路线复盘"}`
  ].forEach((text) => {
    const row = document.createElement("span");
    row.textContent = text;
    moduleRouteContext.appendChild(row);
  });
}

function updateProgressViews() {
  renderDashboard();
  renderHeroStats();
  renderWrongBook();
  const module = getActiveModule();
  if (module) {
    const visiblePractices = getModulePractices(module);
    moduleProgress.textContent = `已完成 ${getModuleCompletedCount(module.id, visiblePractices)}/${visiblePractices.length} 题`;
  }
}

function renderGradeFilter() {
  gradeFilter.innerHTML = "";
  gradeOptions.forEach((grade) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `grade-chip${grade === activeGrade ? " is-active" : ""}`;
    button.textContent = grade;
    button.addEventListener("click", () => {
      activeGrade = grade;
      const visibleModules = getVisibleModules();
      activeModuleId = visibleModules[0]?.id || "";
      render();
    });
    gradeFilter.appendChild(button);
  });
}

function renderDifficultyFilter() {
  difficultyFilter.innerHTML = "";
  difficultyOptions.forEach((difficulty) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `difficulty-chip${difficulty === activeDifficulty ? " is-active" : ""}`;
    button.textContent = difficulty;
    button.addEventListener("click", () => {
      activeDifficulty = difficulty;
      const visibleModules = getVisibleModules();
      activeModuleId = visibleModules[0]?.id || "";
      render();
    });
    difficultyFilter.appendChild(button);
  });
}

function getPrimaryGrade(module) {
  return appSelectors.getPrimaryGrade(module, gradeOptions);
}

function groupModulesByPrimaryGrade(visibleModules) {
  return appSelectors.groupModulesByPrimaryGrade(visibleModules, activeGrade, gradeOptions);
}

function renderModuleList() {
  moduleList.innerHTML = "";
  const visibleModules = getVisibleModules();

  if (visibleModules.length === 0) {
    renderEmptyBox(moduleList, "当前年级和难度下暂时还没有模块，试试切换筛选条件。");
    return;
  }

  const overview = document.createElement("div");
  overview.className = "module-map__overview";
  overview.innerHTML = `
    <div>
      <strong></strong>
      <p class="muted"></p>
    </div>
    <span class="badge"></span>
  `;
  overview.querySelector("strong").textContent = `${activeGrade === "全部" ? "全部年级" : activeGrade} · ${activeDifficulty === "全部" ? "全部难度" : activeDifficulty}`;
  overview.querySelector("p").textContent = `共 ${visibleModules.length} 个可学模块，建议从上到下依次学习，也可以点击薄弱模块直接跳转。`;
  overview.querySelector(".badge").textContent = `${getPracticePool().length} 道可练习题`;
  moduleList.appendChild(overview);

  const groupedModules = groupModulesByPrimaryGrade(visibleModules);
  const orderedGrades = gradeOptions.filter((grade) => grade !== "全部" && groupedModules.has(grade));
  const extraGrades = [...groupedModules.keys()].filter((grade) => !orderedGrades.includes(grade));

  [...orderedGrades, ...extraGrades].forEach((grade) => {
    const group = document.createElement("section");
    group.className = "module-group";

    const header = document.createElement("div");
    header.className = "module-group__header";
    const title = document.createElement("span");
    title.textContent = grade;
    const count = document.createElement("small");
    count.textContent = `${groupedModules.get(grade).length} 个模块`;
    header.append(title, count);
    group.appendChild(header);

    const list = document.createElement("div");
    list.className = "module-path";

    groupedModules.get(grade).forEach((module, index) => {
      const visiblePractices = getModulePractices(module);
      const completedCount = getModuleCompletedCount(module.id, visiblePractices);
      const item = document.createElement("button");
      item.type = "button";
      item.className = `module-path__item${module.id === activeModuleId ? " is-active" : ""}`;
      item.innerHTML = `
        <span class="module-path__step"></span>
        <span class="module-path__content">
          <strong></strong>
          <span></span>
          <span class="module-path__tags"></span>
        </span>
        <span class="module-path__progress"></span>
      `;
      item.querySelector(".module-path__step").textContent = index + 1;
      item.querySelector("strong").textContent = module.title;
      item.querySelector(".module-path__content > span:not(.module-path__tags)").textContent = module.description;
      const tagContainer = item.querySelector(".module-path__tags");
      module.grades.forEach((moduleGrade) => {
        const tag = document.createElement("em");
        tag.textContent = moduleGrade;
        tagContainer.appendChild(tag);
      });
      item.querySelector(".module-path__progress").textContent = `${completedCount}/${visiblePractices.length}`;
      item.addEventListener("click", () => {
        activeModuleId = module.id;
        render();
        document.getElementById("lesson-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      list.appendChild(item);
    });

    group.appendChild(list);
    moduleList.appendChild(group);
  });
}

function renderExamples(module) {
  examplesContainer.innerHTML = "";
  const examples = getModuleExamples(module);
  if (examples.length === 0) {
    renderEmptyBox(examplesContainer, "当前难度下暂时没有例题讲解。");
    return;
  }

  examples.forEach((example, index) => {
    const fragment = exampleTemplate.content.cloneNode(true);
    const title = fragment.querySelector(".card__title");
    const difficulty = fragment.querySelector(".difficulty");
    const question = fragment.querySelector(".card__question");
    const toggle = fragment.querySelector(".answer-toggle");
    const answerPanel = fragment.querySelector(".answer-panel");
    const answerText = fragment.querySelector(".answer-text");
    const analysisText = fragment.querySelector(".analysis-text");

    title.textContent = `${index + 1}. ${example.title}`;
    difficulty.textContent = example.difficulty;
    question.textContent = example.question;
    answerText.textContent = `答案：${example.answer}`;
    analysisText.textContent = `解析：${example.analysis}`;
    toggle.addEventListener("click", () => {
      answerPanel.classList.toggle("hidden");
      toggle.textContent = answerPanel.classList.contains("hidden") ? "显示答案" : "收起答案";
    });
    examplesContainer.appendChild(fragment);
  });
}

function renderPractice(module) {
  practiceList.innerHTML = "";
  const practices = getModulePractices(module);
  if (practices.length === 0) {
    renderEmptyBox(practiceList, "当前难度下暂时没有闯关练习。");
    return;
  }

  practices.forEach((practice, index) => {
    const fragment = practiceTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".card--practice");
    const title = fragment.querySelector(".card__title");
    const subtitle = fragment.querySelector(".muted");
    const difficulty = fragment.querySelector(".difficulty");
    const question = fragment.querySelector(".card__question");
    const input = fragment.querySelector(".answer-input");
    const button = fragment.querySelector(".submit-answer");
    const feedback = fragment.querySelector(".feedback");

    card.dataset.practiceId = practice.id;
    title.textContent = `${index + 1}. ${practice.title}`;
    subtitle.textContent = appState.completed[practice.id] ? "已完成" : "待挑战";
    difficulty.textContent = practice.difficulty;
    question.textContent = practice.prompt;

    button.addEventListener("click", () => {
      const userAnswer = input.value.trim();
      if (!userAnswer) {
        feedback.textContent = "先输入答案再提交。";
        feedback.className = "feedback is-wrong";
        return;
      }

      const isCorrect = isCorrectAnswer(userAnswer, practice);
      feedback.textContent = updatePracticeResult(practice, module, isCorrect, userAnswer);
      feedback.className = createFeedbackClass(isCorrect);
      subtitle.textContent = appState.completed[practice.id] ? "已完成" : "待挑战";
      saveState();
      updateProgressViews();
    });

    practiceList.appendChild(fragment);
  });
}

function getFilteredWrongBookItems() {
  const visibleModuleIds = new Set(getVisibleModules().map((module) => module.id));
  return appState.wrongBook.filter((item) => {
    const matchesGrade = activeGrade === "全部" || visibleModuleIds.has(item.moduleId);
    const matchesItemDifficulty = activeDifficulty === "全部" || item.difficulty === activeDifficulty;
    return matchesGrade && matchesItemDifficulty;
  });
}

function jumpToPractice(practiceId, moduleId) {
  if (moduleId) {
    activeModuleId = moduleId;
  }
  render();
  const card = document.querySelector(`#practice-list [data-practice-id="${CSS.escape(practiceId)}"]`);
  card?.scrollIntoView({ behavior: "smooth", block: "center" });
  card?.querySelector(".answer-input")?.focus({ preventScroll: true });
}

function renderWrongBook() {
  wrongBookList.innerHTML = "";
  if (appState.wrongBook.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "暂时没有错题，继续加油。";
    wrongBookList.appendChild(empty);
    return;
  }

  const visibleWrongBookItems = getFilteredWrongBookItems();
  if (visibleWrongBookItems.length === 0) {
    renderEmptyBox(wrongBookList, "当前年级和难度下没有可复习的错题，试试切换筛选条件。");
    return;
  }

  const groupedWrongBook = visibleWrongBookItems.reduce((groups, item) => {
    if (!groups[item.moduleTitle]) {
      groups[item.moduleTitle] = [];
    }
    groups[item.moduleTitle].push(item);
    return groups;
  }, {});

  Object.entries(groupedWrongBook).forEach(([groupTitle, items]) => {
    const groupWrapper = document.createElement("section");
    groupWrapper.className = "wrong-group";
    const heading = document.createElement("h3");
    heading.textContent = groupTitle;
    groupWrapper.appendChild(heading);

    items.forEach((item) => {
      const wrapper = document.createElement("article");
      wrapper.className = "wrong-item";
      const title = document.createElement("h4");
      const prompt = document.createElement("p");
      const difficulty = document.createElement("p");
      const answer = document.createElement("p");
      const explanation = document.createElement("p");
      const reviewStatus = document.createElement("p");
      const action = document.createElement("button");
      difficulty.className = "muted";
      answer.className = "muted";
      explanation.className = "muted";
      reviewStatus.className = "muted review-status";
      action.type = "button";
      action.className = "button button--small button--ghost";
      title.textContent = item.title;
      prompt.textContent = item.prompt;
      difficulty.textContent = `难度：${item.difficulty || "未标注"}`;
      answer.textContent = `答案：${item.answer}`;
      explanation.textContent = `解析：${item.explanation}`;
      reviewStatus.textContent = window.ReviewQueueModel.getReviewStatusText(item, getTodayKey());
      action.textContent = "练这题";
      action.addEventListener("click", () => jumpToPractice(item.id, item.moduleId));
      wrapper.append(title, prompt, difficulty, answer, explanation, reviewStatus, action);
      groupWrapper.appendChild(wrapper);
    });

    wrongBookList.appendChild(groupWrapper);
  });
}

function renderRecentPaperSummary() {
  recentPaperSummary.innerHTML = "";
  const generatedItems = getGeneratedPaperItems();
  if (generatedItems.length === 0) {
    const wrapper = document.createElement("div");
    wrapper.className = "summary-row";
    const title = document.createElement("h4");
    const text = document.createElement("p");
    text.className = "muted";
    title.textContent = "最近试卷成绩";
    text.textContent = "还没有可展示的最近试卷。";
    wrapper.append(title, text);
    recentPaperSummary.appendChild(wrapper);
    return;
  }

  const sourceLabel = appState.paperGenerator.source === "wrongBook" ? "错题复习卷" : "随机练习卷";
  const summary = getPaperSummaryData(generatedItems);
  const wrapper = document.createElement("div");
  wrapper.className = "summary-row";
  const title = document.createElement("h4");
  title.textContent = "最近试卷成绩";
  wrapper.appendChild(title);
  [
    `来源：${sourceLabel}`,
    `筛选：${appState.paperGenerator.grade} · ${appState.paperGenerator.difficulty}`,
    `总题数：${summary.total} · 已作答：${summary.answered}`,
    `答对：${summary.correct} · 正确率：${summary.accuracy}`
  ].forEach((text) => {
    const row = document.createElement("p");
    row.className = "muted";
    row.textContent = text;
    wrapper.appendChild(row);
  });
  recentPaperSummary.appendChild(wrapper);
}

function getMasteryRankingData() {
  return getVisibleModules()
    .map((module) => {
      const visiblePractices = getModulePractices(module);
      const total = visiblePractices.length;
      if (total === 0) {
        return null;
      }
      const completed = getModuleCompletedCount(module.id, visiblePractices);
      const completionRate = completed / total;
      return { id: module.id, title: module.title, completed, total, completionRate, completionRateText: `${Math.round(completionRate * 100)}%` };
    })
    .filter(Boolean)
    .sort((left, right) => right.completionRate - left.completionRate || right.completed - left.completed || left.title.localeCompare(right.title, "zh-CN"));
}

function renderMasteryRanking() {
  masteryRanking.innerHTML = "";
  const rankingData = getMasteryRankingData();
  if (rankingData.length === 0) {
    const wrapper = document.createElement("div");
    wrapper.className = "summary-row";
    const title = document.createElement("h4");
    const text = document.createElement("p");
    text.className = "muted";
    title.textContent = "模块掌握度排行";
    text.textContent = "当前筛选下还没有可统计的模块。";
    wrapper.append(title, text);
    masteryRanking.appendChild(wrapper);
    return;
  }

  const intro = document.createElement("div");
  intro.className = "summary-row";
  const introTitle = document.createElement("h4");
  introTitle.textContent = "模块掌握度排行";
  intro.appendChild(introTitle);
  const topCount = Math.min(3, rankingData.length);
  const supportStartIndex = Math.max(rankingData.length - 3, topCount);
  const supportModules = rankingData.slice(supportStartIndex).map((item) => item.title).join("、");
  [`按当前筛选条件统计：${activeGrade} · ${activeDifficulty}`, `领先模块：前 ${topCount} 名优先展示；待加强：${supportModules || "暂无"}`].forEach((text) => {
    const row = document.createElement("p");
    row.className = "muted";
    row.textContent = text;
    intro.appendChild(row);
  });
  masteryRanking.appendChild(intro);

  rankingData.forEach((item, index) => {
    const row = document.createElement("button");
    const isTop = index < 3;
    const isSupport = index >= rankingData.length - 3 && index >= 3;
    row.type = "button";
    row.className = `summary-row mastery-row${isTop ? " mastery-row--top" : ""}${isSupport ? " mastery-row--support mastery-row--jump" : ""}`;
    row.innerHTML = `
      <div class="mastery-row__main">
        <span class="mastery-rank${isTop ? " mastery-rank--top" : isSupport ? " mastery-rank--support" : ""}"></span>
        <div><h4></h4><p class="muted"></p></div>
      </div>
      <div class="mastery-row__aside"><div class="mastery-row__score"></div><p class="muted mastery-row__label"></p></div>
    `;
    row.querySelector(".mastery-rank").textContent = `#${index + 1}`;
    row.querySelector("h4").textContent = item.title;
    row.querySelector(".mastery-row__main .muted").textContent = `已完成 ${item.completed}/${item.total} 题`;
    row.querySelector(".mastery-row__score").textContent = item.completionRateText;
    row.querySelector(".mastery-row__label").textContent = isTop ? "掌握领先" : isSupport ? "点击跳转" : "持续练习";

    if (isSupport) {
      row.addEventListener("click", () => {
        activeModuleId = item.id;
        document.getElementById("lesson-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
        render();
      });
    } else {
      row.disabled = true;
    }
    masteryRanking.appendChild(row);
  });
}

function renderDashboard() {
  renderRecentPaperSummary();
  renderMasteryRanking();
  const visibleModules = getVisibleModules();
  const dashboardData = [
    { label: "总练习次数", value: appState.stats.attempts },
    { label: "答对题数", value: appState.stats.correct },
    { label: "正确率", value: getCorrectRate() },
    { label: "错题数量", value: appState.wrongBook.length }
  ];

  dashboardCards.innerHTML = "";
  dashboardData.forEach((item) => {
    const card = document.createElement("div");
    card.className = "dashboard-card";
    const label = document.createElement("span");
    const value = document.createElement("strong");
    label.textContent = item.label;
    value.textContent = item.value;
    card.append(label, value);
    dashboardCards.appendChild(card);
  });

  moduleSummary.innerHTML = "";
  visibleModules.forEach((module) => {
    const visiblePractices = getModulePractices(module);
    const completedCount = getModuleCompletedCount(module.id, visiblePractices);
    const summary = document.createElement("div");
    summary.className = "summary-row";
    const title = document.createElement("h4");
    const progress = document.createElement("p");
    progress.className = "muted";
    title.textContent = module.title;
    progress.textContent = `${completedCount}/${visiblePractices.length} 题已完成`;
    summary.append(title, progress);
    moduleSummary.appendChild(summary);
  });
}

function renderHeroStats() {
  const totalCompleted = Object.values(appState.completed).filter(Boolean).length;
  heroStats.innerHTML = "";
  [
    { label: "已完成题目", value: `${totalCompleted}/${getTotalPracticeCount()}` },
    { label: "当前正确率", value: getCorrectRate() },
    { label: "待复习错题", value: appState.wrongBook.length }
  ].forEach((item) => {
    const stat = document.createElement("div");
    stat.className = "stat-row";
    const label = document.createElement("span");
    const value = document.createElement("strong");
    label.textContent = item.label;
    value.textContent = item.value;
    stat.append(label, value);
    heroStats.appendChild(stat);
  });
}

function getWrongPracticePool() {
  const pool = getPracticePool();
  const visiblePracticeIds = new Set(pool.map((practice) => practice.id));
  return window.ReviewQueueModel.getDueWrongBookItems(appState, getTodayKey())
    .filter((item) => visiblePracticeIds.has(item.id))
    .map((item) => pool.find((practice) => practice.id === item.id))
    .filter(Boolean);
}

function generatePaperFromPool(pool, source) {
  const requestedCount = Number(paperCount.value || 5);
  const shuffled = [...pool]
    .map((item) => ({ item, sortValue: Math.random() }))
    .sort((left, right) => left.sortValue - right.sortValue)
    .slice(0, Math.min(requestedCount, pool.length))
    .map((entry) => entry.item);

  appState.paperGenerator = {
    grade: activeGrade,
    difficulty: activeDifficulty,
    count: requestedCount,
    source,
    practiceIds: shuffled.map((item) => item.id),
    answers: {}
  };

  saveState();
  render();
}

function generatePaper() {
  generatePaperFromPool(getPracticePool(), "random");
}

function generateWrongPaper() {
  const wrongPool = getWrongPracticePool();
  if (wrongPool.length === 0) {
    paperGeneratorTip.textContent = activeGrade === "全部" && activeDifficulty === "全部" ? "今天没有到期错题；可继续做新题，或等下次复习日期。" : "当前筛选下没有今日到期错题，请切换年级或难度后再试。";
    renderEmptyBox(paperSummary, "复习队列会优先抽取“今日待复习”的错题。");
    paperList.innerHTML = "";
    return;
  }
  generatePaperFromPool(wrongPool, "wrongBook");
}

function getGeneratedPaperItems() {
  if (appState.paperGenerator.grade !== activeGrade || appState.paperGenerator.difficulty !== activeDifficulty) {
    return [];
  }
  const pool = getPracticePool();
  return appState.paperGenerator.practiceIds.map((id) => pool.find((item) => item.id === id)).filter(Boolean);
}

function getPaperSummaryData(generatedItems) {
  const answers = appState.paperGenerator.answers || {};
  const answeredItems = generatedItems.filter((item) => answers[item.id]);
  const correctItems = generatedItems.filter((item) => answers[item.id]?.correct);
  const wrongItems = generatedItems.filter((item) => answers[item.id] && !answers[item.id].correct);
  return {
    total: generatedItems.length,
    answered: answeredItems.length,
    correct: correctItems.length,
    wrong: wrongItems.length,
    accuracy: answeredItems.length === 0 ? "0%" : `${Math.round((correctItems.length / answeredItems.length) * 100)}%`
  };
}

function renderPaperSummary(generatedItems) {
  paperSummary.innerHTML = "";
  if (generatedItems.length === 0) {
    renderEmptyBox(paperSummary, "生成试卷后，这里会自动显示判卷汇总。");
    return;
  }

  const sourceLabel = appState.paperGenerator.source === "wrongBook" ? "错题复习卷" : "随机练习卷";
  const answers = appState.paperGenerator.answers || {};
  const answeredItems = generatedItems.filter((item) => answers[item.id]);
  const correctItems = generatedItems.filter((item) => answers[item.id]?.correct);
  const wrongItems = generatedItems.filter((item) => answers[item.id] && !answers[item.id].correct);
  const accuracy = answeredItems.length === 0 ? "0%" : `${Math.round((correctItems.length / answeredItems.length) * 100)}%`;
  const summaryCard = document.createElement("div");
  summaryCard.className = "paper-summary-card";
  summaryCard.innerHTML = `
    <h3>自动判卷汇总</h3>
    <p class="muted"></p>
    <p class="muted"></p>
    <div class="paper-summary-grid"></div>
    <div class="paper-summary-list"></div>
  `;
  const metaRows = summaryCard.querySelectorAll(".muted");
  metaRows[0].textContent = `当前来源：${sourceLabel}`;
  metaRows[1].textContent = `当前筛选：${activeGrade} · ${activeDifficulty}`;
  const grid = summaryCard.querySelector(".paper-summary-grid");
  [
    ["总题数", generatedItems.length],
    ["已作答", answeredItems.length],
    ["答对", correctItems.length],
    ["答错", wrongItems.length],
    ["正确率", accuracy]
  ].forEach(([label, value]) => {
    const stat = document.createElement("div");
    stat.className = "paper-summary-stat";
    const labelElement = document.createElement("span");
    const valueElement = document.createElement("strong");
    labelElement.textContent = label;
    valueElement.textContent = value;
    stat.append(labelElement, valueElement);
    grid.appendChild(stat);
  });
  const list = summaryCard.querySelector(".paper-summary-list");
  if (wrongItems.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = answeredItems.length === 0 ? "还没开始答题。" : "太棒了，这份试卷目前全部答对。";
    list.appendChild(empty);
  } else {
    wrongItems.forEach((item, index) => {
      const wrong = document.createElement("p");
      wrong.className = "muted";
      wrong.textContent = `错题 ${index + 1}：${item.title}`;
      list.appendChild(wrong);
    });
  }
  paperSummary.appendChild(summaryCard);
}

function renderPaperGenerator() {
  const pool = getPracticePool();
  const generatedItems = getGeneratedPaperItems();
  const wrongPool = getWrongPracticePool();
  paperList.innerHTML = "";
  renderPaperSummary(generatedItems);

  if (pool.length === 0) {
    paperGeneratorTip.textContent = "当前年级和难度下没有可用于组卷的题目。";
    renderEmptyBox(paperList, "请切换年级或难度后再试。");
    return;
  }

  if (appState.paperGenerator.source === "wrongBook") {
    paperGeneratorTip.textContent = wrongPool.length === 0 ? (activeGrade === "全部" && activeDifficulty === "全部" ? "今天没有到期错题；可继续做新题，或等下次复习日期。" : "当前筛选下没有今日到期错题，请切换年级或难度后再试。") : `正在查看错题复习卷，今日到期错题 ${wrongPool.length} 道。`;
  } else {
    paperGeneratorTip.textContent = pool.length < Number(paperCount.value) ? `当前筛选下可用题目只有 ${pool.length} 道，将按实际数量组卷。` : "";
  }

  if (generatedItems.length === 0) {
    renderEmptyBox(paperList, "还没有生成试卷，点击上方按钮开始。");
    return;
  }

  generatedItems.forEach((practice, index) => {
    const saved = appState.paperGenerator.answers[practice.id];
    const wrapper = createAnswerCard({
      practice,
      index,
      subtitle: practice.moduleTitle,
      grades: practice.grades,
      saved,
      buttonClass: "submit-paper-answer"
    });
    const input = wrapper.querySelector(".answer-input");
    const button = wrapper.querySelector(".submit-paper-answer");
    const feedback = wrapper.querySelector(".feedback");

    button.addEventListener("click", () => {
      const userAnswer = input.value.trim();
      if (!userAnswer) {
        feedback.textContent = "先输入答案再提交。";
        feedback.className = createFeedbackClass(false);
        return;
      }

      const isCorrect = isCorrectAnswer(userAnswer, practice);
      const message = updatePracticeResult(practice, { id: practice.moduleId, title: practice.moduleTitle }, isCorrect, userAnswer);
      appState.paperGenerator.answers[practice.id] = { answer: userAnswer, correct: isCorrect, message };
      feedback.textContent = message;
      feedback.className = createFeedbackClass(isCorrect);
      saveState();
      renderPaperGenerator();
      updateProgressViews();
    });

    paperList.appendChild(wrapper);
  });
}

function createAnswerCard({ practice, index, subtitle, grades = [], saved, buttonClass }) {
  const wrapper = document.createElement("article");
  wrapper.className = buttonClass === "submit-paper-answer" ? "paper-card" : "daily-card";
  wrapper.dataset.practiceId = practice.id;
  wrapper.innerHTML = `
    <div class="card__header">
      <div><h4 class="card__title"></h4><p class="muted"></p></div>
      <span class="difficulty"></span>
    </div>
    <div class="daily-card__meta"></div>
    <p class="card__question"></p>
    <div class="answer-row">
      <input class="answer-input" type="text" placeholder="输入答案" />
      <button class="button button--small button--primary ${buttonClass}" type="button">提交</button>
    </div>
    <p class="feedback hidden"></p>
  `;
  wrapper.querySelector(".card__title").textContent = `${index + 1}. ${practice.title}`;
  wrapper.querySelector(".muted").textContent = subtitle;
  wrapper.querySelector(".difficulty").textContent = practice.difficulty;
  wrapper.querySelector(".card__question").textContent = practice.prompt;
  setChildrenText(wrapper.querySelector(".daily-card__meta"), grades, "grade-tag");
  if (practice.adaptiveReason) {
    const reason = document.createElement("span");
    reason.className = "grade-tag adaptive-reason";
    reason.textContent = `推荐：${practice.adaptiveReason}`;
    wrapper.querySelector(".daily-card__meta").appendChild(reason);
  }
  if (saved) {
    const input = wrapper.querySelector(".answer-input");
    const feedback = wrapper.querySelector(".feedback");
    input.value = saved.answer;
    feedback.textContent = saved.message;
    feedback.className = createFeedbackClass(saved.correct);
  }
  return wrapper;
}

function renderDailyPractice() {
  const todayKey = getTodayKey();
  dailyPracticeDate.textContent = `今天的练习日期：${todayKey} · 根据错题、正确率和模块完成度智能推荐`;
  dailyPracticeList.innerHTML = "";
  const dailyItems = getDailyPracticeItems();
  const dailyStorageKey = getDailyStorageKey();
  if (!appState.dailyPractice[dailyStorageKey]) {
    appState.dailyPractice[dailyStorageKey] = {};
  }

  if (dailyItems.length === 0) {
    renderEmptyBox(dailyPracticeList, "当前年级和难度下暂时没有可用的每日一练题目。");
    return;
  }

  dailyItems.forEach((practice, index) => {
    const module = getModuleByPracticeId(practice.id);
    const saved = appState.dailyPractice[dailyStorageKey][practice.id];
    const wrapper = createAnswerCard({
      practice,
      index,
      subtitle: module?.title || "综合练习",
      grades: module?.grades || [],
      saved,
      buttonClass: "submit-daily-answer"
    });
    const input = wrapper.querySelector(".answer-input");
    const button = wrapper.querySelector(".submit-daily-answer");
    const feedback = wrapper.querySelector(".feedback");

    button.addEventListener("click", () => {
      const userAnswer = input.value.trim();
      if (!userAnswer) {
        feedback.textContent = "先输入答案再提交。";
        feedback.className = createFeedbackClass(false);
        return;
      }

      const isCorrect = isCorrectAnswer(userAnswer, practice);
      const message = updatePracticeResult(practice, module, isCorrect, userAnswer);
      appState.dailyPractice[dailyStorageKey][practice.id] = { answer: userAnswer, correct: isCorrect, message };
      feedback.textContent = message;
      feedback.className = createFeedbackClass(isCorrect);
      saveState();
      updateProgressViews();
    });

    dailyPracticeList.appendChild(wrapper);
  });
}

function renderModuleDetail() {
  const module = getActiveModule();
  if (!module) {
    moduleTitle.textContent = "当前筛选暂无内容";
    moduleDescription.textContent = "请切换其他年级或难度查看现有学习模块。";
    moduleGrades.innerHTML = "";
    moduleRouteContext.innerHTML = "";
    moduleProgress.textContent = "暂无题目";
    renderEmptyBox(examplesContainer, "当前筛选下没有例题内容。");
    renderEmptyBox(practiceList, "当前筛选下没有练习内容。");
    return;
  }

  const visiblePractices = getModulePractices(module);
  const completedCount = getModuleCompletedCount(module.id, visiblePractices);
  moduleTitle.textContent = module.title;
  moduleDescription.textContent = module.description;
  setChildrenText(moduleGrades, module.grades, "grade-tag");
  renderRouteContext(module);
  moduleProgress.textContent = `已完成 ${completedCount}/${visiblePractices.length} 题`;
  renderExamples(module);
  renderPractice(module);
}

function render() {
  appState.stats = appStateModel.calculateStats(appState.answerHistory);
  const visibleModules = getVisibleModules();
  if (visibleModules.length > 0 && !visibleModules.some((module) => module.id === activeModuleId)) {
    activeModuleId = visibleModules[0].id;
  }

  renderGradeFilter();
  renderDifficultyFilter();
  renderModuleList();
  renderModuleDetail();
  renderHeroStats();

  observeOnce(document.getElementById('daily-practice-panel'), renderDailyPractice, 'daily');
  observeOnce(document.getElementById('paper-generator-panel'), renderPaperGenerator, 'paper');
  observeOnce(document.getElementById('wrong-book'), renderWrongBook, 'wrong');
  observeOnce(document.getElementById('parent-dashboard'), renderDashboard, 'dashboard');
}

function downloadJson(filename, payload) {
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildLearningReport() {
  const todayKey = getTodayKey();
  const visibleModules = getVisibleModules();
  return {
    generatedAt: new Date().toISOString(),
    dateKey: todayKey,
    filters: {
      grade: activeGrade,
      difficulty: activeDifficulty
    },
    stats: appState.stats,
    correctRate: getCorrectRate(),
    wrongBookCount: appState.wrongBook.length,
    modules: visibleModules.map((module) => {
      const practices = getModulePractices(module);
      const completed = getModuleCompletedCount(module.id, practices);
      return {
        id: module.id,
        title: module.title,
        completed,
        total: practices.length,
        completionRate: practices.length === 0 ? 0 : completed / practices.length,
        mastery: window.MasteryModel?.calculateModuleMastery?.(module, appState, { todayKey })?.status || null
      };
    }),
    wrongBook: appState.wrongBook.map((item) => ({
      id: item.id,
      title: item.title,
      moduleId: item.moduleId,
      moduleTitle: item.moduleTitle,
      difficulty: item.difficulty,
      nextReviewDate: item.nextReviewDate,
      mistakeTags: item.mistakeTags || []
    }))
  };
}

function exportLearningReport() {
  downloadJson(`mathlearning-report-${getTodayKey()}.json`, buildLearningReport());
}

function exportProgress() {
  downloadJson(`mathlearning-progress-${getTodayKey()}.json`, {
    exportedAt: new Date().toISOString(),
    storageKey,
    state: appState
  });
}

function importProgressFromFile(file) {
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      appState = appStateModel.migrateLegacyState(parsed.state || parsed);
      saveState();
      render();
    } catch (error) {
      alert("进度文件无法识别，请选择由本系统导出的 JSON 文件。");
    } finally {
      importProgressFile.value = "";
    }
  });
  reader.readAsText(file);
}

function initApp() {
  generatePaperButton.addEventListener("click", generatePaper);
  generateWrongPaperButton.addEventListener("click", generateWrongPaper);
  clearWrongBookButton.addEventListener("click", () => {
    appState.wrongBook = [];
    saveState();
    render();
  });
  exportReportButton?.addEventListener("click", exportLearningReport);
  exportProgressButton?.addEventListener("click", exportProgress);
  importProgressButton?.addEventListener("click", () => importProgressFile?.click());
  importProgressFile?.addEventListener("change", () => importProgressFromFile(importProgressFile.files?.[0]));
  render();
}

window.AppBoot?.onReady(initApp);
