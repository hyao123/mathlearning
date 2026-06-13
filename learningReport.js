(function attachLearningReport(root) {
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
    if (root.RewardSystem?.toDateKey) {
      return root.RewardSystem.toDateKey(new Date());
    }
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function addDays(dateKey, offset) {
    const date = new Date(`${dateKey}T00:00:00`);
    date.setDate(date.getDate() + offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function toDateKey(value) {
    if (!value) {
      return "";
    }
    if (root.RewardSystem?.toDateKey) {
      return root.RewardSystem.toDateKey(value) || "";
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function getModules() {
    return Array.isArray(root.MATH_LEARNING_DATA) ? root.MATH_LEARNING_DATA : [];
  }

  function getPracticeModuleMap() {
    const map = new Map();
    getModules().forEach((module) => {
      (module.practices || []).forEach((practice) => map.set(practice.id, module));
    });
    return map;
  }

  function getAnswerHistory(state = {}) {
    return state.answerHistory || {};
  }

  function getCompletedIds(state = {}) {
    return Object.entries(state.completed || {})
      .filter(([, completed]) => Boolean(completed))
      .map(([id]) => id);
  }

  function getMasteries(state) {
    if (!root.MasteryModel?.calculateAllMastery) {
      return [];
    }
    return root.MasteryModel.calculateAllMastery(getModules(), state, { todayKey: getTodayKey() });
  }

  function getRewardProfile(state, masteries) {
    if (!root.RewardSystem?.calculateRewardProfile) {
      return null;
    }
    return root.RewardSystem.calculateRewardProfile({ modules: getModules(), state, masteries, todayKey: getTodayKey() });
  }

  function summarizeAnswerRecords(records = []) {
    return records.reduce(
      (summary, record) => {
        summary.attempts += Number(record.attempts || 0);
        summary.correct += Number(record.correct || 0);
        return summary;
      },
      { attempts: 0, correct: 0 }
    );
  }

  function formatAccuracy(correct, attempts) {
    if (!attempts) {
      return "暂无";
    }
    return `${Math.round((correct / attempts) * 100)}%`;
  }

  function summarizeReport() {
    const state = readState();
    const modules = getModules();
    const masteries = getMasteries(state);
    const reward = getRewardProfile(state, masteries);
    const history = getAnswerHistory(state);
    const todayKey = getTodayKey();
    const weekKeys = new Set(Array.from({ length: 7 }, (_, index) => addDays(todayKey, -index)));
    const records = Object.values(history);
    const todayRecords = records.filter((record) => toDateKey(record.lastAnsweredAt) === todayKey);
    const weekRecords = records.filter((record) => weekKeys.has(toDateKey(record.lastAnsweredAt)));
    const totalPractices = modules.reduce((sum, module) => sum + (module.practices || []).length, 0);
    const completedIds = getCompletedIds(state);
    const completedSet = new Set(completedIds);
    const completedToday = Object.entries(history).filter(([id, record]) => completedSet.has(id) && toDateKey(record.lastAnsweredAt) === todayKey).length;
    const todaySummary = summarizeAnswerRecords(todayRecords);
    const weekSummary = summarizeAnswerRecords(weekRecords);
    const moduleByPractice = getPracticeModuleMap();
    const completedStrands = new Set(completedIds.map((id) => moduleByPractice.get(id)?.knowledgeTopology?.strand).filter(Boolean));
    const needsReview = masteries.filter((item) => item.status?.id === "needs-review");
    const weakest = [...masteries].sort((left, right) => left.score - right.score)[0] || null;
    const dueWrongBook = root.ReviewQueueModel?.getDueWrongBookItems ? root.ReviewQueueModel.getDueWrongBookItems(state, todayKey) : state.wrongBook || [];
    const nextLearning = root.MasteryModel?.summarizeMastery ? root.MasteryModel.summarizeMastery(masteries).nextLearning : masteries.find((item) => item.status?.id !== "mastered") || null;

    return {
      state,
      masteries,
      reward,
      todayKey,
      totalPractices,
      completedCount: completedIds.length,
      completedToday,
      todayAttempts: todaySummary.attempts,
      todayAccuracy: formatAccuracy(todaySummary.correct, todaySummary.attempts),
      weekAttempts: weekSummary.attempts,
      weekAccuracy: formatAccuracy(weekSummary.correct, weekSummary.attempts),
      activeDays: reward?.metrics?.activeDays || 0,
      currentStreak: reward?.metrics?.currentStreak || 0,
      masteredCount: masteries.filter((item) => item.status?.id === "mastered").length,
      needsReview,
      weakest,
      dueWrongBook,
      nextLearning,
      completedStrands: completedStrands.size,
      suggestions: buildSuggestions({ dueWrongBook, needsReview, nextLearning, weakest, reward })
    };
  }

  function buildSuggestions({ dueWrongBook, needsReview, nextLearning, weakest, reward }) {
    const suggestions = [];
    if (dueWrongBook.length > 0) {
      suggestions.push(`先处理 ${dueWrongBook.length} 道今日待复习错题，避免薄弱点滚大。`);
    }
    if (needsReview.length > 0) {
      suggestions.push(`重点回访「${needsReview[0].moduleTitle}」，原因：${needsReview[0].reason}`);
    }
    if (nextLearning) {
      suggestions.push(`下一站建议学习「${nextLearning.moduleTitle}」，继续沿知识路线推进。`);
    }
    if (weakest && weakest.status?.id !== "needs-review") {
      suggestions.push(`低分知识点是「${weakest.moduleTitle}」（${weakest.scoreText}），可安排 5 分钟复盘。`);
    }
    if (reward?.nextBadge) {
      suggestions.push(`剧情任务：冲刺徽章「${reward.nextBadge.emoji} ${reward.nextBadge.title}」。`);
    }
    return suggestions.slice(0, 4);
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

  function createMetric(label, value, note = "") {
    const item = createElement("div", "learning-report-metric");
    item.append(createElement("span", "", label), createElement("strong", "", value));
    if (note) {
      item.appendChild(createElement("small", "", note));
    }
    return item;
  }

  function ensurePanel() {
    let panel = document.getElementById("learning-report-panel");
    if (panel) {
      return panel;
    }
    const dashboard = document.getElementById("parent-dashboard");
    const cards = document.getElementById("dashboard-cards");
    if (!dashboard || !cards) {
      return null;
    }
    panel = document.createElement("section");
    panel.id = "learning-report-panel";
    panel.className = "learning-report-panel";
    cards.insertAdjacentElement("afterend", panel);
    return panel;
  }

  function renderReport() {
    const panel = ensurePanel();
    if (!panel) {
      return;
    }
    const report = summarizeReport();
    const progress = report.totalPractices === 0 ? 0 : Math.round((report.completedCount / report.totalPractices) * 100);
    panel.innerHTML = "";

    const header = createElement("div", "learning-report-header");
    const title = createElement("div", "");
    title.append(createElement("span", "learning-report-eyebrow", "学习报告"), createElement("h3", "", "今日与本周学习画像"));
    const date = createElement("span", "learning-report-date", report.todayKey);
    header.append(title, date);

    const metrics = createElement("div", "learning-report-grid");
    metrics.append(
      createMetric("今日完成", `${report.completedToday} 题`, `${report.todayAttempts} 次作答`),
      createMetric("今日正确率", report.todayAccuracy),
      createMetric("本周作答", `${report.weekAttempts} 次`, `正确率 ${report.weekAccuracy}`),
      createMetric("总进度", `${progress}%`, `${report.completedCount}/${report.totalPractices} 题`),
      createMetric("连续学习", `${report.currentStreak} 天`, `累计 ${report.activeDays} 天`),
      createMetric("已掌握", `${report.masteredCount} 站`, `${report.completedStrands} 条主线已触达`)
    );

    const body = createElement("div", "learning-report-body");
    const weak = createElement("article", "learning-report-card learning-report-card--weak");
    weak.append(createElement("h4", "", "薄弱提醒"));
    if (report.dueWrongBook.length > 0) {
      weak.appendChild(createElement("p", "", `${report.dueWrongBook.length} 道错题今日待复习，建议先开维修站。`));
    } else if (report.needsReview.length > 0) {
      weak.appendChild(createElement("p", "", `需要回访：${report.needsReview.map((item) => item.moduleTitle).slice(0, 3).join("、")}。`));
    } else {
      weak.appendChild(createElement("p", "", "暂无明显到期错题，可以继续挑战新站或随机组卷。"));
    }

    const plan = createElement("article", "learning-report-card learning-report-card--plan");
    plan.appendChild(createElement("h4", "", "下一步安排"));
    const list = createElement("ol", "learning-report-suggestions");
    report.suggestions.forEach((suggestion) => {
      const item = document.createElement("li");
      item.textContent = suggestion;
      list.appendChild(item);
    });
    if (report.suggestions.length === 0) {
      const item = document.createElement("li");
      item.textContent = "完成一组每日一练，系统会自动生成更精准的建议。";
      list.appendChild(item);
    }
    plan.appendChild(list);
    body.append(weak, plan);

    panel.append(header, metrics, body);
  }

  function scheduleRender() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    const callback = () => {
      scheduled = false;
      renderReport();
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
    ["dashboard-cards", "practice-list", "wrong-book-list", "mastery-ranking", "reward-dashboard-panel"].forEach((id) => {
      const element = document.getElementById(id);
      if (!element) {
        return;
      }
      const observer = new MutationObserver(scheduleRender);
      observer.observe(element, { childList: true, subtree: true, characterData: true });
    });
    root.addEventListener?.("storage", scheduleRender);
  }

  function boot() {
    if (typeof document === "undefined") {
      return;
    }
    renderReport();
    observe();
  }

  const api = {
    renderReport,
    summarizeReport
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.LearningReport = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
