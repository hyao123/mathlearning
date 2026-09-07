const test = require("node:test");
const assert = require("node:assert/strict");
const SoundEngine = require("../game/soundEngine.js");

test("SoundEngine exports API and safely handles headless/server environments", () => {
  assert.equal(typeof SoundEngine.isMuted, "function");
  assert.equal(typeof SoundEngine.setMuted, "function");
  assert.equal(typeof SoundEngine.toggleMute, "function");
  assert.equal(typeof SoundEngine.playClick, "function");
  assert.equal(typeof SoundEngine.playCorrect, "function");
  assert.equal(typeof SoundEngine.playRetry, "function");
  assert.equal(typeof SoundEngine.playStreak, "function");
  assert.equal(typeof SoundEngine.playCraft, "function");
  assert.equal(typeof SoundEngine.playLevelClear, "function");

  // In headless Node, calling play functions should safely no-op without error
  assert.doesNotThrow(() => SoundEngine.playClick());
  assert.doesNotThrow(() => SoundEngine.playCorrect());
  assert.doesNotThrow(() => SoundEngine.playRetry());
  assert.doesNotThrow(() => SoundEngine.playStreak());
  assert.doesNotThrow(() => SoundEngine.playCraft());
  assert.doesNotThrow(() => SoundEngine.playLevelClear());
});

test("SoundEngine toggles and persists mute state", () => {
  const initial = SoundEngine.isMuted();
  const toggled = SoundEngine.toggleMute();
  assert.equal(toggled, !initial);
  assert.equal(SoundEngine.isMuted(), !initial);

  SoundEngine.setMuted(initial);
  assert.equal(SoundEngine.isMuted(), initial);
});
