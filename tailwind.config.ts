import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "rgb(var(--color-canvas) / <alpha-value>)",
        navyCard: "rgb(var(--color-surface) / <alpha-value>)",
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        surfaceRaised: "rgb(var(--color-surface-raised) / <alpha-value>)",
        surfaceSubtle: "rgb(var(--color-surface-subtle) / <alpha-value>)",
        header: "rgb(var(--color-header) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        faint: "rgb(var(--color-faint) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        lineStrong: "rgb(var(--color-line-strong) / <alpha-value>)",
        hover: "rgb(var(--color-hover) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
      },
      fontFamily: {
        heading: ["var(--font-barlow-condensed)", "system-ui", "sans-serif"],
        body: ["var(--font-barlow)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
