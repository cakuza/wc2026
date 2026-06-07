import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamDetail } from "@/components/TeamDetail";
import { TEAMS, slugFor, teamBySlug, teamsInGroup } from "@/lib/teams";
import { matchesInGroup } from "@/lib/matches";
import { squadFor } from "@/lib/squads";
import { countryName } from "@/lib/i18n";

export function generateStaticParams() {
  return TEAMS.map((t) => ({ slug: slugFor(t.key) }));
}

export const dynamicParams = false;

// ── helpers ────────────────────────────────────────────────────────────────

function longDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}

// ── generateMetadata ───────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = teamBySlug(slug);
  if (!team) return {};

  const name = countryName(team.key, "en");
  const squad = squadFor(team.key);
  const playerCount = squad?.length ?? 0;
  const BASE = "https://www.worldcupmatchday.com";
  const url = `${BASE}/teams/${slug}`;
  const flagUrl = `https://flagcdn.com/w320/${team.code}.png`;

  // Opponents for richer description
  const opponents = teamsInGroup(team.group)
    .filter((t) => t.key !== team.key)
    .map((t) => countryName(t.key, "en"));
  const opponentStr = opponents.join(", ");

  const title = `${name} World Cup 2026 — Schedule, Squad & Group ${team.group}`;
  const description =
    `${name} FIFA World Cup 2026: Group ${team.group} fixtures vs ${opponentStr}. ` +
    (playerCount > 0 ? `Squad of ${playerCount} players. ` : "") +
    `Qualification scenarios and group standings.`;

  return {
    title,
    description,
    keywords: [
      name,
      "FIFA World Cup 2026",
      `${name} World Cup 2026`,
      `${name} squad`,
      `${name} fixtures`,
      `Group ${team.group} World Cup 2026`,
      "World Cup schedule",
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: flagUrl, width: 320, height: 213, alt: `${name} flag` }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [flagUrl],
    },
  };
}

// ── page ───────────────────────────────────────────────────────────────────

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = teamBySlug(slug);
  if (!team) notFound();

  const groupTeams = teamsInGroup(team.group);
  const groupMatches = matchesInGroup(team.group);
  const name = countryName(team.key, "en");

  // Team's first match (sorted ascending → first entry)
  const teamFirstMatch = groupMatches
    .filter((m) => m.homeKey === team.key || m.awayKey === team.key)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const firstOpponentKey = teamFirstMatch
    ? teamFirstMatch.homeKey === team.key
      ? teamFirstMatch.awayKey
      : teamFirstMatch.homeKey
    : null;

  const teammates = groupTeams
    .filter((t) => t.key !== team.key)
    .map((t) => countryName(t.key, "en"));

  // ── JSON-LD: SportsOrganization ──────────────────────────────────────────
  const sportsOrgLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: `${name} national football team`,
    sport: "Association football",
    url: `https://www.worldcupmatchday.com/teams/${slugFor(team.key)}`,
    logo: `https://flagcdn.com/w160/${team.code}.png`,
    memberOf: {
      "@type": "SportsEvent",
      name: "FIFA World Cup 2026",
      startDate: "2026-06-11",
      endDate: "2026-07-19",
      location: { "@type": "Place", name: "USA, Canada, Mexico" },
    },
  };

  // ── JSON-LD: FAQPage ─────────────────────────────────────────────────────
  const faqEntities: object[] = [];

  if (teamFirstMatch && firstOpponentKey) {
    const opponentName = countryName(firstOpponentKey, "en");
    const dateStr = longDate(teamFirstMatch.date);
    const timeStr = teamFirstMatch.time ? ` at ${teamFirstMatch.time} local time` : "";
    const venueStr = teamFirstMatch.venue ? ` at ${teamFirstMatch.venue}` : "";
    faqEntities.push({
      "@type": "Question",
      name: `When is ${name}'s first match at the 2026 FIFA World Cup?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${name} play ${opponentName} on ${dateStr}${timeStr}${venueStr}.`,
      },
    });
  }

  faqEntities.push({
    "@type": "Question",
    name: `What group is ${name} in at the 2026 World Cup?`,
    acceptedAnswer: {
      "@type": "Answer",
      text: `${name} are in Group ${team.group} with ${teammates.join(", ")}.`,
    },
  });

  faqEntities.push({
    "@type": "Question",
    name: `How can ${name} qualify for the knockout stage at World Cup 2026?`,
    acceptedAnswer: {
      "@type": "Answer",
      text:
        `${name} qualify automatically by finishing 1st or 2nd in Group ${team.group}. ` +
        `They may also advance as one of the 8 best third-placed teams across all groups.`,
    },
  });

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntities,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsOrgLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <TeamDetail team={team} groupTeams={groupTeams} groupMatches={groupMatches} />
    </>
  );
}
