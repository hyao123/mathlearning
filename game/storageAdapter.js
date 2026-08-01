const GameItemCatalog = require("./itemCatalog.js");

const INVENTORY_STORAGE_KEY = "math-quest-inventory-v1";

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

module.exports = { INVENTORY_STORAGE_KEY, createInventoryStore, createResilientStateStore, mergeInventories, serializeInventory };
