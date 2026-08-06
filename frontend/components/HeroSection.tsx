'use client';

import { ThemeColors } from '@/lib/styles';
import { Counters } from '@/lib/types';

interface HeroSectionProps {
  colors: ThemeColors;
  visitors: number;
  counters: Counters;
  t: any;
  scrollTo: (id: string) => void;
  setQuoteOpen: (open: boolean) => void;
}

export default function HeroSection({
  colors,
  visitors,
  counters,
  t,
  scrollTo,
  setQuoteOpen,
}: HeroSectionProps) {
  return (
    <section
      id="hero"
      style={{
        background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg2} 100%)`,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(90px, 10vh, 120px) clamp(16px, 4vw, 60px) 60px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .hero-grid {
          background-image: 
            linear-gradient(${colors.border} 1px, transparent 1px),
            linear-gradient(90deg, ${colors.border} 1px, transparent 1px);
          background-size: 60px 60px;
          opacity: 0.2;
          animation: slide-grid 20s linear infinite;
        }

        @keyframes slide-grid {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }

        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.6;
        }

        .hero-blob-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%);
          top: -200px;
          right: -150px;
          animation: float-blob-1 15s ease-in-out infinite;
        }

        .hero-blob-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(0,100,200,0.12) 0%, transparent 70%);
          bottom: -100px;
          left: -100px;
          animation: float-blob-2 20s ease-in-out infinite;
        }

        @keyframes float-blob-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 50px) scale(1.1); }
        }

        @keyframes float-blob-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, -50px) scale(1.05); }
        }

        .hero-title {
          animation: title-entrance 1s ease-out forwards;
        }

        @keyframes title-entrance {
          0% {
            opacity: 0;
            transform: translateY(40px);
            letter-spacing: 0.1em;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            letter-spacing: -0.02em;
          }
        }

        .stats-grid-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: 64px;
          padding-top: 48px;
          border-top: 1px solid ${colors.border};
          animation: fadeUp 0.8s 0.9s both;
        }

        @media (max-width: 1024px) {
          .stats-grid-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 540px) {
          .stats-grid-container {
            grid-template-columns: 1fr;
          }
        }

        .stat-card {
          position: relative;
          background: ${colors.surface};
          border: 1px solid ${colors.border};
          border-radius: 14px;
          padding: 24px 22px;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          backdrop-filter: blur(10px);
        }

        .stat-card:hover {
          transform: translateY(-6px);
          border-color: rgba(6, 182, 212, 0.45);
          box-shadow: 0 16px 36px rgba(6, 182, 212, 0.15);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, ${colors.cyan}, ${colors.green});
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }

        .stat-card:hover::before {
          opacity: 1;
        }
      `}</style>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.3,
          pointerEvents: 'none',
          animation: 'slide-grid 20s linear infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-200px',
          right: '-150px',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)`,
          pointerEvents: 'none',
          animation: 'float-blob-1 15s ease-in-out infinite',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(0,100,200,0.12) 0%, transparent 70%)`,
          pointerEvents: 'none',
          animation: 'float-blob-2 20s ease-in-out infinite',
          filter: 'blur(40px)',
        }}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: `rgba(0,229,160,0.08)`,
            border: `1px solid rgba(0,229,160,0.25)`,
            padding: '5px 14px',
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 11,
            letterSpacing: '0.15em',
            color: colors.green,
            marginBottom: 28,
            animation: 'fadeUp 0.6s 0.1s both',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              background: colors.green,
              borderRadius: '50%',
              animation: 'pulse 1.5s infinite',
            }}
          />
          🟢 {visitors} {t.visitorText}
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: `rgba(0,212,255,0.06)`,
            border: `1px solid rgba(0,212,255,0.2)`,
            padding: '6px 16px',
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 11,
            letterSpacing: '0.2em',
            color: colors.cyan,
            textTransform: 'uppercase',
            marginBottom: 32,
            marginLeft: 12,
            animation: 'fadeUp 0.6s 0.1s both',
          }}
        >
          {t.badge}
        </div>

        <h1
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 'clamp(54px,8vw,100px)',
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            marginBottom: 24,
            animation: 'fadeUp 0.8s 0.3s both',
          }}
        >
          {t.heroTitle1}
          <br />
          <span style={{ color: colors.cyan }}>{t.heroTitle2}</span>
          <br />
          <span style={{ fontSize: '0.35em', color: colors.muted, fontWeight: 600, letterSpacing: '0.02em' }}>
            {t.heroSub3}
          </span>
        </h1>

        <p
          style={{
            fontSize: 17,
            color: colors.muted,
            maxWidth: 560,
            marginBottom: 44,
            lineHeight: 1.8,
            animation: 'fadeUp 0.8s 0.5s both',
          }}
        >
          {t.heroDesc}
        </p>

        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            animation: 'fadeUp 0.8s 0.7s both',
          }}
        >
          <button
            onClick={() => scrollTo('contact')}
            style={{
              background: colors.cyan,
              color: '#050810',
              padding: '15px 36px',
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            {t.heroCta1}
          </button>
          <button
            onClick={() => scrollTo('portfolio')}
            style={{
              background: 'transparent',
              color: colors.text,
              padding: '15px 36px',
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: `1px solid ${colors.border}`,
              cursor: 'pointer',
              transition: 'all 0.25s',
            }}
          >
            {t.heroCta2}
          </button>
          <button
            onClick={() => setQuoteOpen(true)}
            style={{
              background: 'transparent',
              color: colors.gold,
              padding: '15px 36px',
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: `1px solid ${colors.gold}`,
              cursor: 'pointer',
              transition: 'all 0.25s',
            }}
          >
            💰 {t.quoteTitle}
          </button>
        </div>

        <div id="stats-section" className="stats-grid-container">
          {[
            { k: 'p', val: counters.p, unit: '+', label: t.stats[0], icon: '🚀', badge: 'On-Time' },
            { k: 'c', val: counters.c, unit: '+', label: t.stats[1], icon: '🤝', badge: 'Verified' },
            { k: 'i', val: counters.i, unit: '+', label: t.stats[2], icon: '👨‍💻', badge: 'Senior' },
            { k: 's', val: counters.s, unit: '+', label: t.stats[3], icon: '🏆', badge: 'Proven' },
          ].map((item) => (
            <div key={item.k} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: `rgba(6, 182, 212, 0.1)`,
                    border: `1px solid rgba(6, 182, 212, 0.25)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: `rgba(0, 229, 160, 0.08)`,
                    color: colors.green,
                    border: `1px solid rgba(0, 229, 160, 0.2)`,
                    letterSpacing: '0.05em',
                  }}
                >
                  {item.badge}
                </span>
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 38,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: colors.text,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 2,
                  }}
                >
                  <span
                    style={{
                      background: `linear-gradient(135deg, ${colors.text} 40%, ${colors.cyan} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {item.val}
                  </span>
                  <span style={{ color: colors.cyan, fontSize: '0.65em', fontWeight: 800 }}>{item.unit}</span>
                </div>

                <div
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 11,
                    fontWeight: 500,
                    color: colors.muted,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginTop: 8,
                  }}
                >
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
