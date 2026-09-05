/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#040711',
          900: '#070D1F',
          850: '#0C152F',
          800: '#111D3F',
          700: '#1A2A54',
          border: '#1E3260',
          cyan: '#00F0FF',
          blue: '#1E69FF',
          accent: '#0DF',
        },
        maritime: {
          verified: '#10B981',
          mismatch: '#F59E0B',
          dark: '#EF4444',
          buoy: '#38BDF8',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.25)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.35)',
        'glow-amber': '0 0 15px rgba(245, 158, 11, 0.25)',
        'glow-green': '0 0 15px rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
}
