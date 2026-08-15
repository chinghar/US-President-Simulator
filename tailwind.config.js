/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070b14',
          900: '#0b1120',
          800: '#111a2e',
          700: '#1a2540',
        },
      },
    },
  },
  plugins: [],
};
