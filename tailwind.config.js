/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        foreground: '#0f172a',
        primary: '#475569', // Arbor Slate 600
        secondary: '#64748b',
        border: '#e2e8f0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
