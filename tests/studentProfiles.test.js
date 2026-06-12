const assert = require("node:assert/strict");
const test = require("node:test");

class FakeStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

global.Storage = FakeStorage;
global.localStorage = new FakeStorage();
global.location = { reload() {} };

const studentProfiles = require("../studentProfiles.js");

test("creates a default student profile", () => {
  const active = studentProfiles.getActiveProfile();
  assert.equal(active.id, "default");
  assert.equal(active.name, "默认学生");
  assert.equal(studentProfiles.getProgressStorageKey(), "mathlearning-progress-v2::student:default");
});

test("adds and activates a new profile", () => {
  const profile = studentProfiles.addProfile("小明");
  assert.equal(studentProfiles.getActiveProfile().id, profile.id);
  assert.equal(studentProfiles.getActiveProfile().name, "小明");
  assert.equal(studentProfiles.getProgressStorageKey(), `mathlearning-progress-v2::student:${profile.id}`);
  assert.ok(studentProfiles.getProfiles().some((item) => item.name === "小明"));
});

test("maps app progress storage to active student", () => {
  const active = studentProfiles.getActiveProfile();
  localStorage.setItem("mathlearning-progress-v2", "student-progress");

  assert.equal(localStorage.getItem(`mathlearning-progress-v2::student:${active.id}`), "student-progress");
  assert.equal(localStorage.getItem("mathlearning-progress-v2"), "student-progress");
});

test("switches active profile", () => {
  studentProfiles.setActiveProfile("default");
  assert.equal(studentProfiles.getActiveProfile().id, "default");
});
