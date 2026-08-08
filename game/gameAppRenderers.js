import { CHINESE_NUMERALS, appendItem, appendRewardOutcome, appendText, createFighterArt, createItemIcon, createProjectHeroArt, getLevelNumber } from "./gameAppView.js";

export function createGameRenderers(app) {
  const { GameItemCatalog, InventoryModel, LevelRewardConfig, RewardPresentation, ChapterMissionModel, ProgressionModel, ChallengeModel } = app.dependencies;
  function renderHeader(parent, eyebrow, title, allowInventory = true) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const header = document.createElement("header");
    header.className = "quest-game__header";
    const heading = document.createElement("div");
    appendText(heading, "p", eyebrow, "quest-game__eyebrow");
    appendText(heading, "h1", title);
    header.append(heading);
    if (allowInventory) {
      const button = appendText(header, "button", "背包", "pixel-button pixel-button--inventory");
      button.type = "button";
      button.dataset.openInventory = "";
      button.dataset.focusKey = "open-inventory";
      button.setAttribute("aria-label", "打开背包");
    }
    parent.append(header);
  }

  function renderStatusOverlays() {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const status = document.createElement("p");
    status.className = "sr-only";
    status.dataset.liveStatus = "";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    status.textContent = [answerFeedback?.text, craftingFeedback ? `合成成功：${craftingFeedback.name}` : ""].filter(Boolean).join(" ");
    root.append(status);
    if (saveFeedback?.text) {
      const alert = document.createElement("div");
      alert.className = "save-feedback";
      alert.dataset.saveFeedback = "";
      alert.setAttribute("role", "alert");
      alert.textContent = saveFeedback.text;
      const retry = appendText(alert, "button", "重试保存", "pixel-button pixel-button--quiet save-feedback__retry");
      retry.type = "button";
      retry.dataset.retrySave = "";
      root.append(alert);
    }
  }

  function renderSubmissionFeedback(parent) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    if (!answerFeedback?.text) return;
    const feedback = appendText(
      parent,
      "p",
      answerFeedback.text,
      `answer-feedback answer-feedback--${answerFeedback.type === "correct" ? "correct" : "retry"}`
    );
    feedback.dataset.answerFeedback = answerFeedback.type;
    feedback.setAttribute("role", "status");
  }

  function getRewardPresentation() {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    return RewardPresentation.getRewardPresentation(
      rewardReveal?.transactions || [],
      (itemId) => GameItemCatalog.getItem(itemId)
    );
  }

  function renderRewardPopover(parent) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const presentation = getRewardPresentation();
    const { transactions } = presentation;
    if (!transactions.length) return;
    const overlay = document.createElement("aside");
    overlay.className = `reward-popover reward-popover--${presentation.mode}`;
    if (presentation.mode === "reveal") overlay.dataset.rewardPopover = "";
    else overlay.dataset.rewardToast = "";
    overlay.setAttribute("role", "status");
    appendText(overlay, "p", presentation.mode === "reveal" ? "奖励揭晓" : "材料入库", "quest-game__eyebrow");
    appendText(overlay, "h2", presentation.mode === "reveal" ? "获得特别补给！" : "材料已装进背包", "reward-popover__title");
    const rewards = document.createElement("div");
    rewards.className = "reward-popover__items";
    transactions.forEach((transaction) => {
      const item = GameItemCatalog.getItem(transaction.itemId);
      if (item) appendRewardOutcome(rewards, item, transaction, "item-chip reward-popover__item");
    });
    overlay.append(rewards);
    if (presentation.mode === "reveal") {
      const button = appendText(overlay, "button", "继续前进", "pixel-button pixel-button--primary reward-popover__action");
      button.type = "button";
      button.dataset.dismissRewardPopover = "";
    }
    parent.append(overlay);
  }

  function renderChapterStages(parent) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const cleared = new Set(Object.keys(state.levelRecords || {}));
      const stageCount = Math.ceil(chapter.levels.length / 3);
      const stages = document.createElement("section");
      stages.className = "chapter-stages";
      stages.setAttribute("aria-label", `${chapter.name}阶段进度`);
    Array.from({ length: stageCount }, (_, index) => {
      const start = index * 3;
      const stageLevels = chapter.levels.slice(start, start + 3);
      const clearedCount = stageLevels.filter((level) => cleared.has(level.levelId)).length;
      const card = document.createElement("article");
      card.className = "chapter-stage";
      card.dataset.chapterStage = String(index + 1);
      card.dataset.stageStatus = clearedCount === stageLevels.length ? "completed" : clearedCount > 0 ? "active" : "locked";
      appendText(card, "strong", `阶段 ${index + 1}`, "chapter-stage__title");
      appendText(card, "span", `${clearedCount} / ${stageLevels.length}`, "chapter-stage__count");
      appendText(card, "small", stageLevels.map((level, levelIndex) => `${start + levelIndex + 1}. ${level.title}`).join(" · "), "chapter-stage__levels");
      const meter = document.createElement("span");
      meter.className = "chapter-stage__meter";
      meter.style.setProperty("--stage-progress", `${(clearedCount / stageLevels.length) * 100}%`);
      card.append(meter);
      stages.append(card);
    });
    parent.append(stages);
  }

  function renderChapterMissions(parent) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const missions = ChapterMissionModel.getMissionStatus(chapter.chapterId, state, state.inventory);
    if (!missions.length) return;
    const section = document.createElement("section");
    section.className = "chapter-missions";
    section.dataset.chapterMissions = chapter.chapterId;
    appendText(section, "p", "章节任务收藏", "quest-game__eyebrow");
    appendText(section, "h2", "完成任务，收集专属徽记", "chapter-missions__title");
    missions.forEach((mission) => {
      const item = GameItemCatalog.getItem(mission.reward.itemId);
      const card = document.createElement("article");
      card.className = "chapter-mission";
      card.dataset.missionId = mission.id;
      card.dataset.missionStatus = mission.claimed ? "claimed" : mission.progress >= mission.value ? "ready" : "active";
      if (item) card.append(createItemIcon(item, "chapter-mission__icon"));
      const copy = document.createElement("div");
      appendText(copy, "strong", item?.name || "任务奖励");
      appendText(copy, "small", mission.claimed ? "已收藏" : `${Math.min(mission.progress, mission.value)} / ${mission.value}`);
      card.append(copy);
      section.append(card);
    });
    parent.append(section);
  }

  function renderStageCraftingCallout(parent, levelNumber) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    if (levelNumber % 3 !== 0) return;
    const stageNumber = Math.ceil(levelNumber / 3);
    const recipe = InventoryModel.getProjectRecipes(chapter.chapterId).find((candidate) => candidate.unlockLevelNumber === levelNumber
      && candidate.outputs.some(({ itemId }) => GameItemCatalog.getItem(itemId)?.tags?.includes("project-part")));
    if (!recipe) return;
    const output = recipe.outputs[0];
    const outputItem = GameItemCatalog.getItem(output.itemId);
    const callout = document.createElement("aside");
    callout.className = "stage-crafting-callout";
    callout.dataset.stageCraftingCallout = "";
    if (hasRecipeOutput(recipe)) {
      callout.dataset.stageCraftingStatus = "complete";
      appendText(callout, "strong", `阶段 ${stageNumber} 的${outputItem?.name || "大型部件"}已完成`, "stage-crafting-callout__title");
      appendText(callout, "p", "这部分工程已装入蓝图，继续挑战下一段路线。", "stage-crafting-callout__copy");
    } else if (InventoryModel.canCraft(state.inventory, recipe, { crafting: true })) {
      callout.dataset.stageCraftingStatus = "ready";
      appendText(callout, "strong", `阶段 ${stageNumber} 可以拼装${outputItem?.name || "大型部件"}`, "stage-crafting-callout__title");
      appendText(callout, "p", "三个专题组件已到位，去背包完成这次大型拼装。", "stage-crafting-callout__copy");
    } else {
      callout.dataset.stageCraftingStatus = "missing";
      const missing = InventoryModel.getMissingIngredients(state.inventory, recipe, { crafting: true });
      const missingText = missing.map(({ itemId, missing: quantity }) => `${GameItemCatalog.getItem(itemId)?.name || itemId} ×${quantity}`).join("、");
      appendText(callout, "strong", `阶段 ${stageNumber} 还差材料`, "stage-crafting-callout__title");
      appendText(callout, "p", `尚缺：${missingText || "组件材料"}。可重玩已完成关卡补领固定材料。`, "stage-crafting-callout__copy");
    }
    const action = appendText(callout, "button", "查看背包与蓝图", "pixel-button pixel-button--primary stage-crafting-callout__action");
    action.type = "button";
    action.dataset.stageCraftingAction = "";
    action.dataset.openInventory = "";
    parent.append(callout);
  }

  function renderChapterFinale(parent) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const completion = ProgressionModel.getChapterCompletion(state, chapter);
    if (!completion.isChapterCleared) return;
    const project = completion.finalProjectId ? GameItemCatalog.getSuperProject(chapter.chapterId) : null;
    const finale = document.createElement("article");
    finale.className = "chapter-finale";
    finale.dataset.chapterFinale = "";
    finale.dataset.finaleStatus = completion.status;
    const copy = completion.isFinalProjectComplete
      ? {
          eyebrow: `${chapter.name}完全闭环`,
          title: `${project?.name || "章节工程"}验收完成！`,
          lead: "12 个知识点全部突破，超级工程已经入库。下一章路线已准备就绪。"
        }
      : {
          eyebrow: `${chapter.name}通关`,
          title: "超级工程进入最终验收",
          lead: "12 个知识点路线已点亮。现在去背包把大型部件装配成最终工程。"
        };
    appendText(finale, "p", copy.eyebrow, "quest-game__eyebrow");
    appendText(finale, "h2", copy.title, "chapter-finale__title");
    appendText(finale, "p", copy.lead, "chapter-finale__lead");
    appendText(finale, "strong", `${completion.clearedLevels} / ${completion.totalLevels} 关卡路线完成`, "chapter-finale__progress");
    if (project) {
      const artWrap = document.createElement("div");
      artWrap.className = "chapter-finale__art";
      const finalItem = GameItemCatalog.getItem(project.id);
      artWrap.append(project.id === "j20-sky-fighter"
        ? createFighterArt(completion.isFinalProjectComplete ? "completed" : "blueprint", "fighter-art fighter-art--finale")
        : createItemIcon(finalItem, "fighter-art fighter-art--finale"));
      finale.append(artWrap);
    }
    const action = appendText(
      finale,
        "button",
        completion.isFinalProjectComplete ? `查看${project?.name || "工程"}收藏` : "进入背包完成最终组装",
      "pixel-button pixel-button--primary chapter-finale__action"
    );
    action.type = "button";
    action.dataset.chapterFinaleAction = "";
    action.dataset.openInventory = "";
    parent.append(finale);
  }

  function renderCampaignOverview(parent) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const overview = document.createElement("section");
      overview.className = "campaign-overview";
      overview.dataset.campaignOverview = "";
      const chapterCount = CHINESE_NUMERALS[allChapters.length] || String(allChapters.length);
      appendText(overview, "p", `${chapterCount}章数学远征`, "quest-game__eyebrow");
    allChapters.forEach((candidate, index) => {
      const candidateState = campaign.chapterStates[candidate.chapterId];
      const completion = ProgressionModel.getChapterCompletion(candidateState, candidate);
      const unlocked = campaign.unlockedChapterIds.includes(candidate.chapterId);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "campaign-chapter";
      card.dataset.chapterId = candidate.chapterId;
      card.dataset.chapterStatus = candidate.chapterId === chapter.chapterId ? "active" : unlocked ? "unlocked" : "locked";
      card.disabled = !unlocked || Boolean(state.activeRun || state.activeChallengeRun);
      appendText(card, "span", `第 ${index + 1} 章`, "campaign-chapter__number");
      appendText(card, "strong", candidate.name, "campaign-chapter__name");
      appendText(card, "small", unlocked ? `${completion.clearedLevels} / ${completion.totalLevels} 关` : "完成上一章工程后解锁", "campaign-chapter__progress");
      overview.append(card);
    });
    parent.append(overview);
  }

  function renderRecoveryChallengeCallout(parent) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const completion = ProgressionModel.getChapterCompletion(state, chapter);
    if (!completion.isChapterCleared || completion.isFinalProjectComplete) return;
    const missing = ChallengeModel.getMissingRawMaterials(chapter.chapterId, state.inventory);
    const section = document.createElement("section");
    section.className = "recovery-challenge-callout";
    section.dataset.recoveryChallenge = "available";
    appendText(section, "p", "工程补给挑战", "quest-game__eyebrow");
    appendText(section, "h2", "主线完成了，缺少的材料去挑战补给", "recovery-challenge__title");
    const target = missing[0];
    appendText(section, "p", target
      ? `当前优先补给：${GameItemCatalog.getItem(target.itemId)?.name || target.itemId} × ${target.quantity}`
      : "工程链正在等待下一次补给。", "recovery-challenge__copy");
    const actions = document.createElement("div");
    actions.className = "recovery-challenge__actions";
    [["review", "错题复习挑战", "优先复习本章错题，再补充随机题"], ["random", "随机组卷挑战", "从本章全部知识点随机抽取 10 题"]].forEach(([mode, label, hint]) => {
      const button = appendText(actions, "button", label, "pixel-button pixel-button--primary");
      button.type = "button";
      button.dataset.startRecoveryChallenge = mode;
      button.title = hint;
    });
    section.append(actions);
    parent.append(section);
  }

  function renderMap() {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const main = document.createElement("main");
    main.className = "quest-game quest-game--map";
    main.dataset.gameScreen = "map";
    renderHeader(main, "知识远征", chapter.name);
    renderCampaignOverview(main);

    const summary = document.createElement("section");
    summary.className = "chapter-summary";
    const cleared = Object.keys(state.levelRecords).length;
    appendText(summary, "p", "沿着像素路标，完成每一组十题挑战。", "chapter-summary__lead");
    appendText(summary, "p", `${cleared} / ${chapter.levels.length} 关已完成`, "chapter-summary__progress");
    main.append(summary);
    renderRecoveryChallengeCallout(main);
    renderChapterStages(main);
    renderChapterMissions(main);

    const map = document.createElement("section");
      map.dataset.levelMap = "";
      map.className = "level-map";
      map.setAttribute("aria-label", `${chapter.name}关卡地图`);
    chapter.levels.forEach((level, index) => {
      const record = state.levelRecords[level.levelId];
      const unlocked = state.unlockedLevelIds.includes(level.levelId);
      const isPausedLevel = state.activeRun?.levelId === level.levelId;
      const status = isPausedLevel ? "paused" : !unlocked ? "locked" : record?.starCount === 3 ? "full-star" : record ? "cleared" : "current";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "level-node";
      button.dataset.levelId = level.levelId;
      button.dataset.focusKey = level.levelId;
      button.dataset.status = status;
      button.disabled = !unlocked || Boolean(state.activeRun && !isPausedLevel);
      button.setAttribute("aria-label", `第 ${index + 1} 关 ${level.title}，${status === "paused" ? "继续挑战" : status === "locked" ? "未解锁" : "可挑战"}`);
      appendText(button, "span", String(index + 1).padStart(2, "0"), "level-node__number");
      appendText(button, "strong", level.title, "level-node__title");
      appendText(button, "small", status === "paused" ? "继续挑战" : record ? `${"★".repeat(record.starCount)}${"☆".repeat(3 - record.starCount)}` : status === "locked" ? "待解锁" : "开始挑战", "level-node__status");
      map.append(button);
    });
    main.append(map);
    root.append(main);
  }

  function renderRewardPreview(parent, run) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const rewardTrack = LevelRewardConfig.getQuestionRewardTrack(run.levelId, run.questionIndex + 1);
    const fixedReward = rewardTrack?.fixedReward;
    const hasRandomBonus = ["进阶", "提高", "挑战"].includes(run.question.difficulty);
    parent.dataset.rewardType = hasRandomBonus ? "fixed-plus-random" : "fixed";
    if (fixedReward) {
      const item = GameItemCatalog.getItem(fixedReward.itemId);
      if (item) {
        appendRewardOutcome(parent, item, {
          ...InventoryModel.previewItemGrant(state.inventory, fixedReward.itemId, fixedReward.quantity),
          rewardType: "fixed"
        }, "reward-chip");
      }
    }
    if (hasRandomBonus) {
      const note = appendText(parent, "p", "进阶挑战：额外随机补给", "reward-preview__bonus");
      note.dataset.randomRewardBonus = "";
    }
  }

  function renderTacticalReview(parent, run) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const reviewPanel = document.createElement("section");
    reviewPanel.className = "tactical-review";
    reviewPanel.dataset.tacticalReview = "";
    const isCorrect = run.resolved?.resolution === "correct";
    appendText(
      reviewPanel,
      "p",
      isCorrect ? (answerFeedback?.text || "线索已收集，准备复盘后继续前进。") : "这条路线先记下，看看关键方法再继续前进。",
      "tactical-review__cheer"
    );
    if (isCorrect) {
      const presentation = getRewardPresentation();
      const streakLabel = presentation.hasStreakChest
        ? `连胜 ${state.streak} 题，补给箱已解锁！`
        : `当前连胜：${state.streak} 题`;
      appendText(reviewPanel, "p", streakLabel, "tactical-review__streak");
    }

    const details = document.createElement("details");
    details.dataset.reviewDetails = "";
    const summary = appendText(details, "summary", "展开战术复盘", "tactical-review__summary");
    summary.setAttribute("aria-label", "展开战术复盘");
    const review = ProgressionModel.getResolvedReview(state);
    if (review) {
      if (run.question.thinkingMethodLabel) appendText(details, "p", `思维方法：${run.question.thinkingMethodLabel}`, "tactical-review__thinking-method");
      if (run.question.methodReview) appendText(details, "p", `方法复盘：${run.question.methodReview}`, "tactical-review__method-review");
      appendText(details, "p", `关键观察：${review.observation || "观察题目中的数量关系。"}`, "tactical-review__observation");
      if (review.steps?.length) {
        const steps = document.createElement("ol");
        steps.className = "tactical-review__steps";
        review.steps.forEach((step) => appendText(steps, "li", step));
        details.append(steps);
      }
      if (review.method) appendText(details, "p", `\u89e3\u9898\u6a21\u578b：${review.method}`, "tactical-review__method");
      if (review.calculation) appendText(details, "p", `\u8ba1\u7b97\u8bb0\u5f55：${review.calculation}`, "tactical-review__calculation");
      if (review.answer) appendText(details, "p", `\u7b54\u6848：${review.answer}`, "tactical-review__answer");
      if (review.verification || review.check) appendText(details, "p", `\u9a8c\u7b97\u65b9\u6cd5：${review.verification || review.check}`, "tactical-review__check");
      if (review.errorTrap || review.pitfall) appendText(details, "p", `\u6613\u9519\u63d0\u9192：${review.errorTrap || review.pitfall}`, "tactical-review__pitfall");
    } else {
      appendText(details, "p", "这题的复盘记录正在整理，先带着刚才的思路进入下一题。", "tactical-review__empty");
    }
    reviewPanel.append(details);
    const continueButton = appendText(reviewPanel, "button", "继续下一题", "pixel-button pixel-button--primary tactical-review__continue");
    continueButton.type = "button";
    continueButton.dataset.continueResolved = "";
    parent.append(reviewPanel);
  }

  function renderChallenge() {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const run = state.activeRun;
    if (!run) {
      app.screen = state.lastSettlement ? "settlement" : "map";
      app.render();
      return;
    }
    const level = getLevel(run.levelId);
    const main = document.createElement("main");
    main.className = "quest-game quest-game--challenge";
    main.dataset.gameScreen = "challenge";
    renderHeader(main, `第 ${getLevelNumber(chapter, level.levelId)} 关`, level.title, run.status !== "retry");

    const challenge = document.createElement("section");
    challenge.className = "challenge-card";
    const returnMap = appendText(challenge, "button", "返回地图", "pixel-button pixel-button--quiet challenge-return");
    returnMap.type = "button";
    returnMap.dataset.challengeReturnMap = "";
    returnMap.hidden = run.status === "retry";
    renderSubmissionFeedback(challenge);
    const meta = document.createElement("div");
    meta.className = "challenge-meta";
    const counter = appendText(meta, "p", `第 ${run.questionIndex + 1} / 10 题`, "question-counter");
    counter.dataset.questionCounter = "";
    const difficulty = appendText(meta, "p", run.question.isBoss ? "Boss · 挑战" : run.question.difficulty, "difficulty-badge");
    difficulty.dataset.difficulty = "";
    challenge.append(meta);

    const heading = appendText(challenge, "h2", `第 ${getLevelNumber(chapter, level.levelId)} 关 · ${level.title}`, "challenge-card__heading");
    heading.dataset.levelHeading = "";
    const hasRandomBonus = ["进阶", "提高", "挑战"].includes(run.question.difficulty);
    const rewardLabel = appendText(challenge, "p", hasRandomBonus ? "本题固定材料 · 额外随机补给" : "本题固定材料", "challenge-card__label");
    rewardLabel.id = "reward-preview-label";
    const rewardPreview = document.createElement("div");
    rewardPreview.dataset.rewardPreview = "";
    rewardPreview.className = "reward-preview";
    rewardPreview.setAttribute("aria-labelledby", rewardLabel.id);
    renderRewardPreview(rewardPreview, run);
    challenge.append(rewardPreview);

    const storyBeat = appendText(
      challenge,
      "p",
      run.question.storyBeat || "工程小队正在整理这条线索。",
      "question-story-beat"
    );
    storyBeat.dataset.questionStoryBeat = "";
    if (run.question.thinkingMethodLabel) {
      const methodHint = document.createElement("div");
      methodHint.className = "thinking-method-hint";
      methodHint.dataset.thinkingMethod = run.question.thinkingMethodId || "";
      appendText(methodHint, "strong", `思维方法：${run.question.thinkingMethodLabel}`, "thinking-method-hint__label");
      if (run.question.methodPrompt) appendText(methodHint, "span", run.question.methodPrompt, "thinking-method-hint__prompt");
      challenge.append(methodHint);
    }
    const prompt = appendText(challenge, "p", run.question.prompt, "question-prompt");
    prompt.dataset.questionPrompt = "";
    if (run.status === "resolved") {
      renderTacticalReview(challenge, run);
    } else {
      const form = document.createElement("div");
      form.className = "answer-controls";
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "text";
      input.autocomplete = "off";
      input.placeholder = "输入你的答案";
      input.setAttribute("aria-label", "本题答案");
      input.dataset.answerInput = "";
      input.disabled = run.status === "retry";
      if (run.status === "active") input.value = answerDraft;
      form.append(input);

      const submit = appendText(form, "button", "提交", "pixel-button pixel-button--primary");
      submit.type = "button";
      submit.dataset.submitAnswer = "";
      submit.hidden = run.status === "retry";
      const retry = appendText(form, "button", "再试一次", "pixel-button pixel-button--primary");
      retry.type = "button";
      retry.dataset.retryQuestion = "";
      retry.hidden = run.status !== "retry";
      const skip = appendText(form, "button", "跳过", "pixel-button pixel-button--quiet");
      skip.type = "button";
      skip.dataset.skipQuestion = "";
      skip.hidden = run.status !== "retry";
      challenge.append(form);
    }

    if (run.status === "retry") {
      const feedback = appendText(challenge, "p", "这次没有通过。可以再试一次，或跳过继续前进。", "retry-message");
      feedback.setAttribute("role", "status");
    }
    renderRewardPopover(challenge);
    main.append(challenge);
    root.append(main);
    if (run.status === "active") root.querySelector("[data-answer-input]")?.focus({ preventScroll: true });
  }

  function renderRecoveryReview(parent, run) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const panel = document.createElement("section");
    panel.className = "tactical-review recovery-review";
    panel.dataset.recoveryReview = "";
    const isCorrect = run.resolved?.resolution === "correct";
    appendText(panel, "p", isCorrect ? "补给已到账，继续下一道挑战。" : "这道题先记入错题复习，下一道继续。", "tactical-review__cheer");
    const currentRewards = (run.rewardTransactions || []).filter((transaction) => transaction.questionId === run.resolved?.questionId && transaction.status === "awarded");
    currentRewards.forEach((transaction) => {
      const item = GameItemCatalog.getItem(transaction.itemId);
      if (item) appendRewardOutcome(panel, item, transaction, "inventory-item recovery-reward");
    });
    const details = document.createElement("details");
    details.dataset.reviewDetails = "";
    appendText(details, "summary", "展开战术复盘", "tactical-review__summary");
    const review = ProgressionModel.getChallengeReview(state);
    if (review) {
      appendText(details, "p", review.observation || "先找出题目中的已知量和目标量。", "tactical-review__observation");
      if (review.steps?.length) {
        const steps = document.createElement("ol");
        steps.className = "tactical-review__steps";
        review.steps.forEach((step) => appendText(steps, "li", step));
        details.append(steps);
      }
      if (review.method) appendText(details, "p", `\u89e3\u9898\u6a21\u578b：${review.method}`, "tactical-review__method");
      if (review.calculation) appendText(details, "p", `\u8ba1\u7b97\u8bb0\u5f55：${review.calculation}`, "tactical-review__calculation");
      if (review.answer) appendText(details, "p", `\u7b54\u6848：${review.answer}`, "tactical-review__answer");
      if (review.verification || review.check) appendText(details, "p", `\u9a8c\u7b97\u65b9\u6cd5：${review.verification || review.check}`, "tactical-review__check");
      if (review.errorTrap || review.pitfall) appendText(details, "p", `\u6613\u9519\u63d0\u9192：${review.errorTrap || review.pitfall}`, "tactical-review__pitfall");
    }
    panel.append(details);
    const continueButton = appendText(panel, "button", run.questionIndex + 1 >= run.questions.length ? "查看挑战结果" : "继续挑战", "pixel-button pixel-button--primary tactical-review__continue");
    continueButton.type = "button";
    continueButton.dataset.continueRecoveryResolved = "";
    parent.append(panel);
  }

  function renderRecoveryChallenge() {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const run = state.activeChallengeRun;
    if (!run) {
      app.screen = "map";
      app.render();
      return;
    }
    const main = document.createElement("main");
    main.className = "quest-game quest-game--challenge recovery-challenge";
    main.dataset.gameScreen = "recovery-challenge";
    renderHeader(main, "工程补给挑战", run.mode === "review" ? "错题复习补给" : "随机组卷补给");
    const card = document.createElement("section");
    card.className = "challenge-card recovery-challenge__card";
    const returnMap = appendText(card, "button", "返回地图", "pixel-button pixel-button--quiet challenge-return");
    returnMap.type = "button";
    returnMap.dataset.challengeReturnMap = "";
    returnMap.hidden = run.status === "retry";
    renderSubmissionFeedback(card);
    const meta = document.createElement("div");
    meta.className = "challenge-meta";
    appendText(meta, "p", `挑战题 ${run.questionIndex + 1} / ${run.questions.length}`, "question-counter");
    appendText(meta, "p", run.question?.difficulty || "复习", "difficulty-badge");
    card.append(meta);
    appendText(card, "h2", "补给线索", "challenge-card__heading");
    const target = ChallengeModel.getTargetMaterial(chapter.chapterId, state.inventory);
    appendText(card, "p", target ? `答对可补给：${GameItemCatalog.getItem(target.itemId)?.name || target.itemId} × 1（还缺 ${target.quantity}）` : "当前工程材料已暂时齐备。", "recovery-target");
    appendText(card, "p", run.question?.storyBeat || "从本章知识点中抽取一道补给线索。", "question-story-beat");
    if (run.question?.thinkingMethodLabel) {
      const methodHint = document.createElement("div");
      methodHint.className = "thinking-method-hint";
      methodHint.dataset.thinkingMethod = run.question.thinkingMethodId || "";
      appendText(methodHint, "strong", `思维方法：${run.question.thinkingMethodLabel}`, "thinking-method-hint__label");
      if (run.question.methodPrompt) appendText(methodHint, "span", run.question.methodPrompt, "thinking-method-hint__prompt");
      card.append(methodHint);
    }
    appendText(card, "p", run.question?.prompt || "读取补给线索中……", "question-prompt");
    if (run.status === "resolved") {
      renderRecoveryReview(card, run);
    } else {
      const form = document.createElement("div");
      form.className = "answer-controls";
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "text";
      input.autocomplete = "off";
      input.placeholder = "输入答案";
      input.setAttribute("aria-label", "补给挑战答案");
      input.dataset.answerInput = "";
      input.disabled = run.status === "retry";
      if (run.status === "active") input.value = answerDraft;
      form.append(input);
      const submit = appendText(form, "button", "提交", "pixel-button pixel-button--primary");
      submit.type = "button";
      submit.dataset.recoverySubmitAnswer = "";
      submit.hidden = run.status === "retry";
      const retry = appendText(form, "button", "再试一次", "pixel-button pixel-button--primary");
      retry.type = "button";
      retry.dataset.recoveryRetryQuestion = "";
      retry.hidden = run.status !== "retry";
      const skip = appendText(form, "button", "跳过", "pixel-button pixel-button--quiet");
      skip.type = "button";
      skip.dataset.recoverySkipQuestion = "";
      skip.hidden = run.status !== "retry";
      card.append(form);
    }
    if (run.status === "retry") appendText(card, "p", "答案还没对上。可以再试一次，也可以跳过继续补给。", "retry-message");
    main.append(card);
    root.append(main);
    if (run.status === "active") root.querySelector("[data-answer-input]")?.focus({ preventScroll: true });
  }

  function renderSettlement() {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const settlement = ProgressionModel.getSettlement(state);
    if (!settlement) {
      app.screen = "map";
      app.render();
      return;
    }
    const level = getLevel(settlement.levelId);
    const levelNumber = getLevelNumber(chapter, level.levelId);
    const nextLevel = chapter.levels[levelNumber];
    const section = document.createElement("section");
    section.className = "quest-game quest-game--settlement";
    section.dataset.gameScreen = "settlement";
    renderSubmissionFeedback(section);
    renderHeader(section, `第 ${levelNumber} 关完成`, level.title, false);
    appendText(section, "p", "远征结算", "quest-game__eyebrow");
    const celebration = document.createElement("article");
    celebration.className = "settlement-celebration";
    celebration.dataset.settlementCelebration = "";
    appendText(celebration, "h2", "关卡突破！", "settlement-celebration__title");
    appendText(celebration, "p", `第 ${levelNumber} 关完成，远征路线继续点亮。`, "settlement-celebration__copy");
    const unlockText = nextLevel
      ? `第 ${levelNumber + 1} 关已解锁 · ${nextLevel.title}`
      : `${chapter.name}全部通关 · 超级工程等待最终验收`;
    const unlock = appendText(celebration, "p", unlockText, "settlement-celebration__unlock");
    unlock.dataset.unlockedNextLevel = "";
    section.append(celebration);
    renderStageCraftingCallout(section, levelNumber);
    renderChapterFinale(section);
    const stars = appendText(section, "output", `${"★".repeat(settlement.starCount)}${"☆".repeat(3 - settlement.starCount)}`, "settlement-stars");
    stars.dataset.settlementStars = "";
    stars.setAttribute("aria-label", `获得 ${settlement.starCount} 星`);
    appendText(section, "p", `答对 ${settlement.correctCount} 题 · 跳过 ${settlement.skippedCount} 题`, "settlement-score");
    appendText(section, "h2", "本次新获得", "settlement-title");
    const items = document.createElement("div");
    items.dataset.settlementItems = "";
    items.className = "inventory-grid settlement-items";
    RewardPresentation.awardedTransactions(settlement.rewardTransactions)
      .forEach((transaction) => {
        const item = GameItemCatalog.getItem(transaction.itemId);
        if (item) appendRewardOutcome(items, item, transaction, "inventory-item");
      });
    if (!items.children.length) appendText(items, "p", "本次没有获得物品。", "empty-state");
    section.append(items);
    const skippedRewards = RewardPresentation.nonAwardedTransactions(settlement.rewardTransactions);
    if (skippedRewards.length) {
      appendText(section, "h3", "未新增的奖励", "settlement-title settlement-title--secondary");
      const skippedItems = document.createElement("div");
      skippedItems.dataset.settlementSkippedRewards = "";
      skippedItems.className = "inventory-grid settlement-items";
      skippedRewards.forEach((transaction) => {
        const item = GameItemCatalog.getItem(transaction.itemId);
        if (item) appendRewardOutcome(skippedItems, item, transaction, "inventory-item");
      });
      section.append(skippedItems);
    }
    const nextIndex = levelNumber;
    const hasNextLevel = Boolean(chapter.levels[nextIndex]);
    const next = appendText(section, "button", hasNextLevel ? "下一关" : "返回地图", "pixel-button pixel-button--primary settlement-next");
    next.type = "button";
    next.dataset.nextLevel = "";
    if (hasNextLevel) {
      const mapButton = appendText(section, "button", "返回地图", "pixel-button pixel-button--quiet settlement-map");
      mapButton.type = "button";
      mapButton.dataset.returnMap = "";
    }
    root.append(section);
  }

  function renderInventory() {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const aside = document.createElement("aside");
    aside.className = "quest-game quest-game--inventory";
    aside.dataset.gameScreen = "inventory";
    aside.setAttribute("aria-label", "远征背包");
    renderHeader(aside, "收藏一览", "远征背包", false);
    const close = appendText(aside, "button", "返回", "pixel-button pixel-button--quiet inventory-close");
    close.type = "button";
    close.dataset.closeInventory = "";
    if (craftingFeedback) {
      const feedback = appendText(aside, "p", `合成成功：${craftingFeedback.name}`, "crafting-feedback");
      feedback.dataset.craftingFeedback = "";
      feedback.setAttribute("role", "status");
    }
    const grid = document.createElement("div");
    grid.className = "inventory-grid";
    const entries = Object.entries(state.inventory).filter(([, quantity]) => quantity > 0);
    if (!entries.length) {
      const empty = appendText(grid, "p", "还没有收集到物品。完成挑战就能装满背包。", "empty-state");
      empty.dataset.inventoryEmpty = "";
    } else {
      entries.forEach(([itemId, quantity]) => {
        const item = GameItemCatalog.getItem(itemId);
        if (!item) return;
        const card = appendItem(grid, item, quantity, "inventory-item");
        appendText(card, "p", `类别：${item.category}`, "inventory-item__detail");
        appendText(card, "p", `稀有度：${item.rarity}`, "inventory-item__detail");
      });
    }
    aside.append(grid);
    renderFinalProjectCeremony(aside);
    renderMaterialSynthesis(aside);
    renderSuperProject(aside);
    root.append(aside);
  }

  function renderFinalProjectCeremony(parent) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const project = GameItemCatalog.getSuperProject(chapter.chapterId);
    if (!project || craftingFeedback?.itemId !== project.id) return;
    const finalItem = GameItemCatalog.getItem(project.id);
    const ceremony = document.createElement("article");
    ceremony.className = "final-project-ceremony";
    ceremony.dataset.finalProjectCeremony = "";
    appendText(ceremony, "p", "最终验收", "quest-game__eyebrow");
    appendText(ceremony, "h2", project.id === "j20-sky-fighter" ? `${project.name} 起飞！` : `${project.name} 完工！`, "final-project-ceremony__title");
    appendText(ceremony, "p", "知识路线、材料收集、组件合成和大型部件拼装全部完成。超级工程正式入库。", "final-project-ceremony__lead");
    ceremony.append(createProjectHeroArt(project, finalItem, "completed"));
    parent.append(ceremony);
  }

  function renderMaterialSynthesis(parent) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const recipes = InventoryModel.getProjectRecipes(chapter.chapterId).filter((recipe) => recipe.type === "material-processing");
    if (!recipes.length) return;
    const section = document.createElement("section");
    section.className = "material-synthesis";
    section.dataset.materialSynthesis = chapter.chapterId;
    appendText(section, "p", "原材料精炼台", "quest-game__eyebrow");
    appendText(section, "h2", "先精炼，再拼装", "material-synthesis__title");
    appendText(section, "p", "按蓝图配方逐级精炼：题目获得的原材料会变成工程材料，再进入组件拼装；每种材料的工序和用量以卡片为准。", "material-synthesis__lead");
    const grid = document.createElement("div");
    grid.className = "material-synthesis__grid";
    recipes.forEach((recipe) => {
      const output = recipe.outputs[0];
      const item = GameItemCatalog.getItem(output.itemId);
      const card = document.createElement("article");
      card.className = "material-recipe";
      card.dataset.materialRecipeCardId = recipe.id;
      const unlocked = isRecipeUnlocked(recipe);
      const crafted = hasRecipeOutput(recipe);
      card.dataset.recipeStatus = crafted ? "completed" : unlocked ? "available" : "locked";
      if (item) card.append(createItemIcon(item, "material-recipe__icon"));
      appendText(card, "h3", item?.name || recipe.name, "material-recipe__name");
      appendRecipeMaterials(card, recipe);
      const action = appendText(card, "button", crafted ? "已精炼" : "精炼材料", "pixel-button pixel-button--primary material-recipe__action");
      action.type = "button";
      action.dataset.materialRecipeId = recipe.id;
      action.disabled = crafted || !unlocked || !InventoryModel.canCraft(state.inventory, recipe, { crafting: true });
      if (!unlocked) appendText(card, "p", `完成第 ${recipe.unlockLevelNumber} 个专题后解锁`, "material-recipe__hint");
      else if (!crafted && action.disabled) appendText(card, "p", "还需要更多原材料", "material-recipe__hint");
      grid.append(card);
    });
    section.append(grid);
    parent.append(section);
  }

  function getClearedLevelCount() {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    return Object.keys(state.levelRecords || {}).length;
  }

  function formatRecipeRequirement(entry) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const item = GameItemCatalog.getItem(entry.itemId);
    return `${item?.name || entry.itemId} × ${entry.quantity}`;
  }

  function appendRecipeMaterials(parent, recipe) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const list = document.createElement("ul");
    list.className = "project-recipe__materials";
    recipe.inputs.forEach((entry) => {
      const owned = state.inventory[entry.itemId] || 0;
      const line = appendText(list, "li", `${formatRecipeRequirement(entry)}（已有 ${owned}）`);
      line.dataset.materialReady = owned >= entry.quantity ? "true" : "false";
    });
    parent.append(list);
  }

  function getCraftableRecipe(recipeId) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    return InventoryModel.getProjectRecipes(chapter.chapterId).find((recipe) => recipe.id === recipeId);
  }

  function isRecipeUnlocked(recipe) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    return getClearedLevelCount() >= (recipe.unlockLevelNumber || 0);
  }

  function hasRecipeOutput(recipe) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    return recipe.outputs.every(({ itemId, quantity }) => (state.inventory[itemId] || 0) >= quantity);
  }

  function isRecipeCrafted(recipe) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    return state.craftedProjectRecipeIds?.[recipe.id] === true || hasRecipeOutput(recipe);
  }

  function getProjectProgress(project) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const recipes = InventoryModel.getProjectRecipes(chapter.chapterId);
    const total = recipes.length;
    const completed = recipes.filter(isRecipeCrafted).length;
    return { completed, total };
  }

  function renderProjectProgress(parent, project) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const { completed, total } = getProjectProgress(project);
    const progress = document.createElement("section");
    progress.className = "project-progress";
    progress.dataset.projectProgress = "";
    appendText(progress, "strong", "工程进度", "project-progress__title");
    appendText(progress, "span", `${completed} / ${total}`, "project-progress__count");
    const meter = document.createElement("div");
    meter.className = "project-progress__meter";
    meter.dataset.projectProgressMeter = "";
    meter.setAttribute("role", "progressbar");
    meter.setAttribute("aria-valuemin", "0");
    meter.setAttribute("aria-valuemax", String(total));
    meter.setAttribute("aria-valuenow", String(completed));
    meter.setAttribute("aria-label", `${project.name} 工程进度 ${completed} / ${total}`);
    meter.style.setProperty("--project-progress", `${total ? (completed / total) * 100 : 0}%`);
    progress.append(meter);
    appendText(progress, "small", completed === total ? `超级工程完成，${project.name}已入库。` : `合成组件和大型部件，逐步点亮${project.name}。`, "project-progress__hint");
    parent.append(progress);
  }

  function renderProjectRecipe(parent, recipe, { final = false } = {}) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const output = recipe.outputs[0];
    const outputItem = GameItemCatalog.getItem(output.itemId);
    const categoryLabel = outputItem?.category?.endsWith("-component")
        ? `组件 ${String(recipe.unlockLevelNumber).padStart(2, "0")}`
        : outputItem?.category?.endsWith("-part")
        ? "大型部件"
        : "最终组装";
    const card = document.createElement("article");
    card.className = `project-recipe${final ? " project-recipe--final" : ""}`;
    card.dataset.projectRecipeCardId = recipe.id;
    card.dataset.recipeStatus = isRecipeCrafted(recipe) ? "completed" : isRecipeUnlocked(recipe) ? "available" : "locked";
    if (outputItem) {
      const visual = document.createElement("div");
      visual.className = "project-recipe__visual";
      visual.append(createItemIcon(outputItem, "project-recipe__icon"));
      card.append(visual);
    }
    appendText(card, "h3", `${final ? "最终组装" : categoryLabel} · ${outputItem?.name || recipe.name}`);
    appendRecipeMaterials(card, recipe);
    const actionLabel = isRecipeCrafted(recipe)
      ? "已完成"
      : final
        ? `组装 ${GameItemCatalog.getSuperProject(chapter.chapterId)?.name || outputItem?.name || "超级工程"}`
        : outputItem?.category?.endsWith("-part")
          ? "拼装大型部件"
          : "合成组件";
    const action = appendText(card, "button", actionLabel, "pixel-button pixel-button--primary project-recipe__action");
    action.type = "button";
    action.dataset.projectRecipeId = recipe.id;
    action.disabled = isRecipeCrafted(recipe) || !isRecipeUnlocked(recipe) || !InventoryModel.canCraft(state.inventory, recipe, { crafting: true });
    if (!isRecipeUnlocked(recipe)) {
      appendText(card, "p", `完成第 ${recipe.unlockLevelNumber} 个专题后解锁。`, "project-recipe__hint");
    } else if (!isRecipeCrafted(recipe) && action.disabled) {
      appendText(card, "p", "材料还不够，继续闯关收集。", "project-recipe__hint");
    }
    parent.append(card);
  }

  function renderSuperProject(parent) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const project = GameItemCatalog.getSuperProject(chapter.chapterId);
    if (!project) return;
    const section = document.createElement("section");
    section.className = "super-project";
    section.dataset.superProject = project.id;
    appendText(section, "p", "超级工程蓝图", "quest-game__eyebrow");
    appendText(section, "h2", project.name, "super-project__title");
    const projectState = (state.inventory[project.id] || 0) > 0 ? "completed" : "blueprint";
    section.append(createProjectHeroArt(project, GameItemCatalog.getItem(project.id), projectState));
    appendText(section, "p", project.description, "super-project__lead");
    renderProjectProgress(section, project);
    const recipeGrid = document.createElement("div");
    recipeGrid.className = "super-project__recipes";
    InventoryModel.getProjectRecipes(chapter.chapterId)
      .filter((recipe) => recipe.type !== "material-processing" && recipe.id !== project.finalRecipe.id)
      .forEach((recipe) => renderProjectRecipe(recipeGrid, recipe));
    renderProjectRecipe(recipeGrid, getCraftableRecipe(project.finalRecipe.id), { final: true });
    section.append(recipeGrid);
    parent.append(section);
  }

  return { renderMap, renderChallenge, renderRecoveryChallenge, renderSettlement, renderInventory, renderStatusOverlays, getCraftableRecipe, isRecipeUnlocked };
}
