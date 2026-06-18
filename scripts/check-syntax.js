const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const skip = new Set(['vite.config.js']);
const files = fs.readdirSync(root).filter(f => f.endsWith('.js') && !skip.has(f) && !f.includes('node_modules'));
const testFiles = fs.readdirSync(path.join(root, 'tests')).filter(f => f.endsWith('.js'));

let exitCode = 0;

[...files, ...testFiles.map(f => `tests/${f}`)].forEach(file => {
  const result = spawnSync('node', ['--check', file], { cwd: root, stdio: 'pipe' });
  if (result.status !== 0) {
    console.error(`✗ ${file}: ${result.stderr.toString().trim()}`);
    exitCode = 1;
  } else {
    console.log(`✓ ${file}`);
  }
});

process.exit(exitCode);
