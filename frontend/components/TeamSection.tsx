'use client';

import { useState, useEffect } from 'react';
import { ThemeColors } from '@/lib/styles';

interface TeamSectionProps {
  colors: ThemeColors;
  t: any;
  lang: 'en' | 'np';
}

const ACCENT_COLORS = ['#06b6d4', '#a855f7', '#eab308', '#10b981', '#ef4444'];

function isPhotoUrl(s: string) {
  return s?.startsWith('http') || s?.startsWith('/uploads') || s?.startsWith('data:');
}

export default function TeamSection({ colors, t, lang }: TeamSectionProps) {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/team')
      .then(res => res.json())
      .then(data => setTeamMembers(data))
      .catch(err => console.error('Error fetching team:', err));
  }, []);

  return (
    <section id="team" style={{ background: colors.bg2, position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 60px' }}>
        
        {/* Section Header */}
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.3em', color: colors.cyan, textTransform: 'uppercase', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 1, background: colors.cyan }} />
          {t.teamEye || 'EXPERTS'}
        </div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(34px,5vw,54px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 54 }}>
          {t.teamTitle || 'Meet the Experts'}
        </h2>

        {/* Grid of Members */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {teamMembers.map((m, i) => {
            const hasPhoto = isPhotoUrl(m.icon);
            const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
            const isHovered = hoveredCard === i;

            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                className="team-card"
                style={{
                  border: `1px solid ${isHovered ? accent : colors.border}`,
                  background: colors.surface,
                  overflow: 'hidden',
                  transition: 'all 0.35s',
                  borderRadius: 12,
                  position: 'relative',
                  transform: isHovered ? 'translateY(-6px)' : 'none',
                  boxShadow: isHovered ? `0 14px 40px rgba(0,0,0,0.4), 0 0 0 1px ${accent}18` : 'none',
                }}
              >
                {/* Accent Top Border */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />

                 {/* Banner Spacer */}
                <div
                  style={{
                    height: 90,
                    background: `linear-gradient(135deg, ${accent}30 0%, ${accent}05 100%)`,
                    position: 'relative',
                  }}
                />

                {/* Circle Avatar Box */}
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    border: `3px solid ${colors.surface}`,
                    background: colors.surface,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '-60px auto 16px auto',
                    position: 'relative',
                    zIndex: 2,
                    overflow: 'hidden',
                  }}
                >
                  {hasPhoto ? (
                    <img 
                      src={m.icon} 
                      alt={m.name} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                        transition: 'transform 0.4s ease-out'
                      }} 
                    />
                  ) : (
                    <div style={{ 
                      fontSize: 54,
                      transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                      transition: 'transform 0.4s ease-out'
                    }}>
                      {m.icon || '👤'}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div style={{ padding: '0 28px 28px 28px', textAlign: 'center' }}>
                  <div style={{ 
                    fontFamily: "'JetBrains Mono',monospace", 
                    fontSize: 10, 
                    letterSpacing: '0.15em', 
                    color: accent, 
                    textTransform: 'uppercase', 
                    marginBottom: 8,
                    fontWeight: 700
                  }}>
                    {m.role}
                  </div>
                  
                  <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 10, color: '#f4f4f5' }}>
                    {m.name}
                  </h3>
                  
                  <p style={{ fontSize: 13, color: colors.muted, lineHeight: 1.7, marginBottom: 20, minHeight: 44 }}>
                    {m.desc}
                  </p>
                  
                  {/* Skill Pills */}
                  {Array.isArray(m.skills) && m.skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                      {m.skills.map((sk: string, j: number) => (
                        <span
                          key={j}
                          style={{
                            fontFamily: "'JetBrains Mono',monospace",
                            fontSize: 9.5,
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 20,
                            border: `1px solid ${accent}25`,
                            background: `${accent}0d`,
                            color: accent,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
