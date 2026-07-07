import { NextResponse } from "next/server";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { snapshotCdnTtl } from "@/lib/liveSnapshotCdnPolicy";
import { countryName } from "@/lib/i18n";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { isKnockoutMatch } from "@/lib/participant-resolution";
import type { ResolvedSide } from "@/lib/resolvedParticipants";

// Containment mode: this endpoint is no longer polled by clients in normal
// operation. It remains available for manual debugging and canonical fallback.
// CDN TTL is set to a very long idle window so even stray requests are served
// from cache without spawning a new function invocation.
//
// To restore live polling: re-add force-dynamic and wire up client components.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    // Containment mode: use a fixed long idle TTL regardless of match state.
    // Clients do not poll this endpoint in normal operation, so the CDN serves
    // rare stray requests from cache for up to 1 hour without invoking the function.
    const maxAge = 3600;
    const swr = 1800;

    return NextResponse.json(
      {
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
      },
      {
        headers: {
          // Browsers must not cache — always revalidate so stale scores are not
          // silently served to users with open tabs.
          "Cache-Control": "public, max-age=0, must-revalidate",
          // Vercel's edge CDN caches the shared response. Concurrent polls within
          // the same TTL window collapse into a single Function invocation.
          "Vercel-CDN-Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=${swr}`,
        },
      },
    );
  } catch (err) {
    console.error("[live-snapshot] handler error", err);
    // Never cache error responses — a transient failure must not block valid
    // live-score data from reaching the CDN on the next request.
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
