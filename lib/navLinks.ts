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
  { href: "/groups", key: "nav_standings" },
  { href: "/stats", key: "nav_stats" },
  { href: "/world-cup-schedule-local-time", key: "nav_localTime" },
  { href: "/world-cup-third-place-qualification", key: "nav_thirdPlace" },
  { href: "/matchday-hub", key: "nav_matchdayHub" },
  { href: "/quiz", key: "nav_quiz" },
  { href: "/about", key: "nav_about" },
];

/**
 * Whether `href` should be marked active for the current `pathname`. Exact
 * match or a path segment below it — so `/teams` is NOT active on
 * `/teams-by-confederation`, but IS active on `/teams/usa`.
 */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
