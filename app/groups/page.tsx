import type { Metadata } from "next";
import { GroupsContent } from "./GroupsContent";
import { fetchAllLiveData } from "@/lib/fetchAllLiveData";
import { computeGroupStandings } from "@/lib/groupStandings";

export const revalidate = 60;

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "World Cup 2026 Groups — All 12 Groups & Standings",
  description:
    "All 12 FIFA World Cup 2026 groups (A–L) with their four teams and standings, plus how the top two and best third-placed teams qualify for the Round of 32.",
  alternates: { canonical: `${BASE_URL}/groups` },
  openGraph: {
    title: "World Cup 2026 Groups — All 12 Groups & Standings",
    description:
      "All 12 World Cup 2026 groups with teams and standings.",
    url: `${BASE_URL}/groups`,
    type: "website",
  },
};

export default async function GroupsPage() {
  const liveData = await fetchAllLiveData();
  const standings = computeGroupStandings(liveData);
  return <GroupsContent standings={standings} />;
}
