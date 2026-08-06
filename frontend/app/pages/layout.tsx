'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import { usePages } from '@/context/PagesContext';
import { pageTokens as tk } from '@/lib/pageTokens';

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  const { colors, dark, t, lang, setLang, setDark, scrollTo } = usePages();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      background: tk.bg,
      color: tk.text,
      fontFamily: tk.fontBody,
      minHeight: '100vh',
    }}>
      <AnimatedBackground />

      <Navigation
        lang={lang as 'en' | 'np'}
        setLang={setLang}
        dark={dark}
        setDark={setDark}
        navScrolled={navScrolled}
        colors={colors}
        scrollTo={scrollTo}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
      />

      {/* Push content below fixed nav */}
      <main style={{ paddingTop: 80 }}>
        {children}
      </main>

      <Footer colors={colors} t={t} scrollTo={scrollTo} />
    </div>
  );
}
