import type { CSSProperties } from "react";

type FlagProps = {
  code: string;
  name?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
};

// Plain <img> from flagcdn (NOT next/image). We intentionally do NOT use loading="lazy":
// on the deployed build lazy flags got stuck in a permanent "pending" state and never
// rendered. Eager loading is fine here — flags are tiny. A retina-friendly raster bucket
// (~2x the display width) keeps them crisp.
export function Flag({ code, name, width = 40, height = 28, className = "", style }: FlagProps) {
  const bucket = width <= 40 ? "w80" : width <= 80 ? "w160" : "w320";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${bucket}/${code}.png`}
      alt={name ?? code}
      width={width}
      height={height}
      decoding="async"
      className={`inline-block shrink-0 ${className}`}
      style={{ width, height, borderRadius: "3px", objectFit: "cover", ...style }}
    />
  );
}
