import type { Metadata } from "next";
import { PageIntro, PageShell } from "@/components/page-shell";
import { SectionCard } from "@/components/section-card";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "World Cup 2026 Launch Checklist",
  description: "A low-cost launch checklist for SEO, data updates, social sharing, deployment, monetization, and API upgrades.",
  alternates: {
    canonical: absoluteUrl("/launch-checklist")
  },
  openGraph: {
    title: "World Cup 2026 Launch Checklist",
    description: "Pre-launch checklist for deploying and growing WC26 Hub.",
    url: absoluteUrl("/launch-checklist")
  }
};

const sections = [
  {
    title: "SEO checklist",
    items: ["Confirm sitemap.xml includes all launch pages", "Submit domain in Google Search Console", "Check titles and descriptions", "Add internal links from homepage to core pages"]
  },
  {
    title: "Data update checklist",
    items: ["Edit JSON files in data/", "Run npm run validate:data", "Run npm run prelaunch", "Deploy after checks pass"]
  },
  {
    title: "Social sharing checklist",
    items: ["Create cards for top schedule pages", "Draft match posts in /preview", "Share top scorers and team schedule URLs", "Keep image copy short and readable"]
  },
  {
    title: "Deployment checklist",
    items: ["Set NEXT_PUBLIC_SITE_URL", "Keep analytics env vars empty until needed", "Deploy to Vercel free tier", "Verify /robots.txt and /sitemap.xml"]
  },
  {
    title: "Monetization checklist",
    items: ["Keep ad placeholders disabled at launch", "Apply only after content and traffic exist", "Test Core Web Vitals before turning ads on", "Prefer non-invasive placements"]
  },
  {
    title: "API upgrade checklist",
    items: ["Keep mock provider active until demand is clear", "Add cached API fixtures first", "Add standings/player stats later", "Add Supabase and cron only if traffic justifies it"]
  }
];

export default function LaunchChecklistPage() {
  return (
    <PageShell>
      <PageIntro
        kicker="Launch ops"
        title="Pre-launch checklist"
        copy="A practical, public checklist for keeping the World Cup MVP cheap, indexable, shareable, and easy to upgrade."
      />
      <div className="grid gap-5 md:grid-cols-2">
        {sections.map((section) => (
          <SectionCard key={section.title} title={section.title}>
            <ul className="grid gap-3 text-sm leading-6 text-white/68">
              {section.items.map((item) => (
                <li key={item} className="rounded-md bg-white/[0.04] p-3">{item}</li>
              ))}
            </ul>
          </SectionCard>
        ))}
      </div>
    </PageShell>
  );
}
