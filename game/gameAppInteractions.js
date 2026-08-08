import { createSubmissionFeedback } from "./gameAppView.js";

export function createGameInteractions(app) {
  const { AnswerMatcher, GameItemCatalog, InventoryModel, ChallengeModel, ProgressionModel } = app.dependencies;
  function openInventory() {
    if (app.screen === "challenge" || app.screen === "recovery-challenge") app.answerDraft = app.root.querySelector("[data-answer-input]")?.value || "";
    app.rewardReveal = null;
    app.inventoryReturnScreen = app.screen;
    app.pendingFocusKey = "open-inventory";
    app.screen = "inventory";
    app.render();
  }

  function closeInventory() {
    if (app.inventoryReturnScreen === "map") app.pendingFocusKey = "open-inventory";
    app.screen = app.inventoryReturnScreen;
    app.render();
  }

  function submitCurrentAnswer(selectedAnswer = null) {
    const input = app.root.querySelector("[data-answer-input]");
    const value = selectedAnswer || input?.value;
    if (!value?.trim()) {
      input?.focus();
      return;
    }
    const beforeRun = app.state.activeRun;
    const previousRewardCount = beforeRun?.rewardTransactions?.length || 0;
    app.answerDraft = "";
    app.state = ProgressionModel.submitAnswer(app.state, value, AnswerMatcher);
    app.answerFeedback = createSubmissionFeedback(app.state.activeRun?.status === "retry" ? "retry" : "correct");
    if (app.answerFeedback.type === "retry") app.recordMetric("recordQuestionOutcome", app.chapter.chapterId, "retry");
    if (!app.state.activeRun && app.state.lastSettlement?.levelId === beforeRun?.levelId) app.recordMetric("recordLevelClear", app.chapter.chapterId);
    if (app.answerFeedback.type === "correct") {
      const transactions = (app.state.activeRun?.rewardTransactions || app.state.lastSettlement?.rewardTransactions || [])
        .slice(previousRewardCount);
      app.rewardReveal = { transactions };
    } else {
      app.rewardReveal = null;
    }
    app.screen = app.state.activeRun ? "challenge" : "settlement";
    app.persist();
    app.render();
  }

  function submitCurrentRecoveryAnswer(selectedAnswer = null) {
    const input = app.root.querySelector("[data-answer-input]");
    const value = selectedAnswer || input?.value;
    if (!value?.trim()) {
      input?.focus();
      return;
    }
    app.answerDraft = "";
    app.state = ProgressionModel.submitChallengeAnswer(app.state, value, AnswerMatcher);
    app.answerFeedback = createSubmissionFeedback(app.state.activeChallengeRun?.status === "retry" ? "retry" : "correct");
    if (app.answerFeedback.type === "retry") app.recordMetric("recordQuestionOutcome", app.chapter.chapterId, "retry");
    app.persist();
    app.render();
  }

  function handleClick(event) {
    const target = event.target.closest("button");
    if (!target || !app.root.contains(target)) return;
    if (target.matches("[data-chapter-id]") && !target.disabled) {
      const nextChapter = app.chaptersById[target.dataset.chapterId];
      if (!nextChapter || !app.campaign.unlockedChapterIds.includes(nextChapter.chapterId)) return;
      app.campaign = { ...app.campaign, activeChapterId: nextChapter.chapterId, chapterStates: { ...app.campaign.chapterStates, [app.chapter.chapterId]: app.state } };
      app.chapter = nextChapter;
      app.state = app.campaign.chapterStates[app.chapter.chapterId];
      app.answerDraft = "";
      app.answerFeedback = null;
      app.rewardReveal = null;
      app.craftingFeedback = null;
      app.screen = "map";
      app.persist();
      app.render();
    } else if (target.matches("[data-start-recovery-challenge]") && !target.disabled) {
      const targetMaterial = ChallengeModel.getTargetMaterial(app.chapter.chapterId, app.state.inventory);
      if (targetMaterial) app.recordMetric("recordMaterialShortage", app.chapter.chapterId, targetMaterial.quantity);
      app.state = ProgressionModel.startChallenge(app.state, target.dataset.startRecoveryChallenge, { random: Math.random });
      app.answerDraft = "";
      app.answerFeedback = null;
      app.screen = "recovery-challenge";
      app.persist();
      app.render();
    } else if (target.matches("[data-level-id]") && !target.disabled) {
      app.answerFeedback = null;
      app.rewardReveal = null;
      app.craftingFeedback = null;
      if (app.state.activeRun?.levelId === target.dataset.levelId) {
        app.screen = "challenge";
      } else {
        app.answerDraft = "";
        app.recordMetric("recordLevelStart", app.chapter.chapterId);
        app.state = ProgressionModel.startLevel(app.state, target.dataset.levelId);
        app.screen = "challenge";
      }
      app.persist();
      app.render();
    } else if (target.matches("[data-challenge-return-map]")) {
      app.pendingFocusKey = app.state.activeRun?.levelId || null;
      app.captureAnswerDraft();
      app.answerFeedback = null;
      app.rewardReveal = null;
      app.screen = "map";
      app.persist();
      app.render();
    } else if (target.matches("[data-material-recipe-id]")) {
      const recipe = InventoryModel.getProjectRecipes(app.chapter.chapterId).find((candidate) => candidate.id === target.dataset.materialRecipeId && candidate.type === "material-processing");
      if (recipe && app.isRecipeUnlocked(recipe) && InventoryModel.canCraft(app.state.inventory, recipe, { crafting: true })) {
        const result = InventoryModel.craftRecipe(app.state.inventory, recipe, { crafting: true });
        app.replaceInventory(result.inventory, recipe.id);
        const output = recipe.outputs[0];
        const item = output ? GameItemCatalog.getItem(output.itemId) : null;
        app.craftingFeedback = { itemId: output?.itemId, name: item?.name || recipe.name };
        app.persist();
        app.render();
      }
    } else if (target.matches("[data-project-recipe-id]")) {
      const recipe = app.getCraftableRecipe(target.dataset.projectRecipeId);
      if (recipe && app.isRecipeUnlocked(recipe) && InventoryModel.canCraft(app.state.inventory, recipe, { crafting: true })) {
        const result = InventoryModel.craftRecipe(app.state.inventory, recipe, { crafting: true });
        app.replaceInventory(result.inventory, recipe.id);
        const output = recipe.outputs[0];
        const item = output ? GameItemCatalog.getItem(output.itemId) : null;
        app.craftingFeedback = { itemId: output?.itemId, name: item?.name || recipe.name };
        app.persist();
        app.render();
      }
    } else if (target.matches("[data-dismiss-reward-popover]")) {
      app.rewardReveal = null;
      app.render();
    } else if (target.matches("[data-open-inventory]")) openInventory();
    else if (target.matches("[data-close-inventory]")) {
      app.craftingFeedback = null;
      closeInventory();
    }
    else if (target.matches("[data-recovery-submit-answer]")) submitCurrentRecoveryAnswer();
    else if (target.matches("[data-recovery-retry-question]")) {
      app.answerDraft = "";
      app.answerFeedback = null;
      app.state = ProgressionModel.retryChallengeQuestion(app.state);
      app.persist();
      app.render();
      app.root.querySelector("[data-answer-input]")?.focus();
    } else if (target.matches("[data-recovery-skip-question]")) {
      app.answerDraft = "";
      app.answerFeedback = null;
      app.recordMetric("recordQuestionOutcome", app.chapter.chapterId, "skip");
      app.state = ProgressionModel.skipChallengeQuestion(app.state);
      app.persist();
      app.render();
    } else if (target.matches("[data-continue-recovery-resolved]")) {
      app.answerDraft = "";
      app.answerFeedback = null;
      app.state = ProgressionModel.continueChallenge(app.state);
      app.screen = app.state.activeChallengeRun ? "recovery-challenge" : "map";
      app.persist();
      app.render();
    } else if (target.matches("[data-submit-answer]")) submitCurrentAnswer();
    else if (target.matches("[data-answer-option]")) submitCurrentAnswer(target.dataset.answerOption);
    else if (target.matches("[data-retry-question]")) {
      app.answerDraft = "";
      app.answerFeedback = null;
      app.rewardReveal = null;
      app.state = ProgressionModel.retryQuestion(app.state);
      app.persist();
      app.render();
      app.root.querySelector("[data-answer-input]")?.focus();
    } else if (target.matches("[data-skip-question]")) {
      const beforeRun = app.state.activeRun;
      app.answerDraft = "";
      app.answerFeedback = null;
      app.rewardReveal = null;
      app.recordMetric("recordQuestionOutcome", app.chapter.chapterId, "skip");
      app.state = ProgressionModel.skipQuestion(app.state);
      if (!app.state.activeRun && app.state.lastSettlement?.levelId === beforeRun?.levelId) app.recordMetric("recordLevelClear", app.chapter.chapterId);
      app.screen = app.state.activeRun ? "challenge" : "settlement";
      app.persist();
      app.render();
    } else if (target.matches("[data-continue-resolved]")) {
      app.answerDraft = "";
      app.answerFeedback = null;
      app.rewardReveal = null;
      app.state = ProgressionModel.continueFromResolved(app.state);
      app.screen = app.state.activeRun ? "challenge" : "settlement";
      app.persist();
      app.render();
    } else if (target.matches("[data-next-level]")) {
      const settlement = ProgressionModel.getSettlement(app.state);
      const currentIndex = app.chapter.levels.findIndex((level) => level.levelId === settlement?.levelId);
      const nextLevel = app.chapter.levels[currentIndex + 1];
      if (nextLevel && app.state.unlockedLevelIds.includes(nextLevel.levelId)) {
        app.answerDraft = "";
        app.answerFeedback = null;
        app.rewardReveal = null;
        app.craftingFeedback = null;
        app.state = ProgressionModel.startLevel(app.state, nextLevel.levelId);
        app.screen = "challenge";
        app.persist();
      } else {
        app.screen = "map";
        app.persist();
      }
      app.render();
    } else if (target.matches("[data-return-map]")) {
      const settlement = ProgressionModel.getSettlement(app.state);
      app.pendingFocusKey = settlement?.levelId || null;
      app.answerFeedback = null;
      app.rewardReveal = null;
      app.craftingFeedback = null;
      app.screen = "map";
      app.persist();
      app.render();
    } else if (target.matches("[data-retry-save]")) {
      app.persist();
      app.render();
    }
  }

  function handleKeydown(event) {
    if (event.key === "Enter" && event.target.matches?.("[data-answer-input]") && app.screen === "challenge" && app.state.activeRun?.status === "active") submitCurrentAnswer();
    if (event.key === "Enter" && event.target.matches?.("[data-answer-input]") && app.screen === "recovery-challenge" && app.state.activeChallengeRun?.status === "active") submitCurrentRecoveryAnswer();
    if (event.key === "Escape" && app.screen === "inventory") closeInventory();
    if (event.key === "Escape" && app.screen === "challenge" && app.state.activeRun?.status === "active") {
      app.pendingFocusKey = app.state.activeRun.levelId;
      app.captureAnswerDraft();
      app.screen = "map";
      app.persist();
      app.render();
    }
    if (event.key === "Escape" && app.screen === "recovery-challenge" && app.state.activeChallengeRun?.status === "active") {
      app.screen = "map";
      app.persist();
      app.render();
    }
  }


  return { handleClick, handleKeydown };
}
