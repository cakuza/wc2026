"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Flag } from "@/components/Flag";
import { useLang } from "@/components/LanguageProvider";
import { MATCHES } from "@/lib/matches";

const PIXELS_PER_SECOND = 80;

/**
 * TickerDuplicate is loaded with { ssr: false }.
 * This is the ONLY reliable way in Next.js App Router to guarantee a
 * component never appears in SSR HTML — useState conditionals are still
 * executed on the server.
 */
const TickerDuplicate = dynamic(
  () => import("@/components/TickerDuplicate"),
  { ssr: false }
);

/** Build the list of matches to show in the ticker.
 *  – Prefer matches in the next 7 calendar days (at least 5).
 *  – If fewer than 5 qualify, fall back to the next 10 upcoming matches.
 *  – Always sorted ascending by date.
 */
function getTickerMatches() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const sevenDaysLater = new Date(todayStart);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  const sorted = [...MATCHES].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const nextSevenDays = sorted.filter((m) => {
    const d = new Date(m.date);
    return d >= todayStart && d <= sevenDaysLater;
  });

  if (nextSevenDays.length >= 5) return nextSevenDays;

  // Fallback: next 10 upcoming matches from today
  return sorted.filter((m) => new Date(m.date) >= todayStart).slice(0, 10);
}

function TickerItems({ items }: { items: typeof MATCHES }) {
  const { t, country, formatDate } = useLang();
  return (
    <>
      {items.map((m, i) => (
        <span
          key={i}
          className="mx-4 flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-white"
        >
          <Flag code={m.homeCode} alt="" width={22} height={16} className="rounded-sm" />
          <span>{country(m.homeKey)}</span>
          <span className="opacity-70">{t("vs")}</span>
          <Flag code={m.awayCode} alt="" width={22} height={16} className="rounded-sm" />
          <span>{country(m.awayKey)}</span>
          <span className="opacity-70">·</span>
          <span className="opacity-80">{formatDate(m.date)}</span>
        </span>
      ))}
    </>
  );
}

export function Ticker() {
  const { t, country, formatDate } = useLang();
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number | null>(null);

  /**
   * dupeReady becomes true when TickerDuplicate fires its onMount callback.
   * The animation useEffect depends on dupeReady so it re-runs once the
   * duplicate is actually in the DOM — at that point scrollWidth = 2×
   * single-copy width and the seamless loop works correctly.
   */
  const [dupeReady, setDupeReady] = useState(false);
  const handleDupeMount = useCallback(() => setDupeReady(true), []);

  const tickerMatches = getTickerMatches();

  useEffect(() => {
    // Don't start until the duplicate is in the DOM (correct scrollWidth).
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, country, formatDate, dupeReady]);

  return (
    <div className="overflow-hidden border-b border-white/10 bg-accent">
      <div className="flex items-stretch">
        <span className="z-10 flex shrink-0 items-center bg-black/25 px-4 font-heading text-sm font-extrabold uppercase tracking-wider text-white">
          {t("ticker_label")}
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div ref={trackRef} className="flex w-max items-center py-2">
            {/* Real copy — visible to screen readers and Googlebot */}
            <div className="flex items-center">
              <TickerItems items={tickerMatches} />
            </div>

            {/*
             * Duplicate for seamless visual loop.
             * Loaded with { ssr: false } — NEVER in SSR HTML.
             * aria-hidden + data-nosnippet set inside TickerDuplicate itself.
             */}
            <TickerDuplicate items={tickerMatches} onMount={handleDupeMount} />
          </div>
        </div>
      </div>
    </div>
  );
}
