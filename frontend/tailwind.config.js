/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
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
          "Sora Variable",
          "Sora",
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
        "display-price": ["1.5rem", { lineHeight: "1.2", fontWeight: "700" }],
        "display-price-lg": ["2rem", { lineHeight: "1.15", fontWeight: "700" }],
      },
      spacing: {
        shell: "1.5rem",
        section: "3rem",
        card: "1.25rem",
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
        resting:
          "0 1px 0 rgb(255 255 255 / 0.04) inset, 0 8px 32px -12px rgb(0 0 0 / 0.55)",
        lift:
          "0 2px 0 rgb(255 255 255 / 0.06) inset, 0 24px 48px -16px rgb(0 0 0 / 0.65)",
        float: "0 12px 40px -8px rgb(0 0 0 / 0.5)",
        glass: "0 8px 32px rgb(0 0 0 / 0.35)",
      },
      transitionDuration: {
        ui: "200ms",
        fast: "150ms",
        slow: "250ms",
      },
      transitionTimingFunction: {
        gentle: "cubic-bezier(0.22, 1, 0.36, 1)",
        out: "cubic-bezier(0, 0, 0.2, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "dialog-in": {
          from: { opacity: "0", transform: "scale(0.97) translateY(8px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "dialog-out": {
          from: { opacity: "1", transform: "scale(1) translateY(0)" },
          to: { opacity: "0", transform: "scale(0.97) translateY(8px)" },
        },
        "drawer-in": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "stock-highlight": {
          "0%": { backgroundColor: "rgb(var(--accent) / 0)" },
          "40%": { backgroundColor: "rgb(var(--accent) / 0.2)" },
          "100%": { backgroundColor: "rgb(var(--accent) / 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.22s ease-out forwards",
        "fade-in": "fade-in 0.2s ease-out forwards",
        "dialog-in": "dialog-in 0.22s ease-out forwards",
        "drawer-in": "drawer-in 0.2s ease-out forwards",
        "stock-highlight": "stock-highlight 0.75s ease-out both",
        shimmer: "shimmer 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
