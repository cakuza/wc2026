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
  type: "GOAL" | "PENALTY_GOAL";
  minute: number | null;
  stoppageTime?: number | null;
  minuteLabel?: string;
  teamName: string;
  playerTeamName?: string;
  playerName: string;
  isOwnGoal?: boolean;
  isPenalty?: boolean;
  provider: "worldcup26.ir" | "football-data.org";
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

// Matches scorer strings like "J. Quinones 9'", "Lamine Yamal 31",
// "F. Balogun 45'+5'", "D. Bobadilla 7'(OG)" and "Breel Embolo 17' (p)".
const SCORER_RE = /^(.+?)\s+(\d+)'?(?:\+(\d+)'?)?(?:\s*\((OG|P|PEN|PENALTY)\))?$/i;
const OWN_GOAL_RE = /\(OG\)\s*$/i;
const PENALTY_GOAL_RE = /\((P|PEN|PENALTY)\)\s*$/i;

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
    const minute = parseInt(m[2], 10);
    const stoppageTime = m[3] ? parseInt(m[3], 10) : null;
    const isOwnGoal = OWN_GOAL_RE.test(str);
    const isPenalty = PENALTY_GOAL_RE.test(str);
    return {
      type: isPenalty ? "PENALTY_GOAL" : "GOAL",
      minute,
      stoppageTime,
      minuteLabel: `${minute}${stoppageTime ? `+${stoppageTime}` : ""}'`,
      teamName,
      playerName: m[1].trim(),
      isOwnGoal,
      isPenalty,
      playerTeamName: isOwnGoal ? undefined : teamName,
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

let bulkPromise: Promise<WorldCup26Game[]> | null = null;

/**
 * Fetch all games from worldcup26.ir. Throws an error on failure to ensure
 * Next.js unstable_cache or caller can properly handle the Last-Known-Good state.
 * Deduplicated per Node process tick so N concurrent cache-misses trigger exactly 1 request.
 */
export async function fetchWorldCup26Games(): Promise<WorldCup26Game[]> {
  if (bulkPromise) return bulkPromise;
  bulkPromise = fetchWorldCup26GamesInternal().finally(() => {
    bulkPromise = null;
  });
  return bulkPromise;
}

async function fetchWorldCup26GamesInternal(): Promise<WorldCup26Game[]> {
  // ── Deterministic test seam ───────────────────────────────────────────────
  if (process.env.WORLDCUP26_FORCE_FAIL === "1") {
    throw new Error("worldcup26: forced failure (WORLDCUP26_FORCE_FAIL=1)");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`worldcup26: HTTP ${res.status} from ${ENDPOINT}`);
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

    return parsed;
  } catch (err) {
    clearTimeout(timer);
    throw err;
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
  try {
    const games = await fetchWorldCup26Games();
    const normalize = (s: string) => s.toLowerCase().trim();
    const game = games.find(
      (g) =>
        normalize(g.homeTeamName) === normalize(homeTeamNameEn) &&
        normalize(g.awayTeamName) === normalize(awayTeamNameEn),
    );

    if (!game) return null;
    if (game.homeScorers.length === 0 && game.awayScorers.length === 0) return null;

    return { homeScorers: game.homeScorers, awayScorers: game.awayScorers };
  } catch (err) {
    return null;
  }
}
