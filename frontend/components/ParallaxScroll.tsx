'use client';

import { useEffect } from 'react';

export default function ParallaxScroll() {
  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScroll);
      }
    };

    updateScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}
