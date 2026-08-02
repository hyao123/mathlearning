const GameItemCatalog = require("./itemCatalog.js");
const { CHAPTER_IDS } = require("./chapterConfig.js");

const RECIPES = Object.freeze([Object.freeze({
  id: "expedition-toolkit",
  inputs: Object.freeze([
    Object.freeze({ itemId: "oak-log", quantity: 2 }),
    Object.freeze({ itemId: "iron-ingot", quantity: 3 })
  ]),
  outputs: Object.freeze([Object.freeze({ itemId: "expedition-core", quantity: 1 })]),
  unlockRule: Object.freeze({ chapterId: "chapter-01", relicItemId: "expedition-core" })
})]);
function toInventoryRecipe(recipe) {
  return Object.freeze({
  id: recipe.id,
  ...(recipe.type ? { type: recipe.type } : {}),
  unlockLevelNumber: recipe.unlockLevelNumber,
  name: recipe.name,
  inputs: Object.freeze(recipe.inputs.map((entry) => Object.freeze({ ...entry }))),
  outputs: Object.freeze([Object.freeze({ ...recipe.output })])
  });
}
const PROJECT_RECIPES_BY_CHAPTER = Object.freeze(Object.fromEntries(CHAPTER_IDS.map((chapterId) => [chapterId, Object.freeze(GameItemCatalog.listProjectRecipes(chapterId).map(toInventoryRecipe))])));
const PROJECT_RECIPES = Object.freeze(Object.values(PROJECT_RECIPES_BY_CHAPTER).flat());
const getProjectRecipes = (chapterId) => [...(PROJECT_RECIPES_BY_CHAPTER[chapterId] || [])];

const DEFAULT_FLAGS = Object.freeze({ crafting: false, shop: false, equipment: false });
const ZERO_STATS = Object.freeze({ attack: 0, defense: 0, luck: 0, rewardBonus: 0 });
const EQUIPMENT_SLOTS = Object.freeze(["tool", "armor", "accessory"]);

function resolveOptions(options = {}) {
  const source = options && typeof options === "object" ? options : {};
  const catalog = source.catalog || source.itemCatalog || GameItemCatalog;
  const flags = source.featureFlags || source.flags || source;
  return { catalog, flags };
}

function getItem(catalog, itemId) {
  const item = typeof catalog.getItem === "function"
    ? catalog.getItem(itemId)
    : Array.isArray(catalog)
      ? catalog.find((entry) => entry && entry.id === itemId)
      : catalog[itemId];
  if (!item) throw new Error(`Unknown item: ${itemId}`);
  return item;
}

function requireEnabled(flags, feature) {
  if (flags[feature] !== true) throw new Error(`${feature} disabled`);
}

function requirePositiveInteger(value, label) {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${label} must be a positive integer`);
}

function copyInventory(inventory) {
  if (!inventory || typeof inventory !== "object" || Array.isArray(inventory)) {
    throw new Error("Inventory must be an object");
  }
  return { ...inventory };
}

function awardItem(inventory, itemId, quantity, options) {
  const { catalog } = resolveOptions(options);
  const item = getItem(catalog, itemId);
  requirePositiveInteger(quantity, "Quantity");
  const next = copyInventory(inventory);
  const current = next[itemId] || 0;
  if (!Number.isInteger(current) || current < 0) throw new Error(`Invalid inventory quantity for ${itemId}`);
  if (current + quantity > item.stackLimit) throw new Error(`Item ${itemId} exceeds stack limit`);
  next[itemId] = current + quantity;
  return next;
}

function previewItemGrant(inventory, itemId, quantity, options) {
  const { catalog } = resolveOptions(options);
  const item = getItem(catalog, itemId);
  requirePositiveInteger(quantity, "Quantity");
  const before = copyInventory(inventory);
  const current = before[itemId] || 0;
  if (!Number.isInteger(current) || current < 0) throw new Error(`Invalid inventory quantity for ${itemId}`);
  const canAward = current + quantity <= item.stackLimit;
  return {
    itemId,
    requestedQuantity: quantity,
    awardedQuantity: canAward ? quantity : 0,
    status: canAward ? "awarded" : item.stackLimit === 1 && current > 0 ? "already-owned" : "stack-capped"
  };
}

function grantItem(inventory, itemId, quantity, options) {
  const transaction = previewItemGrant(inventory, itemId, quantity, options);
  return {
    inventory: transaction.status === "awarded"
      ? awardItem(inventory, itemId, quantity, options)
      : copyInventory(inventory),
    transaction
  };
}

function validateRecipe(recipe, catalog) {
  if (!recipe || typeof recipe !== "object" || !Array.isArray(recipe.inputs) || !Array.isArray(recipe.outputs)) {
    throw new Error("Invalid recipe");
  }
  const inputQuantities = new Map();
  for (const group of [recipe.inputs, recipe.outputs]) {
    for (const entry of group) {
      if (!entry || typeof entry.itemId !== "string") throw new Error("Invalid recipe item");
      requirePositiveInteger(entry.quantity, "Recipe quantity");
      getItem(catalog, entry.itemId);
      if (group === recipe.inputs) inputQuantities.set(entry.itemId, (inputQuantities.get(entry.itemId) || 0) + entry.quantity);
    }
  }
  return {
    ...recipe,
    inputs: [...inputQuantities].map(([itemId, quantity]) => ({ itemId, quantity }))
  };
}

function canCraft(inventory, recipe, options) {
  const { catalog, flags } = resolveOptions(options);
  if (flags.crafting !== true) return false;
  const normalizedRecipe = validateRecipe(recipe, catalog);
  return normalizedRecipe.inputs.every(({ itemId, quantity }) => (inventory[itemId] || 0) >= quantity)
    && normalizedRecipe.outputs.every(({ itemId, quantity }) => previewItemGrant(inventory, itemId, quantity, { catalog }).status === "awarded");
}

function getMissingIngredients(inventory, recipe, options) {
  const { catalog } = resolveOptions(options);
  const normalizedRecipe = validateRecipe(recipe, catalog);
  return normalizedRecipe.inputs
    .map(({ itemId, quantity }) => {
      const have = Number.isInteger(inventory?.[itemId]) && inventory[itemId] > 0 ? inventory[itemId] : 0;
      return { itemId, need: quantity, have, missing: Math.max(quantity - have, 0) };
    })
    .filter((entry) => entry.missing > 0);
}

function craftRecipe(inventory, recipe, options) {
  const { catalog, flags } = resolveOptions(options);
  requireEnabled(flags, "crafting");
  const normalizedRecipe = validateRecipe(recipe, catalog);
  const before = copyInventory(inventory);
  if (!normalizedRecipe.inputs.every(({ itemId, quantity }) => (before[itemId] || 0) >= quantity)) {
    return { crafted: false, inventory: before };
  }
  const staged = { ...before };
  for (const { itemId, quantity } of normalizedRecipe.inputs) {
    staged[itemId] -= quantity;
    if (staged[itemId] === 0) delete staged[itemId];
  }
  let next = staged;
  for (const { itemId, quantity } of normalizedRecipe.outputs) next = awardItem(next, itemId, quantity, { catalog });
  return { crafted: true, inventory: next };
}

function purchaseOffer(state, offer, options) {
  const { catalog, flags } = resolveOptions(options);
  requireEnabled(flags, "shop");
  if (!offer || typeof offer !== "object") throw new Error("Invalid shop offer");
  getItem(catalog, offer.itemId);
  requirePositiveInteger(offer.quantity, "Offer quantity");
  if (!Number.isInteger(offer.price) || offer.price < 0) throw new Error("Offer price must be a non-negative integer");
  const next = { ...state, inventory: awardItem(state.inventory || {}, offer.itemId, offer.quantity, { catalog }) };
  const balanceKey = Object.prototype.hasOwnProperty.call(state, "coins") ? "coins" : "currency";
  const balance = state[balanceKey] || 0;
  if (!Number.isInteger(balance) || balance < offer.price) throw new Error("Insufficient currency");
  next[balanceKey] = balance - offer.price;
  if (state.shop) next.shop = { ...state.shop, purchases: { ...(state.shop.purchases || {}), [offer.id]: (state.shop.purchases?.[offer.id] || 0) + 1 } };
  return next;
}

function equipItem(state, slot, itemId, options) {
  const { catalog, flags } = resolveOptions(options);
  requireEnabled(flags, "equipment");
  if (!EQUIPMENT_SLOTS.includes(slot)) throw new Error(`Unknown equipment slot: ${slot}`);
  const item = getItem(catalog, itemId);
  if (!Array.isArray(item.equipmentSlots) || !item.equipmentSlots.includes(slot)) {
    throw new Error(`Item ${itemId} is not equippable in slot ${slot}`);
  }
  if (!(state.inventory?.[itemId] > 0)) throw new Error(`Item ${itemId} is not owned`);
  return { ...state, equipment: { ...(state.equipment || {}), slots: { ...(state.equipment?.slots || {}), [slot]: itemId } } };
}

function isValidEquipmentAssignment(slot, itemId, inventory, options) {
  const { catalog } = resolveOptions(options);
  if (!EQUIPMENT_SLOTS.includes(slot) || typeof itemId !== "string" || !(inventory?.[itemId] > 0)) return false;
  let item;
  try {
    item = getItem(catalog, itemId);
  } catch {
    return false;
  }
  return Array.isArray(item.equipmentSlots) && item.equipmentSlots.includes(slot);
}

function getEquipmentStats(state = {}, options) {
  const { catalog } = resolveOptions(options);
  const slots = state.equipment?.slots || state.equipment || {};
  return Object.entries(slots).reduce((stats, [slot, itemId]) => {
    if (!itemId) return stats;
    let item;
    try {
      item = getItem(catalog, itemId);
    } catch {
      return stats;
    }
    if (!EQUIPMENT_SLOTS.includes(slot) || !Array.isArray(item.equipmentSlots) || !item.equipmentSlots.includes(slot)) return stats;
    const itemStats = item.equipmentStats || {};
    for (const key of Object.keys(ZERO_STATS)) stats[key] += Number(itemStats[key] || 0);
    return stats;
  }, { ...ZERO_STATS });
}

module.exports = {
  RECIPES,
  PROJECT_RECIPES,
  getProjectRecipes,
  EQUIPMENT_SLOTS,
  createInventory: () => ({}),
  awardItem,
  previewItemGrant,
  grantItem,
  canCraft,
  getMissingIngredients,
  craftRecipe,
  purchaseOffer,
  equipItem,
  isValidEquipmentAssignment,
  getEquipmentStats
};
