# 闯关奖励与工程配方对应关系优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修正 9 章 108 个关卡的固定奖励、精炼材料、中间组件、大型部件和最终工程之间的对应关系，并在答题界面展示清晰的奖励去向。

**Architecture:** 以 `game/materialProcessingData.js` 的 12 项原材料台账作为每章奖励来源，`game/levelRewardConfig.js` 从台账生成固定奖励和 `rewardChain`，不再维护第一章独立奖励表。UI 只消费 `rewardChain` 展示路线，不改变答题、随机奖励、背包或合成状态逻辑。

**Tech Stack:** 原生 JavaScript CommonJS 游戏模块、Node.js 内置 `node:test`、Vite 静态 UI、Playwright 游戏 UI 脚本。

## Global Constraints

- 保留所有既有物品 ID、背包数量、已领取奖励账本、已合成配方 ID和章节解锁状态。
- 每章 12 个专题继续对应 12 个固定原材料来源；每道题答对仍获得当前关卡对应的固定材料。
- 当前启用章节的原材料精炼统一为 3 个原材料 → 1 个精炼材料；随机奖励不参与完成最终工程的必需材料计算。
- 不删除商店、装备扩展位，不引入外部依赖，不批量重写题目。
- 生产代码必须先有会失败的测试，再做最小实现。

---

### Task 1: 固化奖励链路契约

**Files:**
- Modify: `tests/levelRewardConfig.test.js`
- Modify: `tests/itemCatalog.test.js`
- Modify: `game/materialProcessingData.js`
- Modify: `game/levelRewardConfig.js`

**Interfaces:**
- `MaterialProcessingData.getMaterialLayer(chapterId)` continues to return the chapter layer; its `rawIds[index]` is the fixed reward source for step `index`.
- `LevelRewardConfig.getRewardTrack(levelId)` adds `rewardChain: { rawItemId, materialItemId, componentItemId, partItemId }`.
- `LevelRewardConfig.validateRewardAssemblyAlignment(chapterId)` returns `{ ok, errors }`.

- [ ] **Step 1: Write the failing tests**

Add these tests to `tests/levelRewardConfig.test.js`:

```js
test("fixed rewards, processing, components, and parts form one chapter reward chain", () => {
  for (const chapterId of CHAPTER_IDS) {
    const rows = config.listLevelIds(chapterId).map((levelId) => config.getLevelRewardConfig(levelId));
    const report = config.validateRewardAssemblyAlignment(chapterId);

    assert.equal(report.ok, true, `${chapterId}: ${report.errors.join("; ")}`);
    rows.forEach((row) => {
      const fixedIds = new Set(row.fixedRewards.map((reward) => reward.itemId));
      assert.deepEqual([...fixedIds], [row.materialRecipe.inputs[0].itemId], row.levelId);
      assert.equal(row.componentRecipe.inputs[0].itemId, row.materialRecipe.output.itemId, row.levelId);
      assert.equal(row.stageRecipe.inputs.some(({ itemId }) => itemId === row.componentRecipe.output.itemId), true, row.levelId);
    });
    assert.notEqual(rows[0].fixedRewards[0].itemId, rows.at(-1).fixedRewards[0].itemId, `${chapterId}: final source must not be the first source`);
  }
});

test("reward track exposes the four-step chain for the current level", () => {
  const track = config.getRewardTrack("chapter-05-level-7");
  assert.deepEqual(track.rewardChain, {
    rawItemId: "maglev-track-link",
    materialItemId: "tank-track-steel",
    componentItemId: "tank-7",
    partItemId: "tank-part-3"
  });
});
```

Update the existing tank processing assertion in `tests/itemCatalog.test.js` so that `tank-track-steel` consumes `maglev-track-link ×3`, and add an assertion that chapter-05 level 7's fixed reward is `maglev-track-link`.

- [ ] **Step 2: Run the focused tests and verify they fail for the intended mismatch**

Run:

```bash
node --test tests/levelRewardConfig.test.js tests/itemCatalog.test.js
```

Expected: FAIL because the current first-chapter alternating rewards, chapter-05 special track recipe, repeated final raw sources, and missing `rewardChain` violate the new contract.

- [ ] **Step 3: Implement the canonical raw-source mapping**

In `game/materialProcessingData.js`:

- Keep the existing `rawIds` order as the 12-step reward ledger.
- Change chapter-02 step 12 to `heart-of-the-sea`.
- Change chapter-03 step 12 to `nether-star`.
- Change chapter-04 step 12 to `aurora-prism`.
- Change chapter-05 step 7 to remain `maglev-track-link` and step 12 to `fusion-drive-rod`.
- Keep chapters 06–09 final sources as their existing high-tier final material IDs.
- Remove chapter-05 `materialInputs[6]`; the default recipe for `tank-track-steel` must be `maglev-track-link ×3`.
- Add `getRewardMaterialIds(chapterId)` returning a cloned 12-element `rawIds` array.

In `game/levelRewardConfig.js`:

- Remove `CHAPTER_ONE_FIXED_MATERIALS`.
- Make `materialPlanForChapter` call `MaterialProcessingData.getRewardMaterialIds(chapterId)` and create ten copies of each source per level.
- Add `validateRewardAssemblyAlignment(chapterId)` with explicit errors for missing material recipes, fixed reward/input mismatch, refined material/component mismatch, missing stage membership, and final source equal to first source.
- Include validation errors in `validateMainlineEconomy`.
- Add `rewardChain` to the cloned return value of `getRewardTrack` and copy it into `getQuestionRewardTrack` entries.

- [ ] **Step 4: Run the focused tests and verify they pass**

Run:

```bash
node --test tests/levelRewardConfig.test.js tests/itemCatalog.test.js
```

Expected: PASS, including fixed-only crafting for all enabled chapters.

- [ ] **Step 5: Commit the data-contract change**

```bash
git add game/materialProcessingData.js game/levelRewardConfig.js tests/levelRewardConfig.test.js tests/itemCatalog.test.js
git commit -m "fix: align chapter rewards with assembly inputs"
```

### Task 2: Display the reward destination in the challenge card

**Files:**
- Modify: `game/gameAppRenderers.js`
- Modify: `game/game.css`
- Modify: `scripts/game-ui-behavior.js`

**Interfaces:**
- Consumes `LevelRewardConfig.getRewardTrack(levelId).rewardChain`.
- Produces a `[data-reward-chain]` paragraph inside `[data-reward-preview]`.

- [ ] **Step 1: Write the failing UI assertion**

In the first-level challenge flow in `scripts/game-ui-behavior.js`, after the existing fixed-reward assertion add:

```js
assert.equal(await page.locator("[data-reward-chain]").count(), 1, "challenge reward should explain its construction destination");
assert.equal((await page.locator("[data-reward-chain]").textContent()).includes("橡木原木"), true);
assert.equal((await page.locator("[data-reward-chain]").textContent()).includes("机体肋梁"), true);
assert.equal((await page.locator("[data-reward-chain]").textContent()).includes("机身结构部件"), true);
```

- [ ] **Step 2: Run the game UI test and verify the new assertion fails**

Run:

```bash
npm run test:game-ui
```

Expected: FAIL because no `[data-reward-chain]` element exists yet.

- [ ] **Step 3: Render the chain without changing reward behavior**

In `game/gameAppRenderers.js`, add a helper used by `renderRewardPreview`:

```js
function renderRewardChain(parent, levelId) {
  const track = LevelRewardConfig.getRewardTrack(levelId);
  const chain = track?.rewardChain;
  if (!chain) return;
  const names = [chain.rawItemId, chain.materialItemId, chain.componentItemId, chain.partItemId]
    .map((itemId) => GameItemCatalog.getItem(itemId)?.name || itemId);
  const line = appendText(parent, "p", names.join(" → "), "reward-preview__chain");
  line.dataset.rewardChain = "";
}
```

Call `renderRewardChain(parent, run.levelId)` after rendering the fixed reward and before the random-bonus note. The helper must remain display-only.

In `game/game.css`, add:

```css
.reward-preview__chain {
  grid-column: 1 / -1;
  margin: 0;
  padding: 8px 10px;
  border-left: 3px solid var(--gold);
  color: var(--ink-soft);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.45;
}
```

- [ ] **Step 4: Run the UI test and verify it passes**

Run:

```bash
npm run test:game-ui
```

Expected: PASS, with existing auto-focus, fixed/random reward, retry/skip, inventory and crafting assertions unchanged.

- [ ] **Step 5: Commit the display change**

```bash
git add game/gameAppRenderers.js game/game.css scripts/game-ui-behavior.js
git commit -m "feat: show reward assembly destination"
```

### Task 3: Run release validation and review the final diff

**Files:**
- Verify: `docs/superpowers/specs/2026-08-10-reward-assembly-alignment-design.md`
- Verify: all files changed by Tasks 1–2

- [ ] **Step 1: Run the complete validation suite**

Run:

```bash
npm test
npm run validate:release
npm run test:game-ui
npm run test:ui
npm run check
npm run build
npm run check:bundle
git diff --check
```

Expected: all commands pass; release validation reports 9 chapters and 1080 questions; fixed-only simulations complete every final project.

- [ ] **Step 2: Review the reward map and diff**

Run:

```bash
node -e "const c=require('./game/levelRewardConfig.js'); for(const id of ['chapter-01','chapter-02','chapter-03','chapter-04','chapter-05','chapter-06','chapter-07','chapter-08','chapter-09']) console.log(id,c.validateRewardAssemblyAlignment(id));"
git diff --stat
git status --short --branch
```

Expected: each chapter prints `{ ok: true, errors: [] }`; no unrelated files are modified and `main` remains clean after the intended commits.

- [ ] **Step 3: Commit any documentation-only adjustment if needed**

```bash
git add docs/superpowers/specs/2026-08-10-reward-assembly-alignment-design.md docs/superpowers/plans/2026-08-10-reward-assembly-alignment.md
git commit -m "docs: specify reward assembly alignment"
```
