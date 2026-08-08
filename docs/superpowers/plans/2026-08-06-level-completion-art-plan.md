# 每关完成作品展示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在每个关卡结算页展示对应组件的蓝图/成品状态，并用阶段部件与终极工程路线增强成就感，同时保持现有答题、奖励、背包和合成逻辑不变。

**Architecture:** 新增独立的 `levelArtifactModel` 纯数据模块，从章节项目配方和当前背包实时推导关卡作品状态；`gameApp.js` 只负责把模型结果渲染为结算页作品卡和 12 节点路线。作品视觉继续通过现有 `ItemVisuals`/项目 SVG 按需加载，CSS 提供低成本的稀有度边框、扫描线和动画降级。

**Tech Stack:** 原生 CommonJS 游戏模块、Vite ESM 入口、DOM/SVG 渲染、CSS、Node 内置测试、Playwright 浏览器行为测试。

## Global Constraints

- 不自动合成、不自动消耗材料、不修改奖励发放。
- 不修改题目、答案、奖励账本、背包和关卡存档结构。
- 6 个章节、每章 12 个关卡均自动适用，后续标准章节无需手写结算逻辑。
- 复用现有视觉资源，不引入外部图片、依赖或高干扰动画。
- 蓝图状态不能显示“作品已完成”；只有背包中确实存在组件时才显示成品完成状态。
- 支持移动端、`prefers-reduced-motion` 和低性能模式静态降级。
- 只修改本功能涉及的文件，不覆盖工作区既有未提交改动。

---

### Task 1: 建立关卡作品模型

**Files:**
- Create: `C:/Users/24960/Documents/mathlearning/game/levelArtifactModel.js`
- Create: `C:/Users/24960/Documents/mathlearning/tests/levelArtifactModel.test.js`
- Reference: `C:/Users/24960/Documents/mathlearning/game/itemCatalog.js`
- Reference: `C:/Users/24960/Documents/mathlearning/game/levelRewardConfig.js`

**Interfaces:**
- Consumes: `GameItemCatalog.getSuperProject(chapterId)`、`LevelRewardConfig.getLevelRewardConfig(levelId)`、`state.inventory`。
- Produces: `getLevelArtifact(chapterId, levelId, state)`，返回 `componentId`、`component`、`status`、`ownedQuantity`、`requiredQuantity`、`partId`、`part`、`partProgress`、`finalProject`、`routeIndex`、`routeTotal`。

- [ ] **Step 1: Write the failing model tests**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const catalog = require("../game/itemCatalog.js");
const model = require("../game/levelArtifactModel.js");

test("每个章节每个关卡解析到唯一组件和稳定路线位置", () => {
  for (const chapterId of ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05", "chapter-06"]) {
    const project = catalog.getSuperProject(chapterId);
    const artifacts = project.componentRecipes.map((_, index) => model.getLevelArtifact(
      chapterId,
      `${chapterId}-level-${index + 1}`,
      { inventory: {} }
    ));
    assert.equal(artifacts.length, 12);
    assert.equal(new Set(artifacts.map((entry) => entry.componentId)).size, 12);
    assert.deepEqual(artifacts.map((entry) => entry.routeIndex), Array.from({ length: 12 }, (_, i) => i + 1));
    assert.deepEqual(artifacts.map((entry) => entry.routeTotal), Array(12).fill(12));
  }
});

test("作品状态按材料和成品库存区分蓝图、可装配和完成", () => {
  const blueprint = model.getLevelArtifact("chapter-01", "chapter-01-level-1", { inventory: {} });
  assert.equal(blueprint.status, "blueprint");
  const recipe = catalog.getSuperProject("chapter-01").materialRecipes[0];
  const readyInventory = Object.fromEntries(recipe.inputs.map(({ itemId, quantity }) => [itemId, quantity]));
  const ready = model.getLevelArtifact("chapter-01", "chapter-01-level-1", { inventory: readyInventory });
  assert.equal(ready.status, "ready");
  const completed = model.getLevelArtifact("chapter-01", "chapter-01-level-1", { inventory: { "j20-frame-rib": 1 } });
  assert.equal(completed.status, "completed");
});

test("阶段部件进度只统计对应的三个组件，终极工程保持只读", () => {
  const artifact = model.getLevelArtifact("chapter-01", "chapter-01-level-3", {
    inventory: { "j20-frame-rib": 1, "j20-wing-spar": 1 }
  });
  assert.equal(artifact.partId, "j20-airframe");
  assert.deepEqual(artifact.partProgress, { completed: 2, total: 3 });
  assert.equal(artifact.finalProject.id, "j20-sky-fighter");
});

test("未知章节或关卡返回空结果，不让展示层崩溃", () => {
  assert.equal(model.getLevelArtifact("unknown", "unknown-level", { inventory: {} }), null);
});
```

- [ ] **Step 2: Run the model tests and verify they fail**

Run: `node --test tests/levelArtifactModel.test.js`

Expected: FAIL because `game/levelArtifactModel.js` does not exist yet.

- [ ] **Step 3: Implement the pure model**

Implement the following algorithm in `game/levelArtifactModel.js`:

```js
const GameItemCatalog = require("./itemCatalog.js");
const LevelRewardConfig = require("./levelRewardConfig.js");

function quantity(inventory, itemId) {
  return Number.isInteger(inventory?.[itemId]) && inventory[itemId] > 0 ? inventory[itemId] : 0;
}

function recipeReady(inventory, recipe) {
  return Boolean(recipe) && recipe.inputs.every(({ itemId, quantity: required }) => quantity(inventory, itemId) >= required);
}

function getLevelArtifact(chapterId, levelId, state = {}) {
  const config = LevelRewardConfig.getLevelRewardConfig(levelId);
  const project = GameItemCatalog.getSuperProject(chapterId);
  if (!config || !project || config.chapterId !== chapterId) return null;
  const component = GameItemCatalog.getItem(config.componentId);
  const part = GameItemCatalog.getItem(config.stagePartId);
  const finalProject = GameItemCatalog.getItem(project.finalRecipe.output.itemId);
  const inventory = state.inventory && typeof state.inventory === "object" ? state.inventory : {};
  const ownedQuantity = quantity(inventory, config.componentId);
  const partInputs = config.stageRecipe.inputs.map(({ itemId }) => itemId);
  const partProgress = {
    completed: partInputs.filter((itemId) => quantity(inventory, itemId) > 0).length,
    total: partInputs.length
  };
  const routeIndex = project.componentRecipes.findIndex(({ output }) => output.itemId === config.componentId) + 1;
  if (routeIndex <= 0 || routeIndex > project.componentRecipes.length) return null;
  return {
    componentId: config.componentId,
    component,
    status: ownedQuantity > 0 ? "completed" : recipeReady(inventory, config.materialRecipe) || recipeReady(inventory, config.componentRecipe) ? "ready" : "blueprint",
    ownedQuantity,
    requiredQuantity: config.componentRecipe.output.quantity,
    partId: config.stagePartId,
    part,
    partProgress,
    finalProject,
    routeIndex,
    routeTotal: project.componentRecipes.length
  };
}

module.exports = { getLevelArtifact };
```

The implementation must also normalize invalid inventories to `{}` and return `null` for an invalid project or an out-of-range component mapping instead of throwing from the render path.

- [ ] **Step 4: Run the model tests and verify they pass**

Run: `node --test tests/levelArtifactModel.test.js`

Expected: PASS with all model cases green.

- [ ] **Step 5: Run the existing catalog/progression tests**

Run: `node --test tests/itemCatalog.test.js tests/levelRewardConfig.test.js tests/progressionModel.test.js`

Expected: PASS with no changes to reward, inventory, or progression behavior.

### Task 2: Wire the model into the browser entry

**Files:**
- Modify: `C:/Users/24960/Documents/mathlearning/src/game-main.js`
- Test: `C:/Users/24960/Documents/mathlearning/tests/gameEntry.test.js`

**Interfaces:**
- Consumes: CommonJS registry loader already used by the entry file.
- Produces: `globalThis.LevelArtifactModel` before `gameApp.js` is imported.

- [ ] **Step 1: Add an entry-loader regression test**

Add an assertion to the existing entry test that the browser bundle source loads `levelArtifactModel.js` and exposes `LevelArtifactModel` before mounting the app:

```js
assert.match(entrySource, /levelArtifactModel\.js/);
assert.match(entrySource, /LevelArtifactModel/);
```

- [ ] **Step 2: Run the focused entry test and verify it fails**

Run: `node --test tests/gameEntry.test.js`

Expected: FAIL because the entry source does not yet register the new model.

- [ ] **Step 3: Register the model in dependency order**

After `LevelRewardConfig` is loaded and before `GameApp` is imported, add:

```js
const LevelArtifactModel = await loadCommonJs(() => import("../game/levelArtifactModel.js"), "./levelArtifactModel.js");
```

Then add `LevelArtifactModel` to the `Object.assign(globalThis, { ... })` registry. Do not change existing load order or storage initialization.

- [ ] **Step 4: Run the focused entry test and syntax checks**

Run: `node --test tests/gameEntry.test.js && npm run check`

Expected: PASS with no syntax errors.

### Task 3: Render the work reveal and 12-node route in settlement

**Files:**
- Modify: `C:/Users/24960/Documents/mathlearning/game/gameApp.js`
- Test: `C:/Users/24960/Documents/mathlearning/scripts/game-ui-behavior.js`

**Interfaces:**
- Consumes: `LevelArtifactModel.getLevelArtifact(chapter.chapterId, settlement.levelId, state)` and existing `createItemIcon`.
- Produces: `[data-settlement-artifact]`, `[data-artifact-route]`, `[data-artifact-status]`, `[data-artifact-milestone]`, `[data-artifact-component]` DOM hooks.

- [ ] **Step 1: Add failing browser assertions for the first settlement**

Immediately after the existing settlement assertions in `scripts/game-ui-behavior.js`, add:

```js
assert.equal(await page.locator("[data-settlement-artifact]").count(), 1);
assert.equal(await page.locator("[data-artifact-component='j20-frame-rib']").count(), 1);
assert.equal(await page.locator("[data-artifact-status='blueprint']").count(), 1);
assert.equal(await page.locator("[data-artifact-route] [data-artifact-node]").count(), 12);
assert.equal(await page.locator("[data-artifact-route] [data-artifact-node='1'][data-node-status='current']").count(), 1);
assert.equal(await page.locator("[data-artifact-milestone]").count(), 1);
```

- [ ] **Step 2: Run the UI test and verify it fails**

Run: `npm run test:game-ui`

Expected: FAIL because the settlement has no artifact showcase or route hooks.

- [ ] **Step 3: Add the model dependency and rendering helpers**

Add `LevelArtifactModel` to `requireDependencies()`. Add focused helpers beside the existing settlement helpers:

```js
function appendArtifactStatus(parent, artifact) {
  const statusText = { blueprint: "蓝图已记录", ready: "可以装配", completed: "作品已完成" }[artifact.status];
  const status = appendText(parent, "span", statusText, "settlement-artifact__status");
  status.dataset.artifactStatus = artifact.status;
  parent.dataset.artifactStatus = artifact.status;
  return status;
}

function renderArtifactShowcase(parent, artifact) {
  if (!artifact) return;
  const card = document.createElement("article");
  card.className = `settlement-artifact settlement-artifact--${artifact.status}`;
  card.dataset.settlementArtifact = "";
  const heading = appendText(card, "p", `作品解锁：${artifact.component.name}`, "settlement-artifact__eyebrow");
  heading.dataset.artifactComponent = artifact.componentId;
  appendText(card, "h2", artifact.component.name, "settlement-artifact__title");
  const visual = createItemIcon(artifact.component, "settlement-artifact__visual", { priority: "high" });
  visual.dataset.artifactVisual = artifact.componentId;
  card.append(visual);
  appendArtifactStatus(card, artifact);
  appendText(card, "p", `第 ${artifact.routeIndex} / ${artifact.routeTotal} 件作品`, "settlement-artifact__progress");
  parent.append(card);
}

function renderArtifactRoute(parent, artifact, chapter, state) {
  if (!artifact) return;
  const route = document.createElement("div");
  route.className = "artifact-route";
  route.dataset.artifactRoute = "";
  const project = GameItemCatalog.getSuperProject(chapter.chapterId);
  project.componentRecipes.forEach((recipe, index) => {
    const node = document.createElement("span");
    const itemId = recipe.output.itemId;
    const owned = Number(state.inventory?.[itemId] || 0) > 0;
    node.className = `artifact-route__node artifact-route__node--${owned ? "completed" : index + 1 === artifact.routeIndex ? "current" : "locked"}`;
    node.dataset.artifactNode = String(index + 1);
    node.dataset.nodeStatus = owned ? "completed" : index + 1 === artifact.routeIndex ? "current" : "locked";
    node.title = GameItemCatalog.getItem(itemId).name;
    route.append(node);
  });
  parent.append(route);
}

function renderArtifactMilestone(parent, artifact) {
  if (!artifact) return;
  const card = document.createElement("article");
  card.className = "settlement-artifact__milestone";
  card.dataset.artifactMilestone = "";
  appendText(card, "strong", `${artifact.part.name} · ${artifact.partProgress.completed} / ${artifact.partProgress.total}`, "settlement-artifact__milestone-title");
  appendText(card, "span", `集齐这组组件即可拼装${artifact.part.name}`, "settlement-artifact__milestone-copy");
  if (artifact.routeIndex === artifact.routeTotal) appendText(card, "span", `最终工程预览：${artifact.finalProject.name}`, "settlement-artifact__finale-copy");
  parent.append(card);
}
```

Use `renderArtifactShowcase`, `renderArtifactRoute(parent, artifact, chapter, state)`, and `renderArtifactMilestone` in `renderSettlement()` after the celebration card and before the reward/score content. Compute the artifact once from the current chapter, settlement level, and state. Keep the existing settlement buttons and reward list unchanged.

- [ ] **Step 4: Run the UI test and verify the new settlement passes**

Run: `npm run test:game-ui`

Expected: PASS with the new artifact selectors and all existing answer/reward/navigation assertions green.

- [ ] **Step 5: Add the assembled-state regression path**

In the replay/setup path of `scripts/game-ui-behavior.js`, seed `j20-frame-rib: 1` before opening the first level, complete the level, and assert:

```js
assert.equal(await page.locator("[data-artifact-status='completed']").count(), 1);
assert.equal(await page.locator("[data-artifact-visual='j20-frame-rib']").count(), 1);
```

Run: `npm run test:game-ui`

Expected: PASS; seeding an owned component changes only presentation and does not create an extra reward transaction.

### Task 4: Add the responsive visual treatment and accessibility fallback

**Files:**
- Modify: `C:/Users/24960/Documents/mathlearning/game/game.css`
- Modify: `C:/Users/24960/Documents/mathlearning/scripts/audit-ui.js`
- Modify: `C:/Users/24960/Documents/mathlearning/scripts/audit-low-performance.js`

**Interfaces:**
- Consumes: the settlement DOM hooks from Task 3.
- Produces: responsive artifact card, route nodes, reduced-motion/static styles, and audit assertions.

- [ ] **Step 1: Add failing responsive/a11y assertions**

Add checks that the artifact card is visible, has one meaningful image alt, and does not create horizontal overflow at 375, 768, and 1440 widths:

```js
assert.equal(await page.locator("[data-settlement-artifact]").isVisible(), true);
assert.equal(await page.locator("[data-settlement-artifact] img").count(), 1);
assert.ok((await page.locator("[data-settlement-artifact] img").getAttribute("alt")).length > 0);
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
```

- [ ] **Step 2: Run the audits and verify the new assertions fail**

Run: `npm run audit:ui && npm run audit:low-performance`

Expected: FAIL until the artifact styles and hooks are present in all audited screens.

- [ ] **Step 3: Add the settlement artifact styles**

Add CSS for `.settlement-artifact`, `.settlement-artifact__visual`, `.artifact-route`, `.artifact-route__node`, and `.settlement-artifact__milestone` using the existing palette. The visual card must use `min-width: 0`, `overflow: hidden`, and `max-width: 100%`; the route must wrap on narrow viewports. Add:

```css
@media (prefers-reduced-motion: reduce) {
  .settlement-artifact::after,
  .artifact-route__node--current {
    animation: none;
  }
}

@media (max-width: 640px) {
  .settlement-artifact__visual { width: min(100%, 220px); height: 150px; }
  .artifact-route { grid-template-columns: repeat(6, minmax(0, 1fr)); }
}
```

Add static high-contrast styles for `data-low-performance="true"` without adding JavaScript animation loops.

- [ ] **Step 4: Run the audits and verify they pass**

Run: `npm run audit:ui && npm run audit:low-performance`

Expected: PASS at 375×812, 768×1024, and 1440×1000 with no overflow, missing alt, or continuous-animation violations.

### Task 5: Full regression and release verification

**Files:**
- No new source files.
- Review: all files changed by Tasks 1–4 only.

- [ ] **Step 1: Run focused tests**

Run: `node --test tests/levelArtifactModel.test.js tests/gameEntry.test.js tests/itemCatalog.test.js tests/levelRewardConfig.test.js tests/progressionModel.test.js`

Expected: PASS.

- [ ] **Step 2: Run the full unit and content suites**

Run: `npm test && npm run check && npm run validate:release`

Expected: all unit tests pass; strict release validation reports 6 chapters and 720 questions without content changes.

- [ ] **Step 3: Run browser, performance, build, and bundle checks**

Run: `npm run test:game-ui && npm run test:ui && npm run audit:ui && npm run audit:low-performance && npm run smoke && npm run build && npm run check:bundle`

Expected: all commands pass; no console errors; generated bundle remains under the existing gzip budget.

- [ ] **Step 4: Verify the diff boundary**

Run: `git diff --check; git status --short`

Expected: no whitespace errors; only the new model, its tests, browser wiring, settlement rendering/styles, audit assertions, and this plan/spec are attributable to this feature. Existing unrelated worktree changes remain untouched.

- [ ] **Step 5: Commit only feature files**

Run:

```powershell
git add -- game/levelArtifactModel.js tests/levelArtifactModel.test.js src/game-main.js tests/gameEntry.test.js game/gameApp.js scripts/game-ui-behavior.js game/game.css scripts/audit-ui.js scripts/audit-low-performance.js
git diff --cached --check
git commit -m "feat: add per-level completion artwork showcase"
```

Expected: one focused commit containing only the completed feature files; unrelated pre-existing modifications are not staged.
