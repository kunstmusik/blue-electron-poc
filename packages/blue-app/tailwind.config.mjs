/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          bg: '#1a1a2e',
          surface: '#16213e',
          border: '#0f3460',
          accent: '#e94560',
          'accent-hover': '#c73650',
          muted: '#888888',
        },
      },
    },
  },
  plugins: [],
};
