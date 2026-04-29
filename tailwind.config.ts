import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-bg": "var(--color-dark-bg)",
        "dark-surface": "var(--color-dark-surface)",
        "dark-panel": "var(--color-dark-panel)",
        "dark-elevated": "var(--color-dark-elevated)",
        "dark-border": "var(--color-dark-border)",
        "neon-green": "var(--color-neon-green)",
        "neon-green-soft": "var(--color-neon-green-soft)",
        "neon-green-muted": "var(--color-neon-green-muted)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "blinkmacsystemfont",
          "segoe ui",
        ],
      },
      boxShadow: {
        "neon-soft": "0 0 22px rgba(57, 255, 20, 0.18)",
        "neon-ring":
          "0 0 0 1px rgba(57, 255, 20, 0.58), 0 0 30px rgba(57, 255, 20, 0.22)",
        "panel-hard": "0 18px 60px rgba(0, 0, 0, 0.42)",
      },
      borderRadius: {
        tech: "0.375rem",
      },
    },
  },
};

export default config;
