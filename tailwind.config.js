/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          darkest: '#070713',
          dark: '#0B0A18',
          card: '#101025',
          cardHover: '#161533',
          glass: 'rgba(16, 16, 37, 0.75)',
          glassHover: 'rgba(26, 25, 56, 0.85)',
          border: 'rgba(169, 122, 255, 0.18)',
          borderHover: 'rgba(169, 122, 255, 0.4)',
        },
        rehab: {
          purple: '#A97AFF',
          purpleLight: '#C6A9FF',
          purpleLighter: '#DCCBFF',
          blue: '#5C9EFF',
          blueLight: '#7CB5FF',
          cyan: '#3DDEE4',
          green: '#43E6A0',
          amber: '#FFC45A',
          red: '#FF6C84',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-hover': '0 12px 40px 0 rgba(169, 122, 255, 0.15)',
        'glow-purple': '0 0 25px rgba(169, 122, 255, 0.35)',
        'glow-cyan': '0 0 25px rgba(61, 222, 228, 0.35)',
        'glow-green': '0 0 20px rgba(67, 230, 160, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 8px rgba(169,122,255,0.4))' },
          '100%': { filter: 'drop-shadow(0 0 20px rgba(61,222,228,0.7))' },
        }
      }
    },
  },
  plugins: [],
}
