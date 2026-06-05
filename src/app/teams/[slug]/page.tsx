import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { RelatedLinks } from "@/components/related-links";
import { FaqBlock } from "@/components/seo-blocks";
import { TeamMatchCenter } from "@/components/team-match-center";
import { getTeamPageData, getTeams } from "@/lib/football";
import { requestedTeamScheduleSlugs, teamScheduleNames } from "@/lib/seo-content";
import { absoluteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const teams = await getTeams();
  return [
    ...teams.map((team) => ({ slug: team.slug })),
    ...teams.map((team) => ({ slug: `${team.slug}-world-cup-schedule` })),
    ...requestedTeamScheduleSlugs.map((slug) => ({ slug }))
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const scheduleBase = getScheduleBaseSlug(slug);
  if (scheduleBase) {
    const teamName = teamScheduleNames[scheduleBase] || titleCase(scheduleBase);
    return {
      title: `${teamName} World Cup Schedule`,
      description: `${teamName} World Cup 2026 schedule, local kickoff times, shareable cards, and match links.`,
      alternates: {
        canonical: absoluteUrl(`/teams/${slug}`)
      },
      openGraph: {
        title: `${teamName} World Cup Schedule`,
        description: `${teamName} schedule page with matchup context and content tools.`,
        url: absoluteUrl(`/teams/${slug}`)
      }
    };
  }

  const data = await getTeamPageData(slug);
  if (!data) {
    return {
      title: "Team Not Found"
    };
  }
  return {
    title: `${data.team.name} Fixtures and Squad`,
    description: `${data.team.name} World Cup 2026 fixture slots, group table, squad status, and schedule-card entry point.`,
    alternates: {
      canonical: absoluteUrl(`/teams/${slug}`)
    },
    openGraph: {
      title: `${data.team.name} World Cup 2026 Fixtures`,
      description: `Local kickoff times and content hooks for ${data.team.name}.`,
      url: absoluteUrl(`/teams/${slug}`)
    }
  };
}

export default async function TeamPage({ params }: Props) {
  const { slug } = await params;
  const scheduleBase = getScheduleBaseSlug(slug);
  const [data, teams] = await Promise.all([
    getTeamPageData(scheduleBase || slug),
    getTeams()
  ]);

  if (!data) notFound();

  return (
    <PageShell>
      <Link href="/teams" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#0E0C0A]/62 hover:text-[#B48A00]">
        <ArrowLeft size={16} />
        Back to teams
      </Link>
      <TeamMatchCenter
        team={data.team}
        fixtures={data.fixtures}
        groupStandings={data.groupStandings}
        teams={teams}
      />
      <div className="mt-6">
        <RelatedLinks
          links={[
            { href: `/groups/${data.team.group.toLowerCase()}`, label: `Group ${data.team.group}` },
            { href: "/matches", label: "Full schedule" },
            { href: "/standings", label: "Group standings" }
          ]}
        />
      </div>
      <div className="mt-6">
        <FaqBlock
          items={[
            {
              question: `Where can I see ${data.team.name} World Cup fixtures?`,
              answer: `${data.team.name} fixtures are listed on this page with imported kickoff times, venues, and local-time conversion.`
            },
            {
              question: `How does ${data.team.name} qualify from the group stage?`,
              answer: `${data.team.name} qualify by finishing 1st or 2nd in Group ${data.team.group}, which means automatic qualification for the Round of 32. Finishing 3rd may still go through as one of the eight best third-placed teams across the 12 groups, while finishing 4th means elimination.`
            },
            {
              question: "Is this live tournament data?",
              answer: "No. Fixtures are the official WC2026 group stage schedule. Match times are converted to your local timezone. Live scores and standings will update once the tournament begins on June 11."
            }
          ]}
        />
      </div>
    </PageShell>
  );
}

function getScheduleBaseSlug(slug: string) {
  if (!slug.endsWith("-world-cup-schedule")) return null;
  return slug.replace("-world-cup-schedule", "");
}

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
