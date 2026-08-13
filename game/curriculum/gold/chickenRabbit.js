"use strict";

const REVIEW = Object.freeze({ reviewer: "Curriculum reviewer", reviewedAt: "2026-08-13T00:00:00.000Z", evidence: "Independent arithmetic recomputation completed." });
const s = (id, operation, operands, result, explanation) => ({ id, kind: "calculate", operation, operands, result, explanation });
const q = (fields) => Object.freeze({
  schemaVersion: 3, topicId: "chicken-rabbit", answerType: "numeric", answerFormat: "integer", answerPolicy: { kind: "integer" },
  primaryConcept: "chicken-rabbit", readingProfile: { unfamiliarTerms: [] }, reviewMetadata: REVIEW, ...fields
});

const CHICKEN_RABBIT_GOLD_QUESTIONS = Object.freeze([
  q({
    id: "chicken-rabbit-1", level: 1, slot: 1, title: "Bikes and tricycles", difficulty: "basic", answer: "5",
    prompt: "8 bikes and tricycles have 21 wheels. How many are tricycles?",
    conditionRoles: ["vehicle-total", "wheel-total"], structureFamily: "uniform-difference", representation: "text", questionDirection: "forward", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["assume-all-bikes"],
    solution: { strategy: "assume-all-bikes", summary: "21 - 16 = 5", steps: [s("base", "multiply", [8, 2], 16, "Assume every vehicle has two wheels."), s("answer", "subtract", [21, "$base"], 5, "Each extra wheel marks one tricycle.")] },
    verification: { strategy: "count-by-kind", summary: "5 x 3 + 3 x 2 = 21", steps: [s("bikes", "subtract", [8, 5], 3, "Three vehicles are bikes."), s("tri", "multiply", [5, 3], 15, "Five tricycles have fifteen wheels."), s("bike", "multiply", ["$bikes", 2], 6, "Three bikes have six wheels."), s("total", "add", ["$tri", "$bike"], 21, "The wheel total matches."), s("answer", "divide", ["$tri", 3], 5, "There are five tricycles.")] },
    commonPitfall: "A tricycle has one more wheel than a bike.", storyBeat: "Find the extra wheels."
  }),
  q({
    id: "chicken-rabbit-2", level: 2, slot: 2, title: "Chickens and rabbits", difficulty: "basic", answer: "4",
    prompt: "10 chickens and rabbits have 28 legs. How many rabbits are there?",
    conditionRoles: ["animal-total", "leg-total"], structureFamily: "uniform-difference", representation: "text", questionDirection: "find-parameter", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["assume-all-chickens"],
    solution: { strategy: "assume-all-chickens", summary: "(28 - 20) / 2 = 4", steps: [s("base", "multiply", [10, 2], 20, "Assume every animal is a chicken."), s("extra", "subtract", [28, "$base"], 8, "Rabbits make eight extra legs."), s("answer", "divide", ["$extra", 2], 4, "Each rabbit adds two legs.")] },
    verification: { strategy: "head-and-leg-check", summary: "4 x 4 + 6 x 2 = 28", steps: [s("chickens", "subtract", [10, 4], 6, "Six animals are chickens."), s("rlegs", "multiply", [4, 4], 16, "Rabbit legs total sixteen."), s("clegs", "multiply", ["$chickens", 2], 12, "Chicken legs total twelve."), s("total", "add", ["$rlegs", "$clegs"], 28, "The legs total twenty-eight."), s("answer", "divide", ["$rlegs", 4], 4, "There are four rabbits.")] },
    commonPitfall: "Only two rabbit legs are extra.", storyBeat: "Use chickens as the starting model."
  }),
  q({
    id: "chicken-rabbit-3", level: 3, slot: 3, title: "Model car table", difficulty: "basic", answer: "4",
    prompt: "12 models have 2 or 4 wheels, 32 in all. How many have 4 wheels?",
    conditionRoles: ["model-total", "wheel-total", "wheel-types"], structureFamily: "difference-table", representation: "table", representationShift: true, questionDirection: "find-parameter", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["difference-table"],
    solution: { strategy: "difference-table", summary: "32 - 24 = 8; 8 / 2 = 4", steps: [s("base", "multiply", [12, 2], 24, "Start the table with two wheels each."), s("extra", "subtract", [32, "$base"], 8, "Four-wheel models add eight wheels."), s("answer", "divide", ["$extra", 2], 4, "Each adds two wheels.")] },
    verification: { strategy: "table-column-total", summary: "4 x 4 + 8 x 2 = 32", steps: [s("two", "subtract", [12, 4], 8, "Eight models have two wheels."), s("fourw", "multiply", [4, 4], 16, "Four models have sixteen wheels."), s("twow", "multiply", ["$two", 2], 16, "Eight models have sixteen wheels."), s("total", "add", ["$fourw", "$twow"], 32, "The table total matches."), s("answer", "divide", ["$fourw", 4], 4, "The four-wheel column has four models.")] },
    commonPitfall: "A four-wheel model adds two wheels, not four.", storyBeat: "Read the table by columns."
  }),
  q({
    id: "chicken-rabbit-4", level: 4, slot: 4, title: "Known rabbits", difficulty: "intermediate", answer: "40",
    prompt: "14 chickens and rabbits include 6 rabbits. How many legs?",
    conditionRoles: ["animal-total", "known-rabbits", "leg-rates"], structureFamily: "reverse-total", representation: "equation", questionDirection: "reverse", reasoningMoves: ["assume", "reverse", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["classify-then-sum"],
    solution: { strategy: "classify-then-sum", summary: "6 x 4 + 8 x 2 = 40", steps: [s("chickens", "subtract", [14, 6], 8, "The other animals are chickens."), s("rlegs", "multiply", [6, 4], 24, "Rabbit legs total twenty-four."), s("clegs", "multiply", ["$chickens", 2], 16, "Chicken legs total sixteen."), s("answer", "add", ["$rlegs", "$clegs"], 40, "Together there are forty legs.")] },
    verification: { strategy: "all-chicken-plus-extra", summary: "14 x 2 + 6 x 2 = 40", steps: [s("base", "multiply", [14, 2], 28, "Give every animal two legs first."), s("extra", "multiply", [6, 2], 12, "Six rabbits add twelve legs."), s("answer", "add", ["$base", "$extra"], 40, "The total is forty legs.")] },
    commonPitfall: "Use the known rabbit count before adding legs.", storyBeat: "Work backward from the known group."
  }),
  q({
    id: "chapter-01-chicken-rabbit-advance-1", level: 5, slot: 5, title: "Numbered cage", difficulty: "intermediate", answer: "3",
    prompt: "16 bots have 2 or 6 feet, 44 total. Cage 6 label, six-foot bots?",
    conditionRoles: ["robot-total", "foot-total", "irrelevant-label"], structureFamily: "irrelevant-condition", representation: "text", questionDirection: "find-parameter", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["ignore-label-and-assume"], readingProfile: { unfamiliarTerms: ["label"] },
    solution: { strategy: "ignore-label-and-assume", summary: "(44 - 32) / 4 = 3", steps: [s("base", "multiply", [16, 2], 32, "Ignore the label and start with two feet each."), s("extra", "subtract", [44, "$base"], 12, "Six-foot robots add twelve feet."), s("answer", "divide", ["$extra", 4], 3, "Each adds four extra feet.")] },
    verification: { strategy: "separate-foot-count", summary: "3 x 6 + 13 x 2 = 44", steps: [s("twofoot", "subtract", [16, 3], 13, "Thirteen robots have two feet."), s("sixfeet", "multiply", [3, 6], 18, "Three robots have eighteen feet."), s("twofeet", "multiply", ["$twofoot", 2], 26, "The others have twenty-six feet."), s("total", "add", ["$sixfeet", "$twofeet"], 44, "The useful total matches."), s("answer", "divide", ["$sixfeet", 6], 3, "There are three six-foot robots.")] },
    commonPitfall: "The cage number is not a math condition.", storyBeat: "Keep only useful facts."
  }),
  q({
    id: "chicken-rabbit-5", level: 6, slot: 6, title: "Two and three wheel vehicles", difficulty: "intermediate", answer: "6",
    prompt: "12 bicycles and tricycles have 30 wheels. How many are tricycles?",
    conditionRoles: ["vehicle-total", "wheel-total", "one-wheel-difference"], structureFamily: "one-extra-wheel", representation: "diagram", representationShift: true, questionDirection: "find-parameter", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["one-extra-wheel"],
    solution: { strategy: "one-extra-wheel", summary: "30 - 24 = 6", steps: [s("base", "multiply", [12, 2], 24, "Assume all are bicycles."), s("answer", "subtract", [30, "$base"], 6, "Each extra wheel marks one tricycle.")] },
    verification: { strategy: "category-wheel-sum", summary: "6 x 3 + 6 x 2 = 30", steps: [s("bikes", "subtract", [12, 6], 6, "The other six are bicycles."), s("tri", "multiply", [6, 3], 18, "Tricycles have eighteen wheels."), s("bike", "multiply", ["$bikes", 2], 12, "Bicycles have twelve wheels."), s("total", "add", ["$tri", "$bike"], 30, "The wheel total matches."), s("answer", "divide", ["$tri", 3], 6, "There are six tricycles.")] },
    commonPitfall: "Here each tricycle makes one extra wheel.", storyBeat: "Notice the smaller difference."
  }),
  q({
    id: "chicken-rabbit-6", level: 7, slot: 7, title: "Coin collection", difficulty: "advanced", answer: "8",
    prompt: "20 coins of 2 or 5 yuan total 64 yuan. How many are 5-yuan coins?",
    conditionRoles: ["coin-total", "value-total", "coin-values"], structureFamily: "value-difference", representation: "table", questionDirection: "find-parameter", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["assume-all-2-yuan"],
    solution: { strategy: "assume-all-2-yuan", summary: "(64 - 40) / 3 = 8", steps: [s("base", "multiply", [20, 2], 40, "Assume every coin is two yuan."), s("extra", "subtract", [64, "$base"], 24, "Five-yuan coins add twenty-four yuan."), s("answer", "divide", ["$extra", 3], 8, "Each adds three yuan.")] },
    verification: { strategy: "coin-count-and-value", summary: "8 x 5 + 12 x 2 = 64", steps: [s("two", "subtract", [20, 8], 12, "Twelve coins are two yuan."), s("fivevalue", "multiply", [8, 5], 40, "Five-yuan coins total forty."), s("twovalue", "multiply", ["$two", 2], 24, "Two-yuan coins total twenty-four."), s("total", "add", ["$fivevalue", "$twovalue"], 64, "The values match."), s("answer", "divide", ["$fivevalue", 5], 8, "There are eight five-yuan coins.")] },
    commonPitfall: "A five-yuan coin adds three yuan beyond two yuan.", storyBeat: "Turn values into a difference."
  }),
  q({
    id: "chicken-rabbit-9", level: 8, slot: 8, title: "Large and small boxes", difficulty: "advanced", answer: "6",
    prompt: "18 boxes hold 5 or 3 items each, 66 in all. How many are large?",
    conditionRoles: ["box-total", "item-total", "box-capacities"], structureFamily: "two-method-boxes", representation: "equation", questionDirection: "find-parameter", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: [], strategyChoices: ["assume-all-small", "equation"],
    solution: { strategy: "assume-all-small", summary: "(66 - 54) / 2 = 6", steps: [s("base", "multiply", [18, 3], 54, "Assume every box is small."), s("extra", "subtract", [66, "$base"], 12, "Large boxes add twelve items."), s("answer", "divide", ["$extra", 2], 6, "Each adds two items.")] },
    verification: { strategy: "capacity-sum", summary: "6 x 5 + 12 x 3 = 66", steps: [s("small", "subtract", [18, 6], 12, "Twelve boxes are small."), s("largeitems", "multiply", [6, 5], 30, "Large boxes hold thirty items."), s("smallitems", "multiply", ["$small", 3], 36, "Small boxes hold thirty-six items."), s("total", "add", ["$largeitems", "$smallitems"], 66, "The item total matches."), s("answer", "divide", ["$largeitems", 5], 6, "There are six large boxes.")] },
    commonPitfall: "Do not add the two box capacities.", storyBeat: "Choose the all-small-box method."
  }),
  q({
    id: "chicken-rabbit-7", level: 9, slot: 9, title: "Robot transfer", difficulty: "advanced", answer: "8",
    prompt: "24 robots have 2 or 4 feet, with 8 fewer four-foot bots. How many?",
    conditionRoles: ["robot-total", "difference-between-groups", "foot-rates"], structureFamily: "sum-difference-transfer", representation: "bar-model", questionDirection: "find-parameter", reasoningMoves: ["assume", "substitute", "verify"], supportingConcepts: ["sum-diff"], strategyChoices: ["bar-model"],
    solution: { strategy: "sum-difference-bar-model", summary: "(24 - 8) / 2 = 8", steps: [s("reduced-total", "subtract", [24, 8], 16, "Remove the extra eight robots first."), s("answer", "divide", ["$reduced-total", 2], 8, "The two equal parts each have eight robots.")] },
    verification: { strategy: "feet-total-check", summary: "8 x 4 + 16 x 2 = 64", steps: [s("fourfeet", "multiply", [8, 4], 32, "Four-foot robots have thirty-two feet."), s("twofeet", "multiply", [16, 2], 32, "Two-foot robots have thirty-two feet."), s("feet", "add", ["$fourfeet", "$twofeet"], 64, "The total is sixty-four feet."), s("answer", "divide", ["$fourfeet", 4], 8, "The four-foot group has eight robots.")] },
    commonPitfall: "The difference is between robot counts, not feet.", storyBeat: "Use sum and difference before checking feet."
  }),
  q({
    id: "chicken-rabbit-8", level: 10, slot: 10, title: "Repair shop boss", difficulty: "challenge", answer: "5",
    prompt: "22 bikes/trikes have 44 wheels after 5 fall off. How many trikes?",
    conditionRoles: ["vehicle-total", "damaged-wheel-total", "restored-wheels", "wheel-rates"], structureFamily: "restoration-boss", representation: "diagram", representationShift: true, questionDirection: "reverse", reasoningMoves: ["assume", "reverse", "substitute", "verify"], supportingConcepts: ["sum-diff"], strategyChoices: ["restore-total", "assume-all-bikes"], transfer: "boss-integration",
    solution: { strategy: "restore-then-assume", summary: "44 + 5 = 49; (49 - 44) / 2 = 5", steps: [s("whole", "add", [44, 5], 49, "Restore the five missing wheels."), s("base", "multiply", [22, 2], 44, "Assume all vehicles are bikes."), s("extra", "subtract", ["$whole", "$base"], 5, "Tricycles make five extra wheels."), s("answer", "divide", ["$extra", 1], 5, "Each tricycle has one extra wheel.")] },
    verification: { strategy: "restore-and-separate-count", summary: "5 x 3 + 17 x 2 = 49", steps: [s("bikes", "subtract", [22, 5], 17, "The other vehicles are bikes."), s("tri", "multiply", [5, 3], 15, "Tricycles have fifteen whole wheels."), s("bike", "multiply", ["$bikes", 2], 34, "Bikes have thirty-four wheels."), s("whole", "add", ["$tri", "$bike"], 49, "The restored total is forty-nine."), s("answer", "divide", ["$tri", 3], 5, "There are five tricycles.")] },
    commonPitfall: "Restore missing wheels before using the vehicle model.", storyBeat: "Restore the wheels, then solve the model."
  })
]);

module.exports = CHICKEN_RABBIT_GOLD_QUESTIONS;
