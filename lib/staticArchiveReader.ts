import fs from 'fs';
import path from 'path';
import type { LiveMatchData, LiveMatchEvent } from './liveMatchData';
import { MATCHES, matchSlug } from './matches';

export function readStaticArchiveData(): Map<number, LiveMatchData> {
  const eventsPath = path.join(process.cwd(), 'data/archive/match-events.json');
  const statsPath = path.join(process.cwd(), 'data/archive/match-stats.json');
  
  let events: any[] = [];
  let stats: any[] = [];
  
  try {
    if (fs.existsSync(eventsPath)) {
      events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
    }
    if (fs.existsSync(statsPath)) {
      stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    }
  } catch (e) {
    console.error("Failed to read static archive data", e);
  }

  const liveDataMap = new Map<number, LiveMatchData>();

  for (const match of MATCHES) {
    const internalId = matchSlug(match);
    const providerId = match.providerIds?.footballData;
    if (!providerId) continue;

    const matchEvents = events.filter((e) => e.matchId === internalId);
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
          teamName: ev.eventType === 'own_goal' ? null : (ev.teamKey || null),
          playerTeamName: ev.eventType === 'own_goal' ? (ev.teamKey || null) : undefined,
          playerName: ev.playerName,
          isOwnGoal: ev.eventType === 'own_goal',
          assistName: ev.assistPlayerName,
          // providerEventId intentionally omitted because sourceId is generic (e.g. 'espn')
        });
      } else if (ev.eventType === 'yellow_card' || ev.eventType === 'red_card') {
        bookings.push({
          type: ev.eventType === 'yellow_card' ? 'YELLOW_CARD' : 'RED_CARD',
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
        possession: matchStats.possession,
        shots: matchStats.shots,
        shotsOnTarget: matchStats.shotsOnTarget,
        corners: matchStats.corners,
        fouls: matchStats.fouls,
        yellowCards: matchStats.yellowCards,
        redCards: matchStats.redCards,
        saves: matchStats.saves,
        offsides: matchStats.offsides,
      } : undefined
    };
    
    liveDataMap.set(providerId, liveMatch);
  }

  return liveDataMap;
}
