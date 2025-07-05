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
        "sabq-emerald": "#0A422D", // Primary Emerald Green
        "sabq-gold": "#D4AF37", // Primary Gold
        "sabq-cream": "#F8F8F8", // Warm Off-White/Cream (from BRANDID.md and VisualExample3.html)
        "sabq-text": "#333333", // General text color from VisualExample3.html
        "sabq-aubergine": "#4B0082", // Deep Aubergine/Plum (from BRANDID.md)
        "sabq-maroon": "#A52A2A", // Subtle Red/Maroon (from BRANDID.md)
        "sabq-leaf-green": "#4CAF50", // Vibrant Leaf Green (from BRANDID.md)
        "sabq-dark-teal": "#095540", // Dark Teal (from VisualExample3.html sidebar)
        "sabq-primary-teal": "#24CEF3", // Primary Teal (from VisualExample3.html borders)
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
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