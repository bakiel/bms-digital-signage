/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all JS/TS/JSX/TSX files in src
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-animated': 'linear-gradient(-45deg, #0b132b, #1c2541, #0b132b)',
      },
      backgroundSize: {
        '400%': '400% 400%',
      },
      animation: {
        gradient: 'gradientAnimation 30s ease infinite', // Reference keyframes in index.css
      },
      keyframes: { // Define keyframes here as well for completeness, though index.css has them
        gradientAnimation: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}
