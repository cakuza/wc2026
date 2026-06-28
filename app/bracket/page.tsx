import type { Metadata } from "next";
import { BracketContent } from "./BracketContent";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "World Cup 2026 Bracket — Knockout Stage",
  description:
    "The FIFA World Cup 2026 knockout bracket: Round of 32 through to the final. All 32 teams confirmed from the group stage.",
  alternates: { canonical: `${BASE_URL}/bracket` },
  openGraph: {
    title: "World Cup 2026 Bracket — Knockout Stage",
    description:
      "The 2026 World Cup knockout bracket from the Round of 32 to the final.",
    url: `${BASE_URL}/bracket`,
    type: "website",
  },
};

export default function BracketPage() {
  return <BracketContent />;
}
