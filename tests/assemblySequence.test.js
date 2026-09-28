const test = require("node:test");
const assert = require("node:assert/strict");

const SoundEngine = require("../game/soundEngine.js");
const AssemblyFX = require("../game/assemblyFX.js");
const GameItemCatalog = require("../game/itemCatalog.js");

test("SoundEngine exports assembly audio triggers and handles headless gracefully", () => {
  assert.equal(typeof SoundEngine.playAssemblySnap, "function");
  assert.equal(typeof SoundEngine.playLaserCircuit, "function");
  assert.equal(typeof SoundEngine.playSuperProjectIgnition, "function");

  // Should not throw in Node.js / headless
  assert.doesNotThrow(() => SoundEngine.playAssemblySnap());
  assert.doesNotThrow(() => SoundEngine.playLaserCircuit());
  assert.doesNotThrow(() => SoundEngine.playSuperProjectIgnition());
});

test("AssemblyFX handles null canvas and returns safe stop handler", () => {
  assert.equal(typeof AssemblyFX.triggerAssemblyShockwave, "function");
  assert.equal(typeof AssemblyFX.bindCardTilt, "function");

  const effect = AssemblyFX.triggerAssemblyShockwave(null);
  assert.equal(typeof effect.stop, "function");
  assert.doesNotThrow(() => effect.stop());

  const unbind = AssemblyFX.bindCardTilt(null);
  assert.equal(typeof unbind, "function");
  assert.doesNotThrow(() => unbind());
});

test("Super Projects define 4 core parts for assembly sequence", () => {
  const chapterIds = ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05"];
  chapterIds.forEach((chapterId) => {
    const project = GameItemCatalog.getSuperProject(chapterId);
    assert.ok(project, `Super project exists for ${chapterId}`);
    assert.equal(project.partRecipes.length, 4, `${chapterId} has exactly 4 core part recipes`);
    assert.ok(project.finalRecipe, `${chapterId} has a final assembly recipe`);
    assert.equal(project.finalRecipe.inputs.length, 4, `${chapterId} final recipe takes all 4 parts`);
  });
});
