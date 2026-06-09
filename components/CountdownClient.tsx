"use client";

import { useCountdown, CountdownTimer } from "@/components/Countdown";
import { useLang } from "@/components/LanguageProvider";

/**
 * Client-only countdown island.
 *
 * Previously returned null until the first useEffect tick, which caused a
 * ~200 px CLS: post-hydration the block was inserted, pushing host-nations
 * flags and the intro paragraph down.
 *
 * Fix: always render the full DOM structure so the space is reserved in the
 * initial HTML (and in the first client render, which must match SSR).
 * visibility:hidden hides the content before real values are known without
 * collapsing the reserved height.  The parent static h1 ("Kickoff: 11 June
 * 2026") remains visible at all times as the no-JS / SEO anchor.
 */
export function CountdownClient() {
  const { t } = useLang();
  const parts = useCountdown(); // null on server + first client render; real value after effect

  // Use placeholder zeros while parts is unknown so SSR and first client
  // render produce identical markup (no hydration mismatch).
  const p = parts ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return (
    <div
      className="mt-1"
      // visibility:hidden preserves layout dimensions (no CLS) while keeping
      // the block invisible until real countdown values are available.
      style={{ visibility: parts !== null ? "visible" : "hidden" }}
      aria-hidden={parts === null}
    >
      <h1 className="font-heading font-extrabold uppercase leading-[0.85] text-white">
        <span className="block text-2xl tracking-wide text-white/80">
          {t("hero_kickoffIn")}
        </span>
        <span className="block text-[52px] leading-none tracking-tight sm:text-7xl" suppressHydrationWarning>
          {p.days}{" "}
          <span className="text-accent">{t("hero_days")}</span>
        </span>
      </h1>
      <div className="mt-6">
        <CountdownTimer />
      </div>
    </div>
  );
}
