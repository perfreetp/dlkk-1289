/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1320px",
      },
    },
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"DM Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        paper: "#FAF9F6",
        ink: {
          900: "#1E293B",
          800: "#334155",
          700: "#475569",
          500: "#64748B",
          300: "#CBD5E1",
          100: "#F1F5F9",
        },
        sun: {
          500: "#F59E0B",
          400: "#FBBF24",
          300: "#FCD34D",
          100: "#FEF3C7",
        },
        mint: {
          500: "#10B981",
          400: "#34D399",
          100: "#D1FAE5",
        },
        rose: {
          500: "#F43F5E",
          400: "#FB7185",
          100: "#FFE4E6",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(30,41,59,0.06), 0 8px 24px rgba(30,41,59,0.06)",
        lift: "0 4px 12px rgba(30,41,59,0.08), 0 16px 40px rgba(30,41,59,0.10)",
        glow: "0 0 0 3px rgba(245,158,11,0.15)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
