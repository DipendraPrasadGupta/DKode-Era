'use client';

import { useState } from 'react';
import { ThemeColors } from '@/lib/styles';
import { quoteItems } from '@/lib/data';

interface QuoteCalculatorProps {
  colors: ThemeColors;
  t: any;
  quoteOpen: boolean;
  setQuoteOpen: (open: boolean) => void;
  scrollTo: (id: string) => void;
}

export default function QuoteCalculator({
  colors,
  t,
  quoteOpen,
  setQuoteOpen,
  scrollTo,
}: QuoteCalculatorProps) {
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({});

  const quoteTotal = Object.entries(selectedServices)
    .filter(([, v]) => v)
    .reduce((sum, [k]) => {
      const item = quoteItems.find(i => i.id === k);
      return sum + (item?.price || 0);
    }, 0);

  if (!quoteOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={() => setQuoteOpen(false)}
    >
      <div
        style={{
          background: colors.bg === '#050810' ? '#0d1425' : '#ffffff',
          border: `1px solid ${colors.border}`,
          width: '100%',
          maxWidth: 560,
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '40px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800 }}>
              {t.quoteTitle}
            </div>
            <div style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>
              {t.quoteSub}
            </div>
          </div>
          <button
            onClick={() => setQuoteOpen(false)}
            style={{
              background: 'none',
              border: `1px solid ${colors.border}`,
              color: colors.muted,
              width: 32,
              height: 32,
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {quoteItems.map(item => (
            <label
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                border: `1px solid ${selectedServices[item.id] ? colors.cyan : colors.border}`,
                background: selectedServices[item.id] ? `rgba(0,212,255,0.05)` : colors.surface,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="checkbox"
                  checked={!!selectedServices[item.id]}
                  onChange={e => setSelectedServices(s => ({ ...s, [item.id]: e.target.checked }))}
                  style={{
                    accentColor: colors.cyan,
                    width: 16,
                    height: 16,
                  }}
                />
                <span style={{ fontSize: 14, color: colors.text }}>
                  {item.label}
                </span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: colors.cyan }}>
                Rs. {item.price.toLocaleString()}
              </span>
            </label>
          ))}
        </div>
        <div style={{ borderTop: `2px solid ${colors.cyan}`, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div
              style={{
                fontSize: 12,
                color: colors.muted,
                fontFamily: "'JetBrains Mono',monospace",
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Estimated Total
            </div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 36,
                fontWeight: 800,
                color: colors.cyan,
              }}
            >
              Rs. {quoteTotal.toLocaleString()}
            </div>
          </div>
          {quoteTotal > 0 && (
            <div style={{ fontSize: 12, color: colors.green, fontFamily: "'JetBrains Mono',monospace" }}>
              + 30 days free support
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setQuoteOpen(false);
            scrollTo('contact');
          }}
          style={{
            width: '100%',
            justifyContent: 'center',
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
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          Get This Quote Officially →
        </button>
      </div>
    </div>
  );
}
