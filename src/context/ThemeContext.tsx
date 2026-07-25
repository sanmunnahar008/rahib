import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'emerald' | 'blue' | 'indigo' | 'teal' | 'dark';

export interface ThemeOption {
  id: AppTheme;
  nameBn: string;
  colorHex: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'emerald', nameBn: 'এমিরেল্ড গ্রীন (ডিফল্ট)', colorHex: '#10b981' },
  { id: 'blue', nameBn: 'রয়েল ব্লু', colorHex: '#2563eb' },
  { id: 'indigo', nameBn: 'মডার্ন ইন্ডিগো', colorHex: '#6366f1' },
  { id: 'teal', nameBn: 'ফ্রেশ টিল', colorHex: '#0d9488' },
  { id: 'dark', nameBn: 'ডার্ক মোড (নৈশ থিম)', colorHex: '#1e293b' }
];

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  options: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('ph_vision_theme') as AppTheme;
    return saved && THEME_OPTIONS.some((t) => t.id === saved) ? saved : 'emerald';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('ph_vision_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, options: THEME_OPTIONS }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
