// Single source of truth for site navigation structure, shared by the Nav
// component and its deterministic tests. Pure data + a pure active-state
// helper — no React, no client APIs — so it can be unit-tested directly.

export type NavLink = {
  href: string;
  /** i18n key for the label (resolved via the language provider's t()). */
  key: string;
  /** Optional literal label override (e.g. desktop "Hub"). */
  label?: string;
};

// Desktop nav order: knockout bracket promoted alongside today/schedule.
export const DESKTOP_LINKS: NavLink[] = [
  { href: "/today", key: "nav_today" },
  { href: "/schedule", key: "nav_schedule" },
  { href: "/bracket", key: "nav_bracket" },
  { href: "/teams", key: "nav_teams" },
  { href: "/stats", key: "nav_stats" },
  { href: "/groups", key: "nav_groups" },
  { href: "/matchday-hub", key: "nav_matchdayHub", label: "Hub" },
];

// Mobile primary destinations — always visible, never behind the hamburger.
// Bracket replaces Groups (Groups moves to secondary drawer).
export const PRIMARY_LINKS: NavLink[] = [
  { href: "/today", key: "nav_today" },
  { href: "/schedule", key: "nav_schedule" },
  { href: "/bracket", key: "nav_bracket" },
  { href: "/teams", key: "nav_teams" },
];

// Hamburger drawer = secondary destinations only. Must not duplicate any
// PRIMARY_LINKS href (enforced by tests).
export const SECONDARY_LINKS: NavLink[] = [
  { href: "/groups", key: "nav_groups" },
  { href: "/stats", key: "nav_stats" },
  { href: "/world-cup-schedule-local-time", key: "nav_localTime" },
  { href: "/matchday-hub", key: "nav_matchdayHub" },
  { href: "/quiz", key: "nav_quiz" },
  { href: "/about", key: "nav_about" },
];

// ── Archive-mode navigation (tournament canonically complete) ──────────────
// Required post-completion priority: Archive, Results, Stats, Bracket,
// Teams, Groups. /today and /schedule stay reachable but move to the end of
// desktop nav / into the mobile secondary drawer so they no longer dominate.

export const ARCHIVE_DESKTOP_LINKS: NavLink[] = [
  { href: "/world-cup-2026", key: "nav_archive", label: "2026 Vault" },
  { href: "/world-cup-2026/results", key: "nav_results", label: "Results" },
  { href: "/stats", key: "nav_stats" },
  { href: "/bracket", key: "nav_bracket" },
  { href: "/teams", key: "nav_teams" },
  { href: "/groups", key: "nav_groups" },
  { href: "/today", key: "nav_today" },
  { href: "/schedule", key: "nav_schedule" },
];

export const ARCHIVE_PRIMARY_LINKS: NavLink[] = [
  { href: "/world-cup-2026", key: "nav_archive", label: "2026 Vault" },
  { href: "/world-cup-2026/results", key: "nav_results", label: "Results" },
  { href: "/stats", key: "nav_stats" },
  { href: "/bracket", key: "nav_bracket" },
];

export const ARCHIVE_SECONDARY_LINKS: NavLink[] = [
  { href: "/teams", key: "nav_teams" },
  { href: "/groups", key: "nav_groups" },
  { href: "/today", key: "nav_today" },
  { href: "/schedule", key: "nav_schedule" },
  { href: "/world-cup-schedule-local-time", key: "nav_localTime" },
  { href: "/matchday-hub", key: "nav_matchdayHub" },
  { href: "/quiz", key: "nav_quiz" },
  { href: "/about", key: "nav_about" },
];

/** Single shared lifecycle truth for which nav link sets to render. */
export function getDesktopLinks(isTournamentComplete: boolean): NavLink[] {
  return isTournamentComplete ? ARCHIVE_DESKTOP_LINKS : DESKTOP_LINKS;
}

export function getPrimaryLinks(isTournamentComplete: boolean): NavLink[] {
  return isTournamentComplete ? ARCHIVE_PRIMARY_LINKS : PRIMARY_LINKS;
}

export function getSecondaryLinks(isTournamentComplete: boolean): NavLink[] {
  return isTournamentComplete ? ARCHIVE_SECONDARY_LINKS : SECONDARY_LINKS;
}

/**
 * Whether `href` should be marked active for the current `pathname`. Exact
 * match or a path segment below it — so `/teams` is NOT active on
 * `/teams-by-confederation`, but IS active on `/teams/usa`.
 */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
