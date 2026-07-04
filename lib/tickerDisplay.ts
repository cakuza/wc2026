import { getParticipantDisplay, type ResolvedParticipantLookup } from "./participant-resolution";
import type { Lang } from "./i18n";
import type { Match } from "./matches";

export function getTickerDisplay(match: Match, resolvedParticipants?: ResolvedParticipantLookup, lang: Lang = "en") {
  return {
    home: getParticipantDisplay(match, "home", resolvedParticipants, lang),
    away: getParticipantDisplay(match, "away", resolvedParticipants, lang),
  };
}
