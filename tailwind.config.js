/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        studio: {
          950: '#0d0c0b',
          900: '#131211',
          850: '#181614',
          800: '#1e1b18',
          700: '#2a2621',
          600: '#3a3530',
          500: '#5c554c',
          400: '#8a8175',
          300: '#b3a996',
          200: '#d8d0c0',
          100: '#efe9dd',
        },
        brass: {
          400: '#d9b562',
          500: '#c9a227',
          600: '#a8841f',
        },
        signal: {
          500: '#b5432f',
          600: '#8f331f',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"Courier Prime"', '"Courier New"', 'monospace'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
