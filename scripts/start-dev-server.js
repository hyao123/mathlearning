const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const root = __dirname;
const out = fs.openSync(path.join(root, ".vite-dev.log"), "w");
const err = fs.openSync(path.join(root, ".vite-dev.err.log"), "w");
const child = spawn(process.execPath, [path.join(root, "node_modules", "vite", "bin", "vite.js"), "--host", "127.0.0.1", "--port", "5174"], {
  cwd: root,
  detached: true,
  stdio: ["ignore", out, err],
  windowsHide: true
});
fs.writeFileSync(path.join(root, ".vite-dev.pid"), String(child.pid));
child.unref();
console.log(child.pid);
