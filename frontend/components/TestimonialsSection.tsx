'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { submitTestimonial } from '@/lib/api/testimonials';
import { ThemeColors } from '@/lib/styles';

interface Testimonial {
  id?: number;
  stars: number;
  quote: string;
  icon: string;
  name: string;
  biz: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [];

interface TestimonialsSectionProps {
  colors: ThemeColors;
  t?: any;
}

export default function TestimonialsSection({ colors }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Review Submission Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewCompany, setReviewCompany] = useState('');
  const [reviewPosition, setReviewPosition] = useState('');
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewQuote, setReviewQuote] = useState('');
  const [reviewAvatar, setReviewAvatar] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/avatar-upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to upload photo');
      }

      const data = await res.json();
      setReviewAvatar(data.url);
    } catch (err: any) {
      alert(err.message || 'Error uploading photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewQuote.trim()) {
      setReviewStatus({ type: 'error', msg: 'Please provide your name and review message.' });
      return;
    }
    setSubmittingReview(true);
    setReviewStatus(null);
    try {
      const res = await submitTestimonial({
        name: reviewName.trim(),
        email: reviewEmail.trim(),
        company: reviewCompany.trim(),
        position: reviewPosition.trim(),
        stars: reviewStars,
        quote: reviewQuote.trim(),
        icon: reviewAvatar.trim(),
      });
      setReviewStatus({
        type: 'success',
        msg: res.message || 'Thank you! Your testimonial has been submitted and is pending admin approval.',
      });
      setReviewName('');
      setReviewEmail('');
      setReviewCompany('');
      setReviewPosition('');
      setReviewQuote('');
      setReviewAvatar('');
      setReviewStars(5);
    } catch (err: any) {
      setReviewStatus({ type: 'error', msg: err.message || 'Failed to submit review. Please try again.' });
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    apiFetch('/api/testimonials')
      .then((data) => {
        if (Array.isArray(data)) {
          setTestimonials(data);
        }
      })
      .catch(() => {
        setTestimonials([]);
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

  const totalSlidesCount = testimonials.length + 1;
  const maxIndex = Math.max(0, totalSlidesCount - visibleCount);

  // Auto-slide timer
  useEffect(() => {
    if (isPaused || totalSlidesCount <= visibleCount) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, totalSlidesCount, visibleCount, maxIndex]);

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
              maxWidth: 540,
              margin: '12px auto 0',
              lineHeight: 1.6,
            }}
          >
            Discover how D-Kode Era empowers ambitious tech enterprises and dynamic startups globally.
          </p>

          <div style={{ marginTop: 24 }}>
            <button
              id="btn-leave-review"
              onClick={() => setIsReviewModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 24,
                background: 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(0,229,160,0.12))',
                border: '1px solid rgba(6,182,212,0.35)',
                color: '#06b6d4',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(6,182,212,0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6,182,212,0.28), rgba(0,229,160,0.22))';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(0,229,160,0.12))';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span>⭐</span> Leave a Review
            </button>
          </div>
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

              {/* Special Slide Card: Leave a Review */}
              <div
                style={{
                  flex: `0 0 ${100 / visibleCount}%`,
                  width: `${100 / visibleCount}%`,
                  padding: '0 12px',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1.5px dashed rgba(6, 182, 212, 0.45)',
                    borderRadius: 24,
                    padding: '36px 30px',
                    position: 'relative',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25), 0 0 30px rgba(6, 182, 212, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 320,
                    height: '100%',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ zIndex: 2 }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
                    <div
                      style={{
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        color: '#06b6d4',
                        background: 'rgba(6, 182, 212, 0.12)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        padding: '4px 12px',
                        borderRadius: 20,
                        display: 'inline-block',
                        letterSpacing: '0.1em',
                        marginBottom: 14,
                      }}
                    >
                      SHARE YOUR STORY
                    </div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '0 0 10px' }}>
                      Worked with D-Kode Era?
                    </h3>
                    <p style={{ fontSize: 13.5, color: '#a1a1aa', lineHeight: 1.6, margin: 0 }}>
                      We value your partnership! Share your review and get featured on our official client showcase.
                    </p>
                  </div>

                  <div style={{ marginTop: 24, zIndex: 2 }}>
                    <button
                      id="btn-card-leave-review"
                      onClick={() => setIsReviewModalOpen(true)}
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #06b6d4, #00e5a0)',
                        border: 'none',
                        color: '#050810',
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontFamily: "'Outfit', sans-serif",
                        boxShadow: '0 6px 20px rgba(6, 182, 212, 0.35)',
                        transition: 'transform 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                    >
                      ✍️ Submit Your Review
                    </button>
                  </div>
                </div>
              </div>
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

      {/* ── LEAVE A REVIEW MODAL ────────────────────────────────────── */}
      {isReviewModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 8, 16, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '70px 20px 40px',
            overflowY: 'auto',
          }}
          onClick={() => setIsReviewModalOpen(false)}
        >
          <div
            style={{
              background: '#0d1222',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: 20,
              width: '100%',
              maxWidth: 560,
              padding: '32px 36px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.15)',
              position: 'relative',
              marginTop: 20,
              marginBottom: 40,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsReviewModalOpen(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#a1a1aa',
                width: 32,
                height: 32,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              ✕
            </button>

            {/* Modal Title */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>⭐</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: '#f4f4f5', margin: 0 }}>
                Leave a Review
              </h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '6px 0 0' }}>
                Share your experience working with D-Kode Era. Your review will be submitted for admin verification.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleReviewSubmit}>
              {/* Rating Selector */}
              <div style={{ marginBottom: 20, textAlign: 'center' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Your Rating
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewStars(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: 28,
                        cursor: 'pointer',
                        color: star <= reviewStars ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)',
                        transition: 'transform 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#f4f4f5',
                      fontSize: 13.5,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#f4f4f5',
                      fontSize: 13.5,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Company & Position Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    value={reviewCompany}
                    onChange={(e) => setReviewCompany(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#f4f4f5',
                      fontSize: 13.5,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                    Position (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="CEO / Tech Lead"
                    value={reviewPosition}
                    onChange={(e) => setReviewPosition(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#f4f4f5',
                      fontSize: 13.5,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Review Quote */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                  Testimonial Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us about your experience working with D-Kode Era..."
                  value={reviewQuote}
                  onChange={(e) => setReviewQuote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#f4f4f5',
                    fontSize: 13.5,
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    lineHeight: 1.6,
                  }}
                />
              </div>

              {/* Profile Photo / Avatar URL & Gallery Upload */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                  Photo / Avatar (Optional)
                </label>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Gallery Upload Button */}
                  <label
                    style={{
                      padding: '10px 16px',
                      borderRadius: 10,
                      background: 'rgba(6, 182, 212, 0.14)',
                      border: '1px solid rgba(6, 182, 212, 0.35)',
                      color: '#06b6d4',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    <span>📷</span> {uploadingAvatar ? 'Uploading...' : 'Upload from Gallery'}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingAvatar}
                      onChange={handleAvatarFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <span style={{ color: '#64748b', fontSize: 12 }}>OR</span>

                  {/* URL Input */}
                  <input
                    type="text"
                    placeholder="https://... or photo URL"
                    value={reviewAvatar}
                    onChange={(e) => setReviewAvatar(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: 180,
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#f4f4f5',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Attached Preview */}
                {reviewAvatar && (
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={reviewAvatar.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${reviewAvatar}` : reviewAvatar}
                      alt="Avatar Preview"
                      style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #06b6d4' }}
                    />
                    <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>✓ Photo Attached</span>
                  </div>
                )}
              </div>

              {/* Alert Status */}
              {reviewStatus && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    marginBottom: 20,
                    background: reviewStatus.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${reviewStatus.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    color: reviewStatus.type === 'success' ? '#10b981' : '#ef4444',
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.5,
                  }}
                >
                  {reviewStatus.msg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submittingReview}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #06b6d4, #00e5a0)',
                  border: 'none',
                  color: '#050810',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: submittingReview ? 'not-allowed' : 'pointer',
                  opacity: submittingReview ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 6px 20px rgba(6, 182, 212, 0.3)',
                }}
              >
                {submittingReview ? 'Submitting...' : 'Submit Testimonial'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
