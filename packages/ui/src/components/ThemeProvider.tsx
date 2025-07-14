'use client';

import * as React from 'react';

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark';
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'light' 
}: ThemeProviderProps) {
  // 향후 다크모드 지원을 위한 준비
  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(defaultTheme);
  }, [defaultTheme]);

  return <>{children}</>;
}