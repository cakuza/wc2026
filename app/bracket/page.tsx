import type { Metadata } from "next";
import { BracketContent } from "./BracketContent";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { ARCHIVE_DEFAULT_DATE, MATCHES } from "@/lib/matches";
import { getTournamentPhase } from "@/lib/matchCenterSelection";

const BASE_URL = "https://www.worldcupmatchday.com";

// export const dynamic = "force-dynamic"; // removed for ISR
export const revalidate = 60;

export const metadata: Metadata = {
  title: "World Cup 2026 Bracket — Knockout Stage",
  description:
    "The FIFA World Cup 2026 knockout bracket: Round of 32 through to the final. All 32 teams confirmed from the group stage.",
  alternates: { canonical: `${BASE_URL}/bracket` },
  openGraph: {
    title: "World Cup 2026 Bracket — Knockout Stage",
    description:
      "The 2026 World Cup knockout bracket from the Round of 32 to the final.",
    url: `${BASE_URL}/bracket`,
    type: "website",
  },
};

export default async function BracketPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const tournamentPhase = getTournamentPhase({
    matches: MATCHES,
    liveData: snapshot.liveDataByProviderId,
    now: new Date(snapshot.generatedAt),
  });
  return <BracketContent resolvedParticipants={buildKnockoutResolution(snapshot.matches)} tournamentPhase={tournamentPhase} />;
}
