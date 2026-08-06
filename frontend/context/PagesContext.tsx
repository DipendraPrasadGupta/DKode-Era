'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeColors, getThemeColors } from '@/lib/styles';
import { T } from '@/lib/translations';

interface PagesContextValue {
  lang: 'en' | 'np';
  setLang: (lang: 'en' | 'np') => void;
  dark: boolean;
  setDark: (dark: boolean) => void;
  colors: ThemeColors;
  t: typeof T.en;
  scrollTo: (id: string) => void;
}

export const PagesContext = createContext<PagesContextValue | null>(null);

export function usePages() {
  const ctx = useContext(PagesContext);
  if (!ctx) throw new Error('usePages must be used within SiteShell');
  return ctx;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<'en' | 'np'>('en');
  const [dark, setDarkState] = useState<boolean>(true);
  // `mounted` prevents server/client HTML mismatch — localStorage is only
  // read on the client after hydration is complete.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang === 'en' || savedLang === 'np') {
      setLangState(savedLang);
    }
    const savedDark = localStorage.getItem('dark');
    if (savedDark !== null) {
      setDarkState(savedDark === 'true');
    }
    setMounted(true);
  }, []);

  const setLang = (newLang: 'en' | 'np') => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  };

  const setDark = (newDark: boolean) => {
    setDarkState(newDark);
    localStorage.setItem('dark', String(newDark));
  };

  // Before mounting, always use server-safe defaults so SSR HTML matches.
  const colors = getThemeColors(mounted ? dark : true);
  const t = T[mounted ? lang : 'en'];

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <PagesContext.Provider value={{ lang, setLang, dark, setDark, colors, t, scrollTo }}>
      {children}
    </PagesContext.Provider>
  );
}

