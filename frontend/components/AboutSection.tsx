'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ThemeColors } from '@/lib/styles';
import { useSiteSettings } from '@/lib/useSiteSettings';

interface AboutSectionProps {
  colors: ThemeColors;
  t: any;
  scrollTo?: (id: string) => void;
  setQuoteOpen?: (open: boolean) => void;
}

export default function AboutSection({ colors, t, scrollTo, setQuoteOpen }: AboutSectionProps) {
  const { settings } = useSiteSettings();
  const isDark = colors.bg !== '#fafafa';

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const pillars = [
    {
      icon: '🏛️',
      title: 'Registered Pvt. Ltd.',
      tag: 'Legal Entity',
      sub: 'Official SLA & NDAs',
      accent: colors.cyan,
      bg: 'rgba(6, 182, 212, 0.12)',
    },
    {
      icon: '🇳🇵',
      title: 'Nepal-First Ecosystem',
      tag: 'FinTech Native',
      sub: 'eSewa · Khalti · ConnectIPS',
      accent: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.12)',
    },
    {
      icon: '⚡',
      title: 'Full-Stack Mastery',
      tag: 'Next-Gen Stack',
      sub: 'Next.js 15 · AI · Mobile',
      accent: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
    },
    {
      icon: '🤝',
      title: 'In-Person & VIP Support',
      tag: '24/7 Reachable',
      sub: 'Butwal HQ · Instant WhatsApp',
      accent: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
    },
  ];

  return (
    <>
      <section
        id="about"
        ref={sectionRef}
        style={{
          background: colors.bg,
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          scrollMarginTop: 96,
        }}
      >
        {/* Animated ambient background glows */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div
            className="about-ambient-blob-1"
            style={{
              position: 'absolute',
              width: 600,
              height: 600,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 65%)',
              top: '5%',
              left: '-10%',
              filter: 'blur(3px)',
            }}
          />
          <div
            className="about-ambient-blob-2"
            style={{
              position: 'absolute',
              width: 550,
              height: 550,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.07) 0%, transparent 65%)',
              bottom: '5%',
              right: '-8%',
              filter: 'blur(3px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, transparent 65%)',
              top: '40%',
              left: '45%',
              filter: 'blur(4px)',
            }}
          />
        </div>

        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: 'clamp(90px, 10vw, 130px) clamp(20px, 5vw, 80px)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div className="about-section-grid">
            {/* ── Left Column: Narrative, Badges & Actions ── */}
            <div
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Eyebrow Capsule */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '7px 16px 7px 12px',
                  borderRadius: 999,
                  background: isDark
                    ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)'
                    : 'linear-gradient(90deg, rgba(8, 145, 178, 0.1) 0%, rgba(139, 92, 246, 0.06) 100%)',
                  border: `1px solid ${isDark ? 'rgba(6, 182, 212, 0.28)' : 'rgba(8, 145, 178, 0.25)'}`,
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 20px -4px rgba(6, 182, 212, 0.2)',
                  marginBottom: 22,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {['#06b6d4', '#8b5cf6', '#10b981'].map((c, i) => (
                    <span
                      key={i}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: c,
                        boxShadow: `0 0 6px ${c}`,
                        animation: `aboutPulseDot 2s ${i * 0.3}s infinite ease-in-out`,
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    color: colors.cyan,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  {t.aboutEye || 'About Us'}
                </span>
                <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', fontSize: 11 }}>•</span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: isDark ? 'rgba(226, 232, 240, 0.75)' : '#64748b',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}
                >
                  Registered IT Company
                </span>
              </div>

              {/* Heading */}
              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 'clamp(34px, 4.5vw, 54px)',
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: '-0.035em',
                  background: isDark
                    ? `linear-gradient(135deg, ${colors.text} 0%, #38bdf8 55%, #a78bfa 100%)`
                    : `linear-gradient(135deg, ${colors.text} 0%, ${colors.cyan} 55%, #7c3aed 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: '0 0 18px 0',
                }}
              >
                {t.aboutTitle || 'Who We Are'}
              </h2>

              {/* Story Narrative */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                <div
                  style={{
                    width: 3,
                    height: 54,
                    borderRadius: 3,
                    background: 'linear-gradient(180deg, #06b6d4 0%, #8b5cf6 100%)',
                    flexShrink: 0,
                    marginTop: 3,
                    boxShadow: '0 0 10px rgba(6, 182, 212, 0.55)',
                  }}
                />
                <p
                  style={{
                    fontSize: 'clamp(15px, 1.15vw, 17px)',
                    color: isDark ? 'rgba(240, 246, 252, 0.94)' : '#1e293b',
                    lineHeight: 1.75,
                    margin: 0,
                    fontWeight: 450,
                  }}
                >
                  <strong>{settings.agency_name || 'D-Kode Era'} Pvt. Ltd.</strong> is a legally registered software engineering and digital innovation studio headquartered in <strong>{settings.agency_address || 'Butwal-10, Rupandehi, Nepal'}</strong>. We engineer bespoke platforms, web ecosystems, and AI integrations built for real scale.
                </p>
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: colors.muted,
                  lineHeight: 1.75,
                  marginBottom: 26,
                  paddingLeft: 17,
                }}
              >
                Unlike generic agencies that rely on foreign templates, our team crafts natively for Nepal's digital economy — seamlessly wiring eSewa, Khalti, ConnectIPS, and Sparrow SMS with high-performance Silicon-grade architectures.
              </p>

              {/* 2x2 Clean Feature Badges (No Descriptions) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 12,
                  marginBottom: 32,
                }}
                className="about-pillars-grid"
              >
                {pillars.map((item, i) => (
                  <div
                    key={i}
                    className="about-pillar-badge"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      padding: '12px 16px',
                      borderRadius: 14,
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.65) 0%, rgba(20, 24, 39, 0.45) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.85) 100%)',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                      backdropFilter: 'blur(16px)',
                      boxShadow: isDark
                        ? '0 6px 20px -6px rgba(0, 0, 0, 0.4)'
                        : '0 6px 16px -6px rgba(0, 0, 0, 0.06)',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'default',
                      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {/* Left vertical color accent */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: item.accent,
                        boxShadow: `0 0 10px ${item.accent}`,
                      }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 6, width: '100%' }}>
                      <span
                        className="about-pillar-icon"
                        style={{
                          fontSize: 18,
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: `${item.accent}16`,
                          border: `1px solid ${item.accent}35`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: `0 0 12px ${item.accent}18`,
                          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        {item.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: 'clamp(13px, 1.05vw, 15px)',
                            fontWeight: 700,
                            color: colors.text,
                            letterSpacing: '-0.015em',
                            lineHeight: 1.25,
                          }}
                        >
                          {item.title}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginTop: 3,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "'JetBrains Mono', monospace",
                              color: item.accent,
                              fontWeight: 600,
                              letterSpacing: '0.04em',
                            }}
                          >
                            {item.tag}
                          </span>
                          <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', fontSize: 9 }}>•</span>
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "'JetBrains Mono', monospace",
                              color: colors.muted,
                              letterSpacing: '0.02em',
                            }}
                          >
                            {item.sub}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions & Assurance Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  href="/pages/about"
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="about-cta-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '13px 28px',
                      background: colors.cyan,
                      color: '#050810',
                      borderRadius: 12,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      boxShadow: '0 8px 30px rgba(6, 182, 212, 0.35)',
                      transition: 'all 0.25s ease',
                      cursor: 'pointer',
                    }}
                  >
                    <span>Our Full Story</span>
                    <span className="about-cta-arrow">→</span>
                  </div>
                </Link>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    fontSize: 12,
                    color: colors.muted,
                    fontFamily: "'JetBrains Mono', monospace",
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#10b981', fontSize: 13, fontWeight: 700 }}>✓</span>
                    <span>30-Day Free Warranty</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#10b981', fontSize: 13, fontWeight: 700 }}>✓</span>
                    <span>100% Code Ownership</span>
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right Column: Executive Portrait Showcase ── */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 540,
                margin: '0 auto',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(36px) scale(0.97)',
                transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
              }}
            >
              {/* Radial aura behind image with animated breathing */}
              <div
                className="about-image-aura"
                style={{
                  position: 'absolute',
                  inset: -18,
                  background: 'radial-gradient(circle at 45% 40%, rgba(6, 182, 212, 0.26) 0%, rgba(139, 92, 246, 0.2) 48%, transparent 74%)',
                  borderRadius: 40,
                  filter: 'blur(30px)',
                  zIndex: 0,
                  pointerEvents: 'none',
                }}
              />

              {/* Framed Image Showcase */}
              <div
                className="about-image-card"
                style={{
                  position: 'relative',
                  borderRadius: 24,
                  overflow: 'hidden',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)'}`,
                  background: isDark ? '#0b1021' : '#f8fafc',
                  boxShadow: isDark
                    ? '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px -5px rgba(6, 182, 212, 0.2)'
                    : '0 25px 60px -15px rgba(0, 0, 0, 0.14), 0 0 35px -5px rgba(6, 182, 212, 0.12)',
                  zIndex: 1,
                }}
              >
                {/* Executive Founder Portrait */}
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img
                    src="/aboutdkodeera.png"
                    alt="D-Kode Era Founder & Leadership"
                    className="about-founder-img"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'cover',
                      transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                  {/* Subtle lower gradient shade */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: isDark
                        ? 'linear-gradient(180deg, rgba(11, 16, 33, 0) 55%, rgba(11, 16, 33, 0.88) 100%)'
                        : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 55%, rgba(255, 255, 255, 0.75) 100%)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>

                {/* Top-Right Badge: Active Status */}
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 999,
                    background: isDark ? 'rgba(11, 16, 33, 0.78)' : 'rgba(255, 255, 255, 0.92)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)'}`,
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <span
                    className="about-radar-dot"
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'inline-block',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      color: isDark ? '#f1f5f9' : '#0f172a',
                      letterSpacing: '0.04em',
                    }}
                  >
                    HQ · Butwal, Nepal
                  </span>
                </div>

                {/* Bottom Overlay Card */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 14,
                    left: 14,
                    right: 14,
                    padding: '16px 20px',
                    borderRadius: 18,
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(11, 16, 33, 0.8) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 17,
                        fontWeight: 800,
                        color: colors.text,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {settings.agency_name || 'D-Kode Era'} Pvt. Ltd.
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: colors.cyan,
                        fontFamily: "'JetBrains Mono', monospace",
                        marginTop: 2,
                        fontWeight: 600,
                      }}
                    >
                      Building The Future With Code
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: `${colors.cyan}16`,
                        color: colors.cyan,
                        border: `1px solid ${colors.cyan}33`,
                        fontWeight: 600,
                      }}
                    >
                      Est. {settings.agency_founded || '2026'}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: '#10b98116',
                        color: '#10b981',
                        border: '1px solid #10b98133',
                        fontWeight: 600,
                      }}
                    >
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Top-Left Stat Pill with Subtle Float Animation */}
              <div
                className="about-floating-stat"
                style={{
                  position: 'absolute',
                  top: -14,
                  left: -14,
                  padding: '10px 16px',
                  borderRadius: 14,
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(11, 16, 33, 0.88))'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.92))',
                  border: `1px solid ${colors.cyan}44`,
                  backdropFilter: 'blur(16px)',
                  boxShadow: `0 12px 28px -6px ${colors.cyan}25`,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 18 }}>🚀</span>
                <div>
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 15,
                      fontWeight: 800,
                      color: colors.text,
                      lineHeight: 1,
                    }}
                  >
                    25+ Projects
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: colors.muted,
                      fontFamily: "'JetBrains Mono', monospace",
                      marginTop: 2,
                    }}
                  >
                    Delivered In Nepal
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scoped CSS & Keyframe Animations */}
      <style>{`
        .about-section-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(0, 1.05fr);
          gap: 68px;
          align-items: center;
        }

        /* Ambient Blobs Drift Animation */
        @keyframes blobDrift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -20px) scale(1.05); }
        }
        @keyframes blobDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 25px) scale(1.06); }
        }
        .about-ambient-blob-1 { animation: blobDrift1 12s ease-in-out infinite; }
        .about-ambient-blob-2 { animation: blobDrift2 14s ease-in-out infinite; }

        /* Floating Pill Animation */
        @keyframes aboutFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        .about-floating-stat {
          animation: aboutFloat 4.5s ease-in-out infinite;
        }

        /* Image Aura Pulse */
        @keyframes aboutAuraPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.05); }
        }
        .about-image-aura {
          animation: aboutAuraPulse 6s ease-in-out infinite;
        }

        /* Radar dot ping */
        @keyframes radarPing {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .about-radar-dot {
          animation: radarPing 2.2s infinite;
        }

        /* Eyebrow dots pulse */
        @keyframes aboutPulseDot {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 1; }
        }

        /* Pillar Card Interactive Hover */
        .about-pillar-badge:hover {
          transform: translateY(-3px);
          border-color: rgba(6, 182, 212, 0.4) !important;
          box-shadow: 0 10px 28px -6px rgba(6, 182, 212, 0.22) !important;
        }
        .about-pillar-badge:hover .about-pillar-icon {
          transform: scale(1.12) rotate(4deg);
        }

        /* Image hover effect */
        .about-image-card:hover .about-founder-img {
          transform: scale(1.035) !important;
        }

        /* CTA Button Hover */
        .about-cta-btn:hover {
          box-shadow: 0 12px 36px rgba(6, 182, 212, 0.55) !important;
          transform: translateY(-2px);
        }
        .about-cta-btn:hover .about-cta-arrow {
          transform: translateX(4px);
        }
        .about-cta-arrow {
          display: inline-block;
          transition: transform 0.2s ease;
        }

        /* Responsive Breakpoints */
        @media (max-width: 960px) {
          .about-section-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
        @media (max-width: 600px) {
          .about-pillars-grid {
            grid-template-columns: 1fr !important;
          }
          .about-floating-stat {
            left: 8px !important;
            top: -12px !important;
          }
        }
      `}</style>
    </>
  );
}
