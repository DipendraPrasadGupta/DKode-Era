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

const mainNavItems = [
  {
    label: 'Our Products', labelNp: 'उत्पादनहरू', page: '/pages/products',
    icon: '▣', desc: 'Our Software Ecosystem', tag: '7+ Products', badge: '7+', badgeColor: 'rgba(168,85,247,0.15)', badgeTextColor: '#a855f7'
  },
  {
    label: 'Tools', labelNp: 'उपकरणहरू', page: '/pages/tools',
    icon: '🛠️', desc: 'Dev & AI Suite', tag: 'Free Utilities', badge: 'FREE', badgeColor: 'rgba(0,212,255,0.15)', badgeTextColor: '#00d4ff'
  },
  {
    label: 'Blogs', labelNp: 'ब्लगहरू', page: '/pages/blogs',
    icon: '📰', desc: 'Tech Insights & News', tag: 'Articles', badge: 'NEW', badgeColor: 'rgba(0,229,160,0.15)', badgeTextColor: '#00e5a0'
  },
  {
    label: 'Career', labelNp: 'करियर', page: '/pages/careers',
    icon: '💼', desc: 'Join Our Team', tag: 'We\'re Hiring', badge: 'HIRING', badgeColor: 'rgba(245,200,66,0.15)', badgeTextColor: '#f5c842'
  },
];

const moreNavItems = [
  {
    label: 'Services', labelNp: 'सेवाहरू', page: '/pages/services',
    icon: '⚡', desc: 'Web, Mobile, SaaS & More', tag: 'Full-Stack',
  },
  {
    label: 'Pricing', labelNp: 'मूल्य', page: '/pages/pricing',
    icon: '◇', desc: 'Transparent Packages', tag: 'No Hidden Fees',
  },
  {
    label: 'About', labelNp: 'हाम्रोबारे', page: '/pages/about',
    icon: '◈', desc: 'Our Story & Vision', tag: 'Est. 2022',
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
  const [moreOpen, setMoreOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (item: { page: string }) => pathname === item.page;
  const isMoreActive = moreNavItems.some((item) => pathname === item.page);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setMoreOpen(false);
    setMobileMenu(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenu ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenu]);

  // Scroll progress bar DOM updater
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

  const accentRgb = dark ? '6,182,212' : '8,145,178';
  const cyanGlow = dark ? 'rgba(0, 212, 255, 0.4)' : 'rgba(8, 145, 178, 0.3)';

  return (
    <>
      {/* ─── AMBIENT SCROLL PROGRESS BEAM ───────────────────────────────── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 1002,
          pointerEvents: 'none',
        }}
      >
        <div
          ref={progressRef}
          style={{
            height: '100%',
            width: '0%',
            background: `linear-gradient(90deg, #00d4ff 0%, #a855f7 50%, #00e5a0 100%)`,
            transition: 'width 0.1s linear',
            boxShadow: `0 0 16px ${cyanGlow}`,
          }}
        />
      </div>

      {/* ─── MAIN FLOATING HEADER NAV BAR ──────────────────────────────── */}
      <nav
        className="site-header"
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          top: navScrolled ? 12 : 0,
          left: 0,
          right: 0,
          maxWidth: navScrolled ? 1280 : '100%',
          margin: '0 auto',
          borderRadius: navScrolled ? 24 : 0,
          zIndex: 1000,
          padding: navScrolled ? '0 28px' : '0 40px',
          height: navScrolled ? 60 : 78,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: navScrolled
            ? dark
              ? 'rgba(10, 14, 26, 0.88)'
              : 'rgba(255, 255, 255, 0.88)'
            : 'transparent',
          backdropFilter: navScrolled ? 'blur(28px) saturate(200%)' : 'none',
          WebkitBackdropFilter: navScrolled ? 'blur(28px) saturate(200%)' : 'none',
          border: navScrolled
            ? `1px solid rgba(${accentRgb}, 0.2)`
            : '1px solid transparent',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: navScrolled
            ? `0 12px 40px -10px rgba(0, 0, 0, 0.4), 0 0 20px rgba(${accentRgb}, 0.08)`
            : 'none',
        }}
      >
        {/* ─── BRAND LOGO ────────────────────────────────────────────── */}
        <Link
          href="/"
          id="nav-logo"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}
        >
          {/* Animated Emblem */}
          <div style={{ position: 'relative', width: 34, height: 34, flexShrink: 0 }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                border: `1.5px solid rgba(${accentRgb}, 0.7)`,
                borderRadius: 8,
                animation: 'logo-rotate 10s linear infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 5,
                background: `radial-gradient(circle, rgba(${accentRgb}, 0.25) 0%, transparent 80%)`,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 9,
                  height: 9,
                  background: `rgb(${accentRgb})`,
                  borderRadius: 3,
                  boxShadow: `0 0 14px rgba(${accentRgb}, 1)`,
                  animation: 'logo-pulse 2.2s ease-in-out infinite',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 21,
                fontWeight: 800,
                color: colors.text,
                letterSpacing: '-0.03em',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              D-Kode
              <span
                style={{
                  background: `linear-gradient(135deg, rgb(${accentRgb}) 0%, #00e5a0 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: `0 0 24px rgba(${accentRgb}, 0.3)`,
                }}
              >
                Era
              </span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span
                style={{
                  fontSize: 8.5,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: colors.muted,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                Digital Studio
              </span>
              <span
                className="desktop-nav"
                style={{
                  fontSize: 7.5,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: 'rgba(0, 229, 160, 0.12)',
                  color: '#00e5a0',
                  border: '1px solid rgba(0, 229, 160, 0.25)',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}
              >
                ● LIVE
              </span>
            </div>
          </div>
        </Link>

        {/* ─── DESKTOP NAVIGATION ITEMS ────────────────────────────────── */}
        <div className="desktop-nav" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {mainNavItems.map((item, i) => {
            const active = isActive(item);
            return (
              <Link
                key={i}
                href={item.page}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`nav-item-link ${active ? 'nav-item-active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 12.5,
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '0.01em',
                  color: active ? `rgb(${accentRgb})` : colors.muted,
                  fontFamily: "'Outfit', sans-serif",
                  textDecoration: 'none',
                  padding: '7px 14px',
                  borderRadius: 12,
                  background: active
                    ? `linear-gradient(135deg, rgba(${accentRgb},0.16) 0%, rgba(${accentRgb},0.06) 100%)`
                    : 'transparent',
                  border: `1px solid ${active ? `rgba(${accentRgb},0.35)` : 'transparent'}`,
                  boxShadow: active ? `0 4px 16px rgba(${accentRgb},0.15)` : 'none',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  position: 'relative',
                }}
              >
                {/* Glowing micro icon box */}
                <span
                  className="nav-icon-box"
                  style={{
                    fontSize: 12,
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: active ? `rgba(${accentRgb},0.2)` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? `rgba(${accentRgb},0.4)` : 'rgba(255,255,255,0.08)'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  {item.icon}
                </span>

                <span>{lang === 'en' ? item.label : item.labelNp}</span>

                {/* Micro Badge */}
                {item.badge && (
                  <span
                    style={{
                      fontSize: 8,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: 4,
                      background: item.badgeColor,
                      color: item.badgeTextColor,
                      border: `1px solid ${item.badgeColor}`,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Active Neon Line */}
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      left: '25%',
                      right: '25%',
                      height: 2,
                      background: `linear-gradient(90deg, transparent, rgb(${accentRgb}), transparent)`,
                      borderRadius: 2,
                      boxShadow: `0 0 10px rgb(${accentRgb})`,
                    }}
                  />
                )}
              </Link>
            );
          })}

          {/* ─── MORE DROPDOWN MENU ───────────────────────────────────── */}
          <div
            ref={dropdownRef}
            style={{ position: 'relative' }}
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button
              id="nav-more-dropdown"
              onClick={() => setMoreOpen(!moreOpen)}
              className={`nav-item-link ${isMoreActive || moreOpen ? 'nav-item-active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 12.5,
                fontWeight: isMoreActive || moreOpen ? 700 : 500,
                letterSpacing: '0.01em',
                color: isMoreActive || moreOpen ? `rgb(${accentRgb})` : colors.muted,
                fontFamily: "'Outfit', sans-serif",
                padding: '7px 14px',
                borderRadius: 12,
                background: isMoreActive || moreOpen
                  ? `linear-gradient(135deg, rgba(${accentRgb},0.16) 0%, rgba(${accentRgb},0.06) 100%)`
                  : 'transparent',
                border: `1px solid ${isMoreActive || moreOpen ? `rgba(${accentRgb},0.35)` : 'transparent'}`,
                boxShadow: isMoreActive || moreOpen ? `0 4px 16px rgba(${accentRgb},0.15)` : 'none',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: 'pointer',
              }}
            >
              <span
                className="nav-icon-box"
                style={{
                  fontSize: 11,
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: isMoreActive || moreOpen ? `rgba(${accentRgb},0.2)` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isMoreActive || moreOpen ? `rgba(${accentRgb},0.4)` : 'rgba(255,255,255,0.08)'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: `rgb(${accentRgb})`,
                  transition: 'all 0.3s ease',
                }}
              >
                ✦
              </span>

              <span>{lang === 'en' ? 'More' : 'अझै'}</span>

              <span
                style={{
                  fontSize: 10,
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: moreOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  opacity: 0.8,
                }}
              >
                ▾
              </span>
            </button>

            {/* Premium Glassmorphism Dropdown Popup */}
            {moreOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 10,
                  width: 340,
                  background: dark ? 'rgba(10, 14, 26, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                  border: `1px solid rgba(${accentRgb}, 0.3)`,
                  borderRadius: 20,
                  padding: '14px 12px',
                  boxShadow: `0 28px 70px rgba(0, 0, 0, 0.55), 0 0 35px rgba(${accentRgb}, 0.15)`,
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
                  zIndex: 1010,
                  animation: 'navDropdownEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  overflow: 'hidden',
                }}
              >
                {/* Top Accent Gradient Line */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2.5,
                    background: `linear-gradient(90deg, #00d4ff 0%, #a855f7 50%, #00e5a0 100%)`,
                  }}
                />

                <div
                  style={{
                    fontSize: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '0.18em',
                    color: `rgb(${accentRgb})`,
                    textTransform: 'uppercase',
                    padding: '6px 12px 10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>✦ EXPLORE PAGES</span>
                  <span style={{ fontSize: 9, opacity: 0.6, textTransform: 'none' }}>5 Sections</span>
                </div>

                {moreNavItems.map((subItem, idx) => {
                  const subActive = isActive(subItem);
                  return (
                    <Link
                      key={idx}
                      href={subItem.page}
                      id={`nav-${subItem.label.toLowerCase()}`}
                      onClick={() => setMoreOpen(false)}
                      className="more-dropdown-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '11px 14px',
                        borderRadius: 14,
                        textDecoration: 'none',
                        color: subActive ? `rgb(${accentRgb})` : colors.text,
                        background: subActive
                          ? `linear-gradient(135deg, rgba(${accentRgb}, 0.14) 0%, rgba(${accentRgb}, 0.05) 100%)`
                          : 'transparent',
                        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        border: `1px solid ${subActive ? `rgba(${accentRgb}, 0.3)` : 'transparent'}`,
                        borderLeft: subActive ? `3px solid rgb(${accentRgb})` : '1px solid transparent',
                        marginBottom: 4,
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 12,
                          background: subActive
                            ? `rgba(${accentRgb}, 0.2)`
                            : dark
                            ? 'rgba(255, 255, 255, 0.04)'
                            : 'rgba(0, 0, 0, 0.04)',
                          border: `1px solid ${subActive ? `rgba(${accentRgb}, 0.4)` : 'rgba(255, 255, 255, 0.08)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 17,
                          flexShrink: 0,
                          transition: 'transform 0.25s ease',
                        }}
                      >
                        {subItem.icon}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
                            {lang === 'en' ? subItem.label : subItem.labelNp}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              fontFamily: "'JetBrains Mono', monospace",
                              padding: '2px 7px',
                              borderRadius: 6,
                              background: subActive ? `rgba(${accentRgb}, 0.15)` : 'rgba(255, 255, 255, 0.05)',
                              color: subActive ? `rgb(${accentRgb})` : colors.muted,
                              border: `1px solid ${subActive ? `rgba(${accentRgb}, 0.3)` : colors.border}`,
                              fontWeight: 600,
                            }}
                          >
                            {subItem.tag}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: colors.muted, marginTop: 3, fontFamily: "'Outfit', sans-serif" }}>
                          {subItem.desc}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT CONTROLS & ACTION BUTTONS ────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Language Toggle Pill */}
          <button
            id="nav-lang-toggle"
            onClick={() => setLang(lang === 'en' ? 'np' : 'en')}
            title="Switch Language"
            style={{
              background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              border: `1px solid rgba(${accentRgb},0.2)`,
              color: colors.text,
              padding: '6px 14px',
              fontSize: 11.5,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
              borderRadius: 10,
              transition: 'all 0.25s ease',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            className="ctrl-btn"
          >
            <span>{lang === 'en' ? '🇳🇵' : '🇬🇧'}</span>
            <span>{lang === 'en' ? 'नेपाली' : 'EN'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            id="nav-theme-toggle"
            onClick={() => setDark(!dark)}
            title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              border: `1px solid rgba(${accentRgb},0.2)`,
              color: colors.text,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              cursor: 'pointer',
              borderRadius: 10,
              transition: 'all 0.25s ease',
              flexShrink: 0,
            }}
            className="ctrl-btn"
          >
            {dark ? '☀️' : '🌙'}
          </button>

          {/* Shimmer Primary CTA Button */}
          <Link
            href="/pages/contact"
            id="nav-cta"
            className="desktop-nav nav-cta-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: `linear-gradient(135deg, #00d4ff 0%, #00e5a0 100%)`,
              border: 'none',
              color: '#050810',
              padding: '9px 22px',
              fontSize: 12.5,
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              borderRadius: 10,
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: `0 4px 20px rgba(0, 212, 255, 0.35)`,
              whiteSpace: 'nowrap',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <span style={{ fontSize: 10 }}>◆</span>
            {t.navCta}
          </Link>

          {/* Mobile Hamburger Menu Button */}
          <button
            id="nav-mobile-toggle"
            onClick={() => setMobileMenu(!mobileMenu)}
            className="mobile-menu-btn"
            aria-label={mobileMenu ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenu}
            style={{
              display: 'none',
              background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              border: `1px solid rgba(${accentRgb}, 0.25)`,
              color: colors.text,
              width: 38,
              height: 38,
              borderRadius: 10,
              cursor: 'pointer',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              flexShrink: 0,
              transition: 'all 0.25s ease',
              padding: 0,
            }}
          >
            <div
              style={{
                width: 17,
                height: 1.5,
                background: colors.text,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                transform: mobileMenu ? 'rotate(45deg) translate(4.5px, 4.5px)' : 'none',
              }}
            />
            <div
              style={{
                width: mobileMenu ? 0 : 13,
                height: 1.5,
                background: colors.text,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                opacity: mobileMenu ? 0 : 1,
                alignSelf: 'flex-start',
                marginLeft: 3.5,
              }}
            />
            <div
              style={{
                width: 17,
                height: 1.5,
                background: colors.text,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                transform: mobileMenu ? 'rotate(-45deg) translate(4.5px, -4.5px)' : 'none',
              }}
            />
          </button>
        </div>
      </nav>

      {/* ─── MOBILE SLIDE-OVER DRAWER ────────────────────────────────── */}
      <div
        onClick={() => setMobileMenu(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 998,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          opacity: mobileMenu ? 1 : 0,
          pointerEvents: mobileMenu ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
        }}
      />

      <div
        ref={drawerRef}
        aria-hidden={!mobileMenu}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          width: 'min(380px, 100vw)',
          background: dark ? '#0a0e1a' : '#ffffff',
          borderLeft: `1px solid rgba(${accentRgb}, 0.2)`,
          boxShadow: `-24px 0 60px rgba(0,0,0,0.5)`,
          display: 'flex',
          flexDirection: 'column',
          transform: mobileMenu ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto',
        }}
        className="mobile-drawer site-header"
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 28px',
            borderBottom: `1px solid rgba(${accentRgb}, 0.12)`,
          }}
        >
          <Link
            href="/"
            onClick={() => setMobileMenu(false)}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                border: `1.5px solid rgba(${accentRgb}, 0.6)`,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `rgba(${accentRgb}, 0.15)`,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  background: `rgb(${accentRgb})`,
                  borderRadius: 2,
                  boxShadow: `0 0 10px rgba(${accentRgb}, 0.9)`,
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 19,
                fontWeight: 800,
                color: colors.text,
                letterSpacing: '-0.02em',
              }}
            >
              D-Kode<span style={{ color: `rgb(${accentRgb})` }}>Era</span>
            </span>
          </Link>

          <button
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              border: `1px solid rgba(${accentRgb}, 0.2)`,
              borderRadius: 10,
              color: colors.muted,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Mobile Nav Sections */}
        <div style={{ flex: 1, padding: '20px 0' }}>
          {/* Main Core Section */}
          <div
            style={{
              padding: '0 28px 10px',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.18em',
              color: colors.muted,
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            CORE MODULES
          </div>

          {mainNavItems.map((item, i) => (
            <Link
              key={i}
              href={item.page}
              onClick={() => setMobileMenu(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '13px 28px',
                textDecoration: 'none',
                color: isActive(item) ? `rgb(${accentRgb})` : colors.text,
                background: isActive(item) ? `rgba(${accentRgb}, 0.08)` : 'transparent',
                borderLeft: `3.5px solid ${isActive(item) ? `rgb(${accentRgb})` : 'transparent'}`,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span
                  style={{
                    fontSize: 14,
                    color: isActive(item) ? `rgb(${accentRgb})` : colors.muted,
                    width: 22,
                    textAlign: 'center',
                  }}
                >
                  {item.icon}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 15.5,
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {lang === 'en' ? item.label : item.labelNp}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: colors.muted,
                      fontFamily: "'Outfit', sans-serif",
                      marginTop: 1,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: colors.muted,
                  background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  padding: '3px 9px',
                  borderRadius: 20,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.06em',
                }}
              >
                {item.tag}
              </span>
            </Link>
          ))}

          {/* Sub Section Header */}
          <div
            style={{
              padding: '24px 28px 10px',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.18em',
              color: `rgb(${accentRgb})`,
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            ✦ COMPANY & SERVICES
          </div>

          {moreNavItems.map((item, i) => (
            <Link
              key={`more-${i}`}
              href={item.page}
              onClick={() => setMobileMenu(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '13px 28px',
                textDecoration: 'none',
                color: isActive(item) ? `rgb(${accentRgb})` : colors.text,
                background: isActive(item) ? `rgba(${accentRgb}, 0.08)` : 'transparent',
                borderLeft: `3.5px solid ${isActive(item) ? `rgb(${accentRgb})` : 'transparent'}`,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span
                  style={{
                    fontSize: 14,
                    color: isActive(item) ? `rgb(${accentRgb})` : colors.muted,
                    width: 22,
                    textAlign: 'center',
                  }}
                >
                  {item.icon}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 15.5,
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {lang === 'en' ? item.label : item.labelNp}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: colors.muted,
                      fontFamily: "'Outfit', sans-serif",
                      marginTop: 1,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: colors.muted,
                  background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  padding: '3px 9px',
                  borderRadius: 20,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.06em',
                }}
              >
                {item.tag}
              </span>
            </Link>
          ))}
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: '24px 28px',
            borderTop: `1px solid rgba(${accentRgb}, 0.12)`,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setLang(lang === 'en' ? 'np' : 'en')}
              style={{
                flex: 1,
                background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `1px solid rgba(${accentRgb}, 0.25)`,
                color: colors.text,
                padding: '11px',
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
                borderRadius: 10,
                letterSpacing: '0.06em',
                fontWeight: 600,
              }}
            >
              {lang === 'en' ? '🇳🇵 नेपाली' : '🇬🇧 English'}
            </button>

            <button
              onClick={() => setDark(!dark)}
              style={{
                width: 48,
                background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `1px solid rgba(${accentRgb}, 0.25)`,
                color: colors.text,
                fontSize: 16,
                cursor: 'pointer',
                borderRadius: 10,
              }}
            >
              {dark ? '☀️' : '🌙'}
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
              background: `linear-gradient(135deg, #00d4ff 0%, #00e5a0 100%)`,
              color: '#050810',
              padding: '14px',
              fontSize: 13.5,
              fontWeight: 800,
              fontFamily: "'Outfit', sans-serif",
              textDecoration: 'none',
              borderRadius: 12,
              boxShadow: `0 6px 28px rgba(0, 212, 255, 0.4)`,
              letterSpacing: '0.04em',
            }}
          >
            <span style={{ fontSize: 10 }}>◆</span>
            {t.navCta}
          </Link>
        </div>
      </div>

      {/* ─── ANIMATIONS & RESPONSIVE BREAKPOINTS ───────────────────────── */}
      <style>{`
        @keyframes logo-rotate {
          0%   { transform: rotate(0deg);   border-color: rgba(${accentRgb}, 0.7); }
          50%  { transform: rotate(180deg); border-color: rgba(${accentRgb}, 0.3); }
          100% { transform: rotate(360deg); border-color: rgba(${accentRgb}, 0.7); }
        }

        @keyframes logo-pulse {
          0%, 100% { transform: scale(1);   box-shadow: 0 0 14px rgba(${accentRgb}, 1); }
          50%      { transform: scale(1.25); box-shadow: 0 0 24px rgba(${accentRgb}, 1); }
        }

        @keyframes navDropdownEnter {
          0%   { opacity: 0; transform: translateY(-12px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .nav-item-link:hover {
          color: rgb(${accentRgb}) !important;
          background: rgba(${accentRgb}, 0.1) !important;
          border-color: rgba(${accentRgb}, 0.25) !important;
          transform: translateY(-2px);
        }

        .nav-item-link:hover .nav-icon-box {
          transform: scale(1.15) rotate(6deg);
          border-color: rgba(${accentRgb}, 0.5) !important;
          background: rgba(${accentRgb}, 0.22) !important;
        }

        .more-dropdown-item:hover {
          background: rgba(${accentRgb}, 0.1) !important;
          border-color: rgba(${accentRgb}, 0.25) !important;
          border-left: 3px solid rgb(${accentRgb}) !important;
          transform: translateX(4px);
        }

        .more-dropdown-item:hover div:first-child {
          transform: scale(1.1);
        }

        .ctrl-btn:hover {
          border-color: rgba(${accentRgb}, 0.5) !important;
          color: rgb(${accentRgb}) !important;
          background: rgba(${accentRgb}, 0.1) !important;
          transform: translateY(-1px);
        }

        .nav-cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 212, 255, 0.5) !important;
        }

        @media (max-width: 1180px) {
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
