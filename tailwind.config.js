// @ts-check
// const { fontFamily } = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

// ../node_modules/pliny/dist/**/*.mjs is needed for monorepo setup
/** @type {import("tailwindcss/types").Config } */
module.exports = {
  content: [
    '../node_modules/pliny/**/*.{js,ts,tsx}',
    './node_modules/pliny/**/*.{js,ts,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './layouts/**/*.{js,ts,tsx}',
    './lib/**/*.{js,ts,tsx}',
    './data/**/*.mdx',
  ],
  theme: {
    extend: {
      rotate: {
        135: '135deg',
        315: '315deg',
      },
      screens: {
        xs: '500px',
        sm: '640px',
        md: '768px',
        lg: '992px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '2000px',
        short: { raw: '(max-height: 769px)' },
        medium: { raw: '(max-height: 900px)' },
      },
      spacing: {
        '9/16': '56.25%',
      },
      lineHeight: {
        11: '2.75rem',
        12: '3rem',
        13: '3.25rem',
        14: '3.5rem',
      },
      fontFamily: {
        'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        'barlow-semi-condensed': ['Barlow Semi Condensed', 'sans'],
      },

      colors: {
        primary: colors.blue,
        gray: colors.neutral,
        blue: {
          200: '#7599d1',
          300: '#5883c8',
          400: '#3e6eba',
          500: '#345D9D',
          600: '#2e528a',
          700: '#274677',
          800: '#213b64',
          900: '#122036',
        },
        btc: {
          100: '#fff7eb',
          200: '#ffe7c4',
          500: '#ff9900',
          600: '#d88100',
          700: '#b16a00',
          800: '#895200',
          900: '#4e2f00',
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.primary.500'),
              '&:hover': {
                color: `${theme('colors.primary.600')} !important`,
              },
              code: { color: theme('colors.primary.400') },
            },
            h1: {
              fontWeight: 'font-semibold',
              letterSpacing: theme('letterSpacing.tight'),
              color: theme('colors.black'),
              fontFamily: theme('fontFamily.space-grotesk'),
            },
            h2: {
              fontWeight: 'font-semibold',
              letterSpacing: theme('letterSpacing.tight'),
              color: theme('colors.black'),
              fontFamily: theme('fontFamily.space-grotesk'),
            },
            h3: {
              fontWeight: 'font-semibold',
              color: theme('colors.black'),
              letterSpacing: theme('letterSpacing.tight'),
              fontFamily: theme('fontFamily.space-grotesk'),
            },
            'h4,h5,h6': {
              color: theme('colors.gray.900'),
            },
            pre: {
              backgroundColor: theme('colors.gray.800'),
            },
            code: {
              color: theme('colors.pink.500'),
              backgroundColor: theme('colors.gray.100'),
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingTop: '2px',
              paddingBottom: '2px',
              borderRadius: '0.25rem',
            },
            'code::before': {
              content: 'none',
            },
            'code::after': {
              content: 'none',
            },
            details: {
              backgroundColor: theme('colors.gray.100'),
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingTop: '2px',
              paddingBottom: '2px',
              borderRadius: '0.25rem',
            },
            hr: { borderColor: theme('colors.gray.200') },
            'ol li::marker': {
              fontWeight: '600',
              color: theme('colors.gray.500'),
            },
            'ul li::marker': {
              backgroundColor: theme('colors.gray.500'),
            },
            strong: { color: theme('colors.gray.600') },
            blockquote: {
              color: theme('colors.gray.900'),
              borderLeftColor: theme('colors.gray.200'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
