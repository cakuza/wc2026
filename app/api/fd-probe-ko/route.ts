import { NextRequest, NextResponse } from "next/server";

// Temporary knockout-stage probe route — remove before merging to main.
// Only runs in preview/development environments; returns 403 in production.
export async function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "FOOTBALL_DATA_API_KEY not configured" }, { status: 503 });
  }

  const res = await fetch("https://api.football-data.org/v4/competitions/2000/matches", {
    headers: { "X-Auth-Token": key },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: `Upstream error ${res.status}` }, { status: res.status });
  }

  const data = await res.json() as { matches?: Record<string, unknown>[] };
  const matches = data.matches ?? [];

  // Collect all distinct stage names for diagnostics
  const stageNames = [...new Set(matches.map((m) => String(m.stage ?? "NULL")))].sort();

  // Return all non-group-stage matches (filter out GROUP_STAGE)
  const knockout = matches
    .filter((m) => {
      const stage = String(m.stage ?? "").toUpperCase();
      return stage !== "GROUP_STAGE" && stage !== "" && stage !== "NULL";
    })
    .map((m) => {
      const score = m.score as Record<string, unknown> | null | undefined;
      const ft = (score?.fullTime ?? {}) as Record<string, unknown>;
      const ht = (score?.halfTime ?? {}) as Record<string, unknown>;
      const home = (m.homeTeam ?? {}) as Record<string, unknown>;
      const away = (m.awayTeam ?? {}) as Record<string, unknown>;
      return {
        id: m.id,
        utcDate: m.utcDate,
        status: m.status,
        stage: m.stage,
        matchday: m.matchday,
        homeTeam: { id: home.id, name: home.name, shortName: home.shortName, tla: home.tla },
        awayTeam: { id: away.id, name: away.name, shortName: away.shortName, tla: away.tla },
        score: {
          winner: score?.winner,
          duration: score?.duration,
          fullTime: { home: ft.home, away: ft.away },
          halfTime: { home: ht.home, away: ht.away },
        },
      };
    });

  return NextResponse.json({
    probeTime: new Date().toISOString(),
    competitionId: 2000,
    totalMatchCount: matches.length,
    knockoutMatchCount: knockout.length,
    stageNames,
    knockout,
  });
}
