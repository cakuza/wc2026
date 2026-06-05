import type { Metadata } from "next";
import { PageIntro, PageShell } from "@/components/page-shell";
import { QuizClient } from "@/components/quiz-client";
import { RelatedLinks } from "@/components/related-links";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "World Cup Quiz 2026: Test Your Knowledge (10 Questions)",
  description:
    "Take the 10-question World Cup quiz. Score yourself from Casual Fan to Golden Ball Brain and share your result. No login required.",
  alternates: { canonical: absoluteUrl("/world-cup-quiz") },
  openGraph: {
    title: "World Cup Quiz 2026",
    description: "10 questions, instant score, shareable result. Can you reach Golden Ball Brain?",
    url: absoluteUrl("/world-cup-quiz"),
    type: "website"
  }
};

export default function WorldCupQuizPage() {
  return (
    <PageShell>
      <PageIntro
        kicker="Quiz"
        title="The World Cup quiz."
        copy="Ten questions on World Cup history, records and the 2026 tournament. Answer, see instant feedback, and share your score."
      />
      <div className="max-w-2xl">
        <QuizClient />
      </div>
      <div className="mt-8">
        <RelatedLinks
          links={[
            { href: "/world-cup-2026-format", label: "Tournament format" },
            { href: "/groups", label: "All 12 groups" },
            { href: "/teams", label: "All 48 teams" },
            { href: "/matches", label: "Full schedule" }
          ]}
        />
      </div>
    </PageShell>
  );
}
