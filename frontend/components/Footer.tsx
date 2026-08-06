'use client';

import Link from 'next/link';
import { ThemeColors } from '@/lib/styles';

interface FooterProps {
  colors: ThemeColors;
  t: any;
  scrollTo: (id: string) => void;
}

export default function Footer({ colors, t, scrollTo }: FooterProps) {
  const serviceLinks = [
    { label: 'Website Development', href: '/pages/services' },
    { label: 'Mobile Apps', href: '/pages/services' },
    { label: 'Management Systems', href: '/pages/services' },
    { label: 'Digital Marketing', href: '/pages/services' },
    { label: 'Branding & Design', href: '/pages/services' },
    { label: 'SaaS Products', href: '/pages/services' },
  ];

  const companyLinks = [
    { label: 'About Us', href: '/pages/about' },
    { label: 'Our Work', href: '/pages/work' },
    { label: 'Our Team', href: '/pages/team' },
    { label: 'Pricing', href: '/pages/pricing' },
    { label: 'Contact', href: '/pages/contact' },
  ];

  const contactInfo = [
    { label: 'Butwal-10, Rupandehi', href: 'https://maps.google.com' },
    { label: 'Lumbini Province, Nepal', href: null },
    { label: '+977-9807544395', href: 'tel:+9779807544395' },
    { label: 'info@dkodeera.com', href: 'mailto:info@dkodeera.com' },
    { label: 'Sun–Fri, 9AM–6PM', href: null },
  ];

  const socialLinks = [
    { icon: '📘', label: 'Facebook', href: '#' },
    { icon: '💼', label: 'LinkedIn', href: '#' },
    { icon: '📸', label: 'Instagram', href: '#' },
    { icon: '🐦', label: 'Twitter', href: '#' },
  ];

  return (
    <footer style={{
      background: colors.bg2,
      borderTop: `1px solid ${colors.border}`,
      padding: 'clamp(40px, 6vh, 64px) clamp(16px, 4vw, 60px) 40px',
      position: 'relative',
      zIndex: 1,
    }}>
      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: clamp(24px, 4vw, 60px);
          padding-bottom: 48px;
          border-bottom: 1px solid ${colors.border};
        }
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 540px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="footer-grid">
          {/* Brand Column */}
          <div>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 8, height: 8, background: colors.cyan, borderRadius: '50%',
                  boxShadow: `0 0 8px ${colors.cyan}`, animation: 'pulse 2s infinite',
                }}
              />
              <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: colors.text }}>
                D-Kode<span style={{ color: colors.cyan }}>Era</span>
              </span>
            </Link>
            <p style={{ fontSize: 13, color: colors.muted, maxWidth: 280, lineHeight: 1.8, marginBottom: 20 }}>
              {t.footerTagline}
            </p>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#2a3a50', marginBottom: 20 }}>
              PAN: XXXXXXXXX · Reg No: XXXXXXXXX
            </div>
            {/* Social links */}
            <div style={{ display: 'flex', gap: 8 }}>
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  style={{
                    width: 36, height: 36,
                    border: `1px solid ${colors.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, color: colors.muted, cursor: 'pointer',
                    transition: 'all 0.25s', textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = colors.cyan;
                    (e.currentTarget as HTMLElement).style.background = `${colors.cyan}10`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = colors.border;
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
              letterSpacing: '0.25em', color: colors.cyan,
              textTransform: 'uppercase', marginBottom: 20,
            }}>Services</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{ fontSize: 13, color: colors.muted, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = colors.cyan)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = colors.muted)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
              letterSpacing: '0.25em', color: colors.cyan,
              textTransform: 'uppercase', marginBottom: 20,
            }}>Company</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{ fontSize: 13, color: colors.muted, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = colors.cyan)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = colors.muted)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
              letterSpacing: '0.25em', color: colors.cyan,
              textTransform: 'uppercase', marginBottom: 20,
            }}>Contact</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {contactInfo.map((info) => (
                <li key={info.label}>
                  {info.href ? (
                    <a
                      href={info.href}
                      style={{ fontSize: 13, color: colors.muted, textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = colors.cyan)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = colors.muted)}
                    >
                      {info.label}
                    </a>
                  ) : (
                    <span style={{ fontSize: 13, color: colors.muted }}>{info.label}</span>
                  )}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 20 }}>
              <Link
                href="/pages/contact"
                style={{
                  display: 'inline-block', padding: '9px 18px',
                  border: `1px solid ${colors.cyan}`, color: colors.cyan,
                  fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
                  letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
                  transition: 'all 0.25s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = colors.cyan;
                  (e.currentTarget as HTMLElement).style.color = '#050810';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = colors.cyan;
                }}
              >
                Get Free Quote →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: 30, display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 16,
        }}>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#2a3a50' }}>
            © 2026 D-Kode Era Pvt. Ltd. · All Rights Reserved · Made with ❤️ in Butwal, Nepal
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'Privacy Policy', href: '#' },
              { label: 'Terms of Service', href: '#' },
              { label: 'Sitemap', href: '#' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
                  color: '#2a3a50', textDecoration: 'none', transition: 'color 0.2s',
                  letterSpacing: '0.08em',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = colors.muted)}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#2a3a50')}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
