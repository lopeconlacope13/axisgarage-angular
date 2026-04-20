/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,css}",
  ],
  theme: {
    extend: {
      colors: {
        axis: {
          black:        '#0a0a0a',
          charcoal:     '#111111',
          surface:      '#1a1a1a',
          gold:         '#C9A14A',
          'gold-light': '#d4ab3a',
          'gold-dark':  '#9a7a1e',
          white:        '#f5f5f0',
          gray:         '#9a9a95',
          'gray-dark':  '#6b6b66',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'gold':    '0 10px 30px rgba(201, 161, 74, 0.25)',
        'gold-sm': '0 4px 12px rgba(201, 161, 74, 0.18)',
        'card':    '0 18px 50px rgba(0, 0, 0, 0.55)',
        'glass':   '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        xs: '4px',
      },
      animation: {
        'fade-in':       'fadeIn 0.6s ease-out forwards',
        'slide-up':      'slideUp 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
        'marquee':       'marquee 35s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-32px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      aspectRatio: {
        'video': '16 / 9',
      },
    },
  },
  plugins: [],
}
