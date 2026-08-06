'use client';

import { useState, useEffect } from 'react';
import { ThemeColors } from '@/lib/styles';

interface FAQSectionProps {
  colors: ThemeColors;
  t: any;
}

export default function FAQSection({ colors, t }: FAQSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/faqs')
      .then(res => res.json())
      .then(data => setFaqs(data))
      .catch(err => console.error('Error fetching faqs:', err));
  }, []);

  return (
    <section id="faq" style={{ background: colors.bg2, position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)' }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.3em', color: colors.cyan, textTransform: 'uppercase', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 1, background: colors.cyan }} />
          {t.faqEye}
        </div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(34px,5vw,54px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16 }}>
          {t.faqTitle}
        </h2>
        <div style={{ maxWidth: 780 }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${colors.border}`, overflow: 'hidden' }}>
              <div
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  padding: '22px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 17,
                  fontWeight: 600,
                  color: openFaq === i ? colors.cyan : colors.text,
                  transition: 'color 0.2s',
                }}
              >
                {f.question}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    border: `1px solid ${openFaq === i ? colors.cyan : colors.border}`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: openFaq === i ? colors.cyan : colors.muted,
                    transition: 'all 0.3s',
                    transform: openFaq === i ? 'rotate(45deg)' : 'none',
                    background: openFaq === i ? colors.cyan : 'transparent',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: openFaq === i ? '#050810' : colors.muted }}>+</span>
                </div>
              </div>
              <div
                style={{
                  maxHeight: openFaq === i ? 200 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.4s ease',
                  fontSize: 14,
                  color: colors.muted,
                  lineHeight: 1.8,
                  paddingBottom: openFaq === i ? 24 : 0,
                }}
              >
                {f.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
