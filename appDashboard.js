(function attachMathLearningDashboard(root) {
  function createDashboardRenderer(app) {
    function getFilteredWrongBookItems() {
      const visibleModuleIds = new Set(app.practice.getVisibleModules().map((module) => module.id));
      return app.getState().wrongBook.filter((item) => {
        const matchesGrade = app.selectors.activeGrade === "全部" || visibleModuleIds.has(item.moduleId);
        const matchesItemDifficulty = app.selectors.activeDifficulty === "全部" || item.difficulty === app.selectors.activeDifficulty;
        return matchesGrade && matchesItemDifficulty;
      });
    }

    function renderWrongBook() {
      const state = app.getState();
      const { wrongBookList } = app.elements;
      wrongBookList.innerHTML = "";
      if (state.wrongBook.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "暂时没有错题，继续加油。";
        wrongBookList.appendChild(empty);
        return;
      }

      const visibleWrongBookItems = getFilteredWrongBookItems();
      if (visibleWrongBookItems.length === 0) {
        app.renderer.renderEmptyBox(wrongBookList, "当前年级和难度下没有可复习的错题，试试切换筛选条件。");
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
          difficulty.className = "muted";
          answer.className = "muted";
          explanation.className = "muted";
          reviewStatus.className = "muted review-status";
          title.textContent = item.title;
          prompt.textContent = item.prompt;
          difficulty.textContent = `难度：${item.difficulty || "未标注"}`;
          answer.textContent = `答案：${item.answer}`;
          explanation.textContent = `解析：${item.explanation}`;
          reviewStatus.textContent = root.ReviewQueueModel.getReviewStatusText(item, app.practice.getTodayKey());
          wrapper.append(title, prompt, difficulty, answer, explanation, reviewStatus);
          groupWrapper.appendChild(wrapper);
        });

        wrongBookList.appendChild(groupWrapper);
      });
    }

    function renderRecentPaperSummary() {
      const { recentPaperSummary } = app.elements;
      const state = app.getState();
      recentPaperSummary.innerHTML = "";
      const generatedItems = app.paper.getGeneratedPaperItems();
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

      const sourceLabel = state.paperGenerator.source === "wrongBook" ? "错题复习卷" : "随机练习卷";
      const summary = app.paper.getPaperSummaryData(generatedItems);
      const wrapper = document.createElement("div");
      wrapper.className = "summary-row";
      const title = document.createElement("h4");
      title.textContent = "最近试卷成绩";
      wrapper.appendChild(title);
      [
        `来源：${sourceLabel}`,
        `筛选：${state.paperGenerator.grade} · ${state.paperGenerator.difficulty}`,
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
      return app.practice.getVisibleModules()
        .map((module) => {
          const visiblePractices = app.practice.getModulePractices(module);
          const total = visiblePractices.length;
          if (total === 0) {
            return null;
          }
          const completed = app.practice.getModuleCompletedCount(module.id, visiblePractices);
          const completionRate = completed / total;
          return { id: module.id, title: module.title, completed, total, completionRate, completionRateText: `${Math.round(completionRate * 100)}%` };
        })
        .filter(Boolean)
        .sort((left, right) => right.completionRate - left.completionRate || right.completed - left.completed || left.title.localeCompare(right.title, "zh-CN"));
    }

    function renderMasteryRanking() {
      const { masteryRanking } = app.elements;
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
      [`按当前筛选条件统计：${app.selectors.activeGrade} · ${app.selectors.activeDifficulty}`, `领先模块：前 ${topCount} 名优先展示；待加强：${supportModules || "暂无"}`].forEach((text) => {
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
            app.setActiveModuleId(item.id);
            document.getElementById("lesson-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
            app.render();
          });
        } else {
          row.disabled = true;
        }
        masteryRanking.appendChild(row);
      });
    }

    function renderDashboard() {
      const { dashboardCards, moduleSummary } = app.elements;
      const state = app.getState();
      renderRecentPaperSummary();
      renderMasteryRanking();
      const visibleModules = app.practice.getVisibleModules();
      const dashboardData = [
        { label: "总练习次数", value: state.stats.attempts },
        { label: "答对题数", value: state.stats.correct },
        { label: "正确率", value: app.practice.getCorrectRate() },
        { label: "错题数量", value: state.wrongBook.length }
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
        const visiblePractices = app.practice.getModulePractices(module);
        const completedCount = app.practice.getModuleCompletedCount(module.id, visiblePractices);
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
      const { heroStats } = app.elements;
      const state = app.getState();
      const totalCompleted = Object.values(state.completed).filter(Boolean).length;
      heroStats.innerHTML = "";
      [
        { label: "已完成题目", value: `${totalCompleted}/${app.practice.getTotalPracticeCount()}` },
        { label: "当前正确率", value: app.practice.getCorrectRate() },
        { label: "待复习错题", value: state.wrongBook.length }
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

    return {
      getFilteredWrongBookItems,
      getMasteryRankingData,
      renderDashboard,
      renderHeroStats,
      renderMasteryRanking,
      renderRecentPaperSummary,
      renderWrongBook
    };
  }

  const api = { createDashboardRenderer };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MathLearningDashboard = api;
})(typeof window !== "undefined" ? window : globalThis);
