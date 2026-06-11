"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { TimezoneLabel } from "@/components/TimezoneLabel";
import { OPENING_MATCH, matchSlug, matchUtcDate } from "@/lib/matches";

const OPENER_DATE_LABEL = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date(`${OPENING_MATCH.date}T00:00:00`));

/**
 * Compact "opening match" banner for the homepage. Visible by default (matches the SSR
 * render, which is correct on the opener's matchday); hides itself once the opener has
 * finished, based on the viewer's clock.
 */
export function OpeningMatchBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const matchEnd = matchUtcDate(OPENING_MATCH).getTime() + 110 * 60 * 1000;
    setVisible(Date.now() < matchEnd);
  }, []);

  if (!visible) return null;

  return (
    <Link
      href={`/matches/${matchSlug(OPENING_MATCH)}`}
      className="block border-b border-white/10 bg-accent/10 transition hover:bg-accent/15"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <div className="min-w-0">
          <p className="font-heading text-xs font-extrabold uppercase tracking-widest text-accent">
            Opening match today
          </p>
          <p className="mt-0.5 max-w-2xl text-sm text-white/80">
            Mexico vs South Africa opens the World Cup 2026. Check kickoff time, venue and
            matchday context in your selected timezone.
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
          <MatchTime match={OPENING_MATCH} className="font-semibold text-white" />
          <TimezoneLabel className="text-[10px] text-white/45" />
        </div>
      </div>
    </Link>
  );
}
