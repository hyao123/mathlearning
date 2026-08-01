const assert = require("node:assert/strict");
const test = require("node:test");
const { INVENTORY_STORAGE_KEY, createInventoryStore, createResilientStateStore } = require("../game/storageAdapter.js");

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
