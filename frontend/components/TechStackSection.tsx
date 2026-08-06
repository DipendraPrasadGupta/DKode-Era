'use client';

import { ThemeColors } from '@/lib/styles';

interface TechStackSectionProps {
  colors: ThemeColors;
}

interface TechItem {
  name: string;
  category: string;
  icon: string;
}

const TECH_STACK: TechItem[] = [
  { name: 'React', category: 'Frontend', icon: '⚛️' },
  { name: 'Next.js', category: 'Frontend', icon: '▲' },
  { name: 'TypeScript', category: 'Frontend', icon: '🟦' },
  { name: 'Node.js', category: 'Backend', icon: '🟢' },
  { name: 'Python', category: 'Backend', icon: '🐍' },
  { name: 'AWS', category: 'Cloud', icon: '☁️' },
  { name: 'Docker', category: 'DevOps', icon: '🐳' },
  { name: 'PostgreSQL', category: 'Database', icon: '🐘' },
  { name: 'MongoDB', category: 'Database', icon: '🍃' },
  { name: 'GraphQL', category: 'Backend', icon: '📐' },
  { name: 'Tailwind CSS', category: 'Frontend', icon: '🎨' },
  { name: 'Figma', category: 'Design', icon: '🖌️' },
  { name: 'Git', category: 'Tooling', icon: '🐙' },
  { name: 'Kubernetes', category: 'DevOps', icon: '☸️' },
  { name: 'Redis', category: 'Database', icon: '🔴' },
  { name: 'Flutter', category: 'Mobile', icon: '💙' },
];

const ROW1 = TECH_STACK.slice(0, 8);
const ROW2 = TECH_STACK.slice(8);

export default function TechStackSection({ colors }: TechStackSectionProps) {
  return (
    <section id="technology" style={{ background: colors.bg, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }

        .marquee-track-left {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: marquee-left 24s linear infinite;
        }

        .marquee-track-right {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: marquee-right 26s linear infinite;
        }

        .marquee-wrapper:hover .marquee-track-left,
        .marquee-wrapper:hover .marquee-track-right {
          animation-play-state: paused;
        }

        .tech-marquee-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 12px 22px;
          border-radius: 12px;
          background: ${colors.surface};
          border: 1px solid ${colors.border};
          font-family: "'JetBrains Mono', monospace";
          font-size: 13px;
          font-weight: 600;
          color: ${colors.text};
          white-space: nowrap;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .tech-marquee-badge:hover {
          transform: translateY(-3px) scale(1.03);
          border-color: ${colors.cyan};
          box-shadow: 0 8px 24px rgba(6, 182, 212, 0.2);
        }
      `}</style>

      {/* Header Container */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 60px 40px' }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 11,
            letterSpacing: '0.3em',
            color: colors.cyan,
            textTransform: 'uppercase',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ width: 28, height: 1, background: colors.cyan }} />
          Technology
        </div>

        <h2
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 'clamp(34px,5vw,54px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 16,
          }}
        >
          Our <span style={{ color: colors.cyan }}>Tech Stack.</span>
        </h2>

        <p style={{ fontSize: 16, color: colors.muted, maxWidth: 540, lineHeight: 1.8 }}>
          Modern, battle-tested technologies adapted for high-speed digital performance.
        </p>
      </div>

      {/* Dual Row Marquee Below Header */}
      <div
        className="marquee-wrapper"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          paddingBottom: 100,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Fade edges */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: 120,
            background: `linear-gradient(90deg, ${colors.bg}, transparent)`,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: 120,
            background: `linear-gradient(270deg, ${colors.bg}, transparent)`,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* Row 1: Scrolling Left */}
        <div className="marquee-track-left">
          {[...ROW1, ...ROW1, ...ROW1, ...ROW1].map((item, idx) => (
            <div key={`row1-${idx}`} className="tech-marquee-badge">
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span>{item.name}</span>
              <span
                style={{
                  fontSize: 10,
                  color: colors.cyan,
                  background: `rgba(6, 182, 212, 0.08)`,
                  border: `1px solid rgba(6, 182, 212, 0.2)`,
                  padding: '2px 8px',
                  borderRadius: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {item.category}
              </span>
            </div>
          ))}
        </div>

        {/* Row 2: Scrolling Right */}
        <div className="marquee-track-right">
          {[...ROW2, ...ROW2, ...ROW2, ...ROW2].map((item, idx) => (
            <div key={`row2-${idx}`} className="tech-marquee-badge">
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span>{item.name}</span>
              <span
                style={{
                  fontSize: 10,
                  color: colors.green,
                  background: `rgba(16, 185, 129, 0.08)`,
                  border: `1px solid rgba(16, 185, 129, 0.2)`,
                  padding: '2px 8px',
                  borderRadius: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
