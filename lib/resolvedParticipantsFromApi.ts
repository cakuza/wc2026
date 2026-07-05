import type { ResolvedParticipantLookup } from "./participant-resolution";
import type { ResolvedSide } from "./resolvedParticipants";

type ApiResolvedParticipant = {
  teamKey?: unknown;
  teamCode?: unknown;
};

export type ApiSnapshotMatchParticipantFields = {
  resolvedHomeParticipant?: ApiResolvedParticipant | null;
  resolvedAwayParticipant?: ApiResolvedParticipant | null;
};

function toResolvedSide(value: ApiResolvedParticipant | null | undefined): ResolvedSide | null {
  if (!value || typeof value.teamKey !== "string" || typeof value.teamCode !== "string") return null;
  return { teamKey: value.teamKey, teamCode: value.teamCode };
}

function matchNumberFromApiId(id: string): number | null {
  const match = /^match-(\d+)$/.exec(id);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function mergeResolvedParticipantsFromApiMatches(
  base: ResolvedParticipantLookup | undefined,
  matches: Record<string, ApiSnapshotMatchParticipantFields>,
): ResolvedParticipantLookup {
  const merged: Record<number, { home?: ResolvedSide; away?: ResolvedSide }> = { ...(base ?? {}) };

  for (const [id, entry] of Object.entries(matches)) {
    const matchNumber = matchNumberFromApiId(id);
    if (matchNumber === null) continue;

    const home = toResolvedSide(entry.resolvedHomeParticipant);
    const away = toResolvedSide(entry.resolvedAwayParticipant);
    if (!home && !away) continue;

    merged[matchNumber] = {
      ...merged[matchNumber],
      ...(home ? { home } : {}),
      ...(away ? { away } : {}),
    };
  }

  return merged;
}
