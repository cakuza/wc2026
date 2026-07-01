import { NextResponse } from "next/server";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { countryName } from "@/lib/i18n";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { isKnockoutMatch } from "@/lib/participant-resolution";
import type { ResolvedSide } from "@/lib/resolvedParticipants";

// Lightweight internal endpoint for client-side polling (/today, homepage Today
// card, match pages). Reads the shared server snapshot — never calls the
// upstream providers directly, so request volume stays bounded regardless of
// visitor count. The snapshot itself refreshes at most every
// LIVE_SNAPSHOT_REVALIDATE_SECONDS (~25s); this route must not add extra
// caching on top of that.
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const participantPayload = (side: ResolvedSide | undefined) =>
    side
      ? {
          teamKey: side.teamKey,
          teamCode: side.teamCode,
          displayName: countryName(side.teamKey, "en"),
        }
      : null;

  return NextResponse.json({
    snapshotId: snapshot.snapshotId,
    generatedAt: snapshot.generatedAt,
    updatedAt: snapshot.updatedAt,
    primaryProviderOk: snapshot.primaryProviderOk,
    secondaryProviderOk: snapshot.secondaryProviderOk,
    primaryProviderFetchedAt: snapshot.primaryProviderFetchedAt,
    secondaryProviderFetchedAt: snapshot.secondaryProviderFetchedAt,
    // Honest availability signal: when true this is the cold-start fallback —
    // standings/Top Scorers are not authoritative and per-match
    // `liveDataUnavailable` marks started fixtures whose result is unknown. API
    // consumers must not treat such fixtures as genuinely SCHEDULED.
    isFallback: snapshot.isFallback ?? false,
    matches: Object.fromEntries(
      Object.entries(snapshot.matches).map(([id, m]) => {
        const matchNumber = isKnockoutMatch(m.match) ? m.match.matchNumber : null;
        const resolved = matchNumber !== null ? resolvedParticipants[matchNumber] : undefined;
        return [
          id,
          {
            status: m.status,
            // Explicit availability field so no consumer silently reads a stale
            // SCHEDULED for a fixture that has actually kicked off.
            liveDataUnavailable: m.liveDataUnavailable ?? false,
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            scoreDuration: m.live?.scoreDuration ?? null,
            penaltyShootoutScore: m.live?.penaltyShootoutScore ?? null,
            winner: m.live?.winner ?? null,
            resolvedHomeParticipant: participantPayload(resolved?.home),
            resolvedAwayParticipant: participantPayload(resolved?.away),
            scorers: m.scorers,
            goalEventCompleteness: m.goalEventCompleteness,
          },
        ];
      }),
    ),
  });
}
