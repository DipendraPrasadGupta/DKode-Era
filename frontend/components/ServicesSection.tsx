'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeColors } from '@/lib/styles';

interface ServicesSectionProps {
  colors: ThemeColors;
  lang: 'en' | 'np';
  t: any;
}

const serviceSlugMap: Record<number, string> = {
  1: 'web-development',
  2: 'mobile-apps',
  3: 'ui-ux-design',
  4: 'ai-solutions',
  5: 'cloud-devops',
  6: 'cybersecurity',
};

export default function ServicesSection({ colors, lang, t }: ServicesSectionProps) {
  const [services, setServices] = useState<any[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/services')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error('Error fetching services:', err));
  }, []);

  return (
    <section id="services" style={{ background: colors.bg2, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px ${colors.cyan}33, 0 8px 32px rgba(0,0,0,0.1); }
          50% { box-shadow: 0 0 40px ${colors.cyan}66, 0 8px 32px rgba(0,0,0,0.2); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-border {
          0%, 100% { border-color: ${colors.border}; }
          50% { border-color: ${colors.cyan}66; }
        }

        @keyframes rotate-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .service-container {
          animation: slideUp 0.6s ease-out forwards;
        }

        .service-card {
          position: relative;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
          border-radius: 12px;
          group: card;
        }

        .service-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 1.5px;
          background: linear-gradient(135deg, ${colors.cyan}33, ${colors.green}33);
          background-clip: padding-box;
          border: 1.5px solid transparent;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }

        .service-card:hover::before {
          opacity: 1;
        }

        .service-card:hover {
          transform: translateY(-16px) scale(1.02);
          box-shadow: 
            0 25px 50px ${colors.cyan}22,
            0 25px 50px rgba(0,0,0,0.2),
            inset 0 1px 1px ${colors.border};
        }

        .service-icon {
          transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
          display: inline-block;
          filter: drop-shadow(0 0 8px ${colors.cyan}33);
        }

        .service-card:hover .service-icon {
          transform: scale(1.25) rotate(8deg);
          filter: drop-shadow(0 0 16px ${colors.cyan}66);
        }

        .service-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 24px;
          font-family: "'JetBrains Mono',monospace";
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: 2px solid ${colors.cyan};
          color: ${colors.cyan};
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 20px ${colors.cyan}00;
        }

        .service-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, ${colors.cyan}22, transparent);
          transition: left 0.6s ease;
          z-index: 0;
        }

        .service-btn::after {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(90deg, ${colors.cyan}, ${colors.green}, ${colors.cyan});
          background-size: 200% 100%;
          border-radius: 6px;
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: -1;
          animation: rotate-gradient 3s linear infinite;
        }

        .service-btn:hover::before {
          left: 100%;
        }

        .service-btn:hover {
          color: ${colors.bg};
          background: ${colors.cyan};
          box-shadow: 0 0 30px ${colors.cyan}88;
          transform: translateX(4px);
        }

        .service-btn:active {
          transform: translateX(2px) scale(0.98);
        }

        .service-top-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, ${colors.cyan}, ${colors.green}, ${colors.gold});
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.5s cubic-bezier(0.23, 1, 0.320, 1);
          border-radius: 12px 12px 0 0;
        }

        .service-card:hover .service-top-bar {
          transform: scaleX(1);
        }

        .service-accent {
          position: absolute;
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
        }

        .service-accent-top {
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle at 100% 0%, ${colors.cyan}33, transparent 70%);
          border-radius: 0 0 200px 0;
        }

        .service-accent-bottom {
          bottom: -50px;
          left: -50px;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle at 0% 100%, ${colors.green}22, transparent 70%);
          border-radius: 50%;
        }

        .service-card:hover .service-accent {
          opacity: 1;
        }

        .tag-enhanced {
          display: inline-block;
          padding: 6px 14px;
          font-family: "'JetBrains Mono',monospace";
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1.5px solid ${colors.border};
          color: ${colors.muted};
          border-radius: 6px;
          background: linear-gradient(135deg, ${colors.surface}dd, ${colors.surface2}aa);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
          cursor: default;
          position: relative;
          overflow: hidden;
        }

        .tag-enhanced::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, ${colors.cyan}22, ${colors.green}11);
          opacity: 0;
          transition: opacity 0.4s ease;
          border-radius: 6px;
        }

        .service-card:hover .tag-enhanced {
          border-color: ${colors.cyan};
          color: ${colors.cyan};
          box-shadow: 0 4px 12px ${colors.cyan}22;
        }

        .service-card:hover .tag-enhanced::before {
          opacity: 1;
        }

        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, ${colors.border}, transparent);
          margin: 60px 0;
        }

        .service-price {
          font-family: "'JetBrains Mono',monospace";
          font-size: 13px;
          color: ${colors.cyan};
          font-weight: 700;
          letter-spacing: 0.05em;
          transition: all 0.4s ease;
        }

        .service-card:hover .service-price {
          text-shadow: 0 0 10px ${colors.cyan}66;
        }

        h3 {
          background: linear-gradient(135deg, ${colors.text}, ${colors.cyan});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: all 0.4s ease;
        }

        .service-card:hover h3 {
          text-shadow: 0 0 20px ${colors.cyan}33;
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 60px' }}>
        {/* Section Header */}
        <div style={{ marginBottom: 60, animation: 'slideUp 0.8s ease-out' }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, letterSpacing: '0.3em', color: colors.cyan, textTransform: 'uppercase', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 2, background: `linear-gradient(90deg, ${colors.cyan}, transparent)`, borderRadius: 1 }} />
            <span style={{ fontWeight: 600, letterSpacing: '0.15em' }}>✦ {t.svcEye}</span>
            <div style={{ width: 40, height: 2, background: `linear-gradient(90deg, transparent, ${colors.cyan})`, borderRadius: 1 }} />
          </div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(38px,6vw,64px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20, background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.cyan} 50%, ${colors.green} 100%)`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 200%', animation: 'rotate-gradient 8s ease infinite' }}>
            {t.svcTitle}
          </h2>
          <p style={{ fontSize: 17, color: colors.muted, maxWidth: 580, lineHeight: 1.9, fontWeight: 500 }}>
            {t.svcSub}
          </p>
        </div>

        {/* Services Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 28 }}>
          {services.map((s, i) => {
            const slug = serviceSlugMap[parseInt(s.num)];
            return (
              <div
                key={i}
                className="service-card service-container"
                style={{
                  background: `linear-gradient(135deg, ${colors.surface}ee 0%, ${colors.surface2}cc 100%)`,
                  border: `1.5px solid ${colors.border}`,
                  padding: '48px 40px',
                  position: 'relative',
                  overflow: 'visible',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Animated Top Bar */}
                <div className="service-top-bar" />
                
                {/* Accent Elements */}
                <div className="service-accent service-accent-top" />
                <div className="service-accent service-accent-bottom" />

                <div>
                  {/* Service Number */}
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, letterSpacing: '0.25em', color: colors.cyan, marginBottom: 28, fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: colors.cyan }} />
                    SVC.{s.num.toString().padStart(2, '0')}
                  </div>

                  {/* Icon */}
                  <div className="service-icon" style={{ fontSize: 72, marginBottom: 28, display: 'inline-block', lineHeight: 1 }}>
                    {s.icon}
                  </div>

                  {/* Title */}
                  <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>
                    {lang === 'en' ? s.title : s.titleNp}
                  </h3>

                  {/* Description */}
                  <p style={{ fontSize: 15, color: colors.muted, lineHeight: 1.85, marginBottom: 28, fontWeight: 500 }}>
                    {s.desc}
                  </p>
                </div>

                {/* View Details Button */}
                <Link href={`/pages/services/${slug}`} style={{ textDecoration: 'none', display: 'block', marginTop: 12 }}>
                  <button className="service-btn" style={{ width: '100%', position: 'relative', zIndex: 10 }}>
                    Explore Service
                    <span style={{ fontSize: 14, fontWeight: 700 }}>→</span>
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
