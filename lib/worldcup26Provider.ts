/**
 * Secondary scorer enrichment from worldcup26.ir (free, no API key).
 *
 * IMPORTANT RULES:
 * - This is SECONDARY ONLY. football-data.org remains primary for score/status/standings.
 * - Only provides parsed goal scorer events. No substitutions, cards, lineups, xG, etc.
 * - If this provider fails, calling code falls back to the honest "scorer data unavailable" state.
 * - Do not invent data -- if a scorer string can't be parsed confidently, it is omitted.
 * - Scores and standings are NOT taken from this source.
 */

const ENDPOINT = "https://worldcup26.ir/get/games";
const TIMEOUT_MS = 8_000;

export type GoalScorerEvent = {
  type: "GOAL";
  minute: number | null;
  teamName: string;
  playerName: string;
  provider: "worldcup26.ir";
  confidence: "high" | "low";
};

export type WorldCup26Game = {
  providerGameId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
  finished: boolean;
  homeScorers: GoalScorerEvent[];
  awayScorers: GoalScorerEvent[];
  localDate: string | null;
};

// Matches scorer strings like: "J. Quinones 9'" or "R. Jimenez 67'" or "Lamine Yamal 31"
// Also handles stoppage time: "L. Messi 90+3'"
const SCORER_RE = /^(.+?)\s+(\d+)(?:\+\d+)?'?$/;

/**
 * worldcup26.ir serializes scorer arrays with Unicode smart quotes U+201C / U+201D.
 * Observed format: { U+201C name1 U+201D , U+201D name2 U+201D }
 * The inter-item separator is U+201D , U+201D (right + comma + right).
 */
function parsePhpSet(raw: string): string[] {
  const trimmed = raw.trim();
  if (trimmed === "null" || trimmed === "" || trimmed === "{}") return [];

  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return [];
  const inner = trimmed.slice(1, -1).trim();
  if (!inner) return [];

  // U+201C = left double quotation mark, U+201D = right double quotation mark
  const RQUOTE = "”";
  const LQUOTE = "“";

  if (inner.includes(RQUOTE) || inner.includes(LQUOTE)) {
    // Separator between items is: RQUOTE + "," + RQUOTE
    const parts = inner.split(`${RQUOTE},${RQUOTE}`);
    return parts
      .map((p) => p.replace(/^[“”]|[“”]$/g, "").trim())
      .filter(Boolean);
  }

  // Fallback: plain ASCII double-quote comma-separated values
  const parts = inner.split('","');
  return parts.map((p) => p.replace(/^"|"$/g, "").trim()).filter(Boolean);
}

function parseScorerString(raw: string, teamName: string): GoalScorerEvent | null {
  const str = raw.trim();
  if (!str) return null;
  const m = SCORER_RE.exec(str);
  if (m) {
    return {
      type: "GOAL",
      minute: parseInt(m[2], 10),
      teamName,
      playerName: m[1].trim(),
      provider: "worldcup26.ir",
      confidence: "high",
    };
  }
  return {
    type: "GOAL",
    minute: null,
    teamName,
    playerName: str,
    provider: "worldcup26.ir",
    confidence: "low",
  };
}

function parseScorers(rawField: unknown, teamName: string): GoalScorerEvent[] {
  if (typeof rawField !== "string") return [];
  const strings = parsePhpSet(rawField);
  return strings
    .map((s) => parseScorerString(s, teamName))
    .filter((g): g is GoalScorerEvent => g !== null && g.confidence === "high");
}

function parseScore(raw: unknown): number | null {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const n = parseInt(raw, 10);
    return isNaN(n) ? null : n;
  }
  return null;
}

type RawGame = Record<string, unknown>;

function parseGame(raw: RawGame): WorldCup26Game | null {
  const homeTeamName = typeof raw.home_team_name_en === "string" ? raw.home_team_name_en : null;
  const awayTeamName = typeof raw.away_team_name_en === "string" ? raw.away_team_name_en : null;
  if (!homeTeamName || !awayTeamName) return null;

  const homeScore = parseScore(raw.home_score);
  const awayScore = parseScore(raw.away_score);
  const finished =
    raw.finished === "TRUE" ||
    raw.finished === true ||
    raw.time_elapsed === "finished";

  return {
    providerGameId: typeof raw.id === "string" ? raw.id : String(raw.id ?? ""),
    homeTeamName,
    awayTeamName,
    homeScore,
    awayScore,
    finished,
    homeScorers: parseScorers(raw.home_scorers, homeTeamName),
    awayScorers: parseScorers(raw.away_scorers, awayTeamName),
    localDate: typeof raw.local_date === "string" ? raw.local_date : null,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

let cachedGames: WorldCup26Game[] | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60_000; // 60s in-process cache

/**
 * Fetch all games from worldcup26.ir. Returns null on failure.
 * Uses a simple module-level cache to avoid hammering the endpoint.
 */
export async function fetchWorldCup26Games(): Promise<WorldCup26Game[] | null> {
  const now = Date.now();
  if (cachedGames && now < cacheExpiresAt) return cachedGames;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[worldcup26] HTTP ${res.status} from ${ENDPOINT}`);
      return null;
    }

    const raw = (await res.json()) as unknown;
    const list: unknown[] = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as Record<string, unknown>)?.games)
        ? ((raw as Record<string, unknown>).games as unknown[])
        : Array.isArray((raw as Record<string, unknown>)?.data)
          ? ((raw as Record<string, unknown>).data as unknown[])
          : [];

    const parsed = list
      .map((g) => parseGame(g as RawGame))
      .filter((g): g is WorldCup26Game => g !== null);

    cachedGames = parsed;
    cacheExpiresAt = now + CACHE_TTL_MS;
    return parsed;
  } catch (err) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[worldcup26] fetch error: ${msg}`);
    return null;
  }
}

/**
 * Look up scorer data for a specific match by home + away English team name.
 * Returns null if not found or provider is unavailable.
 */
export async function fetchScorersForMatch(
  homeTeamNameEn: string,
  awayTeamNameEn: string,
): Promise<{ homeScorers: GoalScorerEvent[]; awayScorers: GoalScorerEvent[] } | null> {
  const games = await fetchWorldCup26Games();
  if (!games) return null;

  const normalize = (s: string) => s.toLowerCase().trim();
  const game = games.find(
    (g) =>
      normalize(g.homeTeamName) === normalize(homeTeamNameEn) &&
      normalize(g.awayTeamName) === normalize(awayTeamNameEn),
  );

  if (!game) return null;
  if (game.homeScorers.length === 0 && game.awayScorers.length === 0) return null;

  return { homeScorers: game.homeScorers, awayScorers: game.awayScorers };
}

// ── Shared scorer-enrichment map (used by both /stats and match detail pages) ──

/**
 * Some teams are named differently by worldcup26.ir than by this site's i18n
 * display names. Map the provider's normalized name to this site's normalized
 * name so the two sources match up to the same internal fixture.
 */
const TEAM_NAME_ALIASES: Record<string, string> = {
  czechrepublic: "czechia",
  bosniaandherzegovina: "bosniaherzegovina",
  cotedivoire: "ivorycoast",
  capeverdeislands: "capeverde",
  democraticrepublicofthecongo: "drcongo",
  congodr: "drcongo",
  korearepublic: "southkorea",
};

function normalizeTeamName(name: string): string {
  const norm = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return TEAM_NAME_ALIASES[norm] ?? norm;
}

let cachedScorerMap: Map<string, GoalScorerEvent[]> | null = null;
let scorerMapExpiresAt = 0;

/**
 * Build a single source-of-truth map of worldcup26.ir scorer events keyed by
 * this site's internal match slug (e.g. "south-korea-vs-czechia-jun11").
 *
 * Both /stats and individual match pages must read from this map so they
 * never disagree about which matches have parsed scorer data.
 *
 * Team names on the returned events are mapped to this site's internal
 * display names (via countryName), not the provider's raw names.
 */
export async function getScorerEventsByInternalMatchId(): Promise<Map<string, GoalScorerEvent[]>> {
  const now = Date.now();
  if (cachedScorerMap && now < scorerMapExpiresAt) return cachedScorerMap;

  const result = new Map<string, GoalScorerEvent[]>();
  const games = await fetchWorldCup26Games();
  if (!games) return result;

  const { MATCHES, matchSlug } = await import("./matches");
  const { countryName } = await import("./i18n");

  for (const match of MATCHES) {
    const homeDisplay = countryName(match.homeKey, "en");
    const awayDisplay = countryName(match.awayKey, "en");
    const homeKey = normalizeTeamName(homeDisplay);
    const awayKey = normalizeTeamName(awayDisplay);

    const game = games.find((g) => {
      const gHome = normalizeTeamName(g.homeTeamName);
      const gAway = normalizeTeamName(g.awayTeamName);
      return gHome === homeKey && gAway === awayKey;
    });

    if (!game) continue;

    const homeEvents = game.homeScorers.map((e) => ({ ...e, teamName: homeDisplay }));
    const awayEvents = game.awayScorers.map((e) => ({ ...e, teamName: awayDisplay }));
    const events = [...homeEvents, ...awayEvents];
    if (events.length === 0) continue;

    result.set(
      matchSlug(match),
      events.sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999)),
    );
  }

  cachedScorerMap = result;
  scorerMapExpiresAt = now + CACHE_TTL_MS;
  return result;
}
