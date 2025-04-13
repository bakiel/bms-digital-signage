import path from 'path'; // Import path

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.resolve(__dirname, "./index.html"),
    path.resolve(__dirname, "./src/**/*.{js,ts,jsx,tsx}"), // Scan src...
    // Exclude the admin subdirectory within src
    `!${path.resolve(__dirname, "./src/admin/**/*.{js,ts,jsx,tsx}")}`,
  ],
  // Remove the safelist, as admin styles are handled separately
  safelist: [],
  // Removed diagnostic safelist
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
