import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";
import { TimezoneProvider } from "@/components/TimezoneProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SchemaScripts } from "@/components/SchemaScripts";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { getArchiveState } from "@/lib/archiveLifecycle";
import { ARCHIVE_DEFAULT_DATE, MATCHES } from "@/lib/matches";
import "./globals.css";

// Google AdSense publisher ID (e.g. "ca-pub-1234567890123456").
// Set NEXT_PUBLIC_ADSENSE_CLIENT_ID in the environment once the account is approved.
// Until then nothing is rendered — no placeholder ID, no ad slots, no layout impact.
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap"
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow-condensed",
  display: "swap"
});

const BASE_URL = "https://www.worldcupmatchday.com";
const BUILD_COMMIT =
  process.env.NEXT_PUBLIC_BUILD_COMMIT ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  "unknown";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "World Cup 2026 Matchday Guide – Fixtures, Groups, Teams & Kickoff Times",
    template: "%s | WorldCupMatchDay"
  },
  description:
    "Follow the World Cup 2026 with today's matches, full schedule, groups, teams, local-time kickoff pages, bracket tools and fan-made tournament explainers.",
  keywords: [
    "FIFA World Cup 2026", "World Cup 2026", "WC2026", "football", "soccer",
    "World Cup fixtures", "World Cup schedule", "World Cup squads", "World Cup groups",
    "World Cup standings", "USA 2026", "Canada 2026", "Mexico 2026"
  ],
  authors: [{ name: "WorldCupMatchDay" }],
  creator: "WorldCupMatchDay",
  openGraph: {
    type: "website",
    siteName: "WorldCupMatchDay",
    url: BASE_URL,
    title: "World Cup 2026 Matchday Guide – Fixtures, Groups, Teams & Kickoff Times",
    description:
      "Follow the World Cup 2026 with today's matches, full schedule, groups, teams, local-time kickoff pages, bracket tools and fan-made tournament explainers.",
    images: [
      {
        url: `${BASE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "WorldCupMatchDay - FIFA World Cup 2026"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "World Cup 2026 Matchday Guide – Fixtures, Groups, Teams & Kickoff Times",
    description:
      "Today's matches, full schedule, groups, teams, local-time kickoff pages and fan-made World Cup 2026 explainers.",
    images: [`${BASE_URL}/og-default.png`]
  },
  alternates: {
    canonical: BASE_URL
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  },
  verification: {
    google: "DiUHX4qER4zUxVlNgWhE1SpIHMvlhbu7qvgqfQDNElI",
  },
  other: {
    "google-adsense-account": "ca-pub-2198254554444215",
    "x-build-commit": BUILD_COMMIT,
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Single shared lifecycle truth for the whole site: computed once here,
  // server-side, from the same canonical tournament-phase system every other
  // archive-aware page uses (never a hardcoded date). Passed down as a plain
  // prop so the client Nav renders identically on first paint and after
  // hydration — no client-side refetch, no mismatch.
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const isTournamentComplete = getArchiveState({
    matches: MATCHES,
    liveData: snapshot.liveDataByProviderId,
    resolvedParticipants,
    now: new Date(ARCHIVE_DEFAULT_DATE),
  }).isComplete;

  return (
    <html lang="en" dir="ltr">
      {/* Preconnect to flag CDN so flag images resolve faster (low-risk LCP aid) */}
      <link rel="preconnect" href="https://flagcdn.com" />
      <SchemaScripts />
      {ADSENSE_CLIENT_ID ? (
        <Script
          id="google-adsense"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
        />
      ) : null}
      <body className={`${barlow.variable} ${barlowCondensed.variable} font-body bg-navy text-white antialiased`}>
        <LanguageProvider>
          <TimezoneProvider>
            <Nav isTournamentComplete={isTournamentComplete} />
            <main>{children}</main>
            <Footer />
          </TimezoneProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
