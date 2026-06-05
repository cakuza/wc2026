import type { Metadata } from "next";
import { Anton } from "next/font/google";
import { AdSlot } from "@/components/ad-slot";
import { Analytics } from "@/components/analytics";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TimezoneProvider } from "@/components/timezone-provider";
import { absoluteUrl, getSiteUrl } from "@/lib/site";
import "./globals.css";

// Anton: tall condensed display face for poster headlines (stadium-banner feel).
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "WC26 Hub - World Cup 2026 Schedule, Groups, Standings and Teams",
    template: "%s | WC26 Hub"
  },
  description: "Your World Cup 2026 hub: fixtures in your local time, all 12 groups, squads for every team, group tables and qualification scenarios.",
  alternates: {
    canonical: absoluteUrl("/")
  },
  openGraph: {
    title: "WC26 Hub",
    description: "World Cup 2026 fixtures in your local time, groups, standings, squads and qualification scenarios.",
    url: absoluteUrl("/"),
    siteName: "WC26 Hub",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "WC26 Hub",
    description: "World Cup 2026 fixtures in your local time, groups, standings, squads and qualification scenarios."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={anton.variable}>
      <body>
        <TimezoneProvider>
          <SiteHeader />
          <div className="mx-auto max-w-7xl px-4 pt-3">
            <AdSlot placement="header" />
          </div>
          {children}
          <SiteFooter />
          <AdSlot placement="mobile-sticky" />
          <Analytics />
        </TimezoneProvider>
      </body>
    </html>
  );
}
