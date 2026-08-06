'use client';

import { ThemeColors } from '@/lib/styles';

interface ProcessSectionProps {
  colors: ThemeColors;
}

export default function ProcessSection({ colors }: ProcessSectionProps) {
  const steps = [
    { n: '01', title: 'Free Consult', desc: 'Meet, understand your goals, assess needs. Zero charge.', badge: '1 Hour · Free' },
    { n: '02', title: 'Proposal', desc: 'Detailed written quote within 24 hours. No hidden fees.', badge: '24 Hours · Free' },
    { n: '03', title: 'Sign & Begin', desc: 'Sign agreement, pay 50% advance. Start same day.', badge: 'Same Day' },
    { n: '04', title: 'Build & Review', desc: 'Build in phases with WhatsApp updates. You review each stage.', badge: '7–21 Days' },
    { n: '05', title: 'Launch & Support', desc: 'Go live, get trained, 30 days free support. Balance on delivery.', badge: '30-Day Support' },
  ];

  return (
    <section style={{ background: colors.bg2, position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 60px' }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.3em', color: colors.cyan, textTransform: 'uppercase', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 1, background: colors.cyan }} />
          How We Work
        </div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(34px,5vw,54px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16 }}>
          From Idea to Launch — <span style={{ color: colors.cyan }}>5 Simple Steps.</span>
        </h2>
        <p style={{ fontSize: 16, color: colors.muted, maxWidth: 540, lineHeight: 1.8, marginBottom: 64 }}>
          A clear, transparent process so you always know what's happening with your project.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 24, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, ${colors.cyan}, transparent)` }} />
          {steps.map((step, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 16px' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  border: `1px solid ${colors.cyan}`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 13,
                  color: colors.cyan,
                  margin: '0 auto 24px',
                  background: colors.bg2,
                  position: 'relative',
                  zIndex: 1,
                  transition: 'all 0.3s',
                }}
              >
                {step.n}
              </div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 12, color: colors.muted, lineHeight: 1.6, marginBottom: 8 }}>
                {step.desc}
              </p>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: colors.gold, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {step.badge}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
