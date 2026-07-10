import fs from 'fs';
import path from 'path';
import { applyVerifiedGoalCorrections } from '../../lib/verifiedMatchEventCorrections';
import { MATCHES, matchSlug } from '../../lib/matches';

const RAW_DIR = path.join(process.cwd(), 'data/archive/raw/espn/2026');
const MAP_PATH = path.join(process.cwd(), 'data/archive/provenance/espn-match-map.json');
const OUTPUT_EVENTS = path.join(process.cwd(), 'data/archive/match-events.json');
const REVIEW_REPORT = path.join(process.cwd(), 'data/archive/reports/espn-manual-review.json');

type StaticMatchEvent = {
  matchId: string;
  minute?: number;
  stoppageMinute?: number;
  period?: "first_half" | "second_half" | "extra_time" | "penalty_shootout";
  teamKey?: string;
  playerName: string;
  eventType: string;
  assistPlayerName?: string;
  relatedPlayerName?: string;
  notes?: string;
  sourceId: string;
  confidence: "verified" | "source_single" | "manual_review";
};

function run() {
    const manifest = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
    const mapped = manifest.filter((m: any) => m.espnEventId && m.mappingConfidence !== 'unresolved');

    let allEvents: StaticMatchEvent[] = [];
    let reviewItems = [];

    for (const m of MATCHES) {
        const internalId = matchSlug(m);
        const verifiedEvents = applyVerifiedGoalCorrections(internalId, []) as any[];

        if (verifiedEvents.length > 0) {
            for (const ev of verifiedEvents) {
                allEvents.push({
                    matchId: internalId,
                    playerName: ev.playerName,
                    eventType: ev.type?.toLowerCase() || (ev.isPenalty ? 'penalty_goal' : (ev.isOwnGoal ? 'own_goal' : 'goal')),
                    minute: ev.minute,
                    teamKey: ev.playerTeamName || ev.teamName,
                    sourceId: 'repo_verified',
                    confidence: 'verified'
                });
            }
        }
    }

    // 2. Parse ESPN payload for backfills
    for (const m of mapped) {
        const rawPath = path.join(RAW_DIR, `${m.espnEventId}.json`);
        if (!fs.existsSync(rawPath)) continue;

        const payload = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
        const verifiedEvents = applyVerifiedGoalCorrections(m.internalMatchId, []) as any[];
        const verifiedExists = verifiedEvents.length > 0;

        const espnEvents = payload.keyEvents || [];

        // Check goals conflict
        const espnGoals = espnEvents.filter((e: any) => e.type?.text?.toLowerCase().includes('goal'));
        const repoGoalsCount = verifiedExists ? verifiedEvents.length : 0;

        if (verifiedExists && espnGoals.length !== repoGoalsCount) {
            reviewItems.push({
                matchId: m.internalMatchId,
                issue: `Goal count mismatch. Repo: ${repoGoalsCount}, ESPN: ${espnGoals.length}`,
                espnEventId: m.espnEventId
            });
        }

        for (const e of espnEvents) {
            const t = e.type?.text?.toLowerCase() || '';
            const txt = e.text?.toLowerCase() || '';

            // Add non-goal events
            if (t.includes('card') || t.includes('substitution')) {
                allEvents.push({
                    matchId: m.internalMatchId,
                    playerName: e.participants?.[0]?.athlete?.displayName || 'Unknown',
                    eventType: t.includes('red') ? 'red_card' : (t.includes('yellow') ? 'yellow_card' : 'substitution'),
                    minute: e.clock?.displayValue ? parseInt(e.clock.displayValue) : undefined,
                    teamKey: e.team?.displayName || '',
                    relatedPlayerName: e.participants?.[1]?.athlete?.displayName,
                    sourceId: 'espn',
                    confidence: 'source_single'
                });
            }

            if (t.includes('goal')) {
                const isPenalty = txt.includes('penalty');
                const isOwnGoal = txt.includes('own goal') || e.type?.type === 'own-goal';
                let eventType = isPenalty ? 'penalty_goal' : (isOwnGoal ? 'own_goal' : 'goal');
                let assistPlayerName = undefined;

                if (e.participants && e.participants.length > 1) {
                    assistPlayerName = e.participants[1].athlete?.displayName;
                }

                if (!verifiedExists) {
                    allEvents.push({
                        matchId: m.internalMatchId,
                        playerName: e.participants?.[0]?.athlete?.displayName || 'Unknown',
                        eventType: eventType,
                        minute: e.clock?.displayValue ? parseInt(e.clock.displayValue) : undefined,
                        teamKey: isOwnGoal
                            ? (payload.boxscore?.teams?.find((t: any) => t.team?.displayName !== e.team?.displayName)?.team?.displayName || e.team?.displayName || '')
                            : (e.team?.displayName || ''),
                        assistPlayerName: assistPlayerName,
                        sourceId: 'espn',
                        confidence: 'source_single'
                    });
                } else {
                    if (assistPlayerName) {
                        const min = e.clock?.displayValue ? parseInt(e.clock.displayValue) : undefined;
                        const targetGoal = allEvents.find(x =>
                            x.matchId === m.internalMatchId &&
                            x.eventType.includes('goal') &&
                            x.minute === min
                        );
                        if (targetGoal && !targetGoal.assistPlayerName) {
                            targetGoal.assistPlayerName = assistPlayerName;
                        }
                    }
                }
            }
        }

        // Handle penalty shootouts
        if (payload.shootout && Array.isArray(payload.shootout)) {
            for (const teamShootout of payload.shootout) {
                if (teamShootout.shots && Array.isArray(teamShootout.shots)) {
                    for (const kick of teamShootout.shots) {
                        allEvents.push({
                            matchId: m.internalMatchId,
                            playerName: kick.player || 'Unknown',
                            eventType: kick.didScore ? 'penalty_shootout_scored' : 'penalty_shootout_missed',
                            teamKey: teamShootout.team || '',
                            period: 'penalty_shootout',
                            sourceId: 'espn',
                            confidence: 'source_single'
                        });
                    }
                }
            }
        }
    }

    fs.mkdirSync(path.dirname(OUTPUT_EVENTS), { recursive: true });
    fs.writeFileSync(OUTPUT_EVENTS, JSON.stringify(allEvents, null, 2));

    fs.mkdirSync(path.dirname(REVIEW_REPORT), { recursive: true });
    fs.writeFileSync(REVIEW_REPORT, JSON.stringify(reviewItems, null, 2));

    console.log(`Events candidate created with ${allEvents.length} events. Reviews flagged: ${reviewItems.length}`);
}

run();
