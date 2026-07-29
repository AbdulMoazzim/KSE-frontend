import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1E2761",
        "navy-soft": "#3A4590",
        gold: "#B8860B",
        "gold-bright": "#D9A521",
        slate: "#5B6B85",
        bg: "#FBFAF7",
        panel: "#FFFFFF",
        tint: "#F1F2FA",
        "tint-gold": "#FBF3E1",
        "tint-green": "#E7F3EC",
        "tint-red": "#FBEDEC",
        "brand-green": "#3F8F6C",
        "brand-red": "#C0564F",
        line: "#E7E6E0",
      },
      fontFamily: {
        serif: ["var(--font-source-serif)", "serif"],
        sans: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      boxShadow: {
        panel: "0 30px 70px -25px rgba(30,39,97,0.22)",
        card: "0 16px 32px -16px rgba(30,39,97,0.18)",
        soft: "0 6px 16px -6px rgba(184,134,11,0.45)",
      },
      borderRadius: {
        xl2: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
