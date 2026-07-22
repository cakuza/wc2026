import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corrections Policy — WorldCupMatchDay",
  description:
    "Corrections policy for WorldCupMatchDay, detailing our commitment to accuracy and how to report match data errors.",
  alternates: { canonical: "https://www.worldcupmatchday.com/corrections-policy" },
};

export default function CorrectionsPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="mb-2 font-heading text-sm font-bold tracking-[0.3em] text-accent">
        ACCURACY
      </p>
      <h1 className="mb-6 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        CORRECTIONS POLICY
      </h1>

      <div className="space-y-5 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 font-heading text-sm font-extrabold tracking-widest text-white uppercase">
            Our Commitment to Accuracy
          </h2>
          <p>
            At WorldCupMatchDay, we strive for zero errors in our real-time scores, schedules, and statistics. However, due to the fast-paced nature of live sports and potential provider latency, errors may occasionally occur. We are committed to correcting any inaccuracies promptly and transparently.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-sm font-extrabold tracking-widest text-white uppercase">
            Correction Protocols
          </h2>
          <p>
            When a data inconsistency is identified, we verify the correction against canonical tournament resources. Verified corrections are updated directly in our structured data repository. Changes take effect across our pages in the next verified rebuild, data-sync cycle or reviewed release.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-sm font-extrabold tracking-widest text-white uppercase">
            How to Report an Error
          </h2>
          <p>
            If you detect a mistake—such as an incorrect score line, a missing goal scorer, or an incorrect venue—please email us at{" "}
            <a href="mailto:worldcupmatchday@proton.me" className="text-accent underline">
              worldcupmatchday@proton.me
            </a>
            . To help us process the correction quickly, please specify the match (teams and date), the precise error, and a link to an official or reputable broadcast source supporting the correction.
          </p>
        </section>

        <p className="text-xs text-faint">
          Last updated: 19 July 2026.
        </p>
      </div>
    </div>
  );
}
