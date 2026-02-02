import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#093832",
        secondary: "#72B544",
        duke: {
          green: "#4ade80",
          dark: "#1e3a3a",
          light: "#f0fdf4",
        },
      },

    },
  },
  plugins: [],
} satisfies Config;