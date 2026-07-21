import type { Metadata } from "next";
import { BracketContent } from "./BracketContent";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { ARCHIVE_DEFAULT_DATE, MATCHES } from "@/lib/matches";
import { getTournamentPhase } from "@/lib/matchCenterSelection";
import { getArchiveState } from "@/lib/archiveLifecycle";

const BASE_URL = "https://www.worldcupmatchday.com";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Bracket" },
];

// export const dynamic = "force-dynamic"; // removed for ISR
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const archive = getArchiveState({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, resolvedParticipants, now: new Date(ARCHIVE_DEFAULT_DATE) });

  const title = archive.isComplete
    ? `2026 World Cup Bracket: Complete Knockout Results — ${archive.champion} Champions`
    : "World Cup 2026 Bracket — Knockout Stage";
  const description = archive.isComplete
    ? `The complete 2026 FIFA World Cup knockout bracket: every Round of 32 through Final result. ${archive.champion} won the Final ${archive.finalResult?.homeScore}-${archive.finalResult?.awayScore}; ${archive.thirdPlace} finished third.`
    : "The FIFA World Cup 2026 knockout bracket: Round of 32 through to the final. All 32 teams confirmed from the group stage.";

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/bracket` },
    openGraph: { title, description, url: `${BASE_URL}/bracket`, type: "website" },
  };
}

export default async function BracketPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const tournamentPhase = getTournamentPhase({
    matches: MATCHES,
    liveData: snapshot.liveDataByProviderId,
    now: new Date(snapshot.generatedAt),
  });
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(breadcrumbs, BASE_URL)) }}
      />
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <BreadcrumbNav items={breadcrumbs} />
      </div>
      <BracketContent resolvedParticipants={buildKnockoutResolution(snapshot.matches)} tournamentPhase={tournamentPhase} />
    </>
  );
}
