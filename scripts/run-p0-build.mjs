import { spawn } from "node:child_process";

const prior = process.env.NODE_OPTIONS || "";
const heap = "--max-old-space-size=8192";
const env = { ...process.env, NODE_OPTIONS: prior.includes(heap) ? prior : `${prior} ${heap}`.trim() };
const isWindows = process.platform === "win32";
const child = spawn(
  isWindows ? (process.env.ComSpec || "cmd.exe") : "npm",
  isWindows ? ["/d", "/s", "/c", "npm.cmd run build"] : ["run", "build"],
  { stdio: "inherit", env },
);
child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  if (signal) console.error(`build terminated by ${signal}`);
  process.exitCode = code ?? 1;
});
