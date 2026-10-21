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
        navy: {
          950: '#060913',
          900: '#0a0f1d',
          850: '#0f172a',
          800: '#151f38',
          750: '#1a2747',
          700: '#223259',
          600: '#334878',
        },
        spoil: {
          emerald: '#00f59b',
          teal: '#14b8a6',
          cyan: '#00f0ff',
          violet: '#8b5cf6',
          warning: '#f59e0b',
          danger: '#ff3366',
          accent: '#38bdf8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -4px rgba(0, 245, 155, 0.35)',
        'glow-cyan': '0 0 25px -4px rgba(0, 240, 255, 0.35)',
        'glow-danger': '0 0 25px -4px rgba(255, 51, 102, 0.35)',
        'glow-amber': '0 0 25px -4px rgba(245, 158, 11, 0.35)',
        'glow-violet': '0 0 25px -4px rgba(139, 92, 246, 0.35)',
        'glass-inner': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(0, 245, 155, 0.12) 0%, transparent 70%)',
        'grid-pattern': 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}
