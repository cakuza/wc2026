import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const startMs = Date.now();
  let upstreamStatus = 0;
  let recordCount = 0;
  let shapeValid = false;
  let errorClass: string | null = null;
  let ok = false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch("https://worldcup26.ir/get/games", {
      cache: "no-store",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    upstreamStatus = response.status;

    if (response.ok) {
      const data = await response.json();
      
      if (data && Array.isArray(data.games)) {
        recordCount = data.games.length;
        
        if (recordCount > 0 && "home_team_id" in data.games[0]) {
          shapeValid = true;
          ok = true;
        } else {
          errorClass = "InvalidShape";
        }
      } else {
        errorClass = "InvalidShape";
      }
    } else {
      errorClass = "UpstreamError";
    }
  } catch (error: any) {
    errorClass = error.name || "UnknownError";
  }

  const durationMs = Date.now() - startMs;

  return NextResponse.json(
    {
      ok,
      upstreamStatus,
      durationMs,
      recordCount,
      shapeValid,
      errorClass,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
