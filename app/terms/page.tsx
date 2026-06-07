import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — WorldCupMatchDay",
  description:
    "Terms of use for WorldCupMatchDay. Fan site, not affiliated with FIFA. Content provided for informational purposes only.",
  alternates: { canonical: "https://www.worldcupmatchday.com/terms" },
};

const SECTIONS = [
  {
    heading: "ABOUT THIS SITE",
    body: "WorldCupMatchDay is an independent fan website created to provide informational content about the FIFA World Cup 2026. This site is not affiliated with, endorsed by, or connected to FIFA, any national football association, or any official tournament body.",
  },
  {
    heading: "INFORMATIONAL PURPOSES ONLY",
    body: "All content on WorldCupMatchDay — including fixture schedules, squad lists, group standings, match results, and statistics — is provided for general informational and entertainment purposes only. While we strive for accuracy, we make no warranties regarding the completeness, accuracy, or timeliness of any content. Official match information should always be verified with FIFA or the relevant national federation.",
  },
  {
    heading: "INTELLECTUAL PROPERTY",
    body: "Country names, team names, and competition names are the property of their respective owners. Flag images are rendered from open-source flag data. We do not claim ownership of any official FIFA, national team, or tournament branding. If you believe any content on this site infringes your intellectual property rights, please contact us at worldcupmatchday@proton.me.",
  },
  {
    heading: "NO WARRANTIES",
    body: "This site is provided 'as is' without warranties of any kind. We do not guarantee that the site will be available, error-free, or uninterrupted at all times, particularly during high-traffic match periods.",
  },
  {
    heading: "LIMITATION OF LIABILITY",
    body: "To the fullest extent permitted by law, WorldCupMatchDay and its operators shall not be liable for any loss or damage arising from your use of this site or reliance on information published here.",
  },
  {
    heading: "THIRD-PARTY SERVICES",
    body: "This site uses third-party services including Vercel (hosting) and Google AdSense (advertising). Use of those services is subject to their respective terms and privacy policies.",
  },
  {
    heading: "ADVERTISING",
    body: "This site may display advertisements served by Google AdSense. Advertiser content is not endorsed by WorldCupMatchDay and we are not responsible for the accuracy or legality of advertisements displayed.",
  },
  {
    heading: "CHANGES",
    body: "We reserve the right to modify these terms at any time. Continued use of the site following any changes constitutes acceptance of the revised terms.",
  },
  {
    heading: "CONTACT",
    body: "For questions about these terms, please email worldcupmatchday@proton.me.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="mb-2 font-heading text-sm font-bold tracking-[0.3em] text-accent">
        LEGAL
      </p>
      <h1 className="mb-2 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        TERMS OF USE
      </h1>
      <p className="mb-8 font-heading text-xs font-bold tracking-widest text-white/30">
        EFFECTIVE: 1 JUNE 2026
      </p>

      <div className="space-y-7">
        {SECTIONS.map((s) => (
          <section key={s.heading}>
            <h2 className="mb-2 font-heading text-sm font-extrabold tracking-widest text-white">
              {s.heading}
            </h2>
            <p className="text-sm leading-relaxed text-white/60">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
