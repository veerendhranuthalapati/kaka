/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        raised: "rgb(var(--raised) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-strong": "rgb(var(--accent-strong) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        "success-soft": "rgb(var(--success-soft) / <alpha-value>)",
        "warning-soft": "rgb(var(--warning-soft) / <alpha-value>)",
        "danger-soft": "rgb(var(--danger-soft) / <alpha-value>)",
      },
      fontFamily: {
        sans: [
          "Inter Variable",
          "Inter",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        display: [
          "Manrope Variable",
          "Manrope",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        body: ["0.9375rem", { lineHeight: "1.6", fontWeight: "400" }],
        label: [
          "0.75rem",
          {
            lineHeight: "1.4",
            fontWeight: "600",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          },
        ],
        "card-title": ["1.125rem", { lineHeight: "1.35", fontWeight: "600" }],
        "section-title": ["1.75rem", { lineHeight: "1.2", fontWeight: "700" }],
        hero: [
          "clamp(2rem, 5vw, 3.5rem)",
          {
            lineHeight: "1.08",
            fontWeight: "700",
            letterSpacing: "-0.02em",
          },
        ],
      },
      maxWidth: {
        shell: "80rem",
      },
      borderRadius: {
        card: "1.25rem",
        btn: "0.75rem",
        input: "0.75rem",
        chip: "9999px",
      },
      boxShadow: {
        resting: "0 1px 2px rgb(17 18 20 / 0.04), 0 8px 24px -12px rgb(17 18 20 / 0.12)",
        lift: "0 4px 12px rgb(17 18 20 / 0.08), 0 20px 40px -20px rgb(17 18 20 / 0.18)",
      },
      transitionDuration: {
        ui: "200ms",
      },
      transitionTimingFunction: {
        gentle: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.22s ease-out both",
      },
    },
  },
  plugins: [],
};
