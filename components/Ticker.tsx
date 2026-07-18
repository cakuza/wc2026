"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Flag } from "@/components/Flag";
import { useLang } from "@/components/LanguageProvider";
import { useTimezone } from "@/components/TimezoneProvider";
import { matchUtcDate, type Match } from "@/lib/matches";
import { getMatchCalendarDateInZone } from "@/lib/todaySelection";
import type { ResolvedParticipantLookup } from "@/lib/participant-resolution";
import { mergeResolvedParticipantsFromApiMatches } from "@/lib/resolvedParticipantsFromApi";
import { getTickerDisplay } from "@/lib/tickerDisplay";

const PIXELS_PER_SECOND = 80;

const TickerDuplicate = dynamic(
  () => import("@/components/TickerDuplicate"),
  { ssr: false },
);

function TickerItems({
  items,
  resolvedParticipants,
}: {
  items: Match[];
  resolvedParticipants?: ResolvedParticipantLookup;
}) {
  const { t, lang, formatDate } = useLang();
  const { timeZone } = useTimezone();

  return (
    <>
      {items.map((m, i) => {
        const { home, away } = getTickerDisplay(m, resolvedParticipants, lang);
        return (
          <span
            key={i}
            className="mx-4 flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-white"
          >
            {home.teamCode && <Flag code={home.teamCode} alt="" width={22} height={16} className="rounded-sm" />}
            <span>{home.label}</span>
            <span className="opacity-70">{t("vs")}</span>
            {away.teamCode && <Flag code={away.teamCode} alt="" width={22} height={16} className="rounded-sm" />}
            <span>{away.label}</span>
            <span className="opacity-70">·</span>
            <span className="opacity-80">{formatDate(getMatchCalendarDateInZone(matchUtcDate(m), timeZone))}</span>
          </span>
        );
      })}
    </>
  );
}

export function Ticker({
  items,
  resolvedParticipants,
}: {
  items: Match[];
  resolvedParticipants?: ResolvedParticipantLookup;
}) {
  const { t, formatDate } = useLang();
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number | null>(null);
  const [dupeReady, setDupeReady] = useState(false);
  const handleDupeMount = useCallback(() => setDupeReady(true), []);

  useEffect(() => {
    if (!dupeReady) return;

    const track = trackRef.current;
    if (!track) return;

    cancelAnimationFrame(rafRef.current);

    const halfW = track.scrollWidth / 2;
    if (halfW <= 0) return;

    posRef.current = 0;
    lastRef.current = null;

    function tick(now: number) {
      if (lastRef.current === null) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;

      posRef.current += PIXELS_PER_SECOND * dt;
      if (posRef.current >= halfW) posRef.current -= halfW;

      if (track) track.style.transform = `translateX(${-posRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [t, formatDate, dupeReady]);

  return (
    <div className="overflow-hidden border-b border-white/10 bg-accent">
      <div className="flex items-stretch">
        <div className="relative flex-1 overflow-hidden">
          <div ref={trackRef} className="flex w-max items-center py-2">
            <div className="flex items-center">
              <TickerItems items={items} resolvedParticipants={resolvedParticipants} />
            </div>
            <TickerDuplicate items={items} resolvedParticipants={resolvedParticipants} onMount={handleDupeMount} />
          </div>
        </div>
      </div>
    </div>
  );
}
