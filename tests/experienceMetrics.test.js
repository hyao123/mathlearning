const assert = require("node:assert/strict");
const test = require("node:test");
const { createExperienceMetrics, METRICS_STORAGE_KEY } = require("../game/experienceMetrics.js");

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem(key) { return data.get(key) ?? null; },
    setItem(key, value) { data.set(key, value); },
    dump(key) { return data.get(key); }
  };
}

test("local experience metrics aggregate anonymous chapter outcomes without raw question data", () => {
  const storage = memoryStorage();
  const metrics = createExperienceMetrics(() => storage);

  metrics.recordLevelStart("chapter-01");
  metrics.recordQuestionOutcome("chapter-01", "retry");
  metrics.recordQuestionOutcome("chapter-01", "skip");
  metrics.recordLevelClear("chapter-01");
  metrics.recordMaterialShortage("chapter-01", 3);

  const saved = JSON.parse(storage.dump(METRICS_STORAGE_KEY));
  assert.deepEqual(saved.chapters["chapter-01"], {
    levelsStarted: 1,
    levelsCleared: 1,
    retries: 1,
    skippedQuestions: 1,
    materialShortages: { "3": 1 }
  });
  assert.equal(JSON.stringify(saved).includes("question"), false);
  assert.equal(JSON.stringify(saved).includes("answer"), false);
  assert.deepEqual(metrics.load(), saved);
});

test("metrics ignore invalid identifiers and remain usable when local storage is blocked", () => {
  const metrics = createExperienceMetrics(() => ({
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); }
  }));

  metrics.recordLevelStart("child-name");
  metrics.recordQuestionOutcome("chapter-01", "unknown");
  metrics.recordMaterialShortage("chapter-01", -4);

  assert.deepEqual(metrics.load().chapters, {});
});
