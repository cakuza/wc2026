import type { Match } from "./matches";
import { matchUtcDate } from "./matches";
import { slugFor } from "./teams";
import { getVenueRecord } from "./venueRegistry";
import type { GoalScorerEvent } from "./worldcup26Provider";

/**
 * Builds factual summary sentence for match presentation & SportsEvent schema.
 */
export function buildFactualMatchDescription(args: {
  match: Match;
  homeName: string;
  awayName: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  scoreDuration?: string | null;
  stageLabel?: string;
}): string {
  const venueRecord = getVenueRecord(args.match.venue ?? "");
  const venueDisplayName = args.match.venue ?? venueRecord.name;

  const stageStr = args.stageLabel
    ? `2026 FIFA World Cup ${args.stageLabel}`
    : args.match.group
    ? `2026 FIFA World Cup Group ${args.match.group}`
    : "2026 FIFA World Cup";

  if (args.status === "FINISHED" && args.homeScore !== null && args.awayScore !== null) {
    let resultOutcome = "";
    if (args.homeScore > args.awayScore) {
      resultOutcome = `${args.homeName} defeated ${args.awayName} ${args.homeScore}–${args.awayScore}`;
    } else if (args.awayScore > args.homeScore) {
      resultOutcome = `${args.awayName} defeated ${args.homeName} ${args.awayScore}–${args.homeScore}`;
    } else {
      resultOutcome = `${args.homeName} drew ${args.homeScore}–${args.awayScore} with ${args.awayName}`;
    }

    let durationDetail = "";
    if (args.scoreDuration === "EXTRA_TIME" || args.scoreDuration === "AET") {
      durationDetail = " after extra time";
    } else if (args.scoreDuration === "PENALTY_SHOOTOUT" || args.scoreDuration === "PEN") {
      durationDetail = " after a penalty shootout";
    }

    return `${resultOutcome}${durationDetail} in the ${stageStr} at ${venueDisplayName}.`;
  }

  return `${args.homeName} vs ${args.awayName} in the ${stageStr} at ${venueDisplayName}.`;
}

/**
 * Shared production builder for canonical SportsEvent JSON-LD schema across all 104 matches.
 */
export function buildMatchSportsEventSchema(args: {
  match: Match;
  matchId: string;
  homeName: string;
  awayName: string;
  homeKey?: string | null;
  awayKey?: string | null;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  scoreDuration?: string | null;
  stageLabel?: string;
  scorers?: GoalScorerEvent[];
}): Record<string, unknown> {
  const BASE_URL = "https://www.worldcupmatchday.com";
  const venueRecord = getVenueRecord(args.match.venue ?? "");

  const homeSlug = args.homeKey && args.homeKey !== "tbd" ? slugFor(args.homeKey) : undefined;
  const awaySlug = args.awayKey && args.awayKey !== "tbd" ? slugFor(args.awayKey) : undefined;

  const homeTeamId = homeSlug
    ? `${BASE_URL}/teams/${homeSlug}#team`
    : `${BASE_URL}/matches/${args.matchId}#home-team`;

  const awayTeamId = awaySlug
    ? `${BASE_URL}/teams/${awaySlug}#team`
    : `${BASE_URL}/matches/${args.matchId}#away-team`;

  const homeTeamNode = {
    "@type": "SportsTeam",
    "@id": homeTeamId,
    name: args.homeName,
    ...(homeSlug ? { url: `${BASE_URL}/teams/${homeSlug}` } : {}),
  };

  const awayTeamNode = {
    "@type": "SportsTeam",
    "@id": awayTeamId,
    name: args.awayName,
    ...(awaySlug ? { url: `${BASE_URL}/teams/${awaySlug}` } : {}),
  };

  const isCompleted = args.status === "FINISHED" && args.homeScore !== null && args.awayScore !== null;
  const eventName = isCompleted
    ? `${args.homeName} ${args.homeScore}–${args.awayScore} ${args.awayName}`
    : `${args.homeName} vs ${args.awayName}`;

  const groupOrStage = args.match.group
    ? `Group ${args.match.group}`
    : args.stageLabel
    ? `2026 World Cup ${args.stageLabel}`
    : "";

  const description = buildFactualMatchDescription(args);

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "@id": `${BASE_URL}/matches/${args.matchId}#sports-event`,
    name: `${eventName} — 2026 FIFA World Cup${groupOrStage ? ` ${groupOrStage}` : ""}`,
    description,
    url: `${BASE_URL}/matches/${args.matchId}`,
    startDate: matchUtcDate(args.match).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    sport: "Soccer",
    location: {
      "@type": "Place",
      "@id": `${BASE_URL}/venues/${venueRecord.key}#place`,
      name: args.match.venue ?? venueRecord.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: venueRecord.streetAddress,
        addressLocality: venueRecord.addressLocality,
        ...(venueRecord.addressRegion ? { addressRegion: venueRecord.addressRegion } : {}),
        postalCode: venueRecord.postalCode,
        addressCountry: venueRecord.addressCountry,
      },
    },
    image: [`${BASE_URL}/matches/${args.matchId}/opengraph-image`],
    homeTeam: homeTeamNode,
    awayTeam: awayTeamNode,
    competitor: [homeTeamNode, awayTeamNode],
    performer: [homeTeamNode, awayTeamNode],
    organizer: {
      "@type": "Organization",
      name: "FIFA",
      url: "https://www.fifa.com/en/tournaments/mens/worldcup/canada-mexico-usa-2026",
    },
    inLanguage: "en",
  };
}
