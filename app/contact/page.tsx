import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact WorldCupMatchDay",
  description:
    "Get in touch with WorldCupMatchDay — feedback, corrections, or general enquiries about our FIFA World Cup 2026 fan site.",
  alternates: { canonical: "https://www.worldcupmatchday.com/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="mb-2 font-heading text-sm font-bold tracking-[0.3em] text-accent">
        GET IN TOUCH
      </p>
      <h1 className="mb-6 font-heading text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        CONTACT
      </h1>

      <div className="space-y-5 text-sm leading-relaxed text-muted">
        <p>
          WorldCupMatchDay is an independent fan site. Whether you&apos;ve spotted a data error,
          have a feature suggestion, want to report incorrect match information, or just want to say
          hello — drop us an email and we&apos;ll get back to you as soon as we can.
        </p>

        <div className="rounded-xl border border-line bg-surface p-6">
          <p className="mb-1 font-heading text-xs font-bold tracking-widest text-faint">
            EMAIL
          </p>
          <a
            href="mailto:worldcupmatchday@proton.me"
            className="font-heading text-lg font-extrabold text-accent hover:text-ink transition"
          >
            worldcupmatchday@proton.me
          </a>
          <p className="mt-3 text-xs text-faint">
            Response times vary. Since the tournament has concluded, we review messages and apply data corrections periodically. General inquiries may take longer depending on developer availability.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="mb-2 font-heading text-xs font-bold uppercase tracking-widest text-faint">
            Reporting a data error
          </p>
          <p className="text-sm text-muted">
            For match data corrections — wrong score, missing goal scorer, incorrect venue or kickoff
            time — please include the following in your message:
          </p>
          <ul className="mt-2 ml-4 list-disc space-y-1 text-sm text-faint">
            <li>The match name (e.g. &quot;France vs Senegal, Group I&quot;)</li>
            <li>What you see that appears incorrect</li>
            <li>The correct information, with a source reference if possible (e.g. a link to the official
              match record or a broadcaster report)</li>
          </ul>
          <p className="mt-2 text-sm text-faint">
            Confirmed corrections are applied to our verified corrections file and take effect across our pages in the next verified rebuild or data-sync cycle.
          </p>
        </div>

        <p>
          We also welcome feature suggestions, accessibility reports, and general feedback about the site.
          If something isn&apos;t working as expected on your device or browser, including the match
          schedule, live scores or timezone display, please let us know the device and browser you&apos;re
          using so we can investigate.
        </p>

        <p className="text-faint">
          WorldCupMatchDay is an independent fan project — we are not affiliated with FIFA or any
          official tournament body. For official FIFA communications, please visit{" "}
          <a
            href="https://www.fifa.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-muted transition"
          >
            fifa.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
