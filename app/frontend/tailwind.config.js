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
        mudra: {
          ivory: {
            DEFAULT: '#FAF7F0',
            50: '#FDFBF7',
            100: '#FAF6EE',
            200: '#F5EFEB',
            300: '#EBE1D7',
          },
          lavender: {
            DEFAULT: '#8B5CF6',
            50: '#FAF8FF',
            100: '#F3EEFF',
            200: '#E6DCFE',
            300: '#D5C4FD',
            400: '#A78BFA',
            500: '#8B5CF6',
            600: '#7C3AED',
            700: '#6D28D9',
          },
          indigo: {
            DEFAULT: '#2F294F',
            50: '#F5F4FA',
            100: '#EBE9F4',
            200: '#D4D0E6',
            300: '#A79FC7',
            400: '#6B609E',
            500: '#473E73',
            600: '#38305F',
            700: '#2F294F',
            800: '#231E3C',
            900: '#19152C',
          },
          peach: {
            DEFAULT: '#FDBA74',
            50: '#FFF8F1',
            100: '#FEF0E2',
            200: '#FEDCBF',
            300: '#FDC497',
            400: '#FBA468',
            500: '#F97316',
          },
          gold: {
            DEFAULT: '#D4AF37',
            50: '#FEFCF0',
            100: '#FDF7D9',
            200: '#FAECAC',
            300: '#F4DC78',
            400: '#E8C546',
            500: '#D4AF37',
            600: '#B89228',
          },
          purple: {
            DEFAULT: '#6366F1',
            soft: '#C4B5FD',
            deep: '#4338CA',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(47, 41, 79, 0.08)',
        'glass-hover': '0 14px 40px 0 rgba(47, 41, 79, 0.14)',
        'glass-active': '0 20px 48px -10px rgba(124, 58, 237, 0.2)',
        'glow-lavender': '0 0 25px -3px rgba(139, 92, 246, 0.35)',
        'glow-peach': '0 0 25px -3px rgba(251, 146, 60, 0.35)',
        'glow-gold': '0 0 25px -3px rgba(212, 175, 55, 0.35)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 7s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit': 'orbit 20s linear infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'wave': 'wave 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(10px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        wave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '28px' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
