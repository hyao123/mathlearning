# Classic Student Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the student default UI into a classic left-navigation, right-question workbench.

**Architecture:** Keep the existing vanilla HTML/CSS/JavaScript app and data flow. Reorganize the DOM around a `.student-shell` with a `.student-sidebar` and `.student-workspace`, while preserving existing element IDs consumed by `app.js`.

**Tech Stack:** Vite, vanilla JavaScript, CSS, Playwright UI tests, Node test runner.

## Global Constraints

- Default student UI must not show parent tools, paper generation, reports, backup, restore, student switching, or reward dashboards.
- Student target is grade two and above; first grade must not appear in student route filters.
- Preserve existing route selection, answer submission, daily practice, wrong-book, and hidden parent/admin workflows.
- Use warm paper, white surfaces, ink-blue text, restrained gold/blue states, thin dividers, compact spacing, and moderate radius.
- Avoid oversized hero sections, nested cards, heavy gradients, decorative blobs, and long explanatory text.
- Keep existing element IDs that application JavaScript depends on.

---

## File Structure

- Modify `scripts/ui-behavior.js`: update behavior assertions for the classic student shell.
- Modify `scripts/smoke-browser.js`: update smoke expectations for the new default title.
- Modify `index.html`: replace hero/top-nav flow with `.student-shell`, `.student-sidebar`, and `.student-workspace`.
- Modify `styles.css`: implement elegant left-nav workbench, question-first workspace, and mobile segmented navigation.
- Modify `app.js` only if rendered copy or route list output needs small alignment; preserve existing APIs.

### Task 1: UI Regression Test For Student Workbench

**Files:**
- Modify: `scripts/ui-behavior.js`
- Modify: `scripts/smoke-browser.js`

**Interfaces:**
- Consumes: existing DOM IDs `#lesson-panel`, `#module-list`, `#daily-practice-panel`, `#wrong-book`, `#parent-tools`.
- Produces: tests that fail until `.student-shell`, `.student-sidebar`, and question-first layout exist.

- [ ] **Step 1: Write the failing UI assertions**

Add these assertions after initial page load in `scripts/ui-behavior.js`:

```js
await page.locator(".student-shell").waitFor({ state: "visible", timeout: 10000 });
await page.locator(".student-sidebar").waitFor({ state: "visible", timeout: 10000 });
await page.locator(".student-workspace #lesson-panel").waitFor({ state: "visible", timeout: 10000 });
const navLabels = await page.locator(".student-nav a").evaluateAll((links) => links.map((link) => link.textContent.trim()));
assert.deepEqual(navLabels, ["路线", "当前题目", "每日练习", "错题复习"]);
const defaultStudentText = await page.locator("body").innerText();
for (const nonStudentWord of ["家长", "组卷", "报告", "备份", "恢复", "学生切换", "成长奖励"]) {
  assert.ok(!defaultStudentText.includes(nonStudentWord), `default student view should not show ${nonStudentWord}`);
}
const lessonBox = await page.locator("#lesson-panel").boundingBox();
const routeBox = await page.locator("#modules").boundingBox();
assert.ok(lessonBox && routeBox && lessonBox.y < routeBox.y, "current lesson should appear before route browser");
```

Update the smoke test heading in `scripts/smoke-browser.js`:

```js
await assertVisibleText(page, "h1", "当前题目");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:ui`

Expected: FAIL because `.student-shell` or `.student-sidebar` is not present.

- [ ] **Step 3: Keep the failing test for implementation**

Do not weaken the assertions. The implementation must satisfy the new structure.

### Task 2: Build The Classic Workbench DOM

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: existing app selectors by preserving IDs.
- Produces: `.student-shell`, `.student-sidebar`, `.student-workspace`, `.student-nav`, and question-first content order.

- [ ] **Step 1: Replace top-level student layout**

Change the `<body>` content so the student-facing layout follows this structure:

```html
<main class="student-shell">
  <aside class="student-sidebar" aria-label="学习导航">
    <div class="student-brand">
      <span class="student-brand__mark">数</span>
      <div>
        <p>二年级以上</p>
        <strong>数学路线</strong>
      </div>
    </div>
    <nav class="student-nav" aria-label="学生导航">
      <a href="#modules">路线</a>
      <a href="#lesson-panel" aria-current="page">当前题目</a>
      <a href="#daily-practice-panel">每日练习</a>
      <a href="#wrong-book">错题复习</a>
    </nav>
    <p class="student-sidebar__note">先看例题，再完成练习。答错的题会自动留下来。</p>
  </aside>

  <section class="student-workspace" aria-label="学习内容">
    <header class="workbench-header">
      <p class="eyebrow">今日学习</p>
      <h1>当前题目</h1>
      <p>按当前关卡练习，完成后再选择下一关。</p>
    </header>

    <section class="panel panel--main lesson-priority" id="lesson-panel">...</section>
    <section class="panel" id="daily-practice-panel">...</section>
    <section class="panel panel--focus" id="wrong-book">...</section>
    <section class="panel route-browser" id="modules">...</section>
    <details class="parent-tools" id="parent-tools">...</details>
  </section>
</main>
```

Move existing `#lesson-panel`, `#daily-practice-panel`, `#wrong-book`, `#modules`, and `#parent-tools` into the indicated order. Do not rename IDs.

- [ ] **Step 2: Remove student-visible hero and kid-start cards**

Delete the old `.top-nav`, `.hero`, and `.kid-start` elements from the default DOM. Keep all template elements unchanged.

- [ ] **Step 3: Run targeted syntax check**

Run: `npm run check`

Expected: PASS with `OK index.html` not applicable because the syntax checker covers JavaScript; JavaScript files should remain OK.

### Task 3: Implement Elegant Workbench Styling

**Files:**
- Modify: `styles.css`

**Interfaces:**
- Consumes: classes from Task 2.
- Produces: desktop left-sidebar layout and mobile compact navigation.

- [ ] **Step 1: Add workbench design tokens**

Update `:root` to use:

```css
--bg: #f6f1e8;
--surface: #fffdf8;
--surface-alt: #f0eadf;
--primary: #1f4f82;
--primary-dark: #16395f;
--accent: #b9852f;
--text: #172033;
--muted: #6f6a60;
--border: #ded3c1;
--shadow: 0 18px 45px rgba(31, 57, 95, 0.08);
```

- [ ] **Step 2: Add desktop workbench layout**

Add CSS:

```css
body {
  background: var(--bg);
  color: var(--text);
}

.student-shell {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
  min-height: 100vh;
}

.student-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 28px 22px;
  background: #162238;
  color: #fdf8ec;
  border-right: 1px solid rgba(255, 255, 255, 0.12);
}

.student-workspace {
  display: grid;
  gap: 18px;
  padding: 28px clamp(22px, 4vw, 56px) 56px;
}

.workbench-header,
.panel,
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow);
}
```

- [ ] **Step 3: Style sidebar navigation and content hierarchy**

Add CSS for `.student-brand`, `.student-nav`, `.student-sidebar__note`, `.workbench-header`, `.lesson-priority`, `.route-browser`, `.panel__header`, `.card--practice`, `.answer-row`, and active/focus states. Keep question text large enough to read comfortably.

- [ ] **Step 4: Add mobile layout**

At `max-width: 760px`, make `.student-shell` one column, `.student-sidebar` non-sticky and auto-height, and `.student-nav` a horizontal segmented bar. Keep `.student-workspace #lesson-panel` visible before route browsing.

- [ ] **Step 5: Run UI audit**

Run: `npm run audit:ui`

Expected: PASS at 375x812, 768x1024, and 1440x1000.

### Task 4: Full Verification And Commit

**Files:**
- Verify all modified files.

**Interfaces:**
- Consumes: completed Tasks 1-3.
- Produces: verified implementation commit.

- [ ] **Step 1: Run full validation**

Run these commands:

```bash
npm run check
npm run validate:content
npm run check:content-snapshot
npm test
npm run build
npm run check:bundle
npm run smoke
npm run test:ui
npm run audit:ui
git diff --check
```

Expected: all commands exit 0. `npm test` should report 95 pass / 0 fail.

- [ ] **Step 2: Inspect desktop and mobile screenshots**

Use Playwright or the existing browser tooling to confirm:

- Desktop shows left navigation and right current-question workspace.
- Mobile shows compact navigation and current question before route browsing.
- Default visible text does not include parent/admin labels.

- [ ] **Step 3: Commit implementation**

Commit only the implementation files and the plan:

```bash
git add docs/superpowers/plans/2026-07-06-classic-student-workbench.md index.html styles.css scripts/ui-behavior.js scripts/smoke-browser.js
git add app.js productExperience.js rewardSystemView.js src/main.js studentProfiles.js
git commit -m "Rebuild student UI as classic workbench"
```
