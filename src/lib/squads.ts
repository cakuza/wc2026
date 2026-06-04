import squadsByTeam from "../../data/squads.json";

// squads.json is keyed by project team id -> array of { name, number, position }.
// Sourced from reported WC2026 final-squad lists (Al Jazeera, June 2026). Names only;
// shirt numbers are not published by the source, so `number` is null.
export type SquadPosition = "GK" | "DEF" | "MID" | "FWD";
// `detailedPosition` is an optional granular role label (e.g. "Centre-Back", "Attacking Midfield")
// populated by a positions sync. When absent we fall back to the broad bucket.
export type SquadEntry = { name: string; number: number | null; position: SquadPosition; detailedPosition?: string };

// Detailed role label -> short code. Keys are normalized (lowercase, hyphens -> spaces) so
// "Centre-back", "Centre back" and "centre back" all resolve. Anything unmapped falls back to
// the broad bucket in positionCode().
const DETAILED_POSITION_CODES: Record<string, string> = {
  "goalkeeper": "GK",
  "centre back": "CB", "center back": "CB", "central defender": "CB", "defender": "DEF", "defence": "DEF",
  "right back": "RB", "left back": "LB", "full back": "FB", "fullback": "FB",
  "wing back": "WB", "right wing back": "RWB", "left wing back": "LWB", "sweeper": "SW",
  "defensive midfield": "CDM", "defensive midfielder": "CDM",
  "central midfield": "CM", "central midfielder": "CM", "centre midfielder": "CM",
  "attacking midfield": "CAM", "attacking midfielder": "CAM",
  "right midfield": "RM", "right midfielder": "RM", "left midfield": "LM", "left midfielder": "LM",
  "midfield": "MID", "midfielder": "MID",
  "right winger": "RW", "left winger": "LW", "winger": "W", "wide midfielder": "W",
  "centre forward": "ST", "center forward": "ST", "striker": "ST", "second striker": "ST", "forward": "FWD",
  "offence": "FWD", "attacker": "FWD"
};

// Short position code for display. Prefers a detailed role when available, else the broad bucket.
export function positionCode(entry: SquadEntry): string {
  if (entry.detailedPosition) {
    const key = entry.detailedPosition.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();
    if (DETAILED_POSITION_CODES[key]) return DETAILED_POSITION_CODES[key];
  }
  return entry.position;
}
export type SquadStatus = "pending" | "provisional" | "official";

const SQUADS = squadsByTeam as Record<string, SquadEntry[]>;

export const SQUAD_SOURCE_LABEL = "Reported squads - Al Jazeera (June 2026). Names only; numbers pending.";

export function getTeamSquad(teamId: string): SquadEntry[] {
  return SQUADS[teamId] ?? [];
}

export function squadStatusFor(teamId: string): SquadStatus {
  return (SQUADS[teamId]?.length ?? 0) > 0 ? "provisional" : "pending";
}

export function getSquadStatusMap(): Record<string, SquadStatus> {
  return Object.fromEntries(Object.keys(SQUADS).map((id) => [id, squadStatusFor(id)]));
}

// Back-compat for existing consumers that read squad.squadStatus.
export function getSquad(teamId: string): { teamId: string; squadStatus: SquadStatus; players: SquadEntry[] } | null {
  const players = SQUADS[teamId];
  if (!players) return null;
  return { teamId, squadStatus: squadStatusFor(teamId), players };
}

// Star player for a Player Watch default: first forward, else first midfielder, else first listed.
export function getStarPlayer(teamId: string): SquadEntry | null {
  const squad = getTeamSquad(teamId);
  return squad.find((p) => p.position === "FWD") || squad.find((p) => p.position === "MID") || squad[0] || null;
}

// Attacking-role ranking for "players to watch" (lower = more eye-catching), keyed by the short
// position code so granular roles (ST/W/CAM…) rank above defenders. Pre-tournament we have no
// live stats, so this + the team's featured star is the best signal we have.
const WATCH_RANK: Record<string, number> = {
  ST: 0, CF: 0, FWD: 1, RW: 1, LW: 1, W: 1, CAM: 2, RM: 3, LM: 3,
  CM: 4, MID: 5, CDM: 5, RWB: 6, LWB: 6, WB: 6, RB: 7, LB: 7, FB: 7, CB: 8, SW: 8, DEF: 8, GK: 9
};
const watchScore = (entry: SquadEntry) => WATCH_RANK[positionCode(entry)] ?? 5;
const matchName = (a: string, b: string) =>
  a.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "") === b.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

// 2-3 standout names for a team's "players to watch" rail: the team's featured star first (when it
// maps to a squad member), then the most attacking outfield players.
export function getPlayersToWatch(teamId: string, featuredPlayer?: string, max = 3): SquadEntry[] {
  const squad = getTeamSquad(teamId);
  if (!squad.length) return [];
  const ranked = squad
    .map((player, index) => ({ player, index }))
    .sort((a, b) => watchScore(a.player) - watchScore(b.player) || a.index - b.index)
    .map((entry) => entry.player);
  const result: SquadEntry[] = [];
  const featured = featuredPlayer ? squad.find((p) => matchName(p.name, featuredPlayer)) : undefined;
  if (featured) result.push(featured);
  for (const player of ranked) {
    if (result.length >= max) break;
    if (!result.includes(player)) result.push(player);
  }
  return result.slice(0, max);
}

// URL-safe slug for a player name (used in /cards?player=<slug> deep links).
export function playerSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findSquadPlayer(teamId: string, slug: string): SquadEntry | null {
  return getTeamSquad(teamId).find((p) => playerSlug(p.name) === slug) || null;
}

// Squad grouped by position, in display order, skipping empty groups.
export function getSquadByPosition(teamId: string): Array<{ position: SquadPosition; label: string; players: SquadEntry[] }> {
  const squad = getTeamSquad(teamId);
  const labels: Record<SquadPosition, string> = { GK: "Goalkeepers", DEF: "Defenders", MID: "Midfielders", FWD: "Forwards" };
  return (["GK", "DEF", "MID", "FWD"] as SquadPosition[])
    .map((position) => ({ position, label: labels[position], players: squad.filter((p) => p.position === position) }))
    .filter((group) => group.players.length > 0);
}
