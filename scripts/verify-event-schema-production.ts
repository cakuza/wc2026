import https from "https";
import http from "http";
import assert from "assert";

function fetchBuffer(urlStr: string): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const lib = urlStr.startsWith("https") ? https : http;
    lib.get(urlStr, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith("http")
          ? res.headers.location
          : new URL(res.headers.location, urlStr).toString();
        return fetchBuffer(redirectUrl).then(resolve).catch(reject);
      }
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      res.on("end", () => resolve({ status: res.statusCode ?? 500, headers: res.headers, body: Buffer.concat(chunks) }));
    }).on("error", reject);
  });
}

async function fetchText(urlStr: string): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  const res = await fetchBuffer(urlStr);
  return { status: res.status, headers: res.headers, body: res.body.toString("utf-8") };
}

function parseJsonLdSportsEvents(html: string): any[] {
  const matches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi) || [];
  const events: any[] = [];
  for (const scriptTag of matches) {
    const raw = scriptTag.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "").trim();
    try {
      const parsed = JSON.parse(raw);
      if (parsed["@type"] === "SportsEvent") {
        events.push(parsed);
      }
    } catch (e) {}
  }
  return events;
}

function parsePngDimensions(buf: Buffer): { width: number; height: number } {
  // Check PNG signature
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length >= 24 && buf.subarray(0, 8).equals(pngHeader)) {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    return { width, height };
  }
  throw new Error("Invalid or unsupported PNG header format");
}

async function runProductionVerifier() {
  const targetBase = (process.argv[2] || "https://www.worldcupmatchday.com").replace(/\/$/, "");
  console.log(`=== EVENT SCHEMA PRODUCTION VERIFIER ===`);
  console.log(`Target: ${targetBase}\n`);

  let passed = 0;
  let failed = 0;

  function testAssert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  PASS  ${msg}`);
      passed++;
    } else {
      console.error(`  FAIL  ${msg}`);
      failed++;
    }
  }

  // ── 1. Estadio Akron Match Verification ──────────────────────────────────
  console.log("Checking Estadio Akron fixture: /matches/south-korea-vs-czechia-jun11");
  const akronUrl = `${targetBase}/matches/south-korea-vs-czechia-jun11`;
  const akronRes = await fetchText(akronUrl);
  testAssert(akronRes.status === 200, `Akron fixture returns HTTP 200 (got ${akronRes.status})`);

  const akronEvents = parseJsonLdSportsEvents(akronRes.body);
  testAssert(akronEvents.length === 1, `Contains exactly 1 SportsEvent JSON-LD schema (found ${akronEvents.length})`);

  if (akronEvents.length > 0) {
    const se = akronEvents[0];
    const addr = se.location?.address;
    testAssert(addr?.postalCode === "45019", `Estadio Akron postalCode is '45019' (got '${addr?.postalCode}')`);
    testAssert(
      typeof addr?.streetAddress === "string" && addr.streetAddress.includes("Av. Circuito JVC 2800"),
      `Estadio Akron streetAddress contains 'Av. Circuito JVC 2800' (got '${addr?.streetAddress}')`
    );
    testAssert(addr?.addressLocality === "Zapopan", `Estadio Akron locality is 'Zapopan' (got '${addr?.addressLocality}')`);
    testAssert(addr?.addressRegion === "Jalisco", `Estadio Akron region is 'Jalisco' (got '${addr?.addressRegion}')`);
    testAssert(addr?.addressCountry === "MX", `Estadio Akron country is 'MX' (got '${addr?.addressCountry}')`);
    testAssert(
      se.organizer?.url === "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/",
      `FIFA organizer URL is canonical (got '${se.organizer?.url}')`
    );
  }

  // ── 2. Match 104 (Final) Verification ──────────────────────────────────────
  console.log("\nChecking Match 104 (Final): /matches/match-104");
  const m104Url = `${targetBase}/matches/match-104`;
  const m104Res = await fetchText(m104Url);
  testAssert(m104Res.status === 200, `Match 104 returns HTTP 200 (got ${m104Res.status})`);

  const m104Events = parseJsonLdSportsEvents(m104Res.body);
  testAssert(m104Events.length === 1, `Match 104 contains exactly 1 SportsEvent JSON-LD schema (found ${m104Events.length})`);

  if (m104Events.length > 0) {
    const se = m104Events[0];
    testAssert(
      se.name === "Spain 1–0 Argentina — 2026 FIFA World Cup Final",
      `Match 104 SportsEvent name is 'Spain 1–0 Argentina — 2026 FIFA World Cup Final' (got '${se.name}')`
    );
    testAssert(
      typeof se.description === "string" && se.description.includes("Spain defeated Argentina 1–0 after extra time"),
      `Match 104 SportsEvent description contains 'Spain defeated Argentina 1–0 after extra time' (got '${se.description}')`
    );
    testAssert(se.homeTeam?.name === "Spain", `Match 104 homeTeam is 'Spain' (got '${se.homeTeam?.name}')`);
    testAssert(se.awayTeam?.name === "Argentina", `Match 104 awayTeam is 'Argentina' (got '${se.awayTeam?.name}')`);
    testAssert(
      typeof se.location?.name === "string" &&
        (se.location.name.includes("MetLife Stadium") || se.location.name.includes("New York New Jersey Stadium")),
      `Match 104 location name contains MetLife / New York New Jersey Stadium (got '${se.location?.name}')`
    );
  }

  const m104Html = m104Res.body;
  testAssert(
    m104Html.includes("Spain 1–0 Argentina") || m104Html.includes("Spain 1 - 0 Argentina") || m104Html.includes("Spain 1-0 Argentina"),
    `Match 104 visible HTML contains completed score 1-0`
  );
  testAssert(
    m104Html.includes("AET") || m104Html.includes("After extra time") || m104Html.includes("After Extra Time"),
    `Match 104 visible HTML contains AET status`
  );
  testAssert(
    (m104Html.includes("Torres") || m104Html.includes("Ferran Torres")) && m104Html.includes("106"),
    `Match 104 visible HTML contains Ferran Torres 106' goal`
  );

  // ── 3. Match 103 (Third-place Match) Verification ──────────────────────────
  console.log("\nChecking Match 103 (Third place): /matches/match-103");
  const m103Url = `${targetBase}/matches/match-103`;
  const m103Res = await fetchText(m103Url);
  testAssert(m103Res.status === 200, `Match 103 returns HTTP 200 (got ${m103Res.status})`);

  const m103Events = parseJsonLdSportsEvents(m103Res.body);
  testAssert(m103Events.length === 1, `Match 103 contains exactly 1 SportsEvent JSON-LD schema (found ${m103Events.length})`);

  if (m103Events.length > 0) {
    const se = m103Events[0];
    testAssert(
      se.name === "France 4–6 England — 2026 FIFA World Cup Third-place Match",
      `Match 103 SportsEvent name is 'France 4–6 England — 2026 FIFA World Cup Third-place Match' (got '${se.name}')`
    );
    testAssert(
      typeof se.description === "string" && se.description.includes("England defeated France 6–4"),
      `Match 103 SportsEvent description contains 'England defeated France 6–4' (got '${se.description}')`
    );
    testAssert(se.homeTeam?.name === "France", `Match 103 homeTeam is 'France' (got '${se.homeTeam?.name}')`);
    testAssert(se.awayTeam?.name === "England", `Match 103 awayTeam is 'England' (got '${se.awayTeam?.name}')`);
    testAssert(
      typeof se.location?.name === "string" && se.location.name.includes("Hard Rock Stadium"),
      `Match 103 location name contains Hard Rock Stadium (got '${se.location?.name}')`
    );
  }

  const m103Html = m103Res.body;
  testAssert(
    m103Html.includes("France 4–6 England") || m103Html.includes("France 4-6 England") || m103Html.includes("4–6") || m103Html.includes("6–4"),
    `Match 103 visible HTML contains completed score 4-6`
  );
  testAssert(
    m103Html.includes("FT") || m103Html.includes("Full time") || m103Html.includes("Full Time") || m103Html.includes("Full-time") || m103Html.includes("Finished") || m103Html.includes("FINISHED"),
    `Match 103 visible HTML contains FT / Full time status`
  );

  // ── 4. OpenGraph Image Verification ────────────────────────────────────────
  console.log("\nChecking Match 104 OpenGraph Image: /matches/match-104/opengraph-image");
  const ogUrl = `${targetBase}/matches/match-104/opengraph-image`;
  const ogRes = await fetchBuffer(ogUrl);
  testAssert(ogRes.status === 200, `Match 104 OG Image returns HTTP 200 (got ${ogRes.status})`);

  const contentType = (ogRes.headers["content-type"] || "").toLowerCase();
  testAssert(
    contentType.includes("image/png") || contentType.includes("image/jpeg") || contentType === "" || contentType.includes("octet-stream"),
    `Match 104 OG Image has supported MIME type (got '${contentType}')`
  );
  testAssert(ogRes.body.length > 0, `Match 104 OG Image body is non-empty (${ogRes.body.length} bytes)`);

  try {
    const dims = parsePngDimensions(ogRes.body);
    testAssert(dims.width === 1200 && dims.height === 630, `Match 104 OG Image dimensions are 1200x630 (got ${dims.width}x${dims.height})`);
  } catch (err: any) {
    testAssert(false, `Match 104 OG Image dimension parsing failed: ${err.message}`);
  }

  console.log(`\n==========================================================`);
  console.log(`Production Verifier Summary: ${passed} passed, ${failed} failed.`);
  console.log(`==========================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runProductionVerifier().catch((err) => {
  console.error("Fatal verifier failure:", err);
  process.exit(1);
});
