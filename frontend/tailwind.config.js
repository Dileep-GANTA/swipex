/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          light: "#0d9488", // Teal 600
          DEFAULT: "#0f766e", // Teal 700
          dark: "#115e59", // Teal 800
          ring: "rgba(13, 148, 136, 0.2)",
        },
        panel: {
          bg: "#0f172a", // Slate 900
          border: "rgba(255, 255, 255, 0.08)",
        }
      }
    },
  },
  plugins: [],
}
