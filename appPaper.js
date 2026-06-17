(function attachMathLearningPaper(root) {
  function createPaperController(app) {
    function getWrongPracticePool() {
      const pool = app.practice.getPracticePool();
      const visiblePracticeIds = new Set(pool.map((practice) => practice.id));
      return root.ReviewQueueModel.getDueWrongBookItems(app.getState(), app.practice.getTodayKey())
        .filter((item) => visiblePracticeIds.has(item.id))
        .map((item) => pool.find((practice) => practice.id === item.id))
        .filter(Boolean);
    }

    function generatePaperFromPool(pool, source) {
      const state = app.getState();
      const requestedCount = Number(app.elements.paperCount.value || 5);
      const shuffled = [...pool]
        .map((item) => ({ item, sortValue: Math.random() }))
        .sort((left, right) => left.sortValue - right.sortValue)
        .slice(0, Math.min(requestedCount, pool.length))
        .map((entry) => entry.item);

      state.paperGenerator = {
        grade: app.selectors.activeGrade,
        difficulty: app.selectors.activeDifficulty,
        count: requestedCount,
        source,
        practiceIds: shuffled.map((item) => item.id),
        answers: {}
      };

      app.saveState();
      app.render();
    }

    function generatePaper() {
      generatePaperFromPool(app.practice.getPracticePool(), "random");
    }

    function generateWrongPaper() {
      const wrongPool = getWrongPracticePool();
      const { paperGeneratorTip, paperSummary, paperList } = app.elements;
      if (wrongPool.length === 0) {
        paperGeneratorTip.textContent = app.selectors.activeGrade === "全部" && app.selectors.activeDifficulty === "全部" ? "今天没有到期错题；可继续做新题，或等下次复习日期。" : "当前筛选下没有今日到期错题，请切换年级或难度后再试。";
        app.renderer.renderEmptyBox(paperSummary, "复习队列会优先抽取“今日待复习”的错题。");
        paperList.innerHTML = "";
        return;
      }
      generatePaperFromPool(wrongPool, "wrongBook");
    }

    function getGeneratedPaperItems() {
      const state = app.getState();
      if (state.paperGenerator.grade !== app.selectors.activeGrade || state.paperGenerator.difficulty !== app.selectors.activeDifficulty) {
        return [];
      }
      const pool = app.practice.getPracticePool();
      return state.paperGenerator.practiceIds.map((id) => pool.find((item) => item.id === id)).filter(Boolean);
    }

    function getPaperSummaryData(generatedItems) {
      const answers = app.getState().paperGenerator.answers || {};
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
      const { paperSummary } = app.elements;
      const state = app.getState();
      paperSummary.innerHTML = "";
      if (generatedItems.length === 0) {
        app.renderer.renderEmptyBox(paperSummary, "生成试卷后，这里会自动显示判卷汇总。");
        return;
      }

      const sourceLabel = state.paperGenerator.source === "wrongBook" ? "错题复习卷" : "随机练习卷";
      const answers = state.paperGenerator.answers || {};
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
      metaRows[1].textContent = `当前筛选：${app.selectors.activeGrade} · ${app.selectors.activeDifficulty}`;
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
      const { paperCount, paperGeneratorTip, paperList } = app.elements;
      const state = app.getState();
      const pool = app.practice.getPracticePool();
      const generatedItems = getGeneratedPaperItems();
      const wrongPool = getWrongPracticePool();
      paperList.innerHTML = "";
      renderPaperSummary(generatedItems);

      if (pool.length === 0) {
        paperGeneratorTip.textContent = "当前年级和难度下没有可用于组卷的题目。";
        app.renderer.renderEmptyBox(paperList, "请切换年级或难度后再试。");
        return;
      }

      if (state.paperGenerator.source === "wrongBook") {
        paperGeneratorTip.textContent = wrongPool.length === 0 ? (app.selectors.activeGrade === "全部" && app.selectors.activeDifficulty === "全部" ? "今天没有到期错题；可继续做新题，或等下次复习日期。" : "当前筛选下没有今日到期错题，请切换年级或难度后再试。") : `正在查看错题复习卷，今日到期错题 ${wrongPool.length} 道。`;
      } else {
        paperGeneratorTip.textContent = pool.length < Number(paperCount.value) ? `当前筛选下可用题目只有 ${pool.length} 道，将按实际数量组卷。` : "";
      }

      if (generatedItems.length === 0) {
        app.renderer.renderEmptyBox(paperList, "还没有生成试卷，点击上方按钮开始。");
        return;
      }

      generatedItems.forEach((practice, index) => {
        const saved = state.paperGenerator.answers[practice.id];
        const wrapper = app.renderer.createAnswerCard({
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
            feedback.className = app.renderer.createFeedbackClass(false);
            return;
          }

          const isCorrect = app.practice.isCorrectAnswer(userAnswer, practice);
          const message = app.practice.updatePracticeResult(practice, { id: practice.moduleId, title: practice.moduleTitle }, isCorrect, userAnswer);
          app.getState().paperGenerator.answers[practice.id] = { answer: userAnswer, correct: isCorrect, message };
          feedback.textContent = message;
          feedback.className = app.renderer.createFeedbackClass(isCorrect);
          app.saveState();
          renderPaperGenerator();
          app.updateProgressViews();
        });

        paperList.appendChild(wrapper);
      });
    }

    return {
      generatePaper,
      generatePaperFromPool,
      generateWrongPaper,
      getGeneratedPaperItems,
      getPaperSummaryData,
      getWrongPracticePool,
      renderPaperGenerator,
      renderPaperSummary
    };
  }

  const api = { createPaperController };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MathLearningPaper = api;
})(typeof window !== "undefined" ? window : globalThis);
