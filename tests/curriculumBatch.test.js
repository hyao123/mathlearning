const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const builder = require("../game/chapterBuilder.js");
const registry = require("../game/curriculum/contentBatchRegistry.js");
const compatibility = require("../game/curriculum/compatibilityMap.js");
const curriculum = require("../game/curriculum/curriculumMap.js");
const quality = require("../game/curriculum/questionQualityV3.js");
const difficulty = require("../game/curriculum/difficultyEngine.js");

const CHICKEN_RABBIT_SLOT_IDS = [
  "chicken-rabbit-1",
  "chicken-rabbit-2",
  "chicken-rabbit-3",
  "chicken-rabbit-4",
  "chapter-01-chicken-rabbit-advance-1",
  "chicken-rabbit-5",
  "chicken-rabbit-6",
  "chicken-rabbit-9",
  "chicken-rabbit-7",
  "chicken-rabbit-8"
];

function validQuestion(level, id, overrides = {}) {
  return {
    schemaVersion: 3,
    id,
    topicId: "chicken-rabbit",
    level,
    slot: level,
    title: `Chicken rabbit ${level}`,
    prompt: `Ten animals have 28 legs; how many rabbits are there in task ${level}?`,
    answer: "4",
    answerType: "numeric",
    answerFormat: "integer",
    answerPolicy: { kind: "integer" },
    conditionRoles: ["animal-total", "leg-total"],
    representation: "table",
    questionDirection: "find-parameter",
    reasoningMoves: ["assume", "substitute", "verify"],
    supportingConcepts: [],
    strategyChoices: [],
    solution: {
      strategy: "assume-all-chickens",
      observation: "Assume every animal is a chicken.",
      summary: "(28 - 20) / 2 = 4",
      steps: [
        { id: "difference", kind: "calculate", operation: "subtract", operands: [28, 20], result: 8, explanation: "There are eight extra legs." },
        { id: "rabbits", kind: "verify", operation: "divide", operands: ["$difference", 2], result: 4, explanation: "Each rabbit contributes two extra legs." }
      ]
    },
    verification: {
      strategy: "substitute-counts",
      summary: "Four rabbits and six chickens have 28 legs.",
      steps: [
        { id: "rabbit-legs", kind: "calculate", operation: "multiply", operands: [4, 4], result: 16, explanation: "Rabbit legs." },
        { id: "chicken-legs", kind: "calculate", operation: "multiply", operands: [6, 2], result: 12, explanation: "Chicken legs." },
        { id: "total-legs", kind: "verify", operation: "add", operands: ["$rabbit-legs", "$chicken-legs"], result: 28, explanation: "The total matches." },
        { id: "answer", kind: "verify", operation: "divide", operands: ["$rabbit-legs", 4], result: 4, explanation: "There are four rabbits." }
      ]
    },
    reviewMetadata: {
      reviewer: "Curriculum reviewer",
      reviewedAt: "2026-08-13T00:00:00.000Z",
      evidence: "Independently checked the reasoning and answer."
    },
    commonPitfall: "Do not count every rabbit leg as an extra leg.",
    storyBeat: "Check the animal inventory.",
    readingProfile: { unfamiliarTerms: [] },
    ...overrides
  };
}

function approvedBatch(contentVersion = "2026.08.13-gold.1") {
  return {
    id: "test-chicken-rabbit-v3",
    schemaVersion: 3,
    status: "approved",
    contentVersion,
    reviewManifest: { schemaVersion: 3, status: "approved" },
    topics: [{
      chapterId: "chapter-01",
      moduleId: "chicken-rabbit",
      questions: CHICKEN_RABBIT_SLOT_IDS.map((id, index) => validQuestion(index + 1, id))
    }]
  };
}

function createStructureFingerprint(question) {
  return [
    question.structureFamily,
    question.representation,
    question.questionDirection,
    question.solution.strategy,
    question.supportingConcepts.join(",")
  ].join("|");
}

function assertDeepFrozen(value, path = "root", seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  assert.equal(Object.isFrozen(value), true, `${path} must be frozen`);
  for (const [key, child] of Object.entries(value)) assertDeepFrozen(child, `${path}.${key}`, seen);
}

function learnerVisibleText(question) {
  return [
    question.title,
    question.prompt,
    question.solution.summary,
    ...question.solution.steps.map((step) => step.explanation),
    question.verification.summary,
    ...question.verification.steps.map((step) => step.explanation),
    question.commonPitfall,
    question.storyBeat
  ];
}

function operationGraphFamily(question) {
  return JSON.stringify({
    conditions: question.conditionRoles,
    operations: question.solution.steps.map((step) => step.operation),
    dependencies: question.solution.steps.map((step) => step.operands.some((operand) => typeof operand === "string"))
  });
}

test("chicken-rabbit gold questions use Chinese learner text, honest representations, and recursive freezing", () => {
  const questions = require("../game/curriculum/gold/chickenRabbit.js");

  assertDeepFrozen(questions);
  assert.equal(new Set(questions.map(operationGraphFamily)).size >= 5, true);
  for (const question of questions) {
    assert.equal(/[A-Za-z]/u.test(question.title), false, `${question.id} title must be Chinese`);
    assert.equal(/[A-Za-z]/u.test(question.prompt), false, `${question.id} prompt must be Chinese`);
    assert.equal(question.prompt.includes("共"), true, `${question.id} prompt must state the total`);
    assert.equal(question.prompt.includes("多少"), true, `${question.id} prompt must ask for a quantity`);
    assert.equal(question.prompt.length <= 70, true, `${question.id} prompt must fit grade 3`);
    assert.equal(question.prompt.split(/[。！？]/u).filter(Boolean).length <= 2, true, `${question.id} prompt has too many sentences`);
    if (question.representation === "table") {
      assert.match(question.prompt, /表格/u, `${question.id} must show its claimed table`);
    }
    if (question.representation === "bar-model") {
      assert.match(question.prompt, /条形图/u, `${question.id} must show its claimed bar model`);
    }
    if (question.representation === "diagram") {
      assert.match(question.prompt, /图/u, `${question.id} must show its claimed diagram`);
    }
    for (const text of learnerVisibleText(question)) {
      assert.equal(/[A-Za-z]/u.test(text), false, `${question.id} learner-visible text must be Chinese`);
    }
  }
});

test("Q9 derives both robot groups from the total and difference before verifying", () => {
  const question = require("../game/curriculum/gold/chickenRabbit.js")[8];
  const steps = question.verification.steps;

  assert.equal(question.answer, "8");
  assert.match(question.prompt, /24个机器人/);
  assert.match(question.prompt, /四脚机器人比两脚机器人少8个/);
  assert.deepEqual(steps.map((step) => [step.operation, step.operands, step.result]), [
    ["subtract", [24, 8], 16],
    ["divide", ["$去掉差", 2], 8],
    ["add", ["$四脚", 8], 16],
    ["add", ["$四脚", "$两脚"], 24],
    ["subtract", ["$两脚", "$四脚"], 8],
    ["multiply", ["$四脚", 4], 32],
    ["multiply", ["$两脚", 2], 32],
    ["add", ["$四脚轮子", "$两脚轮子"], 64],
    ["divide", ["$四脚轮子", 4], 8]
  ]);
});

test("Q10 restores the missing wheels before solving the boss problem", () => {
  const question = require("../game/curriculum/gold/chickenRabbit.js")[9];

  assert.equal(question.answer, "10");
  assert.equal(question.supportingConcepts.includes("sum-diff"), true);
  assert.equal(question.transfer, "boss-integration");
  assert.match(question.prompt, /22辆自行车和三轮车/);
  assert.match(question.prompt, /5辆三轮车各少了1个轮子/);
  assert.match(question.prompt, /共数到49个轮子/);
  assert.deepEqual(question.solution.steps.map((step) => [step.operation, step.operands, step.result]), [
    ["add", [49, 5], 54],
    ["multiply", [22, 2], 44],
    ["subtract", ["$原来轮子", "$全是自行车"], 10],
    ["divide", ["$多出的轮子", 1], 10]
  ]);
  assert.deepEqual(question.verification.steps.map((step) => [step.operation, step.operands, step.result]), [
    ["subtract", [22, 10], 12],
    ["multiply", [10, 3], 30],
    ["multiply", ["$自行车", 2], 24],
    ["add", ["$三轮车轮子", "$自行车轮子"], 54],
    ["subtract", ["$原来轮子", 5], 49],
    ["divide", ["$三轮车轮子", 3], 10]
  ]);
});

test("chicken-rabbit candidate gold questions progress from wheel differences to a restoration boss", () => {
  const questions = require("../game/curriculum/gold/chickenRabbit.js");

  assert.equal(Object.isFrozen(questions), true);
  assert.equal(questions.length, 10);
  assert.deepEqual(questions.map((question) => question.id), CHICKEN_RABBIT_SLOT_IDS);
  assert.deepEqual(questions.map((question) => question.slot), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(new Set(questions.map(createStructureFingerprint)).size >= 5, true);
  assert.deepEqual(difficulty.validateTopicProgression(questions), []);
  assert.equal(questions[9].supportingConcepts.includes("sum-diff"), true);
  assert.equal(questions[9].transfer, "boss-integration");
  assert.equal(questions.every(Object.isFrozen), true);

  const topic = curriculum.getCurriculumTopic("chicken-rabbit");
  for (const question of questions) {
    assert.deepEqual(quality.validateQuestionV3(question, topic), [], question.id);
  }
  assert.deepEqual(compatibility.validateCompatibilityMap({
    chapterId: "chapter-01",
    moduleId: "chicken-rabbit",
    questions
  }), []);
});

test("compatibility slots retain the stable identity of all three approved curriculum topics", () => {
  assert.deepEqual(compatibility.GOLD_SLOT_IDS["chicken-rabbit"], CHICKEN_RABBIT_SLOT_IDS);
  assert.deepEqual(compatibility.GOLD_SLOT_IDS["shortest-path"], Array.from({ length: 10 }, (_, index) => `chapter-08-shortest-path-${index + 1}`));
  assert.deepEqual(compatibility.GOLD_SLOT_IDS["integrated-modeling"], Array.from({ length: 10 }, (_, index) => `chapter-09-integrated-modeling-${index + 1}`));
});

test("rejected batches never activate and the builder retains the legacy fallback", () => {
  const before = builder.buildChapter("chapter-08", []).levels.find((level) => level.moduleId === "shortest-path");
  const rejected = { ...approvedBatch(), status: "rejected" };

  assert.equal(registry.registerContentBatch(rejected), false);
  assert.equal(registry.getActiveTopicQuestions("chapter-01", "chicken-rabbit"), null);

  const after = builder.buildChapter("chapter-08", []).levels.find((level) => level.moduleId === "shortest-path");
  assert.deepEqual(after.questions.map((question) => question.id), before.questions.map((question) => question.id));
  assert.equal(Object.hasOwn(after, "contentVersion"), false);
});

test("approved batches without an explicit approved review never activate", () => {
  const unreviewed = approvedBatch("2026.08.13-gold.0");
  delete unreviewed.reviewManifest;

  assert.equal(registry.registerContentBatch(unreviewed), false);
});

test("an explicitly approved reviewed batch activates V3 questions in stable slots", () => {
  const batch = approvedBatch();

  assert.equal(registry.registerContentBatch(batch), true);
  const active = registry.getActiveTopicQuestions("chapter-01", "chicken-rabbit");
  assert.equal(active.contentVersion, batch.contentVersion);
  assert.deepEqual(active.questions.map((question) => question.id), CHICKEN_RABBIT_SLOT_IDS);

  const level = builder.buildChapter("chapter-01", []).levels.find((entry) => entry.moduleId === "chicken-rabbit");
  assert.equal(level.contentVersion, batch.contentVersion);
  assert.deepEqual(level.questions.map((question) => question.id), CHICKEN_RABBIT_SLOT_IDS);
  assert.deepEqual(level.questions.map((question) => question.slot), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(level.questions.every((question) => question.schemaVersion === 3), true);
});

test("a malformed registration after a valid active batch leaves that batch unchanged", () => {
  const replacement = approvedBatch("2026.08.13-gold.2");
  replacement.topics[0].questions[4].id = "not-a-compatible-slot";

  assert.equal(registry.registerContentBatch(replacement), false);
  const active = registry.getActiveTopicQuestions("chapter-01", "chicken-rabbit");
  assert.equal(active.contentVersion, "2026.08.13-gold.1");
  assert.deepEqual(active.questions.map((question) => question.id), CHICKEN_RABBIT_SLOT_IDS);
});

test("same and older contentVersion registrations leave the active batch unchanged", () => {
  const before = registry.getActiveTopicQuestions("chapter-01", "chicken-rabbit");

  assert.equal(registry.registerContentBatch(approvedBatch("2026.08.13-gold.1")), false);
  assert.equal(registry.registerContentBatch(approvedBatch("2026.08.13-gold.0")), false);

  assert.deepEqual(registry.getActiveTopicQuestions("chapter-01", "chicken-rabbit"), before);
});

test("a dotted contentVersion replacement treats .10 as newer than .2", () => {
  const versionTwo = approvedBatch("2026.08.13-gold.2");
  const versionTen = approvedBatch("2026.08.13-gold.10");

  assert.equal(registry.registerContentBatch(versionTwo), true);
  assert.equal(registry.registerContentBatch(versionTen), true);
  assert.equal(registry.getActiveTopicQuestions("chapter-01", "chicken-rabbit").contentVersion, "2026.08.13-gold.10");
});

test("active content is returned as defensive copies", () => {
  const first = registry.getActiveTopicQuestions("chapter-01", "chicken-rabbit");
  first.questions[0].prompt = "mutated";
  first.questions.push({ id: "injected" });

  const second = registry.getActiveTopicQuestions("chapter-01", "chicken-rabbit");
  assert.equal(second.questions.length, 10);
  assert.notEqual(second.questions[0].prompt, "mutated");
});

test("batch validation rejects incomplete, unknown-topic, and mismapped slots", () => {
  const incomplete = approvedBatch();
  incomplete.topics[0].questions.pop();

  const unknownTopic = approvedBatch();
  unknownTopic.topics[0].questions[0].topicId = "unknown-topic";

  const wrongSlot = approvedBatch();
  wrongSlot.topics[0].questions[3].slot = 8;

  assert.match(registry.validateContentBatch(incomplete).join("\n"), /exactly 10 questions/);
  assert.match(registry.validateContentBatch(unknownTopic).join("\n"), /topicId/);
  assert.match(registry.validateContentBatch(wrongSlot).join("\n"), /slot/);
});

test("browser loader evaluates the content batch registry with short-path dependencies", async () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "src", "game-main.js"), "utf8");
  const prelude = source.slice(0, source.indexOf("const GameChapterConfig ="))
    .replace(/^import "\.\.\/game\/game\.css";\s*/, "")
    .concat("\nglobalThis.__testLoadCommonJs = loadCommonJs;");
  const context = vm.createContext({ structuredClone });
  vm.runInContext(prelude, context, { filename: "game-main-loader.js" });

  const fileByRequest = new Map([
    ["../answerMatcher.js", "answerMatcher.js"],
    ["../game/curriculum/curriculumContract.js", "game/curriculum/curriculumContract.js"],
    ["../game/curriculum/answerPolicy.js", "game/curriculum/answerPolicy.js"],
    ["../game/questionContract.js", "game/questionContract.js"],
    ["../game/curriculum/solutionEngine.js", "game/curriculum/solutionEngine.js"],
    ["../game/curriculum/difficultyEngine.js", "game/curriculum/difficultyEngine.js"],
    ["../game/curriculum/readability.js", "game/curriculum/readability.js"],
    ["../game/curriculum/questionQualityV3.js", "game/curriculum/questionQualityV3.js"],
    ["../game/curriculum/curriculumMap.js", "game/curriculum/curriculumMap.js"],
    ["../game/curriculum/compatibilityMap.js", "game/curriculum/compatibilityMap.js"],
    ["../game/curriculum/contentBatchRegistry.js", "game/curriculum/contentBatchRegistry.js"]
  ]);
  const importCommonJs = async (request) => {
    const relativePath = fileByRequest.get(request);
    if (!relativePath) throw new Error(`Unexpected browser import: ${request}`);
    const commonJsSource = fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
    vm.runInContext(`(function () {\n${commonJsSource}\n})()`, context, { filename: relativePath });
    return { default: context.module.exports };
  };
  context.__testImport = importCommonJs;
  const load = (request, aliases) => context.__testLoadCommonJs(() => importCommonJs(request), aliases);

  await load("../game/curriculum/curriculumContract.js", ["./curriculum/curriculumContract.js", "./curriculumContract.js"]);
  await load("../game/curriculum/answerPolicy.js", ["./curriculum/answerPolicy.js", "./answerPolicy.js", "./game/curriculum/answerPolicy.js"]);
  await load("../answerMatcher.js", ["../answerMatcher.js", "../../answerMatcher.js"]);
  await load("../game/questionContract.js", ["./questionContract.js", "../questionContract.js"]);
  await load("../game/curriculum/solutionEngine.js", ["./curriculum/solutionEngine.js", "./solutionEngine.js"]);
  await load("../game/curriculum/difficultyEngine.js", ["./curriculum/difficultyEngine.js", "./difficultyEngine.js"]);
  await load("../game/curriculum/readability.js", ["./curriculum/readability.js", "./readability.js"]);
  await load("../game/curriculum/questionQualityV3.js", ["./curriculum/questionQualityV3.js", "./questionQualityV3.js"]);

  const registryLoads = source.match(/const CurriculumMap = await loadCommonJs[\s\S]*?const ContentBatchRegistry = await loadCommonJs[\s\S]*?;\r?\n/)?.[0];
  assert.ok(registryLoads, "game-main must load the content batch registry");
  await vm.runInContext(`(async () => {\n${registryLoads.replaceAll("import(", "globalThis.__testImport(")}\nglobalThis.__contentBatchRegistry = ContentBatchRegistry;\n})()`, context);

  assert.equal(typeof context.__contentBatchRegistry.registerContentBatch, "function");
  assert.equal(context.__contentBatchRegistry.getActiveTopicQuestions("chapter-01", "chicken-rabbit"), null);
  await assert.rejects(
    context.__testLoadCommonJs(() => vm.runInContext('require("./unknown.js")', context), "./unknown.js"),
    /Game module dependency was not loaded: \.\/unknown\.js/
  );
});
