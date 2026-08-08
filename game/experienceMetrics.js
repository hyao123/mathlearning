const METRICS_STORAGE_KEY = "math-quest-experience-metrics-v1";
const METRICS_VERSION = METRICS_STORAGE_KEY;
const MAX_COUNTER = 1000000;
const MAX_SHORTAGE_BUCKET = 99;

function emptyMetrics() {
  return { version: METRICS_VERSION, chapters: {} };
}

function validChapterId(chapterId) {
  return typeof chapterId === "string" && /^chapter-\d{2}$/.test(chapterId);
}

function positiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function boundedCounter(value) {
  return Math.min(MAX_COUNTER, Math.max(0, Number.isInteger(value) ? value : 0));
}

function sanitizeChapter(value) {
  const chapter = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const shortages = chapter.materialShortages && typeof chapter.materialShortages === "object" && !Array.isArray(chapter.materialShortages)
    ? Object.fromEntries(Object.entries(chapter.materialShortages)
      .filter(([bucket, count]) => /^\d+$/.test(bucket) && Number(bucket) > 0 && Number(bucket) <= MAX_SHORTAGE_BUCKET && Number.isInteger(count) && count > 0)
      .map(([bucket, count]) => [bucket, boundedCounter(count)]))
    : {};
  return {
    levelsStarted: boundedCounter(chapter.levelsStarted),
    levelsCleared: boundedCounter(chapter.levelsCleared),
    retries: boundedCounter(chapter.retries),
    skippedQuestions: boundedCounter(chapter.skippedQuestions),
    materialShortages: shortages
  };
}

function sanitizeMetrics(value) {
  const parsed = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const chapters = parsed.chapters && typeof parsed.chapters === "object" && !Array.isArray(parsed.chapters) ? parsed.chapters : {};
  return {
    version: METRICS_VERSION,
    chapters: Object.fromEntries(Object.entries(chapters)
      .filter(([chapterId]) => validChapterId(chapterId))
      .map(([chapterId, chapter]) => [chapterId, sanitizeChapter(chapter)]))
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createExperienceMetrics(storageProvider) {
  if (typeof storageProvider !== "function") throw new Error("Metrics storage provider must be a function");
  let metrics = emptyMetrics();
  let loaded = false;

  function load() {
    if (loaded) return clone(metrics);
    loaded = true;
    try {
      const serialized = storageProvider()?.getItem(METRICS_STORAGE_KEY);
      if (serialized) metrics = sanitizeMetrics(JSON.parse(serialized));
    } catch {
      metrics = emptyMetrics();
    }
    return clone(metrics);
  }

  function save() {
    try {
      storageProvider()?.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
    } catch {
      // Metrics are optional; gameplay remains fully local and usable when storage is blocked.
    }
  }

  function chapterMetrics(chapterId) {
    if (!validChapterId(chapterId)) return null;
    load();
    metrics.chapters[chapterId] ||= sanitizeChapter();
    return metrics.chapters[chapterId];
  }

  function increment(chapterId, field) {
    const chapter = chapterMetrics(chapterId);
    if (!chapter) return;
    chapter[field] = boundedCounter(chapter[field] + 1);
    save();
  }

  return {
    load,
    recordLevelStart(chapterId) {
      increment(chapterId, "levelsStarted");
    },
    recordLevelClear(chapterId) {
      increment(chapterId, "levelsCleared");
    },
    recordQuestionOutcome(chapterId, outcome) {
      if (outcome === "retry") increment(chapterId, "retries");
      if (outcome === "skip") increment(chapterId, "skippedQuestions");
    },
    recordMaterialShortage(chapterId, missingQuantity) {
      if (!positiveInteger(missingQuantity)) return;
      const chapter = chapterMetrics(chapterId);
      if (!chapter) return;
      const bucket = String(Math.min(MAX_SHORTAGE_BUCKET, missingQuantity));
      chapter.materialShortages[bucket] = boundedCounter((chapter.materialShortages[bucket] || 0) + 1);
      save();
    }
  };
}

module.exports = { METRICS_STORAGE_KEY, createExperienceMetrics, sanitizeMetrics };
