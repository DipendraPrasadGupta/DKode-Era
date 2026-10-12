'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeColors } from '@/lib/styles';
import { useSiteSettings } from '@/lib/useSiteSettings';
import { apiFetch } from '@/lib/api';

interface FooterProps {
  colors: ThemeColors;
  t: any;
  scrollTo: (id: string) => void;
}

// ── Crisp High-Fidelity Vector Icons ──
function SvgFacebook({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function SvgLinkedIn({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function SvgInstagram({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function SvgTwitterX({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function SvgGitHub({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function SvgWhatsApp({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.43 1.02 2.6.13.16 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3" />
    </svg>
  );
}

function SvgMapPin({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function SvgPhone({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function SvgMail({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function SvgClock({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SvgShield({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function SvgArrowUp({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

export default function Footer({ colors, t, scrollTo }: FooterProps) {
  const { settings: hookSettings } = useSiteSettings();
  const [liveSettings, setLiveSettings] = useState<Record<string, string>>({});
  const isDark = colors.bg !== '#fafafa';

  // Real-time backend fetch on mount
  useEffect(() => {
    apiFetch('/api/settings')
      .then((data) => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setLiveSettings(data);
        }
      })
      .catch((err) => console.warn('Footer live settings fetch error:', err));
  }, []);

  const settings = { ...hookSettings, ...liveSettings };

  // Real data from backend with accurate defaults
  const phone = settings.agency_phone || settings.whatsapp_number || '+977 9807544395';
  const phoneClean = (phone || '9779807544395').replace(/[^0-9]/g, '');
  const email = settings.agency_email || 'dkodeera2026@gmail.com';
  const address = settings.agency_address || 'Manigram, Butwal, Nepal';
  const businessHours = settings.business_hours || 'Sun–Fri 9:00 AM – 6:00 PM NST';
  const whatsappUrl = `https://wa.me/${phoneClean || '9779807544395'}?text=${encodeURIComponent(
    'Hello D-Kode Era team, I would like to inquire about your software and digital services.'
  )}`;

  const serviceLinks = [
    { label: 'Web Application Development', href: '/pages/services' },
    { label: 'Mobile App Engineering', href: '/pages/services' },
    { label: 'AI & Automation Systems', href: '/pages/services' },
    { label: 'Enterprise SaaS & ERP', href: '/pages/services' },
    { label: 'IoT & Smart Hardware Lab', href: '/pages/iot-projects' },
    { label: 'UI/UX & Product Design', href: '/pages/services' },
    { label: 'Cloud Architecture & DevOps', href: '/pages/services' },
  ];

  const companyLinks = [
    { label: 'About D-Kode Era', href: '/pages/about' },
    { label: 'IoT Innovation Lab', href: '/pages/iot-projects' },
    { label: 'Client Case Studies & Work', href: '/pages/work' },
    { label: 'Our Engineering Team', href: '/pages/team' },
    { label: 'Interactive Cost Estimator', href: '/pages/estimate' },
    { label: 'Track Order & Portal', href: '/pages/track-order' },
    { label: 'Contact & Consultation', href: '/pages/contact' },
  ];

  const socialLinks = [
    {
      icon: <SvgFacebook size={18} />,
      label: 'Facebook',
      href: settings.social_facebook || 'https://facebook.com/dkodeera',
      hoverColor: '#1877f2',
    },
    {
      icon: <SvgLinkedIn size={18} />,
      label: 'LinkedIn',
      href: settings.social_linkedin || 'https://linkedin.com/company/d-kode-era',
      hoverColor: '#0a66c2',
    },
    {
      icon: <SvgInstagram size={18} />,
      label: 'Instagram',
      href: settings.social_instagram || 'https://instagram.com/d_kode_era',
      hoverColor: '#e1306c',
    },
    {
      icon: <SvgTwitterX size={17} />,
      label: 'Twitter / X',
      href: settings.social_twitter || 'https://twitter.com/dkodeera',
      hoverColor: '#38bdf8',
    },
    {
      icon: <SvgGitHub size={18} />,
      label: 'GitHub',
      href: settings.social_github || 'https://github.com/d-kode-era',
      hoverColor: '#a78bfa',
    },
    {
      icon: <SvgWhatsApp size={18} />,
      label: 'WhatsApp',
      href: whatsappUrl,
      hoverColor: '#10b981',
    },
  ];

  return (
    <footer
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #070b14 0%, #030710 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)',
        borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <style>{`
        /* ── Modern Premium Footer Styles & Micro-Animations ── */
        .footer-ambient-radial {
          position: absolute;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: 0.12;
        }

        .footer-cta-card {
          position: relative;
          border-radius: 20px;
          padding: clamp(24px, 4vw, 36px);
          background: ${
            isDark
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(24, 30, 52, 0.5) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 245, 249, 0.9) 100%)'
          };
          border: 1px solid ${isDark ? 'rgba(6, 182, 212, 0.22)' : 'rgba(6, 182, 212, 0.3)'};
          box-shadow: ${
            isDark
              ? '0 20px 50px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
              : '0 20px 40px -10px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          };
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          margin-bottom: clamp(48px, 6vw, 64px);
        }

        .footer-cta-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: radial-gradient(circle at 10% 50%, rgba(6, 182, 212, 0.12), transparent 40%);
          pointer-events: none;
        }

        .footer-grid-layout {
          display: grid;
          grid-template-columns: 2fr 1.35fr 1.25fr 1.6fr;
          gap: clamp(28px, 4vw, 52px);
          padding-bottom: 48px;
        }

        @media (max-width: 1100px) {
          .footer-grid-layout {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 680px) {
          .footer-grid-layout {
            grid-template-columns: 1fr;
            gap: 36px;
          }
        }

        .footer-nav-link {
          display: flex;
          align-items: baseline;
          gap: 8px;
          color: ${isDark ? '#94a3b8' : '#64748b'};
          text-decoration: none;
          font-size: 13.5px;
          font-family: 'Outfit', sans-serif;
          font-weight: 450;
          line-height: 1.5;
          transition: all 0.22s ease;
          position: relative;
        }

        .footer-nav-link:hover {
          color: ${colors.cyan};
          transform: translateX(4px);
        }

        .footer-nav-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 7px;
          border-radius: 999px;
          background: ${isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.08)'};
          color: ${colors.cyan};
          border: 1px solid ${isDark ? 'rgba(6, 182, 212, 0.22)' : 'rgba(6, 182, 212, 0.2)'};
        }

        .footer-social-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: ${isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'};
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: ${isDark ? '#cbd5e1' : '#475569'};
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          flex-shrink: 0;
        }

        .footer-social-btn:hover {
          transform: translateY(-3px);
          border-color: var(--hover-color, ${colors.cyan});
          color: var(--hover-color, ${colors.cyan});
          background: ${isDark ? 'rgba(6, 182, 212, 0.12)' : 'rgba(6, 182, 212, 0.08)'};
          box-shadow: 0 8px 20px -4px rgba(6, 182, 212, 0.35);
        }

        .footer-contact-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          background: ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'};
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .footer-contact-row:hover {
          background: ${isDark ? 'rgba(6, 182, 212, 0.08)' : 'rgba(6, 182, 212, 0.06)'};
          border-color: ${isDark ? 'rgba(6, 182, 212, 0.25)' : 'rgba(6, 182, 212, 0.25)'};
          transform: translateX(3px);
        }

        .footer-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #050810;
          background: linear-gradient(135deg, #00d4ff 0%, #00e5a0 100%);
          box-shadow: 0 8px 24px -4px rgba(0, 212, 255, 0.4);
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
          cursor: pointer;
        }

        .footer-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -4px rgba(0, 212, 255, 0.6);
        }

        .footer-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: ${isDark ? '#e2e8f0' : '#1e293b'};
          background: ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'};
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'};
          text-decoration: none;
          transition: all 0.25s ease;
          cursor: pointer;
        }

        .footer-btn-secondary:hover {
          background: ${isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)'};
          border-color: #10b981;
          color: #10b981;
        }

        @keyframes footerRadarPulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 0.3; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }

        .footer-pulse-dot {
          animation: footerRadarPulse 2.4s infinite ease-in-out;
        }
      `}</style>

      {/* Ambient background glows */}
      <div
        className="footer-ambient-radial"
        style={{
          top: -200,
          left: -150,
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.45) 0%, transparent 70%)',
        }}
      />
      <div
        className="footer-ambient-radial"
        style={{
          bottom: -200,
          right: -150,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)',
        }}
      />

      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(48px, 6vw, 72px) clamp(20px, 4vw, 60px) 36px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* ── Top Section: High-Conversion Pre-Footer Call to Action ── */}
        <div className="footer-cta-card">
          <div style={{ maxWidth: 580 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 12px',
                borderRadius: 999,
                background: isDark ? 'rgba(6, 182, 212, 0.12)' : 'rgba(6, 182, 212, 0.08)',
                border: `1px solid ${isDark ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.25)'}`,
                marginBottom: 12,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.cyan,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                Start A Project
              </span>
            </div>
            <h3
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(22px, 2.5vw, 32px)',
                fontWeight: 800,
                color: colors.text,
                lineHeight: 1.25,
                margin: '0 0 8px 0',
                letterSpacing: '-0.025em',
              }}
            >
              Ready to engineer your next digital breakthrough?
            </h3>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 14,
                color: colors.muted,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Consult directly with our software architects in Butwal. Free architectural scope and pricing within 24 hours.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('contact');
              }}
              className="footer-btn-primary"
            >
              Schedule Consultation
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-btn-secondary"
            >
              <SvgWhatsApp size={16} />
              WhatsApp Fast Track
            </a>
          </div>
        </div>

        {/* ── Main Footer Grid ── */}
        <div className="footer-grid-layout" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}` }}>
          {/* Column 1: Brand & Credibility */}
          <div>
            {/* BRAND LOGO — PRESERVED EXACTLY AS REQUIRED */}
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <img
                src="/logo.png"
                alt="D-Kode Era Logo"
                style={{
                  height: 38,
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 10px rgba(0,212,255,0.35))',
                }}
              />
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 23,
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
                    background: 'linear-gradient(135deg, #00d4ff 0%, #00e5a0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 24px rgba(0, 212, 255, 0.3)',
                  }}
                >
                  Era
                </span>
              </span>
            </Link>

            <p
              style={{
                fontSize: 13.5,
                color: colors.muted,
                lineHeight: 1.75,
                marginBottom: 20,
                maxWidth: 340,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {t.footerTagline || "Nepal's Premier Software & IT Company. Engineering high-conversion web apps, native mobile solutions, and enterprise SaaS."}
            </p>

            {/* Legal Status & Studio Availability */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)'}`,
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: isDark ? '#94a3b8' : '#64748b',
                  width: 'fit-content',
                }}
              >
                <SvgShield size={13} color={colors.cyan} />
                <span>Registered Pvt. Ltd. · Nepal</span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#10b981',
                  width: 'fit-content',
                }}
              >
                <span
                  className="footer-pulse-dot"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                    display: 'inline-block',
                  }}
                />
                <span>Active Inquiries Queue · NST</span>
              </div>
            </div>

            {/* Social Media Strip with Real Crisp SVG Icons */}
            <div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10.5,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: colors.muted,
                  marginBottom: 10,
                  fontWeight: 600,
                }}
              >
                Connect With Us
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className="footer-social-btn"
                    style={{ '--hover-color': s.hoverColor } as any}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Engineering Solutions */}
          <div>
            <h4
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.2em',
                color: colors.cyan,
                textTransform: 'uppercase',
                marginBottom: 20,
                fontWeight: 700,
              }}
            >
              Solutions
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="footer-nav-link">
                    <span style={{ color: colors.cyan, fontSize: 11, opacity: 0.7, flexShrink: 0 }}>›</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company & Ecosystem */}
          <div>
            <h4
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.2em',
                color: colors.cyan,
                textTransform: 'uppercase',
                marginBottom: 20,
                fontWeight: 700,
              }}
            >
              Ecosystem
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="footer-nav-link">
                    <span style={{ color: colors.cyan, fontSize: 10, opacity: 0.6 }}>›</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Direct Headquarters & Real Backend Data */}
          <div>
            <h4
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.2em',
                color: colors.cyan,
                textTransform: 'uppercase',
                marginBottom: 20,
                fontWeight: 700,
              }}
            >
              Headquarters
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Address */}
              <a
                href="https://maps.google.com/?q=Manigram+Butwal+Nepal"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-row"
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(6, 182, 212, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.cyan,
                    flexShrink: 0,
                  }}
                >
                  <SvgMapPin size={16} />
                </div>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Location
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 550, color: colors.text, marginTop: 1 }}>
                    {address}
                  </div>
                </div>
              </a>

              {/* Phone / Call */}
              <a
                href={`tel:${phoneClean}`}
                className="footer-contact-row"
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                    flexShrink: 0,
                  }}
                >
                  <SvgPhone size={15} />
                </div>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Hotline & WhatsApp
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginTop: 1, fontFamily: "'JetBrains Mono', monospace" }}>
                    {phone}
                  </div>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${email}`}
                className="footer-contact-row"
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(139, 92, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#a78bfa',
                    flexShrink: 0,
                  }}
                >
                  <SvgMail size={15} />
                </div>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Corporate Email
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 550, color: colors.text, marginTop: 1 }}>
                    {email}
                  </div>
                </div>
              </a>

              {/* Business Hours */}
              <div className="footer-contact-row" style={{ cursor: 'default' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(234, 179, 8, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#eab308',
                    flexShrink: 0,
                  }}
                >
                  <SvgClock size={15} />
                </div>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Engineering Hours
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: colors.text, marginTop: 1 }}>
                    {businessHours}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar: Copyright, Legal & Back to Top ── */}
        <div
          style={{
            paddingTop: 32,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11.5,
                color: isDark ? '#64748b' : '#94a3b8',
                margin: 0,
              }}
            >
              © 2026 D-Kode Era Pvt. Ltd. · All Rights Reserved.
            </p>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12,
                color: isDark ? '#475569' : '#94a3b8',
                margin: 0,
              }}
            >
              Engineered with precision in Butwal, Nepal 🇳🇵
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Privacy Policy', href: '/pages/about' },
                { label: 'Terms of Service', href: '/pages/about' },
                { label: 'Security', href: '/pages/about' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: isDark ? '#64748b' : '#94a3b8',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    letterSpacing: '0.04em',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = colors.cyan)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = isDark ? '#64748b' : '#94a3b8')}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
