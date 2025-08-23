import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null); // null prevents mismatch on SSR

  useEffect(() => {
    // Only run on client
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('theme');
    const initialTheme = stored || (prefersDark ? 'dark' : 'light');

    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (!theme) return;
    localStorage.setItem('theme', theme);

    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {/* Wait until mounted to render */}
      {theme ? children : null}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
