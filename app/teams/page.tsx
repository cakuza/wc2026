import type { Metadata } from "next";
import Link from "next/link";
import { TeamsByConfederation } from "@/components/TeamsByConfederation";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "All World Cup 2026 Teams by Confederation",
  description:
    "See all 48 World Cup 2026 teams grouped by confederation, with links to team fixtures, groups and match pages.",
  alternates: { canonical: `${BASE_URL}/teams` },
  openGraph: {
    title: "All World Cup 2026 Teams by Confederation",
    description:
      "All 48 World Cup 2026 teams grouped by confederation, with links to each team's fixtures and group.",
    url: `${BASE_URL}/teams`,
    type: "website",
  },
};

export default function TeamsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
        All Teams
      </h1>
      <p className="mb-6 max-w-3xl text-sm text-white/55">
        Explore all 48 World Cup 2026 teams grouped by confederation, with links to each team&apos;s
        fixtures and group.
      </p>

      <TeamsByConfederation />

      <p className="mt-8 text-sm">
        <Link
          href="/world-cup-2026-teams-by-confederation"
          className="font-semibold text-accent underline underline-offset-2 hover:text-white"
        >
          About the confederations →
        </Link>
      </p>
    </div>
  );
}
