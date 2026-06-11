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

  function findWrongItem(state, practiceId) {
    return (state.wrongBook || []).find((item) => item.id === practiceId);
  }

  function createWrongItem(practice) {
    return {
      id: practice.id,
      moduleId: practice.moduleId,
      moduleTitle: practice.moduleTitle,
      title: practice.title,
      prompt: practice.prompt,
      answer: practice.answer,
      explanation: practice.explanation,
      difficulty: practice.difficulty
    };
  }

  function getReview(item) {
    return item.review || window.ReviewScheduler.scheduleWrongAttempt({}, todayKey());
  }

  function updateReviewFromAnswer(card, isCorrect) {
    const prompt = card.querySelector(".card__question")?.textContent?.trim();
    const practice = findPracticeByPrompt(prompt);
    if (!practice) {
      return;
    }

    const state = loadState();
    state.wrongBook = Array.isArray(state.wrongBook) ? state.wrongBook : [];
    const existing = findWrongItem(state, practice.id);
    const baseItem = existing || createWrongItem(practice);
    const nextReview = isCorrect
      ? window.ReviewScheduler.scheduleCorrectAttempt(baseItem.review || {}, todayKey())
      : window.ReviewScheduler.scheduleWrongAttempt(baseItem.review || {}, todayKey());

    if (isCorrect && nextReview.correctStreak >= 2) {
      state.wrongBook = state.wrongBook.filter((item) => item.id !== practice.id);
    } else {
      const nextItem = { ...baseItem, review: nextReview };
      state.wrongBook = [nextItem, ...state.wrongBook.filter((item) => item.id !== practice.id)];
    }

    saveState(state);
    decorateWrongBook();
  }

  function getDueWrongBookItems(state) {
    return (state.wrongBook || []).filter((item) => window.ReviewScheduler.isDue(getReview(item), todayKey()));
  }

  function generateDueWrongPaper(event) {
    const state = loadState();
    const dueItems = getDueWrongBookItems(state);
    const tip = document.getElementById("paper-generator-tip");
    const summary = document.getElementById("paper-summary");
    const list = document.getElementById("paper-list");

    if (dueItems.length === 0) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (tip) {
        tip.textContent = "今天没有到期错题；可继续做新题，或等下次复习日期。";
      }
      if (summary) {
        summary.innerHTML = '<div class="empty-state-box">复习队列会优先抽取“今日待复习”的错题。</div>';
      }
      if (list) {
        list.innerHTML = "";
      }
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    const requestedCount = Number(document.getElementById("paper-count")?.value || 5);
    state.paperGenerator = {
      grade: "全部",
      difficulty: "全部",
      count: requestedCount,
      source: "wrongBook",
      practiceIds: dueItems.slice(0, Math.min(requestedCount, dueItems.length)).map((item) => item.id),
      answers: {}
    };
    saveState(state);
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
      const review = getReview(item);
      const status = document.createElement("p");
      status.className = "muted review-status";
      status.textContent = `复习状态：${window.ReviewScheduler.getReviewStatus(review, todayKey())} · 已错 ${review.wrongCount || 0} 次 · 连续答对 ${review.correctStreak || 0} 次`;
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
