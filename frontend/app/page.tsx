'use client';

import { useState, useEffect, useRef } from 'react';
import { getFallbackApiUrl } from '@/lib/api';
import HeroSection from '@/components/HeroSection';

import ServicesSection from '@/components/ServicesSection';
import ProductEcosystemSection from '@/components/ProductEcosystemSection';

import AboutSection from '@/components/AboutSection';
import TechStackSection from '@/components/TechStackSection';
import FAQSection from '@/components/FAQSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import ProcessSection from '@/components/ProcessSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import MouseTracker from '@/components/MouseTracker';
import FloatingButtons from '@/components/FloatingButtons';
import ExitPopup from '@/components/ExitPopup';
import QuoteCalculator from '@/components/QuoteCalculator';
import { usePages } from '@/context/PagesContext';

export default function HomePage() {
  const { colors, dark, t, lang, setLang, setDark } = usePages();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [exitPopupOpen, setExitPopup] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [counters, setCounters] = useState({ p: 0, c: 0, i: 0, s: 0 });
  const [visitors, setVisitors] = useState(0);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Real visitor tracking ─────────────────────────────────────────
  // POST /api/visitors/ping on mount → registers this visit and returns
  // { total, today }. Poll every 30 s so the count stays fresh.
  useEffect(() => {
    const apiBase = getFallbackApiUrl();

    const ping = async () => {
      try {
        const res = await fetch(`${apiBase}/api/visitors/ping`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          // Show today's unique visitor count as the "live" number
          setVisitors(data.today ?? data.total ?? 0);
        }
      } catch {
        // Backend unreachable in dev — silently ignore
      }
    };

    ping();
    const interval = setInterval(ping, 30_000);
    return () => clearInterval(interval);
  }, []);

  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // 1. Check if user already dismissed or interacted with popup permanently
    try {
      const isPermanentlyDismissed =
        localStorage.getItem('dkode_exit_popup_dismissed') ||
        sessionStorage.getItem('dkode_exit_popup_dismissed') ||
        localStorage.getItem('seenExitPopup') ||
        sessionStorage.getItem('seenExitPopup');

      if (isPermanentlyDismissed) {
        hasTriggeredRef.current = true;
        return;
      }
    } catch (e) {}

    let minTimeReached = false;
    let hasScrolled = false;

    // Track time on page (require at least 8 seconds)
    const timeTimer = setTimeout(() => {
      minTimeReached = true;
    }, 8000);

    // Track user scroll engagement
    const handleScroll = () => {
      if (window.scrollY > 120) {
        hasScrolled = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Exit intent mouseover/mouseleave trigger (mouse moves to browser top bar)
    const handleMouseLeave = (e: MouseEvent) => {
      // 1. Immediately abort if already triggered once in component ref
      if (hasTriggeredRef.current) return;

      // 2. Immediately check if already shown or dismissed in storage
      try {
        if (
          localStorage.getItem('dkode_exit_popup_dismissed') ||
          sessionStorage.getItem('dkode_exit_popup_dismissed') ||
          localStorage.getItem('seenExitPopup') ||
          sessionStorage.getItem('seenExitPopup')
        ) {
          hasTriggeredRef.current = true;
          document.removeEventListener('mouseleave', handleMouseLeave);
          return;
        }
      } catch (e) {}

      // 3. Must meet strict engagement conditions
      if (e.clientY <= 12 && minTimeReached && hasScrolled) {
        hasTriggeredRef.current = true;
        setExitPopup(true);

        // Mark as permanently dismissed right when triggered
        try {
          localStorage.setItem('dkode_exit_popup_dismissed', 'true');
          sessionStorage.setItem('dkode_exit_popup_dismissed', 'true');
          localStorage.setItem('seenExitPopup', 'true');
          sessionStorage.setItem('seenExitPopup', 'true');
        } catch (err) {}

        // Detach listener immediately so it can NEVER trigger again
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      clearTimeout(timeTimer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);




  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ background: colors.bg, color: colors.text, fontFamily: 'Outfit, sans-serif' }}>
      <AnimatedBackground />
      <MouseTracker />
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

      <HeroSection colors={colors} visitors={visitors} counters={counters} t={t} scrollTo={scrollTo} setQuoteOpen={setQuoteOpen} />

      <ServicesSection colors={colors} lang={lang as 'en' | 'np'} t={t} />
      <ProductEcosystemSection colors={colors} t={t} scrollTo={scrollTo} setQuoteOpen={setQuoteOpen} />


      <AboutSection colors={colors} t={t} />
      <TechStackSection colors={colors} />
      <ProcessSection colors={colors} />
      <TestimonialsSection colors={colors} t={t} />
      <FAQSection colors={colors} t={t} />
      <ContactSection colors={colors} t={t} />

      <Footer colors={colors} t={t} scrollTo={scrollTo} />
      <FloatingButtons colors={colors} scrollTo={scrollTo} />
      {quoteOpen && <QuoteCalculator colors={colors} t={t} quoteOpen={quoteOpen} setQuoteOpen={setQuoteOpen} scrollTo={scrollTo} />}
      {exitPopupOpen && <ExitPopup colors={colors} t={t} setExitPopup={setExitPopup} scrollTo={scrollTo} />}
    </div>
  );
}
