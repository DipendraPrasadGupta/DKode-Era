'use client';

import { ThemeColors } from '@/lib/styles';
import { useSiteSettings } from '@/lib/useSiteSettings';

interface AboutSectionProps {
  colors: ThemeColors;
  t: any;
}

export default function AboutSection({ colors, t }: AboutSectionProps) {
  const { settings } = useSiteSettings();

  const terminalLines = [
    ['$ ', 'whoami', ''],
    ['', `→ ${settings.agency_name || 'D-Kode Era'} Pvt. Ltd.`, ''],
    ['$ ', 'cat mission.txt', ''],
    ['', "→ Empowering Nepal's businesses", ''],
    ['', '→ through world-class technology', ''],
    ['$ ', 'cat location.txt', ''],
    ['', `→ ${settings.agency_address || 'Butwal-10, Rupandehi, Nepal'}`, ''],
    ['$ ', 'cat status.txt', ''],
    ['', '→ ACTIVE · HIRING · GROWING', 'green'],
  ];

  return (
    <>
    <section id="about" style={{ background: colors.bg, position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)' }}>
        <div className="about-section-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ background: colors.bg === '#050810' ? '#0a0f1e' : '#0d1225', border: `1px solid ${colors.border}`, padding: '36px 32px', fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ marginLeft: 12, color: colors.muted, fontSize: 11 }}>dkode-era ~ terminal</span>
              </div>
              {terminalLines.map(([prefix, line, color], i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 4,
                    color: color === 'green' ? colors.green : color === 'cmd' ? colors.muted : '#9dd3a8',
                  }}
                >
                  {prefix && <span style={{ color: colors.cyan }}>{prefix}</span>}
                  <span style={{ color: prefix ? '#9dd3a8' : colors.muted }}>{line}</span>
                  {i === 8 && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 8,
                        height: 14,
                        background: colors.cyan,
                        animation: 'blink 1s infinite',
                        verticalAlign: 'middle',
                        marginLeft: 4,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={{ background: colors.surface2, border: `1px solid ${colors.border}`, padding: '22px 28px', position: 'absolute', bottom: -28, right: -28, zIndex: 2 }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: colors.cyan, letterSpacing: '0.2em', marginBottom: 6 }}>
                FOUNDED
              </div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 38, fontWeight: 800, lineHeight: 1 }}>
                {settings.agency_founded || '2026'}
              </div>
              <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>{settings.agency_address ? settings.agency_address.split(',')[0] : 'Butwal'}, Nepal</div>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.3em', color: colors.cyan, textTransform: 'uppercase', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 28, height: 1, background: colors.cyan }} />
              {t.aboutEye}
            </div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(34px,5vw,54px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16 }}>
              {t.aboutTitle}
            </h2>
            <p style={{ fontSize: 15, color: colors.muted, marginBottom: 16, lineHeight: 1.8 }}>
              D-Kode Era Pvt. Ltd. is a registered IT company founded in Butwal by experienced full-stack engineers and designers. We build digital products that work for Nepal — not just copies of foreign solutions.
            </p>
            <p style={{ fontSize: 15, color: colors.muted, marginBottom: 28, lineHeight: 1.8 }}>
              We understand Nepal's payment systems (eSewa, Khalti), local address structures, Nepali language, and the Lumbini corridor's growing economy.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Registered Private Limited Company in Nepal',
                'Full-stack: Frontend, Backend, Mobile, DevOps',
                'Nepal-first: eSewa, Khalti, Sparrow SMS',
                'Face-to-face meetings available in Butwal',
                '24/7 WhatsApp support for active clients',
                '30-day free post-launch support on every project',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: colors.muted }}>
                  <span style={{ color: colors.cyan, flexShrink: 0 }}>▸</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
    <style>{`
      @media (max-width: 768px) {
        .about-section-grid {
          grid-template-columns: 1fr !important;
          gap: 56px !important;
        }
      }
    `}</style>
    </>
  );
}
