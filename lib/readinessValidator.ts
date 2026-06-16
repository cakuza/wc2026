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

// ── Validator ─────────────────────────────────────────────────────────────────

/**
 * Validate a raw WorldCup26Game[] payload against the canonical fixture list.
 *
 * @param games              Payload returned by the secondary provider.
 * @param completedSlugs     Set of matchSlug strings for matches that are
 *                           known to be completed (provider must include 100%).
 */
export function validateProviderPayload(
  games: WorldCup26Game[],
  completedSlugs: Set<string>,
): ReadinessResult {
  const errors:   string[] = [];
  const warnings: string[] = [];

  const canonicalMatches = MATCHES;
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

  // ── 3. Map canonical → provider ──────────────────────────────────────────

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

  // ── 5. Canonical coverage ─────────────────────────────────────────────────

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

  // ── 7. Malformed scorer arrays + suspicious empty events ─────────────────

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

  // ── 8. Known-scorer match validation ─────────────────────────────────────

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
