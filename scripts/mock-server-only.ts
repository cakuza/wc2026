
import Module from "module";
import fs from "fs";
import path from "path";

const originalRequire = (Module as any).prototype.require;
(Module as any).prototype.require = function (id: string) {
  if (id === "server-only") return {};
  return originalRequire.apply(this, arguments);
};

const cacheSource = fs.readFileSync(path.join(process.cwd(), "lib", "kickoffApiCache.ts"), "utf8");
if (!cacheSource.includes("import \"server-only\"")) throw new Error("Missing server-only guard in kickoffApiCache.ts");

const clientSource = fs.readFileSync(path.join(process.cwd(), "lib", "kickoffApiClient.ts"), "utf8");
if (!clientSource.includes("import \"server-only\"")) throw new Error("Missing server-only guard in kickoffApiClient.ts");

const adapterSource = fs.readFileSync(path.join(process.cwd(), "lib", "kickoffScorerAdapter.ts"), "utf8");
if (!adapterSource.includes("import \"server-only\"")) throw new Error("Missing server-only guard in kickoffScorerAdapter.ts");

