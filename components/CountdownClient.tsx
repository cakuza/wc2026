"use client";

import { useCountdown, CountdownTimer } from "@/components/Countdown";
import { useLang } from "@/components/LanguageProvider";

/**
 * Client-only countdown island.
 *
 * Returns null until the first useEffect tick so that nothing from this
 * component appears in SSR HTML.  The parent (Hero) renders a static
 * "Kickoff: 11 June 2026" string for Google; this component replaces it
 * visually with the live countdown once JS has hydrated.
 */
export function CountdownClient() {
  const { t } = useLang();
  const parts = useCountdown();

  // Nothing in the SSR/pre-hydration render
  if (!parts) return null;

  return (
    <div className="mt-1">
      <h1 className="font-heading font-extrabold uppercase leading-[0.85] text-white">
        <span className="block text-2xl tracking-wide text-white/80">
          {t("hero_kickoffIn")}
        </span>
        <span className="block text-[52px] leading-none tracking-tight sm:text-7xl">
          {parts.days}{" "}
          <span className="text-accent">{t("hero_days")}</span>
        </span>
      </h1>
      <div className="mt-6">
        <CountdownTimer />
      </div>
    </div>
  );
}
