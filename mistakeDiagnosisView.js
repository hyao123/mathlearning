(function attachMistakeDiagnosisView(root) {
  const progressStorageKey = "mathlearning-progress-v2";
  let scheduled = false;

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function readState() {
    try {
      return safeParse(root.localStorage?.getItem(progressStorageKey), { wrongBook: [] });
    } catch (error) {
      return { wrongBook: [] };
    }
  }

  function getWrongBook() {
    return Array.isArray(readState().wrongBook) ? readState().wrongBook : [];
  }

  function createTagPill(tagId) {
    const info = root.MistakeDiagnosis.getTagInfo(tagId);
    const pill = document.createElement("span");
    pill.className = "mistake-tag-pill";
    pill.textContent = info?.label || tagId;
    pill.title = info ? `${info.description} 建议：${info.advice}` : tagId;
    return pill;
  }

  function createTagList(tags = []) {
    const list = document.createElement("div");
    list.className = "mistake-tag-list";
    tags.forEach((tagId) => list.appendChild(createTagPill(tagId)));
    return list;
  }

  function decorateWrongItems() {
    const wrongBook = getWrongBook();
    const byPrompt = new Map(wrongBook.map((item) => [item.prompt, item]));
    const byTitle = new Map(wrongBook.map((item) => [item.title, item]));
    document.querySelectorAll("#wrong-book-list .wrong-item").forEach((element) => {
      if (element.querySelector(".mistake-tag-list")) {
        return;
      }
      const prompt = element.querySelector("p")?.textContent?.trim();
      const title = element.querySelector("h4")?.textContent?.trim();
      const item = byPrompt.get(prompt) || byTitle.get(title);
      if (!item) {
        return;
      }
      const tags = root.MistakeDiagnosis.getTagsForWrongItem(item);
      if (tags.length === 0) {
        return;
      }
      const label = document.createElement("p");
      label.className = "muted mistake-tag-heading";
      label.textContent = "可能错因：";
      element.append(label, createTagList(tags));
    });
  }

  function createEmptyDiagnosis() {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "暂无错题，积累错题后会自动生成错因诊断。";
    return empty;
  }

  function renderWrongBookDiagnosis() {
    const wrongBookPanel = document.getElementById("wrong-book");
    const wrongBookList = document.getElementById("wrong-book-list");
    if (!wrongBookPanel || !wrongBookList) {
      return;
    }
    let panel = document.getElementById("mistake-diagnosis-panel");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "mistake-diagnosis-panel";
      panel.className = "mistake-diagnosis-panel";
      wrongBookList.insertAdjacentElement("beforebegin", panel);
    }

    const wrongBook = getWrongBook();
    const summary = root.MistakeDiagnosis.summarizeWrongBook(wrongBook);
    panel.innerHTML = "";
    const title = document.createElement("h3");
    title.textContent = "错因诊断";
    panel.appendChild(title);

    if (summary.length === 0) {
      panel.appendChild(createEmptyDiagnosis());
      return;
    }

    const intro = document.createElement("p");
    intro.className = "muted";
    const primary = summary[0];
    intro.textContent = `当前最主要错因：${primary.label}（${primary.count} 道）。建议：${primary.advice}`;
    panel.appendChild(intro);

    const grid = document.createElement("div");
    grid.className = "mistake-diagnosis-grid";
    summary.slice(0, 4).forEach((item) => {
      const card = document.createElement("article");
      card.className = "mistake-diagnosis-card";
      const heading = document.createElement("h4");
      const count = document.createElement("strong");
      const description = document.createElement("p");
      const advice = document.createElement("p");
      heading.textContent = item.label;
      count.textContent = `${item.count} 道`;
      description.className = "muted";
      advice.className = "muted";
      description.textContent = item.description;
      advice.textContent = `建议：${item.advice}`;
      card.append(heading, count, description, advice);
      grid.appendChild(card);
    });
    panel.appendChild(grid);
  }

  function renderDashboardDiagnosis() {
    const parentDashboard = document.getElementById("parent-dashboard");
    const dashboardCards = document.getElementById("dashboard-cards");
    if (!parentDashboard || !dashboardCards) {
      return;
    }
    let panel = document.getElementById("mistake-dashboard-panel");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "mistake-dashboard-panel";
      panel.className = "mistake-dashboard-panel";
      const masteryPanel = document.getElementById("mastery-overview-panel");
      (masteryPanel || dashboardCards).insertAdjacentElement("afterend", panel);
    }
    const summary = root.MistakeDiagnosis.summarizeWrongBook(getWrongBook());
    panel.innerHTML = "";
    const title = document.createElement("h3");
    title.textContent = "错因排行";
    panel.appendChild(title);
    if (summary.length === 0) {
      panel.appendChild(createEmptyDiagnosis());
      return;
    }
    const list = document.createElement("div");
    list.className = "mistake-dashboard-list";
    summary.slice(0, 5).forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "mistake-dashboard-row";
      const rank = document.createElement("span");
      const main = document.createElement("div");
      const count = document.createElement("strong");
      rank.textContent = `#${index + 1}`;
      const label = document.createElement("h4");
      const advice = document.createElement("p");
      advice.className = "muted";
      label.textContent = item.label;
      advice.textContent = item.advice;
      main.append(label, advice);
      count.textContent = `${item.count} 道`;
      row.append(rank, main, count);
      list.appendChild(row);
    });
    panel.appendChild(list);
  }

  function renderMistakeDiagnosis() {
    if (!root.MistakeDiagnosis || typeof document === "undefined") {
      return;
    }
    renderWrongBookDiagnosis();
    renderDashboardDiagnosis();
    decorateWrongItems();
  }

  function scheduleRender() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    const callback = () => {
      scheduled = false;
      renderMistakeDiagnosis();
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
    ["wrong-book-list", "dashboard-cards", "mastery-overview-panel"].forEach((id) => {
      const element = document.getElementById(id);
      if (!element) {
        return;
      }
      const observer = new MutationObserver(scheduleRender);
      observer.observe(element, { childList: true, subtree: true, characterData: true });
    });
  }

  function boot() {
    renderMistakeDiagnosis();
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
