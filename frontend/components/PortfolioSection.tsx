'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { ThemeColors } from '@/lib/styles';
import Link from 'next/link';

interface PortfolioSectionProps {
  colors: ThemeColors;
  t: any;
}

export default function PortfolioSection({ colors, t }: PortfolioSectionProps) {
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    apiFetch('/api/portfolio')
      .then(data => setPortfolioItems(data))
      .catch(err => console.error('Error fetching portfolio:', err));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 640) {
        setVisibleItems(1);
      } else if (window.innerWidth <= 968) {
        setVisibleItems(2);
      } else {
        setVisibleItems(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, portfolioItems.length - visibleItems);

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [visibleItems, maxIndex, currentIndex]);

  // Professional Auto-Slide Interval (5 seconds)
  useEffect(() => {
    if (maxIndex <= 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [maxIndex, isPaused]);

  const handleNext = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? maxIndex : prev - 1));
  };

  return (
    <section 
      id="portfolio" 
      onMouseEnter={() => setIsPaused(true)} 
      onMouseLeave={() => setIsPaused(false)}
      style={{ background: colors.bg2, position: 'relative', zIndex: 1, overflow: 'hidden' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)' }}>
        
        {/* Header Row with Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 54 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.3em', color: colors.cyan, textTransform: 'uppercase', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 28, height: 1, background: colors.cyan }} />
              {t.workEye || 'PORTFOLIO'}
            </div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(34px,5vw,54px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
              {t.workTitle || 'Recent Projects'}
            </h2>
          </div>
          
          {/* Slider Navigation Buttons */}
          {portfolioItems.length > visibleItems && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <button
                onClick={handlePrev}
                className="carousel-nav-btn"
                style={{
                  cursor: 'pointer',
                  borderColor: colors.border
                }}
              >
                ←
              </button>
              <button
                onClick={handleNext}
                className="carousel-nav-btn"
                style={{
                  cursor: 'pointer',
                  borderColor: colors.border
                }}
              >
                →
              </button>
            </div>
          )}
        </div>

        <p style={{ fontSize: 16, color: colors.muted, maxWidth: 540, lineHeight: 1.8, marginBottom: 44, marginTop: -32 }}>
          Real products built for Nepal's businesses. Each project delivered on time, on budget.
        </p>

        {/* Sliding Carousel Wrapper */}
        <div style={{ position: 'relative', overflow: 'hidden', margin: '0 -12px' }}>
          <div
            style={{
              display: 'flex',
              transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
              transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
            }}
          >
            {portfolioItems.map((p, i) => {
              let tech: string[] = [];
              let results: { label: string; value: string }[] = [];
              try {
                tech = typeof p.tech === 'string' ? JSON.parse(p.tech) : p.tech || [];
              } catch (e) {}
              try {
                results = typeof p.results === 'string' ? JSON.parse(p.results) : p.results || [];
              } catch (e) {}

              const accentColor = p.color || colors.cyan;
              const isHovered = hoveredCard === i;

              return (
                <div
                  key={i}
                  style={{
                    flex: `0 0 ${100 / visibleItems}%`,
                    padding: '0 12px',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="port-card"
                    style={{
                      background: colors.surface,
                      border: `1px solid ${isHovered ? accentColor : colors.border}`,
                      borderRadius: 12,
                      overflow: 'hidden',
                      transition: 'all 0.35s',
                      cursor: 'default',
                      boxShadow: isHovered ? `0 14px 40px rgba(0,0,0,0.4), 0 0 0 1px ${accentColor}18` : 'none',
                      transform: isHovered ? 'translateY(-6px)' : 'none',
                    }}
                  >
                    {/* Visual Banner */}
                    <div
                      style={{
                        height: 180,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 60,
                        background: `linear-gradient(135deg, ${accentColor}25 0%, ${accentColor}05 100%)`,
                        position: 'relative',
                        transition: 'background 0.3s',
                      }}
                    >
                      <div style={{ transform: isHovered ? 'scale(1.15) rotate(5deg)' : 'scale(1)', transition: 'transform 0.4s ease-out' }}>
                        {p.icon}
                      </div>
                      
                      {/* Featured Highlight Star */}
                      {p.highlight && (
                        <div style={{
                          position: 'absolute', top: 12, right: 12,
                          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
                          borderRadius: '20px', padding: '3px 10px', fontSize: 10,
                          color: '#fbbf24', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace"
                        }}>
                          ★ FEATURED
                        </div>
                      )}

                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: `linear-gradient(to top, ${colors.surface}, transparent)`,
                        }}
                      />
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '26px 28px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, letterSpacing: '0.15em', color: accentColor, textTransform: 'uppercase', fontWeight: 700 }}>
                          {p.tag}
                        </span>
                        {p.year && (
                          <span style={{ fontSize: 11, color: '#4b5563', fontFamily: "'JetBrains Mono',monospace" }}>
                            {p.year}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, marginBottom: 10, color: '#f4f4f5' }}>
                        {p.title}
                      </h3>
                      
                      <p style={{ fontSize: 13, color: colors.muted, lineHeight: 1.7, marginBottom: 16, minHeight: 44 }}>
                        {p.desc}
                      </p>

                      {/* Tech Chips */}
                      {tech.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                          {tech.slice(0, 3).map((t, idx) => (
                            <span key={idx} style={{
                              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                              color: accentColor, background: `${accentColor}12`, border: `1px solid ${accentColor}18`,
                              fontFamily: "'JetBrains Mono',monospace"
                            }}>{t}</span>
                          ))}
                        </div>
                      )}

                      {/* Results Metric Chips */}
                      {results.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8 }}>
                          {results.slice(0, 2).map((r, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                              <span style={{ color: colors.muted }}>{r.label}</span>
                              <span style={{ color: '#10b981', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{r.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        p.result && (
                          <div
                            style={{
                              padding: '10px 14px',
                              background: `${accentColor}0a`,
                              borderLeft: `2px solid ${accentColor}`,
                              fontSize: 12.5,
                              color: accentColor,
                              fontFamily: "'JetBrains Mono',monospace",
                              fontWeight: 600,
                              borderRadius: '0 6px 6px 0'
                            }}
                          >
                            → {p.result}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Dots indicators */}
        {portfolioItems.length > visibleItems && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 44 }}>
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: currentIndex === idx ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: currentIndex === idx ? colors.cyan : colors.border,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* View All Projects link */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link
            href="/pages/work"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              border: `2px solid ${colors.cyan}`,
              color: colors.cyan,
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 700,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'all 0.25s',
              fontFamily: "'JetBrains Mono',monospace"
            }}
            className="view-all-projects-btn"
          >
            Explore All Case Studies →
          </Link>
        </div>

      </div>

      <style>{`
        .carousel-nav-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid;
          background: rgba(255,255,255,0.03);
          color: #f4f4f5;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .carousel-nav-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.08);
          transform: scale(1.05);
        }
        .view-all-projects-btn:hover {
          background: ${colors.cyan}12;
          box-shadow: 0 6px 20px rgba(6,182,212,0.18);
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}
