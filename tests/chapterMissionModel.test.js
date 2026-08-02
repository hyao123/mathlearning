const assert = require("node:assert/strict");
const test = require("node:test");
const missions = require("../game/chapterMissionModel.js");

test("claims each eligible chapter mission only once", () => {
  const state = {
    levelRecords: {
      "chapter-02-level-1": { starCount: 3 },
      "chapter-02-level-2": { starCount: 3 },
      "chapter-02-level-3": { starCount: 3 }
    },
    streak: 10,
    inventory: {},
    claimedMissionRewards: {}
  };
  const first = missions.claimEligibleMissions("chapter-02", state);
  assert.equal(first.transactions.length, 3);
  const second = missions.claimEligibleMissions("chapter-02", { ...state, inventory: first.inventory, claimedMissionRewards: first.claimedMissionRewards });
  assert.equal(second.transactions.length, 0);
});

test("claims each eligible polar icebreaker mission only once", () => {
  const state = {
    levelRecords: {
      "chapter-04-level-1": { starCount: 3 },
      "chapter-04-level-2": { starCount: 3 },
      "chapter-04-level-3": { starCount: 3 }
    },
    streak: 10,
    inventory: { "icebreaker-part-1": 1, "polar-icebreaker": 1 },
    claimedMissionRewards: {}
  };

  const first = missions.claimEligibleMissions("chapter-04", state);
  const second = missions.claimEligibleMissions("chapter-04", {
    ...state,
    inventory: first.inventory,
    claimedMissionRewards: first.claimedMissionRewards
  });

  assert.equal(first.transactions.length, 5);
  assert.equal(second.transactions.length, 0);
  assert.deepEqual(Object.keys(first.claimedMissionRewards).sort(), [
    "chapter-04-mission-1",
    "chapter-04-mission-2",
    "chapter-04-mission-3",
    "chapter-04-mission-4",
    "chapter-04-mission-5"
  ]);
});

test("claims each eligible 99A armored mission only once", () => {
  const state = {
    levelRecords: {
      "chapter-05-level-1": { starCount: 3 },
      "chapter-05-level-2": { starCount: 3 },
      "chapter-05-level-3": { starCount: 3 }
    },
    streak: 10,
    inventory: { "tank-part-1": 1, "99a-main-battle-tank": 1 },
    claimedMissionRewards: {}
  };
  const first = missions.claimEligibleMissions("chapter-05", state);
  const second = missions.claimEligibleMissions("chapter-05", {
    ...state,
    inventory: first.inventory,
    claimedMissionRewards: first.claimedMissionRewards
  });

  assert.equal(first.transactions.length, 5);
  assert.equal(second.transactions.length, 0);
});

test("claims each eligible quantum satellite mission only once", () => {
  const state = {
    levelRecords: {
      "chapter-06-level-1": { starCount: 3 },
      "chapter-06-level-2": { starCount: 3 },
      "chapter-06-level-3": { starCount: 3 }
    },
    streak: 10,
    inventory: { "satellite-part-1": 1, "quantum-communication-satellite": 1 },
    claimedMissionRewards: {}
  };
  const first = missions.claimEligibleMissions("chapter-06", state);
  const second = missions.claimEligibleMissions("chapter-06", {
    ...state,
    inventory: first.inventory,
    claimedMissionRewards: first.claimedMissionRewards
  });

  assert.equal(first.transactions.length, 5);
  assert.equal(second.transactions.length, 0);
  assert.deepEqual(Object.keys(first.claimedMissionRewards).sort(), [
    "chapter-06-mission-1",
    "chapter-06-mission-2",
    "chapter-06-mission-3",
    "chapter-06-mission-4",
    "chapter-06-mission-5"
  ]);
});
