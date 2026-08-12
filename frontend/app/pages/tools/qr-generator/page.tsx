'use client';

import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';
import QrCodeStudio from '@/components/QrCodeStudio';

const tips = [
  { icon: '🔗', title: 'Any link works', desc: 'Websites, portfolios, app store links, payment pages, or social profiles.' },
  { icon: '🎨', title: 'Brand-ready output', desc: 'Match your colours, add a logo, and download crisp PNG or SVG files.' },
  { icon: '📱', title: 'Print & digital', desc: 'High error correction (Level H) keeps codes scannable even with a centre logo.' },
];

export default function QrGeneratorPage() {
  const cardStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
    border: `1px solid ${tk.border}`,
    borderRadius: 16,
    padding: '22px 20px',
  };

  return (
    <div style={{ background: tk.bg, color: tk.text, minHeight: '100vh', fontFamily: tk.fontBody }}>
      {/* Hero */}
      <section
        style={{
          background: `radial-gradient(ellipse 900px 600px at 20% 20%, rgba(0,212,255,0.12), transparent 60%),
                       radial-gradient(ellipse 700px 500px at 85% 30%, rgba(0,229,160,0.1), transparent 60%),
                       ${tk.bg}`,
          padding: '48px 20px 56px',
          borderBottom: `1px solid ${tk.border}`,
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link
            href="/pages/tools"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontFamily: tk.fontMono,
              color: tk.textDim,
              textDecoration: 'none',
              marginBottom: 28,
              letterSpacing: '0.05em',
            }}
          >
            ← Back to Tools
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 420px', maxWidth: 640 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(0,212,255,0.1)',
                  border: '1px solid rgba(0,212,255,0.3)',
                  borderRadius: 20,
                  padding: '6px 14px',
                  color: tk.cyan,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 20,
                }}
              >
                📱 Free · Marketing Tool
              </div>
              <h1
                style={{
                  fontFamily: tk.fontDisplay,
                  fontSize: 'clamp(32px, 5vw, 52px)',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  marginBottom: 16,
                  letterSpacing: '-0.03em',
                }}
              >
                QR Code{' '}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${tk.cyan}, ${tk.green})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Generator
                </span>
              </h1>
              <p style={{ fontSize: 16, color: tk.textDim, lineHeight: 1.75, margin: 0 }}>
                Clean, Canva-style controls to create a polished QR code for your link — patterns, colours,
                corners, and social logos included. Updates live as you customize.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Studio */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px 64px' }}>
        <QrCodeStudio />
      </section>

      {/* Tips */}
      <section style={{ background: tk.bgAlt, borderTop: `1px solid ${tk.border}`, padding: '56px 20px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, margin: 0 }}>
              Built for real-world use
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {tips.map(t => (
              <div key={t.title} style={cardStyle}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{t.icon}</div>
                <div style={{ fontFamily: tk.fontDisplay, fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{t.title}</div>
                <p style={{ fontSize: 13, color: tk.textDim, lineHeight: 1.65, margin: 0 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
