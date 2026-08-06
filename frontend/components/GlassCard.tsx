'use client';

import { ThemeColors } from '@/lib/styles';

interface GlassCardProps {
  children: React.ReactNode;
  colors: ThemeColors;
  className?: string;
}

export default function GlassCard({ children, colors, className = '' }: GlassCardProps) {
  return (
    <div
      className={className}
      style={{
        background: `linear-gradient(135deg, ${colors.surface}dd 0%, ${colors.surface2}aa 100%)`,
        border: `1.5px solid ${colors.border}`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.1), inset 0 1px 1px ${colors.border}`,
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .glass-card-shine {
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(255,255,255,0.1) 50%,
            transparent 100%
          );
          animation: shine 3s infinite;
          pointer-events: none;
        }

        @keyframes shine {
          0% { transform: rotate(0deg) translateX(-100%); }
          100% { transform: rotate(0deg) translateX(100%); }
        }
      `}</style>
      <div className="glass-card-shine" />
      {children}
    </div>
  );
}
