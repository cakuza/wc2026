"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function StatsNav() {
  const pathname = usePathname() || "";

  const tabs = [
    { name: "Overview", href: "/stats" },
    { name: "Players", href: "/stats/players", matchPrefix: "/stats/players" },
    { name: "Top Scorers", href: "/stats/top-scorers", matchPrefix: "/stats/top-scorers" },
    { name: "Teams", href: "/stats/teams", matchPrefix: "/stats/teams" },
    { name: "Compare", href: "/stats/compare", matchPrefix: "/stats/compare" },
    { name: "Matches", href: "/stats/matches", matchPrefix: "/stats/matches" },
    { name: "Groups", href: "/groups", matchPrefix: "/groups" },
  ];

  return (
    <div className="sticky top-0 z-10 -mx-4 mb-8 overflow-x-auto bg-navy/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:px-0 sm:bg-navy/80 border-b border-white/10">
      <nav className="flex items-center gap-2 sm:gap-4 w-max">
        {tabs.map((tab) => {
          const isActive = tab.href === "/stats" ? pathname === "/stats" : pathname.startsWith(tab.matchPrefix!);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`shrink-0 rounded-full px-4 py-2 font-heading text-xs font-bold uppercase tracking-widest transition ${
                isActive
                  ? "bg-accent text-navy"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
