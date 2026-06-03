import type { Metadata } from "next";
import { PageIntro, PageShell } from "@/components/page-shell";
import { PreviewGenerator } from "@/components/preview-generator";
import { RelatedLinks } from "@/components/related-links";
import { getMatchesWithTeams } from "@/lib/football";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "World Cup 2026 Match Preview Generator",
  description: "Template-based match preview, X post, group-chat message, and Instagram caption generator with editable copy.",
  alternates: {
    canonical: absoluteUrl("/preview")
  },
  openGraph: {
    title: "World Cup 2026 Match Preview Generator",
    description: "Generate editable match previews and social snippets without paid AI APIs.",
    url: absoluteUrl("/preview")
  }
};

export default async function PreviewPage() {
  const matches = await getMatchesWithTeams();
  return (
    <PageShell>
      <PageIntro
        kicker="Social copy"
        title="Match preview copy for fans, not filler."
        copy="Choose a match and generate editable X, group-chat, Instagram, and SEO copy that talks about the group story, prediction angle, and save-this action without raw placeholder text."
      />
      <PreviewGenerator matches={matches} />
      <div className="mt-6">
        <RelatedLinks
          links={[
            { href: "/matches", label: "Choose a match" },
            { href: "/cards", label: "Create share card" },
            { href: "/world-cup-matches-today", label: "Today's matches" },
            { href: "/leaderboards", label: "Leaderboards" }
          ]}
        />
      </div>
    </PageShell>
  );
}
