# Chapter Visual Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace generic chapter two and chapter three SVG placeholders with 44 polished, independent visuals.

**Architecture:** Keep material icons as SVG. Add a manifest for the 44 project and mission assets, generate `*-v2.webp` files in `public/assets/items`, then register their paths and load policy through `game/itemVisuals.js`.

**Tech Stack:** Vite, CommonJS, built-in image generation, WebP, Node test runner.

## Global Constraints

- Create 10 badges, 24 components, 8 large parts and 2 final projects.
- Use unique `*-v2.webp` files; standard files are 1024×1024 and final projects are 1536×1024.
- Do not change item IDs, recipes, rewards, save data or first-chapter assets.
- No text, logos, real-world weapon markings or new dependencies.

### Task 1: Manifest and red test

**Files:** Create `game/chapterVisualManifest.js`; modify `tests/itemVisuals.test.js`.

**Interfaces:** Export `CHAPTER_VISUAL_MANIFEST`, with 44 `{ itemId, filename, chapterId, kind, alt, preloadPriority, prompt }` entries.

- [ ] Write a test that asserts 44 unique `itemId` values and unique `*-v2.webp` filenames.
- [ ] Run `node --test tests/itemVisuals.test.js`; confirm it fails because the manifest is absent.
- [ ] Implement the manifest: chapter 02 and chapter 03 each define five mission badges, twelve components, four large parts and one final project.
- [ ] Re-run `node --test tests/itemVisuals.test.js`; confirm the manifest test passes.
- [ ] Commit with `git commit -m "feat: define chapter visual manifest"`.

### Task 2: Deep-sea resource set

**Files:** Create the 22 chapter-02 `*-v2.webp` files in `public/assets/items/`.

**Interfaces:** Consume each deep-sea manifest prompt and produce exactly its filename.

- [ ] Generate one asset per prompt using the built-in image generator: polished 3D game inventory art, deep cyan/sea-crystal palette, centred subject, child-friendly, no words or watermark.
- [ ] Inspect final project, four large parts and five badges; confirm distinct silhouettes at 128px.
- [ ] Verify 22 deep-sea files exist with `Get-ChildItem public/assets/items/*-v2.webp`.
- [ ] Commit with `git commit -m "feat: add deep sea project visuals"`.

### Task 3: Orbital resource set

**Files:** Create the 22 chapter-03 `*-v2.webp` files in `public/assets/items/`.

**Interfaces:** Consume each orbital manifest prompt and produce exactly its filename.

- [ ] Generate one asset per prompt using the built-in image generator: polished 3D game inventory art, indigo/violet/solar-gold palette, centred subject, child-friendly, no words or watermark.
- [ ] Inspect final project, four large parts and five badges; confirm distinct silhouettes at 128px.
- [ ] Verify 22 orbital files exist with `Get-ChildItem public/assets/items/*-v2.webp`.
- [ ] Commit with `git commit -m "feat: add orbital project visuals"`.

### Task 4: Bind asset paths and load priorities

**Files:** Modify `game/itemVisuals.js` and `tests/itemVisuals.test.js`.

**Interfaces:** `getItemVisual(itemId)` returns `/assets/items/<filename>` for every manifest entry.

- [ ] Add a failing test that each manifest file exists, returns the declared URL and has its expected preload priority.
- [ ] Run `node --test tests/itemVisuals.test.js`; confirm it fails while expansion visuals use SVG data URLs.
- [ ] Replace generic expansion entries with manifest-backed paths. Use `project-final` preload for final projects, `reward-reveal` for mission badges and `lazy` for standard components and large parts.
- [ ] Re-run `node --test tests/itemVisuals.test.js`; confirm it passes.
- [ ] Commit with `git commit -m "feat: bind distinct chapter project visuals"`.

### Task 5: Release verification

**Files:** Verify only.

- [ ] Run `npm test` and `$env:REQUIRE_HUMAN_REVIEW='1'; npm run validate:game`.
- [ ] Run `npm run test:game-ui`, `npm run audit:ui`, `npm run build` and `npm run check:bundle`.
- [ ] Confirm no console errors, 44 unique asset URLs, and a clean `git status --short` after final commit.

## Self-Review

Tasks 1–4 cover the complete 44-resource set, unique mapping, loading strategy, old-save compatibility and image quality review. Task 5 covers functional, responsive and release validation.
