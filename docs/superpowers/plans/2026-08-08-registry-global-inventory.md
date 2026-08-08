# 章节注册体系与全局背包存档 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将章节内容来源统一收敛到可扩展的声明式注册表，并把背包从章节状态副本升级为存档根级的唯一权威数据，同时兼容现有旧存档。

**Architecture:** 新增独立的章节注册配置层，集中声明每章的题库、补充题数量和内容能力；`chapterRegistry.js` 只负责通用解析，不再按章节写分支。Campaign 运行态保留 ProgressionModel 所需的 `state.inventory` 兼容投影，但持久化时只写根级 `inventory`，加载旧存档时合并所有历史副本并剥离章节内背包。

**Tech Stack:** Node.js CommonJS、浏览器 localStorage、Node test runner、Vite、Playwright。

## Global Constraints

- 不删除或覆盖用户已有未提交改动。
- 不改变题目、奖励、章节解锁、合成和掌握度规则。
- 旧版 `math-quest-game-v1`、`math-quest-campaign-v2`、独立背包键和章节内 inventory 均必须可迁移。
- 背包持久化后的 canonical shape 只能有一个根级 `inventory`，`chapterStates[*]` 不再写入 inventory。
- 运行时 API 继续兼容现有 ProgressionModel 与 GameApp 调用，避免本次重构扩散到题目逻辑。

---

### Task 1: 锁定声明式章节注册契约

**Files:**
- Create: `game/chapterRegistrations.js`
- Modify: `game/chapterRegistry.js`
- Test: `tests/chapterRegistry.test.js`

- [ ] **Step 1: Write the failing tests**

  Assert that every `CHAPTER_IDS` entry resolves through one registration object, the registration contains `chapterId`, `nativeModules`, `supplementalQuestionsByModule`, and `supplementalCount`, and the registry source has no chapter-specific selection branch.

- [ ] **Step 2: Run the targeted registry tests and observe the failure**

  Run `node --test tests/chapterRegistry.test.js`.
  Expected failure: `chapterRegistrations.js` is missing and the registry does not expose the unified registration contract.

- [ ] **Step 3: Implement the registration layer**

  Move the existing chapter pack imports and `CHAPTER_SOURCES` declarations into `game/chapterRegistrations.js`, export frozen `CHAPTER_REGISTRATIONS` and `getChapterRegistration(chapterId)`, then make `chapterRegistry.js` consume only that generic API. `findModule` must use the declared native module first and the optional legacy module list as fallback for every chapter, without a chapter-id regex.

- [ ] **Step 4: Run the targeted tests**

  Run `node --test tests/chapterRegistry.test.js`.
  Expected output: all registry tests pass, including the new registration contract test.

### Task 2: Lock the global inventory canonical save shape

**Files:**
- Modify: `game/campaignModel.js`
- Modify: `game/storageAdapter.js`
- Test: `tests/campaignModel.test.js`
- Test: `tests/storageAdapter.test.js`

- [ ] **Step 1: Write failing migration tests**

  Add tests for: serialized campaigns contain root `inventory` and no chapter-level inventories; legacy chapter inventories are merged with stack limits; a saved canonical record remains one inventory after a save/load round trip; and old split campaign plus inventory keys still migrate.

- [ ] **Step 2: Run the targeted tests and observe the failure**

  Run `node --test tests/campaignModel.test.js tests/storageAdapter.test.js`.
  Expected failure: the current serialized campaign stores inventory under each chapter and atomic migration recreates those copies.

- [ ] **Step 3: Implement canonicalization and migration**

  Add campaign helpers that resolve inventory from explicit input, root inventory, legacy independent inventory, and all chapter-state inventories. `serializeCampaign` must write that inventory once at the root and strip `inventory` from every serialized chapter state. Update atomic save migration and save canonicalization to merge legacy copies once, preserve stack limits, and emit only the root-level inventory.

- [ ] **Step 4: Run targeted tests**

  Run `node --test tests/campaignModel.test.js tests/storageAdapter.test.js`.
  Expected output: all migration and canonical-shape tests pass.

### Task 3: Reconnect the app to the canonical inventory

**Files:**
- Modify: `game/gameApp.js`
- Modify: `tests/campaignModel.test.js` if runtime assertions require the root inventory
- Test: `tests/gameEntry.test.js`

- [ ] **Step 1: Write the failing integration assertion**

  Mount or exercise the campaign transition path so awarding/crafting in one chapter updates `campaign.inventory`, switching chapters reads the same inventory, and the serialized payload has no chapter-local inventory.

- [ ] **Step 2: Run the targeted integration test**

  Run `node --test tests/gameEntry.test.js tests/campaignModel.test.js`.
  Expected failure: GameApp currently synchronizes inventory by copying it into every chapter state and does not treat the campaign root as the sole source.

- [ ] **Step 3: Implement the minimal app wiring**

  Keep `state.inventory` as a runtime compatibility projection for existing ProgressionModel calls, but set and read `campaign.inventory` at every persistence boundary, chapter switch, mission claim, crafting action, and reward settlement. Ensure `CampaignModel.synchronizeInventory` refreshes the active projection without serializing chapter copies.

- [ ] **Step 4: Run the targeted integration tests**

  Run `node --test tests/gameEntry.test.js tests/campaignModel.test.js`.
  Expected output: global inventory remains identical across chapter switches and reloads.

### Task 4: Full verification and compatibility audit

**Files:**
- Modify: `tests/chapterRegistry.test.js`, `tests/campaignModel.test.js`, `tests/storageAdapter.test.js` only if assertions need final API names.

- [ ] **Step 1: Run syntax, unit, content, build, and UI checks**

  Run `npm run check`, `npm test`, `npm run validate:release`, `npm run build`, `npm run check:visual-assets`, `npm run check:bundle`, `npm run test:game-ui`, `npm run audit:low-performance`, and `npm run smoke`.

- [ ] **Step 2: Inspect the canonical save payload**

  Verify a generated save has exactly one `inventory` object at the root and that all chapter state objects omit `inventory`.

- [ ] **Step 3: Review the diff boundary**

  Run `git diff --check` and `git status --short`; preserve unrelated existing changes and do not reset or clean the workspace.
