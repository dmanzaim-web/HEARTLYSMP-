export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#f97316",
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3f12",
          900: "#7c2d12",
        },
        panel: "#121417",
        canvas: "#0b0d0f",
        border: "#2a2f36",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(249,115,22,0.2), 0 12px 28px rgba(249,115,22,0.18)",
      },
    },
  },
  plugins: [],
};
