const { readdirSync } = require("node:fs");
const { join, relative } = require("node:path");
const { spawnSync } = require("node:child_process");

const projectRoot = join(__dirname, "..");
const ignoredDirectories = new Set([".git", ".github", "node_modules"]);

function collectJavaScriptFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        return [];
      }
      return collectJavaScriptFiles(join(directory, entry.name));
    }

    if (!entry.isFile() || !entry.name.endsWith(".js")) {
      return [];
    }

    return [join(directory, entry.name)];
  });
}

const files = collectJavaScriptFiles(projectRoot).sort((left, right) => left.localeCompare(right));

if (files.length === 0) {
  console.log("No JavaScript files found.");
  process.exit(0);
}

const failures = [];

files.forEach((file) => {
  const displayPath = relative(projectRoot, file);
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf-8"
  });

  if (result.status === 0) {
    console.log(`✓ ${displayPath}`);
    return;
  }

  failures.push(displayPath);
  console.error(`✗ ${displayPath}`);
  if (result.stdout) {
    console.error(result.stdout.trim());
  }
  if (result.stderr) {
    console.error(result.stderr.trim());
  }
});

if (failures.length > 0) {
  console.error(`Syntax check failed for ${failures.length} file(s).`);
  process.exit(1);
}

console.log(`Syntax check passed for ${files.length} file(s).`);
