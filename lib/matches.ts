export type Match = {
  homeKey: string;
  homeCode: string;
  awayKey: string;
  awayCode: string;
  date: string; // YYYY-MM-DD (venue-local kickoff date)
  time?: string; // HH:mm venue-local kickoff
  venue?: string;
  group?: string;
  opener?: boolean;
  utcOffset?: number; // venue UTC offset (hours): EDT -4, CDT -5, Mexico CST -6, PDT -7
  providerIds?: {
    footballData?: number; // football-data.org v4 match id
  };
};

// Official 2026 FIFA World Cup group stage — 72 fixtures, sourced from the per-group
// schedules (date, venue-local kickoff time and its UTC offset). `time` is the wall-clock at
// the stadium; `utcOffset` makes each kickoff an absolute instant so the UI can show it in any
// viewer's timezone (see matchUtcDate / MatchTime).
export const MATCHES: Match[] = [
  // ── Group A ──────────────────────────────────────────────────────────────
  { homeKey: "mexico", homeCode: "mx", awayKey: "southAfrica", awayCode: "za", date: "2026-06-11", time: "13:00", venue: "Estadio Azteca", group: "A", utcOffset: -6, opener: true, providerIds: { footballData: 537327 } },
  { homeKey: "southKorea", homeCode: "kr", awayKey: "czechia", awayCode: "cz", date: "2026-06-11", time: "20:00", venue: "Estadio Akron", group: "A", utcOffset: -6, providerIds: { footballData: 537328 } },
  { homeKey: "czechia", homeCode: "cz", awayKey: "southAfrica", awayCode: "za", date: "2026-06-18", time: "12:00", venue: "Mercedes-Benz Stadium", group: "A", utcOffset: -4, providerIds: { footballData: 537329 } },
  { homeKey: "mexico", homeCode: "mx", awayKey: "southKorea", awayCode: "kr", date: "2026-06-18", time: "19:00", venue: "Estadio Akron", group: "A", utcOffset: -6, providerIds: { footballData: 537330 } },
  { homeKey: "czechia", homeCode: "cz", awayKey: "mexico", awayCode: "mx", date: "2026-06-24", time: "19:00", venue: "Estadio Azteca", group: "A", utcOffset: -6, providerIds: { footballData: 537331 } },
  { homeKey: "southAfrica", homeCode: "za", awayKey: "southKorea", awayCode: "kr", date: "2026-06-24", time: "19:00", venue: "Estadio BBVA", group: "A", utcOffset: -6, providerIds: { footballData: 537332 } },

  // ── Group B ──────────────────────────────────────────────────────────────
  { homeKey: "canada", homeCode: "ca", awayKey: "bosnia", awayCode: "ba", date: "2026-06-12", time: "15:00", venue: "BMO Field", group: "B", utcOffset: -4, providerIds: { footballData: 537333 } },
  { homeKey: "qatar", homeCode: "qa", awayKey: "switzerland", awayCode: "ch", date: "2026-06-13", time: "12:00", venue: "Levi's Stadium", group: "B", utcOffset: -7, providerIds: { footballData: 537334 } },
  { homeKey: "switzerland", homeCode: "ch", awayKey: "bosnia", awayCode: "ba", date: "2026-06-18", time: "12:00", venue: "SoFi Stadium", group: "B", utcOffset: -7, providerIds: { footballData: 537335 } },
  { homeKey: "canada", homeCode: "ca", awayKey: "qatar", awayCode: "qa", date: "2026-06-18", time: "15:00", venue: "BC Place", group: "B", utcOffset: -7, providerIds: { footballData: 537336 } },
  { homeKey: "switzerland", homeCode: "ch", awayKey: "canada", awayCode: "ca", date: "2026-06-24", time: "12:00", venue: "BC Place", group: "B", utcOffset: -7, providerIds: { footballData: 537337 } },
  { homeKey: "bosnia", homeCode: "ba", awayKey: "qatar", awayCode: "qa", date: "2026-06-24", time: "12:00", venue: "Lumen Field", group: "B", utcOffset: -7, providerIds: { footballData: 537338 } },

  // ── Group C ──────────────────────────────────────────────────────────────
  { homeKey: "brazil", homeCode: "br", awayKey: "morocco", awayCode: "ma", date: "2026-06-13", time: "18:00", venue: "MetLife Stadium", group: "C", utcOffset: -4, providerIds: { footballData: 537339 } },
  { homeKey: "haiti", homeCode: "ht", awayKey: "scotland", awayCode: "gb-sct", date: "2026-06-13", time: "21:00", venue: "Gillette Stadium", group: "C", utcOffset: -4, providerIds: { footballData: 537340 } },
  { homeKey: "scotland", homeCode: "gb-sct", awayKey: "morocco", awayCode: "ma", date: "2026-06-19", time: "18:00", venue: "Gillette Stadium", group: "C", utcOffset: -4, providerIds: { footballData: 537342 } },
  { homeKey: "brazil", homeCode: "br", awayKey: "haiti", awayCode: "ht", date: "2026-06-19", time: "20:30", venue: "Lincoln Financial Field", group: "C", utcOffset: -4, providerIds: { footballData: 537341 } },
  { homeKey: "scotland", homeCode: "gb-sct", awayKey: "brazil", awayCode: "br", date: "2026-06-24", time: "18:00", venue: "Hard Rock Stadium", group: "C", utcOffset: -4, providerIds: { footballData: 537343 } },
  { homeKey: "morocco", homeCode: "ma", awayKey: "haiti", awayCode: "ht", date: "2026-06-24", time: "18:00", venue: "Mercedes-Benz Stadium", group: "C", utcOffset: -4, providerIds: { footballData: 537344 } },

  // ── Group D ──────────────────────────────────────────────────────────────
  { homeKey: "unitedStates", homeCode: "us", awayKey: "paraguay", awayCode: "py", date: "2026-06-12", time: "18:00", venue: "SoFi Stadium", group: "D", utcOffset: -7, providerIds: { footballData: 537345 } },
  { homeKey: "australia", homeCode: "au", awayKey: "turkey", awayCode: "tr", date: "2026-06-13", time: "21:00", venue: "BC Place", group: "D", utcOffset: -7, providerIds: { footballData: 537346 } },
  { homeKey: "unitedStates", homeCode: "us", awayKey: "australia", awayCode: "au", date: "2026-06-19", time: "12:00", venue: "Lumen Field", group: "D", utcOffset: -7, providerIds: { footballData: 537348 } },
  { homeKey: "turkey", homeCode: "tr", awayKey: "paraguay", awayCode: "py", date: "2026-06-19", time: "20:00", venue: "Levi's Stadium", group: "D", utcOffset: -7, providerIds: { footballData: 537347 } },
  { homeKey: "turkey", homeCode: "tr", awayKey: "unitedStates", awayCode: "us", date: "2026-06-25", time: "19:00", venue: "SoFi Stadium", group: "D", utcOffset: -7, providerIds: { footballData: 537349 } },
  { homeKey: "paraguay", homeCode: "py", awayKey: "australia", awayCode: "au", date: "2026-06-25", time: "19:00", venue: "Levi's Stadium", group: "D", utcOffset: -7, providerIds: { footballData: 537350 } },

  // ── Group E ──────────────────────────────────────────────────────────────
  { homeKey: "germany", homeCode: "de", awayKey: "curacao", awayCode: "cw", date: "2026-06-14", time: "12:00", venue: "NRG Stadium", group: "E", utcOffset: -5, providerIds: { footballData: 537351 } },
  { homeKey: "ivoryCoast", homeCode: "ci", awayKey: "ecuador", awayCode: "ec", date: "2026-06-14", time: "19:00", venue: "Lincoln Financial Field", group: "E", utcOffset: -4, providerIds: { footballData: 537352 } },
  { homeKey: "germany", homeCode: "de", awayKey: "ivoryCoast", awayCode: "ci", date: "2026-06-20", time: "16:00", venue: "BMO Field", group: "E", utcOffset: -4, providerIds: { footballData: 537353 } },
  { homeKey: "ecuador", homeCode: "ec", awayKey: "curacao", awayCode: "cw", date: "2026-06-20", time: "19:00", venue: "Arrowhead Stadium", group: "E", utcOffset: -5, providerIds: { footballData: 537354 } },
  { homeKey: "curacao", homeCode: "cw", awayKey: "ivoryCoast", awayCode: "ci", date: "2026-06-25", time: "16:00", venue: "Lincoln Financial Field", group: "E", utcOffset: -4, providerIds: { footballData: 537356 } },
  { homeKey: "ecuador", homeCode: "ec", awayKey: "germany", awayCode: "de", date: "2026-06-25", time: "16:00", venue: "MetLife Stadium", group: "E", utcOffset: -4, providerIds: { footballData: 537355 } },

  // ── Group F ──────────────────────────────────────────────────────────────
  { homeKey: "netherlands", homeCode: "nl", awayKey: "japan", awayCode: "jp", date: "2026-06-14", time: "15:00", venue: "AT&T Stadium", group: "F", utcOffset: -5, providerIds: { footballData: 537357 } },
  { homeKey: "sweden", homeCode: "se", awayKey: "tunisia", awayCode: "tn", date: "2026-06-14", time: "20:00", venue: "Estadio BBVA", group: "F", utcOffset: -6, providerIds: { footballData: 537358 } },
  { homeKey: "netherlands", homeCode: "nl", awayKey: "sweden", awayCode: "se", date: "2026-06-20", time: "12:00", venue: "NRG Stadium", group: "F", utcOffset: -5, providerIds: { footballData: 537359 } },
  { homeKey: "tunisia", homeCode: "tn", awayKey: "japan", awayCode: "jp", date: "2026-06-20", time: "22:00", venue: "Estadio BBVA", group: "F", utcOffset: -6, providerIds: { footballData: 537360 } },
  { homeKey: "japan", homeCode: "jp", awayKey: "sweden", awayCode: "se", date: "2026-06-25", time: "18:00", venue: "AT&T Stadium", group: "F", utcOffset: -5, providerIds: { footballData: 537362 } },
  { homeKey: "tunisia", homeCode: "tn", awayKey: "netherlands", awayCode: "nl", date: "2026-06-25", time: "18:00", venue: "Arrowhead Stadium", group: "F", utcOffset: -5, providerIds: { footballData: 537361 } },

  // ── Group G ──────────────────────────────────────────────────────────────
  { homeKey: "belgium", homeCode: "be", awayKey: "egypt", awayCode: "eg", date: "2026-06-15", time: "12:00", venue: "Lumen Field", group: "G", utcOffset: -7, providerIds: { footballData: 537363 } },
  { homeKey: "iran", homeCode: "ir", awayKey: "newZealand", awayCode: "nz", date: "2026-06-15", time: "18:00", venue: "SoFi Stadium", group: "G", utcOffset: -7, providerIds: { footballData: 537364 } },
  { homeKey: "belgium", homeCode: "be", awayKey: "iran", awayCode: "ir", date: "2026-06-21", time: "12:00", venue: "SoFi Stadium", group: "G", utcOffset: -7, providerIds: { footballData: 537365 } },
  { homeKey: "newZealand", homeCode: "nz", awayKey: "egypt", awayCode: "eg", date: "2026-06-21", time: "18:00", venue: "BC Place", group: "G", utcOffset: -7, providerIds: { footballData: 537366 } },
  { homeKey: "egypt", homeCode: "eg", awayKey: "iran", awayCode: "ir", date: "2026-06-26", time: "20:00", venue: "Lumen Field", group: "G", utcOffset: -7, providerIds: { footballData: 537368 } },
  { homeKey: "newZealand", homeCode: "nz", awayKey: "belgium", awayCode: "be", date: "2026-06-26", time: "20:00", venue: "BC Place", group: "G", utcOffset: -7, providerIds: { footballData: 537367 } },

  // ── Group H ──────────────────────────────────────────────────────────────
  { homeKey: "saudiArabia", homeCode: "sa", awayKey: "uruguay", awayCode: "uy", date: "2026-06-15", time: "18:00", venue: "Hard Rock Stadium", group: "H", utcOffset: -4, providerIds: { footballData: 537370 } },
  { homeKey: "spain", homeCode: "es", awayKey: "capeVerde", awayCode: "cv", date: "2026-06-15", time: "12:00", venue: "Mercedes-Benz Stadium", group: "H", utcOffset: -4, providerIds: { footballData: 537369 } },
  { homeKey: "spain", homeCode: "es", awayKey: "saudiArabia", awayCode: "sa", date: "2026-06-21", time: "12:00", venue: "Mercedes-Benz Stadium", group: "H", utcOffset: -4, providerIds: { footballData: 537371 } },
  { homeKey: "uruguay", homeCode: "uy", awayKey: "capeVerde", awayCode: "cv", date: "2026-06-21", time: "18:00", venue: "Hard Rock Stadium", group: "H", utcOffset: -4, providerIds: { footballData: 537372 } },
  { homeKey: "capeVerde", homeCode: "cv", awayKey: "saudiArabia", awayCode: "sa", date: "2026-06-26", time: "19:00", venue: "NRG Stadium", group: "H", utcOffset: -5, providerIds: { footballData: 537374 } },
  { homeKey: "uruguay", homeCode: "uy", awayKey: "spain", awayCode: "es", date: "2026-06-26", time: "18:00", venue: "Estadio Akron", group: "H", utcOffset: -6, providerIds: { footballData: 537373 } },

  // ── Group I ──────────────────────────────────────────────────────────────
  { homeKey: "france", homeCode: "fr", awayKey: "senegal", awayCode: "sn", date: "2026-06-16", time: "15:00", venue: "MetLife Stadium", group: "I", utcOffset: -4, providerIds: { footballData: 537391 } },
  { homeKey: "iraq", homeCode: "iq", awayKey: "norway", awayCode: "no", date: "2026-06-16", time: "18:00", venue: "Gillette Stadium", group: "I", utcOffset: -4, providerIds: { footballData: 537392 } },
  { homeKey: "france", homeCode: "fr", awayKey: "iraq", awayCode: "iq", date: "2026-06-22", time: "17:00", venue: "Lincoln Financial Field", group: "I", utcOffset: -4, providerIds: { footballData: 537393 } },
  { homeKey: "norway", homeCode: "no", awayKey: "senegal", awayCode: "sn", date: "2026-06-22", time: "20:00", venue: "MetLife Stadium", group: "I", utcOffset: -4, providerIds: { footballData: 537394 } },
  { homeKey: "norway", homeCode: "no", awayKey: "france", awayCode: "fr", date: "2026-06-26", time: "15:00", venue: "Gillette Stadium", group: "I", utcOffset: -4, providerIds: { footballData: 537395 } },
  { homeKey: "senegal", homeCode: "sn", awayKey: "iraq", awayCode: "iq", date: "2026-06-26", time: "15:00", venue: "BMO Field", group: "I", utcOffset: -4, providerIds: { footballData: 537396 } },

  // ── Group J ──────────────────────────────────────────────────────────────
  { homeKey: "argentina", homeCode: "ar", awayKey: "algeria", awayCode: "dz", date: "2026-06-16", time: "20:00", venue: "Arrowhead Stadium", group: "J", utcOffset: -5, providerIds: { footballData: 537397 } },
  { homeKey: "austria", homeCode: "at", awayKey: "jordan", awayCode: "jo", date: "2026-06-16", time: "21:00", venue: "Levi's Stadium", group: "J", utcOffset: -7, providerIds: { footballData: 537398 } },
  { homeKey: "argentina", homeCode: "ar", awayKey: "austria", awayCode: "at", date: "2026-06-22", time: "12:00", venue: "AT&T Stadium", group: "J", utcOffset: -5, providerIds: { footballData: 537399 } },
  { homeKey: "jordan", homeCode: "jo", awayKey: "algeria", awayCode: "dz", date: "2026-06-22", time: "20:00", venue: "Levi's Stadium", group: "J", utcOffset: -7, providerIds: { footballData: 537400 } },
  { homeKey: "algeria", homeCode: "dz", awayKey: "austria", awayCode: "at", date: "2026-06-27", time: "21:00", venue: "Arrowhead Stadium", group: "J", utcOffset: -5, providerIds: { footballData: 537402 } },
  { homeKey: "jordan", homeCode: "jo", awayKey: "argentina", awayCode: "ar", date: "2026-06-27", time: "21:00", venue: "AT&T Stadium", group: "J", utcOffset: -5, providerIds: { footballData: 537401 } },

  // ── Group K ──────────────────────────────────────────────────────────────
  { homeKey: "portugal", homeCode: "pt", awayKey: "drCongo", awayCode: "cd", date: "2026-06-17", time: "12:00", venue: "NRG Stadium", group: "K", utcOffset: -5, providerIds: { footballData: 537403 } },
  { homeKey: "uzbekistan", homeCode: "uz", awayKey: "colombia", awayCode: "co", date: "2026-06-17", time: "20:00", venue: "Estadio Azteca", group: "K", utcOffset: -6, providerIds: { footballData: 537404 } },
  { homeKey: "portugal", homeCode: "pt", awayKey: "uzbekistan", awayCode: "uz", date: "2026-06-23", time: "12:00", venue: "NRG Stadium", group: "K", utcOffset: -5, providerIds: { footballData: 537405 } },
  { homeKey: "colombia", homeCode: "co", awayKey: "drCongo", awayCode: "cd", date: "2026-06-23", time: "20:00", venue: "Estadio Akron", group: "K", utcOffset: -6, providerIds: { footballData: 537406 } },
  { homeKey: "colombia", homeCode: "co", awayKey: "portugal", awayCode: "pt", date: "2026-06-27", time: "19:30", venue: "Hard Rock Stadium", group: "K", utcOffset: -4, providerIds: { footballData: 537407 } },
  { homeKey: "drCongo", homeCode: "cd", awayKey: "uzbekistan", awayCode: "uz", date: "2026-06-27", time: "19:30", venue: "Mercedes-Benz Stadium", group: "K", utcOffset: -4, providerIds: { footballData: 537408 } },

  // ── Group L ──────────────────────────────────────────────────────────────
  { homeKey: "england", homeCode: "gb-eng", awayKey: "croatia", awayCode: "hr", date: "2026-06-17", time: "15:00", venue: "AT&T Stadium", group: "L", utcOffset: -5, providerIds: { footballData: 537409 } },
  { homeKey: "ghana", homeCode: "gh", awayKey: "panama", awayCode: "pa", date: "2026-06-17", time: "19:00", venue: "BMO Field", group: "L", utcOffset: -4, providerIds: { footballData: 537410 } },
  { homeKey: "england", homeCode: "gb-eng", awayKey: "ghana", awayCode: "gh", date: "2026-06-23", time: "16:00", venue: "Gillette Stadium", group: "L", utcOffset: -4, providerIds: { footballData: 537411 } },
  { homeKey: "panama", homeCode: "pa", awayKey: "croatia", awayCode: "hr", date: "2026-06-23", time: "19:00", venue: "BMO Field", group: "L", utcOffset: -4, providerIds: { footballData: 537412 } },
  { homeKey: "panama", homeCode: "pa", awayKey: "england", awayCode: "gb-eng", date: "2026-06-27", time: "17:00", venue: "MetLife Stadium", group: "L", utcOffset: -4, providerIds: { footballData: 537413 } },
  { homeKey: "croatia", homeCode: "hr", awayKey: "ghana", awayCode: "gh", date: "2026-06-27", time: "17:00", venue: "Lincoln Financial Field", group: "L", utcOffset: -4, providerIds: { footballData: 537414 } }
];

export const OPENING_MATCH = MATCHES.find((m) => m.opener)!;
// Absolute instant of the opener (Mexico vs South Africa, 13:00 in Mexico City, UTC−6).
export const KICKOFF_TARGET = "2026-06-11T19:00:00Z";

// Final matchday — exact kickoff time TBC, so this marks end-of-day for countdown purposes.
export const TOURNAMENT_FINAL_DATE = "19 July 2026";
export const TOURNAMENT_END_TARGET = "2026-07-20T04:00:00Z";

/** Convert a fixture's venue-local kickoff into an absolute UTC instant. */
export function matchUtcDate(m: Match): Date {
  const [h, min] = (m.time ?? "00:00").split(":").map(Number);
  const d = new Date(`${m.date}T00:00:00Z`);
  d.setUTCHours(h - (m.utcOffset ?? 0), min, 0, 0);
  return d;
}

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

/** Build the compact homepage ticker list from a single, shared clock value. */
export function getTickerMatches(now: Date = new Date()): Match[] {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const sevenDaysLater = new Date(todayStart);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  const sorted = [...MATCHES].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const nextSevenDays = sorted.filter((m) => {
    const d = new Date(m.date);
    return d >= todayStart && d <= sevenDaysLater;
  });

  if (nextSevenDays.length >= 5) return nextSevenDays;

  return sorted.filter((m) => new Date(m.date) >= todayStart).slice(0, 10);
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
