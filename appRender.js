(function attachMathLearningRender(root) {
  function createAppRenderer(app) {
    function setChildrenText(element, values, className) {
      element.innerHTML = "";
      values.forEach((value) => {
        const span = document.createElement("span");
        span.className = className;
        span.textContent = value;
        element.appendChild(span);
      });
    }

    function renderEmptyBox(container, text) {
      container.innerHTML = "";
      const box = document.createElement("div");
      box.className = "empty-state-box";
      box.textContent = text;
      container.appendChild(box);
    }

    function createFeedbackClass(isCorrect) {
      return `feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
    }

    function renderGradeFilter() {
      const { gradeFilter } = app.elements;
      gradeFilter.innerHTML = "";
      app.gradeOptions.forEach((grade) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `grade-chip${grade === app.selectors.activeGrade ? " is-active" : ""}`;
        button.textContent = grade;
        button.addEventListener("click", () => {
          app.selectors.activeGrade = grade;
          const visibleModules = app.practice.getVisibleModules();
          app.selectors.activeModuleId = visibleModules[0]?.id || "";
          app.render();
        });
        gradeFilter.appendChild(button);
      });
    }

    function renderDifficultyFilter() {
      const { difficultyFilter } = app.elements;
      difficultyFilter.innerHTML = "";
      app.difficultyOptions.forEach((difficulty) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `difficulty-chip${difficulty === app.selectors.activeDifficulty ? " is-active" : ""}`;
        button.textContent = difficulty;
        button.addEventListener("click", () => {
          app.selectors.activeDifficulty = difficulty;
          const visibleModules = app.practice.getVisibleModules();
          app.selectors.activeModuleId = visibleModules[0]?.id || "";
          app.render();
        });
        difficultyFilter.appendChild(button);
      });
    }

    function getPrimaryGrade(module) {
      return module.grades.find((grade) => app.gradeOptions.includes(grade)) || "其他";
    }

    function groupModulesByPrimaryGrade(visibleModules) {
      return visibleModules.reduce((groups, module) => {
        const grade = app.selectors.activeGrade === "全部" ? getPrimaryGrade(module) : app.selectors.activeGrade;
        if (!groups.has(grade)) {
          groups.set(grade, []);
        }
        groups.get(grade).push(module);
        return groups;
      }, new Map());
    }

    function renderModuleList() {
      const { moduleList } = app.elements;
      moduleList.innerHTML = "";
      const visibleModules = app.practice.getVisibleModules();

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
      overview.querySelector("strong").textContent = `${app.selectors.activeGrade === "全部" ? "全部年级" : app.selectors.activeGrade} · ${app.selectors.activeDifficulty === "全部" ? "全部难度" : app.selectors.activeDifficulty}`;
      overview.querySelector("p").textContent = `共 ${visibleModules.length} 个可学模块，建议从上到下依次学习，也可以点击薄弱模块直接跳转。`;
      overview.querySelector(".badge").textContent = `${app.practice.getPracticePool().length} 道可练习题`;
      moduleList.appendChild(overview);

      const groupedModules = groupModulesByPrimaryGrade(visibleModules);
      const orderedGrades = app.gradeOptions.filter((grade) => grade !== "全部" && groupedModules.has(grade));
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
          const visiblePractices = app.practice.getModulePractices(module);
          const completedCount = app.practice.getModuleCompletedCount(module.id, visiblePractices);
          const item = document.createElement("button");
          item.type = "button";
          item.className = `module-path__item${module.id === app.selectors.activeModuleId ? " is-active" : ""}`;
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
            app.selectors.activeModuleId = module.id;
            app.render();
            document.getElementById("lesson-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          list.appendChild(item);
        });

        group.appendChild(list);
        moduleList.appendChild(group);
      });
    }

    function renderExamples(module) {
      const { examplesContainer, exampleTemplate } = app.elements;
      examplesContainer.innerHTML = "";
      const examples = app.practice.getModuleExamples(module);
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
      const { practiceList, practiceTemplate } = app.elements;
      const state = app.getState();
      practiceList.innerHTML = "";
      const practices = app.practice.getModulePractices(module);
      if (practices.length === 0) {
        renderEmptyBox(practiceList, "当前难度下暂时没有闯关练习。");
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
        subtitle.textContent = state.completed[practice.id] ? "已完成" : "待挑战";
        difficulty.textContent = practice.difficulty;
        question.textContent = practice.prompt;

        button.addEventListener("click", () => {
          const userAnswer = input.value.trim();
          if (!userAnswer) {
            feedback.textContent = "先输入答案再提交。";
            feedback.className = "feedback is-wrong";
            return;
          }

          const isCorrect = app.practice.isCorrectAnswer(userAnswer, practice);
          feedback.textContent = app.practice.updatePracticeResult(practice, module, isCorrect, userAnswer);
          feedback.className = createFeedbackClass(isCorrect);
          subtitle.textContent = app.getState().completed[practice.id] ? "已完成" : "待挑战";
          app.saveState();
          app.updateProgressViews();
        });

        practiceList.appendChild(fragment);
      });
    }

    function createAnswerCard({ practice, index, subtitle, grades = [], saved, buttonClass }) {
      const wrapper = document.createElement("article");
      wrapper.className = buttonClass === "submit-paper-answer" ? "paper-card" : "daily-card";
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
      const { dailyPracticeDate, dailyPracticeList } = app.elements;
      const state = app.getState();
      const todayKey = app.practice.getTodayKey();
      dailyPracticeDate.textContent = `今天的练习日期：${todayKey} · 根据错题、正确率和模块完成度智能推荐`;
      dailyPracticeList.innerHTML = "";
      const dailyItems = app.practice.getDailyPracticeItems();
      const dailyStorageKey = app.practice.getDailyStorageKey();
      if (!state.dailyPractice[dailyStorageKey]) {
        state.dailyPractice[dailyStorageKey] = {};
      }

      if (dailyItems.length === 0) {
        renderEmptyBox(dailyPracticeList, "当前年级和难度下暂时没有可用的每日一练题目。");
        return;
      }

      dailyItems.forEach((practice, index) => {
        const module = app.practice.getModuleByPracticeId(practice.id);
        const saved = state.dailyPractice[dailyStorageKey][practice.id];
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

          const isCorrect = app.practice.isCorrectAnswer(userAnswer, practice);
          const message = app.practice.updatePracticeResult(practice, module, isCorrect, userAnswer);
          app.getState().dailyPractice[dailyStorageKey][practice.id] = { answer: userAnswer, correct: isCorrect, message };
          feedback.textContent = message;
          feedback.className = createFeedbackClass(isCorrect);
          app.saveState();
          app.updateProgressViews();
        });

        dailyPracticeList.appendChild(wrapper);
      });
    }

    function updateModuleProgress() {
      const module = app.practice.getActiveModule();
      if (!module) {
        return;
      }
      const visiblePractices = app.practice.getModulePractices(module);
      app.elements.moduleProgress.textContent = `已完成 ${app.practice.getModuleCompletedCount(module.id, visiblePractices)}/${visiblePractices.length} 题`;
    }

    function renderModuleDetail() {
      const { moduleTitle, moduleDescription, moduleGrades, moduleProgress, examplesContainer, practiceList } = app.elements;
      const module = app.practice.getActiveModule();
      if (!module) {
        moduleTitle.textContent = "当前筛选暂无内容";
        moduleDescription.textContent = "请切换其他年级或难度查看现有学习模块。";
        moduleGrades.innerHTML = "";
        moduleProgress.textContent = "暂无题目";
        renderEmptyBox(examplesContainer, "当前筛选下没有例题内容。");
        renderEmptyBox(practiceList, "当前筛选下没有练习内容。");
        return;
      }

      const visiblePractices = app.practice.getModulePractices(module);
      const completedCount = app.practice.getModuleCompletedCount(module.id, visiblePractices);
      moduleTitle.textContent = module.title;
      moduleDescription.textContent = module.description;
      setChildrenText(moduleGrades, module.grades, "grade-tag");
      moduleProgress.textContent = `已完成 ${completedCount}/${visiblePractices.length} 题`;
      renderExamples(module);
      renderPractice(module);
    }

    function render() {
      app.recalculateStats();
      const visibleModules = app.practice.getVisibleModules();
      if (visibleModules.length > 0 && !visibleModules.some((module) => module.id === app.selectors.activeModuleId)) {
        app.selectors.activeModuleId = visibleModules[0].id;
      }

      renderGradeFilter();
      renderDifficultyFilter();
      renderModuleList();
      renderDailyPractice();
      app.paper.renderPaperGenerator();
      renderModuleDetail();
      app.dashboard.renderWrongBook();
      app.dashboard.renderDashboard();
      app.dashboard.renderHeroStats();
    }

    return {
      createAnswerCard,
      createFeedbackClass,
      groupModulesByPrimaryGrade,
      render,
      renderDailyPractice,
      renderDifficultyFilter,
      renderEmptyBox,
      renderExamples,
      renderGradeFilter,
      renderModuleDetail,
      renderModuleList,
      renderPractice,
      setChildrenText,
      updateModuleProgress
    };
  }

  const api = { createAppRenderer };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MathLearningRender = api;
})(typeof window !== "undefined" ? window : globalThis);
