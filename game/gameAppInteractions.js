import { createSubmissionFeedback } from "./gameAppView.js";
import { generateProjectCertificate, openCertificateModal } from "./certificateGenerator.js";

export function createGameInteractions(app) {
  const { AnswerMatcher, GameItemCatalog, InventoryModel, ChallengeModel, ProgressionModel, SoundEngine, AchievementModel, StorageAdapter, CampaignModel } = app.dependencies;
  
  function checkAchievements() {
    if (!AchievementModel) return;
    try {
      const achResult = AchievementModel.evaluateAchievements(app.state, app.campaign);
      const newlyUnlocked = AchievementModel.getNewlyUnlockedAchievements(app.unlockedAchievementIds || [], achResult);
      if (newlyUnlocked.length > 0) {
        app.unlockedAchievementIds = achResult.unlockedIds;
        app.pendingAchievementBanner = newlyUnlocked[0];
        SoundEngine?.playAchievementUnlocked?.() || SoundEngine?.playStreak?.();
      }
    } catch {
      // Non-fatal
    }
  }

  function openInventory(targetZone = null) {
    if (app.screen === "challenge" || app.screen === "recovery-challenge") app.answerDraft = app.root.querySelector("[data-answer-input]")?.value || "";
    app.rewardReveal = null;
    app.inventoryReturnScreen = app.screen;
    app.pendingFocusKey = "open-inventory";
    if (targetZone) {
      app.inventoryZone = targetZone;
    }
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
    app.lastSubmittedAnswer = value;
    app.state = ProgressionModel.submitAnswer(app.state, value, AnswerMatcher);
    app.answerFeedback = createSubmissionFeedback(app.state.activeRun?.status === "retry" ? "retry" : "correct");
    if (app.answerFeedback.type === "retry") {
      app.recordMetric("recordQuestionOutcome", app.chapter.chapterId, "retry");
      SoundEngine.playRetry();
    }
    if (!app.state.activeRun && app.state.lastSettlement?.levelId === beforeRun?.levelId) {
      app.recordMetric("recordLevelClear", app.chapter.chapterId);
      SoundEngine.playLevelClear();
    }
    if (app.answerFeedback.type === "correct") {
      const transactions = (app.state.activeRun?.rewardTransactions || app.state.lastSettlement?.rewardTransactions || [])
        .slice(previousRewardCount);
      app.rewardReveal = { transactions };
      const RewardPresentation = app.dependencies?.RewardPresentation || globalThis.RewardPresentation;
      const presentation = RewardPresentation?.getRewardPresentation
        ? RewardPresentation.getRewardPresentation(transactions, (itemId) => GameItemCatalog.getItem(itemId))
        : null;

      if (presentation?.mode === "reveal") {
        SoundEngine?.playQuantumCrateOpen?.() || SoundEngine?.playStreak?.();
      } else if (app.state.activeRun && (app.state.streak >= 3 || transactions.some((t) => t.isRare || t.isStreak))) {
        SoundEngine.playStreak();
      } else if (app.state.activeRun) {
        SoundEngine.playCorrect();
      }
    } else {
      app.rewardReveal = null;
    }
    checkAchievements();
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
    app.lastSubmittedAnswer = value;
    app.state = ProgressionModel.submitChallengeAnswer(app.state, value, AnswerMatcher);
    app.answerFeedback = createSubmissionFeedback(app.state.activeChallengeRun?.status === "retry" ? "retry" : "correct");
    if (app.answerFeedback.type === "retry") {
      app.recordMetric("recordQuestionOutcome", app.chapter.chapterId, "retry");
      SoundEngine.playRetry();
    } else {
      SoundEngine.playCorrect();
    }
    app.persist();
    app.render();
  }

  function handleClick(event) {
    if (event.target.classList?.contains("achievements-modal-overlay")) {
      app.showAchievementsModal = false;
      SoundEngine?.playClick?.();
      app.render();
      return;
    }
    const target = event.target.closest("button");
    if (!target || !app.root.contains(target)) return;
    if (target.matches("[data-sound-toggle], [data-toggle-sound]")) {
      SoundEngine.toggleMute();
      app.render();
      return;
    }
    if (target.matches("[data-open-achievements]") || target.closest("[data-open-achievements]")) {
      app.showAchievementsModal = true;
      SoundEngine?.playClick?.();
      app.render();
      return;
    }
    if (target.matches("[data-close-achievements]") || target.closest("[data-close-achievements]")) {
      app.showAchievementsModal = false;
      SoundEngine?.playClick?.();
      app.render();
      return;
    }
    if (target.matches("[data-dismiss-achievement-banner]") || target.closest("[data-dismiss-achievement-banner]")) {
      app.pendingAchievementBanner = null;
      SoundEngine?.playClick?.();
      app.render();
      return;
    }
    if (target.matches("[data-toggle-scratchpad]") || target.closest("[data-toggle-scratchpad]")) {
      app.scratchpad?.toggle();
      SoundEngine?.playClick?.();
      return;
    }
    if (target.matches("[data-view-certificate]") || target.closest("[data-view-certificate]")) {
      const project = GameItemCatalog.getSuperProject(app.chapter.chapterId);
      const canvas = generateProjectCertificate({ project, chapter: app.chapter, campaign: app.campaign, state: app.state });
      openCertificateModal(canvas, project?.name || app.chapter?.title);
      SoundEngine?.playLevelClear?.();
      return;
    }
    SoundEngine.playClick();
    const toggleFreePracticeBtn = target.closest("[data-toggle-free-practice]");
    const chapterBtn = target.closest("[data-chapter-id]");
    if (toggleFreePracticeBtn) {
      const targetChapterId = toggleFreePracticeBtn.dataset.toggleFreePractice;
      if (targetChapterId === "all") {
        const allActive = app.allChapters.every((c) => app.campaign.chapterStates[c.chapterId]?.freePractice === true);
        const nextVal = !allActive;
        app.campaign = CampaignModel.setAllChaptersFreePractice(app.campaign, app.allChapters, nextVal);
        app.state = app.campaign.chapterStates[app.chapter.chapterId];
      } else {
        const chId = targetChapterId || app.chapter.chapterId;
        const currentState = app.campaign.chapterStates[chId] || (chId === app.chapter.chapterId ? app.state : null);
        const nextVal = !currentState?.freePractice;
        app.campaign = CampaignModel.setChapterFreePractice(app.campaign, app.allChapters, chId, nextVal);
        if (app.campaign.activeChapterId !== app.chapter.chapterId) {
          app.chapter = app.chaptersById[app.campaign.activeChapterId] || app.allChapters[0];
        }
        app.state = app.campaign.chapterStates[app.chapter.chapterId];
      }
      app.persist();
      app.render();
      return;
    } else if (chapterBtn && !chapterBtn.disabled) {
      const nextChapter = app.chaptersById[chapterBtn.dataset.chapterId];
      if (!nextChapter) return;
      if (!app.campaign.unlockedChapterIds.includes(nextChapter.chapterId)) {
        app.campaign = CampaignModel.setChapterFreePractice(app.campaign, app.allChapters, nextChapter.chapterId, true);
      }
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
      return;
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
        SoundEngine.playLaserCircuit?.();
        setTimeout(() => SoundEngine.playAssemblySnap?.(), 100);
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
        const project = GameItemCatalog.getSuperProject(app.chapter.chapterId);
        const isFinal = project && project.finalRecipe.id === recipe.id;
        if (isFinal) {
          app.activeAssemblySequence = { chapterId: app.chapter.chapterId, projectId: project.id, step: 1, hasTriggeredFx: false };
        } else {
          SoundEngine.playLaserCircuit?.();
          setTimeout(() => SoundEngine.playAssemblySnap?.(), 100);
        }
        app.persist();
        app.render();
      }
    } else if (target.matches("[data-replay-assembly]")) {
      app.activeAssemblySequence = { chapterId: app.chapter.chapterId, projectId: target.dataset.replayAssembly, step: 1, hasTriggeredFx: false };
      app.render();
    } else if (target.matches("[data-assembly-back], [data-assembly-close], [data-assembly-skip]")) {
      clearTimeout(app._assemblySequenceTimer);
      app.activeAssemblySequence = null;
      SoundEngine.playClick?.();
      app.render();
    } else if (target.matches("[data-assembly-reignite]")) {
      SoundEngine.playSuperProjectIgnition();
      const modal = app.root.querySelector(".assembly-modal");
      const canvas = modal?.querySelector(".assembly-shockwave-canvas");
      if (canvas && globalThis.AssemblyFX?.triggerAssemblyShockwave) {
        globalThis.AssemblyFX.triggerAssemblyShockwave(canvas, {
          colors: app.activeAssemblySequence?.projectId === "j20-sky-fighter"
            ? ["#ffe600", "#7cf6ff", "#ffffff", "#ff5500"]
            : ["#00ffff", "#8dffff", "#ffffff", "#3b82f6"],
          count: 70
        });
      }
    } else if (target.matches("[data-assembly-finish]")) {
      clearTimeout(app._assemblySequenceTimer);
      app.activeAssemblySequence = null;
      SoundEngine.playCraft();
      app.persist();
      app.render();
    } else if (target.matches("[data-fighter-mode]")) {
      const mode = target.dataset.fighterMode;
      const projectCard = target.closest(".super-project");
      const heroArt = projectCard?.querySelector(":scope > [data-fighter-art], :scope > [data-submersible-art], :scope > [data-project-hero], :scope > img")
        || app.root.querySelector(".super-project > [data-fighter-art], .super-project > [data-submersible-art], .super-project > [data-project-hero], .super-project > img")
        || app.root.querySelector("[data-fighter-art][data-fighter-state='completed'], [data-submersible-art][data-project-state='completed'], [data-project-hero][data-project-state='completed']");
      if (heroArt) {
        if (mode === "overdrive") {
          SoundEngine.playSuperProjectIgnition();
          const overdriveClass = heroArt.dataset.submersibleArt ? "is-deepsea-dive" : "is-supersonic-overdrive";
          heroArt.classList.add(overdriveClass);
          setTimeout(() => heroArt.classList.remove(overdriveClass), 850);
        } else {
          SoundEngine.playClick();
          const current = heroArt.dataset.tacticalMode;
          const nextMode = current === mode ? "normal" : mode;
          heroArt.dataset.tacticalMode = nextMode;
          if (heroArt.tagName === "IMG") {
            heroArt.classList.add("is-photo-pulse");
            setTimeout(() => heroArt.classList.remove("is-photo-pulse"), 850);
          }
          projectCard?.querySelectorAll("[data-fighter-mode]").forEach((btn) => {
            btn.classList.toggle("is-active", btn.dataset.fighterMode === nextMode);
          });
        }
      }
    } else if (target.matches("[data-dismiss-reward-popover]")) {
      app.rewardReveal = null;
      app.render();
    } else if (target.matches("[data-dismiss-crafting-feedback]")) {
      app.craftingFeedback = null;
      SoundEngine.playClick();
      app.render();
    } else if (target.matches("[data-toggle-project-preview]")) {
      const projectId = target.dataset.toggleProjectPreview;
      app.superProjectPreviewMode = app.superProjectPreviewMode === projectId ? null : projectId;
      SoundEngine.playClick();
      if (app.superProjectPreviewMode) {
        SoundEngine.playSuperProjectIgnition?.();
      }
      app.render();
      const heroArt = app.root.querySelector(".super-project > [data-fighter-art], .super-project > [data-submersible-art]")
        || app.root.querySelector("[data-super-project] > [data-fighter-art], [data-super-project] > [data-submersible-art]");
      if (heroArt) {
        heroArt.scrollIntoView({ behavior: "smooth", block: "center" });
        if (app.superProjectPreviewMode) {
          const overdriveClass = heroArt.dataset.submersibleArt ? "is-deepsea-dive" : "is-supersonic-overdrive";
          heroArt.classList.add(overdriveClass);
          setTimeout(() => heroArt.classList.remove(overdriveClass), 900);
        }
      }
    } else if (target.matches("[data-open-inventory], [data-hub-open-inventory]") || target.closest("[data-open-inventory], [data-hub-open-inventory]")) {
      const openBtn = target.matches("[data-open-inventory], [data-hub-open-inventory]") ? target : target.closest("[data-open-inventory], [data-hub-open-inventory]");
      const targetZone = openBtn?.dataset?.openInventoryZone || openBtn?.dataset?.targetZone || null;
      openInventory(targetZone);
    } else if (target.closest("[data-inventory-zone]")) {
      const zoneBtn = target.closest("[data-inventory-zone]");
      const zone = zoneBtn.dataset.inventoryZone;
      if (zone && app.inventoryZone !== zone) {
        app.inventoryZone = zone;
        SoundEngine.playClick?.();
        app.render();
      }
    } else if (target.closest("[data-switch-inventory-zone]")) {
      const portalBtn = target.closest("[data-switch-inventory-zone]");
      const zone = portalBtn.dataset.switchInventoryZone;
      if (zone && app.inventoryZone !== zone) {
        app.inventoryZone = zone;
        SoundEngine.playClick?.();
        app.render();
      }
    } else if (target.matches("[data-close-inventory]")) {
      app.craftingFeedback = null;
      closeInventory();
    } else if (target.matches("[data-switch-inventory-chapter]")) {
      const nextChapter = app.chaptersById[target.dataset.switchInventoryChapter];
      if (!nextChapter || !app.campaign.unlockedChapterIds.includes(nextChapter.chapterId)) return;
      app.campaign = { ...app.campaign, activeChapterId: nextChapter.chapterId, chapterStates: { ...app.campaign.chapterStates, [app.chapter.chapterId]: app.state } };
      app.chapter = nextChapter;
      app.state = app.campaign.chapterStates[app.chapter.chapterId];
      app.superProjectPreviewMode = null;
      app.craftingFeedback = null;
      app.screen = "inventory";
      SoundEngine.playClick();
      app.persist();
      app.render();
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
    } else if (target.matches("[data-open-save-modal]")) {
      app.showSaveModal = true;
      app.saveModalFeedback = null;
      SoundEngine?.playClick?.();
      app.render();
    } else if (target.matches("[data-close-save-modal]") || target.matches("[data-save-modal-overlay]")) {
      app.showSaveModal = false;
      app.saveModalFeedback = null;
      SoundEngine?.playClick?.();
      app.render();
    } else if (target.matches("[data-export-save-file]")) {
      try {
        const payload = StorageAdapter?.exportSavePayload
          ? StorageAdapter.exportSavePayload(app.campaign)
          : { timestamp: new Date().toISOString(), campaign: app.campaign };
        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const dateStr = new Date().toISOString().slice(0, 10);
        a.download = `mathlearning_save_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        app.saveModalFeedback = { type: "success", text: "已生成并下载战役档案备份文件！" };
        SoundEngine?.playLevelClear?.();
      } catch (err) {
        app.saveModalFeedback = { type: "error", text: "导出档案失败：" + (err?.message || "未知异常") };
      }
      app.render();
    } else if (target.matches("[data-copy-save-code]")) {
      try {
        const payload = StorageAdapter?.exportSavePayload
          ? StorageAdapter.exportSavePayload(app.campaign)
          : { timestamp: new Date().toISOString(), campaign: app.campaign };
        const code = StorageAdapter?.encodeSaveCode ? StorageAdapter.encodeSaveCode(payload) : btoa(encodeURIComponent(JSON.stringify(payload)));
        if (navigator?.clipboard?.writeText) {
          navigator.clipboard.writeText(code).then(() => {
            app.saveModalFeedback = { type: "success", text: "档案密钥（Base64）已复制到剪贴板！" };
            SoundEngine?.playClick?.();
            app.render();
          }).catch(() => {
            fallbackCopy(code);
          });
        } else {
          fallbackCopy(code);
        }
      } catch (err) {
        app.saveModalFeedback = { type: "error", text: "生成密钥失败：" + (err?.message || "未知异常") };
        app.render();
      }
    } else if (target.matches("[data-confirm-import-save]")) {
      const rawText = app.root.querySelector("[data-import-save-text]")?.value?.trim();
      if (!rawText) {
        app.saveModalFeedback = { type: "error", text: "请先粘贴档案 JSON 内容或 Base64 密钥，或选择档案文件。" };
        app.render();
        return;
      }
      applyImportData(rawText);
    } else if (target.matches("[data-restore-session-backup]")) {
      try {
        const ok = StorageAdapter?.restoreSessionBackup
          ? StorageAdapter.restoreSessionBackup(() => globalThis.sessionStorage || globalThis.localStorage, app.saveStore)
          : false;
        if (ok) {
          const raw = app.saveStore?.load?.();
          if (raw) {
            const parsed = JSON.parse(raw);
            const restoredCampaign = CampaignModel.deserializeCampaign(parsed);
            app.campaign = restoredCampaign;
            app.state = restoredCampaign.chapterStates[app.chapter.chapterId] || Object.values(restoredCampaign.chapterStates)[0];
            app.persist();
            app.saveModalFeedback = { type: "success", text: "已成功从会话快照恢复先前进度！" };
            SoundEngine?.playLevelClear?.();
          } else {
            app.saveModalFeedback = { type: "error", text: "快照已恢复，但加载存档失败。" };
          }
        } else {
          app.saveModalFeedback = { type: "error", text: "未检测到可恢复的会话快照。" };
        }
      } catch (err) {
        app.saveModalFeedback = { type: "error", text: "恢复快照失败：" + (err?.message || "未知异常") };
      }
      app.render();
    }
  }

  function fallbackCopy(code) {
    const textarea = app.root.querySelector("[data-import-save-text]");
    if (textarea) {
      textarea.value = code;
      textarea.select();
    }
    app.saveModalFeedback = { type: "success", text: "档案密钥已生成并填入下方文本框，请手动复制。" };
    app.render();
  }

  function applyImportData(rawData) {
    try {
      let candidate = rawData;
      if (typeof rawData === "string") {
        if (!rawData.startsWith("{") && !rawData.startsWith("[")) {
          const decoded = StorageAdapter?.decodeSaveCode?.(rawData);
          if (decoded) candidate = decoded;
        }
      }
      const validation = StorageAdapter?.validateAndImportSave
        ? StorageAdapter.validateAndImportSave(candidate, app.allChapters)
        : { valid: false, error: "缺少 StorageAdapter" };
      if (!validation.valid) {
        app.saveModalFeedback = { type: "error", text: "档案校验未通过：" + (validation.error || "数据格式不匹配") };
        app.render();
        return;
      }

      // 先建立当前进度的灾备快照
      StorageAdapter?.createSessionBackup?.(() => globalThis.sessionStorage || globalThis.localStorage, app.saveStore);

      app.campaign = validation.campaign;
      if (app.campaign.chapterStates[app.chapter.chapterId]) {
        app.state = app.campaign.chapterStates[app.chapter.chapterId];
      } else {
        const firstKey = Object.keys(app.campaign.chapterStates)[0];
        if (firstKey && app.chaptersById[firstKey]) {
          app.chapter = app.chaptersById[firstKey];
          app.state = app.campaign.chapterStates[firstKey];
        }
      }
      app.campaign = CampaignModel.synchronizeInventory(app.campaign, app.allChapters, app.state.inventory);
      app.state = app.campaign.chapterStates[app.chapter.chapterId];
      app.persist();
      app.saveModalFeedback = { type: "success", text: "档案验证通过！已成功恢复战略部署与科研成果。" };
      SoundEngine?.playLevelClear?.();
    } catch (err) {
      app.saveModalFeedback = { type: "error", text: "导入失败：" + (err?.message || "数据损坏") };
    }
    app.render();
  }

  function handleChange(event) {
    const fileInput = event.target.closest?.("[data-import-save-file]");
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (content && typeof content === "string") {
          const textarea = app.root.querySelector("[data-import-save-text]");
          if (textarea) textarea.value = content;
          applyImportData(content);
        }
      };
      reader.onerror = () => {
        app.saveModalFeedback = { type: "error", text: "读取文件失败，请检查文件权限。" };
        app.render();
      };
      reader.readAsText(file);
    }
  }

  function handleKeydown(event) {
    if (event.key === "Enter" && event.target.matches?.("[data-answer-input]") && app.screen === "challenge" && app.state.activeRun?.status === "active") submitCurrentAnswer();
    if (event.key === "Enter" && event.target.matches?.("[data-answer-input]") && app.screen === "recovery-challenge" && app.state.activeChallengeRun?.status === "active") submitCurrentRecoveryAnswer();
    if ((event.key === "d" || event.key === "D") && !["INPUT", "TEXTAREA"].includes(event.target.tagName) && app.screen === "challenge") {
      app.scratchpad?.toggle();
      return;
    }
    if (event.key === "Escape" && app.showSaveModal) {
      app.showSaveModal = false;
      app.saveModalFeedback = null;
      SoundEngine?.playClick?.();
      app.render();
      return;
    }
    if (event.key === "Escape" && app.showAchievementsModal) {
      app.showAchievementsModal = false;
      SoundEngine.playClick?.();
      app.render();
      return;
    }
    if (event.key === "Escape" && app.activeAssemblySequence) {
      clearTimeout(app._assemblySequenceTimer);
      app.activeAssemblySequence = null;
      SoundEngine.playClick?.();
      app.render();
      return;
    }
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


  return { handleClick, handleChange, handleKeydown };
}
