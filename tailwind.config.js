module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'theme-purple',
    'theme-blue',
    'theme-gold',
    'install-button',
    'install-button::after',
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        ripple: {
          purple: "rgba(192, 132, 252, 0.2)",
          blue: "rgba(96, 165, 250, 0.2)",
          green: "rgba(74, 222, 128, 0.2)",
        },
        base: { 0: '#FFFFFF' },
        text: { DEFAULT: '#0F172A', muted: '#64748B' },
        muted: '#64748B',
        primary: '#7C3AED',
        secondary: '#14B8A6',
        tertiary: '#FB7185',
        info: '#2563EB',
        section: '#F5F7FB',
      },
      backgroundImage: {
        'cta-accent': 'linear-gradient(90deg,#7C3AED,#14B8A6 55%,#FB7185)',
        rainbow: 'linear-gradient(90deg,#7C3AED,#14B8A6 55%,#FB7185)',
      },
      boxShadow: {
        soft: '0 6px 20px rgba(15,23,42,0.06)',
      },
    },
  },
  plugins: [],
};
