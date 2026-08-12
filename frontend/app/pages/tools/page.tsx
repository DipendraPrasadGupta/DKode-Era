'use client';

import { useState } from 'react';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';
import { toolsList, toolCategories } from '@/lib/toolsData';

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState('All');

  const filteredTools = activeTab === 'All'
    ? toolsList
    : toolsList.filter(t => t.category === activeTab);

  return (
    <div style={{ background: tk.bg || '#050810', color: tk.text, minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
      {/* Hero */}
      <section
        style={{
          background: `radial-gradient(ellipse 900px 600px at 20% 20%, rgba(0,212,255,0.12), transparent 60%),
                       radial-gradient(ellipse 800px 700px at 80% 40%, rgba(168,85,247,0.1), transparent 60%),
                       ${tk.bg || '#050810'}`,
          padding: '120px 20px 60px',
          textAlign: 'center',
          position: 'relative',
          borderBottom: `1px solid ${tk.border}`,
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.25)',
              borderRadius: 20,
              padding: '6px 16px',
              color: tk.cyan,
              fontSize: 11,
              fontFamily: tk.fontMono,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            🛠️ Free Digital & Developer Suite
          </div>
          <h1
            style={{
              fontFamily: tk.fontDisplay,
              fontSize: 'clamp(36px, 6vw, 64px)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: 20,
              letterSpacing: '-0.03em',
            }}
          >
            Free Online Tools Built for{' '}
            <span
              style={{
                background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Creators & Businesses
            </span>
          </h1>
          <p style={{ fontSize: 17, color: tk.textDim, lineHeight: 1.8, maxWidth: 620, margin: '0 auto' }}>
            Empower your workflow with our suite of free online utilities, AI generators, and budget estimators.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px 100px' }}>
        {/* Category Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
          {toolCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              style={{
                background: activeTab === cat ? tk.cyan : 'rgba(255,255,255,0.03)',
                color: activeTab === cat ? '#050810' : tk.textDim,
                border: `1px solid ${activeTab === cat ? tk.cyan : tk.border}`,
                padding: '8px 18px',
                borderRadius: 20,
                fontSize: 12,
                fontFamily: tk.fontMono,
                fontWeight: activeTab === cat ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              style={{
                background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                border: `1px solid ${tk.border}`,
                borderRadius: 16,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.35s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${tk.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                    }}
                  >
                    {tool.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: tk.fontMono,
                      padding: '3px 10px',
                      borderRadius: 12,
                      background: `${tool.color}15`,
                      color: tool.color,
                      border: `1px solid ${tool.color}35`,
                      fontWeight: 600,
                    }}
                  >
                    {tool.available ? tool.badge : 'Coming Soon'}
                  </span>
                </div>

                <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 20, fontWeight: 700, marginBottom: 10, color: tk.text }}>
                  {tool.title}
                </h3>
                <p style={{ fontSize: 14, color: tk.textDim, lineHeight: 1.7, marginBottom: 24 }}>
                  {tool.desc}
                </p>
              </div>

              {tool.available ? (
                <Link
                  href={tool.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    fontFamily: tk.fontMono,
                    fontWeight: 600,
                    color: tool.color,
                    textDecoration: 'none',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Launch Tool →
                </Link>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    fontFamily: tk.fontMono,
                    fontWeight: 600,
                    color: tk.textDim,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    opacity: 0.6,
                  }}
                >
                  Coming Soon
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
