const GameItemCatalog = require("./itemCatalog.js");

const INVENTORY_STORAGE_KEY = "math-quest-inventory-v1";
const ATOMIC_SAVE_STORAGE_KEY = "math-quest-save-v3";

function createResilientStateStore(storageProvider, key) {
  if (typeof storageProvider !== "function") throw new Error("Storage provider must be a function");
  if (typeof key !== "string" || !key) throw new Error("Storage key is required");
  let memoryState = null;
  let memoryIsFallback = false;

  return {
    load() {
      if (memoryIsFallback) return memoryState;
      try {
        const stored = storageProvider()?.getItem(key);
        if (typeof stored === "string") memoryState = stored;
      } catch {
        // Browser privacy modes can reject storage access; memory remains authoritative.
      }
      return memoryState;
    },
    save(serialized) {
      memoryState = serialized;
      try {
        storageProvider()?.setItem(key, serialized);
        memoryIsFallback = false;
      } catch {
        // Persistence is best effort. Rendering continues from the in-memory state.
        memoryIsFallback = true;
      }
    }
  };
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function sanitizeInventory(inventory) {
  if (!inventory || typeof inventory !== "object" || Array.isArray(inventory)) return {};
  return Object.fromEntries(Object.entries(inventory).flatMap(([itemId, quantity]) => {
    const item = GameItemCatalog.getItem(itemId);
    return item && isPositiveInteger(quantity) && quantity <= item.stackLimit ? [[itemId, quantity]] : [];
  }));
}

function parseStoredInventory(serialized) {
  try {
    const stored = typeof serialized === "string" ? JSON.parse(serialized) : serialized;
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};
    return sanitizeInventory(stored.inventory || stored);
  } catch {
    return {};
  }
}

function mergeInventories(...inventories) {
  const result = {};
  for (const inventory of inventories) {
    for (const [itemId, quantity] of Object.entries(sanitizeInventory(inventory))) {
      const item = GameItemCatalog.getItem(itemId);
      result[itemId] = Math.min((result[itemId] || 0) + quantity, item.stackLimit);
    }
  }
  return result;
}

function serializeInventory(inventory) {
  return JSON.stringify({
    version: INVENTORY_STORAGE_KEY,
    inventory: sanitizeInventory(inventory)
  });
}

function createInventoryStore(storageProvider, options = {}) {
  if (typeof storageProvider !== "function") throw new Error("Storage provider must be a function");
  const key = options.key || INVENTORY_STORAGE_KEY;
  const previousInventoryKeys = Array.isArray(options.previousInventoryKeys) ? options.previousInventoryKeys : [];
  const legacyStateKeys = Array.isArray(options.legacyStateKeys) ? options.legacyStateKeys : [];
  let memoryInventory = null;
  let memoryIsFallback = false;

  const readStorage = (storageKey) => {
    try {
      const value = storageProvider()?.getItem(storageKey);
      return typeof value === "string" ? value : null;
    } catch {
      return null;
    }
  };

  const writeStorage = (storageKey, value) => {
    try {
      storageProvider()?.setItem(storageKey, value);
      memoryIsFallback = false;
    } catch {
      memoryIsFallback = true;
    }
  };
  const serializeForStore = (inventory) => JSON.stringify({
    version: key,
    inventory: sanitizeInventory(inventory)
  });

  return {
    loadInventory(fallbackInventory = {}) {
      if (memoryIsFallback && memoryInventory) return { ...memoryInventory };
      const persisted = parseStoredInventory(readStorage(key));
      if (Object.keys(persisted).length) {
        memoryInventory = persisted;
        return { ...memoryInventory };
      }
      const previousInventory = mergeInventories(...previousInventoryKeys.map((previousKey) => parseStoredInventory(readStorage(previousKey))));
      if (Object.keys(previousInventory).length) {
        memoryInventory = previousInventory;
        writeStorage(key, serializeForStore(previousInventory));
        return { ...memoryInventory };
      }
      const legacyInventory = mergeInventories(...legacyStateKeys.map((legacyKey) => parseStoredInventory(readStorage(legacyKey))));
      const migrated = Object.keys(legacyInventory).length ? legacyInventory : mergeInventories(fallbackInventory);
      memoryInventory = migrated;
      if (Object.keys(migrated).length) writeStorage(key, serializeForStore(migrated));
      return { ...memoryInventory };
    },
    saveInventory(inventory) {
      memoryInventory = sanitizeInventory(inventory);
      writeStorage(key, serializeForStore(memoryInventory));
    },
    serializeInventory
  };
}

function parseStoredObject(serialized) {
  try {
    const value = typeof serialized === "string" ? JSON.parse(serialized) : serialized;
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

function createAtomicSaveStore(storageProvider, options = {}) {
  if (typeof storageProvider !== "function") throw new Error("Storage provider must be a function");
  const key = options.key || ATOMIC_SAVE_STORAGE_KEY;
  const legacyStateKeys = options.legacyStateKeys || ["math-quest-campaign-v2", "math-quest-game-v1"];
  const legacyInventoryKeys = options.legacyInventoryKeys || [INVENTORY_STORAGE_KEY];
  let memoryState = null;
  let memoryIsFallback = false;
  let revision = 0;

  const read = (storageKey) => {
    try {
      const value = storageProvider()?.getItem(storageKey);
      return typeof value === "string" ? value : null;
    } catch {
      return null;
    }
  };

  const write = (value) => {
    try {
      storageProvider()?.setItem(key, value);
      memoryIsFallback = false;
    } catch {
      memoryIsFallback = true;
    }
  };

  const withRevision = (value, nextRevision) => {
    const parsed = parseStoredObject(value) || {};
    return JSON.stringify({
      ...parsed,
      version: ATOMIC_SAVE_STORAGE_KEY,
      revision: nextRevision
    });
  };

  const migrate = () => {
    const campaign = legacyStateKeys.map(read).map(parseStoredObject).find(Boolean) || {
      version: "math-quest-campaign-v2",
      chapterStates: {}
    };
    const legacyInventory = mergeInventories(
      ...legacyInventoryKeys.map((legacyKey) => parseStoredInventory(read(legacyKey))),
      campaign.inventory,
      ...Object.values(campaign.chapterStates || {}).map((state) => state?.inventory)
    );
    const legacyChapterStates = Object.entries(campaign.chapterStates || {}).length
      ? campaign.chapterStates
      : { [campaign.activeChapterId || "chapter-01"]: campaign };
    const chapterStates = Object.fromEntries(Object.entries(legacyChapterStates).map(([chapterId, state]) => [
      chapterId,
      { ...state, inventory: { ...legacyInventory } }
    ]));
    const migrated = withRevision(JSON.stringify({
      ...campaign,
      chapterStates,
      inventory: { ...legacyInventory }
    }), 1);
    memoryState = migrated;
    revision = 1;
    write(migrated);
    return migrated;
  };

  return {
    load() {
      if (memoryIsFallback && memoryState) return memoryState;
      const stored = parseStoredObject(read(key));
      if (stored) {
        revision = Number.isInteger(stored.revision) && stored.revision >= 0 ? stored.revision : 0;
        memoryState = JSON.stringify(stored);
        return memoryState;
      }
      return migrate();
    },
    save(serialized) {
      const current = parseStoredObject(memoryState) || parseStoredObject(read(key));
      const currentRevision = Number.isInteger(current?.revision) ? current.revision : revision;
      const next = withRevision(serialized, currentRevision + 1);
      memoryState = next;
      revision = currentRevision + 1;
      write(next);
    }
  };
}

module.exports = { ATOMIC_SAVE_STORAGE_KEY, INVENTORY_STORAGE_KEY, createAtomicSaveStore, createInventoryStore, createResilientStateStore, mergeInventories, serializeInventory };
