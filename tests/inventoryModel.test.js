const assert = require("node:assert/strict");
const test = require("node:test");
const inventory = require("../game/inventoryModel.js");

const enabled = { crafting: true, shop: true, equipment: true };

test("awards stackable items without mutating the prior inventory", () => {
  const initial = inventory.createInventory();
  const next = inventory.awardItem(initial, "iron-ingot", 2);

  assert.deepEqual(initial, {});
  assert.deepEqual(next, { "iron-ingot": 2 });
});

test("awardItem rejects unknown, invalid, and overflowing quantities", () => {
  assert.throws(() => inventory.awardItem({}, "missing", 1), /Unknown item/);
  assert.throws(() => inventory.awardItem({}, "iron-ingot", 0), /positive integer/);
  assert.throws(() => inventory.awardItem({ diamond: 64 }, "diamond", 1), /stack limit/);
});

test("crafting atomically consumes inputs and produces outputs", () => {
  const recipe = {
    id: "expedition-toolkit",
    inputs: [{ itemId: "oak-log", quantity: 2 }, { itemId: "iron-ingot", quantity: 3 }],
    outputs: [{ itemId: "expedition-core", quantity: 1 }]
  };
  const before = { "oak-log": 2, "iron-ingot": 3 };
  const result = inventory.craftRecipe(before, recipe, enabled);

  assert.deepEqual(before, { "oak-log": 2, "iron-ingot": 3 });
  assert.deepEqual(result.inventory, { "expedition-core": 1 });
  assert.equal(result.crafted, true);
});

test("enabled crafting reports insufficient materials without changing inventory", () => {
  const before = { "iron-ingot": 2 };
  const result = inventory.craftRecipe(before, {
    id: "expedition-toolkit",
    inputs: [{ itemId: "iron-ingot", quantity: 3 }],
    outputs: [{ itemId: "expedition-core", quantity: 1 }]
  }, enabled);

  assert.deepEqual(result, { crafted: false, inventory: { "iron-ingot": 2 } });
  assert.deepEqual(before, { "iron-ingot": 2 });
});

test("duplicate input rows are aggregated for availability and consumption", () => {
  const before = { "iron-ingot": 3 };
  const recipe = {
    id: "duplicate-inputs",
    inputs: [{ itemId: "iron-ingot", quantity: 2 }, { itemId: "iron-ingot", quantity: 2 }],
    outputs: [{ itemId: "expedition-core", quantity: 1 }]
  };

  assert.equal(inventory.canCraft(before, recipe, enabled), false);
  assert.deepEqual(inventory.craftRecipe(before, recipe, enabled), { crafted: false, inventory: before });
  assert.deepEqual(before, { "iron-ingot": 3 });
});

test("lists the exact missing ingredients for an enabled recipe", () => {
  const missing = inventory.getMissingIngredients(
    { "oak-log": 1 },
    {
      id: "missing-toolkit",
      inputs: [{ itemId: "oak-log", quantity: 2 }, { itemId: "iron-ingot", quantity: 1 }],
      outputs: [{ itemId: "expedition-core", quantity: 1 }]
    },
    enabled
  );
  assert.deepEqual(missing, [
    { itemId: "oak-log", need: 2, have: 1, missing: 1 },
    { itemId: "iron-ingot", need: 1, have: 0, missing: 1 }
  ]);
});

test("crafting rejects invalid quantities and unknown recipe item IDs", () => {
  const invalidQuantity = { id: "invalid-quantity", inputs: [{ itemId: "iron-ingot", quantity: 0 }], outputs: [{ itemId: "expedition-core", quantity: 1 }] };
  const unknownInput = { id: "unknown-input", inputs: [{ itemId: "missing", quantity: 1 }], outputs: [{ itemId: "expedition-core", quantity: 1 }] };
  const unknownOutput = { id: "unknown-output", inputs: [{ itemId: "iron-ingot", quantity: 1 }], outputs: [{ itemId: "missing", quantity: 1 }] };

  assert.throws(() => inventory.canCraft({ "iron-ingot": 1 }, invalidQuantity, enabled), /positive integer/);
  assert.throws(() => inventory.craftRecipe({ "iron-ingot": 1 }, invalidQuantity, enabled), /positive integer/);
  assert.throws(() => inventory.canCraft({ "iron-ingot": 1 }, unknownInput, enabled), /Unknown item/);
  assert.throws(() => inventory.craftRecipe({ "iron-ingot": 1 }, unknownOutput, enabled), /Unknown item/);
});

test("crafting rejects output stack overflow without mutating the input inventory", () => {
  const before = { diamond: 64, "oak-log": 1 };
  const recipe = {
    id: "overflow-output",
    inputs: [{ itemId: "oak-log", quantity: 1 }],
    outputs: [{ itemId: "diamond", quantity: 1 }]
  };

  assert.throws(() => inventory.craftRecipe(before, recipe, enabled), /stack limit/);
  assert.deepEqual(before, { diamond: 64, "oak-log": 1 });
});

test("crafting, shop, and equipment reject disabled or invalid operations", () => {
  assert.throws(() => inventory.craftRecipe({}, { id: "x", inputs: [], outputs: [] }, { crafting: false }), /disabled/);
  assert.throws(() => inventory.purchaseOffer({}, { id: "x" }, { shop: false }), /disabled/);
  assert.throws(() => inventory.equipItem({ inventory: {} }, "tool", "missing", { equipment: true }), /Unknown item/);
});

test("shop purchase transitions are immutable", () => {
  const state = { inventory: { "iron-ingot": 1 }, coins: 20, equipment: { slots: {} } };
  const offer = { id: "iron-offer", itemId: "oak-log", quantity: 2, price: 10 };
  const purchased = inventory.purchaseOffer(state, offer, enabled);

  assert.deepEqual(state, { inventory: { "iron-ingot": 1 }, coins: 20, equipment: { slots: {} } });
  assert.deepEqual(purchased.inventory, { "iron-ingot": 1, "oak-log": 2 });
  assert.equal(purchased.coins, 10);
});

test("equipment accepts only declared slots and compatible equippable items", () => {
  const catalog = {
    getItem(itemId) {
      return {
        compass: { id: "compass", equipmentSlots: ["tool"], equipmentStats: { luck: 2 } },
        material: { id: "material", equipmentSlots: [], equipmentStats: null }
      }[itemId];
    }
  };
  const options = { featureFlags: enabled, catalog };
  const state = { inventory: { compass: 1, material: 1 }, equipment: { slots: {} } };

  const equipped = inventory.equipItem(state, "tool", "compass", options);
  assert.equal(equipped.equipment.slots.tool, "compass");
  assert.throws(() => inventory.equipItem(state, "weapon", "compass", options), /Unknown equipment slot/);
  assert.throws(() => inventory.equipItem(state, "tool", "material", options), /not equippable/);
  assert.throws(() => inventory.equipItem({ inventory: { "oak-log": 1 } }, "tool", "oak-log", enabled), /not equippable/);
  assert.deepEqual(inventory.getEquipmentStats(equipped, { catalog }), { attack: 0, defense: 0, luck: 2, rewardBonus: 0 });
});

test("reward grants distinguish awarded, already-owned, and stack-capped outcomes", () => {
  assert.deepEqual(inventory.grantItem({}, "expedition-core", 1), {
    inventory: { "expedition-core": 1 },
    transaction: { itemId: "expedition-core", requestedQuantity: 1, awardedQuantity: 1, status: "awarded" }
  });
  assert.deepEqual(inventory.grantItem({ "expedition-core": 1 }, "expedition-core", 1), {
    inventory: { "expedition-core": 1 },
    transaction: { itemId: "expedition-core", requestedQuantity: 1, awardedQuantity: 0, status: "already-owned" }
  });
  assert.equal(inventory.grantItem({ diamond: 64 }, "diamond", 1).transaction.status, "stack-capped");
});

test("equipment stats default to zero and aggregate equipped item stats", () => {
  assert.deepEqual(inventory.getEquipmentStats({}), { attack: 0, defense: 0, luck: 0, rewardBonus: 0 });
});

test("exposes the disabled recipe catalog", () => {
  assert.deepEqual(inventory.RECIPES, [{
    id: "expedition-toolkit",
    inputs: [{ itemId: "oak-log", quantity: 2 }, { itemId: "iron-ingot", quantity: 3 }],
    outputs: [{ itemId: "expedition-core", quantity: 1 }],
    unlockRule: { chapterId: "chapter-01", relicItemId: "expedition-core" }
  }]);
});

test("crafts J-20 project components, grouped parts, and final fighter with enabled crafting", () => {
  const componentRecipe = inventory.PROJECT_RECIPES.find((recipe) => recipe.id === "craft-j20-frame-rib");
  const partRecipe = inventory.PROJECT_RECIPES.find((recipe) => recipe.id === "assemble-j20-airframe");
  const finalRecipe = inventory.PROJECT_RECIPES.find((recipe) => recipe.id === "assemble-j20-sky-fighter");

  assert.ok(componentRecipe, "frame rib recipe should exist");
  assert.ok(partRecipe, "airframe assembly recipe should exist");
  assert.ok(finalRecipe, "final J-20 assembly recipe should exist");
  assert.deepEqual(componentRecipe.outputs, [{ itemId: "j20-frame-rib", quantity: 1 }]);
  assert.equal(inventory.canCraft({ "oak-log": 2 }, componentRecipe, enabled), true);
  assert.deepEqual(
    inventory.craftRecipe({ "oak-log": 2 }, componentRecipe, enabled),
    { crafted: true, inventory: { "j20-frame-rib": 1 } }
  );

  assert.equal(inventory.canCraft({ "j20-frame-rib": 1, "j20-wing-spar": 1, "j20-skin-panel": 1 }, partRecipe, enabled), true);
  assert.equal(
    inventory.craftRecipe({ "j20-frame-rib": 1, "j20-wing-spar": 1, "j20-skin-panel": 1 }, partRecipe, enabled).inventory["j20-airframe"],
    1
  );

  const allParts = Object.fromEntries(finalRecipe.inputs.map(({ itemId, quantity }) => [itemId, quantity]));
  assert.equal(inventory.canCraft(allParts, finalRecipe, enabled), true);
  assert.equal(inventory.craftRecipe(allParts, finalRecipe, enabled).inventory["j20-sky-fighter"], 1);
});

test("exposes the polar icebreaker crafting chain", () => {
  const componentRecipe = inventory.getProjectRecipes("chapter-04").find((recipe) => recipe.id === "craft-icebreaker-1");
  const finalRecipe = inventory.getProjectRecipes("chapter-04").find((recipe) => recipe.id === "assemble-polar-icebreaker");

  assert.ok(componentRecipe);
  assert.ok(finalRecipe);
  assert.deepEqual(componentRecipe.outputs, [{ itemId: "icebreaker-1", quantity: 1 }]);
  assert.equal(inventory.canCraft({ "ice-crystal-shard": 2 }, componentRecipe, enabled), true);
  assert.equal(inventory.craftRecipe({ "ice-crystal-shard": 2 }, componentRecipe, enabled).inventory["icebreaker-1"], 1);
  assert.equal(finalRecipe.inputs.length, 4);
});
