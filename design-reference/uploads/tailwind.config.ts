import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: "#061527",
        "pitch-soft": "#0c223d",
        "pitch-line": "#173a62",
        gold: "#f2c94c",
        "gold-soft": "#ffe08a",
        grass: "#18a36d",
        "ice-blue": "#a7d8ff"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(242,201,76,0.18), 0 24px 80px rgba(0,0,0,0.25)"
      }
    },
  },
  plugins: [],
};

export default config;
