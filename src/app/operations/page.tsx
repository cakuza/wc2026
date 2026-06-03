import type { Metadata } from "next";
import { PageIntro, PageShell } from "@/components/page-shell";
import { SectionCard } from "@/components/section-card";
import { getDataMeta, getMatchesWithTeams, getPlayersWithStats, getTeams } from "@/lib/football";

export const metadata: Metadata = {
  title: "Operations",
  description: "Internal operations checklist for WC26 Hub."
};

export default async function OperationsPage() {
  const [meta, teams, matches, players] = await Promise.all([
    getDataMeta(),
    getTeams(),
    getMatchesWithTeams(),
    getPlayersWithStats()
  ]);

  return (
    <PageShell>
      <div className="mb-5 rounded-lg border border-gold/40 bg-gold/10 p-4 text-center font-black uppercase tracking-[0.16em] text-gold">
        Internal Operations Page
      </div>
      <PageIntro
        kicker="Ops"
        title="Launch operations dashboard"
        copy="Static internal checklist for data, content, traffic, deployment, and launch readiness."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <SectionCard title="Data freshness">
          <div className="grid gap-2 text-sm leading-6 text-white/68">
            <p>Last updated: {meta.lastUpdatedUtc}</p>
            <p>Source: {meta.dataSource}</p>
            <p>Mode: {meta.updateMode}</p>
            <p>{meta.note}</p>
          </div>
        </SectionCard>
        <SectionCard title="Dataset status">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Metric label="Teams" value={teams.length} />
            <Metric label="Matches" value={matches.length} />
            <Metric label="Players" value={players.length} />
          </div>
        </SectionCard>
        <Checklist title="Content checklist" items={["Run npm run generate:content", "Publish today's matches post", "Create one share card", "Share one team schedule URL"]} />
        <Checklist title="Launch checklist" items={["Run npm run prelaunch", "Verify sitemap.xml", "Submit Search Console sitemap", "Check mobile Lighthouse"]} />
        <Checklist title="Traffic checklist" items={["Post to X", "Share finished cards in owned channels", "Review Search Console impressions", "Avoid spam"]} />
        <Checklist title="Deployment status" items={["Vercel production deployed", "NEXT_PUBLIC_SITE_URL set", "Ad placeholders disabled", "Analytics env reviewed"]} />
      </div>
    </PageShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-white/[0.04] p-4">
      <p className="text-2xl font-black text-gold">{value}</p>
      <p className="text-sm text-white/55">{label}</p>
    </div>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <SectionCard title={title}>
      <ul className="grid gap-2 text-sm text-white/68">
        {items.map((item) => (
          <li key={item} className="rounded-md bg-white/[0.04] p-3">{item}</li>
        ))}
      </ul>
    </SectionCard>
  );
}
