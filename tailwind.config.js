/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A3622",
  primaryBright: "#0F5C39",
        accent: "#ffb347",
        background: "#000224",
      },
      fontFamily: {
        sans: ["Raleway", "sans-serif"],
        henny: ["Henny Penny", "cursive"],
      },
    },
  },
  plugins: [],
};
