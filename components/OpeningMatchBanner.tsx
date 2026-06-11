"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { TimezoneLabel } from "@/components/TimezoneLabel";
import { OPENING_MATCH, matchSlug, matchUtcDate } from "@/lib/matches";

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

/**
 * Compact "opening match" banner for the homepage. Phase is computed from Date.now() on
 * both server and client (like useCountdown), so the title reflects the real kickoff
 * window immediately. Hides itself a day after the opener has finished.
 */
export function OpeningMatchBanner() {
  const [phase, setPhase] = useState<Phase>(getPhase);

  useEffect(() => {
    const id = setInterval(() => setPhase(getPhase()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Hide the banner a full day after the opener has finished.
  const hideAfter = matchUtcDate(OPENING_MATCH).getTime() + MATCH_DURATION_MS + 24 * 60 * 60 * 1000;
  if (Date.now() > hideAfter) return null;

  return (
    <Link
      href={`/matches/${matchSlug(OPENING_MATCH)}`}
      className="block border-b border-white/10 bg-accent/10 transition hover:bg-accent/15"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3" suppressHydrationWarning>
        <div className="min-w-0">
          <p className="font-heading text-xs font-extrabold uppercase tracking-widest text-accent">
            {TITLES[phase]}
          </p>
          <p className="mt-0.5 max-w-2xl text-sm text-white/80">
            Mexico vs South Africa{" "}
            {phase === "after"
              ? "opened the World Cup 2026."
              : "opens the World Cup 2026."}{" "}
            Check kickoff time, venue and matchday context in your selected timezone.
          </p>
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
    </Link>
  );
}
