import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — WorldCupMatchDay",
  description:
    "Privacy policy for WorldCupMatchDay. This fan site does not collect personal data. Learn about Google AdSense cookies and third-party services.",
  alternates: { canonical: "https://www.worldcupmatchday.com/privacy" },
};

const SECTIONS = [
  {
    heading: "WHO WE ARE",
    body: "WorldCupMatchDay is an independent, fan-made website covering the FIFA World Cup 2026. We are not affiliated with FIFA or any national football federation. The site is operated as a non-commercial fan project.",
  },
  {
    heading: "DATA WE COLLECT",
    body: "We do not collect, store, or process any personal data about our visitors. There is no account system, no login, and no contact form that stores submissions. If you email us directly at worldcupmatchday@proton.me, your email address is used only to respond to your message.",
  },
  {
    heading: "COOKIES",
    body: "This site may use Google AdSense to display advertisements. Google AdSense uses cookies to serve ads based on your prior visits to this and other websites. You can opt out of personalised advertising by visiting Google's Ads Settings at adssettings.google.com. We do not set any first-party cookies ourselves.",
  },
  {
    heading: "GOOGLE ADSENSE",
    body: "We use Google AdSense, a third-party advertising service provided by Google LLC. Google may use cookies and web beacons to collect information about your visits to this and other websites in order to provide advertisements that may be of interest to you. For more information about Google's privacy practices, please visit google.com/policies/privacy.",
  },
  {
    heading: "ANALYTICS",
    body: "We may use aggregated, anonymised page-view analytics (such as Vercel Analytics) to understand how pages are being used. No personally identifiable information is collected or stored.",
  },
  {
    heading: "THIRD-PARTY LINKS",
    body: "Our site contains links to external websites including FIFA.com and football data providers. We are not responsible for the privacy practices or content of those sites. We encourage you to review the privacy policies of any external site you visit.",
  },
  {
    heading: "CHILDREN'S PRIVACY",
    body: "This site is not directed at children under the age of 13 and we do not knowingly collect data from children.",
  },
  {
    heading: "CHANGES TO THIS POLICY",
    body: "We may update this privacy policy from time to time. Any changes will be posted on this page with an updated effective date.",
  },
  {
    heading: "CONTACT",
    body: "If you have any questions about this privacy policy, please contact us at worldcupmatchday@proton.me.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="mb-2 font-heading text-sm font-bold tracking-[0.3em] text-accent">
        LEGAL
      </p>
      <h1 className="mb-2 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        PRIVACY POLICY
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
