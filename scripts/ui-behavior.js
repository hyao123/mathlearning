const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { withPage } = require("./browser-test-utils.js");

async function main() {
  await withPage(chromium, async ({ baseUrl, page, pageErrors }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });

    await page.locator(".student-shell").waitFor({ state: "visible", timeout: 10000 });
    await page.locator(".student-sidebar").waitFor({ state: "visible", timeout: 10000 });
    await page.locator(".student-workspace #lesson-panel").waitFor({ state: "visible", timeout: 10000 });
    const navLabels = await page.locator(".student-nav a").evaluateAll((links) => links.map((link) => link.textContent.trim()));
    assert.deepEqual(navLabels, ["路线", "当前题目", "每日练习", "错题复习"]);
    const defaultStudentText = await page.locator("body").innerText();
    for (const nonStudentWord of ["一年级", "家长", "组卷", "报告", "备份", "恢复", "学生切换", "成长奖励"]) {
      assert.ok(!defaultStudentText.includes(nonStudentWord), `default student view should not show ${nonStudentWord}`);
    }
    for (const distractingPanelWord of ["数学本源", "核心追问", "本质易错点", "动画讲解", "自动播放", "掌握度"]) {
      assert.ok(!defaultStudentText.includes(distractingPanelWord), `default question workspace should not show ${distractingPanelWord}`);
    }
    const lessonBox = await page.locator("#lesson-panel").boundingBox();
    const routeBox = await page.locator("#modules").boundingBox();
    assert.ok(lessonBox && routeBox && lessonBox.y < routeBox.y, "current lesson should appear before route browser");
    const gradeLabels = await page.locator("#grade-filter button").evaluateAll((buttons) => buttons.map((button) => button.textContent.trim()));
    assert.ok(!gradeLabels.includes("一年级"), "child route should start from second grade and above");
    await page.locator("#parent-tools:not([open])").waitFor({ state: "attached", timeout: 10000 });
    assert.equal(await page.locator("#parent-tools > summary").isVisible(), false, "parent tools trigger should not appear in the student view");
    assert.equal(await page.locator("#paper-generator-panel").isVisible(), false, "paper generator should be hidden until parent tools open");

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

    await page.evaluate(() => {
      document.getElementById("parent-tools")?.setAttribute("open", "");
    });
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
