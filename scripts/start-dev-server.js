const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const logDirectory = path.join(root, ".demo-logs");
fs.mkdirSync(logDirectory, { recursive: true });
const out = fs.openSync(path.join(logDirectory, "vite-dev.log"), "w");
const err = fs.openSync(path.join(logDirectory, "vite-dev.err.log"), "w");
const port = process.env.DEMO_PORT || "5174";
const child = spawn(process.execPath, [path.join(root, "node_modules", "vite", "bin", "vite.js"), "--host", "127.0.0.1", "--port", port], {
  cwd: root,
  detached: true,
  stdio: ["ignore", out, err],
  windowsHide: true
});
fs.writeFileSync(path.join(root, ".vite-dev.pid"), String(child.pid));
child.unref();
console.log(child.pid);
