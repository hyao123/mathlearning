# Content Structure

This directory is the migration target for moving learning content out of large runtime JavaScript files.

Current safeguards:

- `npm run validate:content` loads the full runtime content pipeline and validates module, example, practice, learning-support, and mistake-tag schema.
- `npm run snapshot:content` refreshes `content-snapshot.json`, a compact review snapshot grouped by knowledge strand.
- `npm run check:content-snapshot` fails CI when the snapshot is stale.

Recommended content workflow:

1. Add or edit content in the existing source modules while the runtime is still JS-based.
2. Run `npm run validate:content`.
3. Run `npm run snapshot:content` when module counts or strand coverage intentionally changes.
4. Use the snapshot to review module counts, practice counts, support coverage, and mistake-tag coverage before merging.

Future migration target:

- Move each knowledge strand into a data file under this directory.
- Keep runtime enrichment modules as pure transforms.
- Generate `window.MATH_LEARNING_DATA` from structured files at build time.
