/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        concrete: "var(--concrete)",
        platform: "var(--platform)",
        shelter: "var(--shelter)",
        hairline: "var(--hairline)",
        ink: {
          DEFAULT: "var(--ink)",
          soft: "var(--ink-soft)",
          faint: "var(--ink-faint)",
        },
        track: {
          DEFAULT: "var(--track)",
          deep: "var(--track-deep)",
        },
        baseline: "var(--baseline)",
        "ai-plan": "var(--ai-plan)",
        signal: "var(--signal)",
        approved: "var(--approved)",
        rejected: "var(--rejected)",
        crowd: {
          1: "#5BA8A0", // Light
          2: "#A8C686", // Steady
          3: "#F2C14E", // Busy
          4: "#E8743B", // Crowded
          5: "#B3243F", // Critical
        },
      },
      fontFamily: {
        signage: ["Archivo", "Public Sans", "Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Source Serif 4", "Georgia", "serif"],
        gujarati: ["'Noto Sans Gujarati'", "system-ui", "sans-serif"],
        hindi: ["'Noto Sans Devanagari'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "2px",
        sm: "2px",
        md: "4px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
}
