import { NextResponse } from "next/server";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { snapshotCdnTtl } from "@/lib/liveSnapshotCdnPolicy";
import { countryName } from "@/lib/i18n";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { isKnockoutMatch } from "@/lib/participant-resolution";
import type { ResolvedSide } from "@/lib/resolvedParticipants";

// Lightweight internal endpoint for client-side polling (/today, homepage Today
// card, match pages). Reads the shared server snapshot — never calls the
// upstream providers directly, so request volume stays bounded regardless of
// visitor count. The snapshot itself refreshes via unstable_cache internally.
//
// Response caching strategy:
//   Cache-Control: public, max-age=0, must-revalidate
//     — browsers always revalidate; CDN-only caching.
//   Vercel-CDN-Cache-Control: public, max-age=<TTL>, stale-while-revalidate=<SWR>
//     — Vercel's edge serves concurrent polls from cache, collapsing many
//       Function invocations into one per TTL window per region.
//
// TTL tiers (set by snapshotCdnTtl):
//   active  (LIVE/HALFTIME/SYNCING or near-kickoff) → 10 s / SWR 10 s
//   idle    (no imminent match)                      → 60 s / SWR 30 s
//   fallback (cold-start, isFallback=true)           →  5 s / SWR  0 s
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

    const { maxAge, swr } = snapshotCdnTtl(snapshot);

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
