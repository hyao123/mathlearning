(function enhanceReviewQueue() {
  const storageKey = "mathlearning-progress-v2";
  const todayKey = () => window.ReviewScheduler.toDateKey(new Date());

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch (error) {
      return {};
    }
  }

  function saveState(state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function getPracticePool() {
    return (window.MATH_LEARNING_DATA || []).flatMap((module) =>
      module.practices.map((practice) => ({
        ...practice,
        moduleId: module.id,
        moduleTitle: module.title,
        grades: module.grades
      }))
    );
  }

  function findPracticeByPrompt(prompt) {
    return getPracticePool().find((practice) => practice.prompt === prompt);
  }

  function updateReviewFromAnswer(card, isCorrect) {
    const prompt = card.querySelector(".card__question")?.textContent?.trim();
    const practice = findPracticeByPrompt(prompt);
    if (!practice) {
      return;
    }

    const nextState = window.ReviewQueueModel.updateWrongBookAfterAnswer({
      state: loadState(),
      practice,
      isCorrect,
      todayKey: todayKey()
    });

    saveState(nextState);
    decorateWrongBook();
  }

  function showEmptyDueMessage(tip, summary, list) {
    if (tip) {
      tip.textContent = "今天没有到期错题；可继续做新题，或等下次复习日期。";
    }
    if (summary) {
      summary.textContent = "";
      const box = document.createElement("div");
      box.className = "empty-state-box";
      box.textContent = "复习队列会优先抽取“今日待复习”的错题。";
      summary.appendChild(box);
    }
    if (list) {
      list.textContent = "";
    }
  }

  function generateDueWrongPaper(event) {
    const state = loadState();
    const dueItems = window.ReviewQueueModel.getDueWrongBookItems(state, todayKey());
    const tip = document.getElementById("paper-generator-tip");
    const summary = document.getElementById("paper-summary");
    const list = document.getElementById("paper-list");

    event.preventDefault();
    event.stopImmediatePropagation();

    if (dueItems.length === 0) {
      showEmptyDueMessage(tip, summary, list);
      return;
    }

    const requestedCount = Number(document.getElementById("paper-count")?.value || 5);
    saveState(
      window.ReviewQueueModel.buildWrongPaperState({
        state,
        dueItems,
        requestedCount
      })
    );
    window.location.reload();
  }

  function decorateWrongBook() {
    const state = loadState();
    const items = state.wrongBook || [];
    const cards = [...document.querySelectorAll("#wrong-book-list .wrong-item")];
    cards.forEach((card) => {
      card.querySelector(".review-status")?.remove();
      const title = card.querySelector("h4")?.textContent;
      const prompt = card.querySelector("p")?.textContent;
      const item = items.find((candidate) => candidate.title === title && candidate.prompt === prompt);
      if (!item) {
        return;
      }
      const status = document.createElement("p");
      status.className = "muted review-status";
      status.textContent = window.ReviewQueueModel.getReviewStatusText(item, todayKey());
      card.appendChild(status);
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.id === "generate-wrong-paper") {
      generateDueWrongPaper(event);
      return;
    }

    if (!target.matches(".submit-answer, .submit-paper-answer, .submit-daily-answer")) {
      return;
    }

    const card = target.closest(".card, .paper-card, .daily-card");
    if (!card) {
      return;
    }

    window.setTimeout(() => {
      const feedback = card.querySelector(".feedback");
      if (!feedback || feedback.classList.contains("hidden")) {
        return;
      }
      updateReviewFromAnswer(card, feedback.classList.contains("is-correct"));
    }, 0);
  });

  const observer = new MutationObserver(() => decorateWrongBook());
  const wrongBookList = document.getElementById("wrong-book-list");
  if (wrongBookList) {
    observer.observe(wrongBookList, { childList: true, subtree: true });
  }
  window.setTimeout(decorateWrongBook, 0);
})();
