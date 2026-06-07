import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact WorldCupMatchDay",
  description:
    "Get in touch with WorldCupMatchDay — feedback, corrections, or general enquiries about our FIFA World Cup 2026 fan site.",
  alternates: { canonical: "https://worldcupmatchday.vercel.app/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="mb-2 font-heading text-sm font-bold tracking-[0.3em] text-accent">
        GET IN TOUCH
      </p>
      <h1 className="mb-6 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        CONTACT
      </h1>

      <div className="space-y-5 text-sm leading-relaxed text-white/70">
        <p>
          We&apos;d love to hear from you. Whether you&apos;ve spotted a data error, have a feature
          suggestion, or just want to say hello — drop us an email and we&apos;ll get back to you
          as soon as we can.
        </p>

        <div className="rounded-xl border border-white/10 bg-navyCard p-6">
          <p className="mb-1 font-heading text-xs font-bold tracking-widest text-white/40">
            EMAIL
          </p>
          <a
            href="mailto:worldcupmatchday@proton.me"
            className="font-heading text-lg font-extrabold text-accent hover:text-white transition"
          >
            worldcupmatchday@proton.me
          </a>
        </div>

        <p>
          For match data corrections (wrong score, missing player, incorrect venue), please include the
          match name and the correct information in your message. We aim to respond within 24 hours during
          the tournament period (11 June – 19 July 2026).
        </p>

        <p className="text-white/40">
          WorldCupMatchDay is a fan project — we are not affiliated with FIFA or any official tournament body.
          For official FIFA communications, please visit{" "}
          <a
            href="https://www.fifa.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/70 transition"
          >
            fifa.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
