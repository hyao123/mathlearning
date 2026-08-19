# Chapter 07 V3 Learning Bridges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all 120 production questions in Chapter 07 with reviewed V3 Olympiad-foundation content and connect the map, challenge, settlement, and chapter transition through explicit learning-bridge metadata.

**Architecture:** Add reusable topic-level quality and learning-bridge validators, define twelve static Chapter 07 topic contracts, and author one deterministic ten-question module per stable topic ID. The existing batch registry remains the only activation path: it validates the entire reviewed chapter batch before atomically replacing all twelve legacy topic packs, while the runtime adapter exposes a safe level-level `learningBridge` model to existing renderers.

**Tech Stack:** Node.js 20+ CommonJS modules, native `node:test`, Vite 8, browser modules loaded by `src/game-main.js`, Playwright-based UI behavior scripts, JSON review manifests, plain CSS.

## Global Constraints

- Keep exactly 9 chapters × 12 levels × 10 questions and preserve `chapter-07`, all twelve existing `moduleId` values, and slots 1–10.
- The first candidate batch is exactly `chapter-07-v3` at content version `2026.08.19-ch07.1`; any pedagogical edit after approval requires a higher version and fresh hashes.
- Chapter 07 contains exactly 12 V3 topics and 120 static questions; runtime randomness or generated prompts, answers, solutions, and verification are forbidden.
- Every topic has at least 5 structure fingerprints; one fingerprint may occur at most twice.
- Slots 8–10 must change strategy, slot 9 must use an earlier prerequisite, and slot 10 must combine two or three learned actions with independent verification.
- Difficulty comes from conditions, dependency structure, representation shifts, direction changes, supporting concepts, and strategy choice—not large numbers, long prompts, or filler arithmetic.
- Grade 6 readability remains at most 120 Unicode code points, 4 sentences, and 2 declared unfamiliar terms per prompt.
- Learner-visible method copy is Chinese; `methodSummary.label` is at most 8 Chinese characters.
- Human review must show all 120 prompts, answers, solution steps, independent verification, difficulty evidence, pitfalls, and six decisions before approval.
- A malformed, stale, partially reviewed, or partially mapped Chapter 07 batch activates zero Chapter 07 topics; the whole chapter stays on the previous content.
- Preserve old completions, stars, inventory, crafting, chapter unlocks, and first-reward idempotency; replaying updated content must not grant first rewards again.
- Do not activate the candidate or synthesize review approval before the explicit human-review checkpoint in Task 20.

---

## File Structure

### New production files

- `game/curriculum/topicQualityV3.js`: reusable ten-question diversity, progression, filler-step, and independent-verification gate.
- `game/curriculum/learningBridge.js`: validates and defensively adapts topic learning-bridge metadata.
- `game/curriculum/chapter07/topics.js`: twelve frozen Grade 6 topic contracts.
- `game/curriculum/chapter07/questionTools.js`: deterministic helpers that expand explicitly authored steps and deep-freeze content; no prompt or answer generation.
- `game/curriculum/chapter07/questions/<moduleId>.js`: one file per stable topic ID, exactly ten authored V3 questions.
- `game/curriculum/chapter07/index.js`: builds the candidate or approved 12-topic batch from static question modules and a supplied review manifest.
- `game/curriculum/runtimeReviewIntegrity.js`: browser/Node deterministic pedagogical payload and FNV-1a-64 stale-review detection.
- `scripts/generate-curriculum-review-html.js`: produces the read-only local review artifact.
- `scripts/generate-curriculum-runtime-payload.js`: emits a reviewed, deterministic runtime JSON without bundling 120 questions into the main JavaScript chunk.
- `public/content/chapter-07-v3.runtime.json`: tracked generated activation payload; produced only from an approved hash-matching batch.

### Modified production files

- `game/curriculum/curriculumMap.js`: combines the three existing gold topics with twelve Chapter 07 topics.
- `game/curriculum/curriculumContract.js`: exports learning-bridge-aware topic validation.
- `game/curriculum/compatibilityMap.js`: maps all twelve Chapter 07 stable slots.
- `game/curriculum/contentBatchRegistry.js`: applies the reusable topic-quality gate and preserves atomic writes.
- `game/curriculum/runtimeAdapter.js`: exposes a sanitized `learningBridge` value.
- `game/chapterBuilder.js`: attaches that bridge at level level when V3 content is active.
- `game/gameAppRenderers.js`, `game/game.css`: render method labels, intro bridge, takeaway, and Chapter 08 handoff.
- `src/game-main.js`: loads Chapter 07 CommonJS modules, approved manifest, and registers the batch before chapter compilation.
- `scripts/generate-human-review-template.js`: resolves more than one curriculum batch.
- `scripts/validate-game-content.js`: validates manifest counts from the supplied batch rather than a hard-coded 30.
- `scripts/validate-curriculum-batch.js`: supports one batch or all known batches.
- `package.json`: default curriculum validation covers every active/candidate batch and exposes review-artifact generation.
- `.gitignore`: ignores generated `artifacts/human-review/` HTML while keeping its generator tracked.
- `scripts/check-bundle-size.js`: keeps the existing JS/CSS/total budgets and adds a separate gzip budget for reviewed curriculum JSON.

### Tests and generated review data

- `tests/topicQualityV3.test.js`
- `tests/learningBridge.test.js`
- `tests/chapter07V3.test.js`
- `tests/runtimeAdapter.test.js`
- `tests/chapterBuilder.test.js`
- `tests/curriculumBatch.test.js`
- `tests/validateGameContent.test.js`
- `scripts/game-ui-behavior.js`
- `content/humanReview/candidates/chapter-07-v3.json`
- Generated but ignored: `artifacts/human-review/chapter-07-v3.html`

---

### Task 1: Reusable Topic-Level V3 Quality Gate

**Files:**
- Create: `game/curriculum/topicQualityV3.js`
- Create: `tests/topicQualityV3.test.js`
- Modify: `game/curriculum/contentBatchRegistry.js`
- Modify: `src/game-main.js`
- Modify: `tests/curriculumBatch.test.js`

**Interfaces:**
- Consumes: `DifficultyEngine.validateTopicProgression(questions)` and V3 question fields.
- Produces: `fingerprintQuestion(question): string`, `validateIndependentVerification(question): string[]`, `validateTopicQuality(questions): string[]`.

- [ ] **Step 1: Write failing tests for diversity, filler operations, strategy change, and independent verification**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const quality = require("../game/curriculum/topicQualityV3.js");

const step = (id, operation, operands, result) => ({
  id, kind: "calculate", operation, operands, result, explanation: id
});

function makeTenValidQuestions() {
  const representations = ["text", "bar-model", "table", "diagram", "equation"];
  return Array.from({ length: 10 }, (_, index) => ({
    level: index + 1,
    slot: index + 1,
    structureFamily: `family-${Math.floor(index / 2)}`,
    conditionRoles: [`total-${Math.floor(index / 2)}`, "part"],
    representation: representations[Math.floor(index / 2)],
    questionDirection: "forward",
    answerPolicy: { kind: "integer" },
    strategyChoices: index === 7 || index === 9 ? ["方法甲", "方法乙"] : ["方法甲"],
    supportingConcepts: index === 8 ? ["prior-a"] : index === 9 ? ["prior-a", "prior-b"] : [],
    solution: { strategy: "方法甲", steps: [
      step("base", "multiply", [2, 3], 6),
      step("answer", "add", ["$base", 1], 7)
    ] },
    verification: { strategy: "分组复核", steps: [
      step("answer", "subtract", [10, 3], 7)
    ] }
  }));
}

test("topic quality requires ten ordered questions and five fingerprints", () => {
  const questions = makeTenValidQuestions();
  assert.deepEqual(quality.validateTopicQuality(questions), []);
  const repeated = questions.map((q) => ({
    ...q,
    structureFamily: "same",
    conditionRoles: ["same-total", "same-part"],
    representation: "text",
    questionDirection: "forward",
    solution: { ...q.solution, steps: [step("total", "add", [3, 4], 7)] }
  }));
  assert.match(quality.validateTopicQuality(repeated).join("\n"), /at least 5 structure fingerprints/);
  assert.match(quality.validateTopicQuality(repeated).join("\n"), /fingerprint occurs 10 times/);
});

test("topic quality rejects filler and dependent verification graphs", () => {
  const filler = makeTenValidQuestions();
  filler[4].solution.steps.push(step("noop", "divide", ["$answer", 1], 7));
  assert.match(quality.validateTopicQuality(filler).join("\n"), /filler operation/);

  const roundTrip = makeTenValidQuestions();
  roundTrip[9].verification.steps = [
    step("rebuilt", "add", [7, 5], 12),
    step("answer", "subtract", ["$rebuilt", 5], 7)
  ];
  assert.match(quality.validateTopicQuality(roundTrip).join("\n"), /dependent add-subtract round trip/);
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run: `node --test tests/topicQualityV3.test.js`

Expected: FAIL with `Cannot find module '../game/curriculum/topicQualityV3.js'`.

- [ ] **Step 3: Implement normalized fingerprints and graph guards**

```js
function operandShape(value) {
  return typeof value === "string" && value.startsWith("$") ? "$ref" : "#";
}

function operationGraph(path) {
  return (path?.steps || []).map((step) => [
    step.operation,
    ...(step.operands || []).map(operandShape)
  ]);
}

function fingerprintQuestion(question) {
  return JSON.stringify({
    roles: [...(question.conditionRoles || [])].sort(),
    direction: question.questionDirection,
    representation: question.representation,
    answerKind: question.answerPolicy?.kind,
    graph: operationGraph(question.solution)
  });
}

function isFiller(step) {
  const [left, right] = step.operands || [];
  return (["multiply", "divide"].includes(step.operation) && right === 1)
    || (["add", "subtract"].includes(step.operation) && right === 0)
    || (["min", "max"].includes(step.operation) && left === right);
}
```

Implement `validateIndependentVerification` by resolving prior step references, detecting add/subtract and multiply/divide reconstruction round trips, and rejecting an identical normalized solution/verification operation graph. Implement `validateTopicQuality` with exact length/level/slot checks, five-fingerprint minimum, two-per-fingerprint maximum, filler scans for both paths, at least one declared strategy in slots 8–10, fingerprints in slots 8–10 different from slots 1–2, `supportingConcepts.length >= 1` for slots 9 and 10, and `DifficultyEngine.validateTopicProgression` forwarding. Accept an optional `{ allowedSupportingConcepts }` set; when supplied, reject every supporting concept outside that set. The Chapter 07 aggregate assertion in Task 6 supplies the topic's declared prerequisites and separately enforces two viable choices in method-choice slot 8; the registry supplies this option for topics that declare learning bridges, currently the twelve Chapter 07 topics. This keeps the generic gate compatible with already reviewed gold content while making the new chapter meet the stricter design.

- [ ] **Step 4: Make the batch registry call the new gate before preparing replacements**

```js
const TopicQualityV3 = require("./topicQualityV3.js");
// Inside validateContentBatch, after per-question validation:
errors.push(...TopicQualityV3.validateTopicQuality(topicBatch.questions)
  .map((error) => `${label}: quality: ${error}`));
```

Load `topicQualityV3.js` after `difficultyEngine.js` and before `contentBatchRegistry.js` in `src/game-main.js`, registering `./curriculum/topicQualityV3.js` and `./topicQualityV3.js`. Extend the real VM loader test to evaluate the module with `require("./difficultyEngine.js")`; a source-string-only assertion is insufficient.

- [ ] **Step 5: Run focused and registry regression tests**

Run: `node --test tests/topicQualityV3.test.js tests/curriculumBatch.test.js`

Expected: PASS, including the existing gold batches; if a gold fixture violates the new generic rule, correct the fixture semantics rather than weakening the gate.

- [ ] **Step 6: Commit**

```bash
git add game/curriculum/topicQualityV3.js game/curriculum/contentBatchRegistry.js src/game-main.js tests/topicQualityV3.test.js tests/curriculumBatch.test.js
git commit -m "feat: enforce topic-level curriculum quality"
```

### Task 2: Learning-Bridge Contract and Twelve Topic Definitions

**Files:**
- Create: `game/curriculum/learningBridge.js`
- Create: `game/curriculum/chapter07/topics.js`
- Create: `tests/learningBridge.test.js`
- Modify: `game/curriculum/curriculumContract.js`
- Modify: `game/curriculum/curriculumMap.js`
- Modify: `game/curriculum/contentBatchRegistry.js`
- Modify: `src/game-main.js`

**Interfaces:**
- Consumes: `chapterConfig.CHAPTERS`, existing `validateTopicDefinition`, stable Chapter 07/08/09 module IDs.
- Produces: `validateLearningBridge(topic, resolveTarget): string[]`, `adaptLearningBridge(topic): object|null`, `CHAPTER_07_TOPICS: readonly Topic[]`.

- [ ] **Step 1: Write failing contract and graph tests**

```js
const contract = require("../game/curriculum/curriculumContract.js");
const bridge = require("../game/curriculum/learningBridge.js");
const topics = require("../game/curriculum/chapter07/topics.js");
const chapterConfig = require("../game/chapterConfig.js");
const stableTargets = new Set(Object.values(chapterConfig.CHAPTERS)
  .flatMap((chapter) => chapter.levels.map((level) => level.moduleId)));
const resolveTarget = (topicId) => topics.some((topic) => topic.id === topicId) || stableTargets.has(topicId);

test("all Chapter 07 topics expose valid forward learning bridges", () => {
  assert.equal(topics.length, 12);
  assert.deepEqual(topics.map((topic) => topic.id), [
    "read-conditions", "draw-bar-model", "diagram-model", "table-method",
    "enumeration-method", "tree-diagram", "assumption-method", "reverse-thinking",
    "transformation-method", "unit-method", "estimation-method", "verify-eliminate"
  ]);
  for (const topic of topics) {
    assert.deepEqual(contract.validateTopicDefinition(topic), [], topic.id);
    assert.deepEqual(bridge.validateLearningBridge(topic, resolveTarget), [], topic.id);
    assert.ok(Object.isFrozen(topic), topic.id);
  }
});

test("learning bridge rejects empty labels, self targets, unknown targets, and backward Chapter 07 targets", () => {
  const topic = structuredClone(topics[4]);
  topic.methodSummary.label = "";
  topic.transferTargets = [{ topicId: topic.id, reason: "self" }, { topicId: "missing", reason: "unknown" }];
  assert.match(bridge.validateLearningBridge(topic, resolveTarget).join("\n"), /methodSummary.label/);
  assert.match(bridge.validateLearningBridge(topic, resolveTarget).join("\n"), /self target/);
  assert.match(bridge.validateLearningBridge(topic, resolveTarget).join("\n"), /unknown target/);
});
```

- [ ] **Step 2: Verify the red state**

Run: `node --test tests/learningBridge.test.js tests/curriculumContract.test.js`

Expected: FAIL because `learningBridge.js` and `chapter07/topics.js` do not exist.

- [ ] **Step 3: Implement the bridge validator and defensive adapter**

```js
function validateLearningBridge(topic, resolveTarget) {
  const errors = [];
  if (!hasText(topic?.prerequisiteSummary)) errors.push("missing prerequisiteSummary");
  if (!hasText(topic?.methodSummary?.label)) errors.push("missing methodSummary.label");
  if ([...(topic?.methodSummary?.label || "")].length > 8) errors.push("methodSummary.label exceeds 8 characters");
  if (!hasText(topic?.methodSummary?.description)) errors.push("missing methodSummary.description");
  if (!Array.isArray(topic?.transferTargets) || !topic.transferTargets.length) errors.push("transferTargets must not be empty");
  for (const target of topic?.transferTargets || []) {
    if (target.topicId === topic.id) errors.push(`self target: ${topic.id}`);
    if (!resolveTarget(target.topicId)) errors.push(`unknown target: ${target.topicId}`);
    if (!hasText(target.reason)) errors.push(`missing transfer reason: ${target.topicId}`);
  }
  return errors;
}
```

`adaptLearningBridge(topic)` returns a deep-frozen defensive copy containing only `prerequisiteSummary`, `methodSummary.label`, `methodSummary.description`, and `transferTargets[].topicId/reason`.

- [ ] **Step 4: Add the exact twelve topic contracts**

Use these controlled values; do not substitute display-only prose for core models or required actions:

| ID | Title | Prerequisites | Core model | Required actions | Method label | First transfer target |
|---|---|---|---|---|---|---|
| `read-conditions` | 条件整理与对应 | `data-inference,compare-plans` | `condition-role-mapping` | `identify,verify` | 条件对应 | `draw-bar-model` |
| `draw-bar-model` | 线段图建模 | `read-conditions,sum-diff,ratio-model` | `bar-part-whole-relation` | `diagram,verify` | 线段图 | `reverse-thinking` |
| `diagram-model` | 图示分段与数形结合 | `draw-bar-model,geometry-decomposition` | `diagram-decompose-recompose` | `diagram,verify` | 图示分段 | `shortest-path` |
| `table-method` | 列表整理 | `read-conditions,data-inference` | `row-column-correspondence` | `identify,verify` | 列表整理 | `enumeration-method` |
| `enumeration-method` | 分类枚举 | `table-method,add-multiply-counting` | `systematic-case-enumeration` | `enumerate,verify` | 分类枚举 | `tree-diagram` |
| `tree-diagram` | 树形图计数 | `enumeration-method,add-multiply-counting` | `branch-product-counting` | `enumerate,verify` | 树形计数 | `worst-case` |
| `assumption-method` | 假设与差量调整 | `read-conditions,draw-bar-model,chicken-rabbit` | `uniform-assumption-adjustment` | `assume,substitute,verify` | 假设调整 | `transformation-method` |
| `reverse-thinking` | 倒推还原 | `read-conditions,restore-problem` | `inverse-operation-chain` | `reverse,verify` | 倒推还原 | `transformation-method` |
| `transformation-method` | 转化与替换 | `assumption-method,reverse-thinking` | `equivalent-unit-substitution` | `substitute,verify` | 等价转化 | `parity-invariant` |
| `unit-method` | 归一归总 | `read-conditions,table-method,unit-rate` | `normalize-then-scale` | `identify,substitute,verify` | 归一归总 | `scheduling` |
| `estimation-method` | 估算与边界 | `read-conditions,table-method` | `lower-upper-bound` | `compare,verify` | 估算边界 | `worst-case` |
| `verify-eliminate` | 验算、排除与综合选择 | `transformation-method,estimation-method` | `candidate-check-and-elimination` | `compare,verify` | 验算排除 | `integrated-strategy` |

Every topic uses `gradeBand: "grade-6"`, at least one concrete misconception tag, and at least one excluded shortcut. Use this exact learner-visible copy:

| ID | `prerequisiteSummary` | `methodSummary.description` | First `transferTargets[].reason` |
|---|---|---|---|
| `read-conditions` | 能从表格和短题干中找出已知量。 | 给每个条件标明角色，再判断它和问题的关系。 | 整理好的条件可以直接放进线段图。 |
| `draw-bar-model` | 会区分总量、部分量、差量和倍数。 | 用线段的长短和分段表示数量关系。 | 看清线段关系后，可以从结果倒推未知量。 |
| `diagram-model` | 会用线段图和基本面积、周长公式。 | 把图形分成可计算的小块，再重组关系。 | 图示分段会用于第8章判断绕行路线。 |
| `table-method` | 会找出条件角色并按名称对应数据。 | 把同类条件放入行列，逐项计算和比较。 | 整齐的表格会成为系统枚举的起点。 |
| `enumeration-method` | 会用表格记录不重复的候选。 | 先分类定顺序，再完整列出且不重不漏。 | 分层枚举可以改画成树形图。 |
| `tree-diagram` | 会分类枚举，并理解乘法计数。 | 按选择顺序画分支，逐层计数并剪去无效枝。 | 分支边界会用于第8章最不利问题。 |
| `assumption-method` | 会读条件、画差量关系，并见过鸡兔同笼。 | 先统一假设，再按每份差量逐步调整。 | 假设产生的差量可以进一步转化成等价单位。 |
| `reverse-thinking` | 会按顺序记录运算，并理解还原问题。 | 从最后结果出发，按相反运算逐步回到起点。 | 倒推得到的关系可以用于等价转化。 |
| `transformation-method` | 会用假设法和倒推法找出数量对应。 | 把不同对象换成同一种等价单位再计算。 | 等价转化会用于第8章不变量判断。 |
| `unit-method` | 会读表格并找出每份、份数和总量。 | 先求一份，再按需要的份数归总。 | 统一效率后可以比较第8章的安排方案。 |
| `estimation-method` | 会整理条件并比较表格中的候选。 | 先找上下界，再判断结果是否可行或足够。 | 边界思维直接连接第8章最不利原则。 |
| `verify-eliminate` | 会做等价转化，也会用边界排除不可能。 | 用独立路径复算候选，逐条排除不符合条件的方案。 | 完整验算会用于第8章综合策略选择。 |

`curriculumContract.validateTopicDefinition` validates the bridge only when any bridge field is present, so the three existing gold topics remain valid. `contentBatchRegistry.validateContentBatch` must require a complete valid bridge for every `chapter-07-v3` topic, resolving same-chapter targets through `CurriculumMap` and Chapter 08/09 targets through stable `chapterConfig` module IDs.

For the Chapter 07 batch, call the quality gate as follows; all other batches keep the generic call introduced in Task 1:

```js
const qualityOptions = Array.isArray(topic.transferTargets)
  ? { allowedSupportingConcepts: new Set(topic.prerequisites) }
  : {};
errors.push(...TopicQualityV3.validateTopicQuality(topicBatch.questions, qualityOptions)
  .map((error) => `${label}: quality: ${error}`));
```

- [ ] **Step 5: Merge Chapter 07 topics into the curriculum map and browser loader**

```js
const CHAPTER_07_TOPICS = require("./chapter07/topics.js");
const CURRICULUM_TOPICS = Object.freeze([...GOLD_TOPICS, ...CHAPTER_07_TOPICS]);
```

Load `learningBridge.js` before `curriculumContract.js`, registering `./curriculum/learningBridge.js` and `./learningBridge.js`. Load `chapter07/topics.js` before `curriculumMap.js` and register `./curriculum/chapter07/topics.js`, `./chapter07/topics.js`, and `./topics.js` aliases so the real browser CommonJS path succeeds. Extend the VM test to execute both actual `require` paths.

- [ ] **Step 6: Run focused tests and syntax check**

Run: `node --test tests/learningBridge.test.js tests/curriculumContract.test.js tests/runtimeAdapter.test.js`

Expected: PASS with 15 total curriculum topics and unchanged three gold-topic behavior.

- [ ] **Step 7: Commit**

```bash
git add game/curriculum/learningBridge.js game/curriculum/chapter07/topics.js game/curriculum/curriculumContract.js game/curriculum/curriculumMap.js src/game-main.js tests/learningBridge.test.js tests/curriculumContract.test.js tests/runtimeAdapter.test.js
git commit -m "feat: define chapter 7 learning bridges"
```

### Task 3: Stable Chapter 07 Compatibility Slots

**Files:**
- Modify: `game/curriculum/compatibilityMap.js`
- Modify: `tests/curriculumBatch.test.js`

**Interfaces:**
- Consumes: twelve stable Chapter 07 `moduleId` values.
- Produces: compatibility entry for every `chapter-07:<moduleId>` with IDs `chapter-07-<moduleId>-1` through `-10`.

- [ ] **Step 1: Add a failing exact-map test**

```js
test("Chapter 07 compatibility map retains all twelve stable ten-slot modules", () => {
  const moduleIds = [
    "read-conditions", "draw-bar-model", "diagram-model", "table-method",
    "enumeration-method", "tree-diagram", "assumption-method", "reverse-thinking",
    "transformation-method", "unit-method", "estimation-method", "verify-eliminate"
  ];
  for (const moduleId of moduleIds) {
    const entry = compatibility.getCompatibilityEntry("chapter-07", moduleId);
    assert.equal(entry.topicId, moduleId);
    assert.deepEqual(entry.slotIds, Array.from({ length: 10 }, (_, i) => `chapter-07-${moduleId}-${i + 1}`));
  }
});
```

- [ ] **Step 2: Run red test**

Run: `node --test tests/curriculumBatch.test.js --test-name-pattern "Chapter 07 compatibility"`

Expected: FAIL because Chapter 07 entries are absent.

- [ ] **Step 3: Generate only stable IDs, never question content**

```js
const CHAPTER_07_MODULE_IDS = Object.freeze([
  "read-conditions", "draw-bar-model", "diagram-model", "table-method",
  "enumeration-method", "tree-diagram", "assumption-method", "reverse-thinking",
  "transformation-method", "unit-method", "estimation-method", "verify-eliminate"
]);
const chapter07Entries = Object.fromEntries(CHAPTER_07_MODULE_IDS.map((moduleId) => [
  `chapter-07:${moduleId}`,
  Object.freeze({
    chapterId: "chapter-07",
    moduleId,
    topicId: moduleId,
    slotIds: Object.freeze(Array.from({ length: 10 }, (_, index) => `chapter-07-${moduleId}-${index + 1}`))
  })
]));
```

Export `CHAPTER_07_MODULE_IDS` for batch assembly and tests. Preserve existing irregular chicken-rabbit IDs unchanged.

- [ ] **Step 4: Run focused tests and commit**

Run: `node --test tests/curriculumBatch.test.js tests/chapterBuilder.test.js`

Expected: PASS.

```bash
git add game/curriculum/compatibilityMap.js tests/curriculumBatch.test.js
git commit -m "feat: map chapter 7 v3 content slots"
```

### Task 4: Runtime Learning-Bridge Adapter and Level Model

**Files:**
- Modify: `game/curriculum/runtimeAdapter.js`
- Modify: `game/chapterBuilder.js`
- Modify: `tests/runtimeAdapter.test.js`
- Modify: `tests/chapterBuilder.test.js`

**Interfaces:**
- Consumes: `LearningBridge.adaptLearningBridge(topic)`.
- Produces: `RuntimeAdapter.adaptLearningBridge(topic): object|null`; active V3 levels expose enumerable `level.learningBridge` and legacy levels omit it.

- [ ] **Step 1: Add failing adapter and builder tests**

```js
const registry = require("../game/curriculum/contentBatchRegistry.js");
const builder = require("../game/chapterBuilder.js");
const chapter07Modules = require("../game/chapter07QuestionPacks.js").chapterModules;
const chickenRabbit = require("../game/curriculum/gold/chickenRabbit.js");

function buildApprovedFixtureLevel(topicId) {
  const questions = structuredClone(chickenRabbit).map((question, index) => ({
    ...question,
    id: `chapter-07-${topicId}-${index + 1}`,
    topicId,
    level: index + 1,
    slot: index + 1,
    reasoningMoves: [...new Set([...question.reasoningMoves, "identify", "verify"])],
    supportingConcepts: index === 8 ? ["data-inference"] : index === 9 ? ["data-inference", "compare-plans"] : []
  }));
  const batch = {
    id: "chapter-07-bridge-fixture",
    schemaVersion: 3,
    status: "approved",
    contentVersion: "2026.08.19-ch07.900",
    reviewManifest: { schemaVersion: 3, status: "approved" },
    topics: [{ chapterId: "chapter-07", moduleId: topicId, questions }]
  };
  assert.equal(registry.registerContentBatch(batch), true);
  return builder.buildChapter("chapter-07", chapter07Modules).levels.find((level) => level.moduleId === topicId);
}

test("adapts only learner-safe bridge fields", () => {
  const topic = curriculum.getCurriculumTopic("read-conditions");
  assert.deepEqual(adapter.adaptLearningBridge(topic), {
    prerequisiteSummary: topic.prerequisiteSummary,
    methodSummary: { ...topic.methodSummary },
    transferTargets: topic.transferTargets.map((target) => ({ ...target }))
  });
});

test("active V3 levels expose a bridge while legacy levels do not", () => {
  const v3Level = buildApprovedFixtureLevel("read-conditions");
  assert.equal(v3Level.learningBridge.methodSummary.label, "条件对应");
  const legacyLevel = builder.buildChapter("chapter-07", chapter07Modules).levels[0];
  assert.equal(Object.hasOwn(legacyLevel, "learningBridge"), false);
});
```

- [ ] **Step 2: Run red tests**

Run: `node --test tests/runtimeAdapter.test.js tests/chapterBuilder.test.js`

Expected: FAIL because `adaptLearningBridge` and level bridge output are absent.

- [ ] **Step 3: Register `LearningBridge` before the runtime adapter in the browser entrypoint**

Add CommonJS aliases `./curriculum/learningBridge.js` and `./learningBridge.js`; extend the VM loader test to perform a real `require("./learningBridge.js")` while loading the adapter.

- [ ] **Step 4: Implement adapter and builder propagation**

```js
function adaptLearningBridge(topic) {
  return LearningBridge?.adaptLearningBridge?.(topic) || null;
}

// buildLevel return value
const learningBridge = versioned ? RuntimeAdapter.adaptLearningBridge(topic) : null;
return {
  levelId: levelConfig.id,
  moduleId: module.id,
  title: versioned ? topic.title : module.title,
  ...(versioned ? { contentVersion: versioned.contentVersion, learningBridge } : {}),
  questions
};
```

If `learningBridge` is null for a versioned Chapter 07 topic, throw `Invalid learning bridge for <topicId>` instead of emitting partial UI data.

- [ ] **Step 5: Run focused regression and commit**

Run: `node --test tests/runtimeAdapter.test.js tests/chapterBuilder.test.js tests/curriculumBatch.test.js`

Expected: PASS.

```bash
git add game/curriculum/runtimeAdapter.js game/chapterBuilder.js src/game-main.js tests/runtimeAdapter.test.js tests/chapterBuilder.test.js tests/curriculumBatch.test.js
git commit -m "feat: expose learning bridges to chapter levels"
```

### Task 5: Map, Challenge, Settlement, and Chapter Handoff UI

**Files:**
- Modify: `game/gameAppRenderers.js`
- Modify: `game/game.css`
- Modify: `scripts/game-ui-behavior.js`

**Interfaces:**
- Consumes: optional `level.learningBridge`.
- Produces: `[data-level-method]`, `[data-learning-bridge]`, `[data-method-takeaway]`, and `[data-chapter-method-handoff]` UI hooks.

- [ ] **Step 1: Add failing browser assertions with a V3 fixture level**

```js
await page.evaluate(async () => {
  const { default: GameApp } = await import("/game/gameApp.js");
  const chapter = globalThis.GameChapterBuilder.buildChapter("chapter-07", globalThis.Chapter07QuestionPacks.chapterModules);
  chapter.levels[0].learningBridge = {
    prerequisiteSummary: "能从表格和短题干中找出已知量。",
    methodSummary: { label: "条件对应", description: "给每个条件标明角色，再判断它和问题的关系。" },
    transferTargets: [{ topicId: "draw-bar-model", reason: "整理好的条件可以直接放进线段图。" }]
  };
  const stateStore = {
    load: () => JSON.stringify({
      activeChapterId: "chapter-07",
      chapterStates: { "chapter-07": { unlockedLevelIds: ["chapter-07-level-1"], levelRecords: {} } }
    }),
    save: () => ({ ok: true })
  };
  const mountedRoot = document.getElementById("game-root");
  const root = mountedRoot.cloneNode(false);
  mountedRoot.replaceWith(root);
  GameApp.mount({ root, chapters: [chapter], stateStore });
});
assert.equal((await page.locator("[data-level-id='chapter-07-level-1'] [data-level-method]").textContent()).trim(), "条件对应");
await page.locator("[data-level-id='chapter-07-level-1']").click();
const bridge = page.locator("[data-learning-bridge]");
assert.equal(await bridge.locator("[data-bridge-prerequisite]").textContent(), "已会：能从表格和短题干中找出已知量。");
assert.equal(await bridge.locator("[data-bridge-method]").textContent(), "本关学：给每个条件标明角色，再判断它和问题的关系。");
assert.match(await bridge.locator("[data-bridge-transfer]").textContent(), /线段图/);
```

After completing the fixture level, assert that settlement contains `[data-method-takeaway]`; for level 12 assert `[data-chapter-method-handoff]` contains “第 8 章” and “选择策略”. Also assert old levels contain zero bridge hooks and updated status text remains unchanged.

- [ ] **Step 2: Run the browser script and verify red state**

Run: `npm run test:game-ui`

Expected: FAIL on the first missing `data-level-method` assertion.

- [ ] **Step 3: Add renderer helpers instead of duplicating bridge markup**

```js
function renderLearningBridge(parent, bridge) {
  if (!bridge) return;
  const panel = document.createElement("aside");
  panel.className = "learning-bridge";
  panel.dataset.learningBridge = "";
  appendText(panel, "p", `已会：${bridge.prerequisiteSummary}`, "learning-bridge__item").dataset.bridgePrerequisite = "";
  appendText(panel, "p", `本关学：${bridge.methodSummary.description}`, "learning-bridge__item").dataset.bridgeMethod = "";
  appendText(panel, "p", `后面用：${bridge.transferTargets[0].reason}`, "learning-bridge__item").dataset.bridgeTransfer = "";
  parent.append(panel);
}
```

Map: append the method label separately from `.level-node__status`, so “内容已更新” remains the status. Challenge: call the helper only when `run.questionIndex === 0 && run.status === "active"`. Settlement: render “方法带走” from the completed level and use its first target; level 12 adds the exact Chapter 08 strategy-choice handoff.

- [ ] **Step 4: Add responsive and accessible CSS**

Use existing color tokens and focus styles. `.learning-bridge` is a single-column card below the story beat; `.level-node__method` truncates to one line; at the existing narrow breakpoint it remains readable without horizontal scrolling. Do not create a modal or new navigation action.

- [ ] **Step 5: Run UI, smoke, and accessibility regressions**

Run: `npm run test:game-ui`

Run: `npm run smoke`

Run: `npm run audit:ui`

Expected: all commands exit 0; keyboard flow and prior content-version replay assertions remain green.

- [ ] **Step 6: Commit**

```bash
git add game/gameAppRenderers.js game/game.css scripts/game-ui-behavior.js
git commit -m "feat: connect chapter learning across game screens"
```

### Task 6: Deterministic Chapter 07 Question Authoring Tools

**Files:**
- Create: `game/curriculum/chapter07/questionTools.js`
- Create: `tests/chapter07V3.test.js`

**Interfaces:**
- Produces: `step(id, kind, operation, operands, result, explanation)`, `defineTopicQuestions({ topicId, primaryConcept, questions }): readonly Question[]`, `assertTopicPack` test helper local to the test file.

- [ ] **Step 1: Write failing helper tests**

```js
function authoredQuestionFixture() {
  return {
    id: "chapter-07-read-conditions-1",
    title: "盒彩笔",
    prompt: "6盒彩笔，每盒8支，一共有多少支？",
    answer: "48",
    conditionRoles: ["box-count", "per-box-count"],
    structureFamily: "direct-role-match",
    representation: "text",
    questionDirection: "forward",
    reasoningMoves: ["identify", "verify"],
    supportingConcepts: [],
    strategyChoices: ["条件对应"],
    solution: { strategy: "条件对应", steps: [
      { id: "answer", kind: "calculate", operation: "multiply", operands: [6, 8], result: 48, explanation: "6个8相加是48。" }
    ] },
    verification: { strategy: "重复加法复核", summary: "8+8+8+8+8+8=48。", steps: [
      { id: "answer", kind: "verify", operation: "sum", operands: [8, 8, 8, 8, 8, 8], result: 48, explanation: "6个8相加正好是48。" }
    ] },
    commonPitfall: "不要把盒数和每盒数量相加。",
    storyBeat: "把盒彩笔条件一一对应。"
  };
}

test("question tools add only structural defaults and deeply freeze authored content", () => {
  const questions = tools.defineTopicQuestions({
    topicId: "read-conditions",
    primaryConcept: "condition-role-mapping",
    questions: [authoredQuestionFixture()]
  });
  assert.equal(questions[0].schemaVersion, 3);
  assert.equal(questions[0].level, 1);
  assert.equal(questions[0].slot, 1);
  assert.ok(Object.isFrozen(questions[0].solution.steps));
  assert.equal(questions[0].prompt, authoredQuestionFixture().prompt);
});
```

- [ ] **Step 2: Verify red state**

Run: `node --test tests/chapter07V3.test.js`

Expected: FAIL because `questionTools.js` is absent.

- [ ] **Step 3: Implement deterministic helpers**

```js
const AUTHOR_REVIEW = Object.freeze({
  reviewer: "课程作者复核",
  reviewedAt: "2026-08-19T00:00:00.000Z",
  evidence: "作者已按结构化步骤独立复算；生产发布仍以独立人工审核清单为准。"
});

function step(id, kind, operation, operands, result, explanation) {
  return { id, kind, operation, operands, result, explanation };
}

function defineTopicQuestions({ topicId, primaryConcept, questions }) {
  if (!Array.isArray(questions) || questions.length !== 10) throw new Error(`${topicId} must author exactly 10 questions`);
  const controlled = ["schemaVersion", "topicId", "level", "slot", "reviewMetadata"];
  return deepFreeze(questions.map((question, index) => {
    if (controlled.some((field) => Object.hasOwn(question, field))) throw new Error(`${topicId} question ${index + 1} overrides ${controlled.find((field) => Object.hasOwn(question, field))}`);
    const answerPolicy = question.answerPolicy || { kind: "integer" };
    return {
      ...question,
      schemaVersion: 3,
      topicId,
      level: index + 1,
      slot: index + 1,
      answerType: "numeric",
      answerFormat: answerPolicy.kind,
      answerPolicy,
      primaryConcept,
      readingProfile: question.readingProfile || { unfamiliarTerms: [] },
      reviewMetadata: AUTHOR_REVIEW
    };
  }));
}
```

Reject authored overrides of `schemaVersion`, `topicId`, `level`, `slot`, and `reviewMetadata`; defaults may reduce boilerplate but may not create prompts, answers, conditions, strategies, or solution steps.

- [ ] **Step 4: Add the reusable aggregate assertion**

`assertTopicPack(topicId, questions)` checks exactly ten IDs `chapter-07-${topicId}-${slot}`, levels/slots 1–10, deep freezing, Chinese learner-visible text, no filler operations, no English strategy labels, at least two `strategyChoices` in slot 8, at least one earlier prerequisite in slot 9, at least two supporting concepts and two strategy choices in slot 10, every supporting concept declared in the topic's `prerequisites`, `QuestionQualityV3.validateQuestionV3`, `TopicQualityV3.validateTopicQuality(questions, { allowedSupportingConcepts: new Set(topic.prerequisites) })`, and `DifficultyEngine.validateTopicProgression`.

- [ ] **Step 5: Run test and commit**

Run: `node --test tests/chapter07V3.test.js`

Expected: PASS.

```bash
git add game/curriculum/chapter07/questionTools.js tests/chapter07V3.test.js
git commit -m "test: establish chapter 7 v3 authoring contract"
```

## Content Authoring Protocol for Tasks 7–18

Each content task uses the same mechanics but a different, fully specified mathematical blueprint:

1. Add a failing `assertTopicPack(topicId, questions)` test and blueprint-specific assertions before creating the module.
2. Run the single test and observe module-not-found or semantic failures.
3. Create one static ten-question file using `defineTopicQuestions`; every blueprint row becomes one object with its exact values, answer, structure family, representation/direction, strategies, solution path, and independent verification path.
4. Every question includes `conditionRoles`, `reasoningMoves` containing all topic-required actions, `supportingConcepts`, `strategyChoices`, `solution`, `verification`, `commonPitfall`, and `storyBeat`.
5. Run the topic test, then the four quality suites.
6. Commit only that topic file and its test additions.

The blueprint calculation is authoritative. Wording may be made child-friendly without changing quantities, condition roles, answer, or operation topology.

Use these exact transfer and method-choice fields so supporting knowledge is always an earlier declared prerequisite:

| Topic | Slot 8 `strategyChoices` | Slot 9 `supportingConcepts` | Slot 10 `supportingConcepts` | Slot 10 `strategyChoices` |
|---|---|---|---|---|
| `read-conditions` | `分组求和,逐项累加` | `data-inference` | `data-inference,compare-plans` | `逐项筛选,列出可行组合` |
| `draw-bar-model` | `线段图,和差算式` | `read-conditions` | `read-conditions,ratio-model` | `三段线段图,设一份量` |
| `diagram-model` | `大图减空缺,分块相加` | `draw-bar-model` | `draw-bar-model,geometry-decomposition` | `边界替换,逐边计数` |
| `table-method` | `逐行列表,分别列式` | `read-conditions` | `read-conditions,data-inference` | `先筛价格,先筛时间` |
| `enumeration-method` | `系统列表,先排后除序` | `table-method` | `table-method,add-multiply-counting` | `按最小数分类,从总和反推` |
| `tree-diagram` | `树形图,乘法计数` | `enumeration-method` | `enumeration-method,add-multiply-counting` | `逐层剪枝,按首字符分类` |
| `assumption-method` | `假设全两脚,列一元关系` | `read-conditions` | `read-conditions,chicken-rabbit` | `补回退款再假设,分类收入列式` |
| `reverse-thinking` | `逐步倒推,列方程` | `read-conditions` | `read-conditions,restore-problem` | `逐步倒推,画流程图` |
| `transformation-method` | `先求一份A,整组等价替换` | `assumption-method` | `assumption-method,reverse-thinking` | `全部换成C,逐层替换` |
| `unit-method` | `归一工作总量,反比例表` | `table-method` | `table-method,unit-rate` | `先求每工日,总量比例` |
| `estimation-method` | `先估后算,直接乘法比较` | `table-method` | `read-conditions,table-method` | `最坏情况排列,反例后加一` |
| `verify-eliminate` | `代入候选,线段图复核` | `transformation-method` | `transformation-method,estimation-method` | `逐项排除,建立可行性表` |

### Task 7: `read-conditions` — Condition Roles and Correspondence

**Files:**
- Create: `game/curriculum/chapter07/questions/read-conditions.js`
- Modify: `tests/chapter07V3.test.js`

**Interfaces:** Produces ten V3 questions for topic `read-conditions`.

- [ ] **Step 1: Add the failing import and pack assertion**

```js
test("read-conditions forms a ten-slot condition-role progression", () => {
  const questions = require("../game/curriculum/chapter07/questions/read-conditions.js");
  assertTopicPack("read-conditions", questions);
  assert.deepEqual(questions[9].strategyChoices, ["逐项筛选", "列出可行组合"]);
  assert.equal(questions[9].answer, "2");
});
```

- [ ] **Step 2: Run red test**

Run: `node --test tests/chapter07V3.test.js --test-name-pattern "read-conditions"`

Expected: FAIL with missing module.

- [ ] **Step 3: Author these exact ten mathematical blueprints**

| Slot | Problem and calculation | Answer | Family / representation / direction | Main solution | Independent verification |
|---|---|---:|---|---|---|
| 1 | 6 boxes × 8 pencils | 48 | `direct-role-match` / text / forward | match boxes to per-box count | six groups of eight counted as 48 |
| 2 | 3 rows × 7 members + 2 leaders | 23 | `two-role-total` / diagram / forward | separate row members and leaders | subtract 2 from 23, then divide 21 by 3 |
| 3 | table values 12, 15, 9 | 36 | `table-role-sum` / table / forward | read three labeled rows | compare with 3 × 12 adjusted by +3−3 |
| 4 | 45 cards, 5 per envelope | 9 | `reverse-group-count` / equation / reverse | total ÷ per group | 9 envelopes × 5 cards |
| 5 | shelf number 3 is irrelevant; 8 layers × 12 books − 14 loaned | 82 | `irrelevant-label` / text / find-parameter | discard label, compute stock | 82 + 14 = 96 and 96 ÷ 8 = 12 |
| 6 | 4 trucks × 6 boxes × 5 kg | 120 | `nested-correspondence` / diagram / forward | map truck→box→mass | 24 boxes × 5 kg |
| 7 | 36 arrivals + 28 arrivals − 9 used | 55 | `event-balance` / text / find-parameter | classify inflow/outflow | 55 + 9 = 64 total arrivals |
| 8 | team totals 18, 21, 17, 20 | 76 | `method-choice-total` / table / compare-plans | choose table-column sum over prose recount | pair sums 39 and 37, then 76 |
| 9 | ribbon total 96; first two parts total 80 in ratio 3:1; find second part | 20 | `condition-filter-ratio` / bar-model / find-parameter | retain total-80 and ratio conditions | 20 × 3 + 20 + 16 = 96 |
| 10 | plans: A=(18 min,6 points), B=(15,5), C=(12,4); at most 30 min and at least 10 points; pair labels AB=1, AC=2, BC=3 | 2 | `two-constraint-plan-filter` / table / compare-plans | test time then points | AC gives exactly 30 and 10; AB fails time, BC fails points |

- [ ] **Step 4: Run green and quality suites**

Run: `node --test tests/chapter07V3.test.js tests/questionQualityV3.test.js tests/solutionEngine.test.js tests/difficultyEngine.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add game/curriculum/chapter07/questions/read-conditions.js tests/chapter07V3.test.js
git commit -m "content: add condition-role v3 questions"
```

### Task 8: `draw-bar-model` — Bar Models

**Files:**
- Create: `game/curriculum/chapter07/questions/draw-bar-model.js`
- Modify: `tests/chapter07V3.test.js`

**Interfaces:** Produces ten V3 questions for `draw-bar-model`.

- [ ] **Step 1: Add failing test and run it**

```js
test("draw-bar-model changes direction and representation across ten slots", () => {
  const questions = require("../game/curriculum/chapter07/questions/draw-bar-model.js");
  assertTopicPack("draw-bar-model", questions);
  assert.equal(questions[9].answer, "20");
  assert.deepEqual(questions[9].supportingConcepts.sort(), ["ratio-model", "read-conditions"].sort());
});
```

Run: `node --test tests/chapter07V3.test.js --test-name-pattern "draw-bar-model"`

Expected: FAIL with missing module.

- [ ] **Step 2: Author the ten blueprints**

| Slot | Exact relation | Answer | Structure and method | Independent verification |
|---|---|---:|---|---|
| 1 | whole 42, known part 18 | 24 | part-whole bar; subtract | 18+24=42 |
| 2 | sum 36, difference 8; smaller part | 14 | sum-difference bar; remove difference then halve | 14+22=36 and 22−14=8 |
| 3 | three equal bar sections, each 12 | 36 | representation shift from bar to multiplication | 36÷3=12 |
| 4 | larger part 27, difference 9; find whole | 45 | reverse bar; derive smaller 18 then sum | 45−27=18 and 27−18=9 |
| 5 | class label “1班” irrelevant; 58 students, boys 4 more | 27 girls | condition-role bar | 27+31=58 and difference 4 |
| 6 | red:blue=2:3, total 40; red | 16 | ratio bar with five equal units | 16:24=2:3 |
| 7 | A+B=72, B+C=64, A+C=68; find B | 34 | overlapping bars; `(72+64−68)÷2` | A=38,C=30, all pair sums match |
| 8 | total 54, difference 10; smaller | 22 | compare bar method and equation method | 22+32=54 and difference 10 |
| 9 | total ribbon 96; third 16; first:second=3:1; second | 20 | read-conditions transfer + ratio bar | 60+20+16=96 |
| 10 | A=2B, C=B+12, A+B+C=92; find B | 20 | three-part Boss bar | A=40,C=32, total 92 and both relations hold |

- [ ] **Step 3: Run quality suites and commit**

Run: `node --test tests/chapter07V3.test.js tests/questionQualityV3.test.js tests/solutionEngine.test.js tests/difficultyEngine.test.js`

Expected: PASS.

```bash
git add game/curriculum/chapter07/questions/draw-bar-model.js tests/chapter07V3.test.js
git commit -m "content: add bar-model v3 questions"
```

### Task 9: `diagram-model` — Diagram Decomposition

**Files:**
- Create: `game/curriculum/chapter07/questions/diagram-model.js`
- Modify: `tests/chapter07V3.test.js`

**Interfaces:** Produces ten V3 questions for `diagram-model`.

- [ ] **Step 1: Add failing test**

Assert the pack contract, slot 7 uses a stair-step perimeter family, and slot 10 answers 22 with supporting concepts `geometry-decomposition` and `draw-bar-model`.

Run: `node --test tests/chapter07V3.test.js --test-name-pattern "diagram-model"`

Expected: FAIL with missing module.

- [ ] **Step 2: Author the blueprints**

| Slot | Exact diagram relation | Answer | Structure and main method | Independent verification |
|---|---|---:|---|---|
| 1 | five marked points on one segment create adjacent pieces | 4 | point-to-segment correspondence | trace four adjacent gaps |
| 2 | 8×5 rectangle, shaded strip width 3 | 15 | rectangle strip area | five rows of three squares |
| 3 | four unit squares in an L shape | perimeter 10 | edge-cancellation diagram | trace ten outside unit edges |
| 4 | rectangle area 48, width 6; length | 8 | reverse area diagram | 8×6=48 |
| 5 | red diagonal is irrelevant; square side 7; perimeter | 28 | remove non-boundary information | four sides each 7 |
| 6 | 10×6 rectangle with 4×2 rectangular hole removed; area | 52 | large-minus-hole | split remaining area into 6×6 and 4×4 =52 |
| 7 | stair path spans width 8 and height 5; closed with bottom and side; perimeter | 26 | straighten monotone stair edges | bounding rectangle perimeter 2×(8+5) |
| 8 | 12×8 board with 4×3 corner removed; remaining area | 84 | compare subtract-hole and split-sum | 8×8+4×5=84 |
| 9 | aligned sections total 45; first 18, second 12; third | 15 | bar-to-diagram transfer | 18+12+15=45 |
| 10 | 6×5 grid rectangle with a 2×2 corner notch; perimeter | 22 | Boss boundary replacement | original perimeter 22; removed outer lengths 4 equal added notch lengths 4 |

- [ ] **Step 3: Run quality suites and commit**

Run: `node --test tests/chapter07V3.test.js tests/questionQualityV3.test.js tests/solutionEngine.test.js tests/difficultyEngine.test.js`

Expected: PASS.

```bash
git add game/curriculum/chapter07/questions/diagram-model.js tests/chapter07V3.test.js
git commit -m "content: add diagram-model v3 questions"
```

### Task 10: `table-method` — Tabular Organization

**Files:**
- Create: `game/curriculum/chapter07/questions/table-method.js`
- Modify: `tests/chapter07V3.test.js`

**Interfaces:** Produces ten V3 questions for `table-method`.

- [ ] **Step 1: Add the failing pack test**

Require exact slot answers `[36,40,34,33,34,28,127,26,49,48]` and assert slot 10 direction is `compare-plans`.

Run: `node --test tests/chapter07V3.test.js --test-name-pattern "table-method"`

Expected: FAIL with missing module.

- [ ] **Step 2: Author the blueprints**

| Slot | Table data and question | Answer | Main method | Independent verification |
|---|---|---:|---|---|
| 1 | rows 12,15,9; total | 36 | column sum | average 12 across three adjusted rows |
| 2 | Monday 18, Tuesday 22; two-day total | 40 | row sum | 40−18=22 |
| 3 | 3 items at 6 and 2 items at 8; cost | 34 | quantity×unit-price columns | 34−18=16=2×8 |
| 4 | total 75, known entries 18 and 24; missing | 33 | reverse column total | 18+24+33=75 |
| 5 | team number 4 irrelevant; round scores 8,10,9,7 | 34 | discard label then row total | pair sums 18 and16 |
| 6 | route times A35,B28,C31; shortest time | 28 | comparison column | differences A−B=7,C−B=3 |
| 7 | opening120, incoming45, outgoing38; closing | 127 | inventory balance table | 127+38−45=120 |
| 8 | plan1=3×8+5, plan2=2×10+6; minimum | 26 | compare completed rows | plan1=29, difference3 |
| 9 | A:6 boxes×4, B:5 boxes×5; combined | 49 | two-level correspondence table | 49−24=25 |
| 10 | A(cost48,time30), B(52,24), C(45,36); require cost≤50 and time≤32; qualifying cost | 48 | two-constraint filter | B fails cost, C fails time, A satisfies both |

- [ ] **Step 3: Run tests and commit**

Run: `node --test tests/chapter07V3.test.js tests/questionQualityV3.test.js tests/solutionEngine.test.js tests/difficultyEngine.test.js`

Expected: PASS.

```bash
git add game/curriculum/chapter07/questions/table-method.js tests/chapter07V3.test.js
git commit -m "content: add table-method v3 questions"
```

### Task 11: `enumeration-method` — Systematic Enumeration

**Files:**
- Create: `game/curriculum/chapter07/questions/enumeration-method.js`
- Modify: `tests/chapter07V3.test.js`

**Interfaces:** Produces ten V3 questions for `enumeration-method`.

- [ ] **Step 1: Add failing test**

Assert exact answers `[4,6,5,7,6,2,4,6,5,3]`; slot 10 must enumerate the exact triples `(1,2,6)`, `(1,3,5)`, `(2,3,4)` in its verification summary.

Run: `node --test tests/chapter07V3.test.js --test-name-pattern "enumeration-method"`

Expected: FAIL with missing module.

- [ ] **Step 2: Author the blueprints**

| Slot | Enumeration set | Answer | Structure | Independent verification |
|---|---|---:|---|---|
| 1 | choose one from {1,2} and one from {3,5}; distinct sums | 4 | two-list enumeration | list 4,6,5,7 |
| 2 | two-digit numbers from 1,2,3 without repeat | 6 | ordered enumeration | three tens choices × two units choices |
| 3 | unordered positive pairs summing to 10 | 5 | table enumeration | pairs (1,9)…(5,5) |
| 4 | positive integer pairs a<b, a+b=15 | 7 | reverse boundary enumeration | a ranges 1 through7 only |
| 5 | two-digit even numbers from 1,2,3,4 without repeat | 6 | constraint enumeration | units 2 choices × tens 3 choices |
| 6 | ways to make 10 using only 2-value and 5-value coins | 2 | integer-case enumeration | five 2s or two 5s |
| 7 | arrange A,B,C with A not first | 4 | exclude cases | total6 minus two A-first arrangements |
| 8 | choose two books from four | 6 | method choice: list vs multiplication/divide symmetry | six explicit unordered pairs |
| 9 | 3 mains ×2 drinks minus one unavailable pairing | 5 | table transfer | enumerate five permitted cells |
| 10 | choose 3 distinct numbers from 1…6 summing to9 | 3 | bounded Boss enumeration | exact three triples above; no triple starts above2 |

- [ ] **Step 3: Run tests and commit**

Run: `node --test tests/chapter07V3.test.js tests/questionQualityV3.test.js tests/solutionEngine.test.js tests/difficultyEngine.test.js`

Expected: PASS.

```bash
git add game/curriculum/chapter07/questions/enumeration-method.js tests/chapter07V3.test.js
git commit -m "content: add enumeration-method v3 questions"
```

### Task 12: `tree-diagram` — Branch Counting

**Files:**
- Create: `game/curriculum/chapter07/questions/tree-diagram.js`
- Modify: `tests/chapter07V3.test.js`

**Interfaces:** Produces ten V3 questions for `tree-diagram`.

- [ ] **Step 1: Add failing test**

Assert answers `[6,4,6,4,5,6,12,8,6,12]`; slot 10 verification must count A/B branches as 10 and C branch as 2.

Run: `node --test tests/chapter07V3.test.js --test-name-pattern "tree-diagram"`

Expected: FAIL with missing module.

- [ ] **Step 2: Author the blueprints**

| Slot | Branch rules | Answer | Main strategy | Independent verification |
|---|---|---:|---|---|
| 1 | 2 shirts then 3 trousers | 6 | two-layer tree | 3 leaves under each of two roots |
| 2 | 2 first roads then 2 second roads | 4 | route tree | explicit four route codes |
| 3 | 3 starters then 2 endings | 6 | text-to-tree shift | 3×2 |
| 4 | total leaves12, first layer3 equal branches; second options | 4 | reverse branch count | 3×4=12 |
| 5 | 3 mains ×2 drinks, one pairing forbidden | 5 | prune invalid leaf | six original leaves minus one |
| 6 | three-digit codes from1,2,3 without repetition | 6 | branch pruning | 3×2×1 |
| 7 | 2 starts ×3 middles ×2 finishes | 12 | three-layer dependent count | six middle paths each two finishes |
| 8 | three coin tosses | 8 | choose tree over flat list | binary leaves 2³ |
| 9 | 3 outward routes, return cannot repeat outward | 6 | enumeration transfer | 3×2 and list route pairs |
| 10 | first A/B/C; second1/2/3; third X/Y; C forbids Y; second3 forbids X | 12 | pruned Boss tree | A/B branches total10; C branch total2 |

- [ ] **Step 3: Run tests and commit**

Run: `node --test tests/chapter07V3.test.js tests/questionQualityV3.test.js tests/solutionEngine.test.js tests/difficultyEngine.test.js`

Expected: PASS.

```bash
git add game/curriculum/chapter07/questions/tree-diagram.js tests/chapter07V3.test.js
git commit -m "content: add tree-diagram v3 questions"
```

### Task 13: `assumption-method` — Uniform Assumption and Adjustment

**Files:**
- Create: `game/curriculum/chapter07/questions/assumption-method.js`
- Modify: `tests/chapter07V3.test.js`

**Interfaces:** Produces ten V3 questions for `assumption-method` without duplicating the existing chicken-rabbit gold prompts.

- [ ] **Step 1: Add failing test**

Assert answers `[5,7,6,40,10,3,9,8,18,13]`; slot 10 must first restore refunded revenue and must not divide by 1.

Run: `node --test tests/chapter07V3.test.js --test-name-pattern "assumption-method"`

Expected: FAIL with missing module.

- [ ] **Step 2: Author the blueprints**

| Slot | Exact assumption model | Answer | Main strategy | Independent verification |
|---|---|---:|---|---|
| 1 | 11 bicycles/tricycles, 27 wheels; tricycles | 5 | assume all bicycles | 5×3+6×2=27 |
| 2 | 10 questions, +5 correct/−2 wrong, score29; correct | 7 | assume all correct then convert 21-point loss into3 wrong | 7×5−3×2=29 |
| 3 | 18 coins of values2 and5, total54; value5 coins | 6 | table assumption all value2 | 6×5+12×2=54 |
| 4 | 14 animals, 6 four-leg, rest two-leg; total legs | 40 | reverse known-category total | all-two 28 plus12 extra |
| 5 | ticket booth number9 irrelevant; 20 tickets priced8/5, revenue130; price8 tickets | 10 | discard label, assume all child tickets | 10×8+10×5=130 |
| 6 | 12 boxes weigh4 or7 kg, total57; heavy boxes | 3 | assume all 4 kg | 3×7+9×4=57 |
| 7 | 18 bicycles/tricycles; three tricycles each missing one wheel; currently42; tricycles | 9 | restore3 wheels then assume | 9×3+9×2−3=42 |
| 8 | 24 two-leg/four-leg models, total64; four-leg | 8 | compare assumption and equation | 8×4+16×2=64 |
| 9 | 30 tasks score3 or5, total126; score5 tasks | 18 | table transfer and uniform baseline | 18×5+12×3=126 |
| 10 | 25 adult/child tickets cost12/7; two adult tickets refunded; current revenue216; original adult count | 13 | restore24, assume all child, adjust by5 | 13×12+12×7−24=216 |

- [ ] **Step 3: Run tests and commit**

Run: `node --test tests/chapter07V3.test.js tests/questionQualityV3.test.js tests/solutionEngine.test.js tests/difficultyEngine.test.js`

Expected: PASS.

```bash
git add game/curriculum/chapter07/questions/assumption-method.js tests/chapter07V3.test.js
git commit -m "content: add assumption-method v3 questions"
```

### Task 14: `reverse-thinking` — Inverse Operation Chains

**Files:**
- Create: `game/curriculum/chapter07/questions/reverse-thinking.js`
- Modify: `tests/chapter07V3.test.js`

**Interfaces:** Produces ten V3 questions for `reverse-thinking`.

- [ ] **Step 1: Add failing test**

Assert answers `[7,9,26,19,24,33,12,17,48,44]`; every main solution starts from the final condition, and slot 10 verification runs the original operations forward.

Run: `node --test tests/chapter07V3.test.js --test-name-pattern "reverse-thinking"`

Expected: FAIL with missing module.

- [ ] **Step 2: Author the blueprints**

| Slot | Forward process | Start answer | Reverse path | Forward verification |
|---|---|---:|---|---|
| 1 | +8 then ×3 gives45 | 7 | 45÷3−8 | (7+8)×3=45 |
| 2 | ×4 then −6 gives30 | 9 | (30+6)÷4 | 9×4−6=30 |
| 3 | −5 then ÷3 gives7 | 26 | 7×3+5 | (26−5)÷3=7 |
| 4 | ×2 then +12 gives50 | 19 | (50−12)÷2 | 19×2+12=50 |
| 5 | box label4 irrelevant; ÷2 then +9 gives21 | 24 | discard label; (21−9)×2 | 24÷2+9=21 |
| 6 | divide by5 gives quotient6 remainder3 | 33 | 6×5+3 | 33÷5 has quotient6 remainder3 |
| 7 | +6, ×2, −4 gives32 | 12 | (32+4)÷2−6 | full forward chain |
| 8 | ×3 then −10 gives41 | 17 | compare reverse chain with equation3x−10=41 | 17×3−10=41 |
| 9 | spend half, then spend8, remain16 | 48 | 16+8 then ×2 | 48÷2−8=16 |
| 10 | pour out half, add8, pour out one third, remain20 | 44 | 20÷(2/3)=30; 30−8=22; 22×2=44 | 44→22→30→20 |

- [ ] **Step 3: Run tests and commit**

Run: `node --test tests/chapter07V3.test.js tests/questionQualityV3.test.js tests/solutionEngine.test.js tests/difficultyEngine.test.js`

Expected: PASS.

```bash
git add game/curriculum/chapter07/questions/reverse-thinking.js tests/chapter07V3.test.js
git commit -m "content: add reverse-thinking v3 questions"
```

### Task 15: `transformation-method` — Equivalent Substitution

**Files:**
- Create: `game/curriculum/chapter07/questions/transformation-method.js`
- Modify: `tests/chapter07V3.test.js`

**Interfaces:** Produces ten V3 questions for `transformation-method`.

- [ ] **Step 1: Add failing test**

Assert answers `[12,18,6,10,10,24,35,7,20,19]`; slots 8–10 include two strategy choices and slot 10 normalizes every symbol to C-units.

Run: `node --test tests/chapter07V3.test.js --test-name-pattern "transformation-method"`

Expected: FAIL with missing module.

- [ ] **Step 2: Author the blueprints**

| Slot | Equivalence | Answer | Main transformation | Independent verification |
|---|---|---:|---|---|
| 1 | 1 large bag =3 small bags; 4 large | 12 small | direct substitution | 12÷4=3 |
| 2 | 1 crane =3 workers; 4 cranes+6 workers | 18 workers | replace cranes | 18−6=12=4×3 |
| 3 | 3 stars =18 points; 1 star | 6 | equation representation | 6×3=18 |
| 4 | 2 large boxes =5 small; 4 large | 10 small | scale equivalence | 10÷2=5 groups matching two-large units |
| 5 | colors irrelevant; 1 robot=2 carts; 3 robots+4 carts | 10 carts | discard color, substitute robots | 10−4=6=3×2 |
| 6 | 1 A=2B, 1B=3C; 4A | 24 C | chained substitution | 24÷4÷2=3 C per B |
| 7 | A=2B, each B=5 kg; 2A+3B | 35 kg | convert to7B then scale | 2×10+3×5=35 |
| 8 | 5A=10B; value of2A+3B | 7 B | choose per-A conversion or whole-group scaling | A=2B, so4B+3B |
| 9 | 8 objects are large/small; large equals3 small units; total16 small units; large count | 4 | assumption transfer via unit substitution | 4×3+4×1=16 |
| 10 | A=2B, B=3C; value of2A+B+4C | 19 C | Boss normalize to C | 2×6+3+4=19; reverse groups recover relations |

- [ ] **Step 3: Run tests and commit**

Run: `node --test tests/chapter07V3.test.js tests/questionQualityV3.test.js tests/solutionEngine.test.js tests/difficultyEngine.test.js`

Expected: PASS.

```bash
git add game/curriculum/chapter07/questions/transformation-method.js tests/chapter07V3.test.js
git commit -m "content: add transformation-method v3 questions"
```

### Task 16: `unit-method` — Normalize and Scale

**Files:**
- Create: `game/curriculum/chapter07/questions/unit-method.js`
- Modify: `tests/chapter07V3.test.js`

**Interfaces:** Produces ten V3 questions for `unit-method`.

- [ ] **Step 1: Add failing test**

Assert answers `[35,30,64,15,42,300,96,16,240,200]`; slot 8 declares inverse scaling, and slot 10 independently verifies total worker-days.

Run: `node --test tests/chapter07V3.test.js --test-name-pattern "unit-method"`

Expected: FAIL with missing module.

- [ ] **Step 2: Author the blueprints**

| Slot | Unit relation | Answer | Main strategy | Independent verification |
|---|---|---:|---|---|
| 1 | 4 notebooks cost20; 7 cost | 35 | find one notebook then scale | 35÷7=5 and 4×5=20 |
| 2 | 6 machines make18 parts/hour; 10 machines | 30 | per-machine rate | 30÷10=3 |
| 3 | 5 kg apples cost40; 8 kg | 64 | table unit price | 64÷8=8 |
| 4 | 9 m ribbon costs54; 90 buys metres | 15 | reverse budget ÷ unit price | 15×6=90 |
| 5 | counter label7 irrelevant; 6 packs each7 cards | 42 | discard label then normalize group | 42÷6=7 |
| 6 | 3 hours travel180 km; 5 hours same speed | 300 | unit speed | 300÷5=60 and 60×3=180 |
| 7 | 3 packs cost12; 4 boxes each6 packs | 96 | pack unit price then nested scale | 24 packs ×4 |
| 8 | 12 workers need8 days; 6 equal workers need days | 16 | invariant worker-days | 12×8=6×16 |
| 9 | 5 taps fill200 L in4 min; 8 taps in3 min | 240 | per-tap-per-minute rate | 240÷(8×3)=10 |
| 10 | 4 workers×6 days make120; 5 workers×8 days | 200 | Boss normalize to worker-day | both routes give5 units per worker-day |

- [ ] **Step 3: Run tests and commit**

Run: `node --test tests/chapter07V3.test.js tests/questionQualityV3.test.js tests/solutionEngine.test.js tests/difficultyEngine.test.js`

Expected: PASS.

```bash
git add game/curriculum/chapter07/questions/unit-method.js tests/chapter07V3.test.js
git commit -m "content: add unit-method v3 questions"
```

### Task 17: `estimation-method` — Bounds and Feasibility

**Files:**
- Create: `game/curriculum/chapter07/questions/estimation-method.js`
- Modify: `tests/chapter07V3.test.js`

**Interfaces:** Produces ten V3 questions for `estimation-method`.

- [ ] **Step 1: Add failing test**

Assert answers `[603,1000,7,49,6,5,6,11,8,9]`; every ceil/boundary answer has a lower insufficiency and upper sufficiency check.

Run: `node --test tests/chapter07V3.test.js --test-name-pattern "estimation-method"`

Expected: FAIL with missing module.

- [ ] **Step 2: Author the blueprints**

| Slot | Boundary problem | Answer | Main method | Independent verification |
|---|---|---:|---|---|
| 1 | 398+205 exact total after estimating 400+200 | 603 | estimate then exact | 603 lies between600 and610 |
| 2 | nearest-hundred estimate of49×21 | 1000 | 50×20 | exact1029 differs by29 |
| 3 | 53 items, 8 per box; boxes | 7 | upper integer bound | 6 boxes hold48<53; 7 hold56≥53 |
| 4 | minimum items requiring7 boxes of capacity8 | 49 | reverse boundary | 48 fits6,49 does not |
| 5 | bus label6 irrelevant; 247 people, 45 per bus; buses | 6 | discard label, ceil bound | 5 buses225<247,6 buses270≥247 |
| 6 | budget100, item price19; max items | 5 | upper affordability bound | 5 cost95,6 cost114 |
| 7 | 237 people, bus capacity45 | 6 | multi-step quotient/remainder | 5×45=225 leaves12 |
| 8 | compare 31×19 with600; shortfall | 11 | estimate then exact comparison | 31×19=589,600−589=11 |
| 9 | choose two distinct positive integers with sum20 and difference at least4; maximum possible smaller number | 8 | enumeration transfer and bound | 8 and12 work; 9 and11 differ only2, so no larger smaller-number works |
| 10 | four sock colors; minimum draws guaranteeing three of one color | 9 | worst-case bridge | 8 can be two of each; ninth creates a third |

For slot 9, use the complete condition: “选两个不同的正整数，和为20且相差至少4，较小数最大是多少？” The maximum is 8 because 8 and12 work, while 9 and11 differ only2.

- [ ] **Step 3: Run tests and commit**

Run: `node --test tests/chapter07V3.test.js tests/questionQualityV3.test.js tests/solutionEngine.test.js tests/difficultyEngine.test.js`

Expected: PASS.

```bash
git add game/curriculum/chapter07/questions/estimation-method.js tests/chapter07V3.test.js
git commit -m "content: add estimation-method v3 questions"
```

### Task 18: `verify-eliminate` — Verification and Elimination Boss

**Files:**
- Create: `game/curriculum/chapter07/questions/verify-eliminate.js`
- Modify: `tests/chapter07V3.test.js`

**Interfaces:** Produces ten V3 questions for `verify-eliminate` and completes the 120-question set.

- [ ] **Step 1: Add failing test**

Assert answers `[1,3,24,2,4,2,36,2,8,2]`; slot 10 must reject plans 1 and3 for different reasons and independently verify plan2.

Run: `node --test tests/chapter07V3.test.js --test-name-pattern "verify-eliminate"`

Expected: FAIL with missing module.

- [ ] **Step 2: Author the blueprints**

| Slot | Candidate check | Answer | Main method | Independent verification |
|---|---|---:|---|---|
| 1 | candidate “24÷6=4” is correct; correct=1, incorrect=0 | 1 | direct substitution | 4×6=24 |
| 2 | candidates for x+7=20 are 11,12,13 labeled1,2,3 | 3 | eliminate by substitution | 13+7=20 |
| 3 | table row has 8,7,9; claimed total candidates22,23,24 | 24 | recompute column | 24−9=15=8+7 |
| 4 | worked chain for `(18+6)÷3`: step1=24, step2=6, step3=8; wrong step label | 2 | locate first invalid step | recompute24÷3=8 |
| 5 | shelf number4 irrelevant; candidates for 5 boxes×9 books are40,45,54 labeled3,4,5 | 4 | discard label, verify candidate | 45÷5=9 |
| 6 | sum of two odd numbers; candidates odd/even labeled1/2 | 2 | parity elimination | examples3+5 and7+9 are even |
| 7 | candidate side9 for square perimeter36 | 36 requested perimeter after checking side | substitution then reverse check | 36÷4=9 |
| 8 | total54 difference10, candidate smaller values20(label1),22(label2),24(label3) | 2 | compare equation and bar checks | 22+32=54 and difference10 |
| 9 | 24 two/four-leg models total64; candidate four-leg8 | 8 | assumption transfer verification | 8×4+16×2=64 |
| 10 | plans: 1=(cost46,time35,score12), 2=(49,30,11), 3=(52,27,14); require cost≤50,time≤32,score≥11 | 2 | Boss sequential elimination | plan1 fails time, plan3 fails cost, plan2 meets all three |

- [ ] **Step 3: Run the complete content gate**

Run: `node --test tests/chapter07V3.test.js tests/topicQualityV3.test.js tests/questionQualityV3.test.js tests/solutionEngine.test.js tests/difficultyEngine.test.js tests/readability.test.js`

Expected: PASS with 12 packs, 120 unique IDs, and all topic-quality gates.

- [ ] **Step 4: Commit**

```bash
git add game/curriculum/chapter07/questions/verify-eliminate.js tests/chapter07V3.test.js
git commit -m "content: add verification-elimination v3 questions"
```

### Task 19: Enforce Review Hashes in the Runtime Registration Path

**Files:**
- Create: `game/curriculum/runtimeReviewIntegrity.js`
- Create: `tests/runtimeReviewIntegrity.test.js`
- Modify: `scripts/humanReviewIntegrity.js`
- Modify: `scripts/generate-human-review-template.js`
- Modify: `game/curriculum/contentBatchRegistry.js`
- Modify: `src/game-main.js`
- Modify: `tests/curriculumBatch.test.js`
- Modify: `tests/chapterBuilder.test.js`
- Modify: `tests/validateGameContent.test.js`
- Modify: `content/humanReview/candidates/gold-v3.json`

**Interfaces:**
- Produces: `getV3PedagogicalPayload(question)`, `getRuntimeQuestionHash(question): string`, `getRuntimeManifestHash(records): string`, `validateRuntimeReview(batch, manifest): string[]`.
- Preserves: existing SHA-256 `contentHash` values and all 30 gold review decisions/evidence.

- [ ] **Step 1: Write failing shared-hash and stale-registration tests**

```js
const fs = require("node:fs");
const path = require("node:path");
const integrity = require("../game/curriculum/runtimeReviewIntegrity.js");
const registry = require("../game/curriculum/contentBatchRegistry.js");
const GoldBatch = require("../game/curriculum/gold/index.js");

const validV3Question = () => structuredClone(require("../game/curriculum/gold/chickenRabbit.js")[0]);
function recursivelyReverseObjectKeys(value) {
  if (Array.isArray(value)) return value.map(recursivelyReverseObjectKeys);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).reverse().map((key) => [key, recursivelyReverseObjectKeys(value[key])]));
}
function approvedBatchWithRuntimeHashes(contentVersion = "2026.08.13-gold.900") {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "content", "humanReview", "candidates", "gold-v3.json"), "utf8"));
  manifest.contentVersion = contentVersion;
  const batch = GoldBatch.buildGoldV3Batch(manifest);
  batch.contentVersion = contentVersion;
  return batch;
}

test("runtime review hashes are deterministic across key order and pedagogical changes", () => {
  const left = validV3Question();
  const reordered = recursivelyReverseObjectKeys(left);
  assert.equal(integrity.getRuntimeQuestionHash(left), integrity.getRuntimeQuestionHash(reordered));
  reordered.prompt += "改";
  assert.notEqual(integrity.getRuntimeQuestionHash(left), integrity.getRuntimeQuestionHash(reordered));
});

test("registry rejects an approved manifest with one stale runtime hash atomically", () => {
  const batch = approvedBatchWithRuntimeHashes();
  assert.equal(registry.registerContentBatch(batch), true);
  const before = registry.getActiveTopicQuestions("chapter-01", "chicken-rabbit");
  const stale = approvedBatchWithRuntimeHashes("2026.08.13-gold.901");
  stale.reviewManifest.records[4].runtimeHash = "0000000000000000";
  assert.equal(registry.registerContentBatch(stale), false);
  assert.deepEqual(registry.getActiveTopicQuestions("chapter-01", "chicken-rabbit"), before);
});
```

- [ ] **Step 2: Run red tests**

Run: `node --test tests/runtimeReviewIntegrity.test.js tests/curriculumBatch.test.js --test-name-pattern "runtime review|stale runtime hash"`

Expected: FAIL because `runtimeReviewIntegrity.js` and runtime hashes are absent.

- [ ] **Step 3: Implement a browser-safe canonical runtime hash**

Move `V3_PEDAGOGICAL_CONTENT_FIELDS`, `sortCanonical`, and V3 payload construction into the shared module; `scripts/humanReviewIntegrity.js` imports them and continues computing the existing SHA-256 review hash. Add FNV-1a-64 for synchronous browser stale detection:

```js
function fnv1a64(value) {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (const byte of new TextEncoder().encode(String(value))) {
    hash ^= BigInt(byte);
    hash = BigInt.asUintN(64, hash * prime);
  }
  return hash.toString(16).padStart(16, "0");
}

function getRuntimeQuestionHash(question) {
  return fnv1a64(JSON.stringify(getV3PedagogicalPayload(question)));
}

function getRuntimeManifestHash(records) {
  const rows = records.map((record) => `${record.questionId}:${record.runtimeHash}`).sort();
  return fnv1a64(rows.join("\n"));
}
```

- [ ] **Step 4: Extend generated manifests without changing approval meaning**

Each V3 record receives derived `runtimeHash`; the manifest receives derived `runtimeContentHash`. Existing `contentHash`, reviewer, reviewedAt, evidence, and decisions remain unchanged when pedagogical content is unchanged. Regenerate `gold-v3.json`, assert all 30 original SHA-256 `contentHash` values and approval fields are byte-for-byte equal to their pre-task values, and only the two derived runtime-hash fields are added.

Change the template signature to `buildCurriculumBatchReviewTemplate(batch, existing = {})`. Index existing records by `questionId`; reuse reviewer, reviewedAt, evidence, decisions, and approved top-level status only when the existing SHA-256 `contentHash` equals the newly computed one. A changed or missing SHA-256 hash resets that record to pending fields, regardless of its runtime hash. The CLI reads the existing manifest before generation and passes it to this function, so derived-field migration cannot erase a valid human review.

Update every approved batch fixture in `tests/curriculumBatch.test.js` and `tests/chapterBuilder.test.js` to build one review record per fixture question with `runtimeHash`, then compute `runtimeContentHash`; do not add a registry exception for tests or for manifests that omit runtime fields.

- [ ] **Step 5: Validate review identity before any active-map mutation**

```js
function validateRuntimeReview(batch, manifest) {
  const questions = batch.topics.flatMap((topic) => topic.questions);
  const records = Array.isArray(manifest?.records) ? manifest.records : [];
  const byId = new Map(records.map((record) => [record.questionId, record]));
  const errors = [];
  if (manifest?.batchId !== batch.id) errors.push("runtime review batch mismatch");
  if (manifest?.contentVersion !== batch.contentVersion) errors.push("runtime review version mismatch");
  if (manifest?.status !== "approved" && batch.status === "approved") errors.push("runtime review is not approved");
  if (records.length !== questions.length) errors.push("runtime review record count mismatch");
  for (const question of questions) {
    const record = byId.get(question.id);
    if (!record) errors.push(`runtime review missing: ${question.id}`);
    else if (record.runtimeHash !== getRuntimeQuestionHash(question)) errors.push(`runtime review hash mismatch: ${question.id}`);
  }
  if (manifest?.runtimeContentHash !== getRuntimeManifestHash(records)) errors.push("runtime manifest hash mismatch");
  return errors;
}
```

Call this from `contentBatchRegistry.validateContentBatch` when `batch.reviewManifest` exists and from `registerContentBatch` before constructing `replacements`. Register `runtimeReviewIntegrity.js` before the batch registry in `src/game-main.js` and extend the real VM loader test.

The VM browser-loader fixtures must pass the platform `TextEncoder` into `vm.createContext`; production browsers and Node 20 already provide it. This is test-environment plumbing, not a runtime polyfill.

- [ ] **Step 6: Run focused, full manifest, and build checks**

Run: `node --test tests/runtimeReviewIntegrity.test.js tests/curriculumBatch.test.js tests/validateGameContent.test.js`

Run: `npm run build`

Expected: PASS; the existing approved gold batch still activates, while one stale runtime hash prevents all replacement writes.

- [ ] **Step 7: Commit**

```bash
git add game/curriculum/runtimeReviewIntegrity.js scripts/humanReviewIntegrity.js scripts/generate-human-review-template.js game/curriculum/contentBatchRegistry.js src/game-main.js tests/runtimeReviewIntegrity.test.js tests/curriculumBatch.test.js tests/chapterBuilder.test.js tests/validateGameContent.test.js content/humanReview/candidates/gold-v3.json
git commit -m "fix: verify curriculum review hashes at runtime"
```

### Task 20: Assemble Candidate Batch and Generate Human-Readable Review Material

**Files:**
- Create: `game/curriculum/chapter07/index.js`
- Create: `scripts/generate-curriculum-review-html.js`
- Create: `scripts/generate-curriculum-runtime-payload.js`
- Create: `content/humanReview/candidates/chapter-07-v3.json`
- Modify: `scripts/generate-human-review-template.js`
- Modify: `scripts/validate-game-content.js`
- Modify: `scripts/validate-curriculum-batch.js`
- Modify: `tests/curriculumBatch.test.js`
- Modify: `tests/validateGameContent.test.js`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `CHAPTER_07_V3_BATCH_ID`, `CHAPTER_07_V3_CONTENT_VERSION`, `buildChapter07V3Batch(reviewManifest = null)`; CLI `node scripts/generate-curriculum-review-html.js --batch chapter-07-v3 --output artifacts/human-review/chapter-07-v3.html`; `writeRuntimePayload(batch, outputPath)` rejects every non-approved or hash-invalid batch.

- [ ] **Step 1: Write failing batch-size, manifest, and HTML tests**

```js
const chapter07 = require("../game/curriculum/chapter07/index.js");
const templates = require("../scripts/generate-human-review-template.js");
const reviewHtml = require("../scripts/generate-curriculum-review-html.js");
const runtimePayload = require("../scripts/generate-curriculum-runtime-payload.js");

test("Chapter 07 candidate contains twelve complete topics and 120 review records", () => {
  const batch = chapter07.buildChapter07V3Batch();
  assert.equal(batch.id, "chapter-07-v3");
  assert.equal(batch.contentVersion, "2026.08.19-ch07.1");
  assert.equal(batch.topics.length, 12);
  assert.equal(batch.topics.flatMap((topic) => topic.questions).length, 120);
  const manifest = templates.buildCurriculumBatchReviewTemplate(batch);
  assert.equal(manifest.records.length, 120);
});

test("review HTML exposes every prompt, answer, solution, verification, and criterion", () => {
  const html = reviewHtml.renderCurriculumReviewHtml(chapter07.buildChapter07V3Batch());
  assert.equal((html.match(/data-review-question=/g) || []).length, 120);
  for (const text of ["题干", "答案", "主解", "独立验算", "难度", "易错点", "conceptAccurate", "pitfallAuthentic"]) {
    assert.ok(html.includes(text), text);
  }
});

test("runtime payload generation rejects pending review", () => {
  assert.throws(
    () => runtimePayload.serializeRuntimePayload(chapter07.buildChapter07V3Batch()),
    /approved curriculum batch required/
  );
});
```

- [ ] **Step 2: Run red tests**

Run: `node --test tests/curriculumBatch.test.js tests/validateGameContent.test.js --test-name-pattern "Chapter 07 candidate|review HTML"`

Expected: FAIL because batch and HTML generator modules are absent.

- [ ] **Step 3: Assemble the static batch in compatibility-map order**

```js
const TOPIC_QUESTIONS = Object.freeze({
  "read-conditions": require("./questions/read-conditions.js"),
  "draw-bar-model": require("./questions/draw-bar-model.js"),
  "diagram-model": require("./questions/diagram-model.js"),
  "table-method": require("./questions/table-method.js"),
  "enumeration-method": require("./questions/enumeration-method.js"),
  "tree-diagram": require("./questions/tree-diagram.js"),
  "assumption-method": require("./questions/assumption-method.js"),
  "reverse-thinking": require("./questions/reverse-thinking.js"),
  "transformation-method": require("./questions/transformation-method.js"),
  "unit-method": require("./questions/unit-method.js"),
  "estimation-method": require("./questions/estimation-method.js"),
  "verify-eliminate": require("./questions/verify-eliminate.js")
});

function buildChapter07V3Batch(reviewManifest = null) {
  const manifest = reviewManifest && typeof reviewManifest === "object" ? structuredClone(reviewManifest) : null;
  return {
    id: "chapter-07-v3",
    schemaVersion: 3,
    status: manifest?.status === "approved" ? "approved" : "candidate",
    contentVersion: "2026.08.19-ch07.1",
    ...(manifest ? { reviewManifest: manifest } : {}),
    topics: CHAPTER_07_MODULE_IDS.map((moduleId) => ({
      chapterId: "chapter-07",
      moduleId,
      questions: structuredClone(TOPIC_QUESTIONS[moduleId])
    }))
  };
}
```

- [ ] **Step 4: Remove hard-coded 30-record assumptions**

`validateCurriculumBatch(batch, manifest)` derives `expectedCount` from `batch.topics.flatMap(...).length`; it still rejects zero questions, duplicate IDs, unexpected records, missing records, and any record-count mismatch. The gold batch remains exactly 30 by its own content, while Chapter 07 is exactly 120 by tests.

`generate-human-review-template.js` uses a fixed builder map:

```js
const BATCH_BUILDERS = Object.freeze({
  "gold-v3": GoldBatch.buildGoldV3Batch,
  "chapter-07-v3": Chapter07Batch.buildChapter07V3Batch
});
```

Unknown IDs remain errors; `--approve` remains forbidden.

- [ ] **Step 5: Implement escaped read-only HTML generation**

The renderer HTML-escapes every authored string, groups by topic and slot, creates anchor navigation, and prints exact difficulty-engine output. It includes no approval button, network script, answer mutation, or manifest writer.

Add `/artifacts/human-review/` to `.gitignore`; assert the generator script remains tracked and the emitted HTML does not appear in `git status`.

Run: `node scripts/generate-human-review-template.js --batch chapter-07-v3`

Expected: writes 120 pending records with `reviewer: null`, `reviewedAt: null`, empty evidence, and six null decisions.

Run: `node scripts/generate-curriculum-review-html.js --batch chapter-07-v3 --output artifacts/human-review/chapter-07-v3.html`

Expected: writes a local HTML artifact containing 120 question cards.

Implement `generate-curriculum-runtime-payload.js` as a separate pure serializer plus CLI. It calls both `validateCurriculumBatch` and `RuntimeReviewIntegrity.validateRuntimeReview`, requires `publishable === true`, canonicalizes object keys without reordering arrays, and emits the complete batch—including review manifest—to JSON. It never reads approval from command-line flags and cannot convert pending records to approved records.

- [ ] **Step 6: Generalize curriculum validation CLI without weakening strictness**

`node scripts/validate-curriculum-batch.js --batch chapter-07-v3` validates one batch. With no `--batch`, it validates both known batches and returns non-zero if either is invalid or pending. Add scripts:

```json
{
  "validate:curriculum": "node scripts/validate-curriculum-batch.js",
  "review:chapter07": "node scripts/generate-curriculum-review-html.js --batch chapter-07-v3 --output artifacts/human-review/chapter-07-v3.html"
}
```

- [ ] **Step 7: Run candidate gates**

Run: `node --test tests/chapter07V3.test.js tests/curriculumBatch.test.js tests/validateGameContent.test.js`

Expected: PASS.

Run: `node scripts/validate-curriculum-batch.js --batch chapter-07-v3`

Expected: exit 1 with `automated question errors: 0 (120 questions)` and `review status pending is not publishable`.

- [ ] **Step 8: Commit candidate and tooling**

```bash
git add game/curriculum/chapter07/index.js scripts/generate-curriculum-review-html.js scripts/generate-curriculum-runtime-payload.js scripts/generate-human-review-template.js scripts/validate-game-content.js scripts/validate-curriculum-batch.js tests/curriculumBatch.test.js tests/validateGameContent.test.js package.json .gitignore content/humanReview/candidates/chapter-07-v3.json
git commit -m "feat: prepare chapter 7 curriculum review"
```

- [ ] **Step 9: Human-review checkpoint — stop before activation**

Open `http://localhost:5173/artifacts/human-review/chapter-07-v3.html` with the local Vite server. The curriculum owner reviews all twelve groups and 120 cards. Record requested corrections as content changes, rerun Task 20 generation so hashes refresh, bump content version when an already-approved hash changed, and repeat until the owner explicitly approves.

Do not continue to Task 21 without explicit approval after the review artifact is visible.

### Task 21: Record Approval, Atomically Activate Chapter 07, and Release-Verify

**Files:**
- Modify: `content/humanReview/candidates/chapter-07-v3.json`
- Create: `public/content/chapter-07-v3.runtime.json`
- Modify: `src/game-main.js`
- Modify: `scripts/check-bundle-size.js`
- Modify: `tests/curriculumBatch.test.js`
- Modify: `tests/validateGameContent.test.js`
- Modify: `scripts/game-ui-behavior.js`

**Interfaces:**
- Consumes: explicitly approved 120-record manifest whose hashes match the candidate.
- Produces: active `chapter-07-v3` batch loaded from a reviewed runtime JSON before chapter compilation; Chapter 07 builds 120 V3 questions and no production question comes from `methodQuestionPackFactory`.

- [ ] **Step 1: Write failing activation and all-or-nothing tests**

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const chapter07 = require("../game/curriculum/chapter07/index.js");
const registry = require("../game/curriculum/contentBatchRegistry.js");
const builder = require("../game/chapterBuilder.js");
const chapter07Modules = require("../game/chapter07QuestionPacks.js").chapterModules;
const { CHAPTER_07_MODULE_IDS } = require("../game/curriculum/compatibilityMap.js");

function loadApprovedChapter07Manifest() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "content", "humanReview", "candidates", "chapter-07-v3.json"), "utf8"));
}

function snapshotChapter07ActiveTopics() {
  return Object.fromEntries(CHAPTER_07_MODULE_IDS.map((moduleId) => [
    moduleId,
    registry.getActiveTopicQuestions("chapter-07", moduleId)
  ]));
}

test("approved Chapter 07 batch activates all twelve topics atomically", () => {
  const manifest = loadApprovedChapter07Manifest();
  const batch = chapter07.buildChapter07V3Batch(manifest);
  assert.equal(registry.registerContentBatch(batch), true);
  assert.deepEqual(registry.getActiveBatch("chapter-07-v3"), {
    id: "chapter-07-v3",
    status: "active",
    contentVersion: "2026.08.19-ch07.1",
    topicCount: 12,
    questionCount: 120
  });
  const chapter = builder.buildChapter("chapter-07", chapter07Modules);
  assert.equal(chapter.levels.flatMap((level) => level.questions).every((question) => question.schemaVersion === 3), true);
});

test("one stale review hash leaves all twelve Chapter 07 topics unchanged", () => {
  const before = snapshotChapter07ActiveTopics();
  const stale = loadApprovedChapter07Manifest();
  const replacement = chapter07.buildChapter07V3Batch(stale);
  replacement.contentVersion = "2026.08.19-ch07.2";
  replacement.reviewManifest.contentVersion = "2026.08.19-ch07.2";
  replacement.reviewManifest.records[37].runtimeHash = "0000000000000000";
  assert.equal(registry.registerContentBatch(replacement), false);
  assert.deepEqual(snapshotChapter07ActiveTopics(), before);
});
```

- [ ] **Step 2: Run red tests**

Run: `node --test tests/curriculumBatch.test.js --test-name-pattern "approved Chapter 07|stale review hash"`

Expected: FAIL because the manifest is pending and the browser does not register the batch.

- [ ] **Step 3: Record the real review outcome**

For every record, write the actual reviewer, ISO timestamp, concrete question-specific evidence, and six boolean decisions. Set top-level status to `approved` only if every decision is true and recompute `contentHash` using `getManifestContentHash(records)`. Never reuse generic evidence such as “all good”.

- [ ] **Step 4: Generate, load, and register the approved payload before chapter compilation**

```js
const chapter07PayloadUrl = new URL("../content/chapter-07-v3.runtime.json", import.meta.url);
const chapter07Response = await fetch(chapter07PayloadUrl);
if (!chapter07Response.ok) throw new Error(`Reviewed Chapter 07 payload failed to load: ${chapter07Response.status}`);
const approvedChapter07Batch = await chapter07Response.json();
if (approvedChapter07Batch.status !== "approved" || !ContentBatchRegistry.registerContentBatch(approvedChapter07Batch)) {
  throw new Error("Reviewed chapter-07-v3 content batch could not be activated");
}
```

Run:

`node scripts/generate-curriculum-runtime-payload.js --batch chapter-07-v3 --output public/content/chapter-07-v3.runtime.json`

Expected: writes the canonical approved payload and exits 0. Keep gold registration in place. Both registrations occur before `const chapters = ...`. Do not import the twelve authoring modules, `chapter07/index.js`, or the 120-record manifest from `src/game-main.js`; they remain Node authoring/review inputs and must not enter the main JavaScript chunk.

- [ ] **Step 5: Prove production Chapter 07 no longer uses the factory**

Add a test that temporarily replaces every legacy Chapter 07 `module.practices` with throwing getters after batch registration, then builds Chapter 07 successfully and receives the 120 expected V3 IDs. This proves the fallback exists for an inactive batch but is not read in the active production path.

- [ ] **Step 6: Verify replay, bridge UI, and reward idempotency with active content**

Extend the browser scenario to seed an old Chapter 07 completion, assert “内容已更新 · 可重新挑战”, replay the V3 level, confirm `activeRun.contentVersion === "2026.08.19-ch07.1"`, see the bridge/takeaway, and confirm no duplicate first reward transaction.

- [ ] **Step 7: Budget the external reviewed content without inflating the main bundle limits**

Keep `jsGzipBytes: 200 * 1024`, `cssGzipBytes: 20 * 1024`, and `totalGzipBytes: 210 * 1024` unchanged. Add `curriculumGzipBytes: 96 * 1024`, calculated from `dist/content/*.json` with `zlib.gzipSync`; print it in the success summary and fail when exceeded. `check-bundle-size.js` must parse the runtime payload, require exactly 12 topics/120 questions, and fail if any built JavaScript asset contains the exact first or last Chapter 07 prompt, proving the external content was not duplicated into the main chunks.

- [ ] **Step 8: Run the complete release gate**

Run in this exact order:

```bash
npm test
npm run check
npm run validate:curriculum
npm run validate:game
npm run validate:release
npm run smoke
npm run test:game-ui
npm run audit:ui
npm run build
npm run check:bundle
git diff --check
```

Expected:

- all Node tests pass;
- `validate:curriculum` reports active `gold-v3` with 3/30 and active `chapter-07-v3` with 12/120;
- `validate:game` still reports 9 chapters and 1080 questions;
- strict release, browser smoke, game UI, UI audit, production build, and bundle budgets pass;
- Chapter 07 has 120 V3 questions and zero active legacy factory questions;
- `git diff --check` exits 0.

- [ ] **Step 9: Commit activation**

```bash
git add content/humanReview/candidates/chapter-07-v3.json public/content/chapter-07-v3.runtime.json src/game-main.js scripts/check-bundle-size.js tests/curriculumBatch.test.js tests/validateGameContent.test.js scripts/game-ui-behavior.js
git commit -m "feat: activate reviewed chapter 7 curriculum"
```

- [ ] **Step 10: Final scope audit**

Compare the implementation against every acceptance item in `docs/superpowers/specs/2026-08-19-chapter-07-v3-learning-bridges-design.md`. Record exact file/command evidence for 12 topic contracts, 120 V3 questions, five fingerprints per topic, independent verification, visible review, atomic activation, four UI bridge locations, storage compatibility, reward idempotency, and every release command. Any missing evidence is unfinished work, not a documentation exception.
