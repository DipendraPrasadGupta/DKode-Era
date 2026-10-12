'use client';

import { useEffect, useRef, useState } from 'react';
import { ThemeColors } from '@/lib/styles';
import { Counters } from '@/lib/types';

interface HeroSectionProps {
  colors: ThemeColors;
  visitors: number;
  counters: Counters;
  t: any;
  scrollTo: (id: string) => void;
  setQuoteOpen: (open: boolean) => void;
}

// Token syntax colors (Material Palenight palette)
const TOKEN_COLORS: Record<string, string> = {
  keyword: '#c792ea',
  var:     '#82aaff',
  op:      '#89ddff',
  class:   '#ffcb6b',
  prop:    '#f78c6c',
  string:  '#c3e88d',
  number:  '#fd9353',
  punct:   '#89ddff',
  comment: '#546e7a',
};

type Token = { t: string; c: string };
type CodeLine = { indent: number; tokens: Token[] };

const CODE_LINES: CodeLine[] = [
  { indent: 0, tokens: [{ t: 'const', c: 'keyword' }, { t: ' agency', c: 'var' }, { t: ' = ', c: 'op' }, { t: 'new', c: 'keyword' }, { t: ' DKodeEra', c: 'class' }, { t: '();', c: 'punct' }] },
  { indent: 0, tokens: [] },
  { indent: 0, tokens: [{ t: 'agency', c: 'var' }, { t: '.build({', c: 'punct' }] },
  { indent: 1, tokens: [{ t: 'stack', c: 'prop' }, { t: ': [', c: 'punct' }, { t: "'Next.js'", c: 'string' }, { t: ', ', c: 'punct' }, { t: "'AI'", c: 'string' }, { t: ', ', c: 'punct' }, { t: "'IoT'", c: 'string' }, { t: '],', c: 'punct' }] },
  { indent: 1, tokens: [{ t: 'quality', c: 'prop' }, { t: ': ', c: 'punct' }, { t: "'premium'", c: 'string' }, { t: ',', c: 'punct' }] },
  { indent: 1, tokens: [{ t: 'delivery', c: 'prop' }, { t: ': ', c: 'punct' }, { t: "'on-time'", c: 'string' }, { t: ',', c: 'punct' }] },
  { indent: 1, tokens: [{ t: 'clients', c: 'prop' }, { t: ': ', c: 'punct' }, { t: '18', c: 'number' }, { t: ',  projects', c: 'punct' }, { t: ': ', c: 'punct' }, { t: '25', c: 'number' }, { t: ',', c: 'punct' }] },
  { indent: 0, tokens: [{ t: '});', c: 'punct' }] },
  { indent: 0, tokens: [] },
  { indent: 0, tokens: [{ t: '// Result: Success ', c: 'comment' }, { t: 'checkmark', c: 'comment' }] },
];

function CodeTerminal({ colors }: { colors: ThemeColors }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    let line = 0;
    const interval = setInterval(() => {
      if (line < CODE_LINES.length) {
        line++;
        setVisibleLines(line);
      } else {
        clearInterval(interval);
      }
    }, 220);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const blink = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <div
      style={{
        background: 'rgba(10,10,18,0.88)',
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        position: 'relative',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* Window chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderBottom: `1px solid ${colors.border}`,
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, opacity: 0.85 }} />
          ))}
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: colors.muted, letterSpacing: '0.05em' }}>
          agency.ts — D-Kode Era
        </div>
        <div
          style={{
            fontSize: 10,
            color: colors.green,
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
            padding: '2px 8px',
            borderRadius: 4,
            letterSpacing: '0.08em',
          }}
        >
          TS
        </div>
      </div>

      {/* Code area */}
      <div style={{ padding: '20px 0', minHeight: 260 }}>
        {CODE_LINES.slice(0, visibleLines).map((line, li) => (
          <div
            key={li}
            style={{
              display: 'flex',
              padding: '2px 20px',
              fontSize: 13,
              lineHeight: 1.7,
              animation: 'hsCodeLine 0.2s ease-out both',
            }}
          >
            <span style={{ minWidth: 28, color: 'rgba(255,255,255,0.15)', userSelect: 'none', fontSize: 11, paddingTop: 1 }}>
              {li + 1}
            </span>
            <span style={{ minWidth: line.indent * 20 }} />
            {line.tokens.map((tok, ti) => (
              <span key={ti} style={{ color: TOKEN_COLORS[tok.c] ?? '#e4e4e7' }}>
                {tok.t === 'checkmark' ? '✓' : tok.t}
              </span>
            ))}
            {li === visibleLines - 1 && visibleLines < CODE_LINES.length && (
              <span
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: 14,
                  background: colors.cyan,
                  marginLeft: 2,
                  marginTop: 2,
                  opacity: cursor ? 1 : 0,
                  transition: 'opacity 0.1s',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div
        style={{
          borderTop: `1px solid ${colors.border}`,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: 'rgba(6,182,212,0.04)',
        }}
      >
        <span style={{ fontSize: 10, color: colors.green, display: 'flex', alignItems: 'center', gap: 5, letterSpacing: '0.05em' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.green, display: 'inline-block', boxShadow: `0 0 6px ${colors.green}` }} />
          TypeScript
        </span>
        <span style={{ fontSize: 10, color: colors.muted, letterSpacing: '0.05em' }}>UTF-8</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: colors.cyan, letterSpacing: '0.05em' }}>
          Ln {visibleLines}, Col 1
        </span>
      </div>

      {/* Subtle top glow line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: 1,
          background: `linear-gradient(90deg, transparent, ${colors.cyan}, transparent)`,
          opacity: 0.4,
        }}
      />
    </div>
  );
}

function TechBadge({ label, icon, delay, colors }: { label: string; icon: string; delay: number; colors: ThemeColors }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        fontSize: 11,
        color: colors.muted,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.05em',
        animation: `fadeUp 0.6s ${delay}s both`,
        transition: 'border-color 0.25s, color 0.25s',
        cursor: 'default',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = colors.cyan;
        el.style.color = colors.cyan;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = colors.border;
        el.style.color = colors.muted;
      }}
    >
      <span style={{ fontSize: 13 }}>{icon}</span>
      {label}
    </div>
  );
}

export default function HeroSection({ colors, visitors, counters, t, scrollTo, setQuoteOpen }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handle = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    el.addEventListener('mousemove', handle);
    return () => el.removeEventListener('mousemove', handle);
  }, []);

  const STATS = [
    { val: counters.p, suffix: '+', label: t.stats[0], color: colors.cyan },
    { val: counters.c, suffix: '+', label: t.stats[1], color: colors.green },
    { val: counters.i, suffix: '+', label: t.stats[2], color: '#a78bfa' },
    { val: counters.s, suffix: '+', label: t.stats[3], color: colors.gold },
  ];

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="hero-section"
      style={{
        background: `linear-gradient(145deg, ${colors.bg} 0%, ${colors.bg2} 100%)`,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(100px, 12vh, 130px) clamp(20px, 5vw, 80px) 80px',
        position: 'relative',
        overflow: 'hidden',
        '--hero-border': colors.border,
        '--hero-cyan': colors.cyan,
        '--hero-green': colors.green,
      } as React.CSSProperties}
    >
      <div className="hero-grid" />

      {/* Mouse-parallax ambient blobs */}
      <div
        style={{
          position: 'absolute', width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 65%)',
          top: -200, right: -100, filter: 'blur(1px)', pointerEvents: 'none',
          transform: `translate(${(mousePos.x - 0.5) * -30}px, ${(mousePos.y - 0.5) * -20}px)`,
          transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1)',
        }}
      />
      <div
        style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 65%)',
          bottom: 0, left: -100, filter: 'blur(1px)', pointerEvents: 'none',
          transform: `translate(${(mousePos.x - 0.5) * 20}px, ${(mousePos.y - 0.5) * 15}px)`,
          transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1)',
        }}
      />

      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>

        {/* Two-column grid */}
        <div
          className="hs-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(40px, 6vw, 80px)',
            alignItems: 'center',
          }}
        >
          {/* ── LEFT ── */}
          <div>
            {/* Status pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, animation: 'fadeUp 0.5s 0.1s both', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                  padding: '5px 12px', borderRadius: 100,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  letterSpacing: '0.08em', color: colors.green,
                }}
              >
                <span
                  style={{
                    width: 6, height: 6, background: colors.green,
                    borderRadius: '50%', flexShrink: 0,
                    boxShadow: `0 0 6px ${colors.green}`,
                    animation: 'hsPulseGreen 2s infinite',
                  }}
                />
                {visitors} {t.visitorText}
              </div>
              <div
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.18)',
                  padding: '5px 12px', borderRadius: 100,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                  letterSpacing: '0.12em', color: colors.cyan, textTransform: 'uppercase',
                }}
              >
                <span style={{ fontSize: 8, opacity: 0.8 }}>▲</span>
                {t.badge}
              </div>
            </div>

            {/* Headline */}
            <h1
              className="hero-title"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(44px, 6.5vw, 88px)',
                fontWeight: 800,
                lineHeight: 1.0,
                letterSpacing: '-0.04em',
                marginBottom: 20,
              }}
            >
              {t.heroTitle1}
              <br />
              <span
                style={{
                  background: `linear-gradient(135deg, ${colors.cyan} 0%, #7c3aed 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t.heroTitle2}
              </span>
            </h1>

            {/* Subline with rule */}
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: colors.muted,
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20,
                animation: 'fadeUp 0.7s 0.3s both',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <span style={{ width: 32, height: 1, background: colors.cyan, display: 'inline-block', opacity: 0.6, flexShrink: 0 }} />
              {t.heroSub3}
            </p>

            {/* Description */}
            <p
              style={{
                fontSize: 16, color: colors.muted, maxWidth: 480, lineHeight: 1.85,
                marginBottom: 44, animation: 'fadeUp 0.7s 0.4s both', letterSpacing: '0.01em',
              }}
            >
              {t.heroDesc}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44, animation: 'fadeUp 0.7s 0.5s both' }}>
              <button
                onClick={() => scrollTo('contact')}
                style={{
                  background: colors.cyan, color: '#050810',
                  padding: '13px 28px',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 0 0 0 transparent',
                  transition: 'transform 0.2s, box-shadow 0.3s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(-2px)';
                  el.style.boxShadow = '0 8px 24px rgba(6,182,212,0.4)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = '';
                  el.style.boxShadow = '0 0 0 0 transparent';
                }}
              >
                <span style={{ fontSize: 14 }}>→</span>
                {t.heroCta1}
              </button>

              <button
                onClick={() => scrollTo('services')}
                style={{
                  background: 'transparent', color: colors.text,
                  padding: '13px 28px',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  border: `1px solid ${colors.border}`, borderRadius: 8, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  transition: 'border-color 0.2s, color 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = colors.cyan;
                  el.style.color = colors.cyan;
                  el.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = colors.border;
                  el.style.color = colors.text;
                  el.style.transform = '';
                }}
              >
                {t.heroCta2}
                <span style={{ fontSize: 14, opacity: 0.6 }}>↗</span>
              </button>

              <button
                onClick={() => setQuoteOpen(true)}
                style={{
                  background: 'transparent', color: colors.gold,
                  padding: '13px 28px',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = colors.gold;
                  el.style.background = 'rgba(245,158,11,0.06)';
                  el.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'rgba(245,158,11,0.3)';
                  el.style.background = 'transparent';
                  el.style.transform = '';
                }}
              >
                <span>✦</span>
                {t.quoteTitle}
              </button>
            </div>

            {/* Tech micro-badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', animation: 'fadeUp 0.7s 0.6s both' }}>
              {[
                { label: 'Next.js', icon: '▲', delay: 0.65 },
                { label: 'React Native', icon: '⚛', delay: 0.7 },
                { label: 'Python / AI', icon: '🤖', delay: 0.75 },
                { label: 'IoT', icon: '📡', delay: 0.8 },
              ].map(b => (
                <TechBadge key={b.label} label={b.label} icon={b.icon} delay={b.delay} colors={colors} />
              ))}
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div style={{ animation: 'fadeUp 0.8s 0.3s both', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <CodeTerminal colors={colors} />

            {/* Metrics mini-grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Avg. delivery', value: '2–4 wks', icon: '⚡', color: colors.cyan },
                { label: 'Client satisfaction', value: '100%', icon: '★', color: colors.green },
              ].map(m => (
                <div
                  key={m.label}
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    backdropFilter: 'blur(12px)',
                    transition: 'border-color 0.25s',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = m.color + '55')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = colors.border)}
                >
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{m.icon}</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: m.color, lineHeight: 1 }}>
                    {m.value}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: colors.muted, letterSpacing: '0.06em', marginTop: 4, textTransform: 'uppercase' }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── STATS RIBBON ── */}
        <div id="stats-section" style={{ marginTop: 56, animation: 'fadeUp 0.8s 0.7s both' }}>
          <div
            className="hs-stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1,
              background: colors.border,
              border: `1px solid ${colors.border}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {STATS.map((stat, idx) => (
              <div
                key={idx}
                style={{
                  padding: '24px 28px',
                  background: colors.bg2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'background 0.25s',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = colors.surface; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = colors.bg2; }}
              >
                {/* Accent stripe */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: stat.color, opacity: 0.65 }} />
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(26px,3vw,36px)', fontWeight: 800, lineHeight: 1, color: stat.color, letterSpacing: '-0.02em' }}>
                    {stat.val}{stat.suffix}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: colors.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 5 }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scoped animations */}
      <style>{`
        @keyframes hsPulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.7); }
          50%       { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
        }
        @keyframes hsCodeLine {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 900px) {
          .hs-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .hs-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 380px) {
          .hs-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
