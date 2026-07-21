import type { Metadata } from "next";
import Link from "next/link";
import { Ticker } from "@/components/Ticker";
import { Hero } from "@/components/Hero";
import { HomeTrivia } from "@/components/HomeTrivia";
import { TeamsByConfederationPreview } from "@/components/TeamsByConfederation";
import { ARCHIVE_DEFAULT_DATE, matchUtcDate, MATCHES } from "@/lib/matches";
import { getDisplayMatchdayForTimeZone } from "@/lib/todaySelection";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { selectHomepageTickerMatches, getHomepageMatchCenterSnapshot, getTournamentPhase } from "@/lib/matchCenterSelection";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { getArchiveState } from "@/lib/archiveLifecycle";
import { getResolvedAwayTeam, getResolvedHomeTeam } from "@/lib/participant-resolution";
import { countryName } from "@/lib/i18n";
import { websiteSchema } from "@/lib/schema";

const BASE_URL = "https://www.worldcupmatchday.com";

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const archive = getArchiveState({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, resolvedParticipants, now: new Date(ARCHIVE_DEFAULT_DATE) });
  const final = MATCHES.find((match) => "matchNumber" in match && match.matchNumber === 104);
  const thirdPlace = MATCHES.find((match) => "matchNumber" in match && match.matchNumber === 103);
  const finalHome = final ? getResolvedHomeTeam(final, resolvedParticipants) : null;
  const finalAway = final ? getResolvedAwayTeam(final, resolvedParticipants) : null;
  const thirdHome = thirdPlace ? getResolvedHomeTeam(thirdPlace, resolvedParticipants) : null;
  const thirdAway = thirdPlace ? getResolvedAwayTeam(thirdPlace, resolvedParticipants) : null;
  const finalTeams = finalHome && finalAway ? `${countryName(finalHome, "en")} vs ${countryName(finalAway, "en")}` : "2026 World Cup Final";
  const thirdTeams = thirdHome && thirdAway ? `${countryName(thirdHome, "en")} vs ${countryName(thirdAway, "en")} Third-place playoff` : "Third-place playoff";

  const isThirdPlaceFinished = snapshot.matches["match-103"]?.status === "FINISHED";

  const title = archive.isComplete
    ? `WorldCupMatchDay — ${archive.champion} Win the 2026 World Cup`
    : isThirdPlaceFinished
      ? `2026 World Cup Final: ${finalTeams} (England Clinch Third)`
      : `2026 World Cup Final: ${finalTeams} & ${thirdTeams}`;

  const description = archive.isComplete
    ? `${archive.champion} won the 2026 FIFA World Cup, beating ${archive.runnerUp} ${archive.finalResult?.homeScore}-${archive.finalResult?.awayScore} in the Final. Full results, bracket, stats and teams archive.`
    : isThirdPlaceFinished
      ? `${finalTeams} in the 2026 World Cup Final. England secured third place with a 6–4 victory over France. See kickoff times, venues, Final preview and the full bracket.`
      : `${finalTeams} in the 2026 World Cup Final, with ${thirdHome && thirdAway ? `${countryName(thirdHome, "en")} vs ${countryName(thirdAway, "en")}` : "the Third-place playoff"}. See kickoff times, venues, semifinal results and the full bracket.`;

  return { title, description, alternates: { canonical: BASE_URL }, openGraph: { title, description, url: BASE_URL, type: "website" } };
}

export const revalidate = 3600;

export default async function HomePage() {
  const selectedTimeZone = DEFAULT_TIMEZONE;
  const now = new Date(ARCHIVE_DEFAULT_DATE);
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const archiveState = getArchiveState({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, resolvedParticipants, now });
  const tickerMatches = selectHomepageTickerMatches({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, now, resolvedParticipants });
  const initialMatchday = getDisplayMatchdayForTimeZone({ now, timeZone: selectedTimeZone, resolvedParticipants, liveDataByProviderId: snapshot.liveDataByProviderId });
  const tournamentPhase = getTournamentPhase({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, now });
  const homepageMatches = getHomepageMatchCenterSnapshot({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, now, phase: tournamentPhase });
  // The shared selector already identifies the first placement match that is
  // not final. Do not hard-code Match 103 here: between the third-place
  // playoff and the Final, the countdown must advance to Match 104.
  const nextCountdownMatch = homepageMatches.nextDestinationMatch ?? homepageMatches.upcomingCurrentRound[0];
  const countdownTarget = nextCountdownMatch ? matchUtcDate(nextCountdownMatch).toISOString() : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }} />
      <Ticker items={tickerMatches} resolvedParticipants={resolvedParticipants} />
      {snapshot.isFallback ? <div className="mx-auto max-w-7xl px-4 pt-6"><LiveDataUnavailableNotice show /></div> : null}
      <Hero initialMatchday={initialMatchday} snapshot={snapshot} resolvedParticipants={resolvedParticipants} tournamentPhase={tournamentPhase} countdownTarget={countdownTarget} archiveState={archiveState} />
      {archiveState.isComplete ? (
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h2 className="mb-3 font-heading text-lg font-bold uppercase tracking-wide text-white">Explore the 2026 Archive</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { href: "/world-cup-2026/results", label: "Full Results" },
              { href: "/bracket", label: "Bracket" },
              { href: "/stats", label: "Statistics" },
              { href: "/stats/top-scorers", label: "Top Scorers" },
              { href: "/teams", label: "Teams" },
              { href: "/groups", label: "Groups" },
              { href: "/schedule", label: "Schedule" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="rounded-lg border border-white/10 bg-navyCard px-4 py-3 text-center font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/25 hover:text-white">{link.label}</Link>
            ))}
          </div>
        </div>
      ) : null}
      <HomeTrivia />
      <TeamsByConfederationPreview />
    </>
  );
}
