const LIMITS = Object.freeze({
  "grade-3": { promptChars: 70, sentences: 2, unfamiliarTerms: 1 },
  "grade-4": { promptChars: 85, sentences: 3, unfamiliarTerms: 1 },
  "grade-5": { promptChars: 100, sentences: 3, unfamiliarTerms: 2 },
  "grade-6": { promptChars: 120, sentences: 4, unfamiliarTerms: 2 },
  "cup-entry": { promptChars: 120, sentences: 4, unfamiliarTerms: 3 }
});

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateReadability(question, gradeBand) {
  const errors = [];
  const limit = typeof gradeBand === "string" ? LIMITS[gradeBand] : null;
  if (!limit) errors.push(typeof gradeBand === "string" ? `invalid gradeBand: ${gradeBand}` : "invalid gradeBand");
  if (!isObject(question)) return [...errors, "question must be an object"];

  try {
    const prompt = question.prompt;
    if (!hasText(prompt)) {
      errors.push("prompt must be a non-empty string");
    } else if (limit) {
      if ([...prompt].length > limit.promptChars) errors.push(`prompt exceeds ${limit.promptChars} characters`);
      const sentenceCount = prompt.split(/[。！？；.!?;]/u).filter((part) => part.trim()).length;
      if (sentenceCount > limit.sentences) errors.push(`prompt exceeds ${limit.sentences} sentences`);
    }

    const readingProfile = question.readingProfile;
    const unfamiliarTerms = isObject(readingProfile) ? readingProfile.unfamiliarTerms : undefined;
    if (!Array.isArray(unfamiliarTerms) || unfamiliarTerms.some((term) => !hasText(term))) {
      errors.push("readingProfile.unfamiliarTerms must be an array of non-empty strings");
    } else if (limit && unfamiliarTerms.length > limit.unfamiliarTerms) {
      errors.push(`unfamiliar terms exceed ${limit.unfamiliarTerms}`);
    }
  } catch {
    errors.push("question could not be read");
  }

  return [...new Set(errors)];
}

const api = { LIMITS, validateReadability };

if (typeof module !== "undefined" && module.exports) module.exports = api;
globalThis.Readability = api;
