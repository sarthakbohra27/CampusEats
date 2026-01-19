/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0F172A', // Premium Dark Slate
        },
        emerald: {
          500: '#10B981', // Pure Emerald Green
        },
        blue: {
          500: '#3B82F6', // Electric Blue
        },
        primary: '#10B981',
        secondary: '#3B82F6',
        dark: '#0F172A',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '24px', // Standardized for premium cards
      },
      backdropBlur: {
        glass: '12px',
      }
    },
  },
  plugins: [],
}
