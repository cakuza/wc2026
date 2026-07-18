import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
if (!existsSync("out")) throw new Error("out/ is required; run npm run build:p0 first");
const server = spawn(process.execPath, ["scripts/serve-static-export.mjs"], { stdio: ["ignore", "pipe", "pipe"] });
let logs = "";
server.stdout.on("data", d => { logs += d; process.stdout.write(d); });
server.stderr.on("data", d => { logs += d; process.stderr.write(d); });
const stop = () => { if (!server.killed) server.kill("SIGTERM"); };
try {
  const deadline = Date.now() + 15000;
  let ready = false;
  while (Date.now() < deadline) { try { if ((await fetch("http://127.0.0.1:4173/")).ok) { ready = true; break; } } catch {} await new Promise(r => setTimeout(r, 200)); }
  if (!ready) throw new Error(`Static export server readiness failed\n${logs}`);
  const qa = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["exec", "tsx", "scripts/test-final-browser-qa.ts"], { stdio: "inherit", shell: process.platform === "win32", env: { ...process.env, BROWSER_QA_BASE_URL: "http://127.0.0.1:4173" } });
  const code = await new Promise(resolve => qa.on("exit", c => resolve(c ?? 1)));
  if (code) { console.error(logs); process.exitCode = code; }
} finally {
  stop();
  await new Promise(resolve => server.once("exit", resolve));
  console.log("Static export server terminated");
}
