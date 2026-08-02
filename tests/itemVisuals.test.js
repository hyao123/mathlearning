const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const visuals = require("../game/itemVisuals.js");
const catalog = require("../game/itemCatalog.js");

test("J-20 visual uses a project-bound high-resolution asset with an accessible fallback", () => {
  const visual = visuals.getItemVisual("j20-sky-fighter");
  assert.equal(visual.src, "/assets/items/j20-sky-fighter-v1.webp");
  assert.equal(visual.width >= 512, true);
  assert.equal(visual.height >= 512, true);
  assert.match(visual.alt, /战机/);
  assert.equal(visual.fallbackIcon, "fighter-art");
});

test("unknown items intentionally use the code-native fallback", () => {
  assert.equal(visuals.getItemVisual("future-material"), null);
});

test("all four large J-20 project parts have high-resolution images", () => {
  ["j20-airframe", "j20-avionics", "j20-stealth-wing", "j20-vector-engine"].forEach((itemId) => {
    const visual = visuals.getItemVisual(itemId);
    assert.equal(visual.width >= 512 && visual.height >= 512, true, itemId);
    assert.equal(visual.preloadPriority, "project-part", itemId);
  });
});

test("the radar dish component has a high-resolution project visual", () => {
  const visual = visuals.getItemVisual("j20-radar-dish");
  assert.equal(visual.src, "/assets/items/j20-radar-dish-v1.webp");
  assert.equal(visual.width >= 512 && visual.height >= 512, true);
  assert.equal(visual.preloadPriority, "project-component");
});

test("the absorbing coat component has a high-resolution project visual", () => {
  const visual = visuals.getItemVisual("j20-absorbing-coat");
  assert.equal(visual.src, "/assets/items/j20-absorbing-coat-v1.webp");
  assert.equal(visual.width >= 512 && visual.height >= 512, true);
  assert.equal(visual.preloadPriority, "project-component");
});

test("the modular mounting rail component has a high-resolution project visual", () => {
  const visual = visuals.getItemVisual("j20-weapon-rail");
  assert.equal(visual.src, "/assets/items/j20-weapon-rail-v1.webp");
  assert.equal(visual.width >= 512 && visual.height >= 512, true);
  assert.equal(visual.preloadPriority, "project-component");
});

test("the adaptive wing edge flap component has a high-resolution project visual", () => {
  const visual = visuals.getItemVisual("j20-edge-flap");
  assert.equal(visual.src, "/assets/items/j20-edge-flap-v1.webp");
  assert.equal(visual.width >= 512 && visual.height >= 512, true);
  assert.equal(visual.preloadPriority, "project-component");
});

test("the turbine ring component has a high-resolution project visual", () => {
  const visual = visuals.getItemVisual("j20-turbine-ring");
  assert.equal(visual.src, "/assets/items/j20-turbine-ring-v1.webp");
  assert.equal(visual.width >= 512 && visual.height >= 512, true);
  assert.equal(visual.preloadPriority, "project-component");
});

test("the thrust-vector control vane component has a high-resolution project visual", () => {
  const visual = visuals.getItemVisual("j20-vector-vane");
  assert.equal(visual.src, "/assets/items/j20-vector-vane-v1.webp");
  assert.equal(visual.width >= 512 && visual.height >= 512, true);
  assert.equal(visual.preloadPriority, "project-component");
});

test("the energy distribution component has a high-resolution project visual", () => {
  const visual = visuals.getItemVisual("j20-energy-bus");
  assert.equal(visual.src, "/assets/items/j20-energy-bus-v1.webp");
  assert.equal(visual.width >= 512 && visual.height >= 512, true);
  assert.equal(visual.preloadPriority, "project-component");
});

test("every project component, large part, and final aircraft has a generated visual", () => {
  const itemIds = [
    "j20-frame-rib", "j20-wing-spar", "j20-skin-panel",
    "j20-sensor-array", "j20-flight-computer", "j20-radar-dish",
    "j20-absorbing-coat", "j20-weapon-rail", "j20-edge-flap",
    "j20-turbine-ring", "j20-vector-vane", "j20-energy-bus",
    "j20-airframe", "j20-avionics", "j20-stealth-wing", "j20-vector-engine",
    "j20-sky-fighter"
  ];

  itemIds.forEach((itemId) => {
    const visual = visuals.getItemVisual(itemId);
    assert.ok(visual, itemId);
    assert.equal(visual.width >= 512 && visual.height >= 512, true, itemId);
    assert.match(visual.src, /^\/assets\/items\/j20-.+-v1\.webp$/, itemId);
    assert.equal(typeof visual.alt, "string", itemId);
    assert.ok(visual.alt.length > 0, itemId);
  });
});

test("all campaign catalog items have complete visual entries", () => {
  const coreItems = catalog.listItems();
  assert.equal(coreItems.length, 265);
  coreItems.forEach((item) => {
    const visual = visuals.getItemVisual(item.id);
    assert.ok(visual, item.id);
    const generatedChapterItem = item.tags.includes("chapter-04") || item.tags.includes("chapter-05") || item.tags.includes("chapter-06");
    const minimumSize = generatedChapterItem ? 128 : 256;
    assert.equal(visual.width >= minimumSize && visual.height >= minimumSize, true, item.id);
    assert.ok(visual.alt.length > 0, item.id);
    if (visual.src.startsWith("/assets/")) {
      const expectedVersion = generatedChapterItem ? "v2" : "v1";
      assert.match(visual.src, new RegExp(`^/assets/items/.+-${expectedVersion}\\.webp$`), item.id);
      const relativeAssetPath = visual.src.replace(/^\//, "");
      assert.equal(fs.existsSync(path.join(__dirname, "..", "public", relativeAssetPath.replace(/^assets\//, "assets/"))), true, item.id);
    } else {
      assert.match(visual.src, /^data:image\/svg\+xml/, item.id);
    }
  });
});

test("chapter visual manifest defines unique v2 assets for every new chapter project item", () => {
  const { CHAPTER_VISUAL_MANIFEST } = require("../game/chapterVisualManifest.js");
  const itemIds = CHAPTER_VISUAL_MANIFEST.map(({ itemId }) => itemId);
  const filenames = CHAPTER_VISUAL_MANIFEST.map(({ filename }) => filename);

  assert.equal(CHAPTER_VISUAL_MANIFEST.length, 88);
  assert.equal(new Set(itemIds).size, 88);
  assert.equal(new Set(filenames).size, 88);
  filenames.forEach((filename) => assert.match(filename, /^.+-v2\.webp$/));
});

test("polar project visuals distinguish materials, components, parts, and the finished icebreaker", () => {
  const material = visuals.getItemVisual("ice-crystal-shard");
  const component = visuals.getItemVisual("icebreaker-6");
  const part = visuals.getItemVisual("icebreaker-part-2");
  const finalProject = visuals.getItemVisual("polar-icebreaker");

  assert.equal(material.visualVariant, "polar-material");
  assert.equal(component.visualVariant, "polar-component");
  assert.equal(part.visualVariant, "polar-part");
  assert.equal(finalProject.visualVariant, "polar-final-project");
  assert.equal(finalProject.preloadPriority, "final-project");
  assert.match(finalProject.src, /polar-icebreaker-v2\.webp$/);
  assert.match(component.src, /icebreaker-6-v2\.webp$/);
});

test("every registered polar project and mission visual is a shipped 128px WebP asset", () => {
  const { CHAPTER_VISUAL_MANIFEST } = require("../game/chapterVisualManifest.js");
  const polarVisuals = CHAPTER_VISUAL_MANIFEST.filter((visual) => visual.chapterId === "chapter-04");

  assert.equal(polarVisuals.length, 22);
  polarVisuals.forEach(({ itemId, filename, preloadPriority }) => {
    const visual = visuals.getItemVisual(itemId);
    assert.equal(visual.src, `/assets/items/${filename}`);
    assert.equal(visual.width >= 128 && visual.height >= 128, true, itemId);
    assert.equal(visual.preloadPriority, preloadPriority, itemId);
    assert.equal(fs.existsSync(path.join(__dirname, "..", "public", "assets", "items", filename)), true, itemId);
  });
});

test("every registered 99A project and mission visual is a shipped WebP asset", () => {
  const { CHAPTER_VISUAL_MANIFEST } = require("../game/chapterVisualManifest.js");
  const armoredVisuals = CHAPTER_VISUAL_MANIFEST.filter((visual) => visual.chapterId === "chapter-05");

  assert.equal(armoredVisuals.length, 22);
  armoredVisuals.forEach(({ itemId, filename, preloadPriority }) => {
    const visual = visuals.getItemVisual(itemId);
    assert.equal(visual.src, `/assets/items/${filename}`);
    assert.equal(visual.width >= 128 && visual.height >= 128, true, itemId);
    assert.equal(visual.preloadPriority, preloadPriority, itemId);
    assert.equal(fs.existsSync(path.join(__dirname, "..", "public", "assets", "items", filename)), true, itemId);
  });
  assert.match(visuals.getItemVisual("99a-main-battle-tank").src, /99a-main-battle-tank-v2\.webp$/);
  assert.equal(visuals.getItemVisual("99a-main-battle-tank").preloadPriority, "final-project");
});

test("quantum satellite visuals distinguish materials, components, parts, missions, and final project", () => {
  assert.equal(visuals.getItemVisual("starlight-crystal").visualVariant, "quantum-material");
  assert.equal(visuals.getItemVisual("satellite-6").visualVariant, "quantum-component");
  assert.equal(visuals.getItemVisual("satellite-part-2").visualVariant, "quantum-part");
  assert.equal(visuals.getItemVisual("chapter-06-mission-1").visualVariant, "quantum-mission");
  assert.equal(visuals.getItemVisual("quantum-communication-satellite").visualVariant, "quantum-final-project");
  assert.equal(visuals.getItemVisual("quantum-communication-satellite").preloadPriority, "project-final");
});
