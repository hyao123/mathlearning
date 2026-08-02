const assert = require("node:assert/strict");
const test = require("node:test");
const items = require("../game/itemCatalog.js");

test("catalog rewards are fixed, themed, and use original icon descriptors", () => {
  assert.equal(items.getRewardForSlot("chapter-01", 0)[0].itemId, "oak-log");
  assert.deepEqual(items.getRewardForSlot("chapter-01", 9).map((entry) => entry.itemId), ["netherite-scrap", "expedition-core"]);
  const diamond = items.getItem("diamond");
  assert.equal(diamond.name, "钻石");
  assert.equal(diamond.icon.kind, "pixel-svg");
  assert.equal(diamond.shopValue > diamond.craftValue, true);
  assert.equal(items.getChapterTheme("chapter-01").rewardCategory, "expedition-materials");
});

test("catalog separates fixed reward questions from random reward questions", () => {
  assert.deepEqual(items.getRewardPlanForSlot("chapter-01", 0), {
    type: "fixed",
    label: "固定奖励",
    rewards: [{ itemId: "oak-log", quantity: 1 }]
  });
  assert.deepEqual(items.getRewardForSlot("chapter-01", 2), []);

  const randomPlan = items.getRewardPlanForSlot("chapter-01", 2);
  assert.equal(randomPlan.type, "random");
  assert.equal(randomPlan.label, "随机奖励");
  assert.deepEqual(randomPlan.pool.map((entry) => entry.itemId), ["coal", "oak-log", "cobblestone"]);

  assert.deepEqual(items.rollRewardForSlot("chapter-01", 2, 0), {
    type: "random",
    rewards: [{ itemId: "coal", quantity: 1 }]
  });
  assert.deepEqual(items.rollRewardForSlot("chapter-01", 2, 0.99), {
    type: "random",
    rewards: [{ itemId: "cobblestone", quantity: 1 }]
  });
});

test("bonus reward metadata is optional, weighted, and never marked as mainline-required", () => {
  const bonusPool = items.getBonusRewardPool("chapter-01");

  assert.ok(bonusPool.length > 0);
  bonusPool.forEach((reward) => {
    assert.ok(items.getItem(reward.itemId));
    assert.equal(typeof reward.rarity, "string");
    assert.equal(typeof reward.minDifficulty, "string");
    assert.equal(reward.weight > 0, true);
    assert.notEqual(reward.purpose, "mainline-required");
  });
});

test("catalog exposes the chapter one J-20 super project blueprint", () => {
  const project = items.getSuperProject("chapter-01");

  assert.equal(project.id, "j20-sky-fighter");
  assert.equal(project.name, "J-20 苍穹战机");
  assert.equal(project.componentRecipes.length, 12);
  assert.equal(project.partRecipes.length, 4);
  assert.equal(project.finalRecipe.output.itemId, "j20-sky-fighter");
  assert.equal(project.finalRecipe.inputs.length, 4);
  assert.deepEqual(project.componentRecipes.slice(0, 3).map((recipe) => recipe.output.itemId), [
    "j20-frame-rib",
    "j20-wing-spar",
    "j20-skin-panel"
  ]);
  assert.deepEqual(project.partRecipes.map((recipe) => recipe.output.itemId), [
    "j20-airframe",
    "j20-avionics",
    "j20-stealth-wing",
    "j20-vector-engine"
  ]);
  assert.deepEqual(project.partRecipes[0].inputs.map((entry) => entry.itemId), [
    "j20-frame-rib",
    "j20-wing-spar",
    "j20-skin-panel"
  ]);

  const airframe = items.getItem("j20-airframe");
  assert.equal(airframe.category, "j20-part");
  assert.equal(airframe.stackLimit, 1);
  assert.equal(airframe.icon.kind, "pixel-svg");
  assert.equal(items.getItem("j20-frame-rib").category, "j20-component");
  assert.equal(items.getItem("j20-sky-fighter").rarity, "mythic");
});

test("catalog exposes the polar icebreaker collection and reward theme", () => {
  const polarItems = items.listItems().filter((item) => item.tags.includes("chapter-04"));
  const project = items.getSuperProject("chapter-04");
  const theme = items.getChapterTheme("chapter-04");

  assert.equal(polarItems.filter((item) => item.category === "craft-material").length, 11);
  assert.equal(polarItems.filter((item) => item.category === "icebreaker-component").length, 12);
  assert.equal(polarItems.filter((item) => item.category === "icebreaker-part").length, 4);
  assert.equal(polarItems.filter((item) => item.category === "mission-collectible").length, 5);
  assert.equal(project.id, "polar-icebreaker");
  assert.equal(project.componentRecipes.length, 12);
  assert.equal(project.partRecipes.length, 4);
  assert.equal(project.finalRecipe.output.itemId, "polar-icebreaker");
  assert.equal(theme.rewardPool.length, 11);
  assert.equal(theme.streakItemId, "ice-crystal-shard");
  assert.equal(items.getRandomRewardPool("chapter-04").length > 0, true);
});

test("catalog exposes the 99A armored collection and its themed reward track", () => {
  const armoredItems = items.listItems().filter((item) => item.tags.includes("chapter-05"));
  const project = items.getSuperProject("chapter-05");
  const theme = items.getChapterTheme("chapter-05");

  assert.equal(armoredItems.filter((item) => item.category === "craft-material").length, 11);
  assert.equal(armoredItems.filter((item) => item.category === "tank-component").length, 12);
  assert.equal(armoredItems.filter((item) => item.category === "tank-part").length, 4);
  assert.equal(armoredItems.filter((item) => item.category === "mission-collectible").length, 5);
  assert.equal(project.id, "99a-main-battle-tank");
  assert.equal(project.componentRecipes.length, 12);
  assert.equal(project.partRecipes.length, 4);
  assert.equal(project.finalRecipe.output.itemId, "99a-main-battle-tank");
  assert.equal(theme.rewardPool.length, 11);
  assert.equal(theme.streakItemId, "carbon-titanium-plate");
});

test("catalog exposes the quantum communication satellite collection", () => {
  const quantumItems = items.listItems().filter((item) => item.tags.includes("chapter-06"));
  const project = items.getSuperProject("chapter-06");
  const theme = items.getChapterTheme("chapter-06");

  assert.equal(quantumItems.filter((item) => item.category === "craft-material").length, 11);
  assert.equal(quantumItems.filter((item) => item.category === "satellite-component").length, 12);
  assert.equal(quantumItems.filter((item) => item.category === "satellite-part").length, 4);
  assert.equal(quantumItems.filter((item) => item.category === "mission-collectible").length, 5);
  assert.equal(project.id, "quantum-communication-satellite");
  assert.equal(project.materialRecipes.length, 12);
  assert.equal(project.componentRecipes.length, 12);
  assert.equal(project.partRecipes.length, 4);
  assert.equal(project.finalRecipe.output.itemId, "quantum-communication-satellite");
  assert.equal(theme.rewardPool.length, 11);
  assert.equal(theme.streakItemId, "starlight-crystal");
});

test("each project exposes a twelve-step raw-material processing layer before components", () => {
  for (const chapterId of ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05", "chapter-06"]) {
    const project = items.getSuperProject(chapterId);
    assert.equal(project.materialRecipes.length, 12, chapterId);
    assert.equal(project.materialRecipes.every((recipe) => recipe.type === "material-processing"), true, chapterId);
    assert.equal(project.materialRecipes.every((recipe) => recipe.output.itemId === "tank-track-steel"
      ? recipe.inputs.length === 1 && recipe.inputs[0].itemId === "tank-steel-ingot" && recipe.inputs[0].quantity === 1
      : recipe.inputs.length === 1 && recipe.inputs[0].quantity === 3), true, chapterId);
    assert.equal(project.componentRecipes.every((recipe, index) => recipe.inputs[0].itemId === project.materialRecipes[index].output.itemId), true, chapterId);
  }

  const tank = items.getSuperProject("chapter-05");
  const steel = tank.materialRecipes.find((recipe) => recipe.output.itemId === "tank-steel-ingot");
  const tracks = tank.componentRecipes.find((recipe) => recipe.output.itemId === "tank-7");
  assert.ok(steel);
  assert.equal(tracks.inputs[0].itemId, "tank-track-steel");
});

test("every chapter reward track has distinct raw materials plus optional exploration bonuses", () => {
  for (const chapterId of ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05"]) {
    const theme = items.getChapterTheme(chapterId);
    assert.equal(theme.rewardPool.length, 11, chapterId);
    assert.equal(new Set(theme.rewardPool).size, 11, chapterId);
    theme.rewardPool.forEach((itemId) => assert.ok(items.getItem(itemId), `${chapterId}:${itemId}`));
    const rewardPlans = Array.from({ length: 10 }, (_, slotIndex) => items.getRewardPlanForSlot(chapterId, slotIndex));
    assert.equal(rewardPlans.length, 10, chapterId);
    assert.equal(rewardPlans.filter((plan) => plan.type === "fixed").length >= 5, true, chapterId);
    assert.equal(rewardPlans.filter((plan) => plan.type === "random").length >= 1, true, chapterId);
    items.getBonusRewardPool(chapterId).forEach((reward) => {
      assert.ok(theme.rewardPool.includes(reward.itemId), `${chapterId}:${reward.itemId}`);
      assert.equal(reward.purpose, "collection");
    });
  }
});
