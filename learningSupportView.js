(function attachLearningSupportView(root) {
  function getPracticePool() {
    return (root.MATH_LEARNING_DATA || []).flatMap((module) =>
      module.practices.map((practice) => ({
        ...practice,
        moduleId: module.id,
        moduleTitle: module.title
      }))
    );
  }

  function findPracticeByPrompt(prompt) {
    return getPracticePool().find((practice) => practice.prompt === prompt);
  }

  function createList(items, ordered = false) {
    const list = document.createElement(ordered ? "ol" : "ul");
    items.forEach((item) => {
      const row = document.createElement("li");
      row.textContent = item;
      list.appendChild(row);
    });
    return list;
  }

  function appendSupportGroup(container, title, items, ordered = false) {
    if (!Array.isArray(items) || items.length === 0) {
      return;
    }
    const group = document.createElement("div");
    group.className = "learning-support__group";
    const heading = document.createElement("h5");
    heading.textContent = title;
    group.appendChild(heading);
    group.appendChild(createList(items, ordered));
    container.appendChild(group);
  }

  function createSupportDetails(practice) {
    const support = root.LearningSupport.getSupportForPractice(practice);
    const details = document.createElement("details");
    details.className = "learning-support";
    const summary = document.createElement("summary");
    summary.textContent = "查看提示、分步讲解与易错点";
    details.appendChild(summary);
    appendSupportGroup(details, "提示", support.hints);
    appendSupportGroup(details, "分步讲解", support.solutionSteps, true);
    appendSupportGroup(details, "易错点", support.commonMistakes);
    return details;
  }

  function decorateCard(card) {
    if (card.querySelector(".learning-support")) {
      return;
    }
    const prompt = card.querySelector(".card__question")?.textContent?.trim();
    if (!prompt) {
      return;
    }
    const practice = findPracticeByPrompt(prompt);
    if (!practice || !root.LearningSupport.hasLearningSupport(practice)) {
      return;
    }
    card.appendChild(createSupportDetails(practice));
  }

  function decorateAllCards() {
    document.querySelectorAll(".card--practice, .daily-card, .paper-card").forEach(decorateCard);
  }

  const observer = new MutationObserver(decorateAllCards);
  ["practice-list", "daily-practice-list", "paper-list"].forEach((id) => {
    const container = document.getElementById(id);
    if (container) {
      observer.observe(container, { childList: true, subtree: true });
    }
  });

  decorateAllCards();
})(typeof window !== "undefined" ? window : globalThis);
