const path = require("node:path");
const { spawn } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const host = "127.0.0.1";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 15000) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(250);
  }

  throw new Error(`Timed out waiting for ${url}: ${lastError?.message || "no response"}`);
}

function startVite({ port = process.env.SMOKE_PORT || "4174" } = {}) {
  const viteBin = path.join(root, "node_modules", "vite", "bin", "vite.js");
  const server = spawn(process.execPath, [viteBin, "--host", host, "--port", String(port), "--strictPort"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  server.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });
  server.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      process.stderr.write(output);
    }
  });

  return {
    baseUrl: `http://${host}:${port}/`,
    getOutput: () => output,
    server
  };
}

async function withPage(chromium, callback, options = {}) {
  const { baseUrl, getOutput, server } = startVite(options);
  let browser;

  try {
    await waitForServer(baseUrl);
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: options.viewport || { width: 1280, height: 900 } });
    const pageErrors = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        pageErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await callback({ baseUrl, page, pageErrors });
  } catch (error) {
    process.stderr.write(getOutput());
    throw error;
  } finally {
    await browser?.close();
    server.kill();
  }
}

module.exports = {
  startVite,
  waitForServer,
  withPage
};
