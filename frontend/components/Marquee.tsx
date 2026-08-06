'use client';

import { ThemeColors } from '@/lib/styles';

interface MarqueeProps {
  colors: ThemeColors;
}

export default function Marquee({ colors }: MarqueeProps) {
  const items = [
    'Web Development', 'Mobile Apps', 'Hotel Management', 'Digital Marketing',
    'UI/UX Design', 'SaaS Products', 'E-Commerce', 'GharSewa Platform',
    "Nepal's #1 IT Partner",
  ];

  return (
    <div
      style={{
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
        background: colors.surface,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        padding: '14px 0',
        position: 'relative',
        zIndex: 1,
        marginTop: 0,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          gap: 56,
          animation: 'marquee 28s linear infinite',
        }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 11,
              letterSpacing: '0.2em',
              color: colors.muted,
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 16,
              flexShrink: 0,
            }}
          >
            {item} <span style={{ color: colors.cyan, fontSize: 6 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
