import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FAF6EF',
        ink: '#211F1C',
        indigo: {
          DEFAULT: '#33415C',
          dark: '#232D40',
          light: '#4A5C80',
        },
        brass: {
          DEFAULT: '#A9793A',
          light: '#C89B5C',
        },
        sage: '#4F7A5B',
        rust: '#B04B32',
        line: '#E4DCCB',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        ruled:
          'repeating-linear-gradient(to bottom, transparent, transparent 39px, #E4DCCB 40px)',
      },
    },
  },
  plugins: [],
};
export default config;
