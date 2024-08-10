import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderWidth: {
        1: '1px'
      },
      keyframes: {
        fadeOutBackground: {
          '0%': { backgroundColor: 'rgb(236, 252, 203, 1)' },
          '80%': { backgroundColor: 'rgb(236, 252, 203, 1)' },
          '100%': { backgroundColor: 'rgb(236, 252, 203, 0)' },
        }
      },
      animation: {
        fadeOutBackground: 'fadeOutBackground 3s ease-out forwards'
      }
    },
  },
  plugins: [],
};
export default config;
