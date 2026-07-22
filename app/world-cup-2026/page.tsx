import type { Metadata } from "next";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { getArchiveState } from "@/lib/archiveLifecycle";
import { getParticipantDisplay } from "@/lib/participant-resolution";
import { matchSlug, MATCHES, ARCHIVE_DEFAULT_DATE, TOURNAMENT_FINAL_DATE } from "@/lib/matches";
import { getTiedLeaders } from "@/lib/tournamentStats";

/** "A" / "A & B" / "A, B & C" — for naming every player tied for a leaderboard's top value. */
function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

const BASE = "https://www.worldcupmatchday.com";
const now = new Date(ARCHIVE_DEFAULT_DATE);

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const archive = getArchiveState({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, resolvedParticipants, now });

  const title = archive.isComplete
    ? "World Cup 2026 Vault — Winner, Results & Tournament Record"
    : "2026 World Cup Vault: Final Weekend, Results & Stats";
  const description = archive.isComplete
    ? `${archive.champion} won the 2026 FIFA World Cup, beating ${archive.runnerUp} ${archive.finalResult?.homeScore}-${archive.finalResult?.awayScore} in the Final. ${archive.thirdPlace} finished third and ${archive.fourthPlace} finished fourth. Explore the complete 2026 FIFA World Cup Vault and results archive.`
    : "The 2026 FIFA World Cup Vault: full results, bracket, statistics, teams and groups as the tournament reaches its final weekend.";

  return {
    title,
    description,
    alternates: { canonical: `${BASE}/world-cup-2026` },
    openGraph: { title, description, url: `${BASE}/world-cup-2026`, type: "website" },
  };
}

const breadcrumbs = [{ label: "Home", href: "/" }, { label: "World Cup 2026 Vault" }];

export default async function WorldCup2026Page() {
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const archive = getArchiveState({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, resolvedParticipants, now });
  const stats = snapshot.tournamentStats;
  const topScorers = getTiedLeaders(snapshot.topScorers, (p) => p.goals);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: archive.isComplete ? `World Cup 2026 Vault: ${archive.champion} Winner` : "World Cup 2026 Vault",
    url: `${BASE}/world-cup-2026`,
    description: archive.isComplete
      ? `${archive.champion} won the 2026 FIFA World Cup. Complete Vault archive of results, bracket, statistics and teams.`
      : "The 2026 FIFA World Cup Vault hub, updated through the final weekend of the tournament.",
    dateModified: snapshot.generatedAt,
  };

  const finalists = archive.finalResult
    ? [
        { label: archive.finalResult.homeLabel, code: getParticipantDisplay(archive.finalResult.match, "home", resolvedParticipants, "en").teamCode },
        { label: archive.finalResult.awayLabel, code: getParticipantDisplay(archive.finalResult.match, "away", resolvedParticipants, "en").teamCode },
      ]
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(breadcrumbs, BASE)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <BreadcrumbNav items={breadcrumbs} />

      <p className="mb-1 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">FIFA World Cup 2026</p>
      <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white sm:text-5xl">
        {archive.isComplete ? "World Cup 2026 Vault" : "2026 World Cup: Final Weekend"}
      </h1>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted">
        11 June – 19 July 2026, hosted across the United States, Mexico and Canada. All 104 matches are complete.
        {archive.isComplete
          ? ` ${archive.champion} finished as Champions, ${archive.runnerUp} as Runner-up, ${archive.thirdPlace} in Third, and ${archive.fourthPlace} in Fourth.`
          : " The tournament is reaching its conclusion — this page will become the permanent tournament archive once the Final is complete."}
      </p>

      {archive.isComplete && archive.finalResult ? (
        <section className="mb-8 rounded-xl border border-accent/40 bg-gradient-to-b from-accent/10 to-navyCard p-6">
          <p className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-accent">Final Standings</p>
          <div className="mb-4 flex flex-wrap items-center gap-6">
            {finalists.map((f, i) => (
              <div key={f.label} className={`flex items-center gap-2 ${i === 0 ? "font-extrabold text-white" : "text-muted"}`}>
                {f.code && <Flag code={f.code} alt="" width={32} height={22} />}
                <span className="font-heading text-lg uppercase tracking-wide">
                  {i === 0 ? "Champion: " : "Runner-up: "}{f.label}
                </span>
              </div>
            ))}
            {archive.thirdPlace && (
              <div className="flex items-center gap-2 text-muted">
                <Flag code={archive.thirdPlace.toLowerCase() === "england" ? "gb-eng" : ""} alt="" width={32} height={22} />
                <span className="font-heading text-lg uppercase tracking-wide">
                  Third: {archive.thirdPlace}
                </span>
              </div>
            )}
            {archive.fourthPlace && (
              <div className="flex items-center gap-2 text-muted">
                <Flag code={archive.fourthPlace.toLowerCase() === "france" ? "fr" : ""} alt="" width={32} height={22} />
                <span className="font-heading text-lg uppercase tracking-wide">
                  Fourth: {archive.fourthPlace}
                </span>
              </div>
            )}
          </div>
          <p className="mb-1 text-2xl font-extrabold text-white">
            {archive.finalResult.homeLabel} {archive.finalResult.homeScore}–{archive.finalResult.awayScore} {archive.finalResult.awayLabel}
          </p>
          <p className="text-sm text-muted">
            <Link href={`/matches/${matchSlug(archive.finalResult.match)}`} className="underline decoration-white/30 underline-offset-2 hover:text-white">
              Full Final match report →
            </Link>
          </p>
          {archive.thirdPlaceResult && (
            <p className="mt-3 text-sm text-muted">
              Third place: <span className="font-bold text-white">{archive.thirdPlace}</span> beat {archive.fourthPlace}{" "}
              {archive.thirdPlaceResult.homeScore}–{archive.thirdPlaceResult.awayScore} in the{" "}
              <Link href={`/matches/${matchSlug(archive.thirdPlaceResult.match)}`} className="underline decoration-white/30 underline-offset-2 hover:text-white">
                Third-place playoff
              </Link>.
            </p>
          )}
        </section>
      ) : (
        <section className="mb-8 rounded-xl border border-line bg-surface p-6">
          <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-widest text-faint">Tournament at a glance</p>
          <p className="text-sm text-muted">
            The Third-place playoff and Final remain to be played. Follow live results on the{" "}
            <Link href="/today" className="underline decoration-white/30 underline-offset-2 hover:text-white">Match Center</Link>{" "}
            or the{" "}
            <Link href="/bracket" className="underline decoration-white/30 underline-offset-2 hover:text-white">complete bracket</Link>.
          </p>
        </section>
      )}

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Matches played", value: stats.matchesPlayed },
          { label: "Total goals", value: stats.totalGoals },
          { label: "Goals per match", value: stats.averageGoalsPerMatch },
          { label: "Clean sheets", value: stats.cleanSheets },
        ].map((tile) => (
          <div key={tile.label} className="rounded-lg border border-line bg-canvas px-4 py-3 text-center">
            <p className="font-heading text-2xl font-extrabold text-white">{tile.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-faint">{tile.label}</p>
          </div>
        ))}
      </section>

      {topScorers.length > 0 && (
        <p className="mb-8 text-sm text-muted">
          {archive.isComplete ? "Golden Boot winner" : "Golden Boot leader"}{topScorers.length > 1 ? "s" : ""}: <span className="font-bold text-white">{joinNames(topScorers.map((p) => p.playerName))}</span>
          {" "}with {topScorers[0].goals} goal{topScorers[0].goals !== 1 ? "s" : ""}{topScorers.length > 1 ? " each" : ""}. See the{" "}
          <Link href="/stats/top-scorers" className="underline decoration-white/30 underline-offset-2 hover:text-white">full Top Scorers table</Link>.
        </p>
      )}

      <section className="mb-8">
        <h2 className="mb-3 font-heading text-lg font-bold uppercase tracking-wide text-white">Explore the archive</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { href: "/world-cup-2026/results", label: "Full Results", desc: "Every match, every score" },
            { href: "/bracket", label: "Complete Bracket", desc: "Full knockout path" },
            { href: "/stats", label: "Final Statistics", desc: "Goals, scorers, records" },
            { href: "/teams", label: "Teams", desc: "All 48 nations" },
            { href: "/groups", label: "Groups", desc: "Final group standings" },
            { href: "/schedule", label: "Schedule", desc: "Full match calendar" },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg border border-line bg-surface p-4 transition hover:border-lineStrong">
              <p className="font-heading text-sm font-bold uppercase tracking-wide text-white">{link.label}</p>
              <p className="mt-1 text-xs text-faint">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <p className="text-xs text-faint">Tournament window: 11 June – {TOURNAMENT_FINAL_DATE}.</p>
    </div>
  );
}
