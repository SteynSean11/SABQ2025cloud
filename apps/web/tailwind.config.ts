import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#0A422D", // Rich Emerald Green
        "brand-secondary": "#D4AF37", // Warm Metallic Gold
        "brand-background": "#F8F7F4", // Clean Off-White/Light Cream
        "brand-text": "#212121", // Deep Charcoal/Off-Black
        "brand-accent-red": "#9B111E",
        "brand-accent-pink": "#E91E63",
        "brand-accent-green": "#4CAF50",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;