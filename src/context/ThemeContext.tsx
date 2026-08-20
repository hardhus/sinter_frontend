import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'default' | 'jinx' | 'realmorphism';
type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  colorMode: ColorMode;
  setTheme: (theme: Theme) => void;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Başlangıç değerini localStorage'dan oku, yoksa 'light' kullan
  const getInitialColorMode = (): ColorMode => {
    const saved = localStorage.getItem('colorMode') as ColorMode | null;
    if (saved === 'light' || saved === 'dark') return saved;
    // Sistem tercihini kontrol et (isteğe bağlı)
    // if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light'; // varsayılan light
  };

  const getInitialTheme = (): Theme => {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved === 'default' || saved === 'jinx' || saved === 'realmorphism') return saved;
    return 'default';
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [colorMode, setColorMode] = useState<ColorMode>(getInitialColorMode);

  // Tema ve renk modu değişince DOM'a uygula
  useEffect(() => {
    const html = document.documentElement;
    // Tema sınıflarını temizle
    html.classList.remove('theme-jinx', 'theme-realmorphism');
    if (theme !== 'default') {
      html.classList.add(`theme-${theme}`);
    }
    // Koyu/açık mod
    if (colorMode === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    // localStorage'a kaydet
    localStorage.setItem('theme', theme);
    localStorage.setItem('colorMode', colorMode);
  }, [theme, colorMode]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const toggleColorMode = () => setColorMode(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, colorMode, setTheme, toggleColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};;
