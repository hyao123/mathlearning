# 原材料加工链与工程补给挑战 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为五章建立“原材料→精炼材料→组件→部件→最终工程”的可验证奖励链，并在主线完成但工程缺料时提供错题/随机组卷补给挑战。

**Architecture:** 章节配置声明精炼材料和配方，`itemCatalog` 暴露克隆后的配方，`inventoryModel` 负责原子合成；`challengeModel` 只负责挑战组卷、缺口计算和运行数据，`progressionModel` 负责持久化、答题和补给账本，`gameApp` 只负责地图、背包与挑战交互。

**Tech Stack:** CommonJS domain modules, Vite browser entry, Node built-in test runner, Playwright UI tests, localStorage persistence.

## Global Constraints

- 覆盖现有五个章节，不启动第六章。
- 不删除已有物品 ID、题目 ID、章节进度、奖励账本或背包数据；新存档字段缺失时自动使用空默认值。
- 固定答题奖励仍只发原材料；固定奖励模拟必须先加工精炼材料，再完成组件、部件和最终工程。
- 挑战每轮 10 题；`review` 优先错题，`random` 从本章全量题目抽取；挑战不改变主线星级、解锁和固定奖励账本。
- 挑战答错只显示“再试一次 / 跳过”；答案和复盘只在答题结算后展示，复盘默认折叠。

---

### Task 1: 声明五章精炼材料和可追溯配方链

**Files:**
- Modify: `game/chapterExpansionData.js`
- Modify: `game/itemCatalog.js`
- Modify: `game/itemVisuals.js`
- Modify: `game/levelRewardConfig.js`
- Test: `tests/itemCatalog.test.js`
- Test: `tests/levelRewardConfig.test.js`

**Interfaces:**
- `GameItemCatalog.getSuperProject(chapterId)` returns `materialRecipes` in addition to component, part and final recipes.
- `GameItemCatalog.listProjectRecipes(chapterId)` returns material recipes first, followed by component, part and final recipes.
- Each material recipe has `{ id, type: "material-processing", unlockLevelNumber, name, inputs, output }`.

- [ ] **Step 1: Write the failing tests**

Add assertions that every chapter has 12 material-processing recipes, each consumes exactly 3 raw-material units, every component recipe consumes a refined output, and the 99A chain includes a steel-ingot-like refined item feeding the track component. Add a fixed-clear assertion that the simulator can finish all five final projects through the new processing recipes.

- [ ] **Step 2: Run the focused tests and verify the expected failure**

Run `node --test tests/itemCatalog.test.js tests/levelRewardConfig.test.js`.
Expected: FAIL because `materialRecipes` is not exposed and component recipes still consume raw materials directly.

- [ ] **Step 3: Implement the smallest data-driven chain**

Extend the shared chapter project builder with 12 refined-material names and IDs per chapter. Add 12 stackable refined items and 12 `material-processing` recipes per chapter. Change component recipe inputs to the matching refined output. Keep legacy raw item IDs in `ITEMS`; include new refined IDs in the code-native visual registry and use lazy generic vector art for them.

Update `itemCatalog` cloning and `listProjectRecipes`, then update `levelRewardConfig.materialPlanForChapter` and `simulateFullClearCraft` so fixed rewards are raw inputs, material recipes are crafted before components, and all intermediate outputs are checked.

- [ ] **Step 4: Run focused tests and verify green**

Run `node --test tests/itemCatalog.test.js tests/levelRewardConfig.test.js tests/inventoryModel.test.js`.
Expected: all pass; fixed-clear reports `ok: true` for chapters 1–5.

### Task 2: Expose raw-material synthesis safely in the inventory domain

**Files:**
- Modify: `game/inventoryModel.js`
- Test: `tests/inventoryModel.test.js`

**Interfaces:**
- `InventoryModel.getMaterialRecipes(chapterId)` returns only material-processing recipes.
- `InventoryModel.toInventoryRecipe` preserves recipe `type` when present.
- `InventoryModel.canCraft` returns false when the output stack would overflow.

- [ ] **Step 1: Write failing unit tests**

Test that a chapter material recipe is discoverable, consumes three raw units atomically, produces one refined material, remains repeatable, and returns false rather than throwing when its output stack is full.

- [ ] **Step 2: Run the focused test and verify failure**

Run `node --test tests/inventoryModel.test.js`.
Expected: FAIL because `getMaterialRecipes` does not exist and output capacity is not checked by `canCraft`.

- [ ] **Step 3: Implement the domain API**

Build `MATERIAL_RECIPES_BY_CHAPTER` from the catalog, add `getMaterialRecipes`, preserve optional recipe type, and make `canCraft` validate input availability plus `previewItemGrant` for every output without mutating inventory.

- [ ] **Step 4: Run focused tests and verify green**

Run `node --test tests/inventoryModel.test.js tests/itemCatalog.test.js`.
Expected: all pass.

### Task 3: Add persistent wrong-answer tracking and challenge run model

**Files:**
- Create: `game/challengeModel.js`
- Modify: `game/progressionModel.js`
- Modify: `game/questionAccess.js`
- Test: `tests/challengeModel.test.js`
- Test: `tests/progressionModel.test.js`

**Interfaces:**
- `ChallengeModel.CHALLENGE_QUESTION_COUNT` is `10`.
- `ChallengeModel.createChallengeRun(chapter, state, mode, random)` returns a run with `mode`, `questionIds`, `questionIndex`, `targetMaterialId`, `targetRemaining`, `status`, and learner-safe `question`.
- `ChallengeModel.getMissingRawMaterials(chapterId, inventory)` recursively expands missing project outputs to raw material deficits.
- `ProgressionModel.startChallenge`, `submitChallengeAnswer`, `retryChallengeQuestion`, `skipChallengeQuestion`, `continueChallengeQuestion`, and `getChallengeReview` manage the separate challenge run.

- [ ] **Step 1: Write failing tests**

Cover random mode selecting 10 distinct in-chapter questions, review mode preferring recorded mistakes and falling back to random, deterministic random injection, recursive raw-material deficit detection, and a challenge reward that cannot exceed the deficit.

- [ ] **Step 2: Run tests and verify failure**

Run `node --test tests/challengeModel.test.js tests/progressionModel.test.js`.
Expected: FAIL because the challenge module and state methods do not exist.

- [ ] **Step 3: Implement challenge state and model**

Add sanitized defaults for `mistakeQuestionIds`, `challengeSequence`, `challengeRewardClaims`, and `activeChallengeRun`. Record question IDs whenever a mainline answer is wrong or skipped. Build challenge runs from compiled chapter questions, use `QuestionAccess` for learner-safe questions, and recursively inspect material/component/part/final recipes to select the first missing raw material.

Challenge correct answers grant one target raw material through `InventoryModel.grantItem`, record a unique challenge transaction, and cap the quantity at the computed deficit. Skips grant nothing; retry preserves the same question. Serialize and hydrate all new fields without exposing answer data.

- [ ] **Step 4: Run tests and verify green**

Run `node --test tests/challengeModel.test.js tests/progressionModel.test.js tests/campaignModel.test.js`.
Expected: all pass, including old-save migration and unchanged mainline reward behavior.

### Task 4: Render the synthesis station and active recovery challenges

**Files:**
- Modify: `game/gameApp.js`
- Modify: `game/game.css`
- Modify: `scripts/game-ui-behavior.js`

**Interfaces:**
- `data-material-synthesis` marks the raw-material station.
- `data-material-recipe-card-id` marks each processing recipe card.
- `data-recovery-challenge` marks the proactive challenge callout.
- `data-challenge-mode="review|random"` starts the selected 10-question challenge.
- `data-challenge-target`, `data-challenge-counter`, and `data-challenge-answer-input` expose the current target and progress for browser tests.

- [ ] **Step 1: Write failing browser assertions**

Assert that the inventory has a material synthesis station with 12 recipe cards; after a chapter is complete but its final project is absent, the map shows both review and random challenge actions; starting review keeps the answer input focused, return-to-map preserves the run, and a correct answer reveals a capped target-material reward.

- [ ] **Step 2: Run the focused UI test and verify failure**

Run `npm run test:game-ui`.
Expected: FAIL because the station and recovery challenge selectors are not rendered.

- [ ] **Step 3: Implement UI flows**

Render the current chapter’s material-processing cards before the blueprint cards. Show raw requirements, unlock level, output visual, output stack status, and an atomic “精炼材料” action. Add a chapter-complete callout with missing-material summary and two challenge buttons. Add a separate `recovery-challenge` screen with 10-question counter, mode, target, input autofocus, return button, retry/skip behavior, collapsed tactical review, and reward toast. Route click events to the new progression methods and persist after every transition.

- [ ] **Step 4: Run the UI test and verify green**

Run `npm run test:game-ui`.
Expected: existing game UI tests plus synthesis and recovery challenge assertions pass at mobile, tablet, and desktop widths.

### Task 5: Runtime wiring, content gates, documentation, and release verification

**Files:**
- Modify: `src/game-main.js`
- Modify: `scripts/validate-game-content.js`
- Modify: `README.md`
- Test: `tests/validateGameContent.test.js`
- Test: `tests/gameEntry.test.js`

**Interfaces:**
- Browser runtime loads `challengeModel.js` before `progressionModel.js` and exposes it on `globalThis`.
- Content validation reports material-chain coverage, no cycles, and fixed-clear completion for all five chapters.

- [ ] **Step 1: Write failing validation tests**

Add validation assertions for 60 material-processing recipes, complete recursive reachability, no unknown item IDs, and the challenge model being available in the browser runtime.

- [ ] **Step 2: Run the focused validation and verify failure**

Run `node --test tests/validateGameContent.test.js tests/gameEntry.test.js`.
Expected: FAIL until the runtime loader and content report expose the new chain.

- [ ] **Step 3: Implement runtime wiring and gates**

Register the new CommonJS dependency in `src/game-main.js`, extend `validateBuiltChapter`/CLI output with chain coverage and challenge-safe counts, and update README from direct raw-to-component crafting to the five-stage chain and recovery challenge.

- [ ] **Step 4: Run the complete validation suite**

Run:

```text
npm test
npm run check
npm run validate:game
npm run test:game-ui
npm run audit:ui
npm run smoke
npm run build
npm run check:bundle
git diff --check
```

Expected: all commands pass; bundle remains within the existing limits and the demo returns HTTP 200 on `http://127.0.0.1:5174/`.

- [ ] **Step 5: Commit the implementation**

Use a focused commit after all checks pass:

```bash
git add game tests scripts src README.md docs/superpowers
git commit -m "feat: add material processing and recovery challenges"
```
