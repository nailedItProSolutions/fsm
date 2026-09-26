/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: {
            DEFAULT: '#c5a059',
            light: '#fcf6ba',
            dark: '#aa771c',
            border: '#c5a0594d',
            glow: 'rgba(212, 175, 55, 0.3)',
          },
          orange: {
            DEFAULT: '#FF8A00',
            neon: '#ff5f1f',
            hover: '#ea580c',
            glow: 'rgba(255, 95, 31, 0.4)',
          },
          dark: {
            DEFAULT: '#0a0a0a',
            surface: '#111111',
            card: '#161616',
            border: '#222222',
            hover: '#1a1a1a',
          },
          text: {
            main: '#fdfbf7',
            sub: '#b8b0a5',
            muted: '#78716c',
          },
          navy: {
            DEFAULT: '#0F172A',
            light: '#1E293B',
            dark: '#020617',
          },
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Playfair Display', 'serif'],
        body: ['var(--font-body)', 'Montserrat', 'sans-serif'],
        sans: ['var(--font-body)', 'Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)',
      },
    },
  },
  plugins: [],
};
