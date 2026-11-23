'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';
import { toolsList, toolCategories, type ToolItem } from '@/lib/toolsData';

// ─── Category Meta (icon + accent) ──────────────────────────────────────────
const categoryMeta: Record<string, { icon: string; accent: string }> = {
  All:          { icon: '⚡', accent: tk.cyan },
  Business:     { icon: '💼', accent: tk.gold },
  Marketing:    { icon: '📣', accent: tk.red },
  Performance:  { icon: '🚀', accent: tk.purple },
  Productivity: { icon: '⚙️',  accent: tk.cyan },
  'UI/UX':      { icon: '🎨', accent: '#ff79c6' },
  SEO:          { icon: '🔍', accent: tk.green },
  Utility:      { icon: '🛠️',  accent: tk.purple },
};

// ─── Stat Ticker ─────────────────────────────────────────────────────────────
const STATS = [
  { value: '12+', label: 'Free Tools' },
  { value: '100%', label: 'In-Browser' },
  { value: '0', label: 'Sign-up needed' },
  { value: '∞', label: 'Free forever' },
];

// ─── Single Tool Card ─────────────────────────────────────────────────────────
function ToolCard({ tool }: { tool: ToolItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: hovered
          ? `linear-gradient(145deg, rgba(13,20,37,0.98), rgba(13,20,37,0.92))`
          : `linear-gradient(145deg, rgba(13,20,37,0.8), rgba(8,13,26,0.7))`,
        border: `1px solid ${hovered ? `${tool.color}60` : 'rgba(99,179,237,0.1)'}`,
        borderRadius: 20,
        padding: '28px 26px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backdropFilter: 'blur(20px)',
        boxShadow: hovered
          ? `0 20px 60px -10px rgba(0,0,0,0.6), 0 0 40px ${tool.color}18, inset 0 1px 0 rgba(255,255,255,0.05)`
          : '0 4px 20px -4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: tool.available ? 'pointer' : 'default',
        overflow: 'hidden',
        minHeight: 260,
      }}
    >
      {/* Top glow accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: 2,
          background: hovered
            ? `linear-gradient(90deg, transparent, ${tool.color}, transparent)`
            : 'transparent',
          transition: 'all 0.3s ease',
          borderRadius: '20px 20px 0 0',
        }}
      />

      {/* Ambient corner glow */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            top: -40, right: -40, width: 160, height: 160,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${tool.color}14, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: 14,
              background: hovered ? `${tool.color}18` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${hovered ? `${tool.color}50` : 'rgba(255,255,255,0.08)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26,
              boxShadow: hovered ? `0 0 20px ${tool.color}25` : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {tool.icon}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <span
              style={{
                fontSize: 10, fontFamily: tk.fontMono,
                padding: '3px 10px', borderRadius: 20,
                background: tool.available ? `${tool.color}14` : 'rgba(255,255,255,0.05)',
                color: tool.available ? tool.color : tk.textDim,
                border: `1px solid ${tool.available ? `${tool.color}35` : 'rgba(255,255,255,0.08)'}`,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                whiteSpace: 'nowrap' as const,
              }}
            >
              {tool.available ? tool.badge : '🔒 Coming Soon'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: tk.fontDisplay,
            fontSize: 18, fontWeight: 800,
            color: hovered ? '#ffffff' : tk.text,
            marginBottom: 10, lineHeight: 1.3,
            letterSpacing: '-0.01em',
            transition: 'color 0.2s',
          }}
        >
          {tool.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: 13.5, color: hovered ? tk.textDim : '#6a7a90',
            lineHeight: 1.7, marginBottom: 24,
            transition: 'color 0.2s',
          }}
        >
          {tool.desc}
        </p>
      </div>

      {/* CTA */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {tool.available ? (
          <Link
            href={tool.href}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 10,
              background: hovered ? `${tool.color}18` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${hovered ? `${tool.color}50` : 'rgba(255,255,255,0.08)'}`,
              color: hovered ? tool.color : tk.textDim,
              textDecoration: 'none',
              fontSize: 11.5, fontFamily: tk.fontMono, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase' as const,
              transition: 'all 0.25s ease',
              boxShadow: hovered ? `0 4px 16px ${tool.color}20` : 'none',
            }}
          >
            <span>Launch Tool</span>
            <span style={{ transition: 'transform 0.25s', transform: hovered ? 'translateX(3px)' : 'translateX(0)' }}>→</span>
          </Link>
        ) : (
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 10,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#3a4a5a',
              fontSize: 11.5, fontFamily: tk.fontMono, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            }}
          >
            Coming Soon
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Animated Count Badge ─────────────────────────────────────────────────────
function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        padding: '14px 24px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(99,179,237,0.1)',
        borderRadius: 14,
        backdropFilter: 'blur(10px)',
      }}
    >
      <span style={{ fontFamily: tk.fontDisplay, fontSize: 24, fontWeight: 900, color: tk.cyan, letterSpacing: '-0.02em' }}>
        {value}
      </span>
      <span style={{ fontFamily: tk.fontMono, fontSize: 10, color: tk.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredTools = toolsList.filter((t) => {
    const matchesTab = activeTab === 'All' || t.category === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const availableCount = filteredTools.filter((t) => t.available).length;

  // Scroll grid into view on tab change
  useEffect(() => {
    if (gridRef.current && activeTab !== 'All') {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  const catMeta = categoryMeta[activeTab] || categoryMeta['All'];

  return (
    <div
      style={{
        background: tk.bg,
        color: tk.text,
        minHeight: '100vh',
        fontFamily: tk.fontBody,
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* ── Global Ambient Background ── */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `
            radial-gradient(ellipse 1200px 800px at 15% 0%, rgba(0,212,255,0.07), transparent 60%),
            radial-gradient(ellipse 1000px 900px at 85% 20%, rgba(168,85,247,0.06), transparent 60%),
            radial-gradient(ellipse 900px 700px at 50% 100%, rgba(0,229,160,0.04), transparent 55%)
          `,
        }}
      />

      {/* ── Grid pattern ── */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          mask: 'radial-gradient(ellipse 100% 100% at 50% 50%, black 30%, transparent 100%)',
        }}
      />

      {/* ═══════════════════════════════════════════
              HERO SECTION
      ═══════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative', zIndex: 1,
          padding: 'clamp(100px, 14vw, 160px) 20px clamp(60px, 8vw, 100px)',
          textAlign: 'center',
          borderBottom: '1px solid rgba(99,179,237,0.08)',
        }}
      >
        {/* Floating eyebrow pill */}
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '8px 20px', borderRadius: 50,
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.22)',
            marginBottom: 28,
            animation: 'heroFloat 3s ease-in-out infinite',
          }}
        >
          <span style={{ fontSize: 14 }}>🛠️</span>
          <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.cyan, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Free Digital &amp; Developer Suite
          </span>
          <span style={{ fontSize: 9, fontFamily: tk.fontMono, color: 'rgba(0,212,255,0.5)', padding: '2px 7px', borderRadius: 10, background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.2)' }}>
            v2.0
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: tk.fontDisplay,
            fontSize: 'clamp(36px, 6.5vw, 76px)',
            fontWeight: 900, lineHeight: 1.08,
            letterSpacing: '-0.03em',
            marginBottom: 22,
            color: '#ffffff',
          }}
        >
          Free Online Tools Built for{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${tk.cyan} 0%, ${tk.purple} 55%, #ff79c6 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Creators &amp; Builders
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: tk.textDim,
            lineHeight: 1.8, maxWidth: 640, margin: '0 auto 44px',
          }}
        >
          A growing suite of privacy-first, zero-install tools — conversions, generators, estimators, and AI utilities — all free, all in-browser.
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {STATS.map((s) => (
            <StatBadge key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
              TOOLS SECTION
      ═══════════════════════════════════════════ */}
      <section
        style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px) clamp(60px, 8vw, 120px)' }}
        ref={gridRef}
      >
        {/* Search + Filter Row */}
        <div
          style={{
            display: 'flex', gap: 16, flexWrap: 'wrap',
            alignItems: 'center', marginBottom: 36,
          }}
        >
          {/* Search box */}
          <div
            style={{
              flex: '1 1 240px', position: 'relative', maxWidth: 320,
            }}
          >
            <span
              style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                fontSize: 14, opacity: 0.5, pointerEvents: 'none',
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search tools…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(99,179,237,0.14)',
                color: tk.text,
                fontSize: 13.5,
                fontFamily: tk.fontMono,
                outline: 'none',
                boxSizing: 'border-box' as const,
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(99,179,237,0.14)'; }}
            />
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: '1 1 auto' }}>
            {toolCategories.map((cat) => {
              const meta = categoryMeta[cat] || { icon: '📦', accent: tk.cyan };
              const active = activeTab === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 24,
                    background: active ? `${meta.accent}20` : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${active ? `${meta.accent}70` : 'rgba(99,179,237,0.1)'}`,
                    color: active ? meta.accent : tk.textDim,
                    fontSize: 11.5, fontFamily: tk.fontMono, fontWeight: active ? 800 : 500,
                    cursor: 'pointer', letterSpacing: '0.06em',
                    transform: active ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: active ? `0 0 16px ${meta.accent}22` : 'none',
                    transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                    whiteSpace: 'nowrap' as const,
                  }}
                >
                  <span style={{ fontSize: 13 }}>{meta.icon}</span>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result count label */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28,
            paddingBottom: 20, borderBottom: '1px solid rgba(99,179,237,0.08)',
          }}
        >
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 13.5, fontFamily: tk.fontDisplay, fontWeight: 700, color: tk.text,
            }}
          >
            <span style={{ fontSize: 18 }}>{catMeta.icon}</span>
            {activeTab === 'All' ? 'All Tools' : activeTab}
          </span>
          <span
            style={{
              padding: '2px 10px', borderRadius: 20,
              background: `${catMeta.accent}15`,
              border: `1px solid ${catMeta.accent}35`,
              color: catMeta.accent,
              fontSize: 11, fontFamily: tk.fontMono, fontWeight: 700,
            }}
          >
            {availableCount} live · {filteredTools.length} total
          </span>
          {searchQuery && (
            <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.textDim }}>
              Showing results for &ldquo;<strong style={{ color: tk.cyan }}>{searchQuery}</strong>&rdquo;
            </span>
          )}
        </div>

        {/* Tools grid */}
        {filteredTools.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: 20,
            }}
          >
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center', padding: '80px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            }}
          >
            <span style={{ fontSize: 56 }}>🔭</span>
            <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 22, fontWeight: 800, color: tk.text }}>
              No tools found
            </h3>
            <p style={{ fontSize: 14, color: tk.textDim, maxWidth: 360 }}>
              Try a different search term or browse all categories.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveTab('All'); }}
              style={{
                padding: '10px 24px', borderRadius: 12,
                background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.4)',
                color: tk.cyan, cursor: 'pointer', fontSize: 13, fontFamily: tk.fontMono, fontWeight: 700,
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Bottom CTA banner */}
        <div
          style={{
            marginTop: 72, position: 'relative',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.07), rgba(168,85,247,0.07))',
            border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: 24, padding: 'clamp(32px, 5vw, 52px) clamp(24px, 5vw, 60px)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
            textAlign: 'center',
          }}
        >
          <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.1), transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>💡</div>
            <h3
              style={{
                fontFamily: tk.fontDisplay, fontSize: 'clamp(20px, 3vw, 28px)',
                fontWeight: 900, color: '#ffffff', marginBottom: 12, letterSpacing: '-0.02em',
              }}
            >
              Have a tool idea?
            </h3>
            <p style={{ fontSize: 15, color: tk.textDim, maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7 }}>
              We build tools based on community demand. If there&apos;s a utility you need, suggest it and we might build it for free.
            </p>
            <Link
              href="/pages/contact"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '13px 30px', borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(168,85,247,0.25))',
                border: '1px solid rgba(0,212,255,0.4)',
                color: '#ffffff', textDecoration: 'none',
                fontSize: 13, fontFamily: tk.fontDisplay, fontWeight: 800,
                letterSpacing: '0.02em',
                boxShadow: '0 8px 30px rgba(0,212,255,0.2)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>✉️</span>
              <span>Suggest a Tool</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CSS Keyframes ─── */}
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        input::placeholder { color: rgba(122, 138, 160, 0.6); }
        * { box-sizing: border-box; }
        @media (max-width: 600px) {
          input[type="text"] { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
