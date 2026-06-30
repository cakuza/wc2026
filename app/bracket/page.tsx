import type { Metadata } from "next";
import { BracketContent } from "./BracketContent";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "World Cup 2026 Bracket — Knockout Stage",
  description:
    "The FIFA World Cup 2026 knockout bracket: Round of 32 through to the final. Slots are placeholders until the group stage is complete.",
  alternates: { canonical: `${BASE_URL}/bracket` },
  openGraph: {
    title: "World Cup 2026 Bracket — Knockout Stage",
    description:
      "The 2026 World Cup knockout bracket from the Round of 32 to the final.",
    url: `${BASE_URL}/bracket`,
    type: "website",
  },
};

export default async function BracketPage() {
  const snapshot = await getTournamentLiveSnapshot();
  return <BracketContent resolvedParticipants={buildKnockoutResolution(snapshot.matches)} />;
}
