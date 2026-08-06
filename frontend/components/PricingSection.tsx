'use client';

import { useState, useEffect } from 'react';
import { ThemeColors } from '@/lib/styles';

interface PricingSectionProps {
  colors: ThemeColors;
  t: any;
  scrollTo: (id: string) => void;
}

interface PricingTier {
  tier: string;
  price: string;
  desc?: string;
  highlight?: boolean;
  features: string[];
  notIncluded?: string[];
}

interface Service {
  id: number;
  title: string;
  icon: string;
  pricing: PricingTier[];
}

const fallbackPackages: PricingTier[] = [
  {
    tier: 'Starter',
    price: '15K',
    desc: 'Perfect for small businesses needing a strong online presence fast.',
    features: [
      '5-page professional website',
      'Mobile responsive design',
      'Contact form & Google Maps',
      'Basic SEO setup',
      'Social media links',
      '1 month free support',
      'Delivery in 7 days',
    ],
    notIncluded: ['Admin CMS panel', 'Payment gateway', 'Custom integrations'],
    highlight: false,
  },
  {
    tier: 'Growth',
    price: '35K',
    desc: 'Ideal for growing businesses needing advanced features and digital marketing.',
    features: [
      '10-page custom website',
      'Admin dashboard / CMS',
      'eSewa / Khalti integration',
      'WhatsApp chat widget',
      'Facebook Pixel + Analytics',
      '1 month digital marketing',
      '3 months free support',
      'Delivery in 14 days',
      'Staff training included',
    ],
    notIncluded: ['Multi-vendor marketplace', 'Native mobile app'],
    highlight: true,
  },
  {
    tier: 'Enterprise',
    price: 'Custom',
    desc: 'Full custom apps, management systems, and SaaS products.',
    features: [
      'Full custom web/mobile app',
      'Hotel / School / ERP system',
      'Multi-user role management',
      'All Nepal payment gateways',
      'API & 3rd party integrations',
      'Staff training program',
      '6 months priority support',
      'Source code ownership',
    ],
    notIncluded: [],
    highlight: false,
  },
];

export default function PricingSection({ colors, t, scrollTo }: PricingSectionProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/services')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch pricing');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const transformed = data
            .map((s: any) => ({
              id: s.id,
              title: s.title,
              icon: s.icon || '💼',
              pricing: typeof s.pricing === 'string' ? JSON.parse(s.pricing) : s.pricing || []
            }))
            .filter((s: Service) => s.pricing.length > 0); // Only show categories with defined plans
          setServices(transformed);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Pricing Section Fetch Error:', err);
        setLoading(false);
      });
  }, []);

  // Determine active plans
  const hasDbPlans = services.length > 0;
  const currentService = hasDbPlans ? services[activeTab] : null;
  const activePlans = currentService ? currentService.pricing : fallbackPackages;

  return (
    <section id="packages" style={{ background: colors.bg, position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)' }}>
        
        {/* Label */}
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.3em', color: colors.cyan, textTransform: 'uppercase', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 1, background: colors.cyan }} />
          {t.pricingEye}
        </div>

        {/* Title */}
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(34px,5vw,54px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16 }}>
          {t.pricingTitle}
        </h2>
        
        <p style={{ fontSize: 16, color: colors.muted, maxWidth: 540, lineHeight: 1.8, marginBottom: 40 }}>
          Flexible pricing built for Nepal's businesses. Direct eSewa & Khalti integrations supported.
        </p>

        {/* Category switcher tabs */}
        {hasDbPlans && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 44, borderBottom: `1px solid ${colors.border}`, paddingBottom: 16 }}>
            {services.map((s, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(idx)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: `1.5px solid ${isActive ? colors.cyan : colors.border}`,
                    background: isActive ? `${colors.cyan}12` : 'transparent',
                    color: isActive ? colors.cyan : colors.text,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{s.icon}</span> {s.title}
                </button>
              );
            })}
          </div>
        )}

        {/* Plan Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {activePlans.map((pkg, i) => {
            const isFeatured = !!pkg.highlight;
            return (
              <div
                key={i}
                className="pkg-card"
                style={{
                  border: `1px solid ${isFeatured ? colors.cyan : colors.border}`,
                  padding: '44px 34px',
                  background: isFeatured ? colors.surface2 : colors.surface,
                  position: 'relative',
                  transition: 'all 0.35s',
                  borderRadius: 8,
                }}
              >
                {isFeatured && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: colors.cyan,
                      color: '#050810',
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      padding: '4px 16px',
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.3em', color: colors.cyan, textTransform: 'uppercase', marginBottom: 18 }}>
                  {pkg.tier}
                </div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 38, fontWeight: 800, lineHeight: 1, marginBottom: 6 }}>
                  {pkg.price.includes('Rs') || pkg.price.includes('$') || pkg.price.toLowerCase().includes('custom') ? (
                    pkg.price
                  ) : (
                    <>
                      <span style={{ fontSize: 18, color: colors.muted, verticalAlign: 'top', marginTop: 8, display: 'inline-block' }}>
                        Rs.
                      </span>
                      {pkg.price}
                    </>
                  )}
                </div>
                {pkg.desc && (
                  <p style={{ fontSize: 13, color: colors.muted, marginBottom: 20, minHeight: 38 }}>
                    {pkg.desc}
                  </p>
                )}
                <div style={{ height: 1, background: colors.border, margin: '20px 0', opacity: 0.6 }} />
                
                {/* Features & Excludes list */}
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 32, padding: 0 }}>
                  {(pkg.features || []).map((f, j) => (
                    <li key={j} style={{ display: 'flex', gap: 10, fontSize: 13, color: colors.muted, alignItems: 'flex-start' }}>
                      <span style={{ color: colors.green, flexShrink: 0, fontWeight: 'bold' }}>✓</span>{f}
                    </li>
                  ))}
                  {(pkg.notIncluded || []).map((f, j) => (
                    <li key={j} style={{ display: 'flex', gap: 10, fontSize: 13, color: colors.muted, alignItems: 'flex-start', opacity: 0.4 }}>
                      <span style={{ color: '#ef4444', flexShrink: 0, fontWeight: 'bold' }}>✗</span>
                      <span style={{ textDecoration: 'line-through' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => scrollTo('contact')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '14px',
                    textAlign: 'center',
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    border: `1px solid ${isFeatured ? colors.cyan : colors.border}`,
                    background: isFeatured ? colors.cyan : 'transparent',
                    color: isFeatured ? '#050810' : colors.text,
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    borderRadius: 6,
                  }}
                >
                  {pkg.price.toLowerCase().includes('custom') ? 'Request Quote →' : 'Get Started →'}
                </button>
              </div>
            );
          })}
        </div>

      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}
