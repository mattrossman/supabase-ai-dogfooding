import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: "#faf9f7", dark: "#f5f3ef" },
        charcoal: "#2c2a26",
        muted: "#6b6560",
        accent: "#c45c3e",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-source-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
