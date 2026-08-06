import { spawn } from "node:child_process";
import { once } from "node:events";

const server = spawn(process.execPath, ["tests/serve-static.mjs"], {
  cwd: process.cwd(),
  stdio: "inherit",
  windowsHide: true,
});

async function waitForServer() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Static test server exited with code ${server.exitCode}`);
    try {
      const response = await fetch("http://127.0.0.1:3000/");
      if (response.ok) return;
    } catch {
      // The server has not opened its listening socket yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Static test server did not become ready within 10 seconds");
}

async function stopServer() {
  if (server.exitCode !== null) return;
  server.kill();
  await Promise.race([
    once(server, "exit"),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);
}

let exitCode = 1;
try {
  await waitForServer();
  const playwright = spawn(
    process.execPath,
    ["node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)],
    { cwd: process.cwd(), stdio: "inherit", windowsHide: true },
  );
  const [code] = await once(playwright, "exit");
  exitCode = typeof code === "number" ? code : 1;
} finally {
  await stopServer();
}

process.exitCode = exitCode;
