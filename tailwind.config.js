/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        forest: {
          950: '#02201a',
          900: '#0d3d2e',
          800: '#1a5c44',
          700: '#1e7a56',
          600: '#25996a',
          500: '#2db87e',
          400: '#3dd49a',
          350: '#52e0ac',
        },
        gold: {
          50: '#FBF6E8',
          100: '#F7F0DE',
          200: '#EDE2C4',
          300: '#E2CF9E',
          400: '#D4AF37',
          500: '#C9A227',
          600: '#B8962e',
          700: '#9a7b26',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'serif'],
        heading: ['var(--font-heading)', 'Luxerie', 'Georgia', 'Cambria', 'serif'],
        subheading: ['var(--font-subheading)', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'fc': '0.5rem',
        'fc-lg': '0.75rem',
        'fc-xl': '1rem',
      },
      boxShadow: {
        'fc-gold': '0 1px 3px rgba(212, 175, 55, 0.2)',
        'fc-gold-md': '0 4px 16px rgba(212, 175, 55, 0.28)',
        'fc-gold-lg': '0 6px 24px rgba(201, 162, 39, 0.25)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}
