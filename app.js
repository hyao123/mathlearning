const modules = window.MATH_LEARNING_DATA;
const storageKey = "mathlearning-progress-v1";

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
const exampleTemplate = document.getElementById("example-template");
const practiceTemplate = document.getElementById("practice-template");

const defaultState = {
  completed: {},
  wrongBook: [],
  dailyPractice: {},
  paperGenerator: {
    grade: "全部",
    difficulty: "全部",
    count: 5,
    source: "random",
    practiceIds: [],
    answers: {}
  },
  stats: {
    attempts: 0,
    correct: 0
  }
};

const gradeOptions = ["全部", "一年级", "二年级", "三年级", "四年级", "五年级", "六年级"];
const difficultyOptions = ["全部", "基础", "进阶", "提高", "挑战"];

let appState = loadState();
let activeGrade = "全部";
let activeDifficulty = "全部";
let activeModuleId = modules[0].id;

function loadState() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      return structuredClone(defaultState);
    }

    const parsed = JSON.parse(saved);
    return {
      completed: parsed.completed || {},
      wrongBook: Array.isArray(parsed.wrongBook) ? parsed.wrongBook : [],
      dailyPractice: parsed.dailyPractice || {},
      paperGenerator: {
        grade: parsed.paperGenerator?.grade || "全部",
        difficulty: parsed.paperGenerator?.difficulty || "全部",
        count: Number(parsed.paperGenerator?.count || 5),
        source: parsed.paperGenerator?.source || "random",
        practiceIds: Array.isArray(parsed.paperGenerator?.practiceIds) ? parsed.paperGenerator.practiceIds : [],
        answers: parsed.paperGenerator?.answers || {}
      },
      stats: {
        attempts: Number(parsed.stats?.attempts || 0),
        correct: Number(parsed.stats?.correct || 0)
      }
    };
  } catch (error) {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(appState));
}

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getDailyStorageKey() {
  return `${getTodayKey()}::${activeGrade}::${activeDifficulty}`;
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function matchesDifficulty(item) {
  return activeDifficulty === "全部" || item.difficulty === activeDifficulty;
}

function getModuleExamples(module) {
  return module.examples.filter(matchesDifficulty);
}

function getModulePractices(module) {
  return module.practices.filter(matchesDifficulty);
}

function getVisibleModules() {
  const gradeMatchedModules = activeGrade === "全部" ? modules : modules.filter((module) => module.grades.includes(activeGrade));

  return gradeMatchedModules.filter((module) => getModuleExamples(module).length > 0 || getModulePractices(module).length > 0);
}

function getPracticePool() {
  return getVisibleModules().flatMap((module) =>
    getModulePractices(module).map((practice) => ({ ...practice, moduleId: module.id, moduleTitle: module.title, grades: module.grades }))
  );
}

function getDailyPracticeItems() {
  const pool = getPracticePool();

  const seed = hashString(getDailyStorageKey());
  const ranked = [...pool]
    .map((item, index) => ({ item, score: hashString(`${seed}-${item.id}-${index}`) }))
    .sort((left, right) => left.score - right.score)
    .slice(0, Math.min(3, pool.length))
    .map((entry) => entry.item);

  return ranked;
}

function updatePracticeResult(practice, module, isCorrect) {
  appState.stats.attempts += 1;

  if (isCorrect) {
    appState.stats.correct += 1;
    appState.completed[practice.id] = true;
    appState.wrongBook = appState.wrongBook.filter((item) => item.id !== practice.id);
    return `回答正确：${practice.explanation}`;
  }

  const wrongItem = {
    id: practice.id,
    moduleId: module.id,
    moduleTitle: module.title,
    title: practice.title,
    prompt: practice.prompt,
    answer: practice.answer,
    explanation: practice.explanation,
    difficulty: practice.difficulty
  };

  if (!appState.wrongBook.some((item) => item.id === practice.id)) {
    appState.wrongBook.unshift(wrongItem);
  }

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

function getModuleCompletedCount(moduleId, visiblePractices = null) {
  const completedIds = Object.entries(appState.completed)
    .filter(([, value]) => value)
    .map(([key]) => key);
  const practiceIds = (visiblePractices || modules.find((module) => module.id === moduleId)?.practices || []).map((practice) => practice.id);
  return completedIds.filter((id) => practiceIds.includes(id)).length;
}

function getTotalPracticeCount() {
  return modules.reduce((sum, module) => sum + module.practices.length, 0);
}

function getCorrectRate() {
  if (appState.stats.attempts === 0) {
    return "0%";
  }
  return `${Math.round((appState.stats.correct / appState.stats.attempts) * 100)}%`;
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
  return module.grades.find((grade) => gradeOptions.includes(grade)) || "其他";
}

function groupModulesByPrimaryGrade(visibleModules) {
  return visibleModules.reduce((groups, module) => {
    const grade = activeGrade === "全部" ? getPrimaryGrade(module) : activeGrade;
    if (!groups.has(grade)) {
      groups.set(grade, []);
    }
    groups.get(grade).push(module);
    return groups;
  }, new Map());
}

function renderModuleList() {
  moduleList.innerHTML = "";
  const visibleModules = getVisibleModules();

  if (visibleModules.length === 0) {
    moduleList.innerHTML = '<div class="empty-state-box">当前年级和难度下暂时还没有模块，试试切换筛选条件。</div>';
    return;
  }

  const overview = document.createElement("div");
  overview.className = "module-map__overview";
  overview.innerHTML = `
    <div>
      <strong>${activeGrade === "全部" ? "全部年级" : activeGrade} · ${activeDifficulty === "全部" ? "全部难度" : activeDifficulty}</strong>
      <p class="muted">共 ${visibleModules.length} 个可学模块，建议从上到下依次学习，也可以点击薄弱模块直接跳转。</p>
    </div>
    <span class="badge">${getPracticePool().length} 道可练习题</span>
  `;
  moduleList.appendChild(overview);

  const groupedModules = groupModulesByPrimaryGrade(visibleModules);
  const orderedGrades = gradeOptions.filter((grade) => grade !== "全部" && groupedModules.has(grade));
  const extraGrades = [...groupedModules.keys()].filter((grade) => !orderedGrades.includes(grade));

  [...orderedGrades, ...extraGrades].forEach((grade) => {
    const group = document.createElement("section");
    group.className = "module-group";
    group.innerHTML = `
      <div class="module-group__header">
        <span>${grade}</span>
        <small>${groupedModules.get(grade).length} 个模块</small>
      </div>
    `;

    const list = document.createElement("div");
    list.className = "module-path";

    groupedModules.get(grade).forEach((module, index) => {
      const visiblePractices = getModulePractices(module);
      const completedCount = getModuleCompletedCount(module.id, visiblePractices);
      const completionText = `${completedCount}/${visiblePractices.length}`;
      const item = document.createElement("button");
      item.type = "button";
      item.className = `module-path__item${module.id === activeModuleId ? " is-active" : ""}`;
      item.innerHTML = `
        <span class="module-path__step">${index + 1}</span>
        <span class="module-path__content">
          <strong>${module.title}</strong>
          <span>${module.description}</span>
          <span class="module-path__tags">${module.grades.map((moduleGrade) => `<em>${moduleGrade}</em>`).join("")}</span>
        </span>
        <span class="module-path__progress">${completionText}</span>
      `;
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
    examplesContainer.innerHTML = '<div class="empty-state-box">当前难度下暂时没有例题讲解。</div>';
    return;
  }

  examples.forEach((example, index) => {
    const fragment = exampleTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".card");
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

    examplesContainer.appendChild(card);
  });
}

function renderPractice(module) {
  practiceList.innerHTML = "";
  const practices = getModulePractices(module);

  if (practices.length === 0) {
    practiceList.innerHTML = '<div class="empty-state-box">当前难度下暂时没有闯关练习。</div>';
    return;
  }

  practices.forEach((practice, index) => {
    const fragment = practiceTemplate.content.cloneNode(true);
    const title = fragment.querySelector(".card__title");
    const subtitle = fragment.querySelector(".muted");
    const difficulty = fragment.querySelector(".difficulty");
    const question = fragment.querySelector(".card__question");
    const input = fragment.querySelector(".answer-input");
    const button = fragment.querySelector(".submit-answer");
    const feedback = fragment.querySelector(".feedback");

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

      const normalizedUserAnswer = userAnswer.replace(/\s+/g, "").toLowerCase();
      const normalizedAnswer = practice.answer.replace(/\s+/g, "").toLowerCase();
      const isCorrect = normalizedUserAnswer === normalizedAnswer;
      const message = updatePracticeResult(practice, module, isCorrect);

      if (isCorrect) {
        feedback.textContent = message;
        feedback.className = createFeedbackClass(true);
      } else {
        feedback.textContent = message;
        feedback.className = createFeedbackClass(false);
      }

      saveState();
      render();
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

function renderWrongBook() {
  wrongBookList.innerHTML = "";

  if (appState.wrongBook.length === 0) {
    wrongBookList.innerHTML = '<p class="empty-state">暂时没有错题，继续加油。</p>';
    return;
  }

  const visibleWrongBookItems = getFilteredWrongBookItems();
  if (visibleWrongBookItems.length === 0) {
    wrongBookList.innerHTML = '<div class="empty-state-box">当前年级和难度下没有可复习的错题，试试切换筛选条件。</div>';
    return;
  }

  const groupedWrongBook = visibleWrongBookItems.reduce((groups, item) => {
    if (!groups[item.moduleTitle]) {
      groups[item.moduleTitle] = [];
    }
    groups[item.moduleTitle].push(item);
    return groups;
  }, {});

  Object.entries(groupedWrongBook).forEach(([moduleTitle, items]) => {
    const groupWrapper = document.createElement("section");
    groupWrapper.className = "wrong-group";

    const heading = document.createElement("h3");
    heading.textContent = moduleTitle;
    groupWrapper.appendChild(heading);

    items.forEach((item) => {
      const wrapper = document.createElement("article");
      wrapper.className = "wrong-item";
      wrapper.innerHTML = `
        <h4>${item.title}</h4>
        <p>${item.prompt}</p>
        <p class="muted">难度：${item.difficulty || "未标注"}</p>
        <p class="muted">答案：${item.answer}</p>
        <p class="muted">解析：${item.explanation}</p>
      `;
      groupWrapper.appendChild(wrapper);
    });

    wrongBookList.appendChild(groupWrapper);
  });
}

function renderRecentPaperSummary() {
  recentPaperSummary.innerHTML = "";
  const generatedItems = getGeneratedPaperItems();

  if (generatedItems.length === 0) {
    recentPaperSummary.innerHTML = '<div class="summary-row"><h4>最近试卷成绩</h4><p class="muted">还没有可展示的最近试卷。</p></div>';
    return;
  }

  const sourceLabel = appState.paperGenerator.source === "wrongBook" ? "错题复习卷" : "随机练习卷";
  const summary = getPaperSummaryData(generatedItems);
  const wrapper = document.createElement("div");
  wrapper.className = "summary-row";
  wrapper.innerHTML = `
    <h4>最近试卷成绩</h4>
    <p class="muted">来源：${sourceLabel}</p>
    <p class="muted">筛选：${appState.paperGenerator.grade} · ${appState.paperGenerator.difficulty}</p>
    <p class="muted">总题数：${summary.total} · 已作答：${summary.answered}</p>
    <p class="muted">答对：${summary.correct} · 正确率：${summary.accuracy}</p>
  `;
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

      return {
        id: module.id,
        title: module.title,
        completed,
        total,
        completionRate,
        completionRateText: `${Math.round(completionRate * 100)}%`
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (right.completionRate !== left.completionRate) {
        return right.completionRate - left.completionRate;
      }

      if (right.completed !== left.completed) {
        return right.completed - left.completed;
      }

      return left.title.localeCompare(right.title, "zh-CN");
    });
}

function renderMasteryRanking() {
  masteryRanking.innerHTML = "";
  const rankingData = getMasteryRankingData();

  if (rankingData.length === 0) {
    masteryRanking.innerHTML = '<div class="summary-row"><h4>模块掌握度排行</h4><p class="muted">当前筛选下还没有可统计的模块。</p></div>';
    return;
  }

  const intro = document.createElement("div");
  intro.className = "summary-row";

  const topCount = Math.min(3, rankingData.length);
  const supportStartIndex = Math.max(rankingData.length - 3, topCount);
  const supportModules = rankingData.slice(supportStartIndex).map((item) => item.title).join("、");

  intro.innerHTML = `
    <h4>模块掌握度排行</h4>
    <p class="muted">按当前筛选条件统计：${activeGrade} · ${activeDifficulty}</p>
    <p class="muted">领先模块：前 ${topCount} 名优先展示；待加强：${supportModules || "暂无"}</p>
  `;
  masteryRanking.appendChild(intro);

  rankingData.forEach((item, index) => {
    const row = document.createElement("button");
    const isTop = index < 3;
    const isSupport = index >= rankingData.length - 3 && index >= 3;
    row.type = "button";
    row.className = `summary-row mastery-row${isTop ? " mastery-row--top" : ""}${isSupport ? " mastery-row--support" : ""}${isSupport ? " mastery-row--jump" : ""}`;
    row.innerHTML = `
      <div class="mastery-row__main">
        <span class="mastery-rank${isTop ? " mastery-rank--top" : isSupport ? " mastery-rank--support" : ""}">#${index + 1}</span>
        <div>
          <h4>${item.title}</h4>
          <p class="muted">已完成 ${item.completed}/${item.total} 题</p>
        </div>
      </div>
      <div class="mastery-row__aside">
        <div class="mastery-row__score">${item.completionRateText}</div>
        <p class="muted mastery-row__label">${isTop ? "掌握领先" : isSupport ? "点击跳转" : "持续练习"}</p>
      </div>
    `;

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
    card.innerHTML = `<span>${item.label}</span><strong>${item.value}</strong>`;
    dashboardCards.appendChild(card);
  });

  moduleSummary.innerHTML = "";
  visibleModules.forEach((module) => {
    const visiblePractices = getModulePractices(module);
    const completedCount = getModuleCompletedCount(module.id, visiblePractices);
    const summary = document.createElement("div");
    summary.className = "summary-row";
    summary.innerHTML = `
      <h4>${module.title}</h4>
      <p class="muted">${completedCount}/${visiblePractices.length} 题已完成</p>
    `;
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
    stat.innerHTML = `<span>${item.label}</span><strong>${item.value}</strong>`;
    heroStats.appendChild(stat);
  });
}

function getWrongPracticePool() {
  const pool = getPracticePool();
  const visiblePracticeIds = new Set(pool.map((practice) => practice.id));
  return appState.wrongBook
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
    paperGeneratorTip.textContent = activeGrade === "全部" && activeDifficulty === "全部" ? "当前没有错题可用于重新组卷。" : "当前筛选下没有错题，请切换年级或难度后再试。";
    paperSummary.innerHTML = '<div class="empty-state-box">先做错几道题，或者切换到有错题的年级和难度后再来复习。</div>';
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
  return appState.paperGenerator.practiceIds
    .map((id) => pool.find((item) => item.id === id))
    .filter(Boolean);
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
    paperSummary.innerHTML = '<div class="empty-state-box">生成试卷后，这里会自动显示判卷汇总。</div>';
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
    <p class="muted">当前来源：${sourceLabel}</p>
    <p class="muted">当前筛选：${activeGrade} · ${activeDifficulty}</p>
    <div class="paper-summary-grid">
      <div class="paper-summary-stat"><span>总题数</span><strong>${generatedItems.length}</strong></div>
      <div class="paper-summary-stat"><span>已作答</span><strong>${answeredItems.length}</strong></div>
      <div class="paper-summary-stat"><span>答对</span><strong>${correctItems.length}</strong></div>
      <div class="paper-summary-stat"><span>答错</span><strong>${wrongItems.length}</strong></div>
      <div class="paper-summary-stat"><span>正确率</span><strong>${accuracy}</strong></div>
    </div>
    <div class="paper-summary-list">
      ${wrongItems.length === 0 ? `<p class="muted">${answeredItems.length === 0 ? "还没开始答题。" : "太棒了，这份试卷目前全部答对。"}</p>` : wrongItems.map((item, index) => `<p class="muted">错题 ${index + 1}：${item.title}</p>`).join("")}
    </div>
  `;

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
    paperList.innerHTML = '<div class="empty-state-box">请切换年级或难度后再试。</div>';
    return;
  }

  if (appState.paperGenerator.source === "wrongBook") {
    paperGeneratorTip.textContent = wrongPool.length === 0 ? (activeGrade === "全部" && activeDifficulty === "全部" ? "当前没有错题可用于重新组卷。" : "当前筛选下没有错题，请切换年级或难度后再试。") : `正在查看错题复习卷，可用错题 ${wrongPool.length} 道。`;
  } else {
    paperGeneratorTip.textContent = pool.length < Number(paperCount.value) ? `当前筛选下可用题目只有 ${pool.length} 道，将按实际数量组卷。` : "";
  }

  if (generatedItems.length === 0) {
    paperList.innerHTML = '<div class="empty-state-box">还没有生成试卷，点击上方按钮开始。</div>';
    return;
  }

  generatedItems.forEach((practice, index) => {
    const saved = appState.paperGenerator.answers[practice.id];
    const wrapper = document.createElement("article");
    wrapper.className = "paper-card";
    wrapper.innerHTML = `
      <div class="card__header">
        <div>
          <h4 class="card__title">${index + 1}. ${practice.title}</h4>
          <p class="muted">${practice.moduleTitle}</p>
        </div>
        <span class="difficulty">${practice.difficulty}</span>
      </div>
      <div class="daily-card__meta">${practice.grades.map((grade) => `<span class="grade-tag">${grade}</span>`).join("")}</div>
      <p class="card__question">${practice.prompt}</p>
      <div class="answer-row">
        <input class="answer-input" type="text" placeholder="输入答案" value="${saved?.answer || ""}" />
        <button class="button button--small button--primary submit-paper-answer" type="button">提交</button>
      </div>
      <p class="feedback${saved ? ` ${saved.correct ? "is-correct" : "is-wrong"}` : " hidden"}">${saved ? saved.message : ""}</p>
    `;

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

      const isCorrect = userAnswer.replace(/\s+/g, "").toLowerCase() === practice.answer.replace(/\s+/g, "").toLowerCase();
      const message = updatePracticeResult(practice, { id: practice.moduleId, title: practice.moduleTitle }, isCorrect);
      appState.paperGenerator.answers[practice.id] = {
        answer: userAnswer,
        correct: isCorrect,
        message
      };
      feedback.textContent = message;
      feedback.className = createFeedbackClass(isCorrect);
      saveState();
      render();
    });

    paperList.appendChild(wrapper);
  });
}

function renderDailyPractice() {
  const todayKey = getTodayKey();
  dailyPracticeDate.textContent = `今天的练习日期：${todayKey}`;
  dailyPracticeList.innerHTML = "";

  const dailyItems = getDailyPracticeItems();
  const dailyStorageKey = getDailyStorageKey();
  if (!appState.dailyPractice[dailyStorageKey]) {
    appState.dailyPractice[dailyStorageKey] = {};
  }

  if (dailyItems.length === 0) {
    dailyPracticeList.innerHTML = '<div class="empty-state-box">当前年级和难度下暂时没有可用的每日一练题目。</div>';
    return;
  }

  dailyItems.forEach((practice, index) => {
    const module = getModuleByPracticeId(practice.id);
    const saved = appState.dailyPractice[dailyStorageKey][practice.id];
    const wrapper = document.createElement("article");
    wrapper.className = "daily-card";
    wrapper.innerHTML = `
      <div class="card__header">
        <div>
          <h4 class="card__title">${index + 1}. ${practice.title}</h4>
          <p class="muted">${module?.title || "综合练习"}</p>
        </div>
        <span class="difficulty">${practice.difficulty}</span>
      </div>
      <div class="daily-card__meta">${(module?.grades || []).map((grade) => `<span class="grade-tag">${grade}</span>`).join("")}</div>
      <p class="card__question">${practice.prompt}</p>
      <div class="answer-row">
        <input class="answer-input" type="text" placeholder="输入答案" value="${saved?.answer || ""}" />
        <button class="button button--small button--primary submit-daily-answer" type="button">提交</button>
      </div>
      <p class="feedback${saved ? ` ${saved.correct ? "is-correct" : "is-wrong"}` : " hidden"}">${saved ? saved.message : ""}</p>
    `;

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

      const isCorrect = userAnswer.replace(/\s+/g, "").toLowerCase() === practice.answer.replace(/\s+/g, "").toLowerCase();
      const message = updatePracticeResult(practice, module, isCorrect);
      appState.dailyPractice[dailyStorageKey][practice.id] = {
        answer: userAnswer,
        correct: isCorrect,
        message
      };
      feedback.textContent = message;
      feedback.className = createFeedbackClass(isCorrect);
      saveState();
      render();
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
    moduleProgress.textContent = "暂无题目";
    examplesContainer.innerHTML = '<div class="empty-state-box">当前筛选下没有例题内容。</div>';
    practiceList.innerHTML = '<div class="empty-state-box">当前筛选下没有练习内容。</div>';
    return;
  }

  const visiblePractices = getModulePractices(module);
  const completedCount = getModuleCompletedCount(module.id, visiblePractices);

  moduleTitle.textContent = module.title;
  moduleDescription.textContent = module.description;
  moduleGrades.innerHTML = module.grades.map((grade) => `<span class="grade-tag">${grade}</span>`).join("");
  moduleProgress.textContent = `已完成 ${completedCount}/${visiblePractices.length} 题`;

  renderExamples(module);
  renderPractice(module);
}

function render() {
  const visibleModules = getVisibleModules();
  if (visibleModules.length > 0 && !visibleModules.some((module) => module.id === activeModuleId)) {
    activeModuleId = visibleModules[0].id;
  }

  renderGradeFilter();
  renderDifficultyFilter();
  renderModuleList();
  renderDailyPractice();
  renderPaperGenerator();
  renderModuleDetail();
  renderWrongBook();
  renderDashboard();
  renderHeroStats();
}

generatePaperButton.addEventListener("click", generatePaper);
generateWrongPaperButton.addEventListener("click", generateWrongPaper);

clearWrongBookButton.addEventListener("click", () => {
  appState.wrongBook = [];
  saveState();
  render();
});

render();

