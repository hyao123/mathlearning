const createVisual = (itemId, chapterId, kind, alt, preloadPriority, prompt) => Object.freeze({
  itemId,
  filename: `${itemId}-v2.webp`,
  chapterId,
  kind,
  alt,
  preloadPriority,
  prompt
});

const createChapterVisuals = (chapterId, prefix, finalItemId, theme) => {
  const missions = Array.from({ length: 5 }, (_, index) => createVisual(
    `${chapterId}-mission-${index + 1}`,
    chapterId,
    "mission-badge",
    `${theme} mission badge ${index + 1}`,
    "mission-badge",
    `A polished ${theme.toLowerCase()} mission badge, number ${index + 1}, game inventory icon, isolated on a clean background`
  ));
  const components = Array.from({ length: 12 }, (_, index) => createVisual(
    `${prefix}-${index + 1}`,
    chapterId,
    "project-component",
    `${theme} project component ${index + 1}`,
    "project-component",
    `A detailed ${theme.toLowerCase()} project component, module ${index + 1}, educational game inventory asset, isolated on a clean background`
  ));
  const parts = Array.from({ length: 4 }, (_, index) => createVisual(
    `${prefix}-part-${index + 1}`,
    chapterId,
    "project-part",
    `${theme} large project part ${index + 1}`,
    "project-part",
    `A large assembled ${theme.toLowerCase()} project part, section ${index + 1}, educational game inventory asset, isolated on a clean background`
  ));
  const finalProject = createVisual(
    finalItemId,
    chapterId,
    "final-project",
    `${theme} completed final project`,
    "final-project",
    `The completed ${theme.toLowerCase()} final project, premium educational game inventory asset, isolated on a clean background`
  );

  return [...missions, ...components, ...parts, finalProject];
};

const CHAPTER_VISUAL_MANIFEST = Object.freeze([
  ...createChapterVisuals("chapter-02", "sub", "deep-sea-explorer", "Deep-sea explorer"),
  ...createChapterVisuals("chapter-03", "station", "orbital-science-station", "Orbital science station"),
  ...createChapterVisuals("chapter-04", "icebreaker", "polar-icebreaker", "Polar icebreaker"),
  ...createChapterVisuals("chapter-05", "tank", "99a-main-battle-tank", "99A armored assault"),
  ...createChapterVisuals("chapter-06", "satellite", "quantum-communication-satellite", "Quantum communication satellite"),
  ...createChapterVisuals("chapter-07", "rover", "math-explorer-rover", "Math exploration rover"),
  ...createChapterVisuals("chapter-08", "navship", "deep-space-navigation-ship", "Deep-space navigation ship"),
  ...createChapterVisuals("chapter-09", "city", "smart-city-hub", "Smart city hub")
]);

module.exports = { CHAPTER_VISUAL_MANIFEST };
