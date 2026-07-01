const assert = require("node:assert/strict");
const test = require("node:test");

const appState = require("../appState.js");

test("clones the default state without sharing mutable objects", () => {
  const first = appState.cloneDefaultState();
  const second = appState.cloneDefaultState();

  first.completed["patterns-1"] = true;
  first.paperGenerator.practiceIds.push("patterns-1");

  assert.equal(second.completed["patterns-1"], undefined);
  assert.deepEqual(second.paperGenerator.practiceIds, []);
});

test("migrates completed and wrong-book records into answer history", () => {
  const migrated = appState.migrateLegacyState({
    completed: { "patterns-1": true },
    wrongBook: [{ id: "logic-1" }]
  });

  assert.deepEqual(migrated.answerHistory["patterns-1"], {
    attempts: 1,
    correct: 1,
    latestCorrect: true,
    firstCorrect: true
  });
  assert.deepEqual(migrated.answerHistory["logic-1"], {
    attempts: 1,
    correct: 0,
    latestCorrect: false,
    firstCorrect: false
  });
  assert.deepEqual(migrated.stats, { attempts: 2, correct: 1 });
});

test("preserves existing answer history and recalculates stats", () => {
  const migrated = appState.migrateLegacyState({
    completed: { "patterns-1": true },
    answerHistory: {
      "patterns-1": { attempts: 3, correct: 2, latestCorrect: false }
    },
    stats: { attempts: 99, correct: 99 }
  });

  assert.deepEqual(migrated.answerHistory, {
    "patterns-1": { attempts: 3, correct: 2, latestCorrect: false }
  });
  assert.deepEqual(migrated.stats, { attempts: 3, correct: 2 });
});

test("formats dates and hashes keys consistently", () => {
  assert.equal(appState.formatDateKey(new Date(2026, 6, 1)), "2026-07-01");
  assert.equal(appState.hashString("daily-key"), appState.hashString("daily-key"));
  assert.notEqual(appState.hashString("daily-key"), appState.hashString("other-key"));
});
