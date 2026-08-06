'use client';

import { useState, useEffect, useRef } from 'react';
import { ThemeColors } from '@/lib/styles';

interface ProductItem {
  id?: number;
  pillName: string;
  badge: string;
  title: string;
  description: string;
  image?: string;
  demoUrl?: string;
  icon?: string;
  features?: string[];
  accent?: string;
}

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 1,
    pillName: 'RESTRO MS',
    badge: 'HOSPITALITY & RESTAURANT POS',
    title: 'Restro MS',
    icon: '🍽️',
    accent: '#06b6d4',
    description:
      'Next-generation restaurant management suite featuring direct-to-kitchen KDT, POS billing, inventory tracking, and multi-table order management.',
    features: ['Instant Kitchen KDT Display', 'Table & Room Order Sync', 'eSewa & Khalti QR Ready', 'Live Daily Revenue Analytics'],
  },
  {
    id: 2,
    pillName: 'SMART KAROBAR',
    badge: 'ENTERPRISE ERP & ACCOUNTING',
    title: 'Smart Karobar',
    icon: '💼',
    accent: '#3b82f6',
    description:
      'Comprehensive business management ERP designed for modern enterprises to track inventory stock, manage multi-branch sales, automate IRD invoicing, and analyze profits.',
    features: ['Multi-Branch Inventory Sync', 'IRD Approved Invoicing', 'Credit & Supplier Tracking', 'Profit & Loss Reports'],
  },
  {
    id: 3,
    pillName: 'UPASTHITI',
    badge: 'BIOMETRIC & HR ECOSYSTEM',
    title: 'Upasthiti HR',
    icon: '⏱️',
    accent: '#10b981',
    description:
      'AI-powered employee attendance and HR portal supporting facial recognition, geo-fenced mobile check-ins, automated salary calculation, and leave management.',
    features: ['Biometric & Geo-Fence Checkin', 'Automated Payroll & Tax', 'Shift & Overtime Manager', 'Employee Self-Service App'],
  },
  {
    id: 4,
    pillName: 'MENU MA K CHHA',
    badge: 'DIGITAL QR MENU & ORDERING',
    title: 'Menu Ma K Chha',
    icon: '📱',
    accent: '#f59e0b',
    description:
      'Contactless QR code menu system allowing restaurant diners to view live menus, place orders directly from their phones, and pay digitally.',
    features: ['Instant QR Code Scan', 'No App Download Needed', 'Live Menu Price Updates', 'Direct Kitchen Notification'],
  },
  {
    id: 5,
    pillName: 'ATITHYA',
    badge: 'HOTEL & RESORT MANAGEMENT',
    title: 'Atithya PMS',
    icon: '🏨',
    accent: '#8b5cf6',
    description:
      'All-in-one Property Management System (PMS) for hotels and resorts to streamline room bookings, guest check-in/out, housekeeping tasks, and channel management.',
    features: ['Visual Room Grid Matrix', 'OTA & Direct Booking Sync', 'Guest Registration (NIDC/Passport)', 'Housekeeping Task Board'],
  },
  {
    id: 6,
    pillName: 'SMART TRAINING',
    badge: 'LMS & SKILL ACADEMY',
    title: 'Smart Training LMS',
    icon: '🎓',
    accent: '#ec4899',
    description:
      'Interactive Learning Management System for educational institutes and corporate training centers with video lessons, quizzes, and automated certification.',
    features: ['Course Content Hosting', 'Live Quiz & Assessment', 'Student Progress Tracker', 'Digital Certificate Generator'],
  },
  {
    id: 7,
    pillName: 'N-CARD',
    badge: 'DIGITAL NFC BUSINESS CARD',
    title: 'N-Card Smart Profile',
    icon: '🎴',
    accent: '#06b6d4',
    description:
      'Smart NFC business cards and dynamic QR networking profile that shares your contact details, portfolio, and social links with a single tap.',
    features: ['One-Tap NFC Contact Share', 'Dynamic QR Profile Page', 'Lead Generation Contact Form', 'Analytics & Tap Counter'],
  },
];

interface ProductEcosystemProps {
  colors: ThemeColors;
  t?: any;
  scrollTo?: (id: string) => void;
  setQuoteOpen?: (open: boolean) => void;
}

export default function ProductEcosystemSection({
  colors,
  scrollTo,
  setQuoteOpen,
}: ProductEcosystemProps) {
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge API data with default icons/features if missing
          const merged = data.map((d: any, idx: number) => ({
            ...DEFAULT_PRODUCTS[idx % DEFAULT_PRODUCTS.length],
            ...d,
          }));
          setProducts(merged);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_PRODUCTS on error
      });
  }, []);

  useEffect(() => {
    if (isAutoPlay) {
      autoPlayRef.current = setInterval(() => {
        setActiveIdx((prev) => (prev + 1) % products.length);
      }, 5000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlay, products.length]);

  const activeProduct = products[activeIdx] || products[0] || DEFAULT_PRODUCTS[0];
  const activeAccent = activeProduct.accent || colors.cyan;

  const handleDemoClick = () => {
    if (activeProduct.demoUrl) {
      window.open(activeProduct.demoUrl, '_blank');
    } else if (setQuoteOpen) {
      setQuoteOpen(true);
    } else if (scrollTo) {
      scrollTo('contact');
    }
  };

  const handleContactClick = () => {
    if (scrollTo) {
      scrollTo('contact');
    } else {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setIsAutoPlay(false);
    setActiveIdx((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setActiveIdx((prev) => (prev + 1) % products.length);
  };

  return (
    <section
      id="products"
      style={{
        padding: 'clamp(60px, 8vh, 100px) clamp(16px, 4vw, 24px)',
        position: 'relative',
        overflow: 'hidden',
        background: colors.bg,
      }}
    >
      <style>{`
        .ecosystem-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          opacity: 0.25;
          transition: all 0.8s ease;
        }

        .product-pill-btn {
          padding: 10px 20px;
          border-radius: 24px;
          font-size: 12px;
          font-weight: 700;
          font-family: "'JetBrains Mono', monospace";
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .product-card-container {
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .feature-item-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-family: "'Outfit', sans-serif";
          transition: all 0.25s ease;
        }

        .nav-arrow-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid ${colors.border};
          background: ${colors.surface};
          color: ${colors.text};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .nav-arrow-btn:hover {
          background: ${colors.cyan};
          color: #050810;
          border-color: ${colors.cyan};
          transform: scale(1.08);
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.3);
        }
      `}</style>

      {/* Dynamic Glowing Radial Ambient Orbs */}
      <div
        className="ecosystem-blob"
        style={{
          top: '20%',
          left: '15%',
          width: 500,
          height: 500,
          background: `radial-gradient(circle, ${activeAccent}44 0%, transparent 70%)`,
        }}
      />
      <div
        className="ecosystem-blob"
        style={{
          bottom: '10%',
          right: '15%',
          width: 450,
          height: 450,
          background: `radial-gradient(circle, ${colors.cyan}33 0%, transparent 70%)`,
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Eyebrow & Controls */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: colors.cyan,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div style={{ width: 28, height: 2, background: colors.cyan, borderRadius: 1 }} />
            PRODUCT ECOSYSTEM
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={handlePrev} className="nav-arrow-btn" title="Previous Product" aria-label="Previous Product">
              ←
            </button>
            <button onClick={handleNext} className="nav-arrow-btn" title="Next Product" aria-label="Next Product">
              →
            </button>
          </div>
        </div>

        {/* Main Title */}
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(32px, 5vw, 54px)',
            fontWeight: 800,
            textAlign: 'center',
            color: colors.text,
            letterSpacing: '-0.02em',
            marginBottom: 40,
            lineHeight: 1.15,
          }}
        >
          One Suite,{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${colors.cyan}, ${activeAccent})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
            }}
          >
            Infinite
          </span>{' '}
          Solutions.
        </h2>

        {/* Product Selector Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 44,
            maxWidth: 1060,
          }}
        >
          {products.map((prod, idx) => {
            const isActive = activeIdx === idx;
            return (
              <button
                key={prod.id || idx}
                onClick={() => {
                  setIsAutoPlay(false);
                  setActiveIdx(idx);
                }}
                className="product-pill-btn"
                style={{
                  border: isActive
                    ? `1.5px solid ${activeAccent}`
                    : `1px solid ${colors.border}`,
                  background: isActive
                    ? `linear-gradient(135deg, ${activeAccent}22, ${colors.surface})`
                    : colors.surface,
                  color: isActive ? colors.text : colors.muted,
                  boxShadow: isActive
                    ? `0 6px 20px ${activeAccent}33`
                    : 'none',
                  transform: isActive ? 'translateY(-2px)' : 'none',
                }}
              >
                <span>{prod.icon || '⚡'}</span>
                <span>{prod.pillName.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        {/* Active Product Feature Showcase Card */}
        <div
          className="product-card-container"
          style={{
            width: '100%',
            maxWidth: 1120,
            background: colors.surface,
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 24px 60px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
            padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 44px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 44,
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Decorative Line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${activeAccent}, ${colors.cyan})`,
              transition: 'background 0.5s ease',
            }}
          />

          {/* Left Content Column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {/* Category Badge */}
            <div
              style={{
                background: `rgba(6, 182, 212, 0.1)`,
                color: activeAccent,
                border: `1px solid ${activeAccent}44`,
                fontSize: 11,
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.12em',
                padding: '6px 14px',
                borderRadius: 20,
                marginBottom: 20,
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{activeProduct.icon}</span>
              <span>{activeProduct.badge}</span>
            </div>

            {/* Product Title */}
            <h3
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(30px, 4vw, 44px)',
                fontWeight: 800,
                color: colors.text,
                marginBottom: 16,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              {activeProduct.title}
            </h3>

            {/* Description */}
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 16,
                lineHeight: 1.7,
                color: colors.muted,
                marginBottom: 28,
              }}
            >
              {activeProduct.description}
            </p>

            {/* Key Feature Chips */}
            {activeProduct.features && activeProduct.features.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, width: '100%', marginBottom: 36 }}>
                {activeProduct.features.map((feat, i) => (
                  <div
                    key={i}
                    className="feature-item-chip"
                    style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                  >
                    <span style={{ color: colors.cyan, fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{feat}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <button
                onClick={handleDemoClick}
                style={{
                  background: activeAccent,
                  color: '#050810',
                  border: 'none',
                  padding: '14px 30px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: `0 8px 24px ${activeAccent}44`,
                  transition: 'all 0.25s ease',
                }}
              >
                REQUEST DEMO <span>🚀</span>
              </button>

              <button
                onClick={handleContactClick}
                style={{
                  background: 'transparent',
                  color: colors.text,
                  border: `1.5px solid ${colors.border}`,
                  padding: '14px 28px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.25s ease',
                }}
              >
                CONTACT SALES <span>→</span>
              </button>
            </div>
          </div>

          {/* Right Visual Graphic Dashboard Frame */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: colors.bg,
              borderRadius: 20,
              padding: 28,
              minHeight: 320,
              border: `1px solid ${colors.border}`,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `inset 0 2px 10px rgba(0,0,0,0.1)`,
            }}
          >
            {/* Top Frame Status Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              </div>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: colors.green,
                  background: `rgba(16, 185, 129, 0.1)`,
                  padding: '3px 10px',
                  borderRadius: 12,
                  border: `1px solid rgba(16, 185, 129, 0.2)`,
                }}
              >
                🟢 SYSTEM ACTIVE
              </span>
            </div>

            {/* Graphic Content Body */}
            {activeProduct.image ? (
              <img
                src={activeProduct.image}
                alt={activeProduct.title}
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: 240,
                  objectFit: 'contain',
                  borderRadius: 12,
                }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    background: `rgba(6, 182, 212, 0.1)`,
                    border: `1px solid ${activeAccent}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 36,
                    marginBottom: 16,
                    boxShadow: `0 12px 30px ${activeAccent}22`,
                  }}
                >
                  {activeProduct.icon}
                </div>

                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 22,
                    fontWeight: 800,
                    color: colors.text,
                    marginBottom: 6,
                  }}
                >
                  {activeProduct.title}
                </div>

                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: colors.muted,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                  }}
                >
                  D-KODE ERA ENTERPRISE SUITE
                </div>
              </div>
            )}

            {/* Bottom Mini Metrics Bar */}
            <div
              style={{
                marginTop: 20,
                paddingTop: 14,
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: colors.muted,
              }}
            >
              <span>Uptime: 99.98%</span>
              <span>Response: 14ms</span>
              <span style={{ color: activeAccent, fontWeight: 700 }}>v2.4 Live</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
