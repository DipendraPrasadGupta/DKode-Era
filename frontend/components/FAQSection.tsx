'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { ThemeColors } from '@/lib/styles';
import { faqs as DEFAULT_FAQS } from '@/lib/data';

interface FAQSectionProps {
  colors: ThemeColors;
  t?: any;
}

export default function FAQSection({ colors, t }: FAQSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<any[]>(DEFAULT_FAQS);

  useEffect(() => {
    apiFetch('/api/faqs')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFaqs(data);
        } else {
          setFaqs(DEFAULT_FAQS);
        }
      })
      .catch(() => setFaqs(DEFAULT_FAQS));
  }, []);

  const eyeText = t?.faqEye || 'FAQ';
  const titleText = t?.faqTitle || 'Frequently Asked Questions';

  return (
    <section id="faq" style={{ background: colors.bg2, position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)' }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.3em', color: colors.cyan, textTransform: 'uppercase', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 1, background: colors.cyan }} />
          {eyeText}
        </div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(34px,5vw,54px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16 }}>
          {titleText}
        </h2>
        <div style={{ maxWidth: 780 }}>
          {faqs.map((f, i) => {
            const question = f.question || f.q || '';
            const answer = f.answer || f.a || '';
            const isOpen = openFaq === i;

            return (
              <div key={f.id || i} style={{ borderBottom: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                <div
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    padding: '22px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 17,
                    fontWeight: 600,
                    color: isOpen ? colors.cyan : colors.text,
                    transition: 'color 0.2s',
                  }}
                >
                  <span>{question}</span>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      border: `1px solid ${isOpen ? colors.cyan : colors.border}`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      color: isOpen ? colors.cyan : colors.muted,
                      transition: 'all 0.3s',
                      transform: isOpen ? 'rotate(45deg)' : 'none',
                      background: isOpen ? colors.cyan : 'transparent',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ color: isOpen ? '#050810' : colors.muted }}>+</span>
                  </div>
                </div>
                <div
                  style={{
                    maxHeight: isOpen ? 300 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.4s ease',
                    fontSize: 14,
                    color: colors.muted,
                    lineHeight: 1.8,
                    paddingBottom: isOpen ? 24 : 0,
                  }}
                >
                  {answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

