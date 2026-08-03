const assert = require("node:assert/strict");
const test = require("node:test");
const { INVENTORY_STORAGE_KEY, ATOMIC_SAVE_STORAGE_KEY, createAtomicSaveStore, createInventoryStore, createResilientStateStore } = require("../game/storageAdapter.js");

test("storage read failures fall back to an empty in-memory state", () => {
  const store = createResilientStateStore(() => ({
    getItem() { throw new Error("blocked get"); },
    setItem() { throw new Error("blocked set"); }
  }), "state-key");

  assert.equal(store.load(), null);
});

test("storage write failures retain the latest state in memory", () => {
  const store = createResilientStateStore(() => ({
    getItem() { throw new Error("blocked get"); },
    setItem() { throw new Error("blocked set"); }
  }), "state-key");

  store.save('{"screen":"challenge"}');
  assert.equal(store.load(), '{"screen":"challenge"}');
});

test("a stale persistent read cannot replace a newer failed write", () => {
  const store = createResilientStateStore(() => ({
    getItem() { return '{"screen":"map"}'; },
    setItem() { throw new Error("quota exceeded"); }
  }), "state-key");

  assert.equal(store.load(), '{"screen":"map"}');
  store.save('{"screen":"settlement"}');
  assert.equal(store.load(), '{"screen":"settlement"}');
});

test("persistent inventory store migrates legacy game inventory and survives game state upgrades", () => {
  const storage = new Map();
  storage.set("math-quest-game-v1", JSON.stringify({ inventory: { "oak-log": 2, "iron-ingot": 1 } }));
  const provider = () => ({
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, value); }
  });
  const inventoryStore = createInventoryStore(provider, {
    legacyStateKeys: ["math-quest-game-v2", "math-quest-game-v1"]
  });

  assert.deepEqual(inventoryStore.loadInventory(), { "oak-log": 2, "iron-ingot": 1 });
  inventoryStore.saveInventory({ diamond: 1 });
  storage.set("math-quest-game-v2", JSON.stringify({ inventory: { "oak-log": 999 } }));

  assert.deepEqual(inventoryStore.loadInventory(), { diamond: 1 });
  assert.equal(JSON.parse(storage.get(INVENTORY_STORAGE_KEY)).version, INVENTORY_STORAGE_KEY);
});

test("persistent inventory store migrates prior inventory keys before reading game-state fallbacks", () => {
  const storage = new Map();
  storage.set(INVENTORY_STORAGE_KEY, JSON.stringify({
    version: INVENTORY_STORAGE_KEY,
    inventory: { diamond: 2, "j20-frame-rib": 1 }
  }));
  storage.set("math-quest-game-v2", JSON.stringify({ inventory: { "oak-log": 999 } }));
  const provider = () => ({
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, value); }
  });
  const upgradedInventoryStore = createInventoryStore(provider, {
    key: "math-quest-inventory-v2",
    previousInventoryKeys: [INVENTORY_STORAGE_KEY],
    legacyStateKeys: ["math-quest-game-v2"]
  });

  assert.deepEqual(upgradedInventoryStore.loadInventory(), { diamond: 2, "j20-frame-rib": 1 });
  assert.deepEqual(JSON.parse(storage.get("math-quest-inventory-v2")), {
    version: "math-quest-inventory-v2",
    inventory: { diamond: 2, "j20-frame-rib": 1 }
  });
});

test("atomic save store persists campaign and inventory in one revisioned record", () => {
  const storage = new Map();
  const provider = () => ({
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, value); }
  });
  const store = createAtomicSaveStore(provider);

  store.save(JSON.stringify({
    version: "math-quest-campaign-v2",
    activeChapterId: "chapter-01",
    chapterStates: { "chapter-01": { inventory: { "oak-log": 2 } } },
    lastScreen: "map"
  }));

  assert.equal(storage.size, 1);
  const saved = JSON.parse(storage.get(ATOMIC_SAVE_STORAGE_KEY));
  assert.equal(saved.revision, 1);
  assert.deepEqual(saved.chapterStates["chapter-01"].inventory, { "oak-log": 2 });
  assert.equal(JSON.parse(store.load()).revision, 1);
});

test("atomic save store migrates split campaign and inventory keys into one canonical record", () => {
  const storage = new Map([
    ["math-quest-campaign-v2", JSON.stringify({
      version: "math-quest-campaign-v2",
      activeChapterId: "chapter-01",
      chapterStates: { "chapter-01": { inventory: {} } }
    })],
    [INVENTORY_STORAGE_KEY, JSON.stringify({ version: INVENTORY_STORAGE_KEY, inventory: { "oak-log": 3 } })]
  ]);
  const provider = () => ({
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, value); }
  });
  const store = createAtomicSaveStore(provider, { legacyStateKeys: ["math-quest-campaign-v2"], legacyInventoryKeys: [INVENTORY_STORAGE_KEY] });

  const migrated = JSON.parse(store.load());
  assert.deepEqual(migrated.chapterStates["chapter-01"].inventory, { "oak-log": 3 });
  assert.equal(JSON.parse(storage.get(ATOMIC_SAVE_STORAGE_KEY)).revision, 1);
});

test("atomic save store keeps progress from the legacy single-chapter state shape", () => {
  const storage = new Map([
    ["math-quest-game-v1", JSON.stringify({
      activeChapterId: "chapter-01",
      inventory: { "oak-log": 3 },
      unlockedLevelIds: ["chapter-01-level-1", "chapter-01-level-2"],
      levelRecords: { "chapter-01-level-1": { starCount: 1 } }
    })]
  ]);
  const provider = () => ({
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, value); }
  });
  const store = createAtomicSaveStore(provider);

  const migrated = JSON.parse(store.load());
  assert.deepEqual(migrated.chapterStates["chapter-01"].levelRecords, {
    "chapter-01-level-1": { starCount: 1 }
  });
  assert.deepEqual(migrated.chapterStates["chapter-01"].inventory, { "oak-log": 3 });
});

test("atomic save store keeps the newest memory snapshot when the persistent write fails", () => {
  let persisted = null;
  const provider = () => ({
    getItem() { return persisted; },
    setItem() { throw new Error("quota exceeded"); }
  });
  const store = createAtomicSaveStore(provider);
  store.save(JSON.stringify({ version: "math-quest-campaign-v2", chapterStates: {}, inventory: { "oak-log": 1 } }));
  assert.equal(JSON.parse(store.load()).inventory["oak-log"], 1);
  assert.equal(JSON.parse(store.load()).revision, 1);
});
