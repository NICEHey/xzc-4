/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F5',
          100: '#F5F1EA',
          200: '#EBE3D9',
          300: '#DDD0BF',
          400: '#C9BA9E',
          500: '#B8A47A',
        },
        brown: {
          50: '#F8F6F4',
          100: '#EDE9E4',
          200: '#D9D1C7',
          300: '#C4B6A5',
          400: '#A8957D',
          500: '#8B745C',
          600: '#6D5A48',
          700: '#544639',
          800: '#3D322A',
          900: '#2A241E',
        },
      },
    },
  },
  plugins: [],
}