/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'title': ['Bungee', 'sans-serif'],
        'mono': ['Roboto Mono', 'monospace'],
        'vt323': ['VT323', 'monospace'],
        'fira': ['Fira Code', 'monospace'],
      },
      colors: {
        'cyberpunk-green': '#00ff8c',
        'cyberpunk-bg': '#0c0c0c',
      },
      animation: {
        'scan': 'scan 10s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out',
      },
      keyframes: {
        scan: {
          '0%': { 'background-position-y': '0' },
          '100%': { 'background-position-y': '400px' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
  safelist: [
    'text-cyberpunk-green',
    'bg-cyberpunk-green',
    'border-cyberpunk-green',
    'ring-cyberpunk-green',
    'focus:ring-cyberpunk-green',
    'focus:border-cyberpunk-green',
    'font-title',
    'font-mono',
    'font-vt323',
    'font-fira',
    'animate-scan',
    'animate-glitch',
    'glass-ui',
    'custom-scrollbar',
    'glitch-container',
    'glitch-layer',
    'code-block',
    'output-block',
  ],
}