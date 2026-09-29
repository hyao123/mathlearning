import { CHINESE_NUMERALS, appendItem, appendRewardOutcome, appendText, createFighterArt, createSubmersibleArt, createItemIcon, createProjectHeroArt, getLevelNumber, createAssemblySequenceModal, createDossierCard } from "./gameAppView.js";
import KnowledgeConstellationView from "./knowledgeConstellationView.js";
import KnowledgeTopologyAdapter from "./knowledgeTopologyAdapter.js";
import KnowledgeMotionExplainer from "./knowledgeMotionExplainer.js";
import { generateProjectCertificate, openCertificateModal } from "./certificateGenerator.js";
import { createScratchpad } from "./scratchpadCanvas.js";

export function createGameRenderers(app) {
  const { GameItemCatalog, InventoryModel, LevelRewardConfig, RewardPresentation, ChapterMissionModel, ProgressionModel, ChallengeModel, ContentVersionModel, SoundEngine, QuestionVisualizer, HintScaffold, AchievementModel, StorageAdapter, MathThinkingMethods } = app.dependencies;
  function renderHeader(parent, eyebrow, title, allowInventory = true) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const header = document.createElement("header");
    header.className = "quest-game__header";
    const heading = document.createElement("div");
    appendText(heading, "p", eyebrow, "quest-game__eyebrow");
    appendText(heading, "h1", title);
    header.append(heading);

    const controls = document.createElement("div");
    if (allowInventory) {
      const soundMuted = SoundEngine?.isMuted?.() || false;
      const soundButton = appendText(controls, "button", soundMuted ? "🔇" : "🔊", "pixel-button pixel-button--sound");
      soundButton.type = "button";
      soundButton.dataset.soundToggle = "";
      soundButton.title = soundMuted ? "开启音效" : "静音";
      soundButton.setAttribute("aria-label", soundMuted ? "开启音效" : "静音");

      const achButton = appendText(controls, "button", "🎖️ 军功勋章", "pixel-button pixel-button--achievements");
      achButton.type = "button";
      achButton.dataset.openAchievements = "";
      achButton.title = "查看军功勋章与成就陈列馆";
      achButton.setAttribute("aria-label", "查看军功勋章与成就陈列馆");

      const saveButton = appendText(controls, "button", "💾 档案", "pixel-button pixel-button--save");
      saveButton.type = "button";
      saveButton.dataset.openSaveModal = "";
      saveButton.title = "指挥官远征档案管理与备份恢复";
      saveButton.setAttribute("aria-label", "指挥官远征档案管理与备份恢复");

      const button = appendText(controls, "button", "🎒 军备总装", "pixel-button pixel-button--inventory");
      button.type = "button";
      button.dataset.openInventory = "";
      button.dataset.focusKey = "open-inventory";
      button.setAttribute("aria-label", "打开军备总装");
    }
    header.append(controls);
    parent.append(header);
  }

  function renderAchievementsModal(parent) {
    const { state, campaign } = app;
    const evalResult = AchievementModel?.evaluateAchievements
      ? AchievementModel.evaluateAchievements(state, campaign)
      : { list: [], totalPoints: 0, maxPoints: 100, unlockCount: 0, totalCount: 10 };

    const overlay = document.createElement("div");
    overlay.className = "achievements-modal-overlay";
    overlay.dataset.achievementsModalOverlay = "";

    const modal = document.createElement("div");
    modal.className = "achievements-modal";
    modal.dataset.achievementsModal = "";

    const modalHeader = document.createElement("div");
    modalHeader.className = "achievements-modal__header";

    const titleGroup = document.createElement("div");
    titleGroup.className = "achievements-modal__title-group";
    appendText(titleGroup, "span", "🎖️ 战略科研与国防工程荣誉", "achievements-modal__eyebrow");
    appendText(titleGroup, "h2", "军功勋章与成就陈列馆", "achievements-modal__title");
    modalHeader.append(titleGroup);

    const statsBadge = document.createElement("div");
    statsBadge.className = "achievements-modal__stats";
    statsBadge.innerHTML = `
      <span class="achievements-stat-pill">⭐ 功勋点：<strong>${evalResult.totalPoints}</strong> / ${evalResult.maxPoints}</span>
      <span class="achievements-stat-pill">🏅 已授勋：<strong>${evalResult.unlockCount}</strong> / ${evalResult.totalCount}</span>
    `;
    modalHeader.append(statsBadge);

    const closeBtn = appendText(modalHeader, "button", "✕", "achievements-modal__close-btn");
    closeBtn.type = "button";
    closeBtn.dataset.closeAchievements = "";
    closeBtn.setAttribute("aria-label", "关闭勋章陈列馆");
    modal.append(modalHeader);

    const list = document.createElement("div");
    list.className = "achievements-modal__grid";
    evalResult.list.forEach((ach) => {
      const card = document.createElement("article");
      card.className = `achievement-card ${ach.unlocked ? "is-unlocked" : "is-locked"} ${ach.badgeClass || ""}`;
      card.dataset.achievementId = ach.id;
      card.dataset.unlocked = String(ach.unlocked);

      const iconWrap = document.createElement("div");
      iconWrap.className = "achievement-card__icon-wrap";
      appendText(iconWrap, "span", ach.icon || "🎖️", "achievement-card__icon");
      card.append(iconWrap);

      const content = document.createElement("div");
      content.className = "achievement-card__content";

      const topRow = document.createElement("div");
      topRow.className = "achievement-card__top-row";
      appendText(topRow, "strong", ach.title, "achievement-card__name");
      appendText(topRow, "span", `+${ach.points} PT`, "achievement-card__points");
      content.append(topRow);

      appendText(content, "p", ach.description, "achievement-card__desc");

      const progRow = document.createElement("div");
      progRow.className = "achievement-card__progress-row";
      const pct = ach.max ? Math.min(100, Math.round((ach.current / ach.max) * 100)) : 0;
      progRow.innerHTML = `
        <div class="achievement-card__bar"><div class="achievement-card__fill" style="width: ${ach.unlocked ? 100 : pct}%;"></div></div>
        <span class="achievement-card__status">${ach.unlocked ? "✨ 已授勋" : `${ach.current}/${ach.max}`}</span>
      `;
      content.append(progRow);
      card.append(content);
      list.append(card);
    });

    modal.append(list);
    overlay.append(modal);
    parent.append(overlay);
  }

  function renderSaveModal(parent) {
    const { state, campaign, chapter, saveStore } = app;
    const overlay = document.createElement("div");
    overlay.className = "save-modal-overlay";
    overlay.dataset.saveModalOverlay = "";

    const modal = document.createElement("div");
    modal.className = "save-modal";
    modal.dataset.saveModal = "";

    const modalHeader = document.createElement("div");
    modalHeader.className = "save-modal__header";

    const titleGroup = document.createElement("div");
    titleGroup.className = "save-modal__title-group";
    appendText(titleGroup, "span", "💾 指挥官数据安全中心", "save-modal__eyebrow");
    appendText(titleGroup, "h2", "远征档案备份与恢复", "save-modal__title");
    modalHeader.append(titleGroup);

    const closeBtn = appendText(modalHeader, "button", "✕", "save-modal__close-btn");
    closeBtn.type = "button";
    closeBtn.dataset.closeSaveModal = "";
    closeBtn.setAttribute("aria-label", "关闭档案管理窗口");
    modal.append(modalHeader);

    const body = document.createElement("div");
    body.className = "save-modal__body";

    const allUnlockedCount = Object.values(campaign?.chapterStates || {}).reduce((sum, chState) => {
      return sum + (chState?.unlockedLevelIds?.length || 0);
    }, 0);
    const materialTypesCount = Object.keys(state?.inventory || {}).length;

    const statsCard = document.createElement("div");
    statsCard.className = "save-modal__stats-card";
    statsCard.innerHTML = `
      <div class="save-modal__stat-item">
        <span class="save-modal__stat-label">现役战役</span>
        <strong class="save-modal__stat-value">${chapter?.title || "启程试炼"}</strong>
      </div>
      <div class="save-modal__stat-item">
        <span class="save-modal__stat-label">已解锁关卡</span>
        <strong class="save-modal__stat-value text-gold">${allUnlockedCount} / 108 关</strong>
      </div>
      <div class="save-modal__stat-item">
        <span class="save-modal__stat-label">战备物资种类</span>
        <strong class="save-modal__stat-value text-cyan">${materialTypesCount} 种</strong>
      </div>
    `;
    body.append(statsCard);

    if (app.saveModalFeedback) {
      const fb = document.createElement("div");
      fb.className = `save-modal__feedback is-${app.saveModalFeedback.type || "info"}`;
      fb.textContent = app.saveModalFeedback.text;
      body.append(fb);
    }

    const exportSec = document.createElement("div");
    exportSec.className = "save-modal__section";
    appendText(exportSec, "h3", "📥 安全导出与备份");
    appendText(exportSec, "p", "将当前所有关卡记录、三星成就、战略材料及工程零件完整导出为离线备份。", "save-modal__hint");

    const exportBtns = document.createElement("div");
    exportBtns.className = "save-modal__actions";

    const exportFileBtn = appendText(exportBtns, "button", "📥 导出档案文件 (.json)", "pixel-button pixel-button--action");
    exportFileBtn.type = "button";
    exportFileBtn.dataset.exportSaveFile = "";

    const copyCodeBtn = appendText(exportBtns, "button", "📋 复制档案密钥 (Base64)", "pixel-button pixel-button--quiet");
    copyCodeBtn.type = "button";
    copyCodeBtn.dataset.copySaveCode = "";

    exportSec.append(exportBtns);
    body.append(exportSec);

    const importSec = document.createElement("div");
    importSec.className = "save-modal__section";
    appendText(importSec, "h3", "📤 恢复远征进度");
    appendText(importSec, "p", "从已导出的 .json 档案文件或 Base64 密钥恢复战役进度（导入前会自动建立会话快照）。", "save-modal__hint");

    const fileLabel = document.createElement("label");
    fileLabel.className = "save-modal__file-picker";
    fileLabel.innerHTML = `
      <span class="pixel-button pixel-button--quiet">📂 选择 .json 档案文件</span>
      <input type="file" accept=".json,application/json" data-import-save-file style="display:none;" />
    `;
    importSec.append(fileLabel);

    const textarea = document.createElement("textarea");
    textarea.className = "save-modal__textarea";
    textarea.dataset.importSaveText = "";
    textarea.placeholder = "或在此直接粘贴导出的档案 JSON 内容 / Base64 密钥...";
    importSec.append(textarea);

    const importActionRow = document.createElement("div");
    importActionRow.className = "save-modal__actions";

    const confirmImportBtn = appendText(importActionRow, "button", "⚡ 验证并载入进度", "pixel-button pixel-button--accent");
    confirmImportBtn.type = "button";
    confirmImportBtn.dataset.confirmImportSave = "";

    const sessionRestoreBtn = appendText(importActionRow, "button", "🔄 从会话快照恢复", "pixel-button pixel-button--quiet");
    sessionRestoreBtn.type = "button";
    sessionRestoreBtn.dataset.restoreSessionBackup = "";
    sessionRestoreBtn.title = "若因清理缓存导致异常，可尝试从当前浏览器会话镜像恢复";

    importSec.append(importActionRow);
    body.append(importSec);

    modal.append(body);
    overlay.append(modal);
    parent.append(overlay);
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
    renderAssemblySequence(root);
    if (app.showAchievementsModal) {
      renderAchievementsModal(root);
    }
    if (app.showSaveModal) {
      renderSaveModal(root);
    }
  }

  function renderAssemblySequence(parent) {
    const { root, chapter, state, activeAssemblySequence } = app;
    if (!activeAssemblySequence) return;
    const project = GameItemCatalog.getSuperProject(activeAssemblySequence.chapterId || activeAssemblySequence.projectId || chapter.chapterId);
    if (!project) return;
    const parts = (project.partRecipes || []).map((r) => GameItemCatalog.getItem(r.output.itemId)).filter(Boolean);
    const chapterNumber = (chapter.chapterId.match(/\d+/) || ["01"])[0];

    const modal = createAssemblySequenceModal(project, parts, state, {
      chapterNumber,
      step: activeAssemblySequence.step || 1
    });

    const step = activeAssemblySequence.step || 1;
    const stage = modal.querySelector(".assembly-modal__stage");
    if (stage) stage.dataset.assemblyStage = String(step);

    const stepPills = modal.querySelectorAll("[data-assembly-step-pill]");
    stepPills.forEach((pill) => {
      const pillStep = Number(pill.dataset.assemblyStepPill);
      if (pillStep === step) pill.classList.add("is-active");
      else if (pillStep < step) pill.classList.add("is-completed");
    });

    parent.append(modal);
    modal.querySelector(".assembly-modal__back-btn")?.focus?.({ preventScroll: true });

    const AssemblyFXModule = globalThis.AssemblyFX;
    const SoundEngineModule = globalThis.SoundEngine || SoundEngine;

    if (!activeAssemblySequence.hasTriggeredFx) {
      activeAssemblySequence.hasTriggeredFx = true;
      if (step === 1) {
        setTimeout(() => SoundEngineModule?.playAssemblySnap?.(), 450);
      } else if (step === 2) {
        SoundEngineModule?.playLaserCircuit?.();
      } else if (step === 3) {
        SoundEngineModule?.playSuperProjectIgnition?.();
        const canvas = modal.querySelector(".assembly-shockwave-canvas");
        if (canvas && AssemblyFXModule?.triggerAssemblyShockwave) {
          AssemblyFXModule.triggerAssemblyShockwave(canvas, {
            colors: activeAssemblySequence.projectId === "j20-sky-fighter"
              ? ["#ffe600", "#7cf6ff", "#ffffff", "#ff5500"]
              : ["#00ffff", "#8dffff", "#ffffff", "#3b82f6"],
            count: 65
          });
        }
      }
    }

    if (step === 4) {
      const card = modal.querySelector(".assembly-dossier-card");
      if (card && AssemblyFXModule?.bindCardTilt) {
        AssemblyFXModule.bindCardTilt(card);
      }
    }

    if (step < 4 && !activeAssemblySequence.isPaused) {
      clearTimeout(app._assemblySequenceTimer);
      const stepDurations = { 1: 950, 2: 950, 3: 1150 };
      const duration = stepDurations[step] || 1000;
      app._assemblySequenceTimer = setTimeout(() => {
        if (app.activeAssemblySequence && app.activeAssemblySequence.step === step) {
          app.activeAssemblySequence = {
            ...app.activeAssemblySequence,
            step: step + 1,
            hasTriggeredFx: false
          };
          app.render();
        }
      }, duration);
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

  function renderAchievementBanner(parent) {
    if (!app.pendingAchievementBanner) return;
    const banner = app.pendingAchievementBanner;
    const bannerEl = document.createElement("aside");
    bannerEl.className = "achievement-unlocked-banner";
    bannerEl.dataset.achievementBanner = "";
    bannerEl.setAttribute("role", "alert");
    bannerEl.innerHTML = `
      <div class="achievement-unlocked-banner__badge">
        <span class="achievement-unlocked-banner__icon">${banner.icon || "🎖️"}</span>
      </div>
      <div class="achievement-unlocked-banner__content">
        <p class="achievement-unlocked-banner__label">🎖️ 荣获全新军功勋章！</p>
        <h3 class="achievement-unlocked-banner__title">${banner.title || "功勋卓著"}</h3>
        <p class="achievement-unlocked-banner__desc">${banner.description || ""}</p>
      </div>
      <button type="button" class="achievement-unlocked-banner__close" data-dismiss-achievement-banner="" aria-label="关闭勋章提醒">✕</button>
    `;
    parent.prepend(bannerEl);
  }

  function renderRewardPopover(parent) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const presentation = getRewardPresentation();
    const { transactions } = presentation;
    if (!transactions.length) return;
    const overlay = document.createElement("aside");
    overlay.className = `reward-popover reward-popover--${presentation.mode}`;
    if (presentation.mode === "reveal") {
      overlay.dataset.rewardPopover = "";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
    } else {
      overlay.dataset.rewardToast = "";
      overlay.setAttribute("role", "status");
    }

    const contentBox = document.createElement("div");
    contentBox.className = presentation.mode === "reveal" ? "reward-popover__card" : "reward-toast__content";

    if (presentation.mode === "reveal") {
      const crateVisual = document.createElement("div");
      crateVisual.className = "quantum-crate-reveal";
      const hasStreakChest = presentation.hasStreakChest;
      const isRare = transactions.some((t) => t.isRare || t.rarity === "rare" || t.rarity === "epic" || t.rarity === "legendary");
      const rarityClass = transactions.some((t) => t.rarity === "legendary" || t.rarity === "mythic")
        ? "is-legendary-glow"
        : transactions.some((t) => t.rarity === "epic")
          ? "is-epic-glow"
          : isRare
            ? "is-rare-glow"
            : "";
      crateVisual.innerHTML = `
        <div class="quantum-crate-aura ${rarityClass} ${hasStreakChest ? "is-streak-wings" : ""}">
          <div class="quantum-crate-core">⬡</div>
          <div class="quantum-crate-rings"></div>
        </div>
        ${hasStreakChest ? `<div class="quantum-crate-banner">🔥 战术连胜达成！专属量子补给箱空投成功</div>` : ""}
      `;
      contentBox.append(crateVisual);
    }

    appendText(contentBox, "p", presentation.mode === "reveal" ? "特别补给揭晓" : "材料已入库", "quest-game__eyebrow");
    appendText(contentBox, "h2", presentation.mode === "reveal" ? (presentation.hasStreakChest ? "🔥 连胜空投战备补给！" : "获得特别补给！") : "材料已装进背包", "reward-popover__title");
    if (presentation.mode === "toast") {
      appendText(contentBox, "p", "🎯 战利品已同步至军备总装库，稳步推进大国重器研发！", "reward-popover__subcopy");
    }

    const rewards = document.createElement("div");
    rewards.className = "reward-popover__items";
    transactions.forEach((transaction) => {
      const item = GameItemCatalog.getItem(transaction.itemId);
      if (item) appendRewardOutcome(rewards, item, transaction, "item-chip reward-popover__item");
    });
    contentBox.append(rewards);

    if (presentation.mode === "reveal") {
      const button = appendText(contentBox, "button", "继续前进", "pixel-button pixel-button--primary reward-popover__action");
      button.type = "button";
      button.dataset.dismissRewardPopover = "";
    }

    overlay.append(contentBox);
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
    if (completion.isFinalProjectComplete) {
      const certBtn = appendText(
        finale,
        "button",
        "📜 领奖台 · 特级总装荣誉证书",
        "pixel-button pixel-button--secondary chapter-finale__cert-btn"
      );
      certBtn.type = "button";
      certBtn.dataset.viewCertificate = project?.id || "";
      certBtn.title = "查看并下载大国重器特级总装工程师结项证书";
    }
    parent.append(finale);
  }

  function renderSuperProjectQuickHub(parent) {
    const { chapter, state } = app;
    const project = GameItemCatalog.getSuperProject(chapter.chapterId);
    if (!project) return;
    const isCompleted = (state.inventory[project.id] || 0) > 0;
    const hub = document.createElement("section");
    hub.className = "super-project-hub";
    hub.dataset.superProjectHub = project.id;

    const left = document.createElement("div");
    left.className = "super-project-hub__left";
    appendText(left, "span", "🎖️ 共和国大国重器 · 军备战略总装", "super-project-hub__tag");
    appendText(left, "h2", `${project.name} · ${isCompleted ? "已完工交付" : "在建总装中"}`, "super-project-hub__title");
    appendText(left, "p", isCompleted ? "已列装入库，双发矢量与等离子马赫环就绪。随时点击试车检视！" : "攻克 12 个数学关卡收集精炼材料，拼装 4 大核心部件，最终合体起飞！", "super-project-hub__desc");
    hub.append(left);

    const right = document.createElement("div");
    right.className = "super-project-hub__actions";
    
    const openInvBtn = appendText(right, "button", "🎒 军备总装车间", "pixel-button pixel-button--primary super-project-hub__btn");
    openInvBtn.type = "button";
    openInvBtn.dataset.hubOpenInventory = "";

    const previewBtn = appendText(
      right,
      "button",
      isCompleted
        ? "🚀 试车巡航 / 检视大典"
        : `🚀 试车巡航 / 检视${project.id === "j20-sky-fighter" ? "成品战机" : project.name}`,
      "pixel-button pixel-button--secondary super-project-hub__btn"
    );
    previewBtn.type = "button";
    previewBtn.dataset.replayAssembly = project.id;

    hub.append(right);
    parent.append(hub);
  }

  function renderCampaignOverview(parent) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const overview = document.createElement("section");
    overview.className = "campaign-overview";
    overview.dataset.campaignOverview = "";

    const header = document.createElement("div");
    header.className = "campaign-overview__header";

    const titleWrap = document.createElement("div");
    titleWrap.className = "campaign-overview__title-wrap";
    const chapterCount = CHINESE_NUMERALS[allChapters.length] || String(allChapters.length);
    appendText(titleWrap, "p", `${chapterCount}章数学远征 · 章节与自由答题`, "quest-game__eyebrow");
    appendText(titleWrap, "p", "每章均可开启自由答题开关，跳过前置直接刷题与自主选关", "campaign-overview__subtitle");
    header.append(titleWrap);

    const allFreePractice = allChapters.every((c) => campaign.chapterStates[c.chapterId]?.freePractice === true);
    const bulkToggleBtn = document.createElement("button");
    bulkToggleBtn.type = "button";
    bulkToggleBtn.className = `pixel-button ${allFreePractice ? "is-active campaign-overview__bulk-toggle--active" : "pixel-button--quiet"} campaign-overview__bulk-toggle`;
    bulkToggleBtn.dataset.toggleFreePractice = "all";
    bulkToggleBtn.setAttribute("role", "switch");
    bulkToggleBtn.setAttribute("aria-checked", String(allFreePractice));
    bulkToggleBtn.setAttribute("title", allFreePractice ? "点击恢复主线规则：按顺序通过超级工程逐步解锁" : "点击一键开启全部章节的自由答题模式（直接解锁全部9章所有关卡）");
    bulkToggleBtn.textContent = allFreePractice ? "🔒 关闭全部自由答题" : "⚡ 一键开启全部章节自由答题";
    header.append(bulkToggleBtn);
    overview.append(header);

    const grid = document.createElement("div");
    grid.className = "campaign-overview__grid";

    allChapters.forEach((candidate, index) => {
      const candidateState = campaign.chapterStates[candidate.chapterId];
      const completion = ProgressionModel.getChapterCompletion(candidateState, candidate);
      const isFreePractice = candidateState?.freePractice === true;
      const unlocked = campaign.unlockedChapterIds.includes(candidate.chapterId);
      const isActive = candidate.chapterId === chapter.chapterId;
      const hasActiveRun = Boolean(state.activeRun || state.activeChallengeRun);

      const card = document.createElement("article");
      card.className = `campaign-chapter ${isActive ? "is-active-chapter" : ""} ${isFreePractice ? "is-free-practice" : ""}`;
      card.dataset.chapterId = candidate.chapterId;
      card.dataset.chapterStatus = isActive ? "active" : unlocked ? "unlocked" : "locked";
      if (isFreePractice) card.dataset.freePractice = "true";

      const cardHeader = document.createElement("div");
      cardHeader.className = "campaign-chapter__header";
      appendText(cardHeader, "span", `第 ${index + 1} 章`, "campaign-chapter__number");

      const badge = document.createElement("span");
      badge.className = `campaign-chapter__badge ${
        isActive
          ? "campaign-chapter__badge--active"
          : isFreePractice
          ? "campaign-chapter__badge--free"
          : unlocked
          ? "campaign-chapter__badge--unlocked"
          : "campaign-chapter__badge--locked"
      }`;
      badge.textContent = isActive
        ? "正在进行"
        : isFreePractice
        ? "自由答题"
        : unlocked
        ? "已解锁"
        : "主线锁定";
      cardHeader.append(badge);
      card.append(cardHeader);

      const entryBtn = document.createElement("button");
      entryBtn.type = "button";
      entryBtn.className = "campaign-chapter__entry";
      entryBtn.dataset.chapterId = candidate.chapterId;
      entryBtn.disabled = hasActiveRun;
      entryBtn.title = isActive
        ? `当前正在第 ${index + 1} 章`
        : unlocked
        ? `点击进入第 ${index + 1} 章：${candidate.name}`
        : `点击开启自由答题并进入第 ${index + 1} 章：${candidate.name}`;

      appendText(entryBtn, "strong", candidate.name, "campaign-chapter__name");

      let progressText = "";
      if (isFreePractice) {
        progressText = `🔓 自由答题模式（12关全部可答 · 已完成 ${completion.clearedLevels} 关）`;
      } else if (unlocked) {
        progressText = `主线模式：${completion.clearedLevels} / ${completion.totalLevels} 关`;
      } else {
        progressText = "点击卡片或开启开关即可直接进入自由答题";
      }
      appendText(entryBtn, "small", progressText, "campaign-chapter__progress");
      card.append(entryBtn);

      const footer = document.createElement("div");
      footer.className = "campaign-chapter__footer";

      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = `pixel-button free-practice-toggle campaign-chapter__toggle ${
        isFreePractice ? "is-active campaign-chapter__toggle--active" : "pixel-button--quiet"
      }`;
      toggleBtn.dataset.toggleFreePractice = candidate.chapterId;
      toggleBtn.setAttribute("role", "switch");
      toggleBtn.setAttribute("aria-checked", String(isFreePractice));
      toggleBtn.setAttribute(
        "title",
        isFreePractice
          ? `第 ${index + 1} 章自由答题已开启：所有关卡可自由选关挑战，点击可关闭`
          : `点击开启第 ${index + 1} 章自由答题：跳过前置要求，所有关卡自由畅玩`
      );
      toggleBtn.textContent = isFreePractice
        ? "🔓 自由答题：开"
        : unlocked
        ? "🔒 自由答题：关"
        : "⚡ 开启自由答题";
      footer.append(toggleBtn);
      card.append(footer);

      grid.append(card);
    });

    overview.append(grid);
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

  function renderMindCompassBanner(parent, level, chapter) {
    const topo = KnowledgeTopologyAdapter.getModuleTopology(level.moduleId, chapter.chapterId);
    const strand = KnowledgeTopologyAdapter.getStrand(topo.strand);
    const banner = document.createElement("aside");
    banner.className = "mind-compass-banner";
    banner.style.setProperty("--strand-color", strand.color);
    banner.style.setProperty("--strand-accent", strand.accentColor);
    banner.setAttribute("aria-label", `${level.title} 思维罗盘战术简报`);

    const header = document.createElement("div");
    header.className = "mind-compass-banner__header";
    appendText(header, "span", `${strand.icon} ${strand.title} · ${topo.learningBridge?.methodSummary?.label || "核心方法"}`, "mind-compass-banner__badge");
    appendText(header, "small", `核心思维动作：${topo.learningBridge?.methodSummary?.description || "专项建模求解"}`, "mind-compass-banner__hint");
    banner.append(header);

    const steps = document.createElement("div");
    steps.className = "mind-compass-banner__steps";

    const pStep = document.createElement("div");
    pStep.className = "mind-compass-step";
    appendText(pStep, "div", "💎 前置基石", "mind-compass-step__tag");
    appendText(pStep, "p", topo.learningBridge?.prerequisiteSummary || "熟练运用基础数量与逻辑关系", "mind-compass-step__text");
    steps.append(pStep);

    const mStep = document.createElement("div");
    mStep.className = "mind-compass-step";
    appendText(mStep, "div", "⚔️ 本关思维", "mind-compass-step__tag");
    appendText(mStep, "p", topo.learningBridge?.methodSummary?.description || "识别核心变量建立模型", "mind-compass-step__text");
    steps.append(mStep);

    const tStep = document.createElement("div");
    tStep.className = "mind-compass-step";
    appendText(tStep, "div", "🔭 实战迁移", "mind-compass-step__tag");
    const transferTarget = topo.learningBridge?.transferTargets?.[0];
    appendText(tStep, "p", transferTarget ? transferTarget.reason : "为后续复杂综合模型提供坚实算法支撑", "mind-compass-step__text");
    steps.append(tStep);

    banner.append(steps);

    if (topo.engineeringAffinity) {
      const tech = document.createElement("div");
      tech.className = "mind-compass-tech-line";
      appendText(tech, "span", `🚀 【${chapter.name}】工程算力驱动：${topo.engineeringAffinity.subsystem} — ${topo.engineeringAffinity.algorithmRole}`);
      banner.append(tech);
    }

    // 动态动图解密抽屉（拒绝文字说教，动图秒懂）
    const motionBtn = document.createElement("button");
    motionBtn.type = "button";
    motionBtn.className = "mind-compass-motion-btn";
    motionBtn.innerHTML = "🎬 观看解题动图";
    motionBtn.setAttribute("aria-label", "打开解题动态演示动图");
    motionBtn.setAttribute("aria-expanded", "false");

    const motionDrawer = document.createElement("div");
    motionDrawer.className = "mind-compass-motion-drawer";
    motionDrawer.hidden = true;

    motionBtn.addEventListener("click", () => {
      const isExpanded = !motionDrawer.hidden;
      motionDrawer.hidden = isExpanded;
      motionBtn.setAttribute("aria-expanded", String(!isExpanded));
      motionBtn.innerHTML = isExpanded ? "🎬 观看解题动图" : "收起解题动图 🔼";
      if (!isExpanded && !motionDrawer.hasChildNodes()) {
        const motionCard = KnowledgeMotionExplainer.renderMotionCard(
          { methodId: level.moduleId, prompt: level.title, method: topo.learningBridge?.methodSummary?.label },
          { compact: true, title: `${topo.learningBridge?.methodSummary?.label || level.title} · 动态模型` }
        );
        motionDrawer.append(motionCard);
      }
    });

    banner.append(motionBtn, motionDrawer);
    parent.append(banner);
  }

  function renderSettlementMindCard(parent, level, chapter) {
    const topo = KnowledgeTopologyAdapter.getModuleTopology(level.moduleId, chapter.chapterId);
    const strand = KnowledgeTopologyAdapter.getStrand(topo.strand);
    const card = document.createElement("article");
    card.className = "settlement-mind-card";
    card.style.setProperty("--strand-color", strand.color);

    const methodLabel = topo.learningBridge?.methodSummary?.label || "思维建模";
    appendText(card, "h3", `✨ 思维武器点亮 · 【${methodLabel}】`, "settlement-mind-card__title");
    appendText(card, "p", topo.learningBridge?.methodSummary?.description || "掌握本关核心思维模型", "settlement-mind-card__desc");

    if (topo.engineeringAffinity) {
      const tech = appendText(card, "p", `🚀 工程算法算力赋能：${topo.engineeringAffinity.subsystem}（已注入 100% 算法算力）`, "settlement-mind-card__tech");
      tech.style.color = "#f5d06f";
      tech.style.fontWeight = "700";
      tech.style.margin = "0 0 8px";
    }

    const transfer = topo.learningBridge?.transferTargets?.[0];
    if (transfer) {
      appendText(card, "div", `🌱 下一步思维迁移：${transfer.reason}`, "settlement-mind-card__branch");
    }

    parent.append(card);
  }

  function renderAlgorithmResonance(parent, project, chapter, state) {
    const section = document.createElement("section");
    section.className = "algorithm-resonance-board";
    appendText(section, "h3", `🧠 ${project.name} · 数学算法算力赋能矩阵`, "algorithm-resonance-board__title");
    appendText(section, "p", "每一项大国重器工程子系统，均由扎实的数学算法驱动。完成对应专题，即可点亮高科技蓝图！", "super-project__lead");

    const grid = document.createElement("div");
    grid.className = "algorithm-resonance-grid";

    chapter.levels.forEach((level) => {
      const topo = KnowledgeTopologyAdapter.getModuleTopology(level.moduleId, chapter.chapterId);
      if (!topo.engineeringAffinity) return;
      const isCleared = (state.levelRecords[level.levelId]?.starCount || 0) >= 1;
      const strand = KnowledgeTopologyAdapter.getStrand(topo.strand);

      const card = document.createElement("div");
      card.className = `algorithm-resonance-card ${isCleared ? "is-active" : ""}`;

      const cardHeader = document.createElement("div");
      cardHeader.className = "algorithm-resonance-card__header";
      appendText(cardHeader, "span", `${strand.icon} ${topo.engineeringAffinity.subsystem}`, "algorithm-resonance-card__subsystem");
      appendText(cardHeader, "span", isCleared ? "✅ 算力已激活" : "⏳ 待解密", "algorithm-resonance-card__status");
      card.append(cardHeader);

      appendText(card, "p", topo.engineeringAffinity.algorithmRole, "algorithm-resonance-card__role");
      grid.append(card);
    });

    section.append(grid);
    parent.append(section);
  }

  function renderUnifiedLevelMap(parent) {
    const { chapter, state } = app;
    const VIEW_MODE_STORAGE_KEY = "math-quest-map-view-mode";
    let currentMode = "grid";
    try {
      const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (saved === "constellation" || saved === "grid") {
        currentMode = saved;
      }
    } catch {
      currentMode = "grid";
    }
    let activeStrandFilter = "all";

    const sectionWrapper = document.createElement("section");
    sectionWrapper.className = "chapter-route-section";
    sectionWrapper.setAttribute("aria-label", `${chapter.name}关卡与思维星图`);

    // 控制栏：思维领域筛选 + 呈现模式切换
    const controlsBar = document.createElement("div");
    controlsBar.className = "constellation-controls";

    const filterList = document.createElement("div");
    filterList.className = "constellation-filter";
    filterList.setAttribute("role", "tablist");
    filterList.setAttribute("aria-label", "数学思维领域筛选");

    const graphLevels = KnowledgeTopologyAdapter.calculateChapterLevelGraph(chapter, state);
    const strands = KnowledgeTopologyAdapter.getAllStrands();

    const allTab = document.createElement("button");
    allTab.type = "button";
    allTab.className = "constellation-filter__item is-active";
    allTab.dataset.filter = "all";
    allTab.textContent = `🌌 全领域 (${graphLevels.length})`;
    filterList.append(allTab);

    strands.forEach((strand) => {
      const count = graphLevels.filter((lvl) => lvl.strand.id === strand.id).length;
      if (count === 0) return;
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "constellation-filter__item";
      tab.dataset.filter = strand.id;
      tab.style.setProperty("--strand-color", strand.color);
      tab.textContent = `${strand.icon} ${strand.title} (${count})`;
      filterList.append(tab);
    });
    controlsBar.append(filterList);

    const actionCluster = document.createElement("div");
    actionCluster.className = "constellation-actions";

    const isFreePractice = state?.freePractice === true;
    const freePracticeBtn = document.createElement("button");
    freePracticeBtn.type = "button";
    freePracticeBtn.className = `pixel-button pixel-button--quiet free-practice-toggle ${isFreePractice ? "is-active" : ""}`;
    freePracticeBtn.dataset.toggleFreePractice = chapter.chapterId;
    freePracticeBtn.setAttribute("role", "switch");
    freePracticeBtn.setAttribute("aria-checked", String(isFreePractice));
    freePracticeBtn.setAttribute("title", isFreePractice ? "自由答题已开启：本章所有关卡均可自由选关挑战" : "自由答题已关闭：遵循主线关卡逐关解锁");
    freePracticeBtn.textContent = isFreePractice ? "🔓 自由答题：开" : "🔒 自由答题：关";

    const viewSwitch = document.createElement("div");
    viewSwitch.className = "constellation-view-switch";
    viewSwitch.setAttribute("role", "group");
    viewSwitch.setAttribute("aria-label", "关卡呈现模式");

    const gridBtn = document.createElement("button");
    gridBtn.type = "button";
    gridBtn.className = `pixel-button pixel-button--quiet ${currentMode === "grid" ? "is-active" : ""}`;
    gridBtn.dataset.viewMode = "grid";
    gridBtn.textContent = "📋 战术方阵";

    const constellationBtn = document.createElement("button");
    constellationBtn.type = "button";
    constellationBtn.className = `pixel-button pixel-button--quiet ${currentMode === "constellation" ? "is-active" : ""}`;
    constellationBtn.dataset.viewMode = "constellation";
    constellationBtn.textContent = "✨ 星图拓扑";

    viewSwitch.append(gridBtn, constellationBtn);
    actionCluster.append(freePracticeBtn, viewSwitch);
    controlsBar.append(actionCluster);
    sectionWrapper.append(controlsBar);

    // 1. 战术方阵网格地图（官方关卡承载器，100% 满足自动化测试与无障碍契约）
    const map = document.createElement("section");
    map.dataset.levelMap = "";
    map.className = "level-map";
    map.setAttribute("aria-label", `${chapter.name}关卡地图`);

    chapter.levels.forEach((level, index) => {
      const record = state.levelRecords[level.levelId];
      const isNormalUnlocked = state.unlockedLevelIds.includes(level.levelId);
      const unlocked = isFreePractice || isNormalUnlocked;
      const isPausedLevel = state.activeRun?.levelId === level.levelId;
      const status = isPausedLevel
        ? "paused"
        : !unlocked
        ? "locked"
        : record?.starCount === 3
        ? "full-star"
        : record
        ? "cleared"
        : isNormalUnlocked
        ? "current"
        : "free-practice";
      const contentStatus = ContentVersionModel.getLevelContentStatus(level, record);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "level-node";
      button.dataset.levelId = level.levelId;
      button.dataset.focusKey = level.levelId;
      button.dataset.status = status;
      button.dataset.contentStatus = contentStatus;

      const topo = KnowledgeTopologyAdapter.getModuleTopology(level.moduleId, chapter.chapterId);
      const strand = KnowledgeTopologyAdapter.getStrand(topo.strand);
      button.dataset.strand = strand.id;
      button.style.setProperty("--strand-color", strand.color);

      button.disabled = !unlocked || Boolean(state.activeRun && !isPausedLevel && !isFreePractice);
      button.setAttribute("aria-label", `第 ${index + 1} 关 ${level.title}，${status === "paused" ? "继续挑战" : status === "locked" ? "未解锁" : status === "free-practice" ? "自由练习模式可挑战" : contentStatus === "updated" ? "内容已更新，可重新挑战" : "可挑战"}`);
      appendText(button, "span", String(index + 1).padStart(2, "0"), "level-node__number");

      const titleWrap = document.createElement("div");
      titleWrap.className = "level-node__title-wrap";
      appendText(titleWrap, "strong", level.title, "level-node__title");
      if (topo?.learningBridge?.methodSummary?.label) {
        const methodTag = appendText(titleWrap, "span", `${strand.icon} ${topo.learningBridge.methodSummary.label}`, "level-node__method-tag");
        methodTag.style.margin = "2px 0";
      }
      button.append(titleWrap);

      appendText(button, "small", status === "paused" ? "继续挑战" : contentStatus === "updated" ? "内容已更新 · 可重新挑战" : record ? `${"★".repeat(record.starCount)}${"☆".repeat(3 - record.starCount)}` : status === "locked" ? "待解锁" : status === "free-practice" ? "自由挑战" : "开始挑战", "level-node__status");
      map.append(button);
    });

    // 2. 知识星图拓扑网络展示区（按需挂载，避免隐藏状态下 0x0 按钮影响审计）
    const constellationDisplay = document.createElement("div");
    constellationDisplay.className = "constellation-display";
    constellationDisplay.dataset.constellationContainer = "";

    function mountConstellationBoard() {
      constellationDisplay.innerHTML = "";
      const board = KnowledgeConstellationView.createConstellationBoard({
        chapter,
        state,
        activeStrandFilter,
        onSelectLevel: (node) => {
          const overlay = KnowledgeConstellationView.createMindCompassBriefing(node, chapter, () => {
            overlay.remove();
            const targetLevelId = node.levelId;
            const mainBtn = document.querySelector(`[data-level-map] [data-level-id='${targetLevelId}']`);
            if (mainBtn && !mainBtn.disabled) {
              mainBtn.click();
            } else {
              app.answerDraft = "";
              app.recordMetric("recordLevelStart", chapter.chapterId);
              app.state = ProgressionModel.startLevel(app.state, targetLevelId);
              app.screen = "challenge";
              app.persist();
              app.render();
            }
          });
          document.body.append(overlay);
        }
      });
      constellationDisplay.append(board);
    }

    // 切换模式控制（同一时刻仅显示一种模式，绝对无重复关卡）
    function setViewMode(mode) {
      currentMode = mode;
      try {
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
      } catch {}
      const isGrid = mode === "grid";
      map.hidden = !isGrid;
      map.style.display = isGrid ? "" : "none";
      constellationDisplay.hidden = isGrid;
      constellationDisplay.style.display = isGrid ? "none" : "";
      gridBtn.classList.toggle("is-active", isGrid);
      constellationBtn.classList.toggle("is-active", !isGrid);

      if (isGrid) {
        constellationDisplay.innerHTML = "";
      } else {
        mountConstellationBoard();
      }
    }

    // 领域筛选联动（同时高亮/暗化方阵卡片与星图节点）
    function setStrandFilter(filterId) {
      activeStrandFilter = filterId;
      filterList.querySelectorAll(".constellation-filter__item").forEach((el) => {
        el.classList.toggle("is-active", el.dataset.filter === filterId);
      });
      // 战术方阵按钮明暗
      map.querySelectorAll(".level-node").forEach((btn) => {
        const match = filterId === "all" || btn.dataset.strand === filterId;
        btn.classList.toggle("is-dimmed", !match);
      });
      // 星图拓扑节点明暗
      constellationDisplay.querySelectorAll(".constellation-node").forEach((btn) => {
        const match = filterId === "all" || btn.dataset.strand === filterId;
        btn.classList.toggle("is-dimmed", !match);
      });
    }

    filterList.addEventListener("click", (e) => {
      const target = e.target.closest("[data-filter]");
      if (!target) return;
      setStrandFilter(target.dataset.filter);
    });

    viewSwitch.addEventListener("click", (e) => {
      const target = e.target.closest("[data-view-mode]");
      if (!target) return;
      setViewMode(target.dataset.viewMode);
    });

    setViewMode(currentMode);
    setStrandFilter(activeStrandFilter);

    sectionWrapper.append(map, constellationDisplay);
    parent.append(sectionWrapper);
  }

  function renderMap() {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const main = document.createElement("main");
    main.className = "quest-game quest-game--map";
    main.dataset.gameScreen = "map";
    renderAchievementBanner(main);
    renderHeader(main, "知识远征", chapter.name);
    renderSuperProjectQuickHub(main);
    renderCampaignOverview(main);

    const summary = document.createElement("section");
    summary.className = "chapter-summary";
    const cleared = Object.keys(state.levelRecords).length;
    appendText(summary, "p", "沿着像素路标与星图分支，完成每一组十题思维挑战。", "chapter-summary__lead");
    appendText(summary, "p", `${cleared} / ${chapter.levels.length} 关已完成`, "chapter-summary__progress");
    main.append(summary);
    renderRecoveryChallengeCallout(main);
    renderChapterStages(main);
    renderChapterMissions(main);

    // 统一关卡呈现：单份关卡，无缝在战术方阵与知识星图之间切换
    renderUnifiedLevelMap(main);

    root.append(main);
  }

  function renderRewardChain(parent, levelId) {
    const track = LevelRewardConfig.getRewardTrack(levelId);
    const chain = track?.rewardChain;
    if (!chain) return;
    const names = [chain.rawItemId, chain.materialItemId, chain.componentItemId, chain.partItemId]
      .map((itemId) => GameItemCatalog.getItem(itemId)?.name || itemId)
      .filter(Boolean);
    if (names.length !== 4) return;
    const line = document.createElement("p");
    line.className = "reward-preview__chain";
    line.dataset.rewardChain = "";
    line.title = `研发链条：${names.join(" → ")}`;
    line.innerHTML = `<span class="reward-chain-pill"><span class="reward-chain-prefix">研发链:</span><span class="chain-step is-source">${names[0]}</span><span class="chain-arrow">→</span><span class="chain-step">${names[1]}</span><span class="chain-arrow">→</span><span class="chain-step">${names[2]}</span><span class="chain-arrow">→</span><span class="chain-step is-target">${names[3]}</span></span>`;
    parent.append(line);
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
    renderRewardChain(parent, run.levelId);
    if (hasRandomBonus) {
      const note = appendText(parent, "p", "进阶挑战：额外随机补给", "reward-preview__bonus");
      note.dataset.randomRewardBonus = "";
    }
  }

  function getDifficultyTier(question, slotIndex) {
    const isBoss = Boolean(question?.isBoss || slotIndex === 9 || question?.slot === 10);
    const diff = question?.difficulty || "基础";
    const slot = (typeof slotIndex === "number" ? slotIndex + 1 : question?.slot) || 1;
    const steps = question?.difficultyProfile?.steps || (isBoss ? 4 : slot <= 2 ? 1 : slot <= 5 ? 2 : 3);
    const conditions = question?.difficultyProfile?.conditions || (isBoss ? 3 : slot <= 2 ? 1 : 2);

    if (isBoss) {
      return {
        tier: 5,
        code: "boss",
        title: "决战首领",
        stars: "⭐️⭐️⭐️⭐️👑",
        badgeText: "Boss · 终极挑战",
        stepLabel: `${steps}步综合推演`,
        conditionLabel: `${conditions}重约束`,
        cognitiveFocus: "全维建模 · 终极突破",
        summaryText: "首领战 · 全章综合建模与多步逻辑攻坚"
      };
    }
    if (diff === "挑战" || slot === 9) {
      return {
        tier: 4,
        code: "breakthrough",
        title: "突破攻坚",
        stars: "⭐️⭐️⭐️⭐️",
        badgeText: "挑战 · 突破攻坚",
        stepLabel: `${steps}步多维转化`,
        conditionLabel: `${conditions}重关联`,
        cognitiveFocus: "思维跃迁 · 策略转化",
        summaryText: "高阶挑战 · 复杂情境转化与综合解题策略"
      };
    }
    if (diff === "提高" || slot >= 6) {
      return {
        tier: 3,
        code: "advanced",
        title: "拓维深研",
        stars: "⭐️⭐️⭐️",
        badgeText: "提高 · 拓维深研",
        stepLabel: `${steps}步逻辑递推`,
        conditionLabel: `${conditions}重条件`,
        cognitiveFocus: "逆向反推 · 规律深化",
        summaryText: "思维提高 · 结构化逆推与模型深度应用"
      };
    }
    if (diff === "进阶" || slot >= 3) {
      return {
        tier: 2,
        code: "progressive",
        title: "进阶贯通",
        stars: "⭐️⭐️",
        badgeText: "进阶 · 拓展进阶",
        stepLabel: `${steps}步经典递推`,
        conditionLabel: `${conditions}组已知量`,
        cognitiveFocus: "模型拆解 · 关系转化",
        summaryText: "拓展进阶 · 经典模型拆解与双步关系转化"
      };
    }
    return {
      tier: 1,
      code: "foundation",
      title: "启航奠基",
      stars: "⭐️",
      badgeText: "基础 · 启航奠基",
      stepLabel: `${steps}步直接推导`,
      conditionLabel: `${conditions}组已知量`,
      cognitiveFocus: "概念锚定 · 规则理解",
      summaryText: "基础启航 · 核心概念直推与数理直觉建立"
    };
  }

  function renderCognitiveBlueprint(parent, question, tierInfo) {
    if (!question || typeof question !== "object") return;
    const blueprint = document.createElement("div");
    blueprint.className = `cognitive-blueprint cognitive-blueprint--${tierInfo.code}`;
    blueprint.dataset.cognitiveBlueprint = "";

    const ladderBadge = question.cognitiveBadge || (question.slot === 10 ? "👑 复合建模" : question.slot >= 8 ? "⚡ 边界极值" : question.slot >= 6 ? "⏪ 逆向还原" : question.slot >= 3 ? "🔄 情境迁移" : "🎯 母题定模");
    const ladderGoal = question.cognitiveGoal || (question.slot === 10 ? "多重约束与综合建模" : question.slot >= 8 ? "临界状态与极端逼近" : question.slot >= 6 ? "倒推反演与知果索因" : question.slot >= 3 ? "隐蔽条件与生活化换元" : "基准识别与公式锚定");

    const goal = question.knowledgeGoal || question.learningObjective || "掌握核心数理规律";
    const model = question.typicalModel || question.reasoningType || "经典数理解析";
    const steps = tierInfo.stepLabel || "分步推导";
    const conditions = tierInfo.conditionLabel || "关联约束";

    blueprint.innerHTML = `
      <div class="cognitive-blueprint__header">
        <span class="cognitive-blueprint__tag">🧭 战术思维蓝图 · ${ladderBadge}</span>
        <span class="cognitive-blueprint__tier">${tierInfo.stars} ${tierInfo.title}</span>
      </div>
      <div class="cognitive-blueprint__grid">
        <div class="cognitive-blueprint__item">
          <span class="cognitive-blueprint__k">🎯 认知定位</span>
          <span class="cognitive-blueprint__v">${ladderGoal}</span>
        </div>
        <div class="cognitive-blueprint__item">
          <span class="cognitive-blueprint__k">🧩 核心模型</span>
          <span class="cognitive-blueprint__v">${model}</span>
        </div>
        <div class="cognitive-blueprint__item">
          <span class="cognitive-blueprint__k">📐 推演深度</span>
          <span class="cognitive-blueprint__v">${steps} · ${conditions}</span>
        </div>
      </div>
    `;
    parent.append(blueprint);
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
      const tierInfo = getDifficultyTier(run.question, run.questionIndex);

      const reviewTierBanner = document.createElement("div");
      reviewTierBanner.className = `tactical-review__tier-banner tactical-review__tier-banner--${tierInfo.code}`;
      reviewTierBanner.innerHTML = `
        <span class="tactical-review__tier-badge">${tierInfo.stars} ${tierInfo.title}</span>
        <span class="tactical-review__tier-metrics">${tierInfo.stepLabel} · ${tierInfo.conditionLabel} 达成</span>
      `;
      details.append(reviewTierBanner);

      // 1. 动态动图演绎与极简三拍卡片（彻底告别文字说教）
      const minimalCard = KnowledgeMotionExplainer.renderMinimalTacticalCard(review, run.question);
      details.append(minimalCard);

      const ladderBadge = run.question?.cognitiveBadge || (run.question?.slot === 10 ? "👑 复合建模" : run.question?.slot >= 8 ? "⚡ 边界极值" : run.question?.slot >= 6 ? "⏪ 逆向还原" : run.question?.slot >= 3 ? "🔄 情境迁移" : "🎯 母题定模");
      const ladderGoal = run.question?.cognitiveGoal || (run.question?.slot === 10 ? "多重约束与综合建模" : run.question?.slot >= 8 ? "临界状态与极端逼近" : run.question?.slot >= 6 ? "倒推反演与知果索因" : run.question?.slot >= 3 ? "隐蔽条件与生活化换元" : "基准识别与公式锚定");

      const transferCard = document.createElement("div");
      transferCard.className = "tactical-review__transfer-card";
      transferCard.innerHTML = `
        <div class="tactical-review__transfer-title">🌟 数学思维精要 · 举一反三</div>
        <div class="tactical-review__transfer-grid">
          <div class="tactical-review__transfer-item">
            <strong>🧗 阶梯定位</strong>
            <span>${ladderBadge}（${ladderGoal}）</span>
          </div>
          <div class="tactical-review__transfer-item">
            <strong>🎯 核心模型</strong>
            <span>${run.question?.typicalModel || review.method || "经典数理解析"}</span>
          </div>
          <div class="tactical-review__transfer-item">
            <strong>⚠️ 避坑要点</strong>
            <span>${run.question?.commonPitfall || review.pitfall || review.errorTrap || "审清题意，避免漏算条件。"}</span>
          </div>
          <div class="tactical-review__transfer-item">
            <strong>🔍 验算心法</strong>
            <span>${run.question?.verificationMethod || review.verification || review.check || "将结果代回原题验证闭环。"}</span>
          </div>
        </div>
      `;
      details.append(transferCard);

      const effectiveMethod = MathThinkingMethods?.getEffectiveThinkingMethod?.(run.question);
      const thinkingMethodLabel = effectiveMethod?.label || run.question.thinkingMethodLabel;
      const methodReview = effectiveMethod?.review || run.question.methodReview;
      if (thinkingMethodLabel) appendText(details, "p", `思维方法：${thinkingMethodLabel}`, "tactical-review__thinking-method");
      if (methodReview) appendText(details, "p", `方法复盘：${methodReview}`, "tactical-review__method-review");
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
    renderAchievementBanner(main);
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
    const tierInfo = getDifficultyTier(run.question, run.questionIndex);
    const difficulty = document.createElement("div");
    difficulty.className = `difficulty-badge difficulty-badge--${tierInfo.code}`;
    difficulty.dataset.difficulty = tierInfo.code;
    difficulty.dataset.tier = String(tierInfo.tier);
    difficulty.innerHTML = `
      <span class="difficulty-badge__stars">${tierInfo.stars}</span>
      <span class="difficulty-badge__text">${tierInfo.badgeText}</span>
      <span class="difficulty-badge__focus">${tierInfo.cognitiveFocus}</span>
    `;
    difficulty.title = `难度梯级【${tierInfo.title}】：${tierInfo.summaryText} (${tierInfo.stepLabel} · ${tierInfo.conditionLabel})`;
    meta.append(difficulty);

    if (tierInfo.tier === 5) {
      challenge.classList.add("challenge-card--boss");
    }

    const scratchpadToggle = appendText(meta, "button", "📝 草稿纸", "pixel-button pixel-button--quiet scratchpad-toggle-btn");
    scratchpadToggle.type = "button";
    scratchpadToggle.dataset.toggleScratchpad = "";
    scratchpadToggle.title = "打开/收起奥数手绘草稿纸 (快捷键 D)";
    scratchpadToggle.hidden = run.status === "retry";
    challenge.append(meta);

    if (!app.scratchpad) {
      app.scratchpad = createScratchpad();
    }
    app.scratchpad.element.hidden = run.status === "retry";
    challenge.append(app.scratchpad.element);

    const hudBar = document.createElement("div");
    hudBar.className = "challenge-tactical-hud";

    const streakCount = state.streak || 0;
    const streakHud = document.createElement("div");
    streakHud.className = `streak-hud ${streakCount >= 3 ? "streak-hud--hot" : ""}`;
    streakHud.dataset.streakHud = String(streakCount);
    streakHud.innerHTML = `
      <span class="streak-hud__icon">${streakCount >= 3 ? "🔥" : "⚡"}</span>
      <span class="streak-hud__label">连胜心流</span>
      <strong class="streak-hud__count">x${streakCount}</strong>
      ${streakCount >= 3 ? `<span class="streak-hud__flare">MAX</span>` : ""}
    `;
    streakHud.title = streakCount >= 3 ? `🔥 连胜心流爆发中！每 3 连胜空投专属宝箱` : `达成 3 连胜即可激活专属空投补给箱`;
    hudBar.append(streakHud);

    const pityEnergy = state.pityEnergy || 0;
    const isOverloaded = pityEnergy >= 5;
    const pityHud = document.createElement("div");
    pityHud.className = `pity-hud ${isOverloaded ? "is-overloaded" : ""}`;
    pityHud.dataset.pityHud = String(pityEnergy);
    const cells = Array.from({ length: 5 }, (_, i) => `<span class="pity-hud__cell ${i < pityEnergy ? "is-filled" : ""}"></span>`).join("");
    pityHud.innerHTML = `
      <span class="pity-hud__icon">${isOverloaded ? "⚡" : "🔋"}</span>
      <span class="pity-hud__label">${isOverloaded ? "核心过载" : "核心充能"}</span>
      <span class="pity-hud__meter">${cells}</span>
      <span class="pity-hud__val">${pityEnergy}/5</span>
      ${isOverloaded ? `<span class="pity-hud__badge">必出稀有!</span>` : ""}
    `;
    pityHud.title = isOverloaded
      ? `🔋 核心充能已达到 5/5 满载过载状态！下一题答对必出稀有/史诗核心构件！`
      : `保底充能 ${pityEnergy}/5：未出稀有材料时持续聚能，满格 5/5 必出稀有/史诗核心构件`;
    hudBar.append(pityHud);

    challenge.append(hudBar);

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
    if (run.status !== "retry") {
      renderMindCompassBanner(challenge, level, chapter);
    }

    const storyBeat = appendText(
      challenge,
      "p",
      run.question.storyBeat || "工程小队正在整理这条线索。",
      "question-story-beat"
    );
    storyBeat.dataset.questionStoryBeat = "";
    const effectiveMethod = MathThinkingMethods?.getEffectiveThinkingMethod?.(run.question);
    const thinkingMethodLabel = effectiveMethod?.label || run.question.thinkingMethodLabel;
    const thinkingMethodId = effectiveMethod?.id || run.question.thinkingMethodId || "";
    const methodPrompt = effectiveMethod?.prompt || run.question.methodPrompt;
    if (thinkingMethodLabel) {
      const methodHint = document.createElement("div");
      methodHint.className = "thinking-method-hint";
      methodHint.dataset.thinkingMethod = thinkingMethodId;
      appendText(methodHint, "strong", `🧭 思维方法：${thinkingMethodLabel}`, "thinking-method-hint__label");
      if (methodPrompt) appendText(methodHint, "span", methodPrompt, "thinking-method-hint__prompt");
      challenge.append(methodHint);
    }
    renderCognitiveBlueprint(challenge, run.question, tierInfo);
    const prompt = appendText(challenge, "p", run.question.prompt, "question-prompt");
    prompt.dataset.questionPrompt = "";

    // 题目视觉图解：作答时不泄题，提交错误重试(retry)或复盘(resolved)时展示深度解析
    const visual = QuestionVisualizer.createQuestionVisual(run.question, { status: run.status });
    if (visual) {
      if (run.status === "resolved") {
        visual.classList.add("is-resolved");
      } else if (run.status === "retry") {
        visual.classList.add("is-retry");
      } else {
        visual.classList.add("is-active");
      }
      challenge.append(visual);
    }

    if (run.status === "active") {
      const activeScaffold = HintScaffold.renderActiveThinkingScaffold?.(run.question);
      if (activeScaffold) {
        challenge.append(activeScaffold);
      }
    }

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
      const feedback = appendText(challenge, "p", "这次没有通过。可以参考下方的阶梯思路再试一次，或跳过继续前进。", "retry-message");
      feedback.setAttribute("role", "status");

      const studentAns = app.lastSubmittedAnswer || answerDraft;
      const diag = HintScaffold.diagnoseMistake?.(run.question, studentAns);
      if (diag) {
        const diagCard = document.createElement("div");
        diagCard.className = "diagnostic-feedback-card";
        diagCard.dataset.diagnosticFeedback = "";
        diagCard.innerHTML = `
          <strong class="diagnostic-feedback__badge">💡 名师思维诊断</strong>
          <p class="diagnostic-feedback__text">${diag}</p>
        `;
        challenge.append(diagCard);
      }

      const hintPanel = document.createElement("details");
      hintPanel.className = "tiered-hints";
      hintPanel.dataset.tieredHints = "";
      hintPanel.open = true;
      const hintSummary = appendText(hintPanel, "summary", "💡 展开阶梯思路与解题脚手架", "tiered-hints__summary");
      hintSummary.setAttribute("aria-label", "展开阶梯思路与解题脚手架");
      const hints = HintScaffold.buildTieredHints(run.question);
      const hintList = document.createElement("div");
      hintList.className = "tiered-hints__list";
      hints.forEach((hint) => {
        const item = document.createElement("div");
        item.className = "tiered-hints__item";
        appendText(item, "strong", hint.label, "tiered-hints__label");
        appendText(item, "p", hint.text, "tiered-hints__text");
        hintList.append(item);
      });
      hintPanel.append(hintList);
      challenge.append(hintPanel);
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
      const tierInfo = getDifficultyTier(run.question, run.questionIndex);
      const reviewTierBanner = document.createElement("div");
      reviewTierBanner.className = `tactical-review__tier-banner tactical-review__tier-banner--${tierInfo.code}`;
      reviewTierBanner.innerHTML = `
        <span class="tactical-review__tier-badge">${tierInfo.stars} ${tierInfo.title}</span>
        <span class="tactical-review__tier-metrics">${tierInfo.stepLabel} · ${tierInfo.conditionLabel} 达成</span>
      `;
      details.append(reviewTierBanner);

      // 动态动图演绎与极简三拍卡片
      const minimalCard = KnowledgeMotionExplainer.renderMinimalTacticalCard(review, run.question || {});
      details.append(minimalCard);

      const ladderBadge = run.question?.cognitiveBadge || (run.question?.slot === 10 ? "👑 复合建模" : run.question?.slot >= 8 ? "⚡ 边界极值" : run.question?.slot >= 6 ? "⏪ 逆向还原" : run.question?.slot >= 3 ? "🔄 情境迁移" : "🎯 母题定模");
      const ladderGoal = run.question?.cognitiveGoal || (run.question?.slot === 10 ? "多重约束与综合建模" : run.question?.slot >= 8 ? "临界状态与极端逼近" : run.question?.slot >= 6 ? "倒推反演与知果索因" : run.question?.slot >= 3 ? "隐蔽条件与生活化换元" : "基准识别与公式锚定");

      const transferCard = document.createElement("div");
      transferCard.className = "tactical-review__transfer-card";
      transferCard.innerHTML = `
        <div class="tactical-review__transfer-title">🌟 数学思维精要 · 举一反三</div>
        <div class="tactical-review__transfer-grid">
          <div class="tactical-review__transfer-item">
            <strong>🧗 阶梯定位</strong>
            <span>${ladderBadge}（${ladderGoal}）</span>
          </div>
          <div class="tactical-review__transfer-item">
            <strong>🎯 核心模型</strong>
            <span>${run.question?.typicalModel || review.method || "经典数理解析"}</span>
          </div>
          <div class="tactical-review__transfer-item">
            <strong>⚠️ 避坑要点</strong>
            <span>${run.question?.commonPitfall || review.pitfall || review.errorTrap || "审清题意，避免漏算条件。"}</span>
          </div>
          <div class="tactical-review__transfer-item">
            <strong>🔍 验算心法</strong>
            <span>${run.question?.verificationMethod || review.verification || review.check || "将结果代回原题验证闭环。"}</span>
          </div>
        </div>
      `;
      details.append(transferCard);

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
    renderAchievementBanner(main);
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
    const tierInfo = getDifficultyTier(run.question, run.questionIndex);
    const difficultyBadge = document.createElement("div");
    difficultyBadge.className = `difficulty-badge difficulty-badge--${tierInfo.code}`;
    difficultyBadge.dataset.difficulty = tierInfo.code;
    difficultyBadge.dataset.tier = String(tierInfo.tier);
    difficultyBadge.innerHTML = `
      <span class="difficulty-badge__stars">${tierInfo.stars}</span>
      <span class="difficulty-badge__text">${tierInfo.badgeText}</span>
      <span class="difficulty-badge__focus">${tierInfo.cognitiveFocus}</span>
    `;
    difficultyBadge.title = `难度梯级【${tierInfo.title}】：${tierInfo.summaryText} (${tierInfo.stepLabel} · ${tierInfo.conditionLabel})`;
    meta.append(difficultyBadge);
    card.append(meta);
    appendText(card, "h2", "补给线索", "challenge-card__heading");
    const target = ChallengeModel.getTargetMaterial(chapter.chapterId, state.inventory);
    appendText(card, "p", target ? `答对可补给：${GameItemCatalog.getItem(target.itemId)?.name || target.itemId} × 1（还缺 ${target.quantity}）` : "当前工程材料已暂时齐备。", "recovery-target");
    appendText(card, "p", run.question?.storyBeat || "从本章知识点中抽取一道补给线索。", "question-story-beat");
    const effectiveMethod = MathThinkingMethods?.getEffectiveThinkingMethod?.(run.question);
    const thinkingMethodLabel = effectiveMethod?.label || run.question?.thinkingMethodLabel;
    const thinkingMethodId = effectiveMethod?.id || run.question?.thinkingMethodId || "";
    const methodPrompt = effectiveMethod?.prompt || run.question?.methodPrompt;
    if (thinkingMethodLabel) {
      const methodHint = document.createElement("div");
      methodHint.className = "thinking-method-hint";
      methodHint.dataset.thinkingMethod = thinkingMethodId;
      appendText(methodHint, "strong", `🧭 思维方法：${thinkingMethodLabel}`, "thinking-method-hint__label");
      if (methodPrompt) appendText(methodHint, "span", methodPrompt, "thinking-method-hint__prompt");
      card.append(methodHint);
    }
    renderCognitiveBlueprint(card, run.question, tierInfo);
    appendText(card, "p", run.question?.prompt || "读取补给线索中……", "question-prompt");
    const visual = QuestionVisualizer.createQuestionVisual(run.question, { status: run.status });
    if (visual) {
      if (run.status === "resolved") {
        visual.classList.add("is-resolved");
      } else if (run.status === "retry") {
        visual.classList.add("is-retry");
      } else {
        visual.classList.add("is-active");
      }
      card.append(visual);
    }
    if (run.status === "active") {
      const activeScaffold = HintScaffold.renderActiveThinkingScaffold?.(run.question);
      if (activeScaffold) {
        card.append(activeScaffold);
      }
    }
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
    if (run.status === "retry") {
      appendText(card, "p", "答案还没对上。可以参考下方的阶梯思路再试一次，也可以跳过继续补给。", "retry-message");

      const studentAns = app.lastSubmittedAnswer || answerDraft;
      const diag = HintScaffold.diagnoseMistake?.(run.question, studentAns);
      if (diag) {
        const diagCard = document.createElement("div");
        diagCard.className = "diagnostic-feedback-card";
        diagCard.dataset.diagnosticFeedback = "";
        diagCard.innerHTML = `
          <strong class="diagnostic-feedback__badge">💡 名师思维诊断</strong>
          <p class="diagnostic-feedback__text">${diag}</p>
        `;
        card.append(diagCard);
      }

      const hintPanel = document.createElement("details");
      hintPanel.className = "tiered-hints";
      hintPanel.dataset.tieredHints = "";
      hintPanel.open = true;
      appendText(hintPanel, "summary", "💡 展开阶梯思路与解题脚手架", "tiered-hints__summary");
      const hints = HintScaffold.buildTieredHints(run.question);
      const hintList = document.createElement("div");
      hintList.className = "tiered-hints__list";
      hints.forEach((hint) => {
        const item = document.createElement("div");
        item.className = "tiered-hints__item";
        appendText(item, "strong", hint.label, "tiered-hints__label");
        appendText(item, "p", hint.text, "tiered-hints__text");
        hintList.append(item);
      });
      hintPanel.append(hintList);
      card.append(hintPanel);
    }
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
    renderAchievementBanner(section);
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
    renderSettlementMindCard(section, level, chapter);
    renderStageCraftingCallout(section, levelNumber);
    renderChapterFinale(section);
    root.append(section);
  }

  function renderInventory() {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const aside = document.createElement("aside");
    aside.className = "quest-game quest-game--inventory";
    aside.dataset.gameScreen = "inventory";
    aside.setAttribute("aria-label", "远征背包");
    renderHeader(aside, "军备总装与材料库", "远征背包 · 军备总装", false);
    const close = appendText(aside, "button", "返回", "pixel-button pixel-button--quiet inventory-close");
    close.type = "button";
    close.dataset.closeInventory = "";

    const project = GameItemCatalog.getSuperProject(chapter.chapterId);
    const isProjectCompleted = project && (state.inventory[project.id] || 0) > 0;

    if (craftingFeedback) {
      const feedbackItem = GameItemCatalog.getItem(craftingFeedback.itemId);
      const isFinal = project && project.id === craftingFeedback.itemId;
      const feedback = document.createElement("div");
      feedback.className = "cyber-synthesis-toast";
      feedback.dataset.craftingFeedback = "";
      feedback.setAttribute("role", "status");

      const iconWrap = document.createElement("div");
      iconWrap.className = "cyber-synthesis-toast__icon-wrap";
      if (feedbackItem) {
        iconWrap.append(createItemIcon(feedbackItem, "cyber-synthesis-toast__icon"));
      }

      const textWrap = document.createElement("div");
      textWrap.className = "cyber-synthesis-toast__text";
      appendText(textWrap, "span", "✨ 高能激光装配完毕 · 新装备入列", "cyber-synthesis-toast__eyebrow");
      appendText(textWrap, "strong", `合成成功：${craftingFeedback.name}`, "cyber-synthesis-toast__title");
      appendText(
        textWrap,
        "small",
        isFinal
          ? "大国重器终极工程已圆满竣工，入列战备巡航！"
          : "相关材料已消耗并转化为核心部件，已纳入总装战台。",
        "cyber-synthesis-toast__desc"
      );

      const closeToast = appendText(feedback, "button", "✕", "cyber-synthesis-toast__close");
      closeToast.type = "button";
      closeToast.setAttribute("aria-label", "关闭提示");
      closeToast.dataset.dismissCraftingFeedback = "";

      feedback.prepend(iconWrap, textWrap);
      aside.append(feedback);
    }

    if (campaign.unlockedChapterIds.length > 1) {
      const chapterSelector = document.createElement("div");
      chapterSelector.className = "inventory-chapter-tabs";
      appendText(chapterSelector, "span", "🎖️ 切换工程总装：", "inventory-chapter-tabs__label");
      const CHAPTER_ICONS = {
        "chapter-01": "✈️ J-20 战机",
        "chapter-02": "🌊 深海探测艇",
        "chapter-03": "🛰️ 轨道科学站",
        "chapter-04": "❄️ 极地破冰船",
        "chapter-05": "🛡️ 99A 坦克",
        "chapter-06": "📡 量子卫星",
        "chapter-07": "🚜 探索巡视车",
        "chapter-08": "🚀 深空领航舰",
        "chapter-09": "🏙️ 智慧城市核心"
      };
      allChapters
        .filter((c) => campaign.unlockedChapterIds.includes(c.chapterId))
        .forEach((c) => {
          const isActive = c.chapterId === chapter.chapterId;
          const p = GameItemCatalog.getSuperProject(c.chapterId);
          const isComplete = (campaign.chapterStates[c.chapterId]?.inventory[p?.id] || 0) > 0;
          const btn = appendText(
            chapterSelector,
            "button",
            `${CHAPTER_ICONS[c.chapterId] || c.name} ${isComplete ? "★" : ""}`,
            `pixel-button inventory-chapter-tab ${isActive ? "pixel-button--primary is-active-chapter" : "pixel-button--quiet"}`
          );
          btn.type = "button";
          btn.dataset.switchInventoryChapter = c.chapterId;
        });
      aside.append(chapterSelector);
    }

    const activeZone = app.inventoryZone || "assembly";
    const projectRecipes = project ? InventoryModel.getProjectRecipes(chapter.chapterId) : [];
    const materialRecipes = projectRecipes.filter((r) => r.type === "material-processing");
    const assemblyRecipes = projectRecipes.filter((r) => r.type !== "material-processing" && r.id !== project.finalRecipe.id);
    const completedAssemblyRecipes = assemblyRecipes.filter(isRecipeCrafted);
    const activeAssemblyRecipes = assemblyRecipes.filter((r) => !isRecipeCrafted(r));

    const rawEntries = Object.entries(state.inventory).filter(([, quantity]) => quantity > 0);
    const rawMaterialsEntries = rawEntries.filter(([itemId]) => {
      const item = GameItemCatalog.getItem(itemId);
      if (!item) return false;
      return item.category === "craft-material" || item.category === "building-material" || item.category === "fuel-material" || item.category === "mechanism-material" || item.category === "trade-material" || item.category === "gem" || item.category === "boss-loot" || item.category === "chapter-relic" || item.category === "processed-material";
    });

    // 1. 战备功能区入口导航条 (Zone Navigation Bar)
    const zoneNav = document.createElement("nav");
    zoneNav.className = "inventory-zone-nav";
    zoneNav.setAttribute("role", "tablist");
    zoneNav.setAttribute("aria-label", "军备库功能区入口");

    const ZONES = [
      {
        id: "assembly",
        icon: "🏆",
        title: "大国重器总装台",
        badge: activeAssemblyRecipes.length > 0 ? `${activeAssemblyRecipes.length} 待拼装` : (isProjectCompleted ? "全线完工" : "总装就绪"),
        badgeClass: activeAssemblyRecipes.length > 0 ? "is-pending" : "is-complete"
      },
      {
        id: "completed-components",
        icon: "🔩",
        title: "已完成组件档案库",
        badge: `${completedAssemblyRecipes.length} 件已入库`,
        badgeClass: completedAssemblyRecipes.length > 0 ? "is-complete" : "is-empty"
      },
      {
        id: "raw-materials",
        icon: "⛏️",
        title: "战备原材料仓与精炼",
        badge: `${rawMaterialsEntries.length} 种原料 · 12 道精炼`,
        badgeClass: rawMaterialsEntries.length > 0 ? "is-ready" : "is-empty"
      }
    ];

    ZONES.forEach(({ id, icon, title, badge, badgeClass }) => {
      const isActive = activeZone === id;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `inventory-zone-btn ${isActive ? "is-active" : ""}`;
      btn.dataset.inventoryZone = id;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
      btn.innerHTML = `
        <span class="inventory-zone-btn__icon">${icon}</span>
        <div class="inventory-zone-btn__info">
          <strong class="inventory-zone-btn__title">${title}</strong>
          <span class="inventory-zone-btn__badge ${badgeClass}">${badge}</span>
        </div>
      `;
      zoneNav.append(btn);
    });
    aside.append(zoneNav);

    // 2. 三大功能区容器 (Zone Containers)
    const assemblyZone = document.createElement("div");
    assemblyZone.className = `inventory-zone-content ${activeZone === "assembly" ? "is-active is-active-zone" : ""}`;
    assemblyZone.dataset.inventoryZoneContent = "assembly";

    const completedZone = document.createElement("div");
    completedZone.className = `inventory-zone-content ${activeZone === "completed-components" ? "is-active is-active-zone" : ""}`;
    completedZone.dataset.inventoryZoneContent = "completed-components";

    const materialsZone = document.createElement("div");
    materialsZone.className = `inventory-zone-content ${activeZone === "raw-materials" ? "is-active is-active-zone" : ""}`;
    materialsZone.dataset.inventoryZoneContent = "raw-materials";

    // ----------------------------------------------------
    // POPULATE ZONE 1: ASSEMBLY ZONE (大国重器总装台)
    // ----------------------------------------------------
    renderFinalProjectCeremony(assemblyZone);
    renderSuperProject(assemblyZone, {
      activeOnly: true,
      completedCount: completedAssemblyRecipes.length,
      rawCount: rawMaterialsEntries.length
    });

    if (isProjectCompleted) {
      renderStrategicArsenal(assemblyZone);
    }

    // ----------------------------------------------------
    // POPULATE ZONE 2: COMPLETED COMPONENTS VAULT (已完成组件档案库)
    // ----------------------------------------------------
    const vaultHeader = document.createElement("div");
    vaultHeader.className = "vault-header";
    vaultHeader.innerHTML = `
      <div class="vault-header__title-group">
        <span class="vault-header__eyebrow">零件归档 · 战备配件仓</span>
        <h2 class="vault-header__title">🔩 已完成组件档案库</h2>
        <p class="vault-header__desc">所有经由数学研学材料铸造合格的核心零部件与大型模块，均已安全归档封存于此。</p>
      </div>
      <button type="button" class="pixel-button pixel-button--primary vault-back-btn" data-switch-inventory-zone="assembly">
        ⬅️ 返回大国重器总装台
      </button>
    `;
    completedZone.append(vaultHeader);

    const vaultStats = document.createElement("div");
    vaultStats.className = "vault-stats-bar";
    vaultStats.innerHTML = `
      <div class="vault-stat">
        <span class="vault-stat__label">已完工入库构件</span>
        <strong class="vault-stat__value">${completedAssemblyRecipes.length} / ${assemblyRecipes.length} 件</strong>
      </div>
      <div class="vault-stat">
        <span class="vault-stat__label">模块总装准备度</span>
        <strong class="vault-stat__value">${assemblyRecipes.length ? Math.round((completedAssemblyRecipes.length / assemblyRecipes.length) * 100) : 0}%</strong>
      </div>
    `;
    completedZone.append(vaultStats);

    const vaultGrid = document.createElement("div");
    vaultGrid.className = "super-project__recipes vault-recipes-grid";

    if (completedAssemblyRecipes.length === 0) {
      const emptyVault = document.createElement("div");
      emptyVault.className = "vault-empty-state";
      emptyVault.innerHTML = `
        <span class="vault-empty-state__icon">📦</span>
        <h3>暂无已完成组件</h3>
        <p>请在「大国重器总装台」收集材料并铸造组件，铸造合格后将自动收纳于此。</p>
        <button type="button" class="pixel-button pixel-button--primary" data-switch-inventory-zone="assembly">
          前往总装台建造组件 ➔
        </button>
      `;
      completedZone.append(emptyVault);
    } else {
      completedAssemblyRecipes.forEach((recipe) => {
        renderProjectRecipe(vaultGrid, recipe, { isVault: true });
      });
      completedZone.append(vaultGrid);
    }

    const vaultBottomNav = document.createElement("div");
    vaultBottomNav.className = "vault-bottom-nav";
    vaultBottomNav.innerHTML = `
      <button type="button" class="pixel-button pixel-button--quiet" data-switch-inventory-zone="assembly">
        ⬅️ 返回大国重器总装台
      </button>
    `;
    completedZone.append(vaultBottomNav);

    // ----------------------------------------------------
    // POPULATE ZONE 3: RAW MATERIALS & REFINING (战备原材料仓与精炼工坊)
    // ----------------------------------------------------
    const matHeader = document.createElement("div");
    matHeader.className = "vault-header";
    matHeader.innerHTML = `
      <div class="vault-header__title-group">
        <span class="vault-header__eyebrow">战略物资 · 蓝图精炼</span>
        <h2 class="vault-header__title">⛏️ 战备原材料仓与精炼工坊</h2>
        <p class="vault-header__desc">关卡挑战掉落的原生矿石、金属与纤维材料集中储备，并支持按蓝图工艺图纸进行 12 道逐级精炼。</p>
      </div>
      <button type="button" class="pixel-button pixel-button--primary vault-back-btn" data-switch-inventory-zone="assembly">
        ⬅️ 返回大国重器总装台
      </button>
    `;
    materialsZone.append(matHeader);

    const matStats = document.createElement("div");
    matStats.className = "vault-stats-bar";
    matStats.innerHTML = `
      <div class="vault-stat">
        <span class="vault-stat__label">在库原材料储备</span>
        <strong class="vault-stat__value">${rawMaterialsEntries.length} 种</strong>
      </div>
      <div class="vault-stat">
        <span class="vault-stat__label">可用精炼工序</span>
        <strong class="vault-stat__value">${materialRecipes.length} 道</strong>
      </div>
    `;
    materialsZone.append(matStats);

    const stockpileSection = document.createElement("section");
    stockpileSection.className = "materials-stockpile-section";
    const stockpileTitle = document.createElement("h3");
    stockpileTitle.className = "materials-stockpile-title";
    stockpileTitle.textContent = "📦 战备原材料库存一览";
    stockpileSection.append(stockpileTitle);

    const rawGrid = document.createElement("div");
    rawGrid.className = "inventory-grid";

    if (!rawMaterialsEntries.length) {
      const emptyRaw = appendText(rawGrid, "p", "还没有收集到物品。完成挑战就能装满背包。", "empty-state");
      emptyRaw.dataset.inventoryEmpty = "";
    } else {
      rawMaterialsEntries.forEach(([itemId, quantity]) => {
        const item = GameItemCatalog.getItem(itemId);
        if (!item) return;
        const card = appendItem(rawGrid, item, quantity, "inventory-item");
        appendText(card, "p", `类别：${item.category}`, "inventory-item__detail");
        appendText(card, "p", `稀有度：${item.rarity}`, "inventory-item__detail");
      });
    }
    stockpileSection.append(rawGrid);
    materialsZone.append(stockpileSection);

    renderMaterialSynthesis(materialsZone);

    const matBottomNav = document.createElement("div");
    matBottomNav.className = "vault-bottom-nav";
    matBottomNav.innerHTML = `
      <button type="button" class="pixel-button pixel-button--quiet" data-switch-inventory-zone="assembly">
        ⬅️ 返回大国重器总装台
      </button>
    `;
    materialsZone.append(matBottomNav);

    aside.append(assemblyZone, completedZone, materialsZone);
    root.append(aside);
  }

  function renderStrategicArsenal(parent) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const project = GameItemCatalog.getSuperProject(chapter.chapterId);
    const rawEntries = Object.entries(state.inventory).filter(([, quantity]) => quantity > 0);
    const visibleEntries = rawEntries.filter(([itemId]) => {
      const item = GameItemCatalog.getItem(itemId);
      if (!item) return false;
      if (item.id === project?.id) return true;
      if (item.category === "super-project" || item.category === "mission-collectible") return true;
      if (!item.tags?.includes(chapter.chapterId)) return true;
      return false;
    });

    const inventorySection = document.createElement("section");
    inventorySection.className = "inventory-arsenal-section";
    const sectionHeader = document.createElement("div");
    sectionHeader.className = "inventory-arsenal-header";
    appendText(sectionHeader, "h3", "🎖️ 大国重器战备入列库", "inventory-arsenal-title");
    appendText(sectionHeader, "span", "全系统总装完成 · 巡航待命", "inventory-arsenal-badge");
    inventorySection.append(sectionHeader);

    const grid = document.createElement("div");
    grid.className = "inventory-grid";
    visibleEntries.forEach(([itemId, quantity]) => {
      const item = GameItemCatalog.getItem(itemId);
      if (!item) return;
      const card = appendItem(grid, item, quantity, "inventory-item");
      if (item.id === project?.id) card.classList.add("inventory-item--grand-project");
      appendText(card, "p", `类别：${item.category}`, "inventory-item__detail");
      appendText(card, "p", `稀有度：${item.rarity}`, "inventory-item__detail");
    });
    inventorySection.append(grid);
    parent.append(inventorySection);
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

  function renderProjectRecipe(parent, recipe, { final = false, isVault = false } = {}) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const output = recipe.outputs[0];
    const outputItem = GameItemCatalog.getItem(output.itemId);
    const categoryLabel = outputItem?.category?.endsWith("-component")
        ? `组件 ${String(recipe.unlockLevelNumber).padStart(2, "0")}`
        : outputItem?.category?.endsWith("-part")
        ? "大型部件"
        : "最终组装";
    const card = document.createElement("article");
    card.className = `project-recipe${final ? " project-recipe--final" : ""}${isVault ? " project-recipe--vault" : ""}`;
    card.dataset.projectRecipeCardId = recipe.id;
    const isCrafted = isRecipeCrafted(recipe);
    card.dataset.recipeStatus = isCrafted ? "completed" : isRecipeUnlocked(recipe) ? "available" : "locked";
    if (outputItem) {
      if (!final) card.dataset.itemId = outputItem.id;
      const visual = document.createElement("div");
      visual.className = "project-recipe__visual";
      visual.append(createItemIcon(outputItem, "project-recipe__icon"));
      card.append(visual);
    }
    appendText(card, "h3", `${final ? "最终组装" : categoryLabel} · ${outputItem?.name || recipe.name}`);
    if (isVault) {
      const seal = document.createElement("div");
      seal.className = "vault-seal-tag";
      seal.innerHTML = "<span>🎖️ 检验合格 · 已归档入库</span>";
      card.append(seal);
    }
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

  function renderSuperProject(parent, { activeOnly = false, completedCount = 0, rawCount = 0 } = {}) {
    const { root, chapter, state, campaign, screen, answerFeedback, rewardReveal, craftingFeedback, saveFeedback, answerDraft, allChapters, getLevel } = app;
    const project = GameItemCatalog.getSuperProject(chapter.chapterId);
    if (!project) return;
    const section = document.createElement("section");
    section.className = "super-project";
    section.dataset.superProject = project.id;
    appendText(section, "p", "超级工程蓝图", "quest-game__eyebrow");
    appendText(section, "h2", project.name, "super-project__title");
    const isCompleted = (state.inventory[project.id] || 0) > 0;
    const isPreview = app.superProjectPreviewMode === project.id;
    const projectState = (isCompleted || isPreview) ? "completed" : "blueprint";
    section.append(createProjectHeroArt(project, GameItemCatalog.getItem(project.id), projectState));
    const replayLabel = (isCompleted || isPreview)
      ? "🚀 试车巡航 / 检视总装大典"
      : "🚀 蓝图推演 / 试车巡航演练";
    const replayBtn = appendText(section, "button", replayLabel, "pixel-button pixel-button--primary super-project__replay-btn");
    replayBtn.type = "button";
    replayBtn.dataset.replayAssembly = project.id;
    if (!isCompleted) {
      const previewBtnText = isPreview
        ? "📐 返回初始蓝图模式"
        : project.id === "j20-sky-fighter"
        ? "👁️ 一键预览：完工成品战机形态（双发矢量+马赫环+HUD遥测）"
        : project.id === "deep-sea-explorer"
        ? "👁️ 一键预览：完工深海探测艇形态（钛合金耐压舱+探照灯+声呐阵列）"
        : `👁️ 一键预览：完工${project.name}形态`;
      const previewBtn = appendText(
        section,
        "button",
        previewBtnText,
        `pixel-button pixel-button--quiet super-project__preview-btn ${isPreview ? "is-active-preview" : ""}`
      );
      previewBtn.type = "button";
      previewBtn.dataset.toggleProjectPreview = project.id;
    }
    if (isPreview) {
      const statusBanner = document.createElement("div");
      statusBanner.className = "super-project__preview-status";
      const statusText = project.id === "j20-sky-fighter"
        ? "全息预览已激活：已呈现歼-20全状态双发矢量加力、马赫环与气动外形，点击机身可触发音爆冲刺！"
        : project.id === "deep-sea-explorer"
        ? "全息预览已激活：已呈现深海探测艇万米耐压球舱、双前置探照灯与声呐阵列，点击艇身可触发声呐深潜脉冲！"
        : `全息预览已激活：已呈现${project.name}完工总装形态与核心部件！`;
      statusBanner.innerHTML = `<span class="preview-status-indicator"></span><span>${statusText}</span>`;
      section.append(statusBanner);
    }
    if (projectState === "completed") {
      const consoleBar = document.createElement("div");
      consoleBar.className = "super-project__tactical-console";
      const tacticalModes = project.id === "j20-sky-fighter"
        ? [
            { mode: "photo", label: "📸 8K 写实写真" },
            { mode: "overdrive", label: "⚡ 超音速加力" },
            { mode: "xray", label: "🛰️ X-Ray 全息透视" },
            { mode: "shield", label: "🛡️ 蜂窝能量护盾" }
          ]
        : project.id === "deep-sea-explorer"
        ? [
            { mode: "photo", label: "📸 8K 写实写真" },
            { mode: "overdrive", label: "🌊 万米深潜冲刺" },
            { mode: "xray", label: "🔍 声呐全息透视" },
            { mode: "shield", label: "🛡️ 耐压舱深潜强化" }
          ]
        : [
            { mode: "photo", label: "📸 8K 写实写真" },
            { mode: "overdrive", label: "⚡ 动力总成巡航" },
            { mode: "xray", label: "🔍 结构工程透视" },
            { mode: "shield", label: "🛡️ 战备装甲就绪" }
          ];
      tacticalModes.forEach(({ mode, label }) => {
        const btn = appendText(consoleBar, "button", label, "pixel-button pixel-button--quiet tactical-mode-btn");
        btn.type = "button";
        btn.dataset.fighterMode = mode;
      });
      section.append(consoleBar);
    }
    appendText(section, "p", project.description, "super-project__lead");
    renderProjectProgress(section, project);
    renderAlgorithmResonance(section, project, chapter, state);

    // 专属收纳入口卡片 (Archival Portal Cards)
    const portals = document.createElement("div");
    portals.className = "super-project__portals";

    const compPortal = document.createElement("button");
    compPortal.type = "button";
    compPortal.className = "zone-portal-card zone-portal-card--components";
    compPortal.dataset.switchInventoryZone = "completed-components";
    compPortal.innerHTML = `
      <span class="zone-portal-card__icon">🔩</span>
      <div class="zone-portal-card__info">
        <strong class="zone-portal-card__title">已完成组件档案库</strong>
        <span class="zone-portal-card__desc">已收纳 <strong>${completedCount}</strong> 件构件 · 移步专属档案库检视参数 ➔</span>
      </div>
      <span class="zone-portal-card__action">进入档案库</span>
    `;
    portals.append(compPortal);

    const matPortal = document.createElement("button");
    matPortal.type = "button";
    matPortal.className = "zone-portal-card zone-portal-card--materials";
    matPortal.dataset.switchInventoryZone = "raw-materials";
    matPortal.innerHTML = `
      <span class="zone-portal-card__icon">⛏️</span>
      <div class="zone-portal-card__info">
        <strong class="zone-portal-card__title">战备原材料仓与精炼工坊</strong>
        <span class="zone-portal-card__desc">战略原料 <strong>${rawCount}</strong> 种在库 · 12 道蓝图精炼工序 ➔</span>
      </div>
      <span class="zone-portal-card__action">前往原料仓</span>
    `;
    portals.append(matPortal);
    section.append(portals);

    const recipeGrid = document.createElement("div");
    recipeGrid.className = "super-project__recipes";
    const allRecipes = InventoryModel.getProjectRecipes(chapter.chapterId)
      .filter((recipe) => recipe.type !== "material-processing" && recipe.id !== project.finalRecipe.id);
    const activeRecipes = activeOnly ? allRecipes.filter((r) => !isRecipeCrafted(r)) : allRecipes;

    if (activeOnly && activeRecipes.length > 0) {
      const activeHeader = document.createElement("div");
      activeHeader.className = "active-recipes-banner";
      activeHeader.innerHTML = `<span>⚙️ 待拼装核心工位（${activeRecipes.length} 项在研待铸造）</span><small>已铸造的构件已自动收纳至「已完成组件库」</small>`;
      recipeGrid.append(activeHeader);
    } else if (activeOnly && !isCompleted && activeRecipes.length === 0) {
      const readyBanner = document.createElement("div");
      readyBanner.className = "active-recipes-banner is-all-ready";
      readyBanner.innerHTML = `<span>✨ 全部基础组件与大型模块已铸造完毕并归档入库！</span><small>下一步：执行最终总装验收</small>`;
      recipeGrid.append(readyBanner);
    } else if (activeOnly && isCompleted) {
      const finishBanner = document.createElement("div");
      finishBanner.className = "active-recipes-banner is-completed";
      finishBanner.innerHTML = `<span>🎖️ 大国重器已全面交付！所有组件均已在专属档案库归档封存。</span>`;
      recipeGrid.append(finishBanner);
    }

    activeRecipes.forEach((recipe) => renderProjectRecipe(recipeGrid, recipe));
    renderProjectRecipe(recipeGrid, getCraftableRecipe(project.finalRecipe.id), { final: true });
    section.append(recipeGrid);
    parent.append(section);
  }

  return { renderMap, renderChallenge, renderRecoveryChallenge, renderSettlement, renderInventory, renderStatusOverlays, getCraftableRecipe, isRecipeUnlocked };
}
