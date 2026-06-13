"use client";

import { Flag } from "@/components/Flag";
import { CountdownClient } from "@/components/CountdownClient";
import { TodayMatches } from "@/components/TodayMatches";
import { useLang } from "@/components/LanguageProvider";
import { type DisplayMatchday } from "@/lib/matches";

export function Hero({ initialMatchday }: { initialMatchday: DisplayMatchday }) {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-navy">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(60% 70% at 20% 0%, rgba(232,0,28,0.22), transparent 60%), radial-gradient(50% 60% at 90% 100%, rgba(232,0,28,0.14), transparent 60%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-16">
        {/* Left: static date + countdown island */}
        <div>
          <p className="font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
            FIFA World Cup 2026
          </p>

          {/*
           * STATIC — always in SSR HTML, indexed by Google.
           * CountdownClient (below) renders the live countdown on top of this
           * once JS is loaded.  Without JS this is the primary heading.
           */}
          <h1 className="mt-3 font-heading text-[44px] font-extrabold uppercase leading-tight tracking-tight text-white sm:text-[56px]">
            {t("hero_kickoff_heading")}
          </h1>

          {/*
           * CLIENT ISLAND — returns null on the server (parts === null).
           * Renders the live "5 DAYS / HH MM SS" countdown post-hydration.
           * Visually extends the section; the static h1 above acts as a
           * no-JS fallback and permanent SEO anchor.
           */}
          <CountdownClient />

          {/* Host nations */}
          <div className="mt-6">
            <div className="flex items-center gap-4">
              {[
                { code: "us", name: "USA" },
                { code: "ca", name: "Canada" },
                { code: "mx", name: "Mexico" },
              ].map((h) => (
                <div key={h.code} className="flex items-center gap-2">
                  <Flag
                    code={h.code}
                    alt=""
                    width={28}
                    height={20}
                    className="rounded-sm shadow-sm"
                  />
                  <span className="font-heading text-sm font-bold uppercase tracking-wide text-white/70">
                    {h.name}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 font-heading text-xs font-bold uppercase tracking-widest text-white/50">
              {t("hero_subline")}
            </p>
            <p className="mt-4 max-w-xl text-sm text-white/70">{t("home_intro")}</p>
          </div>
        </div>

        {/* Right: dynamic today's / next matches (client component) */}
        <TodayMatches initialMatchday={initialMatchday} />
      </div>
    </section>
  );
}
