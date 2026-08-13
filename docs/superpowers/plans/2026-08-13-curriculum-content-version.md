# 课程内容版本与旧进度兼容 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在课程题目升级后保留旧章节完成、星级、背包和奖励账本，同时把旧完成关卡标记为“内容已更新”并允许无重复首通奖励地重新挑战。

**Architecture:** 内容版本只附着在编译后的 level、activeRun 和 levelRecord 上，不改变关卡 ID、题目 ID 或奖励账本键。一个纯 `contentVersionModel` 比较当前关卡版本与最近完成版本；进度模型负责持久化版本，地图渲染器只消费派生状态。

**Tech Stack:** CommonJS 领域模型、现有 campaign/storage envelope、Node.js 内置测试、现有游戏 UI 行为测试。

## Global Constraints

- 本计划在 `2026-08-13-olympiad-curriculum-foundation-gold-samples.md` Task 6 之后、Task 11 激活金样之前执行。
- 已完成章节、星级、背包、合成结果、首次奖励账本和尝试账本不得回退或清空。
- 旧答题记录保留为历史，不自动视为新内容已完成。
- 未迁入 V3 的关卡行为和显示必须完全不变。
- 内容更新只允许重新挑战，不重复发放首次通关材料。
- 所有修改遵循 TDD，并在每个任务后独立提交。

---

### Task 1: 内容版本纯模型与编译关卡版本

**Files:**
- Create: `game/curriculum/contentVersionModel.js`
- Modify: `game/curriculum/runtimeAdapter.js`
- Modify: `game/chapterBuilder.js`
- Test: `tests/curriculumContentVersion.test.js`

**Interfaces:**
- Consumes: `contentBatchRegistry.getActiveTopicQuestions(chapterId, moduleId)` 和批次 `contentVersion`。
- Produces: `getLevelContentStatus(level, record): "unplayed"|"current"|"updated"`、编译 level 的 `contentVersion`。

- [ ] **Step 1: 写失败测试**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const version = require("../game/curriculum/contentVersionModel.js");

test("只在已完成关卡版本落后时标记 updated", () => {
  assert.equal(version.getLevelContentStatus({ levelId: "a" }, null), "unplayed");
  assert.equal(version.getLevelContentStatus({ levelId: "a" }, { starCount: 3 }), "current");
  assert.equal(version.getLevelContentStatus({ levelId: "a", contentVersion: "gold-v3" }, { starCount: 3 }), "updated");
  assert.equal(version.getLevelContentStatus({ levelId: "a", contentVersion: "gold-v3" }, { starCount: 3, contentVersion: "gold-v3" }), "current");
});
```

- [ ] **Step 2: 运行测试确认模块不存在**

Run: `node --test tests/curriculumContentVersion.test.js`

Expected: FAIL with missing `contentVersionModel.js`.

- [ ] **Step 3: 实现纯状态函数**

```js
function getLevelContentStatus(level, record) {
  if (!record) return "unplayed";
  if (!level?.contentVersion) return "current";
  return record.contentVersion === level.contentVersion ? "current" : "updated";
}

module.exports = { getLevelContentStatus };
```

- [ ] **Step 4: 把活动批次版本附着到编译 level**

`contentBatchRegistry` 的知识点解析结果必须返回 `{ questions, contentVersion }`。`buildLevel` 只在活动 V3 题包存在时增加 `contentVersion`，legacy level 不增加该字段：

```js
return {
  levelId: levelConfig.id,
  moduleId: module.id,
  title: module.title,
  ...(versioned ? { contentVersion: versioned.contentVersion } : {}),
  questions
};
```

- [ ] **Step 5: 运行测试和构建器回归**

Run: `node --test tests/curriculumContentVersion.test.js tests/chapterBuilder.test.js tests/curriculumBatch.test.js`

Expected: PASS；legacy level shape 不新增 `contentVersion`。

- [ ] **Step 6: 提交**

```bash
git add game/curriculum/contentVersionModel.js game/curriculum/runtimeAdapter.js game/chapterBuilder.js tests/curriculumContentVersion.test.js
git commit -m "feat: expose curriculum content versions"
```

---

### Task 2: 运行、结算、序列化和 hydrate 版本

**Files:**
- Modify: `game/progressionModel.js`
- Modify: `tests/progressionModel.test.js`
- Modify: `tests/storageAdapter.test.js`

**Interfaces:**
- Consumes: 编译 level 的可选 `contentVersion`。
- Produces: `activeRun.contentVersion` 和 `levelRecords[levelId].contentVersion`。

- [ ] **Step 1: 写失败测试，锁定星级和奖励账本不变**

```js
test("重玩更新关卡后记录新版本并保留旧星级", () => {
  const initial = {
    ...createState(),
    levelRecords: { "chapter-08-level-8": { starCount: 3 } },
    fixedClaims: { "chapter-08-shortest-path-1": true }
  };
  const started = model.startLevel(initial, "chapter-08-level-8");
  assert.equal(started.activeRun.contentVersion, "gold-v3");
  const settled = finishAllQuestions(started);
  assert.equal(settled.levelRecords["chapter-08-level-8"].starCount, 3);
  assert.equal(settled.levelRecords["chapter-08-level-8"].contentVersion, "gold-v3");
  assert.deepEqual(settled.fixedClaims, initial.fixedClaims);
});

test("hydrate 接受缺少版本的旧记录并拒绝非字符串版本", () => {
  const legacy = model.hydrateState({ levelRecords: { "chapter-01-level-1": { starCount: 2 } } }, chapter);
  assert.deepEqual(legacy.levelRecords["chapter-01-level-1"], { starCount: 2 });
});
```

- [ ] **Step 2: 运行测试确认版本没有持久化**

Run: `node --test tests/progressionModel.test.js tests/storageAdapter.test.js`

Expected: FAIL because `activeRun.contentVersion` is undefined for an active V3 level.

- [ ] **Step 3: 在 start、settle 和 serialize 中传递版本**

```js
const run = {
  levelId,
  ...(level.contentVersion ? { contentVersion: level.contentVersion } : {}),
  questionIndex: 0,
  // 保留当前其他字段
};

const record = {
  ...existingRecord,
  starCount: Math.max(existingRecord?.starCount || 0, starCount),
  ...(run.contentVersion ? { contentVersion: run.contentVersion } : {})
};
```

序列化只在版本是非空字符串时输出。不得重建或过滤 `fixedClaims`、`attemptLedger`、inventory 或旧 settlement。

- [ ] **Step 4: 在 sanitize/hydrate 中兼容旧记录**

```js
const sanitized = { starCount };
if (typeof record.contentVersion === "string" && record.contentVersion.trim()) {
  sanitized.contentVersion = record.contentVersion;
}
```

activeRun 的版本必须与当前 level 版本一致；若存档运行来自旧内容且题目 ID 仍相同，也要丢弃旧 activeRun 并返回地图，避免在一局中混用两个内容版本。

- [ ] **Step 5: 运行进度和存储回归**

Run: `node --test tests/progressionModel.test.js tests/storageAdapter.test.js tests/rewardEconomy.test.js`

Expected: PASS；旧存档可加载，新版本可往返序列化，奖励测试无变化。

- [ ] **Step 6: 提交**

```bash
git add game/progressionModel.js tests/progressionModel.test.js tests/storageAdapter.test.js
git commit -m "feat: persist completed curriculum versions"
```

---

### Task 3: 地图更新提示和重玩行为

**Files:**
- Modify: `game/gameAppRenderers.js`
- Modify: `game/game.css`
- Modify: `scripts/game-ui-behavior.js`

**Interfaces:**
- Consumes: `ContentVersionModel.getLevelContentStatus(level, record)`。
- Produces: 地图节点文案 `内容已更新 · 可重新挑战` 和 `data-content-status="updated"`。

- [ ] **Step 1: 写失败 UI 行为检查**

在 `scripts/game-ui-behavior.js` 增加场景：注入已完成但无 `contentVersion` 的第 8 章第 8 关记录，再加载活动 `gold-v3`，断言：

```js
const updated = page.locator('[data-level-id="chapter-08-level-8"]');
await expect(updated).toHaveAttribute("data-content-status", "updated");
await expect(updated).toContainText("内容已更新");
await expect(updated).toBeEnabled();
```

- [ ] **Step 2: 运行 UI 测试确认缺少更新标记**

Run: `npm run test:game-ui`

Expected: FAIL because the level node has no `data-content-status`.

- [ ] **Step 3: 渲染派生状态**

```js
const contentStatus = ContentVersionModel.getLevelContentStatus(level, record);
button.dataset.contentStatus = contentStatus;
const recordText = contentStatus === "updated"
  ? "内容已更新 · 可重新挑战"
  : `${"★".repeat(record.starCount)}${"☆".repeat(3 - record.starCount)}`;
```

ARIA label 同步包含“内容已更新，可重新挑战”。更新状态不得禁用关卡，也不得把它视为未解锁。

- [ ] **Step 4: 增加非侵入样式**

```css
.level-node[data-content-status="updated"] .level-node__status {
  color: var(--gold-strong, #ffd166);
}
```

不得改变节点尺寸或关卡地图布局。

- [ ] **Step 5: 验证 UI 与奖励幂等**

Run: `npm run test:game-ui && node --test tests/progressionModel.test.js tests/rewardEconomy.test.js`

Expected: PASS；更新关卡可点击，重新完成后首次材料数量不增加。

- [ ] **Step 6: 提交**

```bash
git add game/gameAppRenderers.js game/game.css scripts/game-ui-behavior.js
git commit -m "feat: show updated curriculum levels"
```

---

### Task 4: 全量兼容验证

**Files:**
- Modify: `docs/curriculum/content-authoring-v3.md`（若主计划尚未创建该文件，则把本节作为其“内容版本”章节输入）

**Interfaces:**
- Consumes: Tasks 1～3。
- Produces: 可供金样激活使用的兼容证明。

- [ ] **Step 1: 运行完整单元测试**

Run: `npm test`

Expected: PASS，现有与新增测试全部通过。

- [ ] **Step 2: 运行发布和 UI 检查**

Run: `npm run check && npm run validate:release && npm run test:game-ui && npm run build`

Expected: 全部 exit 0。

- [ ] **Step 3: 验证工作树**

Run: `git diff --check && git status --short`

Expected: 无空白错误；仅出现内容版本文档的预期改动。

- [ ] **Step 4: 提交文档输入**

```bash
git add docs/curriculum/content-authoring-v3.md
git commit -m "docs: explain curriculum content versioning"
```
