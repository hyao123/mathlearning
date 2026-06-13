(function attachDiagnosticEntrance(root) {
  const storageKey = "mathlearning-entry-diagnostic-v1";
  let selectedAnswers = {};

  const diagnosticQuestions = [
    {
      id: "quick-calculation",
      moduleId: "quick-calculation",
      strand: "观察与周期",
      prompt: "计算 297 + 36 + 3，怎样最快？",
      options: [
        { text: "336", correct: true, reason: "297 和 3 先凑成 300，再加 36。" },
        { text: "326", correct: false, reason: "凑整后还要加完整的 36。" },
        { text: "333", correct: false, reason: "297 + 3 = 300，不是 297 + 36。" }
      ]
    },
    {
      id: "arithmetic-series",
      moduleId: "arithmetic-series",
      strand: "观察与周期",
      prompt: "数列 2，6，10，14……第 8 项是多少？",
      options: [
        { text: "28", correct: false, reason: "第 8 项比第 1 项多 7 个公差。" },
        { text: "30", correct: true, reason: "2 + (8 - 1) × 4 = 30。" },
        { text: "32", correct: false, reason: "这里不能用 8 个公差。" }
      ]
    },
    {
      id: "add-multiply-principle",
      moduleId: "add-multiply-principle",
      strand: "计数与集合",
      prompt: "4 件上衣和 2 条裤子，每次选 1 件上衣和 1 条裤子，共多少种搭配？",
      options: [
        { text: "6", correct: false, reason: "搭配是分步，要用乘法。" },
        { text: "8", correct: true, reason: "4 种上衣 × 2 种裤子 = 8。" },
        { text: "4", correct: false, reason: "每件上衣都能配 2 条裤子。" }
      ]
    },
    {
      id: "pigeonhole-principle",
      moduleId: "pigeonhole-principle",
      strand: "计数与集合",
      prompt: "红、黄、蓝三种球各若干个，至少取几个才能保证有 2 个同色？",
      options: [
        { text: "2", correct: false, reason: "最坏可能取到两个不同颜色。" },
        { text: "3", correct: false, reason: "最坏可能刚好红、黄、蓝各 1 个。" },
        { text: "4", correct: true, reason: "前 3 个最坏都不同，第 4 个一定同色。" }
      ]
    },
    {
      id: "engineering",
      moduleId: "engineering",
      strand: "变化与效率",
      prompt: "甲 6 天完成，乙 3 天完成，两人合作几天完成？",
      options: [
        { text: "2 天", correct: true, reason: "合作效率 1/6 + 1/3 = 1/2，所以 2 天完成。" },
        { text: "4.5 天", correct: false, reason: "完成时间不能直接平均。" },
        { text: "9 天", correct: false, reason: "合作时相加的是效率，不是天数。" }
      ]
    },
    {
      id: "parity-divisibility",
      moduleId: "parity-divisibility",
      strand: "逻辑推理",
      prompt: "528 能被 3 整除吗？",
      options: [
        { text: "能", correct: true, reason: "5 + 2 + 8 = 15，15 能被 3 整除。" },
        { text: "不能", correct: false, reason: "3 的整除看数字和，不是只看个位。" },
        { text: "不确定", correct: false, reason: "可以用数字和快速判断。" }
      ]
    }
  ];

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function readResult() {
    try {
      return safeParse(root.localStorage?.getItem(storageKey), null);
    } catch (error) {
      return null;
    }
  }

  function writeResult(result) {
    try {
      root.localStorage?.setItem(storageKey, JSON.stringify(result));
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function clearResult() {
    try {
      root.localStorage?.removeItem(storageKey);
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function getModules() {
    return Array.isArray(root.MATH_LEARNING_DATA) ? root.MATH_LEARNING_DATA : [];
  }

  function getModuleById(moduleId) {
    return getModules().find((module) => module.id === moduleId) || null;
  }

  function getCardTitle(card) {
    return card.querySelector("strong")?.textContent?.trim() || "";
  }

  function findModuleCard(module) {
    if (!module) {
      return null;
    }
    const cards = Array.from(document.querySelectorAll("#knowledge-mode-list .knowledge-mode-card, #module-list .module-path__item"));
    return cards.find((card) => card.dataset.moduleId === module.id) || cards.find((card) => getCardTitle(card) === module.title) || null;
  }

  function openModule(moduleId) {
    const module = getModuleById(moduleId);
    const card = findModuleCard(module);
    if (card) {
      card.click();
      return;
    }
    document.getElementById("modules")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  function createButton(text, className, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = text;
    button.addEventListener("click", onClick);
    return button;
  }

  function ensurePanel() {
    let panel = document.getElementById("entry-diagnostic-panel");
    if (panel) {
      return panel;
    }
    const hero = document.querySelector(".hero");
    const page = document.querySelector(".page");
    if (!hero && !page) {
      return null;
    }
    panel = document.createElement("section");
    panel.id = "entry-diagnostic-panel";
    panel.className = "entry-diagnostic-panel";
    (hero || page).insertAdjacentElement("afterend", panel);
    return panel;
  }

  function scoreAnswers() {
    const answers = diagnosticQuestions.map((question) => {
      const selectedIndex = selectedAnswers[question.id];
      const option = question.options[selectedIndex];
      return {
        questionId: question.id,
        moduleId: question.moduleId,
        strand: question.strand,
        selectedIndex,
        correct: Boolean(option?.correct),
        reason: option?.reason || ""
      };
    });
    const weak = answers.filter((answer) => !answer.correct);
    const recommendedModuleId = weak[0]?.moduleId || answers[0]?.moduleId || "patterns";
    const strandScores = answers.reduce((map, answer) => {
      if (!map[answer.strand]) {
        map[answer.strand] = { correct: 0, total: 0 };
      }
      map[answer.strand].total += 1;
      map[answer.strand].correct += answer.correct ? 1 : 0;
      return map;
    }, {});
    return {
      answeredAt: new Date().toISOString(),
      answers,
      correctCount: answers.filter((answer) => answer.correct).length,
      total: diagnosticQuestions.length,
      recommendedModuleId,
      strandScores
    };
  }

  function getResultSummary(result) {
    const module = getModuleById(result.recommendedModuleId);
    const accuracy = result.total ? Math.round((result.correctCount / result.total) * 100) : 0;
    return {
      accuracy,
      moduleTitle: module?.title || "找规律",
      moduleId: module?.id || result.recommendedModuleId
    };
  }

  function renderCompleted(panel, result) {
    const summary = getResultSummary(result);
    panel.innerHTML = "";
    panel.classList.add("is-complete");
    const header = createElement("div", "entry-diagnostic-header");
    const title = createElement("div", "");
    title.append(createElement("span", "entry-diagnostic-eyebrow", "入门诊断"), createElement("h2", "", `建议从「${summary.moduleTitle}」开始`));
    const badge = createElement("span", "entry-diagnostic-badge", `${result.correctCount}/${result.total} 题正确`);
    header.append(title, badge);

    const body = createElement("div", "entry-diagnostic-result");
    body.appendChild(createElement("p", "", `本次诊断正确率 ${summary.accuracy}%。系统会优先推荐你从第一个薄弱站补起，再沿地铁路线前进。`));
    const chips = createElement("div", "entry-diagnostic-chip-list");
    Object.entries(result.strandScores || {}).forEach(([strand, score]) => {
      chips.appendChild(createElement("span", "entry-diagnostic-chip", `${strand}：${score.correct}/${score.total}`));
    });
    body.appendChild(chips);

    const actions = createElement("div", "entry-diagnostic-actions");
    actions.append(
      createButton("进入推荐站", "button button--primary", () => openModule(summary.moduleId)),
      createButton("重新诊断", "button button--ghost", () => {
        clearResult();
        selectedAnswers = {};
        renderDiagnostic();
      })
    );
    panel.append(header, body, actions);
  }

  function renderQuestion(question, index) {
    const card = createElement("article", "entry-diagnostic-question");
    card.append(createElement("span", "entry-diagnostic-question__index", `第 ${index + 1} 题 · ${question.strand}`), createElement("h3", "", question.prompt));
    const options = createElement("div", "entry-diagnostic-options");
    question.options.forEach((option, optionIndex) => {
      const button = createButton(option.text, "entry-diagnostic-option", () => {
        selectedAnswers[question.id] = optionIndex;
        renderDiagnostic();
      });
      if (selectedAnswers[question.id] === optionIndex) {
        button.classList.add("is-selected");
      }
      options.appendChild(button);
    });
    card.appendChild(options);
    return card;
  }

  function renderDiagnostic() {
    const panel = ensurePanel();
    if (!panel) {
      return;
    }
    const result = readResult();
    if (result) {
      renderCompleted(panel, result);
      return;
    }
    panel.classList.remove("is-complete");
    panel.innerHTML = "";
    const header = createElement("div", "entry-diagnostic-header");
    const title = createElement("div", "");
    title.append(createElement("span", "entry-diagnostic-eyebrow", "入门诊断 · 6 题"), createElement("h2", "", "先测一下，从最合适的站点出发"));
    const answered = Object.keys(selectedAnswers).length;
    header.append(title, createElement("span", "entry-diagnostic-badge", `${answered}/${diagnosticQuestions.length} 已答`));
    const questions = createElement("div", "entry-diagnostic-list");
    diagnosticQuestions.forEach((question, index) => questions.appendChild(renderQuestion(question, index)));
    const actions = createElement("div", "entry-diagnostic-actions");
    const canSubmit = answered === diagnosticQuestions.length;
    const submit = createButton("生成起点建议", "button button--primary", () => {
      if (!canSubmit) {
        return;
      }
      const scored = scoreAnswers();
      writeResult(scored);
      renderCompleted(panel, scored);
    });
    submit.disabled = !canSubmit;
    actions.append(submit, createButton("跳过，直接看地图", "button button--ghost", () => document.getElementById("modules")?.scrollIntoView({ behavior: "smooth", block: "start" })));
    panel.append(header, createElement("p", "entry-diagnostic-intro", "这不是考试，只是帮系统判断你更适合先从哪条知识线开始。"), questions, actions);
  }

  function boot() {
    if (typeof document === "undefined") {
      return;
    }
    renderDiagnostic();
  }

  const api = {
    diagnosticQuestions,
    renderDiagnostic,
    scoreAnswers
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.DiagnosticEntrance = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
