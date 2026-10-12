'use client';

import React from 'react';
import { ThemeColors } from '@/lib/styles';

interface TechStackSectionProps {
  colors: ThemeColors;
}

interface TechItem {
  name: string;
  category: string;
  brandColor: string;
  icon: React.ReactNode;
}

// ── Official Crisp Vector SVG Icons ──
const ICONS = {
  React: (
    <svg viewBox="-11.5 -10.23 23 20.46" width="22" height="22">
      <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  ),
  Nextjs: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.823 18.067L10.32 8.448v7.419H8.88V8.133h1.44l7.503 9.934zM13.68 8.133h1.44v5.334h-1.44z" />
    </svg>
  ),
  TypeScript: (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <rect width="24" height="24" rx="4" fill="#3178C6" />
      <path
        d="M14.7 13.5c-.3-.2-.7-.4-1.2-.5-.4-.1-.7-.3-.9-.4-.2-.2-.3-.4-.3-.7 0-.3.1-.5.3-.7.2-.2.6-.3 1-.3.4 0 .8.1 1.1.3.3.2.5.4.6.7l1.5-.9c-.3-.5-.7-.8-1.2-1.1-.5-.2-1.2-.3-1.9-.3-.8 0-1.5.2-2.1.6-.6.4-.8 1-.8 1.8 0 .5.1.9.4 1.3.3.3.7.6 1.2.8.4.1.8.3 1.1.4.3.1.5.3.6.5.1.2.2.4.2.7 0 .4-.1.7-.4.9-.3.2-.7.3-1.2.3-.6 0-1.1-.1-1.5-.4-.4-.3-.7-.7-.9-1.2l-1.5.8c.3.7.8 1.3 1.4 1.7.6.4 1.5.6 2.4.6.9 0 1.7-.2 2.3-.6.6-.4 1-.9 1-1.7 0-.6-.2-1.1-.5-1.5zM6 8.5v2.2h2.5V20H11V10.7h2.5V8.5H6z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  Nodejs: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#5FA04E">
      <path d="M12 1.5L2.5 7v10L12 22.5l9.5-5.5V7L12 1.5zm6.5 13.8L12 19.2l-6.5-3.9V8.7L12 4.8l6.5 3.9v6.6z" />
      <circle cx="12" cy="12" r="3" fill="#5FA04E" />
    </svg>
  ),
  Python: (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path
        d="M11.9 2C8.6 2 6.8 3.5 6.8 5.6v2.3h5.3v.8H4.6C2.5 8.7 1 10.4 1 13.5c0 3.2 1.8 4.7 4.5 4.7h2.4v-2.3c0-1.8 1.5-3.2 3.3-3.2h5.3c1.5 0 2.7-1.2 2.7-2.7V5.6c0-2.1-1.8-3.6-7.3-3.6zm-1.8 1.6c.5 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .5-1 1-1z"
        fill="#387EB8"
      />
      <path
        d="M12.1 22c3.3 0 5.1-1.5 5.1-3.6v-2.3h-5.3v-.8h7.5c2.1 0 3.6-1.7 3.6-4.8 0-3.2-1.8-4.7-4.5-4.7h-2.4v2.3c0 1.8-1.5 3.2-3.3 3.2H7.5c-1.5 0-2.7 1.2-2.7 2.7v4.4c0 2.1 1.8 3.6 7.3 3.6zm1.8-1.6c-.5 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.5 1-1 1z"
        fill="#FFE052"
      />
    </svg>
  ),
  AWS: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#FF9900">
      <path d="M6.2 10.6c-.1-.7-.3-1.6-.7-2.1-.6-.9-1.6-1.2-2.3-.9-.6.2-.9.8-.9 1.6 0 1.3 1.1 2.3 2.9 2.5v-1.1zm2.3 2.8c-.3.4-.6.6-1 .8-.5.2-1.1.3-1.7.3-1.4 0-2.6-.5-3.4-1.3-.8-.8-1.2-2-1.2-3.3 0-1.3.5-2.5 1.4-3.3C3.5 5.8 4.7 5.3 6.1 5.3c.7 0 1.4.1 2 .4.6.3 1 .6 1.3 1.1V5.5h2.1v7.6c0 .7 0 1.4.1 2.1H9.6l-.1-1.6c-.3.3-.6.6-1 .8zm14.3 4.2c-3.1 2.3-7.2 3.6-11.7 3.6-3.7 0-7.2-.9-10.1-2.6-.3-.2-.3-.5-.1-.7.2-.2.5-.2.8-.1 2.7 1.5 5.9 2.4 9.4 2.4 4.1 0 7.8-1.2 10.7-3.3.3-.2.7-.1.9.2.1.2 0 .4-.1.5zm-5.7-9.5c0-.9-.3-1.6-.8-2.2-.6-.6-1.4-1-2.5-1-1 0-1.8.3-2.5 1-.6.6-.9 1.4-.9 2.3v6.7h2.2v-6.3c0-.6.1-1.1.4-1.4.3-.3.8-.5 1.3-.5.6 0 1 .2 1.3.5.3.3.5.8.5 1.4v6.3h2.2l-.2-6.8z" />
    </svg>
  ),
  Docker: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#2496ED">
      <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185zm-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.186.185.186zm0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186zm-2.954 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H8.075a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186zm5.908 0h2.119a.186.186 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.119a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186zm-8.862 2.714h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186H5.121a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185zm2.954 0h2.119a.186.186 0 00.185-.185V9.006a.185.185 0 00-.185-.186H8.075a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185zm2.954 0h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185zm11.233.774c-.388-.235-1.579-.345-2.613-.082-.19-.523-.538-.962-.977-1.282l-.442-.323-.334.43c-.413.535-.615 1.25-.615 2.118 0 .426.059.867.18 1.309-.347.195-.899.414-1.636.414H1.385a.72.72 0 00-.71.59C.207 19.344 2.87 21.5 6.64 21.5c4.767 0 8.528-2.628 10.385-7.79 1.458.077 3.328-.358 3.96-1.554.086-.164.086-.345.008-.506z" />
    </svg>
  ),
  PostgreSQL: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#336791">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16.93V14h3v-2h-3V9h4V7h-4V4.07c3.95.49 7 3.85 7 7.93s-3.05 7.44-7 7.93zM4 12c0-4.08 3.05-7.44 7-7.93V19.93C7.05 19.44 4 16.08 4 12z" />
    </svg>
  ),
  MongoDB: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#47A248">
      <path d="M12 0c-.3 0-.6.2-.8.5C10.1 2.2 4.5 9.7 4.5 15.6c0 4.1 3.4 7.4 7.5 7.4s7.5-3.3 7.5-7.4c0-5.9-5.6-13.4-6.7-15.1-.2-.3-.5-.5-.8-.5zm0 2.7c.6 1 4.5 7.4 4.5 12.9 0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5C7.5 10.1 11.4 3.7 12 2.7z" />
    </svg>
  ),
  GraphQL: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#E10098">
      <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2zm0 2.3L5.34 8.16v7.68L12 19.7l6.66-3.86V8.16L12 4.3zm0 3.7a4 4 0 110 8 4 4 0 010-8z" />
    </svg>
  ),
  TailwindCSS: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#06B6D4">
      <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.975 12 6.001 12z" />
    </svg>
  ),
  Figma: (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M8 12a4 4 0 100-8H12v8H8z" fill="#F24E1E" />
      <path d="M12 4h4a4 4 0 010 8h-4V4z" fill="#FF7262" />
      <path d="M12 12h4a4 4 0 010 8h-4v-8z" fill="#1ABCFE" />
      <path d="M8 20a4 4 0 004-4v-4H8a4 4 0 000 8z" fill="#0ACF83" />
      <circle cx="12" cy="12" r="4" fill="#A259FF" />
    </svg>
  ),
  Git: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#F05032">
      <path d="M23.546 10.93L13.067.452a1.5 1.5 0 00-2.126 0L8.808 2.585l3.52 3.52a1.782 1.782 0 012.247 2.259l3.388 3.388a1.783 1.783 0 11-1.077 1.077l-3.155-3.155a1.784 1.784 0 01-1.859-.413 1.784 1.784 0 01-.413-1.859l-3.388-3.388L.452 10.93a1.5 1.5 0 000 2.126l10.479 10.478a1.5 1.5 0 002.126 0l10.489-10.478a1.5 1.5 0 000-2.126z" />
    </svg>
  ),
  Kubernetes: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#326CE5">
      <path d="M12 1.6l8.8 5.1v10.6L12 22.4l-8.8-5.1V6.7L12 1.6zm0 2.3L5.2 7.8v8.4L12 20.1l6.8-3.9V7.8L12 3.9zm0 3.1l4 2.3v4.6l-4 2.3-4-2.3V9.3l4-2.3z" />
    </svg>
  ),
  Redis: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#DC382D">
      <path d="M12 2L2 7l10 5 10-5-10-5zm0 7.8L4.4 7 12 3.2 19.6 7 12 9.8zM2 12l10 5 10-5-2-1-8 4-8-4-2 1zm0 5l10 5 10-5-2-1-8 4-8-4-2 1z" />
    </svg>
  ),
  Flutter: (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M14.314 0L2.3 12 6 15.7 21.686 0h-7.372zm0 14.314L8.3 20.328 11.972 24l9.714-9.686h-7.372z" fill="#02569B" />
      <path d="M11.972 12l-3.672 3.672L11.972 19.344 15.644 15.672 11.972 12z" fill="#0175C2" />
    </svg>
  ),
};

const TECH_STACK: TechItem[] = [
  { name: 'React', category: 'Frontend', brandColor: '#61DAFB', icon: ICONS.React },
  { name: 'Next.js', category: 'Full-Stack', brandColor: '#00d4ff', icon: ICONS.Nextjs },
  { name: 'TypeScript', category: 'Language', brandColor: '#3178C6', icon: ICONS.TypeScript },
  { name: 'Node.js', category: 'Backend', brandColor: '#5FA04E', icon: ICONS.Nodejs },
  { name: 'Python', category: 'AI & Data', brandColor: '#387EB8', icon: ICONS.Python },
  { name: 'AWS Cloud', category: 'Cloud', brandColor: '#FF9900', icon: ICONS.AWS },
  { name: 'Docker', category: 'Containers', brandColor: '#2496ED', icon: ICONS.Docker },
  { name: 'PostgreSQL', category: 'Database', brandColor: '#336791', icon: ICONS.PostgreSQL },
  { name: 'MongoDB', category: 'NoSQL', brandColor: '#47A248', icon: ICONS.MongoDB },
  { name: 'GraphQL', category: 'API Layer', brandColor: '#E10098', icon: ICONS.GraphQL },
  { name: 'Tailwind CSS', category: 'Styling', brandColor: '#06B6D4', icon: ICONS.TailwindCSS },
  { name: 'Figma', category: 'UI/UX Design', brandColor: '#F24E1E', icon: ICONS.Figma },
  { name: 'Git & GitHub', category: 'Version Control', brandColor: '#F05032', icon: ICONS.Git },
  { name: 'Kubernetes', category: 'Orchestration', brandColor: '#326CE5', icon: ICONS.Kubernetes },
  { name: 'Redis Cache', category: 'In-Memory DB', brandColor: '#DC382D', icon: ICONS.Redis },
  { name: 'Flutter', category: 'Mobile Apps', brandColor: '#02569B', icon: ICONS.Flutter },
];

const ROW1 = TECH_STACK.slice(0, 8);
const ROW2 = TECH_STACK.slice(8);

export default function TechStackSection({ colors }: TechStackSectionProps) {
  const isDark = colors.bg !== '#fafafa';

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
          animation: marquee-left 28s linear infinite;
        }

        .marquee-track-right {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: marquee-right 30s linear infinite;
        }

        .marquee-wrapper:hover .marquee-track-left,
        .marquee-wrapper:hover .marquee-track-right {
          animation-play-state: paused;
        }

        .tech-marquee-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          border-radius: 14px;
          background: ${
            isDark
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(20, 24, 39, 0.4) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.75) 100%)'
          };
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
          backdrop-filter: blur(16px);
          font-family: "'Outfit', sans-serif";
          font-size: 14px;
          font-weight: 600;
          color: ${colors.text};
          white-space: nowrap;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          user-select: none;
        }

        .tech-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: ${isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'};
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'};
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .tech-marquee-badge:hover {
          transform: translateY(-4px) scale(1.02);
          border-color: var(--hover-brand, ${colors.cyan});
          box-shadow: 0 10px 28px -4px var(--hover-brand-glow, rgba(6, 182, 212, 0.35));
        }

        .tech-marquee-badge:hover .tech-icon-container {
          transform: scale(1.1);
          background: ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'};
        }
      `}</style>

      {/* Header Container */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(64px, 8vw, 100px) clamp(20px, 5vw, 60px) 44px' }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.22em',
            color: colors.cyan,
            textTransform: 'uppercase',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontWeight: 700,
          }}
        >
          <div style={{ width: 28, height: 1, background: colors.cyan }} />
          Enterprise Engineering
        </div>

        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(34px, 4.8vw, 54px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 16,
            color: colors.text,
          }}
        >
          Our <span style={{ color: colors.cyan }}>Tech Stack.</span>
        </h2>

        <p style={{ fontSize: 'clamp(15px, 1.1vw, 17px)', color: colors.muted, maxWidth: 580, lineHeight: 1.75, margin: 0 }}>
          Modern, battle-tested technologies and high-scale cloud architecture adapted for mission-critical digital performance.
        </p>
      </div>

      {/* Dual Row Marquee with Real SVG Icons */}
      <div
        className="marquee-wrapper"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          paddingBottom: 'clamp(64px, 8vw, 100px)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Soft edge gradient fades */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: 'clamp(60px, 10vw, 140px)',
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
            width: 'clamp(60px, 10vw, 140px)',
            background: `linear-gradient(270deg, ${colors.bg}, transparent)`,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* Row 1: Scrolling Left */}
        <div className="marquee-track-left">
          {[...ROW1, ...ROW1, ...ROW1, ...ROW1].map((item, idx) => (
            <div
              key={`row1-${idx}`}
              className="tech-marquee-badge"
              style={
                {
                  '--hover-brand': item.brandColor,
                  '--hover-brand-glow': `${item.brandColor}55`,
                } as any
              }
            >
              <div className="tech-icon-container">{item.icon}</div>
              <span style={{ letterSpacing: '-0.01em' }}>{item.name}</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  color: item.brandColor,
                  background: `${item.brandColor}14`,
                  border: `1px solid ${item.brandColor}33`,
                  padding: '3px 8px',
                  borderRadius: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
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
            <div
              key={`row2-${idx}`}
              className="tech-marquee-badge"
              style={
                {
                  '--hover-brand': item.brandColor,
                  '--hover-brand-glow': `${item.brandColor}55`,
                } as any
              }
            >
              <div className="tech-icon-container">{item.icon}</div>
              <span style={{ letterSpacing: '-0.01em' }}>{item.name}</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  color: item.brandColor,
                  background: `${item.brandColor}14`,
                  border: `1px solid ${item.brandColor}33`,
                  padding: '3px 8px',
                  borderRadius: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
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
