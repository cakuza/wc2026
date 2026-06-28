/**
 * Pure deterministic secondary-provider readiness validator.
 *
 * Separated from the live HTTP wrapper so it can be unit-tested offline with
 * fixture payloads.  Import this from both the live readiness gate and the
 * deterministic test suite.
 *
 * Rules enforced
 * ──────────────
 * 1. Total payload count ≥ HIGH_THRESHOLD (65 / 90 % of 72).
 * 2. All 72 canonical tournament matches are mappable from the payload.
 *    If ≤ 7 are unmapped this is a warning; > 7 is an error.
 * 3. Every completed match (caller-supplied set) must be present — 100 %.
 * 4. No duplicate records for the same fixture.
 * 5. Every finished match with a non-zero scoreline must supply scorer arrays.
 * 6. Scorer event arrays must not be malformed (non-array values rejected).
 * 7. Known scorer matches (Mexico–South Africa, South Korea–Czechia) must
 *    have the expected final score and minimum scorer-event counts.
 * 8. Scorer events for known matches must have valid structure (playerName
 *    present and non-empty; minute is number or null).
 * 9. Required knockout matches (requiredKnockoutSlugs) must be present in the
 *    provider payload — looked up by resolved home/away team names.
 */

import { MATCHES, matchSlug } from "./matches";
import { countryName } from "./i18n";
import type { WorldCup26Game, GoalScorerEvent } from "./worldcup26Provider";

// ── Name normalisation (mirrors liveSnapshot.ts, kept local to avoid circular dep) ──

const TEAM_NAME_ALIASES: Record<string, string> = {
  czechrepublic:                "czechia",
  bosniaandherzegovina:         "bosniaherzegovina",
  cotedivoire:                  "ivorycoast",
  capeverdeislands:             "capeverde",
  democraticrepublicofthecongo: "drcongo",
  congodr:                      "drcongo",
  korearepublic:                "southkorea",
};

export function normalizeForMatching(name: string): string {
  const norm = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return TEAM_NAME_ALIASES[norm] ?? norm;
}

// ── Constants ────────────────────────────────────────────────────────────────

/** 90 % of 72.  Provider must supply at least this many parseable records. */
export const HIGH_THRESHOLD = 65;

/** Maximum unmapped canonical fixtures before the run is an error (not a warning). */
const MAX_UNMAPPED_WARNING = 7;

/** Known completed matches with verified scores and minimum scorer counts. */
export const KNOWN_SCORER_REQUIREMENTS: ReadonlyArray<{
  readonly homeKey:        string;
  readonly awayKey:        string;
  readonly homeGoals:      number;
  readonly awayGoals:      number;
  readonly minHomeScorers: number;
  readonly minAwayScorers: number;
}> = [
  { homeKey: "mexico",     awayKey: "southAfrica", homeGoals: 2, awayGoals: 0, minHomeScorers: 1, minAwayScorers: 0 },
  { homeKey: "southKorea", awayKey: "czechia",     homeGoals: 2, awayGoals: 1, minHomeScorers: 1, minAwayScorers: 1 },
];

// ── Result type ───────────────────────────────────────────────────────────────

export type ReadinessResult = {
  ok:           boolean;
  errors:       string[];
  warnings:     string[];
  mappedCount:  number;
  totalCanonical: number;
};

// ── Provider readiness window helper ─────────────────────────────────────────

/**
 * Returns the set of knockout match slugs that should currently have provider
 * coverage, based on a rolling date window.
 *
 * A knockout match is in the provider readiness window when:
 *   1. Its participants are resolved (homeKey !== "tbd" and awayKey !== "tbd"
 *      in the MATCHES array, OR its matchNumber appears in resolvedMatchNumbers).
 *   2. Its date falls within (referenceDate - 7 days) to (referenceDate + 2 days).
 *
 * @param referenceDate       ISO date string (YYYY-MM-DD) for today's date.
 * @param resolvedMatchNumbers Set of knockout matchNumbers whose participants
 *                            are known to be resolved (e.g. from a live snapshot
 *                            or a RESOLVED_PARTICIPANTS record). Pass an empty
 *                            Set when no external resolution data is available —
 *                            the function will still pick up statically resolved
 *                            slots (homeKey !== "tbd").
 */
export function knockoutSlugsInProviderWindow(
  referenceDate: string,
  resolvedMatchNumbers: Set<number> = new Set(),
): Set<string> {
  const windowStart = dateAddDays(referenceDate, -7);
  const windowEnd   = dateAddDays(referenceDate, +2);

  const slugs = new Set<string>();

  for (const match of MATCHES) {
    // Only knockout matches are candidates.
    if (!("stage" in match) || match.stage === "group" || match.stage === undefined) continue;

    const m = match as Extract<typeof match, { stage: string; matchNumber: number }>;

    // Check participant resolution: either statically resolved in MATCHES data
    // or explicitly flagged by the caller.
    const participantsResolved =
      (m.homeKey !== "tbd" && m.awayKey !== "tbd") ||
      resolvedMatchNumbers.has(m.matchNumber);

    if (!participantsResolved) continue;

    // Check date window.
    if (m.date < windowStart || m.date > windowEnd) continue;

    slugs.add(matchSlug(m));
  }

  return slugs;
}

/** Add (or subtract) days from an ISO date string (YYYY-MM-DD). */
function dateAddDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Validator ─────────────────────────────────────────────────────────────────

/**
 * Validate a raw WorldCup26Game[] payload against the canonical fixture list.
 *
 * @param games                  Payload returned by the secondary provider.
 * @param completedSlugs         Set of matchSlug strings for matches that are
 *                               known to be completed (provider must include 100%).
 * @param requiredKnockoutSlugs  Optional set of knockout match slugs that MUST
 *                               be present in the provider payload. These bypass
 *                               the "tbd" exclusion — the caller is asserting
 *                               that participants are resolved and provider
 *                               coverage is required. Lookup is done by resolved
 *                               home/away team names via countryName().
 */
export function validateProviderPayload(
  games: WorldCup26Game[],
  completedSlugs: Set<string>,
  requiredKnockoutSlugs?: Set<string>,
): ReadinessResult {
  const errors:   string[] = [];
  const warnings: string[] = [];

  // worldcup26.ir is the secondary enrichment provider for group-stage matches.
  // Knockout matches use "tbd" participant keys until group stage resolves; they
  // cannot be matched against provider team names and are validated structurally
  // elsewhere. All provider payload checks here are scoped to the 72 group matches.
  const canonicalMatches = MATCHES.filter(
    (m) => !("stage" in m) || m.stage === "group" || m.stage === undefined,
  );
  const totalCanonical   = canonicalMatches.length; // 72

  // ── 1. Build lookup: normalised key → list of games (detect duplicates) ──

  const gamesByKey = new Map<string, WorldCup26Game[]>();
  for (const game of games) {
    const k = `${normalizeForMatching(game.homeTeamName)}|${normalizeForMatching(game.awayTeamName)}`;
    if (!gamesByKey.has(k)) gamesByKey.set(k, []);
    gamesByKey.get(k)!.push(game);
  }

  // ── 2. Duplicate detection ────────────────────────────────────────────────

  for (const [key, dupes] of gamesByKey) {
    if (dupes.length > 1) {
      errors.push(`Duplicate provider records for fixture key "${key}": ${dupes.length} entries`);
    }
  }

  // ── 3. Map canonical group matches → provider ─────────────────────────────

  const mapped   = new Set<string>();
  const gameForSlug = new Map<string, WorldCup26Game>();

  for (const match of canonicalMatches) {
    const slug      = matchSlug(match);
    const homeDisp  = countryName(match.homeKey, "en");
    const awayDisp  = countryName(match.awayKey, "en");
    const lookupKey = `${normalizeForMatching(homeDisp)}|${normalizeForMatching(awayDisp)}`;
    const candidates = gamesByKey.get(lookupKey);
    if (candidates && candidates.length >= 1) {
      mapped.add(slug);
      gameForSlug.set(slug, candidates[0]);
    }
  }

  const mappedCount  = mapped.size;
  const unmappedCount = totalCanonical - mappedCount;

  // ── 4. Total payload count ────────────────────────────────────────────────

  if (games.length < HIGH_THRESHOLD) {
    errors.push(
      `Payload too small: ${games.length} records (need ≥${HIGH_THRESHOLD} of ${totalCanonical})`,
    );
  }

  // ── 5. Canonical group-match coverage ────────────────────────────────────

  if (unmappedCount > MAX_UNMAPPED_WARNING) {
    errors.push(
      `Coverage too low: ${mappedCount}/${totalCanonical} canonical matches mapped (${unmappedCount} unmapped exceeds allowed tolerance of ${MAX_UNMAPPED_WARNING})`,
    );
  } else if (unmappedCount > 0) {
    warnings.push(
      `${unmappedCount} canonical fixture(s) not found in provider payload (within tolerance)`,
    );
  }

  // ── 6. Completed-match 100 % coverage ────────────────────────────────────

  for (const slug of completedSlugs) {
    if (!mapped.has(slug)) {
      errors.push(`Required completed match missing from provider: ${slug}`);
    }
  }

  // ── 7. Required knockout coverage ────────────────────────────────────────
  //
  // When the caller supplies requiredKnockoutSlugs, each of those matches MUST
  // appear in the provider payload. We look them up by their resolved team names
  // (countryName() on the homeKey/awayKey, which must be non-"tbd" for the
  // slug to belong in this set).

  if (requiredKnockoutSlugs && requiredKnockoutSlugs.size > 0) {
    // Build a reverse lookup: slug → match (for all knockout matches in MATCHES).
    const knockoutMatchBySlug = new Map(
      MATCHES
        .filter((m) => "stage" in m && m.stage !== "group" && m.stage !== undefined)
        .map((m) => [matchSlug(m), m]),
    );

    for (const slug of requiredKnockoutSlugs) {
      const match = knockoutMatchBySlug.get(slug);
      if (!match || match.homeKey === "tbd" || match.awayKey === "tbd") {
        // Participants not actually resolved in static data — skip with warning.
        warnings.push(`Knockout slug ${slug} in requiredKnockoutSlugs but participants are not resolved in MATCHES`);
        continue;
      }

      const homeDisp  = countryName(match.homeKey, "en");
      const awayDisp  = countryName(match.awayKey, "en");
      const lookupKey = `${normalizeForMatching(homeDisp)}|${normalizeForMatching(awayDisp)}`;
      const candidates = gamesByKey.get(lookupKey);

      if (!candidates || candidates.length === 0) {
        errors.push(`Required knockout match missing from provider payload: ${slug} (${homeDisp} vs ${awayDisp})`);
      } else {
        // Also record in gameForSlug so scorer checks below can use it.
        if (!gameForSlug.has(slug)) {
          gameForSlug.set(slug, candidates[0]);
        }
      }
    }
  }

  // ── 8. Malformed scorer arrays + suspicious empty events ─────────────────

  for (const slug of completedSlugs) {
    const game = gameForSlug.get(slug);
    if (!game) continue; // already flagged in step 6

    if (!Array.isArray(game.homeScorers) || !Array.isArray(game.awayScorers)) {
      errors.push(`${slug}: malformed scorer arrays (not Array)`);
      continue;
    }

    const hasGoals = (game.homeScore ?? 0) > 0 || (game.awayScore ?? 0) > 0;
    if (
      game.finished &&
      hasGoals &&
      game.homeScorers.length === 0 &&
      game.awayScorers.length === 0
    ) {
      errors.push(
        `${slug}: finished ${game.homeScore}–${game.awayScore} but has zero scorer events`,
      );
    }
  }

  // ── 9. Known-scorer match validation ─────────────────────────────────────

  for (const req of KNOWN_SCORER_REQUIREMENTS) {
    const match = canonicalMatches.find(
      (m) => m.homeKey === req.homeKey && m.awayKey === req.awayKey,
    );
    if (!match) continue; // should never happen with correct MATCHES data

    const slug = matchSlug(match);
    const homeDisp = countryName(match.homeKey, "en");
    const awayDisp = countryName(match.awayKey, "en");
    const label    = `${homeDisp} vs ${awayDisp}`;
    const game     = gameForSlug.get(slug);

    if (!game) {
      errors.push(`Known scorer match not in provider payload: ${label}`);
      continue;
    }

    if (!game.finished) {
      warnings.push(`${label} not yet marked finished by provider`);
      continue;
    }

    if (game.homeScore !== req.homeGoals || game.awayScore !== req.awayGoals) {
      errors.push(
        `${label}: score mismatch — provider ${game.homeScore}–${game.awayScore}, ` +
        `expected ${req.homeGoals}–${req.awayGoals}`,
      );
    }

    if (!Array.isArray(game.homeScorers) || !Array.isArray(game.awayScorers)) {
      errors.push(`${label}: scorer arrays are malformed (not Array)`);
      continue;
    }

    if (game.homeScorers.length < req.minHomeScorers) {
      errors.push(
        `${label}: home scorers insufficient — ${game.homeScorers.length} found, ` +
        `need ≥${req.minHomeScorers}`,
      );
    }
    if (game.awayScorers.length < req.minAwayScorers) {
      errors.push(
        `${label}: away scorers insufficient — ${game.awayScorers.length} found, ` +
        `need ≥${req.minAwayScorers}`,
      );
    }

    for (const scorer of [...game.homeScorers, ...game.awayScorers] as GoalScorerEvent[]) {
      if (typeof scorer.playerName !== "string" || scorer.playerName.trim() === "") {
        errors.push(`${label}: scorer event is missing a valid playerName`);
      }
      if (scorer.minute !== null && typeof scorer.minute !== "number") {
        errors.push(`${label}: scorer.minute has unexpected type ${typeof scorer.minute}`);
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings, mappedCount, totalCanonical };
}

/**
 * Derive the set of completed match slugs from the canonical MATCHES list
 * by comparing each match's date against a reference date string (YYYY-MM-DD).
 * Matches strictly before `referenceDateStr` are considered completed.
 */
export function completedSlugsBefore(referenceDateStr: string): Set<string> {
  const slugs = new Set<string>();
  for (const match of MATCHES) {
    if (match.date < referenceDateStr) {
      slugs.add(matchSlug(match));
    }
  }
  return slugs;
}
