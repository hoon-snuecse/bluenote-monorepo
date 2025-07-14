'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, themes, getTheme } from './themes';

interface ThemeContextType {
  theme: Theme;
  themeId: string;
  setTheme: (themeId: string) => void;
  availableThemes: typeof themes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children,
  defaultTheme = 'glass'
}: { 
  children: React.ReactNode;
  defaultTheme?: string;
}) {
  const [themeId, setThemeId] = useState(defaultTheme);
  const [theme, setThemeState] = useState<Theme>(getTheme(defaultTheme));

  useEffect(() => {
    // localStorage에서 저장된 테마 불러오기
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && themes[savedTheme]) {
      setThemeId(savedTheme);
      setThemeState(getTheme(savedTheme));
    }
  }, []);

  const setTheme = (newThemeId: string) => {
    if (themes[newThemeId]) {
      setThemeId(newThemeId);
      setThemeState(getTheme(newThemeId));
      localStorage.setItem('selectedTheme', newThemeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}