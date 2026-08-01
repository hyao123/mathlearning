# Polar Icebreaker Chapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fourth 12-level geometry-and-measurement chapter culminating in a large polar icebreaker.

**Architecture:** Extend the existing declarative chapter, question-pack, quality-profile, catalog, reward, campaign, mission and visual mappings. Reuse the current 10-question level builder and global inventory; add only chapter-04 configuration and data.

**Tech Stack:** Vite, CommonJS, existing game models, Node test runner.

## Global Constraints

- Chapter 04 contains 12 levels of exactly 10 structurally answerable questions each.
- It unlocks only after chapter 03 is cleared and the orbital science station is assembled.
- Fixed rewards alone craft 12 components, 4 large parts and the polar icebreaker.
- No open-answer questions; numeric input or fixed options only.
- Existing chapters, save data, items, recipes and rewards must remain compatible.

### Task 1: Add chapter route and question content

**Files:** Modify `game/chapterConfig.js`; create `game/chapter04QuestionPacks.js`; modify `game/chapterBuilder.js`, `game/chapterQualityProfiles.js`; modify relevant tests.

- [ ] Add chapter-04 with the 12 specified geometry topics and 10-question difficulty slots.
- [ ] Add/complete 120 numeric or fixed-choice-compatible questions with answer, explanation, objective, story and review data.
- [ ] Add tests for the chapter route, ten-question invariant and no free-answer data.
- [ ] Run focused tests and `npm test`; commit.

### Task 2: Add icebreaker items, economy and missions

**Files:** Modify `game/chapterExpansionData.js`, `game/itemCatalog.js`, `game/levelRewardConfig.js`, `game/rewardEconomy.js`, `game/inventoryModel.js`; add tests.

- [ ] Add 11 materials, 12 components, 4 parts, final icebreaker and 5 task collectibles.
- [ ] Add recipes, reward plans, random pool, streak reward and five mission triggers.
- [ ] Test fixed-only full clear crafts the icebreaker and task grants remain idempotent.
- [ ] Run focused tests and `npm test`; commit.

### Task 3: Integrate campaign, UI and audit data

**Files:** Modify `game/campaignModel.js`, `game/gameApp.js`, `src/game-main.js`, content validation and UI tests.

- [ ] Verify third chapter completion unlocks chapter 04 and fourth chapter state participates in global inventory synchronization.
- [ ] Render the polar chapter overview, final blueprint, mission cards and recipes through existing generic UI.
- [ ] Generate chapter-04 review manifest and add strict validation coverage.
- [ ] Run UI behavior and responsive tests; commit.

### Task 4: Add distinct icebreaker visuals and release verification

**Files:** Modify `game/chapterVisualManifest.js`, `game/itemVisuals.js`, `tests/itemVisuals.test.js`; create required `public/assets/items/*-v2.webp` assets.

- [ ] Register 22 independent chapter-04 project and mission visuals and bind unique assets.
- [ ] Verify paths, dimensions, priorities and 128px legibility.
- [ ] Run `npm test`, strict content validation, UI test, UI audit, build and bundle-size check.
- [ ] Commit final changes.

## Self-Review

The plan covers route, content, rewards, migration compatibility, UI, visual assets and release tests. It uses the existing chapter patterns without adding systems outside the chapter scope.
