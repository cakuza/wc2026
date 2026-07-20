import { computeTopScorers, resolveCanonicalPlayerIdentity } from "./tournamentStats";
import type { LiveMatchData } from "./liveMatchData";

export interface TournamentAward {
  awardId: string;
  displayName: string;
  winnerName: string;
  winnerPlayerKey?: string;
  teamKey: string;
  metric?: string;
  sourceUrl: string;
  retrievedAt: string;
  evidenceState: "verified" | "provisional";
  publicationState: "published" | "withheld";
}

export const TOURNAMENT_AWARDS: TournamentAward[] = [
  {
    awardId: "golden_boot",
    displayName: "Golden Boot",
    winnerName: "Kylian Mbappé",
    winnerPlayerKey: "france:kylianmbappe",
    teamKey: "france",
    metric: "10 goals",
    sourceUrl: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/award-winners",
    retrievedAt: "2026-07-20T08:27:59Z",
    evidenceState: "verified",
    publicationState: "published",
  },
  {
    awardId: "golden_ball",
    displayName: "Golden Ball",
    winnerName: "Rodri",
    winnerPlayerKey: "spain:rodri",
    teamKey: "spain",
    sourceUrl: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/award-winners",
    retrievedAt: "2026-07-20T08:27:59Z",
    evidenceState: "verified",
    publicationState: "published",
  },
  {
    awardId: "golden_glove",
    displayName: "Golden Glove",
    winnerName: "Unai Simón",
    winnerPlayerKey: "spain:unaisimon",
    teamKey: "spain",
    sourceUrl: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/award-winners",
    retrievedAt: "2026-07-20T08:27:59Z",
    evidenceState: "verified",
    publicationState: "published",
  },
  {
    awardId: "best_young_player",
    displayName: "Best Young Player",
    winnerName: "Pau Cubarsí",
    winnerPlayerKey: "spain:paucubarsi",
    teamKey: "spain",
    sourceUrl: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/award-winners",
    retrievedAt: "2026-07-20T08:27:59Z",
    evidenceState: "verified",
    publicationState: "published",
  },
];

/**
 * Returns published awards.
 * Links the verified Golden Boot entry to the already-computed scorer total if liveData is provided.
 */
export function getPublishedAwards(liveData?: Record<string, LiveMatchData>): TournamentAward[] {
  const awards = TOURNAMENT_AWARDS.filter((a) => a.publicationState === "published");
  if (!liveData) return awards;

  const goalsMap = new Map<number, LiveMatchData>();
  Object.entries(liveData).forEach(([pid, data]) => {
    goalsMap.set(Number(pid), data);
  });

  const topScorers = computeTopScorers(goalsMap);
  const mbappeRecord = topScorers.find((p) => {
    const identity = resolveCanonicalPlayerIdentity(p.playerName, p.teamName);
    return identity?.key === "france:kylianmbappe" || p.playerName === "Kylian Mbappé";
  });

  if (!mbappeRecord) {
    throw new Error("CRITICAL: Golden Boot winner Kylian Mbappé not found in top scorers. Failing closed.");
  }

  if (mbappeRecord.goals !== 10) {
    throw new Error(`CRITICAL: Golden Boot winner Kylian Mbappé has ${mbappeRecord.goals} goals in computed stats, but official award requires 10. Failing closed.`);
  }

  // Ensure he is actually the top scorer
  if (topScorers.length > 0 && topScorers[0].goals > 10) {
    throw new Error(`CRITICAL: Another player has more than 10 goals. Official Golden Boot winner is Kylian Mbappé with 10. Failing closed.`);
  }

  return awards.map((award) => {
    if (award.awardId === "golden_boot") {
      return {
        ...award,
        metric: `${mbappeRecord.goals} goals`,
      };
    }
    return award;
  });
}
