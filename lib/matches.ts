export type Match = {
  homeKey: string;
  homeCode: string;
  awayKey: string;
  awayCode: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm local
  venue?: string;
  group?: string;
  opener?: boolean;
};

// Matchday 1 — every group plays its two opening fixtures. All matches are intra-group so
// the schedule, group tables and team "first match" all stay consistent.
export const MATCHES: Match[] = [
  // ── Group A ──────────────────────────────────────────────────────────────
  // MD1
  { homeKey: "mexico", homeCode: "mx", awayKey: "southAfrica", awayCode: "za", date: "2026-06-11", time: "22:00", venue: "Estadio Azteca", group: "A", opener: true },
  { homeKey: "southKorea", homeCode: "kr", awayKey: "czechia", awayCode: "cz", date: "2026-06-12", time: "18:00", venue: "BC Place", group: "A" },
  // MD2
  { homeKey: "mexico", homeCode: "mx", awayKey: "southKorea", awayCode: "kr", date: "2026-06-18", time: "22:00", venue: "Estadio Azteca", group: "A" },
  { homeKey: "southAfrica", homeCode: "za", awayKey: "czechia", awayCode: "cz", date: "2026-06-18", time: "19:00", venue: "MetLife Stadium", group: "A" },
  // MD3
  { homeKey: "mexico", homeCode: "mx", awayKey: "czechia", awayCode: "cz", date: "2026-06-24", time: "22:00", venue: "Estadio Azteca", group: "A" },
  { homeKey: "southAfrica", homeCode: "za", awayKey: "southKorea", awayCode: "kr", date: "2026-06-24", time: "22:00", venue: "BC Place", group: "A" },

  // ── Group B ──────────────────────────────────────────────────────────────
  // MD1
  { homeKey: "canada", homeCode: "ca", awayKey: "bosnia", awayCode: "ba", date: "2026-06-12", time: "21:00", venue: "BMO Field", group: "B" },
  { homeKey: "morocco", homeCode: "ma", awayKey: "switzerland", awayCode: "ch", date: "2026-06-13", time: "13:00", venue: "NRG Stadium", group: "B" },
  // MD2
  { homeKey: "canada", homeCode: "ca", awayKey: "morocco", awayCode: "ma", date: "2026-06-18", time: "16:00", venue: "BMO Field", group: "B" },
  { homeKey: "bosnia", homeCode: "ba", awayKey: "switzerland", awayCode: "ch", date: "2026-06-18", time: "13:00", venue: "Gillette Stadium", group: "B" },
  // MD3
  { homeKey: "canada", homeCode: "ca", awayKey: "switzerland", awayCode: "ch", date: "2026-06-24", time: "19:00", venue: "BMO Field", group: "B" },
  { homeKey: "bosnia", homeCode: "ba", awayKey: "morocco", awayCode: "ma", date: "2026-06-24", time: "19:00", venue: "NRG Stadium", group: "B" },

  // ── Group C ──────────────────────────────────────────────────────────────
  // MD1
  { homeKey: "brazil", homeCode: "br", awayKey: "uruguay", awayCode: "uy", date: "2026-06-13", time: "19:00", venue: "MetLife Stadium", group: "C" },
  { homeKey: "colombia", homeCode: "co", awayKey: "serbia", awayCode: "rs", date: "2026-06-14", time: "13:00", venue: "Mercedes-Benz Stadium", group: "C" },
  // MD2
  { homeKey: "brazil", homeCode: "br", awayKey: "colombia", awayCode: "co", date: "2026-06-19", time: "16:00", venue: "MetLife Stadium", group: "C" },
  { homeKey: "uruguay", homeCode: "uy", awayKey: "serbia", awayCode: "rs", date: "2026-06-19", time: "13:00", venue: "Mercedes-Benz Stadium", group: "C" },
  // MD3
  { homeKey: "brazil", homeCode: "br", awayKey: "serbia", awayCode: "rs", date: "2026-06-23", time: "22:00", venue: "MetLife Stadium", group: "C" },
  { homeKey: "uruguay", homeCode: "uy", awayKey: "colombia", awayCode: "co", date: "2026-06-23", time: "22:00", venue: "Mercedes-Benz Stadium", group: "C" },

  // ── Group D ──────────────────────────────────────────────────────────────
  // MD1
  { homeKey: "unitedStates", homeCode: "us", awayKey: "paraguay", awayCode: "py", date: "2026-06-13", time: "22:00", venue: "SoFi Stadium", group: "D" },
  { homeKey: "turkey", homeCode: "tr", awayKey: "australia", awayCode: "au", date: "2026-06-14", time: "19:00", venue: "AT&T Stadium", group: "D" },
  // MD2
  { homeKey: "turkey", homeCode: "tr", awayKey: "paraguay", awayCode: "py", date: "2026-06-19", time: "15:00", venue: "AT&T Stadium", group: "D" },
  { homeKey: "unitedStates", homeCode: "us", awayKey: "australia", awayCode: "au", date: "2026-06-19", time: "22:00", venue: "SoFi Stadium", group: "D" },
  // MD3
  { homeKey: "turkey", homeCode: "tr", awayKey: "unitedStates", awayCode: "us", date: "2026-06-23", time: "19:00", venue: "Levi's Stadium", group: "D" },
  { homeKey: "australia", homeCode: "au", awayKey: "paraguay", awayCode: "py", date: "2026-06-23", time: "19:00", venue: "MetLife Stadium", group: "D" },

  // ── Group E ──────────────────────────────────────────────────────────────
  // MD1
  { homeKey: "germany", homeCode: "de", awayKey: "curacao", awayCode: "cw", date: "2026-06-14", time: "16:00", venue: "Lincoln Financial Field", group: "E" },
  { homeKey: "belgium", homeCode: "be", awayKey: "denmark", awayCode: "dk", date: "2026-06-15", time: "13:00", venue: "Gillette Stadium", group: "E" },
  // MD2
  { homeKey: "germany", homeCode: "de", awayKey: "belgium", awayCode: "be", date: "2026-06-20", time: "19:00", venue: "Lincoln Financial Field", group: "E" },
  { homeKey: "curacao", homeCode: "cw", awayKey: "denmark", awayCode: "dk", date: "2026-06-20", time: "16:00", venue: "Gillette Stadium", group: "E" },
  // MD3
  { homeKey: "germany", homeCode: "de", awayKey: "denmark", awayCode: "dk", date: "2026-06-25", time: "19:00", venue: "Lincoln Financial Field", group: "E" },
  { homeKey: "curacao", homeCode: "cw", awayKey: "belgium", awayCode: "be", date: "2026-06-25", time: "19:00", venue: "Gillette Stadium", group: "E" },

  // ── Group F ──────────────────────────────────────────────────────────────
  // MD1
  { homeKey: "netherlands", homeCode: "nl", awayKey: "scotland", awayCode: "gb-sct", date: "2026-06-13", time: "16:00", venue: "Levi's Stadium", group: "F" },
  { homeKey: "norway", homeCode: "no", awayKey: "egypt", awayCode: "eg", date: "2026-06-15", time: "16:00", venue: "Lumen Field", group: "F" },
  // MD2
  { homeKey: "netherlands", homeCode: "nl", awayKey: "norway", awayCode: "no", date: "2026-06-20", time: "22:00", venue: "Levi's Stadium", group: "F" },
  { homeKey: "scotland", homeCode: "gb-sct", awayKey: "egypt", awayCode: "eg", date: "2026-06-20", time: "13:00", venue: "Lumen Field", group: "F" },
  // MD3
  { homeKey: "netherlands", homeCode: "nl", awayKey: "egypt", awayCode: "eg", date: "2026-06-25", time: "22:00", venue: "Levi's Stadium", group: "F" },
  { homeKey: "scotland", homeCode: "gb-sct", awayKey: "norway", awayCode: "no", date: "2026-06-25", time: "22:00", venue: "Lumen Field", group: "F" },

  // ── Group G ──────────────────────────────────────────────────────────────
  // MD1
  { homeKey: "japan", homeCode: "jp", awayKey: "cameroon", awayCode: "cm", date: "2026-06-13", time: "13:00", venue: "Hard Rock Stadium", group: "G" },
  { homeKey: "nigeria", homeCode: "ng", awayKey: "ecuador", awayCode: "ec", date: "2026-06-15", time: "19:00", venue: "Arrowhead Stadium", group: "G" },
  // MD2
  { homeKey: "japan", homeCode: "jp", awayKey: "nigeria", awayCode: "ng", date: "2026-06-21", time: "13:00", venue: "Hard Rock Stadium", group: "G" },
  { homeKey: "cameroon", homeCode: "cm", awayKey: "ecuador", awayCode: "ec", date: "2026-06-21", time: "16:00", venue: "Arrowhead Stadium", group: "G" },
  // MD3
  { homeKey: "japan", homeCode: "jp", awayKey: "ecuador", awayCode: "ec", date: "2026-06-25", time: "22:00", venue: "Hard Rock Stadium", group: "G" },
  { homeKey: "cameroon", homeCode: "cm", awayKey: "nigeria", awayCode: "ng", date: "2026-06-25", time: "22:00", venue: "Arrowhead Stadium", group: "G" },

  // ── Group H ──────────────────────────────────────────────────────────────
  // MD1
  { homeKey: "spain", homeCode: "es", awayKey: "capeVerde", awayCode: "cv", date: "2026-06-15", time: "21:00", venue: "Estadio BBVA", group: "H" },
  { homeKey: "ivoryCoast", homeCode: "ci", awayKey: "iran", awayCode: "ir", date: "2026-06-16", time: "13:00", venue: "NRG Stadium", group: "H" },
  // MD2
  { homeKey: "spain", homeCode: "es", awayKey: "ivoryCoast", awayCode: "ci", date: "2026-06-21", time: "21:00", venue: "Estadio BBVA", group: "H" },
  { homeKey: "capeVerde", homeCode: "cv", awayKey: "iran", awayCode: "ir", date: "2026-06-21", time: "19:00", venue: "NRG Stadium", group: "H" },
  // MD3
  { homeKey: "spain", homeCode: "es", awayKey: "iran", awayCode: "ir", date: "2026-06-26", time: "19:00", venue: "Estadio BBVA", group: "H" },
  { homeKey: "capeVerde", homeCode: "cv", awayKey: "ivoryCoast", awayCode: "ci", date: "2026-06-26", time: "19:00", venue: "NRG Stadium", group: "H" },

  // ── Group I ──────────────────────────────────────────────────────────────
  // MD1
  { homeKey: "france", homeCode: "fr", awayKey: "senegal", awayCode: "sn", date: "2026-06-16", time: "21:00", venue: "MetLife Stadium", group: "I" },
  { homeKey: "saudiArabia", homeCode: "sa", awayKey: "qatar", awayCode: "qa", date: "2026-06-16", time: "16:00", venue: "SoFi Stadium", group: "I" },
  // MD2
  { homeKey: "france", homeCode: "fr", awayKey: "saudiArabia", awayCode: "sa", date: "2026-06-22", time: "19:00", venue: "MetLife Stadium", group: "I" },
  { homeKey: "senegal", homeCode: "sn", awayKey: "qatar", awayCode: "qa", date: "2026-06-22", time: "16:00", venue: "SoFi Stadium", group: "I" },
  // MD3
  { homeKey: "france", homeCode: "fr", awayKey: "qatar", awayCode: "qa", date: "2026-06-26", time: "22:00", venue: "MetLife Stadium", group: "I" },
  { homeKey: "senegal", homeCode: "sn", awayKey: "saudiArabia", awayCode: "sa", date: "2026-06-26", time: "22:00", venue: "SoFi Stadium", group: "I" },

  // ── Group J ──────────────────────────────────────────────────────────────
  // MD1
  { homeKey: "argentina", homeCode: "ar", awayKey: "algeria", awayCode: "dz", date: "2026-06-17", time: "22:00", venue: "Estadio Azteca", group: "J" },
  { homeKey: "uzbekistan", homeCode: "uz", awayKey: "newZealand", awayCode: "nz", date: "2026-06-17", time: "13:00", venue: "BC Place", group: "J" },
  // MD2
  { homeKey: "argentina", homeCode: "ar", awayKey: "uzbekistan", awayCode: "uz", date: "2026-06-22", time: "22:00", venue: "Estadio Azteca", group: "J" },
  { homeKey: "algeria", homeCode: "dz", awayKey: "newZealand", awayCode: "nz", date: "2026-06-22", time: "13:00", venue: "BC Place", group: "J" },
  // MD3
  { homeKey: "argentina", homeCode: "ar", awayKey: "newZealand", awayCode: "nz", date: "2026-06-26", time: "22:00", venue: "Estadio Azteca", group: "J" },
  { homeKey: "algeria", homeCode: "dz", awayKey: "uzbekistan", awayCode: "uz", date: "2026-06-26", time: "22:00", venue: "BC Place", group: "J" },

  // ── Group K ──────────────────────────────────────────────────────────────
  // MD1
  { homeKey: "portugal", homeCode: "pt", awayKey: "drCongo", awayCode: "cd", date: "2026-06-17", time: "16:00", venue: "AT&T Stadium", group: "K" },
  { homeKey: "panama", homeCode: "pa", awayKey: "jamaica", awayCode: "jm", date: "2026-06-16", time: "19:00", venue: "Mercedes-Benz Stadium", group: "K" },
  // MD2
  { homeKey: "portugal", homeCode: "pt", awayKey: "panama", awayCode: "pa", date: "2026-06-22", time: "16:00", venue: "AT&T Stadium", group: "K" },
  { homeKey: "drCongo", homeCode: "cd", awayKey: "jamaica", awayCode: "jm", date: "2026-06-22", time: "13:00", venue: "Mercedes-Benz Stadium", group: "K" },
  // MD3
  { homeKey: "portugal", homeCode: "pt", awayKey: "jamaica", awayCode: "jm", date: "2026-06-26", time: "16:00", venue: "AT&T Stadium", group: "K" },
  { homeKey: "drCongo", homeCode: "cd", awayKey: "panama", awayCode: "pa", date: "2026-06-26", time: "16:00", venue: "Mercedes-Benz Stadium", group: "K" },

  // ── Group L ──────────────────────────────────────────────────────────────
  // MD1
  { homeKey: "england", homeCode: "gb-eng", awayKey: "croatia", awayCode: "hr", date: "2026-06-17", time: "19:00", venue: "Gillette Stadium", group: "L" },
  { homeKey: "tunisia", homeCode: "tn", awayKey: "ukraine", awayCode: "ua", date: "2026-06-17", time: "16:00", venue: "Lincoln Financial Field", group: "L" },
  // MD2
  { homeKey: "england", homeCode: "gb-eng", awayKey: "tunisia", awayCode: "tn", date: "2026-06-22", time: "19:00", venue: "Gillette Stadium", group: "L" },
  { homeKey: "croatia", homeCode: "hr", awayKey: "ukraine", awayCode: "ua", date: "2026-06-22", time: "16:00", venue: "Lincoln Financial Field", group: "L" },
  // MD3
  { homeKey: "england", homeCode: "gb-eng", awayKey: "ukraine", awayCode: "ua", date: "2026-06-26", time: "22:00", venue: "Gillette Stadium", group: "L" },
  { homeKey: "croatia", homeCode: "hr", awayKey: "tunisia", awayCode: "tn", date: "2026-06-26", time: "22:00", venue: "Lincoln Financial Field", group: "L" }
];

export const OPENING_MATCH = MATCHES.find((m) => m.opener)!;
export const KICKOFF_TARGET = "2026-06-11T22:00:00";

function sortKey(m: Match) {
  return `${m.date}T${m.time ?? "00:00"}`;
}

export function matchesByDate(): { date: string; matches: Match[] }[] {
  const map = new Map<string, Match[]>();
  for (const m of MATCHES) {
    if (!map.has(m.date)) map.set(m.date, []);
    map.get(m.date)!.push(m);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, matches]) => ({
      date,
      matches: matches.sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
    }));
}

function localISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type MatchdayLabel = "sec_todayMatches" | "sec_tomorrowMatches" | "sec_nextMatches";

export type DisplayMatchday = {
  labelKey: MatchdayLabel;
  date: string; // primary / first date
  matches: Match[]; // all matches (flat, possibly spanning multiple days)
  days?: { date: string; matches: Match[] }[]; // populated when matches span multiple days
};

// Pick which matchday the homepage shows:
//  • Today → show today's full schedule
//  • Tomorrow → show tomorrow's full schedule
//  • Before tournament / gap → show the next 3 matchdays combined (more useful overview)
export function getDisplayMatchday(now: Date = new Date()): DisplayMatchday {
  const todayISO = localISODate(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = localISODate(tomorrow);
  const byDate = matchesByDate(); // ascending by date

  const today = byDate.find((d) => d.date === todayISO);
  if (today) return { labelKey: "sec_todayMatches", date: today.date, matches: today.matches };

  const nextIdx = byDate.findIndex((d) => d.date >= todayISO);
  if (nextIdx === -1) {
    // Past all scheduled matches — show the last day
    const last = byDate[byDate.length - 1];
    return { labelKey: "sec_nextMatches", date: last.date, matches: last.matches };
  }

  const next = byDate[nextIdx];
  if (next.date === tomorrowISO) {
    return { labelKey: "sec_tomorrowMatches", date: next.date, matches: next.matches };
  }

  // Pre-tournament or mid-tournament gap: show the next 3 matchdays so there's a
  // useful multi-match overview rather than a single sparse opening-day card.
  const upcomingDays = byDate.slice(nextIdx, nextIdx + 3);
  const allMatches = upcomingDays.flatMap((d) => d.matches);
  return {
    labelKey: "sec_nextMatches",
    date: upcomingDays[0].date,
    matches: allMatches,
    days: upcomingDays.length > 1 ? upcomingDays : undefined
  };
}

export function matchesInGroup(letter: string): Match[] {
  return MATCHES.filter((m) => m.group === letter).sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
}

// ── Match slug helpers ───────────────────────────────────────────────────────

function keyToSlug(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

const SLUG_MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

/** Unique URL-safe identifier per match.
 *  e.g. Turkey vs Australia 14 Jun  →  "turkey-vs-australia-jun14"
 */
export function matchSlug(m: Match): string {
  const d = new Date(`${m.date}T00:00:00`);
  return `${keyToSlug(m.homeKey)}-vs-${keyToSlug(m.awayKey)}-${SLUG_MONTHS[d.getMonth()]}${d.getDate()}`;
}

export function matchBySlug(slug: string): Match | undefined {
  return MATCHES.find((m) => matchSlug(m) === slug);
}

// Each team's first fixture, derived from the schedule so cards and schedule never disagree.
export function firstMatchFor(teamKey: string) {
  const sorted = [...MATCHES].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  const m = sorted.find((x) => x.homeKey === teamKey || x.awayKey === teamKey);
  if (!m) return null;
  const isHome = m.homeKey === teamKey;
  return {
    opponentKey: isHome ? m.awayKey : m.homeKey,
    opponentCode: isHome ? m.awayCode : m.homeCode,
    date: m.date,
    time: m.time,
    venue: m.venue
  };
}
