function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getNonEmptyString(value, key) {
  try {
    const candidate = value?.[key];
    return typeof candidate === "string" && candidate.trim() ? candidate : null;
  } catch {
    return null;
  }
}

function getLevelContentStatus(level, record) {
  if (!isRecord(record)) return "unplayed";

  const levelVersion = getNonEmptyString(level, "contentVersion");
  if (!levelVersion) return "current";

  return getNonEmptyString(record, "contentVersion") === levelVersion
    ? "current"
    : "updated";
}

module.exports = { getLevelContentStatus };
