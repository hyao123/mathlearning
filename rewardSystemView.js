(function attachRewardSystemView(root) {
  const progressStorageKey = "mathlearning-progress-v2";
  const rewardStorageKey = "mathlearning-reward-system-v1";
  let scheduled = false;

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function readProgressState() {
    try {
      return safeParse(root.localStorage?.getItem(progressStorageKey), {});
    } catch (error) {
      return {};
    }
  }

  function readRewardState() {
    try {
      return safeParse(root.localStorage?.getItem(rewardStorageKey), { unlockedBadgeIds: [], lastLevel: 1 });
    } catch (error) {
      return { unlockedBadgeIds: [], lastLevel: 1 };
    }
  }

  function saveRewardState(state) {
    try {
      root.localStorage?.setItem(rewardStorageKey, JSON.stringify(state));
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function getTodayKey() {
    if (root.ReviewScheduler?.toDateKey) {
      return root.ReviewScheduler.toDateKey(new Date());
    }
    return root.RewardSystem.toDateKey(new Date());
  }

  function getMasteries(state) {
    if (!root.MasteryModel || !Array.isArray(root.MATH_LEARNING_DATA)) {
      return [];
    }
    return root.MasteryModel.calculateAllMastery(root.MATH_LEARNING_DATA, state, { todayKey: getTodayKey() });
  }

  function getRewardProfile() {
    const state = readProgressState();
    return root.RewardSystem.calculateRewardProfile({
      modules: root.MATH_LEARNING_DATA || [],
      state,
      masteries: getMasteries(state),
      todayKey: getTodayKey()
    });
  }

  function createMetric(label, value) {
    const item = document.createElement("div");
    item.className = "reward-metric";
    const labelElement = document.createElement("span");
    const valueElement = document.createElement("strong");
    labelElement.textContent = label;
    valueElement.textContent = value;
    item.append(labelElement, valueElement);
    return item;
  }

  function renderNextBadge(panel, nextBadge) {
    const target = panel.querySelector(".reward-next-badge");
    target.innerHTML = "";
    if (!nextBadge) {
      target.textContent = "全部徽章已解锁，继续保持！";
      return;
    }
    const title = document.createElement("strong");
    const progress = document.createElement("span");
    const bar = document.createElement("span");
    const fill = document.createElement("span");
    title.textContent = `下一枚徽章：${nextBadge.emoji} ${nextBadge.title}`;
    progress.textContent = `${nextBadge.progress.current}/${nextBadge.progress.target} · ${nextBadge.description}`;
    bar.className = "reward-progress reward-progress--small";
    fill.style.setProperty("--progress", `${Math.round(nextBadge.progress.ratio * 100)}%`);
    bar.appendChild(fill);
    target.append(title, progress, bar);
  }

  function renderBadgeWall(panel, profile) {
    const wall = panel.querySelector(".reward-badge-wall");
    wall.innerHTML = "";
    profile.badges.forEach((badge) => {
      const item = document.createElement("article");
      item.className = `reward-badge${badge.unlocked ? " is-unlocked" : ""}`;
      const icon = document.createElement("span");
      const title = document.createElement("strong");
      const description = document.createElement("p");
      icon.textContent = badge.unlocked ? badge.emoji : "🔒";
      title.textContent = badge.title;
      description.textContent = badge.unlocked ? badge.description : `${badge.progress.current}/${badge.progress.target}`;
      item.append(icon, title, description);
      wall.appendChild(item);
    });
  }

  function ensureRewardPanel() {
    let panel = document.getElementById("reward-system-panel");
    if (panel) {
      return panel;
    }
    const hero = document.querySelector(".hero");
    if (!hero) {
      return null;
    }
    panel = document.createElement("section");
    panel.id = "reward-system-panel";
    panel.className = "reward-system-panel";
    panel.innerHTML = `
      <div class="reward-system-panel__main">
        <div class="reward-level-badge" aria-hidden="true"></div>
        <div>
          <span class="section-tag">成长奖励</span>
          <h2></h2>
          <p class="muted"></p>
          <div class="reward-progress"><span></span></div>
        </div>
      </div>
      <div class="reward-metrics"></div>
      <div class="reward-next-badge"></div>
      <details class="reward-badge-details">
        <summary>查看徽章墙</summary>
        <div class="reward-badge-wall"></div>
      </details>
    `;
    hero.insertAdjacentElement("afterend", panel);
    return panel;
  }

  function renderRewardPanel(profile) {
    const panel = ensureRewardPanel();
    if (!panel) {
      return;
    }
    panel.querySelector(".reward-level-badge").textContent = profile.level.emoji;
    panel.querySelector("h2").textContent = `${profile.level.title} · Lv.${profile.level.level}`;
    panel.querySelector(".reward-system-panel__main .muted").textContent = `${profile.summary.subtitle}。${profile.summary.nextLevelText}`;
    panel.querySelector(".reward-progress > span").style.setProperty("--progress", `${Math.round(profile.level.progress * 100)}%`);

    const metrics = panel.querySelector(".reward-metrics");
    metrics.innerHTML = "";
    metrics.append(
      createMetric("成长值", profile.points),
      createMetric("连续学习", `${profile.metrics.currentStreak} 天`),
      createMetric("已完成", `${profile.metrics.completedCount} 题`),
      createMetric("已掌握", `${profile.metrics.masteredCount} 个`),
      createMetric("已获徽章", `${profile.unlockedBadges.length}/${profile.badges.length}`)
    );
    renderNextBadge(panel, profile.nextBadge);
    renderBadgeWall(panel, profile);
  }

  function ensureDashboardRewardPanel() {
    const dashboard = document.getElementById("parent-dashboard");
    if (!dashboard) {
      return null;
    }
    let panel = document.getElementById("reward-dashboard-panel");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "reward-dashboard-panel";
      panel.className = "reward-dashboard-panel";
      const mistakePanel = document.getElementById("mistake-dashboard-panel");
      const masteryPanel = document.getElementById("mastery-overview-panel");
      const dashboardCards = document.getElementById("dashboard-cards");
      (mistakePanel || masteryPanel || dashboardCards || dashboard).insertAdjacentElement("afterend", panel);
    }
    return panel;
  }

  function renderDashboardReward(profile) {
    const panel = ensureDashboardRewardPanel();
    if (!panel) {
      return;
    }
    const nextBadgeText = profile.nextBadge ? `${profile.nextBadge.title}：${profile.nextBadge.progress.current}/${profile.nextBadge.progress.target}` : "全部徽章已解锁";
    panel.innerHTML = "";
    const title = document.createElement("h3");
    const summary = document.createElement("p");
    const grid = document.createElement("div");
    title.textContent = "成长奖励概览";
    summary.className = "muted";
    summary.textContent = `${profile.summary.title}，${profile.summary.nextLevelText}。下一目标：${nextBadgeText}。`;
    grid.className = "reward-dashboard-grid";
    grid.append(
      createMetric("等级", `Lv.${profile.level.level}`),
      createMetric("成长值", profile.points),
      createMetric("徽章", `${profile.unlockedBadges.length}/${profile.badges.length}`),
      createMetric("连续学习", `${profile.metrics.currentStreak} 天`)
    );
    panel.append(title, summary, grid);
  }

  function showRewardToast(newBadges, levelUp) {
    if ((!newBadges || newBadges.length === 0) && !levelUp) {
      return;
    }
    const toast = document.createElement("div");
    toast.className = "reward-toast";
    const badgeText = newBadges?.length ? `新徽章：${newBadges.map((badge) => `${badge.emoji} ${badge.title}`).join("、")}` : "";
    toast.innerHTML = `
      <strong>${levelUp ? "🎉 等级提升！" : "🎉 获得奖励！"}</strong>
      <p>${badgeText || "学习成长值提升，继续保持！"}</p>
    `;
    document.body.appendChild(toast);
    root.setTimeout(() => toast.classList.add("is-visible"), 20);
    root.setTimeout(() => {
      toast.classList.remove("is-visible");
      root.setTimeout(() => toast.remove(), 260);
    }, 4200);
  }

  function syncRewardState(profile) {
    const stored = readRewardState();
    const newBadges = root.RewardSystem.diffUnlockedBadges(stored.unlockedBadgeIds || [], profile.badges);
    const levelUp = profile.level.level > Number(stored.lastLevel || 1);
    const nextState = {
      unlockedBadgeIds: profile.unlockedBadges.map((badge) => badge.id),
      lastLevel: Math.max(Number(stored.lastLevel || 1), profile.level.level)
    };
    saveRewardState(nextState);
    showRewardToast(newBadges, levelUp);
  }

  function renderRewardSystem() {
    if (!root.RewardSystem || typeof document === "undefined") {
      return;
    }
    const profile = getRewardProfile();
    renderRewardPanel(profile);
    renderDashboardReward(profile);
    syncRewardState(profile);
  }

  function scheduleRender() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    const callback = () => {
      scheduled = false;
      renderRewardSystem();
    };
    if (root.requestAnimationFrame) {
      root.requestAnimationFrame(callback);
    } else {
      root.setTimeout(callback, 0);
    }
  }

  function observe() {
    if (!("MutationObserver" in root)) {
      return;
    }
    ["hero-stats", "dashboard-cards", "mastery-overview-panel", "mistake-dashboard-panel", "practice-list", "wrong-book-list"].forEach((id) => {
      const element = document.getElementById(id);
      if (!element) {
        return;
      }
      const observer = new MutationObserver(scheduleRender);
      observer.observe(element, { childList: true, subtree: true, characterData: true });
    });
  }

  function boot() {
    renderRewardSystem();
    observe();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
