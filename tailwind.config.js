/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        foreground: '#0f172a',
        primary: '#475569',
        secondary: '#64748b',
        border: '#e2e8f0',
        accent: {
          50: 'rgb(var(--color-accent-50) / <alpha-value>)',
          100: 'rgb(var(--color-accent-100) / <alpha-value>)',
          500: 'rgb(var(--color-accent-500) / <alpha-value>)',
          600: 'rgb(var(--color-accent-600) / <alpha-value>)',
          900: 'rgb(var(--color-accent-900) / <alpha-value>)',
        },
        surface: {
          50: 'rgb(var(--color-surface-50) / <alpha-value>)',
          100: 'rgb(var(--color-surface-100) / <alpha-value>)',
          200: 'rgb(var(--color-surface-200) / <alpha-value>)',
          300: 'rgb(var(--color-surface-300) / <alpha-value>)',
          400: 'rgb(var(--color-surface-400) / <alpha-value>)',
          500: 'rgb(var(--color-surface-500) / <alpha-value>)',
          600: 'rgb(var(--color-surface-600) / <alpha-value>)',
          700: 'rgb(var(--color-surface-700) / <alpha-value>)',
          800: 'rgb(var(--color-surface-800) / <alpha-value>)',
          900: 'rgb(var(--color-surface-900) / <alpha-value>)',
          950: 'rgb(var(--color-surface-950) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        cookie: ['Cookie', 'cursive'],
      }
    },
  },
  plugins: [],
}
