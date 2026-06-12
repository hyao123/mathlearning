(function attachPracticeExperience(root) {
  const storageKey = "mathlearning-practice-experience-v1";

  function normalizePreference(value = {}) {
    return {
      showOnlyUnfinished: Boolean(value.showOnlyUnfinished)
    };
  }

  function shouldHidePracticeCard({ isCompleted, showOnlyUnfinished }) {
    return Boolean(showOnlyUnfinished && isCompleted);
  }

  function getNextIndex(items, currentIndex = -1) {
    if (!Array.isArray(items) || items.length === 0) {
      return -1;
    }
    const start = currentIndex < 0 ? 0 : currentIndex + 1;
    for (let offset = 0; offset < items.length; offset += 1) {
      const index = (start + offset) % items.length;
      if (items[index]) {
        return index;
      }
    }
    return -1;
  }

  function loadPreference() {
    try {
      return normalizePreference(JSON.parse(root.localStorage?.getItem(storageKey) || "{}"));
    } catch (error) {
      return normalizePreference();
    }
  }

  function savePreference(preference) {
    try {
      root.localStorage?.setItem(storageKey, JSON.stringify(normalizePreference(preference)));
    } catch (error) {
      // Ignore storage errors in restricted environments.
    }
  }

  function getPracticeCards() {
    return Array.from(document.querySelectorAll("#practice-list .card--practice"));
  }

  function isCompletedCard(card) {
    return card?.querySelector(".card__header .muted")?.textContent?.trim() === "已完成";
  }

  function isVisibleCard(card) {
    return !card.hidden && root.getComputedStyle(card).display !== "none";
  }

  function getFocusableCards(container = document) {
    return Array.from(container.querySelectorAll(".card--practice, .daily-card, .paper-card")).filter((card) => {
      const input = card.querySelector(".answer-input");
      return input && isVisibleCard(card);
    });
  }

  function focusCard(card) {
    const input = card?.querySelector(".answer-input");
    if (!input) {
      return;
    }
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    input.focus({ preventScroll: true });
    input.select?.();
  }

  function focusNextCard(currentCard) {
    const container = currentCard?.parentElement || document;
    const cards = getFocusableCards(container).filter((card) => card !== currentCard || cardsCanWrap(container));
    if (cards.length === 0) {
      return;
    }
    const allCards = getFocusableCards(container);
    const currentIndex = allCards.indexOf(currentCard);
    const nextIndex = getNextIndex(allCards.map((card) => card !== currentCard || allCards.length === 1), currentIndex);
    const nextCard = allCards[nextIndex];
    if (nextCard && nextCard !== currentCard) {
      focusCard(nextCard);
    }
  }

  function cardsCanWrap(container) {
    return getFocusableCards(container).length > 1;
  }

  function setAllSupport(open) {
    getPracticeCards().forEach((card) => {
      const details = card.querySelector(".learning-support");
      if (details) {
        details.open = open;
      }
    });
  }

  function applyFilter() {
    const preference = loadPreference();
    const cards = getPracticeCards();
    cards.forEach((card) => {
      card.hidden = shouldHidePracticeCard({ isCompleted: isCompletedCard(card), showOnlyUnfinished: preference.showOnlyUnfinished });
    });
    updateToolbarSummary();
  }

  function jumpToNextUnfinished() {
    const unfinishedCards = getPracticeCards().filter((card) => !isCompletedCard(card));
    if (unfinishedCards.length === 0) {
      updateToolbarSummary("当前模块已经全部完成。");
      return;
    }
    focusCard(unfinishedCards[0]);
  }

  function createToolbar() {
    const toolbar = document.createElement("section");
    toolbar.className = "practice-experience-toolbar";
    toolbar.innerHTML = `
      <div class="practice-experience-toolbar__main">
        <strong>练习体验</strong>
        <span class="muted practice-experience-summary"></span>
      </div>
      <div class="practice-experience-toolbar__actions">
        <label class="practice-experience-toggle">
          <input type="checkbox" />
          <span>只看未完成</span>
        </label>
        <button class="button button--small button--ghost" type="button" data-action="next">跳到下一题</button>
        <button class="button button--small button--ghost" type="button" data-action="open">展开讲解</button>
        <button class="button button--small button--ghost" type="button" data-action="close">收起讲解</button>
      </div>
    `;

    const checkbox = toolbar.querySelector("input");
    checkbox.checked = loadPreference().showOnlyUnfinished;
    checkbox.addEventListener("change", () => {
      savePreference({ showOnlyUnfinished: checkbox.checked });
      applyFilter();
    });

    toolbar.querySelector('[data-action="next"]').addEventListener("click", jumpToNextUnfinished);
    toolbar.querySelector('[data-action="open"]').addEventListener("click", () => setAllSupport(true));
    toolbar.querySelector('[data-action="close"]').addEventListener("click", () => setAllSupport(false));
    return toolbar;
  }

  function ensureToolbar() {
    const practiceList = document.getElementById("practice-list");
    if (!practiceList || document.querySelector(".practice-experience-toolbar")) {
      return;
    }
    practiceList.parentElement.insertBefore(createToolbar(), practiceList);
  }

  function updateToolbarSummary(message = "") {
    const summary = document.querySelector(".practice-experience-summary");
    if (!summary) {
      return;
    }
    if (message) {
      summary.textContent = message;
      return;
    }
    const cards = getPracticeCards();
    const completed = cards.filter(isCompletedCard).length;
    const hidden = cards.filter((card) => card.hidden).length;
    summary.textContent = `当前模块 ${completed}/${cards.length} 题已完成${hidden ? ` · 已隐藏 ${hidden} 题` : ""}`;
  }

  function enableAutoFocusNext() {
    document.addEventListener("click", (event) => {
      const button = event.target;
      if (!button?.matches?.(".submit-answer, .submit-daily-answer, .submit-paper-answer")) {
        return;
      }
      const card = button.closest(".card--practice, .daily-card, .paper-card");
      root.setTimeout(() => {
        const feedback = card?.querySelector(".feedback");
        if (!feedback?.classList.contains("is-correct")) {
          return;
        }
        applyFilter();
        focusNextCard(card);
      }, 0);
    });
  }

  function observePracticeList() {
    const practiceList = document.getElementById("practice-list");
    if (!practiceList || !("MutationObserver" in root)) {
      return;
    }
    const observer = new MutationObserver(() => {
      ensureToolbar();
      applyFilter();
    });
    observer.observe(practiceList, { childList: true, subtree: true });
  }

  function boot() {
    if (typeof document === "undefined") {
      return;
    }
    ensureToolbar();
    applyFilter();
    observePracticeList();
    enableAutoFocusNext();
  }

  const api = {
    getNextIndex,
    normalizePreference,
    shouldHidePracticeCard
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.PracticeExperience = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
