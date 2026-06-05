import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "@/components/page-shell";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const CONTACT_EMAIL = "funnyymoney@gmail.com";
const LAST_UPDATED = "June 6, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${SITE_NAME}: what data we collect, how cookies and analytics are used, and how third-party advertising partners such as Google use cookies.`,
  alternates: { canonical: absoluteUrl("/privacy-policy") },
  robots: { index: true, follow: true },
  openGraph: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: `How ${SITE_NAME} handles data, cookies, analytics and third-party advertising.`,
    url: absoluteUrl("/privacy-policy"),
    type: "article"
  }
};

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <PageIntro
        kicker="Legal"
        title="Privacy Policy"
        copy={`How ${SITE_NAME} collects, uses and protects information when you use this site.`}
      />

      <article className="grid max-w-3xl gap-8 text-[#0E0C0A]">
        <p className="text-sm text-[#0E0C0A]/55">Last updated: {LAST_UPDATED}</p>

        <section>
          <h2 className="text-2xl font-black">Overview</h2>
          <p className="mt-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            {SITE_NAME} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates this website as an independent, fan-made World
            Cup 2026 information hub. This Privacy Policy explains what information is collected when you visit the site, how it is
            used, and the choices you have. By using the site, you agree to the practices described here.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black">Information we collect</h2>
          <div className="mt-3 grid gap-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            <p>We aim to collect as little personal information as possible. We do not require you to create an account or sign in.</p>
            <ul className="grid list-disc gap-2 pl-6">
              <li>
                <strong>Information you provide:</strong> if you contact us by email, we receive the email address and any information
                you choose to include.
              </li>
              <li>
                <strong>Usage and device data:</strong> like most websites, our hosting provider and analytics tools automatically
                receive standard technical data such as your IP address, browser type, device type, referring page, and the pages you
                view. This is used to understand traffic and keep the site working.
              </li>
              <li>
                <strong>Preferences stored on your device:</strong> we store your selected timezone in your browser&apos;s local
                storage so match times display correctly. This stays on your device and is not sent to us as personal data.
              </li>
            </ul>
            <p>We do not knowingly collect personal information from children under 13.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black">Cookies and similar technologies</h2>
          <div className="mt-3 grid gap-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            <p>
              Cookies are small files stored on your device. We and our partners use cookies and similar technologies (such as local
              storage and web beacons) to operate the site, remember your preferences, measure traffic, and — where advertising is
              enabled — to serve and personalise ads.
            </p>
            <p>
              You can control or delete cookies through your browser settings, and you can set most browsers to refuse cookies.
              Disabling cookies may affect how some parts of the site work.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black">Third-party advertising (Google AdSense)</h2>
          <div className="mt-3 grid gap-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            <ul className="grid list-disc gap-2 pl-6">
              <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites.</li>
              <li>
                Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this
                site and/or other sites on the internet.
              </li>
              <li>
                You may opt out of personalised advertising by visiting{" "}
                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="font-bold text-[#B48A00] underline-offset-2 hover:underline">
                  Google Ads Settings
                </a>
                . You can also opt out of some third-party vendors&apos; use of cookies for personalised advertising at{" "}
                <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="font-bold text-[#B48A00] underline-offset-2 hover:underline">
                  aboutads.info/choices
                </a>
                .
              </li>
              <li>
                Third-party ad networks may use non-personally identifiable information about your visits in order to provide
                advertisements about goods and services of interest to you.
              </li>
            </ul>
            <p>
              For more information about how Google uses data when you use our partners&apos; sites or apps, see{" "}
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="font-bold text-[#B48A00] underline-offset-2 hover:underline">
                Google&apos;s &quot;How Google uses information from sites or apps that use our services&quot;
              </a>
              .
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black">Analytics</h2>
          <div className="mt-3 grid gap-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            <p>
              We may use Google Analytics, a web analytics service provided by Google, to understand how visitors use the site. Google
              Analytics uses cookies and similar identifiers to collect aggregated information such as page views, session duration,
              approximate location, and device/browser type. This helps us improve content and performance.
            </p>
            <p>
              You can prevent Google Analytics from using your data by installing the{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="font-bold text-[#B48A00] underline-offset-2 hover:underline">
                Google Analytics Opt-out Browser Add-on
              </a>
              . Learn more in{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="font-bold text-[#B48A00] underline-offset-2 hover:underline">
                Google&apos;s Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black">How we use information</h2>
          <ul className="mt-3 grid list-disc gap-2 pl-6 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            <li>To operate, maintain and improve the website and its content.</li>
            <li>To measure and analyse traffic and usage trends.</li>
            <li>To display advertising that helps keep the site free.</li>
            <li>To respond to messages you send us.</li>
            <li>To detect, prevent and address technical issues, fraud or abuse.</li>
          </ul>
          <p className="mt-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            We do not sell your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black">Your choices and rights</h2>
          <div className="mt-3 grid gap-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            <p>
              Depending on your location, you may have rights under laws such as the EU/UK GDPR or the California Consumer Privacy Act
              (CCPA), including the right to access, correct or delete information, and to opt out of personalised advertising. You can:
            </p>
            <ul className="grid list-disc gap-2 pl-6">
              <li>Manage or block cookies in your browser settings.</li>
              <li>Opt out of personalised ads via the links in the advertising section above.</li>
              <li>Contact us using the details below to make a privacy request.</li>
            </ul>
            <p>
              If you are in the European Economic Area or UK, advertising partners operating on this site are required to obtain
              consent for non-essential cookies where applicable.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black">Data retention and security</h2>
          <p className="mt-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            We retain information only as long as needed for the purposes described in this policy or as required by law. We take
            reasonable technical and organisational measures to protect information, but no method of transmission or storage over the
            internet is completely secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black">Third-party links</h2>
          <p className="mt-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            This site links to third-party websites (for example, official tournament information and team pages). We are not
            responsible for the privacy practices of those sites and encourage you to read their privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black">Changes to this policy</h2>
          <p className="mt-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            We may update this Privacy Policy from time to time. Changes take effect when posted on this page, and the &quot;Last
            updated&quot; date above will be revised.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black">Contact us</h2>
          <p className="mt-3 text-sm leading-7 text-[#0E0C0A]/75 md:text-base">
            If you have questions about this Privacy Policy or your data, contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold text-[#B48A00] underline-offset-2 hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <p className="text-sm leading-7 text-[#0E0C0A]/60">
          {SITE_NAME} is an independent fan project and is not affiliated with FIFA or any official organization. Return to the{" "}
          <Link href="/" className="font-bold text-[#B48A00] underline-offset-2 hover:underline">homepage</Link>.
        </p>
      </article>
    </PageShell>
  );
}
