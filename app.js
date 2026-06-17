const modules = window.MATH_LEARNING_DATA;
const storageKey = "mathlearning-progress-v2";
const legacyStorageKey = "mathlearning-progress-v1";

const elements = {
  gradeFilter: document.getElementById("grade-filter"),
  difficultyFilter: document.getElementById("difficulty-filter"),
  dailyPracticeDate: document.getElementById("daily-practice-date"),
  dailyPracticeList: document.getElementById("daily-practice-list"),
  paperCount: document.getElementById("paper-count"),
  generatePaperButton: document.getElementById("generate-paper"),
  generateWrongPaperButton: document.getElementById("generate-wrong-paper"),
  paperGeneratorTip: document.getElementById("paper-generator-tip"),
  paperSummary: document.getElementById("paper-summary"),
  paperList: document.getElementById("paper-list"),
  moduleList: document.getElementById("module-list"),
  moduleTitle: document.getElementById("module-title"),
  moduleDescription: document.getElementById("module-description"),
  moduleGrades: document.getElementById("module-grades"),
  moduleProgress: document.getElementById("module-progress"),
  examplesContainer: document.getElementById("examples"),
  practiceList: document.getElementById("practice-list"),
  wrongBookList: document.getElementById("wrong-book-list"),
  dashboardCards: document.getElementById("dashboard-cards"),
  recentPaperSummary: document.getElementById("recent-paper-summary"),
  masteryRanking: document.getElementById("mastery-ranking"),
  moduleSummary: document.getElementById("module-summary"),
  heroStats: document.getElementById("hero-stats"),
  clearWrongBookButton: document.getElementById("clear-wrong-book"),
  exampleTemplate: document.getElementById("example-template"),
  practiceTemplate: document.getElementById("practice-template")
};

const gradeOptions = ["全部", "一年级", "二年级", "三年级", "四年级", "五年级", "六年级"];
const difficultyOptions = ["全部", "基础", "进阶", "提高", "挑战"];
const selectors = {
  activeGrade: "全部",
  activeDifficulty: "全部",
  activeModuleId: modules[0]?.id || ""
};

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const stateStore = window.MathLearningState.createStateStore({
  storageKey,
  legacyStorageKey
});

const app = {
  modules,
  elements,
  gradeOptions,
  difficultyOptions,
  selectors,
  formatDateKey,
  getState: stateStore.getState,
  setState: stateStore.setState,
  saveState: stateStore.saveState,
  recalculateStats: stateStore.recalculateStats,
  setActiveModuleId(moduleId) {
    selectors.activeModuleId = moduleId;
  },
  render() {
    app.renderer.render();
  },
  updateProgressViews() {
    app.dashboard.renderDashboard();
    app.dashboard.renderHeroStats();
    app.dashboard.renderWrongBook();
    app.renderer.updateModuleProgress();
  }
};

app.practice = window.MathLearningPractice.createPracticeController(app);
app.dashboard = window.MathLearningDashboard.createDashboardRenderer(app);
app.paper = window.MathLearningPaper.createPaperController(app);
app.renderer = window.MathLearningRender.createAppRenderer(app);

window.MathLearningRuntime = app;

elements.generatePaperButton.addEventListener("click", app.paper.generatePaper);
elements.generateWrongPaperButton.addEventListener("click", app.paper.generateWrongPaper);
elements.clearWrongBookButton.addEventListener("click", () => {
  app.getState().wrongBook = [];
  app.saveState();
  app.render();
});

app.render();
