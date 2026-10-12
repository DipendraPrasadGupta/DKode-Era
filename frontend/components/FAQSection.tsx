'use client';

import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '@/lib/api';
import { ThemeColors } from '@/lib/styles';
import { useSiteSettings } from '@/lib/useSiteSettings';

interface FAQSectionProps {
  colors: ThemeColors;
  t?: any;
}

interface BackendFAQ {
  id: number | string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

export default function FAQSection({ colors, t }: FAQSectionProps) {
  const { settings } = useSiteSettings();
  const isDark = colors.bg !== '#fafafa';

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | string | null>(null);
  const [faqs, setFaqs] = useState<BackendFAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Real contact details from backend settings
  const phone = settings.agency_phone || settings.whatsapp_number || '+977 9807544395';
  const phoneClean = (phone || '9779807544395').replace(/[^0-9]/g, '');
  const email = settings.agency_email || 'dkodeera2026@gmail.com';
  const whatsappUrl = `https://wa.me/${phoneClean || '9779807544395'}?text=${encodeURIComponent(
    'Hi D-Kode Era, I have a few questions regarding your software development services.'
  )}`;

  // 1. Fetch real-time data ONLY from backend API
  useEffect(() => {
    setLoading(true);
    apiFetch('/api/faqs')
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped: BackendFAQ[] = data.map((d: any, idx: number) => {
            const q = d.question || d.q || '';
            const qLower = q.toLowerCase();
            let cat = 'General';
            if (qLower.includes('price') || qLower.includes('cost') || qLower.includes('budget') || qLower.includes('rate')) {
              cat = 'Pricing';
            } else if (qLower.includes('tech') || qLower.includes('stack') || qLower.includes('react') || qLower.includes('aws') || qLower.includes('code')) {
              cat = 'Technology';
            } else if (qLower.includes('support') || qLower.includes('maintenance') || qLower.includes('team') || qLower.includes('sla')) {
              cat = 'Support';
            } else if (qLower.includes('time') || qLower.includes('long') || qLower.includes('week') || qLower.includes('duration')) {
              cat = 'Timeline';
            }

            return {
              id: d.id ?? idx + 1,
              question: q,
              answer: d.answer || d.a || '',
              category: cat,
              tags: [cat, 'Verified'],
            };
          });

          setFaqs(mapped);
          if (mapped.length > 0) {
            setOpenFaq(mapped[0].id);
          }
        } else {
          setFaqs([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching FAQs from backend:', err);
        setFaqs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // 2. Derive dynamic category list from real backend items
  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(faqs.map((f) => f.category || 'General')));
    return ['all', ...uniqueCats];
  }, [faqs]);

  // 3. Filter real backend data by category and search query
  const filteredFaqs = useMemo(() => {
    return faqs.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(query)));
      return matchesCat && matchesQuery;
    });
  }, [faqs, activeCategory, searchQuery]);

  return (
    <section
      id="faq"
      style={{
        background: colors.bg,
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
        padding: 'clamp(80px, 9vw, 120px) 0',
      }}
    >
      <style>{`
        /* ── Ambient Glows ── */
        .faq-ambient-blob {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
          opacity: ${isDark ? 0.08 : 0.04};
        }

        /* ── Two Column Responsive Layout ── */
        .faq-layout-grid {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: clamp(32px, 5vw, 64px);
          align-items: start;
        }

        @media (max-width: 960px) {
          .faq-layout-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        /* ── Filter Buttons ── */
        .faq-filter-chip {
          padding: 8px 16px;
          border-radius: 999px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid transparent;
          background: transparent;
          white-space: nowrap;
        }

        .faq-filter-chip:hover {
          transform: translateY(-1px);
        }

        /* ── Accordion Card ── */
        .faq-card {
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.07)'};
          background: ${
            isDark
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.45) 0%, rgba(20, 24, 39, 0.25) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)'
          };
          backdrop-filter: blur(16px);
          overflow: hidden;
          margin-bottom: 14px;
        }

        .faq-card:hover {
          border-color: ${isDark ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.35)'};
          box-shadow: ${
            isDark
              ? '0 10px 28px -10px rgba(0, 0, 0, 0.5)'
              : '0 10px 24px -10px rgba(6, 182, 212, 0.1)'
          };
        }

        .faq-card.faq-card-active {
          border-color: ${isDark ? 'rgba(6, 182, 212, 0.45)' : 'rgba(6, 182, 212, 0.4)'};
          background: ${
            isDark
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(20, 28, 48, 0.4) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.8) 100%)'
          };
          box-shadow: ${
            isDark
              ? '0 12px 32px -10px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
              : '0 12px 28px -10px rgba(6, 182, 212, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          };
        }

        .faq-trigger {
          padding: 20px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          cursor: pointer;
          user-select: none;
        }

        .faq-icon-orb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .faq-answer-body {
          transition: max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease, padding 0.35s ease;
          overflow: hidden;
        }

        /* ── Support Card ── */
        .faq-support-card {
          border-radius: 20px;
          padding: 28px;
          background: ${
            isDark
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(24, 30, 52, 0.5) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 245, 249, 0.85) 100%)'
          };
          border: 1px solid ${isDark ? 'rgba(6, 182, 212, 0.25)' : 'rgba(6, 182, 212, 0.2)'};
          box-shadow: ${
            isDark
              ? '0 20px 45px -10px rgba(0, 0, 0, 0.5)'
              : '0 20px 35px -10px rgba(6, 182, 212, 0.08)'
          };
          backdrop-filter: blur(20px);
          position: sticky;
          top: 100px;
        }

        .faq-channel-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.25s ease;
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)'};
          background: ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'};
        }

        .faq-channel-btn:hover {
          transform: translateX(4px);
          border-color: ${colors.cyan};
          background: ${isDark ? 'rgba(6, 182, 212, 0.08)' : 'rgba(6, 182, 212, 0.06)'};
        }
      `}</style>

      {/* Ambient background glows */}
      <div
        className="faq-ambient-blob"
        style={{
          top: 0,
          left: -100,
          background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)',
        }}
      />
      <div
        className="faq-ambient-blob"
        style={{
          bottom: 0,
          right: -100,
          background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
        }}
      />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(20px, 5vw, 60px)', position: 'relative', zIndex: 2 }}>
        {/* ── Section Header ── */}
        <div style={{ marginBottom: 'clamp(40px, 6vw, 56px)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 14px',
              borderRadius: 999,
              background: isDark ? 'rgba(6, 182, 212, 0.12)' : 'rgba(6, 182, 212, 0.08)',
              border: `1px solid ${isDark ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.25)'}`,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                color: colors.cyan,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              FAQ & Knowledgebase
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(32px, 4.5vw, 54px)',
              fontWeight: 800,
              color: colors.text,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              margin: '0 0 16px 0',
              background: isDark
                ? `linear-gradient(135deg, ${colors.text} 0%, #38bdf8 55%, #a78bfa 100%)`
                : `linear-gradient(135deg, ${colors.text} 0%, ${colors.cyan} 55%, #7c3aed 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Frequently Asked Questions.
          </h2>

          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(15px, 1.2vw, 17px)',
              color: colors.muted,
              lineHeight: 1.7,
              margin: 0,
              maxWidth: 680,
            }}
          >
            Clear, transparent answers about our engineering process, pricing models, project timelines, and post-launch guarantees.
          </p>
        </div>

        {/* ── Main Two-Column Layout ── */}
        <div className="faq-layout-grid">
          {/* ── Left Column: Interactive Discovery Desk ── */}
          <div>
            <div className="faq-support-card">
              {/* Category Filter Pills (Dynamically created from real backend items) */}
              <div style={{ marginBottom: 28 }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10.5,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: colors.muted,
                    marginBottom: 12,
                    fontWeight: 700,
                  }}
                >
                  Filter By Topic
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {categories.map((catKey) => {
                    const isActive = activeCategory === catKey;
                    const label = catKey === 'all' ? 'All Questions' : catKey;
                    return (
                      <button
                        key={catKey}
                        onClick={() => setActiveCategory(catKey)}
                        className="faq-filter-chip"
                        style={{
                          textAlign: 'left',
                          background: isActive
                            ? isDark
                              ? 'rgba(6, 182, 212, 0.16)'
                              : 'rgba(6, 182, 212, 0.12)'
                            : 'transparent',
                          color: isActive ? colors.cyan : colors.muted,
                          borderColor: isActive
                            ? isDark
                              ? 'rgba(6, 182, 212, 0.4)'
                              : 'rgba(6, 182, 212, 0.35)'
                            : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontWeight: isActive ? 700 : 500,
                        }}
                      >
                        <span>{label}</span>
                        {isActive && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: colors.cyan,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Instant Search Bar */}
              <div style={{ marginBottom: 28, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search real questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 36px',
                    borderRadius: 12,
                    background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                    color: colors.text,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = colors.cyan)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)')}
                />
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.muted}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {/* Real Support Channels from backend settings */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: 14,
                  background: isDark ? 'rgba(6, 182, 212, 0.06)' : 'rgba(6, 182, 212, 0.04)',
                  border: `1px solid ${isDark ? 'rgba(6, 182, 212, 0.18)' : 'rgba(6, 182, 212, 0.14)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: 'rgba(6, 182, 212, 0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.cyan,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </span>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: colors.text }}>
                    Have a custom question?
                  </div>
                </div>

                <p style={{ fontSize: 12.5, color: colors.muted, lineHeight: 1.6, margin: '0 0 16px 0' }}>
                  Our technical architects in Butwal are available to discuss your requirements directly.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="faq-channel-btn">
                    <span style={{ color: '#10b981', display: 'flex' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.43 1.02 2.6.13.16 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3" />
                      </svg>
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.text }}>
                      Direct WhatsApp ({phone})
                    </span>
                  </a>

                  <a href={`mailto:${email}`} className="faq-channel-btn">
                    <span style={{ color: '#a78bfa', display: 'flex' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.text }}>
                      Email Desk ({email})
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Real Backend Accordions ── */}
          <div>
            {loading ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  borderRadius: 16,
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                  background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                }}
              >
                <p style={{ fontSize: 14, color: colors.cyan, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                  Loading real-time knowledgebase from database...
                </p>
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  borderRadius: 16,
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                  background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                }}
              >
                <p style={{ fontSize: 15, color: colors.muted, margin: '0 0 12px 0' }}>
                  No questions found matching "{searchQuery}".
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: colors.cyan,
                    color: '#050810',
                    fontWeight: 700,
                    fontSize: 12,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaq === faq.id;

                return (
                  <div
                    key={faq.id}
                    className={`faq-card ${isOpen ? 'faq-card-active' : ''}`}
                  >
                    <div
                      className="faq-trigger"
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 12,
                            fontWeight: 700,
                            color: isOpen ? colors.cyan : colors.muted,
                            opacity: 0.7,
                            marginTop: 2,
                          }}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <div
                            style={{
                              fontFamily: "'Syne', sans-serif",
                              fontSize: 'clamp(15px, 1.2vw, 17.5px)',
                              fontWeight: 700,
                              color: isOpen ? colors.cyan : colors.text,
                              lineHeight: 1.4,
                              transition: 'color 0.25s ease',
                            }}
                          >
                            {faq.question}
                          </div>
                        </div>
                      </div>

                      {/* Expand / Collapse Orb */}
                      <div
                        className="faq-icon-orb"
                        style={{
                          background: isOpen
                            ? colors.cyan
                            : isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.05)',
                          color: isOpen ? '#050810' : colors.text,
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          boxShadow: isOpen ? `0 0 16px ${colors.cyan}88` : 'none',
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>

                    {/* Collapsible Answer Body */}
                    <div
                      className="faq-answer-body"
                      style={{
                        maxHeight: isOpen ? 600 : 0,
                        opacity: isOpen ? 1 : 0,
                        padding: isOpen ? '0 22px 22px 48px' : '0 22px 0 48px',
                      }}
                    >
                      <div
                        style={{
                          height: 1,
                          background: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
                          marginBottom: 16,
                        }}
                      />
                      <p
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 14.5,
                          color: isDark ? 'rgba(226, 232, 240, 0.88)' : '#334155',
                          lineHeight: 1.75,
                          margin: '0 0 14px 0',
                        }}
                      >
                        {faq.answer}
                      </p>

                      {faq.tags && faq.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 10,
                              color: colors.muted,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                            }}
                          >
                            Category:
                          </span>
                          {faq.tags.map((tg) => (
                            <span
                              key={tg}
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 10,
                                padding: '2px 8px',
                                borderRadius: 6,
                                background: isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.08)',
                                color: colors.cyan,
                                border: `1px solid ${isDark ? 'rgba(6, 182, 212, 0.22)' : 'rgba(6, 182, 212, 0.2)'}`,
                              }}
                            >
                              {tg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
