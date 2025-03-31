import React, { createContext, useContext, useState } from 'react';

const defaultTheme = {
  background: '#f2f2f2',
  text: '#000000',
  primary: '#6366F1',
  primaryLight: '#818CF8',
  card: '#FFFFFF',
  border: '#E5E7EB',
  success: '#4CAF50',
  danger: '#DC2626',
  textSecondary: '#666666',
};

export const ThemeContext = createContext({
  theme: defaultTheme,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);

  const toggleTheme = () => {
    // Implémentez la logique de changement de thème ici
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
