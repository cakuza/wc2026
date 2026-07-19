import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial Policy — WorldCupMatchDay",
  description:
    "Editorial policy for WorldCupMatchDay, outlining our standards for factual accuracy, verification, and independent coverage of the 2026 World Cup.",
  alternates: { canonical: "https://www.worldcupmatchday.com/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="mb-2 font-heading text-sm font-bold tracking-[0.3em] text-accent">
        STANDARDS
      </p>
      <h1 className="mb-6 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        EDITORIAL POLICY
      </h1>

      <div className="space-y-5 text-sm leading-relaxed text-white/70">
        <section>
          <h2 className="mb-2 font-heading text-sm font-extrabold tracking-widest text-white uppercase">
            Publisher Identity
          </h2>
          <p>
            WorldCupMatchDay is an independent digital publication dedicated to providing reliable, fast, and trustworthy World Cup match information. We operate with full autonomy, and our coverage is created entirely for informational and fan-engagement purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-sm font-extrabold tracking-widest text-white uppercase">
            Factual Verification
          </h2>
          <p>
            Accuracy is our highest priority. All scores, goal scorers, statistics, standings, and tournament brackets published on this site are verified using primary official sources (including FIFA.com) and reputable international sports media organizations.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-sm font-extrabold tracking-widest text-white uppercase">
            Source Attribution
          </h2>
          <p>
            We attribute our data and information transparently. Match event streams and statistics are sourced from authorized sports providers, supplemented by public official statements, and cross-referenced with multiple independent broadcasters.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-sm font-extrabold tracking-widest text-white uppercase">
            Human-in-the-Loop Review
          </h2>
          <p>
            While we utilize automated pipelines to fetch and format real-time score feeds, all ingested data undergoes rigorous developer and editor review. A human-in-the-loop validation process checks every result, bracket advancement, and statistical total to prevent automated errors from reaching public pages.
          </p>
        </section>

        <p className="text-xs text-white/40">
          Last updated: 19 July 2026. For inquiries or feedback on our editorial standards, contact us at worldcupmatchday@proton.me.
        </p>
      </div>
    </div>
  );
}
