import type { Config } from "tailwindcss";

// Tailwind supports function-based color values at runtime (needed for
// opacity modifiers like bg-panel/80), but its own Config type doesn't
// model that shape — hence the `any` return type here.
function withOpacity(varName: string): any {
  return ({ opacityValue }: { opacityValue?: string }) =>
    opacityValue !== undefined
      ? `rgb(var(${varName}) / ${opacityValue})`
      : `rgb(var(${varName}))`;
}

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand tokens (existing app code depends on these names).
        navy: withOpacity("--c-navy"),
        "navy-soft": withOpacity("--c-navy-soft"),
        gold: withOpacity("--c-gold"),
        "gold-bright": withOpacity("--c-gold-bright"),
        "on-gold": withOpacity("--c-on-gold"),
        slate: withOpacity("--c-slate"),
        ink: withOpacity("--c-ink"),
        bg: withOpacity("--c-bg"),
        panel: withOpacity("--c-panel"),
        tint: withOpacity("--c-tint"),
        "tint-gold": withOpacity("--c-tint-gold"),
        "tint-green": withOpacity("--c-tint-green"),
        "tint-red": withOpacity("--c-tint-red"),
        "brand-green": withOpacity("--c-brand-green"),
        "brand-red": withOpacity("--c-brand-red"),
        line: withOpacity("--c-line"),

        // shadcn/ui-standard tokens, aliased to the same palette above
        // (see app/global.css) so shadcn components share one source
        // of truth with the rest of the app.
        border: withOpacity("--border"),
        input: withOpacity("--input"),
        ring: withOpacity("--ring"),
        background: withOpacity("--background"),
        foreground: withOpacity("--foreground"),
        primary: {
          DEFAULT: withOpacity("--primary"),
          foreground: withOpacity("--primary-foreground"),
        },
        secondary: {
          DEFAULT: withOpacity("--secondary"),
          foreground: withOpacity("--secondary-foreground"),
        },
        destructive: {
          DEFAULT: withOpacity("--destructive"),
          foreground: withOpacity("--destructive-foreground"),
        },
        muted: {
          DEFAULT: withOpacity("--muted"),
          foreground: withOpacity("--muted-foreground"),
        },
        accent: {
          DEFAULT: withOpacity("--accent"),
          foreground: withOpacity("--accent-foreground"),
        },
        popover: {
          DEFAULT: withOpacity("--popover"),
          foreground: withOpacity("--popover-foreground"),
        },
        card: {
          DEFAULT: withOpacity("--card"),
          foreground: withOpacity("--card-foreground"),
        },
      },
      fontFamily: {
        serif: ["var(--font-source-serif)", "serif"],
        sans: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      boxShadow: {
        panel: "0 30px 70px -25px rgb(var(--c-navy) / 0.18)",
        card: "0 16px 32px -16px rgb(var(--c-navy) / 0.15)",
        soft: "0 6px 16px -6px rgb(var(--c-gold) / 0.4)",
      },
      borderRadius: {
        xl2: "20px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 3px)",
        sm: "calc(var(--radius) - 5px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
