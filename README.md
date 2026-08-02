# Knowledge Quest Game

Knowledge Quest is a local-first, game-only math adventure. The shipped page mounts
the quest runtime directly and the old learning dashboard entry has been removed.

## Features

- **Six chapters with 72 levels.** Follow each chapter map in sequence; later
  chapters unlock after the previous expedition and final project are complete.
- **Ten escalating questions per level.** Every level is a focused challenge run with
  a fixed ten-question progression and a final boss question.
- **Fixed or random rewards by question.** Some questions preview a fixed item,
  while others preview a random reward pool. Correct answers grant the configured
  fixed item or one rolled pool item when capacity allows; already-owned unique
  relics and capped stacks are reported explicitly instead of being duplicated or
  shown as newly earned.
- **Persistent inventory and crafting.** Correct answers award raw materials. Materials
  refine through a chapter-specific material-processing layer before becoming themed components; every three topic components combine into a major part,
  and the major parts assemble each chapter project: J-20, deep-sea probe, orbital
  station, polar icebreaker, and 99A main battle tank.
- **Recovery challenges.** After all twelve topics in a chapter are cleared, an incomplete
  project unlocks a ten-question recovery challenge. Learners can choose wrong-answer
  review or a chapter-wide random set; correct answers provide one capped missing raw material,
  while skipping provides no material.
- **Numeric question contract.** All 720 shipped questions use automatically judged
  numeric answers (integers, decimals, fractions, or percentages); the challenge UI
  uses one focused input instead of text-choice questions.
- **Story missions and tactical review.** Each topic has stable, child-readable
  expedition scenes with at least four story variants. After a result, the tactical
  review stays collapsed by default and expands into a difficulty-scaled checklist.
- **Extensible reward foundation.** Shop, equipment, stats, and advanced growth hooks
  remain in the game domain for future chapters without exposing legacy learning panels.
- **No learning-support disclosure.** Challenge play does not expose legacy examples,
  daily practice, wrong-book, parent dashboard, reports, paper generation, mastery,
  or answer-analysis panels.

## Run locally

Install Node.js 20 or later, then install dependencies:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal to play the six-chapter expedition. Build a static
production bundle with:

```bash
npm run build
npm run preview
```

## Validation and regression checks

```bash
# Unit and syntax checks
npm test
npm run check

# Game chapter validation: expects 6 chapters, 72 levels, and 720 questions
npm run validate:game

# Browser behavior checks for the game-only runtime
npm run test:game-ui
npm run audit:ui
npm run smoke

# Production bundle budget check
npm run check:bundle
```

`validate:game` validates the compiled quest chapter used by the shipped game
entrypoint.

## Project entrypoints

- `index.html` loads `src/game-main.js`.
- `src/game-main.js` mounts the game in `#game-root`.
- `game/` contains chapter construction, progression, inventory, rewards, UI, and
  game styling.
- Root content source files such as `data.js` and `contentExpansion.js` are retained
  only because the current chapter compiler consumes them to build the game levels.
- `scripts/game-ui-behavior.js`, `scripts/audit-ui.js`, and
  `scripts/smoke-browser.js` exercise the game-only DOM.
