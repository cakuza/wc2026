import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0a1628",
        navyCard: "#111d2e",
        accent: "#e8001c"
      },
      fontFamily: {
        heading: ["var(--font-barlow-condensed)", "system-ui", "sans-serif"],
        body: ["var(--font-barlow)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
