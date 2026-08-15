/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: 'var(--ink-900)',
          700: 'var(--ink-700)',
        },
        rule: 'var(--rule)',
        paper: 'var(--paper)',
        seal: 'var(--seal)',
        brass: 'var(--brass)',
        union: 'var(--union)',
        flag: 'var(--flag)',
      },
      fontFamily: {
        display: ['"Libre Caslon Display"', 'Georgia', 'serif'],
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        h1: ['48px', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        h2: ['32px', { lineHeight: '1.15' }],
        h3: ['22px', { lineHeight: '1.3' }],
        body: ['16px', { lineHeight: '1.5' }],
        small: ['14px', { lineHeight: '1.45' }],
        eyebrow: ['12px', { lineHeight: '1.3', letterSpacing: '0.12em' }],
      },
      // "No border-radius above 2px anywhere" — this caps every radius
      // utility in the app, including `rounded-full`, by design.
      borderRadius: {
        none: '0px',
        DEFAULT: '2px',
        sm: '1px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        '2xl': '2px',
        full: '2px',
      },
      boxShadow: {
        none: 'none',
      },
      transitionDuration: {
        150: '150ms',
        200: '200ms',
        250: '250ms',
        400: '400ms',
        900: '900ms',
      },
    },
  },
  plugins: [],
};
