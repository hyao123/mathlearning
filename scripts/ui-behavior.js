const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { withPage } = require("./browser-test-utils.js");

async function main() {
  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });

    const moduleButtons = page.locator("#module-list .module-path__item, #knowledge-mode-list .knowledge-mode-card").filter({ visible: true });
    const moduleCount = await moduleButtons.count();
    assert.ok(moduleCount > 1, "expected multiple module buttons");

    const firstTitle = await moduleButtons.nth(0).locator("strong").textContent();
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("#module-list .module-path__item, #knowledge-mode-list .knowledge-mode-card"))
        .filter((button) => button.offsetParent !== null);
      buttons[1].click();
    });
    const selectedTitle = await page.locator("#module-title").textContent();
    assert.notEqual(selectedTitle?.trim(), firstTitle?.trim(), "module click should switch active module");

    const firstPractice = page.locator("#practice-list .card--practice").first();
    await firstPractice.waitFor({ state: "visible", timeout: 10000 });
    await firstPractice.locator(".answer-input").fill("wrong-answer");
    await firstPractice.locator(".submit-answer").click();
    await firstPractice.locator(".feedback.is-wrong").waitFor({ state: "visible", timeout: 10000 });

    const stateAfterWrong = await page.evaluate(() => JSON.parse(localStorage.getItem("mathlearning-progress-v2")));
    assert.ok(stateAfterWrong.wrongBook.length > 0, "wrong answer should add a wrong-book entry");
    assert.ok(stateAfterWrong.stats.attempts >= 1, "wrong answer should update attempts");

    await page.locator("#paper-generator-panel").scrollIntoViewIfNeeded();
    await page.locator("#generate-wrong-paper").click();
    await page.locator(".paper-card").first().waitFor({ state: "visible", timeout: 10000 });

    await page.locator("#parent-dashboard").scrollIntoViewIfNeeded();
    const report = await Promise.all([
      page.waitForEvent("download", { timeout: 10000 }),
      page.locator("#export-report").click()
    ]).then(([download]) => download);
    assert.match(report.suggestedFilename(), /^mathlearning-report-.*\.json$/);

    const progress = await Promise.all([
      page.waitForEvent("download", { timeout: 10000 }),
      page.locator("#export-progress").click()
    ]).then(([download]) => download);
    assert.match(progress.suggestedFilename(), /^mathlearning-progress-.*\.json$/);

    assert.deepEqual(pageErrors, [], `browser console/page errors:\n${pageErrors.join("\n")}`);
    console.log(`OK UI behavior test at ${baseUrl}`);
  }, { port: process.env.UI_TEST_PORT || "4175" });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
