const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const artifactDir = "C:\\Users\\24960\\.gemini\\antigravity-ide\\brain\\763b6a51-7969-4c89-ad59-19894cb763b7";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });

  await page.goto("http://127.0.0.1:5174/", { waitUntil: "networkidle" });

  // 1. Setup state: directly on inventory screen with unlocked chapters
  await page.evaluate(() => {
    localStorage.clear();
    const inventory = {
      "j20-sky-fighter": 1,
      "deep-sea-explorer": 1,
      "orbital-science-station": 1,
      "polar-icebreaker": 1,
      "99a-main-battle-tank": 1,
      "quantum-communication-satellite": 1,
      "math-explorer-rover": 1,
      "deep-space-navigation-ship": 1,
      "smart-city-hub": 1,
      "chapter-01-mission-1": 1,
      "chapter-02-mission-1": 1,
      "chapter-03-mission-1": 1
    };
    const chapterStates = {};
    const unlocked = [
      "chapter-01", "chapter-02", "chapter-03", "chapter-04",
      "chapter-05", "chapter-06", "chapter-07", "chapter-08", "chapter-09"
    ];
    unlocked.forEach(id => {
      chapterStates[id] = {
        chapterId: id,
        screen: "inventory",
        inventory: { ...inventory },
        unlockedLevelIds: [`${id}-level-1`],
        levelRecords: {}
      };
    });

    const campaign = {
      version: "math-quest-campaign-v2",
      activeChapterId: "chapter-01",
      unlockedChapterIds: unlocked,
      completedChapterIds: ["chapter-01", "chapter-02"],
      chapterStates,
      lastSettlement: null
    };
    const gameState = {
      lastScreen: "inventory",
      activeChapterId: "chapter-01",
      unlockedLevelIds: ["chapter-01-level-1"],
      levelRecords: {}
    };
    localStorage.setItem("math-quest-inventory-v1", JSON.stringify({ version: "math-quest-inventory-v1", inventory }));
    localStorage.setItem("math-quest-campaign-v2", JSON.stringify(campaign));
    localStorage.setItem("math-quest-game-v1", JSON.stringify(gameState));
  });

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // If not on inventory, click open button
  if (await page.locator("[data-hub-open-inventory], [data-open-inventory]").count() > 0) {
    await page.locator("[data-hub-open-inventory], [data-open-inventory]").first().click();
    await page.waitForTimeout(400);
  }

  // 1. Capture Chapter 1 (J-20 Completed Arsenal Deck & Grand Project Card)
  await page.screenshot({ path: path.join(artifactDir, "real_ch1_j20_deck.png"), fullPage: true });
  console.log("Captured real_ch1_j20_deck.png");

  // Helper to switch chapter and screenshot
  async function captureChapter(chapterId, outputName) {
    const btn = page.locator(`[data-switch-inventory-chapter='${chapterId}']`);
    if (await btn.count() > 0) {
      await btn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(artifactDir, outputName), fullPage: true });
      console.log(`Captured ${outputName}`);
    } else {
      console.log(`Tab for ${chapterId} not found`);
    }
  }

  // 2. Capture Chapter 2 (deep-sea-explorer)
  await captureChapter("chapter-02", "real_ch2_submersible_deck.png");

  // 3. Capture Chapter 3 (orbital-science-station)
  await captureChapter("chapter-03", "real_ch3_space_station.png");

  // 4. Capture Chapter 4 (polar-icebreaker)
  await captureChapter("chapter-04", "real_ch4_icebreaker.png");

  // 5. Capture Chapter 5 (99a-main-battle-tank)
  await captureChapter("chapter-05", "real_ch5_tank.png");

  // 6. Capture Chapter 6 (quantum-communication-satellite)
  await captureChapter("chapter-06", "real_ch6_quantum_satellite.png");

  // 7. Capture Chapter 7 (math-explorer-rover)
  await captureChapter("chapter-07", "real_ch7_mars_rover.png");

  // 8. Capture Chapter 8 (deep-space-navigation-ship)
  await captureChapter("chapter-08", "real_ch8_deepspace_ship.png");

  // 9. Capture Chapter 9 (smart-city-hub)
  await captureChapter("chapter-09", "real_ch9_smart_city.png");

  await browser.close();
  console.log("All screenshots captured successfully!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
