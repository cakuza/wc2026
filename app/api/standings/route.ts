import { NextResponse } from "next/server";
import { fetchLiveStandings } from "@/lib/api";

// Revalidate every 60 seconds so group standings stay fresh.
export const revalidate = 60;

export async function GET() {
  const live = await fetchLiveStandings();
  if (live) {
    return NextResponse.json({ ...live, source: "live" });
  }
  // Static fallback: all teams at 0 pts (pre-tournament default).
  return NextResponse.json({ standings: [], source: "static" });
}
