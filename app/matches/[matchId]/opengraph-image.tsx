import React from "react";
import { ImageResponse } from "next/og";
import { MATCHES, matchBySlug, matchSlug } from "@/lib/matches";
import {
  isKnockoutMatch,
  getResolvedHomeTeam,
  getResolvedAwayTeam,
  knockoutSlotLabel,
  ROUND_DISPLAY,
} from "@/lib/participant-resolution";
import { countryName } from "@/lib/i18n";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";

export const alt = "2026 World Cup Vault Match Summary";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return MATCHES.map((match) => ({ matchId: matchSlug(match) }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const match = matchBySlug(matchId);

  if (!match) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#0b132b",
            color: "#ffffff",
            fontSize: 48,
            fontWeight: "bold",
          }}
        >
          2026 World Cup Vault
        </div>
      ),
      { ...size }
    );
  }

  const snapshot = await getTournamentLiveSnapshot();
  const snap = snapshot.matches[matchId];

  let homeName = "TBD";
  let awayName = "TBD";

  if (!isKnockoutMatch(match)) {
    homeName = countryName(match.homeKey, "en");
    awayName = countryName(match.awayKey, "en");
  } else {
    const hk = getResolvedHomeTeam(match);
    const ak = getResolvedAwayTeam(match);
    homeName = hk ? countryName(hk, "en") : knockoutSlotLabel(match.homeSlot);
    awayName = ak ? countryName(ak, "en") : knockoutSlotLabel(match.awaySlot);
  }

  const stageLabel = isKnockoutMatch(match)
    ? ROUND_DISPLAY[match.stage] ?? match.stage
    : match.group
    ? `Group ${match.group}`
    : "Match Details";

  const isCompleted = snap?.status === "FINISHED";
  const homeScore = snap?.homeScore ?? null;
  const awayScore = snap?.awayScore ?? null;
  const liveData = snap?.live;
  const scoreDuration = liveData?.scoreDuration;

  let statusBadge = "FT";
  if (scoreDuration === "EXTRA_TIME" || scoreDuration === "AET") {
    statusBadge = "AET";
  } else if (scoreDuration === "PENALTY_SHOOTOUT" || scoreDuration === "PEN") {
    statusBadge = "PEN";
  }

  const scoreText =
    isCompleted && homeScore !== null && awayScore !== null
      ? `${homeScore} - ${awayScore}`
      : "vs";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0b132b",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, #1c2541 0%, #0b132b 75%)",
          color: "#ffffff",
          padding: "50px 60px",
          fontFamily: "sans-serif",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            borderBottom: "2px solid rgba(255, 255, 255, 0.15)",
            paddingBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "0.15em",
                color: "#64dfdf",
                textTransform: "uppercase",
              }}
            >
              WorldCupMatchDay
            </span>
            <span
              style={{
                fontSize: 18,
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              •
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "#e0e1dd",
                textTransform: "uppercase",
              }}
            >
              2026 World Cup Vault
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#64dfdf",
              textTransform: "uppercase",
            }}
          >
            {stageLabel}
          </div>
        </div>

        {/* Main Content (Scoreboard) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "20px 0",
          }}
        >
          {/* Home Team */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: 38,
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "0.02em",
                maxWidth: "340px",
              }}
            >
              {homeName}
            </span>
          </div>

          {/* Score & Status */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#1c2541",
                border: "2px solid rgba(100, 223, 223, 0.4)",
                borderRadius: "16px",
                padding: "16px 36px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              }}
            >
              <span
                style={{
                  fontSize: 54,
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "0.05em",
                }}
              >
                {scoreText}
              </span>
            </div>

            {isCompleted ? (
              <span
                style={{
                  marginTop: "12px",
                  fontSize: 16,
                  fontWeight: 800,
                  backgroundColor: "rgba(100, 223, 223, 0.2)",
                  color: "#64dfdf",
                  padding: "4px 14px",
                  borderRadius: "12px",
                  letterSpacing: "0.1em",
                }}
              >
                {statusBadge}
              </span>
            ) : null}
          </div>

          {/* Away Team */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: 38,
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "0.02em",
                maxWidth: "340px",
              }}
            >
              {awayName}
            </span>
          </div>
        </div>

        {/* Footer Details */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "16px",
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          <span>{match.venue ?? "Host Stadium TBC"}</span>
          <span>{match.date}</span>
          <span>Official Match Record</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
