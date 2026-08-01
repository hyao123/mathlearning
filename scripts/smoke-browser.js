const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { withPage } = require("./browser-test-utils.js");

async function settleLevelWithSkips(page) {
  for (let question = 0; question < 10; question += 1) {
    await page.locator("[data-answer-input]").fill("incorrect answer");
    await page.locator("[data-submit-answer]").click();
    await page.locator("[data-retry-question]").waitFor({ state: "visible", timeout: 10000 });
    await page.locator("[data-skip-question]").click();
    await page.locator("[data-continue-resolved]").click();
  }
}

async function main() {
  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    await page.locator("#game-root").waitFor({ state: "visible", timeout: 10000 });
    await page.locator("[data-game-screen='map']").waitFor({ state: "visible", timeout: 10000 });
    assert.equal(await page.locator("[data-level-id]").count(), 12, "expected 12 game map nodes");

    await page.locator("[data-level-id='chapter-01-level-1']").click();
    await page.locator("[data-game-screen='challenge']").waitFor({ state: "visible", timeout: 10000 });
    assert.ok((await page.locator("[data-question-prompt]").textContent())?.trim(), "expected a challenge question");

    await settleLevelWithSkips(page);
    await page.locator("[data-game-screen='settlement']").waitFor({ state: "visible", timeout: 10000 });
    assert.equal(await page.locator("[data-settlement-stars]").count(), 1, "expected settlement state");

    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK browser smoke test at ${baseUrl}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
