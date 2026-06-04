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
    default: "WC26 Hub - World Cup 2026 Schedule, Standings and Social Cards",
    template: "%s | WC26 Hub"
  },
  description: "A World Cup 2026 fan-card studio for country roads, prediction battles, player-watch posters, group-stage matchups, and debate cards.",
  alternates: {
    canonical: absoluteUrl("/")
  },
  openGraph: {
    title: "WC26 Hub",
    description: "World Cup 2026 fan cards, country roads, prediction battles, group-stage matchups, and content templates.",
    url: absoluteUrl("/"),
    siteName: "WC26 Hub",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "WC26 Hub",
    description: "World Cup 2026 fan cards, country roads, prediction battles, and content templates."
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
