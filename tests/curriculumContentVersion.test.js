const assert = require("node:assert/strict");
const test = require("node:test");

const version = require("../game/curriculum/contentVersionModel.js");

test("returns unplayed, current, and updated for level completion versions", () => {
  assert.equal(version.getLevelContentStatus({ levelId: "a" }, null), "unplayed");
  assert.equal(version.getLevelContentStatus({ levelId: "a" }, { starCount: 3 }), "current");
  assert.equal(version.getLevelContentStatus(
    { levelId: "a", contentVersion: "gold-v3" },
    { starCount: 3 }
  ), "updated");
  assert.equal(version.getLevelContentStatus(
    { levelId: "a", contentVersion: "gold-v3" },
    { starCount: 3, contentVersion: "gold-v3" }
  ), "current");
});

test("treats malformed levels and records defensively", () => {
  assert.equal(version.getLevelContentStatus(null, { starCount: 3 }), "current");
  assert.equal(version.getLevelContentStatus({ contentVersion: " " }, { starCount: 3 }), "current");
  assert.equal(version.getLevelContentStatus({ contentVersion: 3 }, { starCount: 3 }), "current");
  assert.equal(version.getLevelContentStatus({ contentVersion: "gold-v3" }, undefined), "unplayed");
  assert.equal(version.getLevelContentStatus({ contentVersion: "gold-v3" }, []), "unplayed");
  assert.equal(version.getLevelContentStatus({ contentVersion: "gold-v3" }, { starCount: 3, contentVersion: 3 }), "updated");
});
