import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { TimezoneLabel } from "@/components/TimezoneLabel";
import { OPENING_MATCH, matchSlug, matchUtcDate } from "@/lib/matches";
import { countryName } from "@/lib/i18n";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import type { GoalScorerEvent } from "@/lib/worldcup26Provider";

type Phase = "before" | "live" | "after";

const MATCH_DURATION_MS = 150 * 60 * 1000; // ~2.5 hours, kickoff to full-time

const OPENER_DATE_LABEL = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date(`${OPENING_MATCH.date}T00:00:00`));

function getPhase(): Phase {
  const kickoff = matchUtcDate(OPENING_MATCH).getTime();
  const now = Date.now();
  if (now < kickoff) return "before";
  if (now < kickoff + MATCH_DURATION_MS) return "live";
  return "after";
}

const TITLES: Record<Phase, string> = {
  before: "Opening match today",
  live: "Opening match now",
  after: "Opening match complete",
};

function scorerText(events: GoalScorerEvent[] | undefined) {
  if (!events || events.length === 0) return null;
  return events
    .map((e) => (e.minute != null ? `${e.minute}' ${e.playerName}` : e.playerName))
    .join(" · ");
}

/**
 * Compact "opening match" banner for the homepage. Finished-match score and scorer
 * details come from the same shared live/scorer maps used by match pages and stats.
 */
export async function OpeningMatchBanner() {
  const phase = getPhase();
  const snapshot = await getTournamentLiveSnapshot();
  const snapshotMatch = snapshot.matches[matchSlug(OPENING_MATCH)];
  const live = snapshotMatch?.live ?? undefined;
  const isFinished =
    live?.status === "FINISHED" &&
    live.homeScore !== null &&
    live.awayScore !== null;
  const scorers = scorerText(snapshotMatch?.scorers);
  const home = countryName(OPENING_MATCH.homeKey, "en");
  const away = countryName(OPENING_MATCH.awayKey, "en");

  return (
    <section className="border-b border-white/10 bg-accent/10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <div className="min-w-0">
          <p className="font-heading text-xs font-extrabold uppercase tracking-widest text-accent">
            {isFinished ? "Opening match complete" : TITLES[phase]}
          </p>
          {isFinished ? (
            <>
              <p className="mt-0.5 font-heading text-lg font-extrabold text-white">
                {home} {live.homeScore}–{live.awayScore} {away}
              </p>
              {scorers ? (
                <p className="mt-0.5 max-w-2xl text-sm text-white/70">
                  Goals: {scorers}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-accent">
                <Link href={`/matches/${matchSlug(OPENING_MATCH)}`} className="hover:text-white">
                  View match result
                </Link>
                <Link href="/today" className="hover:text-white">
                  See today&apos;s matches
                </Link>
                <Link href="/groups" className="hover:text-white">
                  View group standings
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-0.5 max-w-2xl text-sm text-white/80">
              {home} vs {away} opens the World Cup 2026. Check kickoff time, venue and
              matchday context in your selected timezone.
            </p>
          )}
        </div>

        <div className="ms-auto flex items-center gap-2">
          <Flag code={OPENING_MATCH.homeCode} alt="" width={24} height={18} />
          <span className="font-heading text-[10px] font-bold uppercase text-white/60">vs</span>
          <Flag code={OPENING_MATCH.awayCode} alt="" width={24} height={18} />
        </div>

        <div className="text-end text-xs text-white/60">
          <div>
            {OPENER_DATE_LABEL} · {OPENING_MATCH.venue}
          </div>
          <MatchTime match={OPENING_MATCH} withZone className="font-semibold text-white" />
          <TimezoneLabel className="text-[10px] text-white/45" />
        </div>
      </div>
    </section>
  );
}
