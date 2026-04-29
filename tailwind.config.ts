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
        "dark-border": "var(--color-dark-border)",
        "neon-green": "var(--color-neon-green)",
        "neon-green-soft": "var(--color-neon-green-soft)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "SF Pro Display",
          "SF Pro Text",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        "neon-soft": "0 0 24px rgba(163, 255, 77, 0.2)",
        "neon-ring": "0 0 0 1px rgba(163, 255, 77, 0.55), 0 0 28px rgba(57, 255, 20, 0.22)",
      },
      borderRadius: {
        tech: "0.5rem",
      },
    },
  },
};

export default config;
