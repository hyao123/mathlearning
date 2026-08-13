const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const adapter = require("../game/curriculum/runtimeAdapter.js");
const curriculum = require("../game/curriculum/curriculumMap.js");

function validQuestion(overrides = {}) {
  return {
    schemaVersion: 3,
    id: "chicken-rabbit-v3-01",
    topicId: "chicken-rabbit",
    level: 1,
    title: "鸡兔同笼",
    prompt: "鸡和兔一共有 10 只，脚一共有 28 只。兔有多少只？",
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
      observation: "先假设全是鸡。",
      summary: "(28 - 20) / 2 = 4",
      steps: [
        { id: "difference", kind: "model", operation: "subtract", operands: [28, 20], result: 8, explanation: "多出的脚数是 8。" },
        { id: "rabbits", kind: "calculate", operation: "divide", operands: ["$difference", 2], result: 4, explanation: "每只兔比鸡多 2 只脚。" }
      ]
    },
    verification: {
      strategy: "substitute-counts",
      summary: "4 只兔和 6 只鸡共有 28 只脚。",
      steps: [
        { id: "rabbit-legs", kind: "calculate", operation: "multiply", operands: [4, 4], result: 16, explanation: "兔脚数。" },
        { id: "chicken-legs", kind: "calculate", operation: "multiply", operands: [6, 2], result: 12, explanation: "鸡脚数。" },
        { id: "total-legs", kind: "verify", operation: "add", operands: ["$rabbit-legs", "$chicken-legs"], result: 28, explanation: "脚数符合条件。" },
        { id: "answer", kind: "verify", operation: "divide", operands: ["$rabbit-legs", 4], result: 4, explanation: "兔的数量是 4。" }
      ]
    },
    reviewMetadata: { reviewer: "课程组", reviewedAt: "2026-08-13T00:00:00.000Z", evidence: "独立复算。" },
    commonPitfall: "不要把每只兔多出的脚数算成 4。",
    storyBeat: "帮助农场管理员核对动物数量。",
    authorNotes: "这不是运行时字段。",
    ...overrides
  };
}

test("derives solution-review step kinds from solution steps and computes difficulty", () => {
  const runtime = adapter.adaptQuestionV3(validQuestion(), curriculum.getCurriculumTopic("chicken-rabbit"));

  assert.equal(runtime.schemaVersion, 3);
  assert.deepEqual(runtime.solutionReview.stepKinds, ["model", "calculate"]);
  assert.equal(runtime.difficultyProfile.score, 5);
  assert.equal(runtime.slot, 1);
});

test("whitelists learner-visible fields while keeping resolution secrets internal", () => {
  const runtime = adapter.adaptQuestionV3(validQuestion(), curriculum.getCurriculumTopic("chicken-rabbit"));

  assert.deepEqual(Object.keys(runtime).sort(), [
    "difficulty", "difficultyProfile", "id", "isBoss", "learningObjective", "level", "prompt", "schemaVersion", "slot", "storyBeat", "title", "topicId"
  ]);
  for (const secret of ["answer", "answerPolicy", "solution", "verification", "reviewMetadata", "solutionReview", "authorNotes"]) {
    assert.equal(Object.keys(runtime).includes(secret), false, secret);
  }
  assert.equal(runtime.answer, "4");
  assert.equal(runtime.answerPolicy.kind, "integer");
  assert.deepEqual(runtime.solutionReview.stepKinds, ["model", "calculate"]);
});

test("returns null rather than throwing for malformed adapter input", () => {
  assert.doesNotThrow(() => adapter.adaptQuestionV3(null, null));
  assert.equal(adapter.adaptQuestionV3(null, null), null);
  assert.equal(adapter.adaptQuestionV3(validQuestion(), null), null);
});

test("rejects semantically invalid V3 questions before exposing runtime fields", () => {
  const topic = curriculum.getCurriculumTopic("chicken-rabbit");
  const invalidQuestions = [
    validQuestion({ schemaVersion: 2 }),
    validQuestion({ answerFormat: "decimal" }),
    validQuestion({ answerPolicy: { kind: "unknown" } }),
    validQuestion({ verification: { strategy: "substitute-counts", summary: "verified", steps: [] } }),
    validQuestion({ reviewMetadata: undefined })
  ];

  for (const question of invalidQuestions) {
    assert.equal(adapter.adaptQuestionV3(question, topic), null);
  }
});

test("browser CommonJS loader registers every V3 curriculum dependency request", async () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "src", "game-main.js"), "utf8");
  const registration = (name) => {
    const start = source.indexOf(`const ${name} = await loadCommonJs`);
    const end = source.indexOf("\nconst ", start + 1);
    return source.slice(start, end === -1 ? source.length : end);
  };

  for (const [name, requests] of [
    ["AnswerMatcher", ["../answerMatcher.js", "../../answerMatcher.js"]],
    ["AnswerPolicy", ["./curriculum/answerPolicy.js", "./answerPolicy.js", "./game/curriculum/answerPolicy.js"]],
    ["QuestionContract", ["./questionContract.js", "../questionContract.js"]],
    ["CurriculumContract", ["./curriculum/curriculumContract.js", "./curriculumContract.js"]],
    ["SolutionEngine", ["./curriculum/solutionEngine.js", "./solutionEngine.js"]],
    ["DifficultyEngine", ["./curriculum/difficultyEngine.js", "./difficultyEngine.js"]],
    ["Readability", ["./curriculum/readability.js", "./readability.js"]],
    ["QuestionQualityV3", ["./curriculum/questionQualityV3.js", "./questionQualityV3.js"]],
    ["RuntimeAdapter", ["./curriculum/runtimeAdapter.js", "./runtimeAdapter.js"]]
  ]) {
    const entry = registration(name);
    assert.notEqual(entry, "", `${name} must be registered`);
    for (const request of requests) assert.ok(entry.includes(`"${request}"`), `${name} must register ${request}`);
  }

  const prelude = source.slice(0, source.indexOf("const GameChapterConfig ="))
    .replace(/^import "\.\.\/game\/game\.css";\s*/, "")
    .concat("\nglobalThis.__testLoadCommonJs = loadCommonJs;");
  const context = vm.createContext({});
  vm.runInContext(prelude, context);

  await vm.runInContext(`
    (async () => {
      await globalThis.__testLoadCommonJs(async () => ({ default: { normalizeText() {} } }), ["../answerMatcher.js", "../../answerMatcher.js"]);
      await globalThis.__testLoadCommonJs(async () => ({ default: { matcher: require("../../answerMatcher.js") } }), ["./curriculum/answerPolicy.js", "./answerPolicy.js", "./game/curriculum/answerPolicy.js"]);
      await globalThis.__testLoadCommonJs(async () => ({ default: { policy: require("./curriculum/answerPolicy.js") } }), ["./questionContract.js", "../questionContract.js"]);
      await globalThis.__testLoadCommonJs(async () => ({ default: {} }), ["./curriculum/curriculumContract.js", "./curriculumContract.js"]);
      await globalThis.__testLoadCommonJs(async () => ({ default: { policy: require("./answerPolicy.js") } }), ["./curriculum/solutionEngine.js", "./solutionEngine.js"]);
      await globalThis.__testLoadCommonJs(async () => ({ default: { contract: require("./curriculumContract.js"), solution: require("./solutionEngine.js") } }), ["./curriculum/difficultyEngine.js", "./difficultyEngine.js"]);
      await globalThis.__testLoadCommonJs(async () => ({ default: { contract: require("./curriculumContract.js"), policy: require("./answerPolicy.js"), question: require("../questionContract.js"), solution: require("./solutionEngine.js"), difficulty: require("./difficultyEngine.js") } }), ["./curriculum/questionQualityV3.js", "./questionQualityV3.js"]);
      globalThis.__runtimeAdapter = await globalThis.__testLoadCommonJs(async () => ({ default: { quality: require("./questionQualityV3.js"), difficulty: require("./difficultyEngine.js") } }), ["./curriculum/runtimeAdapter.js", "./runtimeAdapter.js"]);
    })()
  `, context);

  assert.ok(context.__runtimeAdapter.quality);
  assert.ok(context.__runtimeAdapter.difficulty);
});
