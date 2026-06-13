import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — WorldCupMatchDay",
  description:
    "Privacy policy for WorldCupMatchDay, including third-party hosting, analytics and Google AdSense disclosures.",
  alternates: { canonical: "https://www.worldcupmatchday.com/privacy" },
};

const SECTIONS = [
  {
    heading: "WHO WE ARE",
    body: "WorldCupMatchDay is an independent fan-operated website covering the FIFA World Cup 2026. We are not affiliated with FIFA or any national football federation.",
  },
  {
    heading: "DATA WE COLLECT",
    body: "We do not operate user accounts or directly collect profile information. Third-party services used for hosting, analytics and advertising may process technical information such as IP addresses, device/browser information, cookies or similar identifiers. If you email us directly at worldcupmatchday@proton.me, your email address is used only to respond to your message.",
  },
  {
    heading: "COOKIES",
    body: "This site may use cookies or similar technologies through third-party services, including Google AdSense. You can opt out of personalised advertising by visiting Google's Ads Settings at adssettings.google.com.",
  },
  {
    heading: "GOOGLE ADSENSE",
    body: "We use Google AdSense, a third-party advertising service provided by Google LLC. Google may use cookies and web beacons to collect information about your visits to this and other websites in order to provide advertisements that may be of interest to you. For more information about Google's privacy practices, please visit google.com/policies/privacy.",
  },
  {
    heading: "ANALYTICS",
    body: "We may use analytics provided by hosting or analytics services, such as Vercel Analytics if enabled, to understand how pages are being used. These services may process technical information such as device, browser and visit data according to their own policies.",
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
  {
    heading: "NOTE",
    body: "This page is an operational disclosure about how the site is run and is not legal advice.",
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
        EFFECTIVE: 13 JUNE 2026
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
