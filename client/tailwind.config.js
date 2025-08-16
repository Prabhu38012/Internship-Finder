/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FFE169', // Yellow for light theme
          dark: '#8B5CF6',  // Violet for dark theme
        },
        background: {
          light: '#FFFFFF',
          dark: '#1A1A1A',
        },
      },
    },
  },
  plugins: [],
}