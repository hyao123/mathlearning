const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { withPage } = require("./browser-test-utils.js");

async function main() {
  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    const client = await page.context().newCDPSession(page);
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    const startedAt = Date.now();
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.locator("[data-game-screen='map']").waitFor({ state: "visible", timeout: 10000 });
    const mapReadyMs = Date.now() - startedAt;
    assert.ok(mapReadyMs < 10000, `map should remain usable on a throttled device (${mapReadyMs}ms)`);

    await page.locator("[data-level-id='chapter-01-level-1']").click();
    await page.locator("[data-game-screen='challenge']").waitFor({ state: "visible", timeout: 10000 });
    const images = await page.locator("img[data-item-visual]").evaluateAll((elements) => elements.map((image) => ({
      loading: image.loading,
      decoding: image.decoding,
      fetchPriority: image.fetchPriority
    })));
    assert.ok(images.length > 0, "challenge should render at least one item visual");
    assert.equal(images.every(({ loading, decoding, fetchPriority }) => loading === "eager" && decoding === "async" && fetchPriority === "high"), true, "the current reward visual should be eagerly available");
    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK low-performance audit at ${baseUrl}; map ready in ${mapReadyMs}ms`);
  }, { port: process.env.LOW_PERFORMANCE_PORT || "4196", viewport: { width: 375, height: 812 } });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
