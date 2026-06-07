import type { Metadata } from "next";
import Script from "next/script";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SchemaScripts } from "@/components/SchemaScripts";
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

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "WorldCupMatchDay - FIFA World Cup 2026",
    template: "%s | WorldCupMatchDay"
  },
  description:
    "A World Cup 2026 matchday command center: fixtures, group paths, squads, country pages, countdowns and fan-ready tournament context for all 48 teams.",
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
    title: "WorldCupMatchDay - FIFA World Cup 2026",
    description:
      "Fixtures, group paths, squads, country pages, countdowns and fan-ready World Cup 2026 context for all 48 teams.",
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
    title: "WorldCupMatchDay - FIFA World Cup 2026",
    description:
      "Matchday fixtures, group paths, squads and country pages for all 48 World Cup 2026 teams.",
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
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
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
          <Nav />
          <main>{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
