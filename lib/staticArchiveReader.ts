import fs from 'fs';
import path from 'path';
import { formatEventDisplayMinute, getCanonicalArchiveEventsForMatch, type CanonicalArchiveEvent } from './canonicalArchiveEvents';
import type { LiveMatchData, LiveMatchEvent } from './liveMatchData';
import { MATCHES, matchSlug } from './matches';

interface RawMatchStats {
  readonly matchId: string;
  readonly possession?: { readonly home: number; readonly away: number };
  readonly shots?: { readonly home: number; readonly away: number };
  readonly shotsOnTarget?: { readonly home: number; readonly away: number };
  readonly corners?: { readonly home: number; readonly away: number };
  readonly fouls?: { readonly home: number; readonly away: number };
  readonly yellowCards?: { readonly home: number; readonly away: number };
  readonly redCards?: { readonly home: number; readonly away: number };
  readonly saves?: { readonly home: number; readonly away: number };
  readonly offsides?: { readonly home: number; readonly away: number };
}

class ReadonlyArchiveMap implements ReadonlyMap<number, LiveMatchData> {
  private readonly map: Map<number, LiveMatchData>;
  constructor(map: Map<number, LiveMatchData>) {
    this.map = map;
  }
  get(key: number) { return this.map.get(key); }
  has(key: number) { return this.map.has(key); }
  get size() { return this.map.size; }
  forEach(callbackfn: (value: LiveMatchData, key: number, map: ReadonlyMap<number, LiveMatchData>) => void, thisArg?: any): void {
    this.map.forEach((value, key) => callbackfn.call(thisArg, value, key, this));
  }
  entries() { return this.map.entries(); }
  keys() { return this.map.keys(); }
  values() { return this.map.values(); }
  [Symbol.iterator]() { return this.map.entries(); }
}

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Object.getOwnPropertyNames(obj)) {
    const prop = (obj as any)[key];
    if (prop !== null && typeof prop === 'object' && !Object.isFrozen(prop)) {
      deepFreeze(prop);
    }
  }
  return obj;
}

let cachedLiveDataMap: ReadonlyMap<number, LiveMatchData> | null = null;
// Each element of this array is Object.freeze()-d so no caller can mutate it
let cachedEventsArray: ReadonlyArray<CanonicalArchiveEvent> | null = null;

export function readStaticMatchEvents(): ReadonlyArray<CanonicalArchiveEvent> {
  if (cachedEventsArray) {
    return cachedEventsArray;
  }
  const eventsPath = path.join(process.cwd(), 'data/archive/match-events.json');
  let raw: CanonicalArchiveEvent[];
  if (fs.existsSync(eventsPath)) {
    raw = JSON.parse(fs.readFileSync(eventsPath, 'utf8')) as CanonicalArchiveEvent[];
  } else {
    raw = [];
  }
  // Freeze each element recursively and the array so no caller can mutate shared objects.
  cachedEventsArray = Object.freeze(raw.map(e => deepFreeze(e))) as ReadonlyArray<CanonicalArchiveEvent>;
  return cachedEventsArray;
}

export function readStaticArchiveData(): ReadonlyMap<number, LiveMatchData> {
  if (cachedLiveDataMap) {
    return cachedLiveDataMap;
  }

  const statsPath = path.join(process.cwd(), 'data/archive/match-stats.json');
  
  const events = readStaticMatchEvents();
  let stats: RawMatchStats[] = [];
  
  try {
    if (fs.existsSync(statsPath)) {
      stats = JSON.parse(fs.readFileSync(statsPath, 'utf8')) as RawMatchStats[];
    }
  } catch (e) {
    console.error("Failed to read static archive data", e);
  }

  const liveDataMap = new Map<number, LiveMatchData>();

  for (const match of MATCHES) {
    const internalId = matchSlug(match);
    const providerId = match.providerIds?.footballData;
    if (!providerId) continue;

    // Archive events are the final event authority for archived matches. Project
    // only the validated canonical records into the static live-data shape so
    // downstream snapshot and statistics consumers see the same event source.
    const matchEvents = getCanonicalArchiveEventsForMatch(events, internalId);
    const matchStats = stats.find((s) => s.matchId === internalId);

    if (matchEvents.length === 0 && !matchStats) continue;

    const goals: LiveMatchEvent[] = [];
    const bookings: LiveMatchEvent[] = [];
    const substitutions: LiveMatchEvent[] = [];
    const shootoutAttempts: LiveMatchEvent[] = [];
    
    // Construct events
    for (const ev of matchEvents) {
      if (ev.eventType === 'goal' || ev.eventType === 'own_goal' || ev.eventType === 'penalty_goal') {
        goals.push({
          type: ev.eventType === 'own_goal' ? 'OWN_GOAL' : ev.eventType === 'penalty_goal' ? 'PENALTY_GOAL' : 'GOAL',
          minute: ev.minute || null,
          stoppageTime: ev.stoppageMinute || null,
          displayMinute: formatEventDisplayMinute(ev),
          minuteLabel: formatEventDisplayMinute(ev),
          teamName: ev.eventType === 'own_goal' ? null : (ev.teamKey || null),
          playerTeamName: ev.eventType === 'own_goal' ? (ev.teamKey || null) : undefined,
          playerName: ev.playerName,
          isOwnGoal: ev.eventType === 'own_goal',
          assistName: ev.assistPlayerName,
          // providerEventId intentionally omitted because sourceId is generic (e.g. 'espn')
        });
      } else if (ev.eventType === 'yellow_card' || ev.eventType === 'red_card' || ev.eventType === 'second_yellow') {
        bookings.push({
          type: ev.eventType === 'yellow_card' ? 'YELLOW_CARD' : ev.eventType === 'second_yellow' ? 'SECOND_YELLOW' : 'RED_CARD',
          minute: ev.minute || null,
          stoppageTime: ev.stoppageMinute || null,
          teamName: ev.teamKey || null,
          playerName: ev.playerName,
          // providerEventId intentionally omitted
        });
      } else if (ev.eventType === 'substitution') {
        substitutions.push({
          type: 'SUBSTITUTION',
          minute: ev.minute || null,
          stoppageTime: ev.stoppageMinute || null,
          teamName: ev.teamKey || null,
          playerName: ev.playerName,
          detail: ev.relatedPlayerName || null,
          // providerEventId intentionally omitted
        });
      } else if (ev.eventType === 'penalty_shootout_scored' || ev.eventType === 'penalty_shootout_missed') {
        shootoutAttempts.push({
          type: ev.eventType === 'penalty_shootout_scored' ? 'PENALTY_SHOOTOUT_SCORED' : 'PENALTY_SHOOTOUT_MISSED',
          minute: ev.minute || null,
          teamName: ev.teamKey || null,
          playerName: ev.playerName,
        });
      }
    }

    const liveMatch: LiveMatchData = {
      provider: "football-data.org",
      providerMatchId: providerId,
      status: "FINISHED",
      homeScore: null,
      awayScore: null,
      winner: null,
      lastSyncedAt: new Date().toISOString(),
      eventDataAvailable: true,
      goals,
      bookings,
      substitutions,
      shootoutAttempts,
      teamStats: matchStats ? {
        possession: matchStats.possession ? { home: matchStats.possession.home, away: matchStats.possession.away } : { home: 0, away: 0 },
        shots: matchStats.shots ? { home: matchStats.shots.home, away: matchStats.shots.away } : { home: 0, away: 0 },
        shotsOnTarget: matchStats.shotsOnTarget ? { home: matchStats.shotsOnTarget.home, away: matchStats.shotsOnTarget.away } : { home: 0, away: 0 },
        corners: matchStats.corners ? { home: matchStats.corners.home, away: matchStats.corners.away } : { home: 0, away: 0 },
        fouls: matchStats.fouls ? { home: matchStats.fouls.home, away: matchStats.fouls.away } : { home: 0, away: 0 },
        yellowCards: matchStats.yellowCards ? { home: matchStats.yellowCards.home, away: matchStats.yellowCards.away } : { home: 0, away: 0 },
        redCards: matchStats.redCards ? { home: matchStats.redCards.home, away: matchStats.redCards.away } : { home: 0, away: 0 },
        saves: matchStats.saves ? { home: matchStats.saves.home, away: matchStats.saves.away } : { home: 0, away: 0 },
        offsides: matchStats.offsides ? { home: matchStats.offsides.home, away: matchStats.offsides.away } : { home: 0, away: 0 },
      } : undefined
    };
    
    liveDataMap.set(providerId, deepFreeze(liveMatch));
  }

  cachedLiveDataMap = new ReadonlyArchiveMap(liveDataMap);
  return cachedLiveDataMap;
}
