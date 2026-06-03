import type { CSSProperties } from "react";
import type { Team } from "@/lib/types";
import { flagSvgFor } from "@/lib/flags";

// Renders a team flag as an inline hand-drawn SVG when available, falling back to the
// emoji for teams without a drawn flag yet. SVG keeps flags consistent across OSes and
// in the exported PNG (Windows shows no flag emoji, only letter pairs).
export function TeamFlag({
  team,
  width = 60,
  rounded = true,
  shadow = true,
  className = "",
  style = {}
}: {
  team?: Pick<Team, "fifaCode" | "countryCode" | "flagEmoji"> | undefined;
  width?: number;
  rounded?: boolean;
  shadow?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const svg = flagSvgFor(team?.fifaCode || team?.countryCode);
  const height = Math.round((width * 2) / 3);

  if (!svg) {
    // Emoji fallback (or "FAN" placeholder), sized to roughly match the SVG footprint.
    return (
      <span
        className={`block leading-none ${className}`}
        style={{ fontSize: width, lineHeight: 1, ...style }}
      >
        {team?.flagEmoji || "🏳️"}
      </span>
    );
  }

  return (
    <span
      className={`inline-block overflow-hidden ${className}`}
      style={{
        width,
        height,
        borderRadius: rounded ? Math.max(2, Math.round(width * 0.08)) : 0,
        boxShadow: shadow ? "0 6px 16px rgba(0,0,0,.3)" : "none",
        flex: "0 0 auto",
        ...style
      }}
    >
      <svg
        viewBox="0 0 90 60"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: "block" }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </span>
  );
}
