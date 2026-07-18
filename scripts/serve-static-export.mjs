import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".woff2": "font/woff2" };
async function candidate(url) {
  const name = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const safe = path.resolve(root, `.${name}`);
  if (!safe.startsWith(root + path.sep) && safe !== root) return null;
  for (const file of [name === "/" ? path.join(root, "index.html") : `${safe}.html`, path.join(safe, "index.html"), safe]) { try { if ((await stat(file)).isFile()) return file; } catch {} }
  return null;
}
const server = http.createServer(async (req, res) => {
  try {
    const file = await candidate(req.url || "/");
    if (!file) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
    res.end(await readFile(file));
  } catch (error) { res.writeHead(500); res.end("Server error"); console.error(error); }
});
server.once("error", (error) => { console.error(error); process.exit(1); });
server.listen(port, "127.0.0.1", () => console.log(`STATIC_EXPORT_READY http://127.0.0.1:${port}`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
