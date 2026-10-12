'use client';

import { useState, useEffect } from 'react';
import { ThemeColors } from '@/lib/styles';
import { useSiteSettings } from '@/lib/useSiteSettings';

interface FloatingButtonsProps {
  colors: ThemeColors;
  scrollTo: (id: string) => void;
}

export default function FloatingButtons({ colors, scrollTo }: FloatingButtonsProps) {
  const { settings } = useSiteSettings();
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const footerEl = document.querySelector('footer');
      if (footerEl) {
        const rect = footerEl.getBoundingClientRect();
        // Visible when user scrolls till or near the footer
        setShowTop(rect.top <= window.innerHeight + 300);
      } else {
        // Fallback: visible when within 1400px of page bottom
        const scrollBottom = window.innerHeight + window.scrollY;
        const totalHeight = document.documentElement.scrollHeight;
        setShowTop(scrollBottom >= totalHeight - 1400);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const waNum = (settings.whatsapp_number || '+9779807544395').replace(/[^0-9]/g, '');
  const phoneNum = (settings.agency_phone || '+9779807544395').replace(/[^+0-9]/g, '');

  const buttonStyle = (isHovered: boolean, bgColor: string, shadowColor: string) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isHovered ? 12 : 0,
    height: 52,
    width: isHovered ? 160 : 52,
    padding: isHovered ? '0 24px' : '0',
    background: bgColor,
    color: '#ffffff',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '0.05em',
    textDecoration: 'none',
    border: 'none',
    borderRadius: 26,
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    boxShadow: isHovered 
      ? `0 14px 28px ${shadowColor}`
      : `0 8px 18px ${shadowColor}`,
    overflow: 'hidden',
    position: 'relative' as const,
    pointerEvents: 'auto' as const,
  });

  const iconStyle = {
    fontSize: 22,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const textStyle = {
    whiteSpace: 'nowrap' as const,
    opacity: 1,
    transform: 'translateX(0)',
    transition: 'all 0.3s ease',
  };

  return (
    <>
      <style>{`
        @keyframes floatTopOrb {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
      <div 
        style={{ 
          position: 'fixed', 
          bottom: 'calc(clamp(72px, 10vh, 100px) + env(safe-area-inset-bottom, 0px))', 
          right: 'clamp(20px, 3.5vw, 36px)', 
          zIndex: 900, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 14, 
          alignItems: 'flex-end',
          pointerEvents: 'none',
        }}
      >
        {/* 1. WhatsApp Button (First) */}
        <a
          href={`https://wa.me/${waNum}`}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHoveredBtn('wa')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={buttonStyle(
            hoveredBtn === 'wa', 
            'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', 
            'rgba(37, 211, 102, 0.4)'
          )}
        >
          <span style={iconStyle}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </span>
          {hoveredBtn === 'wa' && (
            <span style={textStyle}>WhatsApp</span>
          )}
        </a>

        {/* 2. Call Now Button (Middle) */}
        <a
          href={`tel:${phoneNum}`}
          onMouseEnter={() => setHoveredBtn('call')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={buttonStyle(
            hoveredBtn === 'call', 
            'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', 
            'rgba(6, 182, 212, 0.4)'
          )}
        >
          <span style={iconStyle}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </span>
          {hoveredBtn === 'call' && (
            <span style={textStyle}>Call Now</span>
          )}
        </a>

        {/* 3. Floating Back to Top Button (Last - visible when user goes till footer) */}
        <button
          onClick={scrollToTop}
          onMouseEnter={() => setHoveredBtn('top')}
          onMouseLeave={() => setHoveredBtn(null)}
          title="Back to Top"
          aria-label="Back to Top"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: hoveredBtn === 'top' ? 10 : 0,
            height: 48,
            width: hoveredBtn === 'top' ? 136 : 48,
            padding: hoveredBtn === 'top' ? '0 18px' : '0',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
            color: '#ffffff',
            fontFamily: "'Outfit', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.04em',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            borderRadius: 24,
            cursor: 'pointer',
            transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: hoveredBtn === 'top'
              ? '0 14px 28px -2px rgba(6, 182, 212, 0.6), 0 0 20px rgba(139, 92, 246, 0.45)'
              : '0 8px 22px -2px rgba(6, 182, 212, 0.45)',
            overflow: 'hidden',
            opacity: showTop ? 1 : 0,
            pointerEvents: showTop ? 'auto' : 'none',
            transform: showTop
              ? hoveredBtn === 'top'
                ? 'translateY(-2px) scale(1.03)'
                : 'translateY(0)'
              : 'translateY(24px) scale(0.7)',
            animation: showTop && hoveredBtn !== 'top' ? 'floatTopOrb 3s ease-in-out infinite' : 'none',
          }}
        >
          <span style={iconStyle}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </span>
          {hoveredBtn === 'top' && (
            <span style={textStyle}>Back to Top</span>
          )}
        </button>
      </div>
    </>
  );
}
