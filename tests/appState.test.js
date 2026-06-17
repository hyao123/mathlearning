const assert = require("node:assert/strict");
const test = require("node:test");

const { calculateStats, createStateStore, migrateLegacyState } = require("../appState.js");

test("calculates aggregate answer stats", () => {
  assert.deepEqual(
    calculateStats({
      first: { attempts: 2, correct: 1 },
      second: { attempts: 3, correct: 3 }
    }),
    { attempts: 5, correct: 4 }
  );
});

test("migrates legacy completed and wrong book records into answer history", () => {
  const migrated = migrateLegacyState({
    completed: { "patterns-1": true },
    wrongBook: [{ id: "patterns-2" }]
  });

  assert.equal(migrated.answerHistory["patterns-1"].latestCorrect, true);
  assert.equal(migrated.answerHistory["patterns-2"].latestCorrect, false);
  assert.deepEqual(migrated.stats, { attempts: 2, correct: 1 });
});

test("state store loads, saves and recalculates progress", () => {
  const values = new Map();
  const storage = {
    getItem(key) {
      return values.get(key) || null;
    },
    setItem(key, value) {
      values.set(key, value);
    }
  };

  const store = createStateStore({
    storage,
    storageKey: "current",
    legacyStorageKey: "legacy"
  });

  const state = store.getState();
  state.answerHistory["sum-1"] = { attempts: 1, correct: 1 };
  store.saveState();

  assert.deepEqual(store.getState().stats, { attempts: 1, correct: 1 });
  assert.equal(JSON.parse(values.get("current")).stats.correct, 1);
});
