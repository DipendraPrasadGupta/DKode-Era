'use client';

import { useState, useEffect, useRef } from 'react';
import { getServices } from '@/lib/api/services';
import { pageTokens as tk } from '@/lib/pageTokens';

const colorMap: Record<string, string> = {
  '💼': tk.cyan,
  '📱': tk.purple,
  '🏢': tk.gold,
  '📊': tk.green,
  '🎨': tk.red,
  '☁️': tk.cyan,
};

interface Service {
  id: number;
  num: string;
  title: string;
  desc: string;
  icon: string;
  price: string;
  tags: string[];
  pricing: any[];
  slug: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [activeService, setActiveService] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectService = (i: number, scroll = false) => {
    setActiveService(i);
    if (scroll) {
      requestAnimationFrame(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  useEffect(() => {
    getServices()
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) {
          setError('No services available');
          setServices([]);
        } else {
          const transformed = data.map((service: any, index: number) => {
            const tags = typeof service.tags === 'string' ? JSON.parse(service.tags) : service.tags || [];
            const pricing = typeof service.pricing === 'string' ? JSON.parse(service.pricing) : service.pricing || [];

            let priceDisplay = 'Contact us';
            if (pricing.length > 0) {
              const prices = pricing.map((p: any) => p.price).filter(Boolean);
              if (prices.length > 0) {
                priceDisplay = `From ${prices[0]}`;
              }
            }

            return {
              id: service.id,
              num: `0${index + 1}`,
              title: service.title,
              desc: service.desc,
              icon: service.icon || '💼',
              price: priceDisplay,
              tags: tags,
              pricing: pricing,
              slug: service.title.toLowerCase().replace(/\s+/g, '-'),
            };
          });
          setServices(transformed);
          setError(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading services:', err);
        setError('Failed to load services. Please try again.');
        setServices([]);
        setLoading(false);
      });
  }, []);

  const bgBase = tk.bg || '#050810';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgBase, color: tk.textDim }}>
        <style>{loadingStyles}</style>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ borderTopColor: tk.cyan }} />
          <p style={{ fontFamily: tk.fontBody, letterSpacing: '0.04em' }}>Loading services...</p>
        </div>
      </div>
    );
  }

  if (error || services.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgBase, color: tk.textDim, padding: 20 }}>
        <style>{loadingStyles}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden="true">⚠️</div>
          <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 24, marginBottom: 8, color: tk.text }}>{error || 'No services available'}</h2>
          <p style={{ marginBottom: 24 }}>Please check back soon or contact us for assistance.</p>
          <a href="/pages/contact" className="btn-primary">Contact Us →</a>
        </div>
      </div>
    );
  }

  const svc = services[activeService];
  const svcColor = colorMap[svc.icon] || tk.cyan;

  return (
    <>
      <style>{pageStyles}</style>

      {/* Hero */}
      <section
        style={{
          background: `radial-gradient(ellipse 900px 600px at 15% 10%, rgba(0,212,255,0.12), transparent 60%),
                       radial-gradient(ellipse 800px 700px at 90% 30%, rgba(168,85,247,0.1), transparent 60%),
                       ${bgBase}`,
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 20px 80px',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: `1px solid ${tk.border}`,
        }}
      >
        <div className="dot-grid" aria-hidden="true" />
        <div className="orb orb-cyan" aria-hidden="true" />
        <div className="orb orb-purple" aria-hidden="true" />

        <div className="fade-up" style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-block',
              padding: '8px 18px',
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.25)',
              borderRadius: 20,
              color: tk.cyan,
              fontSize: 12,
              fontFamily: tk.fontMono,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 28,
            }}
          >
            ◈ Complete Digital Suite
          </div>
          <h1
            style={{
              fontFamily: tk.fontDisplay,
              fontSize: 'clamp(40px, 7vw, 76px)',
              fontWeight: 900,
              color: tk.text,
              marginBottom: 24,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}
          >
            Digital Services Built<br />
            <span
              style={{
                background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              for Scaling in Nepal.
            </span>
          </h1>
          <p style={{ fontSize: 18, color: tk.textMuted, marginBottom: 56, lineHeight: 1.8, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
            We bridge high-end engineering with local market optimization. From robust websites and mobile apps to smart workflows, delivered on time.
          </p>

          {/* Stats Lineup */}
          <div className="hero-stats-lineup">
            {[
              ['25+', 'Products Shipped'],
              ['18+', 'Local Businesses'],
              ['6', 'Expert Categories'],
              ['98%', 'Client Satisfaction']
            ].map(([value, label], idx) => (
              <div key={idx} className="hero-stat-card">
                <div className="stat-val">{value}</div>
                <div className="stat-lbl">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Service Portal / Interactive Panel */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,40px)', background: bgBase }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Tabs header */}
          <div className="tabs-bar">
            {services.map((s, i) => {
              const c = colorMap[s.icon] || tk.cyan;
              const isActive = activeService === i;
              return (
                <button
                  key={s.id}
                  onClick={() => selectService(i)}
                  data-active={isActive}
                  aria-pressed={isActive}
                  className="filter-btn"
                  style={{
                    background: isActive ? c : 'transparent',
                    color: isActive ? bgBase : c,
                    border: `1.5px solid ${c}`,
                    '--tint': `${c}12`,
                  } as React.CSSProperties}
                >
                  <span style={{ marginRight: 6 }}>{s.icon}</span>
                  {s.title.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {svc && (
            <div
              key={svc.id}
              ref={panelRef}
              className="fade-up service-showcase-panel"
              style={{ '--accent': svcColor, '--accent-glow': `${svcColor}25`, scrollMarginTop: 100 } as React.CSSProperties}
            >
              <div className="showcase-grid">
                
                {/* Left side: Premium graphic and price badge */}
                <div className="showcase-graphic-col">
                  <div className="glow-portal">
                    <div className="portal-ring portal-ring-1" />
                    <div className="portal-ring portal-ring-2" />
                    <div className="portal-core">
                      <span className="portal-icon-main">{svc.icon}</span>
                    </div>
                  </div>

                  <div className="showcase-price-badge">
                    <div className="price-tag-sub">Starting Rate</div>
                    <div className="price-tag-main">{svc.price}</div>
                  </div>
                </div>

                {/* Right side: Detailed specs */}
                <div className="showcase-details-col">
                  <div className="showcase-category-header">
                    <span className="category-num">{svc.num}</span>
                    <span className="category-divider">/</span>
                    <span className="category-label">Service Core</span>
                  </div>
                  <h2 className="showcase-title">{svc.title}</h2>
                  <p className="showcase-description">{svc.desc}</p>
                  
                  {svc.tags.length > 0 && (
                    <div className="showcase-tech-section">
                      <div className="tech-section-title">Standard Deployment Stacks</div>
                      <div className="tech-pills-list">
                        {svc.tags.map((tag: string, i: number) => (
                          <span key={i} className="showcase-tech-pill" style={{ color: svcColor, borderColor: `${svcColor}40`, background: `${svcColor}12` }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="showcase-actions">
                    <a href={`/pages/services/${svc.slug}`} className="showcase-btn-primary" style={{ background: svcColor, color: bgBase }}>
                      View Complete Specifications →
                    </a>
                    <a href="/pages/contact" className="showcase-btn-secondary" style={{ color: svcColor, borderColor: svcColor }}>
                      Book Consultation
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* All services lineup / Full grid view */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,40px)', background: 'rgba(13,20,37,0.3)', borderTop: `1px solid ${tk.border}`, borderBottom: `1px solid ${tk.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, color: tk.cyan, fontFamily: tk.fontMono, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14 }}>
              FULL CAPABILITIES
            </div>
            <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: tk.text }}>Explore All Specializations</h2>
          </div>

          <div className="premium-services-grid">
            {services.map((s, i) => {
              const c = colorMap[s.icon] || tk.cyan;
              const isActive = activeService === i;
              return (
                <div
                  key={s.id}
                  className={isActive ? 'premium-service-card active' : 'premium-service-card'}
                  onClick={() => selectService(i, true)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={`View details for ${s.title}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectService(i, true); } }}
                  style={{ '--glow': c, borderColor: isActive ? `${c}80` : tk.border } as React.CSSProperties}
                >
                  {isActive && (
                    <span className="selected-card-badge" style={{ background: c, color: bgBase }} aria-hidden="true">✓</span>
                  )}
                  
                  <div className="card-icon-frame" style={{ background: `${c}14`, color: c }}>
                    {s.icon}
                  </div>
                  
                  <div className="card-svc-num" style={{ color: c }}>
                    SVC.{s.num}
                  </div>

                  <h3 className="card-svc-title">{s.title}</h3>
                  <p className="card-svc-desc">{s.desc}</p>
                  
                  <div className="card-svc-price" style={{ color: c }}>{s.price}</div>

                  {s.tags.length > 0 && (
                    <div className="card-tags-row">
                      {s.tags.slice(0, 3).map((tag: string, j: number) => (
                        <span key={j} className="card-tech-badge" style={{ color: c, borderColor: `${c}25`, background: `${c}0a` }}>
                          {tag}
                        </span>
                      ))}
                      {s.tags.length > 3 && (
                        <span className="card-tech-badge-more" style={{ color: c }}>
                          +{s.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="card-interactive-footer">
                    <span className="interactive-text" style={{ color: c }}>Select Category</span>
                    <span className="interactive-arrow" style={{ color: c }}>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section
        style={{
          padding: 'clamp(80px,10vw,120px) 20px',
          textAlign: 'center',
          background: `radial-gradient(ellipse 800px 500px at 50% 0%, rgba(0,212,255,0.06), transparent 70%), ${bgBase}`,
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 900, color: tk.text, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Have a Specific Project in Mind?
          </h2>
          <p style={{ fontSize: 17, color: tk.textMuted, marginBottom: 44, lineHeight: 1.8, maxWidth: 580, margin: '0 auto 44px' }}>
            We offer custom system design, architecture planning, and consulting in Butwal. Talk to our technical team today.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/pages/contact" className="cta-btn-primary">Book Consultation →</a>
            <a href="tel:+9779807544395" className="cta-btn-secondary">Call Technical Lead</a>
          </div>
        </div>
      </section>
    </>
  );
}

const loadingStyles = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spinner {
    width: 54px; height: 54px;
    border: 4px solid rgba(0,212,255,0.12);
    border-top: 4px solid;
    border-radius: 50%;
    animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    margin: 0 auto 24px;
  }
  .btn-primary {
    display: inline-block;
    padding: 13px 28px;
    background: #00d4ff;
    color: #050810;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 700;
    font-size: 14px;
    font-family: ${tk.fontBody};
    box-shadow: 0 4px 20px rgba(0,212,255,0.25);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,212,255,0.4); }
`;

const pageStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes drift {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(25px, -20px); }
  }
  @keyframes rotPortal {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes rotPortalRev {
    0% { transform: rotate(360deg); }
    100% { transform: rotate(0deg); }
  }
  .fade-up { animation: fadeUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .fade-up-delay { animation: fadeUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.15s both; }

  .dot-grid {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(0,212,255,0.25) 1px, transparent 1px);
    background-size: 36px 36px;
    -webkit-mask-image: radial-gradient(ellipse 70% 65% at 50% 30%, black 0%, transparent 75%);
    mask-image: radial-gradient(ellipse 70% 65% at 50% 30%, black 0%, transparent 75%);
    opacity: 0.4;
    pointer-events: none;
  }
  .orb {
    position: absolute; border-radius: 50%; filter: blur(65px);
    pointer-events: none; animation: drift 15s ease-in-out infinite;
  }
  .orb-cyan { width: 360px; height: 360px; top: -50px; left: -90px; background: rgba(0,212,255,0.14); }
  .orb-purple { width: 400px; height: 400px; bottom: -80px; right: -90px; background: rgba(168,85,247,0.12); animation-delay: -7s; }

  /* Hero stats */
  .hero-stats-lineup {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 24px;
    margin-top: 48px;
  }
  .hero-stat-card {
    padding: 24px;
    background: rgba(13,20,37,0.4);
    border: 1px solid ${tk.border};
    border-radius: 12px;
    text-align: center;
    transition: border-color 0.3s, background 0.3s;
  }
  .hero-stat-card:hover {
    border-color: rgba(0,212,255,0.3);
    background: rgba(13,20,37,0.6);
  }
  .stat-val {
    font-family: ${tk.fontDisplay};
    font-size: 32px;
    fontWeight: 800;
    color: #00d4ff;
    margin-bottom: 6px;
  }
  .stat-lbl {
    font-size: 13px;
    color: ${tk.textMuted};
    font-family: ${tk.fontBody};
  }

  /* Tabs Bar */
  .tabs-bar {
    display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 56px; justify-content: center;
  }
  .filter-btn {
    padding: 10px 22px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: ${tk.fontBody};
    transition: transform 0.15s ease, background 0.25s, color 0.25s, box-shadow 0.25s;
  }
  .filter-btn:not([data-active="true"]):hover { background: var(--tint) !important; }
  .filter-btn:hover { transform: translateY(-2px); }
  .filter-btn[data-active="true"] {
    box-shadow: 0 4px 16px var(--tint);
  }
  .filter-btn:focus-visible { outline: 2px solid #00d4ff; outline-offset: 2px; }

  /* Split Showcase Panel */
  .service-showcase-panel {
    background: linear-gradient(135deg, rgba(13,20,37,0.7) 0%, rgba(8,13,26,0.6) 100%);
    backdrop-filter: blur(12px);
    border: 1px solid var(--accent, rgba(0,212,255,0.25));
    border-radius: 24px;
    padding: clamp(32px, 5vw, 64px);
    position: relative;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0,0,0,0.3), inset 0 0 40px rgba(255,255,255,0.01);
  }
  .service-showcase-panel::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity: 0.6;
  }
  .showcase-grid {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 64px;
    align-items: center;
  }
  @media (max-width: 960px) {
    .showcase-grid { grid-template-columns: 1fr; gap: 48px; }
  }

  /* Showcase Graphic / Left Column */
  .showcase-graphic-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }
  .glow-portal {
    position: relative;
    width: 200px; height: 200px;
    display: flex; align-items: center; justify-content: center;
  }
  .portal-ring {
    position: absolute; inset: 0; border-radius: 50%;
    border: 1.5px dashed var(--accent);
    opacity: 0.35;
  }
  .portal-ring-1 {
    animation: rotPortal 25s linear infinite;
  }
  .portal-ring-2 {
    inset: 15px;
    border-style: double;
    border-width: 3px;
    animation: rotPortalRev 18s linear infinite;
    opacity: 0.2;
  }
  .portal-core {
    width: 130px; height: 130px; border-radius: 50%;
    background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
    border: 1px solid var(--accent);
    box-shadow: 0 0 30px var(--accent-glow);
    display: flex; align-items: center; justify-content: center;
    position: relative; zIndex: 1;
  }
  .portal-icon-main {
    font-size: 64px;
    filter: drop-shadow(0 0 12px var(--accent));
  }
  .showcase-price-badge {
    text-align: center;
    padding: 16px 28px;
    background: rgba(8,13,26,0.8);
    border: 1px solid ${tk.border};
    border-radius: 14px;
    min-width: 200px;
    box-shadow: 0 10px 24px rgba(0,0,0,0.2);
  }
  .price-tag-sub {
    font-size: 11px;
    color: ${tk.textDim};
    font-family: ${tk.fontMono};
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }
  .price-tag-main {
    font-size: 22px;
    font-weight: 800;
    font-family: ${tk.fontDisplay};
    color: var(--accent);
  }

  /* Showcase Content / Right Column */
  .showcase-category-header {
    display: flex; align-items: center; gap: 8px;
    font-family: ${tk.fontMono};
    font-size: 12px; font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .category-divider { opacity: 0.4; }
  .showcase-title {
    font-family: ${tk.fontDisplay};
    font-size: clamp(28px, 4vw, 40px);
    fontWeight: 800;
    color: ${tk.text};
    margin-bottom: 18px;
    line-height: 1.2;
  }
  .showcase-description {
    font-size: 16px; color: ${tk.textMuted};
    line-height: 1.85; margin-bottom: 36px;
  }
  .showcase-tech-section {
    margin-bottom: 36px;
  }
  .tech-section-title {
    font-size: 12px; color: ${tk.textDim};
    font-family: ${tk.fontMono};
    text-transform: uppercase; letter-spacing: 0.1em;
    margin-bottom: 14px;
  }
  .tech-pills-list {
    display: flex; flex-wrap: wrap; gap: 8px;
  }
  .showcase-tech-pill {
    display: inline-block; padding: 5px 14px; border-radius: 8px;
    font-size: 12px; font-weight: 600; border: 1.5px solid;
    transition: transform 0.2s, filter 0.2s;
  }
  .showcase-tech-pill:hover {
    transform: translateY(-2px);
    filter: brightness(1.2);
  }

  .showcase-actions {
    display: flex; gap: 16px; flex-wrap: wrap;
  }
  .showcase-btn-primary, .showcase-btn-secondary {
    padding: 14px 28px; border-radius: 10px; text-decoration: none;
    font-weight: 700; font-size: 14px; font-family: ${tk.fontBody};
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s, color 0.2s;
    display: inline-block;
  }
  .showcase-btn-secondary { background: transparent; border: 2px solid; }
  .showcase-btn-primary:hover {
    transform: translateY(-2.5px);
    box-shadow: 0 8px 24px var(--accent-glow);
  }
  .showcase-btn-secondary:hover {
    transform: translateY(-2.5px);
    background: var(--accent-glow);
  }

  /* All Services Premium Grid */
  .premium-services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 28px;
  }
  .premium-service-card {
    background: rgba(13,20,37,0.5);
    border: 1px solid ${tk.border};
    border-radius: 16px;
    padding: 36px 32px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s, border-color 0.3s;
  }
  .premium-service-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: var(--glow); transform: scaleX(0); transform-origin: left;
    transition: transform 0.3s ease;
  }
  .premium-service-card:hover::before, .premium-service-card.active::before { transform: scaleX(1); }
  .premium-service-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 48px rgba(0,0,0,0.35);
  }
  .premium-service-card.active {
    box-shadow: 0 20px 48px rgba(0,0,0,0.4);
    background: rgba(13,20,37,0.7);
  }
  .card-icon-frame {
    width: 60px; height: 60px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; margin-bottom: 20px;
    border: 1px solid rgba(255,255,255,0.04);
  }
  .card-svc-num {
    font-size: 11px; font-family: ${tk.fontMono}; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 10px;
  }
  .card-svc-title {
    font-family: ${tk.fontDisplay}; font-size: 20px; font-weight: 800;
    color: ${tk.text}; margin-bottom: 10px;
  }
  .card-svc-desc {
    font-size: 13.5px; color: ${tk.textDim}; line-height: 1.7;
    margin-bottom: 24px; flex: 1;
  }
  .card-svc-price {
    font-size: 15px; font-weight: 700; font-family: ${tk.fontMono};
    margin-bottom: 20px;
  }
  .card-tags-row {
    display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 24px;
    border-top: 1px solid rgba(255,255,255,0.04); padding-top: 16px;
  }
  .card-tech-badge {
    display: inline-block; padding: 4px 10px; border-radius: 6px;
    font-size: 11px; font-weight: 600; border: 1px solid;
  }
  .card-tech-badge-more {
    font-size: 11px; font-family: ${tk.fontMono}; font-weight: 700;
    align-self: center; margin-left: 4px;
  }
  .selected-card-badge {
    position: absolute; top: 16px; right: 16px;
    width: 24px; height: 24px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    animation: fadeUp 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  /* Card footer reveal on hover */
  .card-interactive-footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.04);
    padding-top: 14px; opacity: 0.6;
    transition: opacity 0.3s, transform 0.3s;
  }
  .premium-service-card:hover .card-interactive-footer {
    opacity: 1;
  }
  .interactive-text { font-size: 12px; font-weight: 600; font-family: ${tk.fontMono}; text-transform: uppercase; letter-spacing: 0.05em; }
  .interactive-arrow { font-size: 14px; transition: transform 0.3s; }
  .premium-service-card:hover .interactive-arrow {
    transform: translateX(4px);
  }

  /* CTA Buttons */
  .cta-btn-primary, .cta-btn-secondary {
    padding: 15px 34px; border-radius: 8px; text-decoration: none;
    font-weight: 700; font-size: 15px; font-family: ${tk.fontBody};
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s, color 0.2s;
    display: inline-block;
  }
  .cta-btn-primary {
    background: ${tk.cyan};
    color: #050810;
    box-shadow: 0 6px 24px rgba(0,212,255,0.3);
  }
  .cta-btn-secondary {
    background: transparent;
    color: ${tk.cyan};
    border: 2px solid ${tk.cyan};
  }
  .cta-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 32px rgba(0,212,255,0.45);
  }
  .cta-btn-secondary:hover {
    transform: translateY(-2px);
    background: rgba(0,212,255,0.08);
  }

  @media (prefers-reduced-motion: reduce) {
    .fade-up, .fade-up-delay, .orb, .spinner, .selected-card-badge, .portal-ring-1, .portal-ring-2 { animation: none !important; }
    .premium-service-card:hover, .filter-btn:hover, .showcase-btn-primary:hover, .showcase-btn-secondary:hover, .cta-btn-primary:hover, .cta-btn-secondary:hover {
      transform: none !important;
    }
  }
`;