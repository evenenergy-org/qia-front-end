'use client';

import { useEffect } from 'react';
import { theme } from '../theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      const cssVar = '--' + key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
      root.style.setProperty(cssVar, value);
    });
  }, []);

  return <>{children}</>;
} 