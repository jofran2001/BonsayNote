/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bonsai: {
          bg: '#0d130e',
          card: '#152018',
          border: '#223326',
          moss: '#4ade80',
          mossDark: '#22c55e',
          earth: '#c28854',
          earthDark: '#a16207',
          parchment: '#1b1915',
          parchmentBorder: '#3d3326',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

