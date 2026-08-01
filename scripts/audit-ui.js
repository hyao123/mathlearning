const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { withPage } = require("./browser-test-utils.js");

const viewports = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 1000 }
];

async function settleLevelWithSkips(page) {
  for (let question = 0; question < 10; question += 1) {
    await page.locator("[data-answer-input]").fill("incorrect answer");
    await page.locator("[data-submit-answer]").click();
    await page.locator("[data-retry-question]").waitFor({ state: "visible", timeout: 10000 });
    await page.locator("[data-skip-question]").click();
    await page.locator("[data-continue-resolved]").click();
  }
}

async function auditViewport(viewport, index) {
  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.locator("#game-root").waitFor({ state: "visible", timeout: 10000 });
    await page.locator("[data-game-screen='map']").waitFor({ state: "visible", timeout: 10000 });
    await page.locator("[data-level-map]").scrollIntoViewIfNeeded();
    assert.equal(await page.locator("[data-level-id]").count(), 12, "expected 12 game map nodes");
    assert.equal(await page.locator("[data-level-id][data-status='current']").evaluate((button) => {
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && rect.height >= 48 && rect.bottom <= window.innerHeight + 2;
    }), true, `current level action should be visible at ${viewport.width}px`);

    await page.locator("[data-level-id='chapter-01-level-1']").click();
    await page.locator("[data-game-screen='challenge']").waitFor({ state: "visible", timeout: 10000 });
    assert.ok((await page.locator("[data-question-prompt]").textContent())?.trim(), "expected a challenge question");
    await settleLevelWithSkips(page);
    await page.locator("[data-game-screen='settlement']").waitFor({ state: "visible", timeout: 10000 });
    assert.equal(await page.locator("[data-settlement-stars]").count(), 1, "expected settlement state");

    const layout = await page.evaluate(() => ({
      bodyScrollWidth: document.body.scrollWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      unlabeledButtons: Array.from(document.querySelectorAll("button")).filter((button) => {
        const name = button.getAttribute("aria-label") || button.textContent || button.title;
        return !name.trim();
      }).length,
      unnamedLinks: Array.from(document.querySelectorAll("a")).filter((link) => {
        const name = link.getAttribute("aria-label") || link.textContent || link.title;
        return !name.trim();
      }).length,
      unidentifiableInputs: Array.from(document.querySelectorAll("input, select, textarea")).filter((input) => {
        if (input.type === "file" && input.hidden) return false;
        const id = input.id;
        return !input.getAttribute("aria-label")
          && !input.getAttribute("placeholder")
          && !input.closest("label")
          && !(id && document.querySelector(`label[for="${CSS.escape(id)}"]`));
      }).length,
      visiblePrimaryButtons: Array.from(document.querySelectorAll(".pixel-button--primary")).filter((button) => {
        const rect = button.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }).length
    }));

    assert.ok(layout.bodyScrollWidth <= layout.viewportWidth + 2, `body overflows at ${viewport.width}px`);
    assert.ok(layout.documentScrollWidth <= layout.viewportWidth + 2, `document overflows at ${viewport.width}px`);
    assert.equal(layout.unlabeledButtons, 0, "all buttons should have an accessible name");
    assert.equal(layout.unnamedLinks, 0, "all links should have an accessible name");
    assert.equal(layout.unidentifiableInputs, 0, "inputs should be labeled or have placeholders");
    assert.ok(layout.visiblePrimaryButtons >= 1, `expected a visible primary game action at ${viewport.width}px`);
    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK UI audit ${viewport.width}x${viewport.height} at ${baseUrl}`);
  }, { port: Number(process.env.UI_AUDIT_PORT || 4180) + index, viewport });
}

async function main() {
  for (const [index, viewport] of viewports.entries()) await auditViewport(viewport, index);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
