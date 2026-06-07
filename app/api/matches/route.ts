import { NextResponse } from "next/server";
import { fetchLiveMatches } from "@/lib/api";
import { MATCHES } from "@/lib/matches";

// Revalidate every 60 seconds so live scores propagate quickly.
export const revalidate = 60;

export async function GET() {
  const live = await fetchLiveMatches();
  if (live) {
    return NextResponse.json({ ...live, source: "live" });
  }
  // Fall back to static fixture data (pre-tournament or API key not set).
  return NextResponse.json({ matches: MATCHES, source: "static" });
}
