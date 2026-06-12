(function attachProductExperience(root) {
  const storageKey = "mathlearning-product-experience-v1";
  const sectionIds = ["modules", "daily-practice-panel", "paper-generator-panel", "lesson-panel", "wrong-book", "parent-dashboard"];

  function loadExperienceState() {
    try {
      return JSON.parse(root.localStorage?.getItem(storageKey) || "{}");
    } catch (error) {
      return {};
    }
  }

  function saveExperienceState(state) {
    try {
      root.localStorage?.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      // Ignore storage errors in private browsing or restricted environments.
    }
  }

  function scrollToSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function createActionButton(label, sectionId, variant = "ghost") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `button button--${variant} experience-action`;
    button.textContent = label;
    button.addEventListener("click", () => scrollToSection(sectionId));
    return button;
  }

  function createStepCard({ label, title, description, target }) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "experience-step";
    const badge = document.createElement("span");
    const heading = document.createElement("strong");
    const text = document.createElement("small");
    badge.textContent = label;
    heading.textContent = title;
    text.textContent = description;
    card.append(badge, heading, text);
    card.addEventListener("click", () => scrollToSection(target));
    return card;
  }

  function enhanceHeroActions() {
    const actions = document.querySelector(".hero__actions");
    if (!actions || actions.querySelector(".experience-action")) {
      return;
    }

    actions.append(
      createActionButton("继续练习", "lesson-panel", "primary"),
      createActionButton("今日任务", "daily-practice-panel"),
      createActionButton("错题复习", "paper-generator-panel")
    );
  }

  function renderExperiencePanel() {
    const heroContent = document.querySelector(".hero__content");
    if (!heroContent || heroContent.querySelector(".experience-panel")) {
      return;
    }

    const panel = document.createElement("section");
    panel.className = "experience-panel";
    const header = document.createElement("div");
    header.className = "experience-panel__header";
    const title = document.createElement("strong");
    const tip = document.createElement("span");
    title.textContent = "建议学习路径";
    tip.textContent = "先学例题，再做题，答错后看讲解并进错题复习。";
    header.append(title, tip);

    const steps = document.createElement("div");
    steps.className = "experience-steps";
    [
      { label: "1", title: "选模块", description: "按年级和难度缩小范围", target: "modules" },
      { label: "2", title: "做每日一练", description: "每天 3 题保持手感", target: "daily-practice-panel" },
      { label: "3", title: "复习错题", description: "优先处理今日到期题", target: "paper-generator-panel" }
    ].forEach((step) => steps.appendChild(createStepCard(step)));

    const keyboardTip = document.createElement("p");
    keyboardTip.className = "experience-keyboard-tip";
    keyboardTip.textContent = "小技巧：输入答案后按 Enter 可直接提交；答错后会自动展开讲解区。";

    panel.append(header, steps, keyboardTip);
    heroContent.appendChild(panel);
  }

  function enableEnterToSubmit() {
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || !event.target?.matches?.(".answer-input")) {
        return;
      }
      const card = event.target.closest(".card, .daily-card, .paper-card");
      const submitButton = card?.querySelector(".submit-answer, .submit-daily-answer, .submit-paper-answer");
      if (submitButton) {
        event.preventDefault();
        submitButton.click();
      }
    });
  }

  function openSupportForWrongAnswer(card) {
    const feedback = card?.querySelector(".feedback");
    if (!feedback?.classList.contains("is-wrong")) {
      return;
    }
    const support = card.querySelector(".learning-support");
    if (support) {
      support.open = true;
      support.classList.add("learning-support--attention");
    }
  }

  function enableWrongAnswerCoaching() {
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!target?.matches?.(".submit-answer, .submit-daily-answer, .submit-paper-answer")) {
        return;
      }
      const card = target.closest(".card, .daily-card, .paper-card");
      root.setTimeout(() => openSupportForWrongAnswer(card), 0);
      root.setTimeout(() => {
        const promptText = card?.querySelector(".card__question")?.textContent;
        if (promptText) {
          saveExperienceState({ ...loadExperienceState(), lastPracticePrompt: promptText, lastAnsweredAt: new Date().toISOString() });
        }
      }, 0);
    });
  }

  function trackSectionVisits() {
    if (!("IntersectionObserver" in root)) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            saveExperienceState({ ...loadExperienceState(), lastSectionId: entry.target.id });
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) {
        observer.observe(section);
      }
    });
  }

  function renderResumeButton() {
    const state = loadExperienceState();
    const actions = document.querySelector(".hero__actions");
    if (!actions || !state.lastSectionId || actions.querySelector(".experience-resume")) {
      return;
    }
    const button = createActionButton("回到上次位置", state.lastSectionId);
    button.classList.add("experience-resume");
    actions.appendChild(button);
  }

  function boot() {
    if (typeof document === "undefined") {
      return;
    }
    enhanceHeroActions();
    renderExperiencePanel();
    renderResumeButton();
    enableEnterToSubmit();
    enableWrongAnswerCoaching();
    trackSectionVisits();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : globalThis);
