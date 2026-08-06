'use client';

import { useState, useEffect } from 'react';
import { ThemeColors } from '@/lib/styles';

interface Testimonial {
  id?: number;
  stars: number;
  quote: string;
  icon: string;
  name: string;
  biz: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    stars: 5,
    quote:
      "D-Kode Era transformed our entire restaurant management with Restro MS. Orders flow directly to the kitchen without a single delay, increasing our table turnover by 35% within the first month!",
    icon: '👨‍🍳',
    name: 'Aarav Shrestha',
    biz: 'Owner, Royal Himalayan Bistro',
  },
  {
    id: 2,
    stars: 5,
    quote:
      'Working with D-Kode Era was an absolute pleasure. Their team built our SaaS product with unbelievable attention to detail, flawless UI animations, and bulletproof security.',
    icon: '🚀',
    name: 'Siddharth Thapa',
    biz: 'Founder & CEO, TechPeak Innovations',
  },
  {
    id: 3,
    stars: 5,
    quote:
      'Upasthiti and Smart Karobar completely automated our multi-branch inventory and HR operations. Our daily reporting time dropped from hours to a single click on our dashboard.',
    icon: '📊',
    name: 'Pooja Gurung',
    biz: 'Operations Director, Apex Retail Group',
  },
  {
    id: 4,
    stars: 5,
    quote:
      'The digital QR menu system (Menu Ma K Chha) upgraded our guest dining experience overnight. Customers love the instant order placement and seamless interface!',
    icon: '📲',
    name: 'Rohan Adhikari',
    biz: 'General Manager, Summit Luxury Resort',
  },
  {
    id: 5,
    stars: 5,
    quote:
      'Exceptional code quality, super fast delivery, and 24/7 technical support. D-Kode Era is truly the top software development agency for modern web apps.',
    icon: '💎',
    name: 'Elena Rostova',
    biz: 'Product Lead, GlobalVibe Media',
  },
  {
    id: 6,
    stars: 5,
    quote:
      'The custom enterprise software solution built by D-Kode Era scaled our active user base to 100k+ smoothly. Highly reliable tech partner!',
    icon: '🔥',
    name: 'Bikram Karki',
    biz: 'CTO, FinEdge Nepal',
  },
];

interface TestimonialsSectionProps {
  colors: ThemeColors;
  t?: any;
}

export default function TestimonialsSection({ colors }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/testimonials')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch testimonials');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_TESTIMONIALS
      });
  }, []);

  // Handle responsive visible card count (3 on desktop, 2 on tablet, 1 on mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  // Auto-slide timer
  useEffect(() => {
    if (isPaused || testimonials.length <= visibleCount) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, testimonials.length, visibleCount, maxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
    setTouchStart(null);
  };

  return (
    <section
      id="testimonials"
      style={{
        background: colors.bg === '#050810' ? '#070b16' : colors.bg,
        position: 'relative',
        zIndex: 1,
        padding: '100px 24px',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          height: 380,
          background: 'radial-gradient(ellipse, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 54 }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: '0.25em',
              color: '#06b6d4',
              textTransform: 'uppercase',
              marginBottom: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 18px',
              borderRadius: 20,
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              fontWeight: 700,
            }}
          >
            <span>★</span> Client Success
          </div>

          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: colors.text,
              marginTop: 8,
            }}
          >
            Trusted by Industry Leaders.
          </h2>
          <p
            style={{
              fontSize: 15,
              color: colors.muted,
              marginTop: 12,
              fontFamily: "'Outfit', sans-serif",
              maxWidth: 560,
              margin: '12px auto 0',
              lineHeight: 1.6,
            }}
          >
            Discover how forward-thinking businesses and brands scale faster with D-Kode Era software solutions.
          </p>
        </div>

        {/* Carousel Container */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'relative',
            width: '100%',
            margin: '0 auto',
          }}
        >
          {/* Track Window */}
          <div
            style={{
              overflow: 'hidden',
              borderRadius: 24,
              padding: '12px 0',
            }}
          >
            {/* Sliding Track */}
            <div
              style={{
                display: 'flex',
                transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
                transition: 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)',
                width: '100%',
              }}
            >
              {testimonials.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    flex: `0 0 ${100 / visibleCount}%`,
                    width: `${100 / visibleCount}%`,
                    padding: '0 12px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(13, 20, 37, 0.75)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1.5px solid rgba(6, 182, 212, 0.22)',
                      borderRadius: 24,
                      padding: '36px 30px',
                      position: 'relative',
                      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.22), 0 0 25px rgba(6, 182, 212, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 320,
                      height: '100%',
                      boxSizing: 'border-box',
                      transition: 'transform 0.3s ease, border-color 0.3s ease',
                    }}
                  >
                    {/* Background Decorative Quote Mark */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 16,
                        right: 24,
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 84,
                        fontWeight: 900,
                        color: 'rgba(6, 182, 212, 0.08)',
                        lineHeight: 0.8,
                        userSelect: 'none',
                        pointerEvents: 'none',
                      }}
                    >
                      “
                    </div>

                    {/* Top Row: Stars + Verified Badge */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 18,
                        zIndex: 2,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 3, fontSize: 16, color: '#f59e0b' }}>
                        {'★'.repeat(item.stars || 5)}
                      </div>
                      <div
                        style={{
                          fontSize: 9.5,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          color: '#10b981',
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          padding: '3px 10px',
                          borderRadius: 20,
                          letterSpacing: '0.06em',
                        }}
                      >
                        VERIFIED ✓
                      </div>
                    </div>

                    {/* Testimonial Quote */}
                    <p
                      style={{
                        fontSize: 14.5,
                        color: '#e4e4e7',
                        fontFamily: "'Outfit', sans-serif",
                        lineHeight: 1.68,
                        fontWeight: 400,
                        marginBottom: 28,
                        position: 'relative',
                        zIndex: 2,
                        flex: 1,
                      }}
                    >
                      "{item.quote}"
                    </p>

                    {/* Author Info */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        zIndex: 2,
                        paddingTop: 16,
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(14, 165, 233, 0.12))',
                          border: '1.5px solid rgba(6, 182, 212, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        {item.icon || '👤'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: 15,
                            fontWeight: 800,
                            color: '#ffffff',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: '#06b6d4',
                            fontFamily: "'JetBrains Mono', monospace",
                            marginTop: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.biz}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            aria-label="Previous Testimonials"
            style={{
              position: 'absolute',
              top: '50%',
              left: -22,
              transform: 'translateY(-50%)',
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(13, 20, 37, 0.95)',
              border: '1.5px solid rgba(6, 182, 212, 0.4)',
              color: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              transition: 'all 0.2s ease',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#06b6d4';
              (e.currentTarget as HTMLElement).style.color = '#050810';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(13, 20, 37, 0.95)';
              (e.currentTarget as HTMLElement).style.color = '#06b6d4';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            ←
          </button>

          <button
            onClick={handleNext}
            aria-label="Next Testimonials"
            style={{
              position: 'absolute',
              top: '50%',
              right: -22,
              transform: 'translateY(-50%)',
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(13, 20, 37, 0.95)',
              border: '1.5px solid rgba(6, 182, 212, 0.4)',
              color: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              transition: 'all 0.2s ease',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#06b6d4';
              (e.currentTarget as HTMLElement).style.color = '#050810';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(13, 20, 37, 0.95)';
              (e.currentTarget as HTMLElement).style.color = '#06b6d4';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            →
          </button>

          {/* Dots Pagination */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              marginTop: 32,
            }}
          >
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => {
              const isActive = currentIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide page ${idx + 1}`}
                  style={{
                    width: isActive ? 32 : 10,
                    height: 10,
                    borderRadius: 5,
                    background: isActive ? '#06b6d4' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isActive ? '0 0 12px rgba(6, 182, 212, 0.8)' : 'none',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
