"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLang } from "@/components/LanguageProvider";

export function Nav() {
  const { t } = useLang();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/today", key: "nav_today" },
    { href: "/schedule", key: "nav_schedule" },
    { href: "/groups", key: "nav_groups" },
    { href: "/teams", key: "nav_teams" },
    { href: "/bracket", key: "nav_bracket" },
    { href: "/stats", key: "nav_stats" },
    { href: "/matchday-hub", key: "nav_matchdayHub" }
  ];

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-accent bg-navy">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <span className="font-heading text-xl font-extrabold tracking-tight text-white">WorldCupMatchDay</span>
            <span className="font-sans text-[11px] font-black tracking-widest bg-red-600 text-white px-1.5 py-0.5 rounded">2026</span>
          </Link>
          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded px-3 py-2 font-heading text-sm font-bold uppercase tracking-wide transition ${
                    active ? "bg-accent text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {t(l.key)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {/* Hamburger button — mobile only */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded border border-white/15 bg-white/5 text-white transition hover:bg-white/10 md:hidden"
          >
            {menuOpen ? (
              /* X icon */
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className="border-t border-white/10 bg-navy md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              {links.map((l) => {
                const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-3 font-heading text-sm font-bold uppercase tracking-wide transition ${
                      active
                        ? "bg-accent text-white"
                        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {t(l.key)}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
