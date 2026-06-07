"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

export function Footer() {
  const { t } = useLang();

  const NAV_LINKS = [
    { href: "/",         label: t("nav_today")    },
    { href: "/teams",    label: t("nav_teams")    },
    { href: "/groups",   label: t("nav_groups")   },
    { href: "/schedule", label: t("nav_schedule") },
    { href: "/bracket",  label: t("nav_bracket")  },
    { href: "/quiz",     label: t("nav_quiz")     },
  ];

  return (
    <footer className="border-t border-white/10 bg-navy">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-heading text-lg font-extrabold tracking-tight text-white">WorldCupMatchDay</span>
              <span className="rounded bg-accent px-1.5 py-0.5 font-heading text-xs font-extrabold leading-none text-white">2026</span>
            </Link>
            <p className="font-heading text-sm font-extrabold uppercase tracking-wide text-white/60">
              FIFA World Cup <span className="text-accent">2026</span> · {t("footer_dates")}
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:justify-end">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-heading text-xs font-bold uppercase tracking-wide text-white/40 transition hover:text-white/80"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 border-t border-white/5 pt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="font-heading text-[11px] font-bold uppercase tracking-widest text-white/20">
            © 2026 WorldCupMatchDay · Fan-made · Not affiliated with FIFA
          </p>
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {[
              { href: "/about",   label: t("footer_about")   },
              { href: "/contact", label: t("footer_contact") },
              { href: "/privacy", label: t("footer_privacy") },
              { href: "/terms",   label: t("footer_terms")   },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-heading text-[11px] font-bold uppercase tracking-widest text-white/20 transition hover:text-white/50"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
