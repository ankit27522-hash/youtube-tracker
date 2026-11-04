/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        yt: {
          red: '#ef4444',
          darkRed: '#dc2626',
          bg: '#0b0f17',
          surface: '#131c2e',
          card: '#182235',
          border: '#24324a',
          hover: '#1e2c45',
          text: '#f1f5f9',
          muted: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(239, 68, 68, 0.25)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.25)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.35)',
      }
    },
  },
  plugins: [],
}
