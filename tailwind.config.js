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
      },
    },
  },
  plugins: [],
};
