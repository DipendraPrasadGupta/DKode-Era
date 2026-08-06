'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';

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
  desc: string;
  icon: string;
  tags: string[]; // parsed
  price: string;
  pricing: PricingTier[]; // parsed
}

const TIER_COLORS = [tk.cyan, tk.purple, tk.gold, tk.green, tk.red];

const addOns = [
  { icon: '📱', name: 'React Native App', price: 'From Rs. 60,000', desc: 'Cross-platform iOS & Android app paired with your web project.' },
  { icon: '🤖', name: 'AI Chatbot Integration', price: 'From Rs. 15,000', desc: 'Custom AI assistant trained on your business data and FAQs.' },
  { icon: '🔍', name: 'Full SEO Audit + Strategy', price: 'Rs. 8,000', desc: 'Keyword research, competitor analysis, and a 3-month content roadmap.' },
  { icon: '🔒', name: 'Security Hardening', price: 'Rs. 5,000', desc: 'SSL, firewall rules, rate limiting, and vulnerability assessment.' },
  { icon: '📊', name: 'Monthly Maintenance', price: 'Rs. 3,000/mo', desc: 'Updates, backups, uptime monitoring, and priority bug fixes.' },
  { icon: '🎨', name: 'Brand Identity Pack', price: 'Rs. 12,000', desc: 'Brand identity design, logo, color palette, typography.' },
];

const faqs = [
  { q: 'Do you accept eSewa or Khalti?', a: 'Yes! We accept eSewa, Khalti, and bank transfers. We understand the Nepali payment landscape and make the process easy.' },
  { q: 'How long does delivery take?', a: 'Starter plans: 3–7 days. Professional plans: 2–3 weeks. Enterprise plans: 4–12 weeks depending on complexity.' },
  { q: 'Can I see the design before you build?', a: 'Absolutely. We share interactive Figma mockups before writing any code. You review and approve the design first.' },
  { q: 'What happens after launch?', a: 'Every pricing plan includes free support (30–60 days). After that, our monthly maintenance plan keeps everything running smoothly.' },
  { q: 'Will I own my code and domain?', a: 'Yes, 100%. You own everything — source code, database, domain. No lock-ins, ever.' },
];

export default function PricingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    fetch('http://localhost:5000/api/services')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch services');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const transformed = data.map((s: any) => ({
            id: s.id,
            title: s.title,
            desc: s.desc,
            icon: s.icon || '💼',
            tags: typeof s.tags === 'string' ? JSON.parse(s.tags) : s.tags || [],
            price: s.price,
            pricing: typeof s.pricing === 'string' ? JSON.parse(s.pricing) : s.pricing || []
          }));
          setServices(transformed);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading pricing data:', err);
        setError('Unable to load pricing options.');
        setLoading(false);
      });
  }, []);

  const currentService = services[activeTab];

  return (
    <>
      {/* Hero */}
      <section
        style={{
          background: `radial-gradient(ellipse 900px 600px at 80% 10%, rgba(245,200,66,0.14), transparent 60%),
                       radial-gradient(ellipse 800px 700px at 10% 40%, rgba(168,85,247,0.12), transparent 60%),
                       ${tk.bg || '#050810'}`,
          minHeight: '55vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 20px 60px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(245,200,66,0.28) 1px, transparent 1px)',
            backgroundSize: '34px 34px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 25%, black 0%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 25%, black 0%, transparent 75%)',
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        />
        <div aria-hidden="true" className="orb orb-gold" />
        <div aria-hidden="true" className="orb orb-purple" />

        <div className="fade-up" style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-block',
              padding: '8px 18px',
              background: 'rgba(245,200,66,0.12)',
              border: `1px solid rgba(245,200,66,0.4)`,
              borderRadius: 20,
              color: tk.gold,
              fontSize: 12,
              fontFamily: tk.fontMono,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 28,
            }}
          >
            ◇ Transparent Billing
          </div>
          <h1
            style={{
              fontFamily: tk.fontDisplay,
              fontSize: 'clamp(40px,7vw,64px)',
              fontWeight: 900,
              color: tk.text,
              lineHeight: 1.1,
              marginBottom: 24,
              letterSpacing: '-0.03em',
            }}
          >
            Subscription Tiers & plans.<br />
            <span
              style={{
                background: `linear-gradient(135deg, ${tk.purple}, ${tk.gold})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              For Every Service Scale.
            </span>
          </h1>
          <p style={{ fontSize: 17, color: tk.textMuted, maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
            Select a service category below to view and customize Starter, Professional, and Enterprise packages.
          </p>
        </div>
      </section>

      {/* Loading & Error States */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2.5px solid #27272a', borderTopColor: tk.gold, animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: tk.textDim, fontSize: 14 }}>Retrieving plans...</span>
        </div>
      )}

      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ef4444' }}>{error}</div>
      )}

      {/* Service Tabs Selection */}
      {!loading && !error && services.length > 0 && (
        <section style={{ padding: '0 20px', background: tk.bg }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="pricing-tabs-bar">
              {services.map((s, idx) => {
                const isActive = activeTab === idx;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveTab(idx)}
                    className={`pricing-tab-btn ${isActive ? 'active' : ''}`}
                  >
                    <span>{s.icon}</span> {s.title}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Pricing plans Grid */}
      {!loading && !error && currentService && (
        <section style={{ padding: '40px 20px 80px 20px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {currentService.pricing.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 20px', background: 'rgba(13,20,37,0.4)', border: `1px solid ${tk.border}`, borderRadius: 16 }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🏢</div>
                <h3 style={{ fontSize: 20, color: tk.text, fontWeight: 700, marginBottom: 8 }}>Custom Enterprise Scope</h3>
                <p style={{ color: tk.textMuted, fontSize: 15, maxWidth: 500, margin: '0 auto 24px auto', lineHeight: 1.7 }}>
                  We design customized architectures and pricing models for {currentService.title} tailored to your organization needs.
                </p>
                <Link href="/pages/contact" className="btn-gold" style={{ display: 'inline-block' }}>
                  Get Custom Estimate →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28, alignItems: 'start' }}>
                {currentService.pricing.map((plan, i) => {
                  const color = TIER_COLORS[i % TIER_COLORS.length];
                  return (
                    <div
                      key={i}
                      className={plan.highlight ? 'plan-card plan-card--highlight' : 'plan-card'}
                      style={{
                        background: plan.highlight
                          ? `linear-gradient(135deg, rgba(168,85,247,0.12), rgba(168,85,247,0.06))`
                          : 'rgba(13,20,37,0.6)',
                        border: `1px solid ${plan.highlight ? color + '50' : tk.border}`,
                        borderTop: `3px solid ${color}`,
                        boxShadow: plan.highlight ? `0 0 60px rgba(168,85,247,0.12)` : 'none',
                        '--glow': color,
                      } as React.CSSProperties}
                    >
                      {plan.highlight && (
                        <div style={{
                          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                          background: tk.purple, color: '#fff', fontSize: 10.5, fontWeight: 800,
                          fontFamily: tk.fontMono, padding: '4px 16px', borderRadius: 20,
                          letterSpacing: '0.08em', whiteSpace: 'nowrap',
                        }}>
                          ★ MOST POPULAR
                        </div>
                      )}

                      <div style={{ fontSize: 11, color: color, fontFamily: tk.fontMono, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
                        {plan.tier.toUpperCase()} TIER
                      </div>

                      <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 26, fontWeight: 800, color: tk.text, marginBottom: 8 }}>{plan.tier}</h2>
                      <div style={{ fontFamily: tk.fontDisplay, fontSize: 32, fontWeight: 900, color: color, marginBottom: 8 }}>{plan.price}</div>
                      
                      {plan.desc && (
                        <p style={{ fontSize: 13, color: tk.textMuted, lineHeight: 1.6, marginBottom: 24, minHeight: 42 }}>
                          {plan.desc}
                        </p>
                      )}

                      <div style={{ height: 1, background: `${color}20`, margin: '0 0 20px 0' }} />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 32 }}>
                        {(plan.features || []).map((f) => (
                          <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: tk.textMuted }}>
                            <span style={{ color: tk.green, flexShrink: 0, marginTop: 1, fontWeight: 'bold' }} aria-hidden="true">✓</span>
                            <span>{f}</span>
                          </div>
                        ))}
                        {(plan.notIncluded || []).map((f) => (
                          <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: tk.textDim, opacity: 0.5 }}>
                            <span style={{ color: '#ef4444', flexShrink: 0, marginTop: 1, fontWeight: 'bold' }} aria-hidden="true">✗</span>
                            <span style={{ textDecoration: 'line-through' }}>{f}</span>
                          </div>
                        ))}
                      </div>

                      <Link
                        href={`/pages/contact?service=${encodeURIComponent(currentService.title)}&plan=${encodeURIComponent(plan.tier)}`}
                        className="plan-cta"
                        style={{
                          background: plan.highlight ? tk.purple : 'transparent',
                          color: plan.highlight ? '#fff' : color,
                          border: `2px solid ${color}`,
                        }}
                      >
                        Get Started →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Add-Ons */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', background: 'rgba(13,20,37,0.4)', borderTop: `1px solid ${tk.border}`, borderBottom: `1px solid ${tk.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, color: tk.gold, fontFamily: tk.fontMono, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>POWER-UPS</div>
            <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: tk.text }}>Optional Add-Ons</h2>
            <p style={{ fontSize: 16, color: tk.textMuted, marginTop: 12, maxWidth: 540, margin: '12px auto 0' }}>
              Enhance any subscription plan with these modular services.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {addOns.map((a) => (
              <div key={a.name} className="addon-card">
                <div
                  aria-hidden="true"
                  style={{
                    fontSize: 24, width: 52, height: 52, borderRadius: 12,
                    background: 'rgba(245,200,66,0.12)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  {a.icon}
                </div>
                <div>
                  <div style={{ fontFamily: tk.fontDisplay, fontSize: 16, fontWeight: 700, color: tk.text, marginBottom: 4 }}>{a.name}</div>
                  <div style={{ fontSize: 13, color: tk.gold, fontFamily: tk.fontMono, marginBottom: 8 }}>{a.price}</div>
                  <div style={{ fontSize: 13, color: tk.textDim, lineHeight: 1.7 }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: tk.cyan, fontFamily: tk.fontMono, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>PRICING FAQ</div>
            <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: tk.text }}>Common Questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={f.q} className="faq-item" style={{ borderColor: isOpen ? tk.cyan + '55' : tk.border }}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="faq-question"
                  >
                    <span style={{ fontFamily: tk.fontDisplay, fontSize: 16, fontWeight: 700, color: tk.text, textAlign: 'left' }}>
                      {f.q}
                    </span>
                    <span className={isOpen ? 'faq-chevron faq-chevron--open' : 'faq-chevron'} aria-hidden="true">⌄</span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer" style={{ fontSize: 14, color: tk.textMuted, lineHeight: 1.8 }}>
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: 'clamp(60px,8vw,100px) 20px',
          textAlign: 'center',
          background: `radial-gradient(ellipse 700px 400px at 50% 0%, rgba(245,200,66,0.08), transparent 70%), rgba(13,20,37,0.4)`,
          borderTop: `1px solid ${tk.border}`,
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: tk.text, marginBottom: 16 }}>
            Need a custom deployment scope?
          </h2>
          <p style={{ fontSize: 16, color: tk.textMuted, marginBottom: 40, lineHeight: 1.8 }}>
            Talk to our engineering leads directly. We will recommend exactly what fits your system timeline.
          </p>
          <Link href="/pages/contact" className="btn-gold">
            Request Custom Scope →
          </Link>
        </div>
      </section>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(18px, -14px); }
        }
        @keyframes faqIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease-out both; }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          animation: drift 13s ease-in-out infinite;
        }
        .orb-gold {
          width: 340px; height: 340px;
          top: -70px; right: -70px;
          background: rgba(245,200,66,0.16);
        }
        .orb-purple {
          width: 320px; height: 320px;
          bottom: -90px; left: -90px;
          background: rgba(168,85,247,0.14);
          animation-delay: -6s;
        }

        .pricing-tabs-bar {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 24px;
          border-bottom: 1.5px solid ${tk.border};
          padding-bottom: 20px;
        }

        .pricing-tab-btn {
          padding: 10px 20px;
          background: rgba(255,255,255,0.02);
          border: 1px solid ${tk.border};
          border-radius: 30px;
          color: ${tk.textDim};
          font-size: 13.5px;
          font-weight: 600;
          font-family: ${tk.fontBody};
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .pricing-tab-btn:hover {
          background: rgba(255,255,255,0.05);
          color: ${tk.text};
          transform: translateY(-1.5px);
        }
        .pricing-tab-btn.active {
          background: ${tk.gold}14;
          border-color: ${tk.gold};
          color: ${tk.gold};
        }

        .plan-card {
          padding: 36px;
          border-radius: 16px;
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .plan-card:hover {
          transform: translateY(-6px);
        }
        .plan-card--highlight {
          transform: translateY(-8px);
        }
        .plan-card--highlight:hover {
          transform: translateY(-12px);
        }

        .plan-cta {
          display: block;
          text-align: center;
          padding: 13px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          font-family: ${tk.fontBody};
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .plan-cta:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .addon-card {
          padding: 24px;
          background: rgba(13,20,37,0.6);
          border: 1px solid ${tk.border};
          border-radius: 12px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .addon-card:hover {
          transform: translateY(-4px);
          border-color: rgba(245,200,66,0.4);
        }

        .faq-item {
          background: rgba(13,20,37,0.5);
          border: 1px solid;
          border-radius: 12px;
          transition: border-color 0.2s ease;
          overflow: hidden;
        }
        .faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 22px 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          font: inherit;
        }
        .faq-chevron {
          font-size: 20px;
          color: ${tk.cyan};
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .faq-chevron--open {
          transform: rotate(180deg);
        }
        .faq-answer {
          padding: 0 24px 22px;
          animation: faqIn 0.2s ease-out both;
        }

        .btn-gold {
          display: inline-block;
          padding: 15px 36px;
          background: ${tk.gold};
          color: #050810;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          font-family: ${tk.fontBody};
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .btn-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(245,200,66,0.3);
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-up, .orb, .faq-answer {
            animation: none !important;
          }
          .plan-card:hover, .plan-card--highlight, .plan-card--highlight:hover,
          .addon-card:hover, .plan-cta:hover, .btn-gold:hover {
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}