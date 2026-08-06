'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeColors } from '@/lib/styles';
import { T } from '@/lib/translations';

interface NavigationProps {
  lang: 'en' | 'np';
  setLang: (lang: 'en' | 'np') => void;
  dark: boolean;
  setDark: (dark: boolean) => void;
  navScrolled: boolean;
  colors: ThemeColors;
  scrollTo?: (id: string) => void;
  mobileMenu: boolean;
  setMobileMenu: (open: boolean) => void;
}

const navItems = [
  {
    label: 'Services', labelNp: 'सेवाहरू', page: '/pages/services',
    icon: '⚡', desc: 'Web, Mobile, SaaS & More', tag: 'Full-Stack',
  },
  {
    label: 'About', labelNp: 'हाम्रोबारे', page: '/pages/about',
    icon: '◈', desc: 'Our Story & Vision', tag: 'Est. 2022',
  },
  {
    label: 'Pricing', labelNp: 'मूल्य', page: '/pages/pricing',
    icon: '◇', desc: 'Transparent Packages', tag: 'No Hidden Fees',
  },
  {
    label: 'Products', labelNp: 'उत्पादनहरू', page: '/pages/products',
    icon: '▣', desc: 'Our Software Ecosystem', tag: '7+ Products',
  },
  {
    label: 'Team', labelNp: 'टोली', page: '/pages/team',
    icon: '◉', desc: 'People Behind D-Kode Era', tag: 'Expert Devs',
  },
  {
    label: 'Contact', labelNp: 'सम्पर्क', page: '/pages/contact',
    icon: '◎', desc: 'Get In Touch Today', tag: '24h Response',
  },
];

export default function Navigation({
  lang,
  setLang,
  dark,
  setDark,
  navScrolled,
  colors,
  mobileMenu,
  setMobileMenu,
}: NavigationProps) {
  const t = T[lang];
  const pathname = usePathname();
  const [mobileExpanded, setMobileExpanded] = useState<number | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const isActive = (item: typeof navItems[0]) => pathname === item.page;

  // Scroll progress bar — DOM updates only, no re-renders
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        const progress = max > 0 ? Math.min((el.scrollTop / max) * 100, 100) : 0;
        if (progressRef.current) {
          progressRef.current.style.width = `${progress}%`;
        }
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenu(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenu ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenu]);

  const accentRgb = dark ? '6,182,212' : '8,145,178';

  return (
    <>
      {/* ─── SCROLL PROGRESS BAR ─────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2,
        zIndex: 1002, background: 'transparent',
      }}>
        <div ref={progressRef} style={{
          height: '100%',
          width: '0%',
          background: `linear-gradient(90deg, transparent, rgba(${accentRgb},1), rgba(${accentRgb},0.6))`,
          transition: 'width 0.1s linear',
          boxShadow: `0 0 12px rgba(${accentRgb},0.8)`,
        }} />
      </div>

      {/* ─── MAIN NAV ────────────────────────────────────────────────── */}
      <nav
        className="site-header"
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 1000,
          padding: navScrolled ? '0 40px' : '0 40px',
          height: navScrolled ? 64 : 80,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: navScrolled
            ? dark
              ? 'rgba(10,10,15,0.85)'
              : 'rgba(250,250,250,0.85)'
            : 'transparent',
          backdropFilter: navScrolled ? 'blur(24px) saturate(180%)' : 'none',
          WebkitBackdropFilter: navScrolled ? 'blur(24px) saturate(180%)' : 'none',
          borderBottom: navScrolled
            ? `1px solid rgba(${accentRgb},0.12)`
            : '1px solid transparent',
          transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: navScrolled
            ? `0 1px 0 rgba(${accentRgb},0.06), 0 8px 32px rgba(0,0,0,0.12)`
            : 'none',
        }}
      >
        {/* ─── LOGO ──────────────────────────────────────────────────── */}
        <Link
          href="/"
          id="nav-logo"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}
        >
          {/* Animated logo mark */}
          <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
            <div style={{
              position: 'absolute', inset: 0,
              border: `1.5px solid rgba(${accentRgb},0.6)`,
              borderRadius: 6,
              animation: 'logo-rotate 8s linear infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 5,
              background: `rgba(${accentRgb},0.15)`,
              borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 8, height: 8,
                background: `rgb(${accentRgb})`,
                borderRadius: 2,
                boxShadow: `0 0 12px rgba(${accentRgb},0.9)`,
                animation: 'logo-pulse 2s ease-in-out infinite',
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 20,
              fontWeight: 800,
              color: colors.text,
              letterSpacing: '-0.03em',
            }}>
              D-Kode<span style={{
                color: `rgb(${accentRgb})`,
                textShadow: `0 0 20px rgba(${accentRgb},0.4)`,
              }}>Era</span>
            </span>
            <span style={{
              fontSize: 9,
              fontFamily: "'JetBrains Mono', monospace",
              color: colors.muted,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}>Digital Studio</span>
          </div>
        </Link>

        {/* ─── DESKTOP NAV ───────────────────────────────────────────── */}
        <div className="desktop-nav" style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {navItems.map((item, i) => (
            <Link
              key={i}
              href={item.page}
              id={`nav-${item.label.toLowerCase()}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12.5,
                fontWeight: isActive(item) ? 600 : 500,
                letterSpacing: '0.04em',
                color: isActive(item) ? `rgb(${accentRgb})` : colors.muted,
                fontFamily: "'Outfit', sans-serif",
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: 8,
                background: isActive(item) ? `rgba(${accentRgb},0.1)` : 'transparent',
                border: `1px solid ${isActive(item) ? `rgba(${accentRgb},0.25)` : 'transparent'}`,
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              className="nav-item-link"
              onMouseEnter={(e) => {
                if (!isActive(item)) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = `rgb(${accentRgb})`;
                  el.style.background = `rgba(${accentRgb},0.08)`;
                  el.style.borderColor = `rgba(${accentRgb},0.2)`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item)) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = colors.muted;
                  el.style.background = 'transparent';
                  el.style.borderColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: 10, opacity: 0.7 }}>{item.icon}</span>
              {lang === 'en' ? item.label : item.labelNp}

              {/* Active dot */}
              {isActive(item) && (
                <span style={{
                  width: 4, height: 4,
                  borderRadius: '50%',
                  background: `rgb(${accentRgb})`,
                  boxShadow: `0 0 8px rgba(${accentRgb},0.8)`,
                  flexShrink: 0,
                }} />
              )}
            </Link>
          ))}
        </div>

        {/* ─── RIGHT CONTROLS ────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

          {/* Language Toggle */}
          <button
            id="nav-lang-toggle"
            onClick={() => setLang(lang === 'en' ? 'np' : 'en')}
            title="Switch language"
            style={{
              background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              border: `1px solid rgba(${accentRgb},0.15)`,
              color: colors.muted,
              padding: '7px 13px',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
              letterSpacing: '0.06em',
              borderRadius: 8,
              transition: 'all 0.2s ease',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
            className="ctrl-btn"
          >
            {lang === 'en' ? 'नेपाली' : 'EN'}
          </button>

          {/* Dark Mode Toggle */}
          <button
            id="nav-theme-toggle"
            onClick={() => setDark(!dark)}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              border: `1px solid rgba(${accentRgb},0.15)`,
              color: colors.muted,
              width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
              cursor: 'pointer',
              borderRadius: 8,
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            className="ctrl-btn"
          >
            {dark ? '☀' : '◑'}
          </button>

          {/* CTA Button */}
          <Link
            href="/pages/contact"
            id="nav-cta"
            className="desktop-nav"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: `linear-gradient(135deg, rgba(${accentRgb},0.9), rgba(${accentRgb},0.7))`,
              border: 'none',
              color: dark ? '#0a0a0f' : '#ffffff',
              padding: '9px 20px',
              fontSize: 12,
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              borderRadius: 8,
              transition: 'all 0.25s ease',
              boxShadow: `0 4px 20px rgba(${accentRgb},0.3)`,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.boxShadow = `0 6px 28px rgba(${accentRgb},0.5)`;
              el.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.boxShadow = `0 4px 20px rgba(${accentRgb},0.3)`;
              el.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: 9 }}>◆</span>
            {t.navCta}
          </Link>

          {/* Mobile Hamburger */}
          <button
            id="nav-mobile-toggle"
            onClick={() => setMobileMenu(!mobileMenu)}
            className="mobile-menu-btn"
            aria-label={mobileMenu ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenu}
            style={{
              display: 'none',
              background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              border: `1px solid rgba(${accentRgb},0.2)`,
              color: colors.text,
              width: 38, height: 38,
              borderRadius: 8,
              cursor: 'pointer',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              flexShrink: 0,
              transition: 'all 0.2s ease',
              padding: 0,
            }}
          >
            <div style={{
              width: 16, height: 1.5,
              background: colors.text,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              transform: mobileMenu ? 'rotate(45deg) translate(4.5px, 4.5px)' : 'none',
            }} />
            <div style={{
              width: mobileMenu ? 0 : 12, height: 1.5,
              background: colors.text,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              opacity: mobileMenu ? 0 : 1,
              alignSelf: 'flex-start',
              marginLeft: 3,
            }} />
            <div style={{
              width: 16, height: 1.5,
              background: colors.text,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              transform: mobileMenu ? 'rotate(-45deg) translate(4.5px, -4.5px)' : 'none',
            }} />
          </button>
        </div>
      </nav>

      {/* ─── MOBILE DRAWER ─────────────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        onClick={() => setMobileMenu(false)}
        style={{
          position: 'fixed', inset: 0,
          zIndex: 998,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          opacity: mobileMenu ? 1 : 0,
          pointerEvents: mobileMenu ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
        }}
      />

      {/* Slide-in Drawer */}
      <div
        ref={drawerRef}
        aria-hidden={!mobileMenu}
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          zIndex: 999,
          width: 'min(360px, 100vw)',
          background: dark ? '#0d0d15' : '#ffffff',
          borderLeft: `1px solid rgba(${accentRgb},0.12)`,
          boxShadow: `-20px 0 60px rgba(0,0,0,0.35)`,
          display: 'flex',
          flexDirection: 'column',
          transform: mobileMenu ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          overflowY: 'auto',
        }}
        className="mobile-drawer site-header"
      >
        {/* Drawer Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '22px 24px',
          borderBottom: `1px solid rgba(${accentRgb},0.1)`,
        }}>
          <Link
            href="/"
            onClick={() => setMobileMenu(false)}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <div style={{
              width: 28, height: 28,
              border: `1.5px solid rgba(${accentRgb},0.5)`,
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `rgba(${accentRgb},0.1)`,
            }}>
              <div style={{
                width: 7, height: 7,
                background: `rgb(${accentRgb})`,
                borderRadius: 2,
                boxShadow: `0 0 10px rgba(${accentRgb},0.8)`,
              }} />
            </div>
            <span style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 18, fontWeight: 800,
              color: colors.text, letterSpacing: '-0.02em',
            }}>
              D-Kode<span style={{ color: `rgb(${accentRgb})` }}>Era</span>
            </span>
          </Link>

          <button
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
            style={{
              width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              border: `1px solid rgba(${accentRgb},0.15)`,
              borderRadius: 8,
              color: colors.muted,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >✕</button>
        </div>

        {/* Nav Links */}
        <div style={{ flex: 1, padding: '16px 0' }}>
          {navItems.map((item, i) => (
            <div key={i}>
              <Link
                href={item.page}
                onClick={() => setMobileMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 24px',
                  textDecoration: 'none',
                  color: isActive(item) ? `rgb(${accentRgb})` : colors.text,
                  background: isActive(item) ? `rgba(${accentRgb},0.06)` : 'transparent',
                  borderLeft: `3px solid ${isActive(item) ? `rgb(${accentRgb})` : 'transparent'}`,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{
                    fontSize: 13,
                    color: isActive(item) ? `rgb(${accentRgb})` : colors.muted,
                    width: 20, textAlign: 'center',
                  }}>{item.icon}</span>
                  <div>
                    <div style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 16, fontWeight: 700,
                      letterSpacing: '-0.01em',
                    }}>
                      {lang === 'en' ? item.label : item.labelNp}
                    </div>
                    <div style={{
                      fontSize: 11, color: colors.muted,
                      fontFamily: "'Outfit', sans-serif",
                      marginTop: 1,
                    }}>{item.desc}</div>
                  </div>
                </div>
                <span style={{
                  fontSize: 10,
                  color: colors.muted,
                  background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  padding: '2px 8px',
                  borderRadius: 20,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.06em',
                }}>{item.tag}</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Drawer Footer Controls */}
        <div style={{
          padding: '20px 24px',
          borderTop: `1px solid rgba(${accentRgb},0.1)`,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setLang(lang === 'en' ? 'np' : 'en')}
              style={{
                flex: 1,
                background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: `1px solid rgba(${accentRgb},0.2)`,
                color: colors.muted,
                padding: '10px',
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
                borderRadius: 8,
                letterSpacing: '0.06em',
              }}
            >
              {lang === 'en' ? '🇳🇵 नेपाली' : '🇬🇧 English'}
            </button>
            <button
              onClick={() => setDark(!dark)}
              style={{
                width: 44,
                background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: `1px solid rgba(${accentRgb},0.2)`,
                color: colors.muted,
                fontSize: 16,
                cursor: 'pointer',
                borderRadius: 8,
              }}
            >
              {dark ? '☀' : '◑'}
            </button>
          </div>

          <Link
            href="/pages/contact"
            onClick={() => setMobileMenu(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: `linear-gradient(135deg, rgba(${accentRgb},1), rgba(${accentRgb},0.75))`,
              color: dark ? '#0a0a0f' : '#fff',
              padding: '13px',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              textDecoration: 'none',
              borderRadius: 10,
              boxShadow: `0 6px 24px rgba(${accentRgb},0.35)`,
              letterSpacing: '0.03em',
            }}
          >
            <span style={{ fontSize: 10 }}>◆</span>
            {t.navCta}
          </Link>

          <div style={{
            textAlign: 'center',
            fontSize: 10,
            color: colors.muted,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.1em',
            opacity: 0.5,
          }}>
            D-KODE ERA © {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* ─── KEYFRAMES + RESPONSIVE ────────────────────────────────────── */}
      <style>{`
        @keyframes logo-rotate {
          0%   { transform: rotate(0deg);   border-color: rgba(${accentRgb},0.6); }
          50%  { transform: rotate(180deg); border-color: rgba(${accentRgb},0.3); }
          100% { transform: rotate(360deg); border-color: rgba(${accentRgb},0.6); }
        }
        @keyframes logo-pulse {
          0%,100% { transform: scale(1);    box-shadow: 0 0 12px rgba(${accentRgb},0.9); }
          50%      { transform: scale(1.2); box-shadow: 0 0 20px rgba(${accentRgb},1);   }
        }

        .ctrl-btn:hover {
          border-color: rgba(${accentRgb},0.5) !important;
          color: rgb(${accentRgb}) !important;
          background: rgba(${accentRgb},0.08) !important;
        }

        .nav-item-link::after {
          content: " ";
          position: absolute;
          bottom: 0; left: 50%; right: 50%;
          height: 1px;
          background: rgb(${accentRgb});
          transition: all 0.3s ease;
          opacity: 0;
          font-size: 0;
        }

        @media (max-width: 960px) {
          .mobile-menu-btn  { display: flex !important; }
          .desktop-nav      { display: none !important; }
        }
        @media (max-width: 640px) {
          nav { padding: 0 20px !important; }
        }
      `}</style>
    </>
  );
}
