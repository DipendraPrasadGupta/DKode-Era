'use client';

import { useState } from 'react';
import { ThemeColors } from '@/lib/styles';

interface ExitPopupProps {
  colors: ThemeColors;
  t: any;
  setExitPopup: (open: boolean) => void;
  scrollTo: (id: string) => void;
}

export default function ExitPopup({
  colors,
  t,
  setExitPopup,
  scrollTo,
}: ExitPopupProps) {
  const [copied, setCopied] = useState(false);
  const [isHoveredClose, setIsHoveredClose] = useState(false);
  const [isHoveredCta, setIsHoveredCta] = useState(false);
  const [isHoveredNo, setIsHoveredNo] = useState(false);

  const isDark = colors.bg === '#0a0a0f' || colors.bg === '#050810' || true; // Modern dark preference for popup pop

  const handleClose = () => {
    try {
      localStorage.setItem('dkode_exit_popup_dismissed', 'true');
      sessionStorage.setItem('dkode_exit_popup_dismissed', 'true');
      localStorage.setItem('seenExitPopup', 'true');
      sessionStorage.setItem('seenExitPopup', 'true');
    } catch (e) {
      // Fallback
    }
    setExitPopup(false);
  };


  const handleClaim = () => {
    handleClose();
    scrollTo('contact');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('DKODE20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(4, 6, 14, 0.82)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'modalFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleUp {
          from { opacity: 0; transform: scale(0.9) translateY(24px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 25px rgba(6, 182, 212, 0.35), inset 0 0 15px rgba(6, 182, 212, 0.15);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 45px rgba(6, 182, 212, 0.6), inset 0 0 25px rgba(6, 182, 212, 0.3);
            transform: scale(1.05);
          }
        }
        @keyframes shimmerBorder {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Main Container Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #0d1222 0%, #060914 100%)',

          border: '1.5px solid rgba(6, 182, 212, 0.35)',
          borderRadius: 28,
          width: '100%',
          maxWidth: 520,
          padding: '44px 38px',
          textAlign: 'center',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 60px rgba(6, 182, 212, 0.18)',
          position: 'relative',
          animation: 'modalScaleUp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Top Glow */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 280,
            height: 280,
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.28) 0%, rgba(0, 0, 0, 0) 70%)',
            pointerEvents: 'none',
            borderRadius: '50%',
          }}
        />

        {/* Top-Right Close Cross */}
        <button
          onClick={handleClose}
          onMouseEnter={() => setIsHoveredClose(true)}
          onMouseLeave={() => setIsHoveredClose(false)}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: isHoveredClose ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#e4e4e7',
            cursor: 'pointer',
            fontSize: 14,
            transition: 'all 0.25s ease',
            transform: isHoveredClose ? 'rotate(90deg) scale(1.1)' : 'none',
            zIndex: 10,
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Top Limited Offer Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 20,
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            marginBottom: 24,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#06b6d4',
              boxShadow: '0 0 10px #06b6d4',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              color: '#06b6d4',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            SPECIAL OFFER · 20% DISCOUNT
          </span>
        </div>

        {/* Floating Animated Gift Icon Container */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(14, 165, 233, 0.1))',
            border: '1.5px solid rgba(6, 182, 212, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 38,
            margin: '0 auto 24px',
            animation: 'pulseGlow 2.8s infinite ease-in-out',
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.3)',
          }}
        >
          🚀
        </div>

        {/* Headline */}
        <h3
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(24px, 4vw, 30px)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: 14,
            background: 'linear-gradient(135deg, #ffffff 0%, #a5f3fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          {t.exitTitle || 'Wait! Before You Go...'}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: 14.5,
            fontFamily: "'Outfit', sans-serif",
            color: 'rgba(228, 228, 231, 0.8)',
            marginBottom: 26,
            lineHeight: 1.6,
          }}
        >
          Claim a <strong style={{ color: '#06b6d4' }}>Free Technical Audit</strong> +{' '}
          <strong style={{ color: '#06b6d4' }}>20% Discount</strong> on your upcoming digital project.
        </p>

        {/* Value Perks List */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#e4e4e7' }}>
            <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
            <span>Free 30-Min Strategy & Architecture Session</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#e4e4e7' }}>
            <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
            <span>Priority Developer Assignment</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#e4e4e7' }}>
            <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
            <span>Zero Commitment Custom Proposal</span>
          </div>
        </div>

        {/* Promo Code Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px dashed rgba(6, 182, 212, 0.4)',
            borderRadius: 12,
            padding: '10px 16px',
            marginBottom: 24,
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 10, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>PROMO CODE</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
              DKODE20
            </div>
          </div>
          <button
            onClick={handleCopyCode}
            style={{
              padding: '6px 14px',
              background: copied ? '#10b981' : 'rgba(6, 182, 212, 0.2)',
              border: `1px solid ${copied ? '#10b981' : 'rgba(6, 182, 212, 0.4)'}`,
              borderRadius: 8,
              color: copied ? '#050810' : '#06b6d4',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {copied ? 'COPIED! ✓' : 'COPY CODE'}
          </button>
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={handleClaim}
          onMouseEnter={() => setIsHoveredCta(true)}
          onMouseLeave={() => setIsHoveredCta(false)}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            color: '#050810',
            padding: '16px 28px',
            fontFamily: "'Outfit', sans-serif",
            fontSize: 15,
            fontWeight: 800,
            borderRadius: 18,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 16,
            boxShadow: isHoveredCta
              ? '0 12px 35px rgba(6, 182, 212, 0.45)'
              : '0 6px 20px rgba(6, 182, 212, 0.25)',
            transform: isHoveredCta ? 'translateY(-2px) scale(1.02)' : 'none',
          }}
        >
          <span>Claim 20% Discount & Talk To Us</span>
          <span
            style={{
              transition: 'transform 0.3s ease',
              transform: isHoveredCta ? 'translateX(4px)' : 'none',
            }}
          >
            →
          </span>
        </button>

        {/* Dismiss Button */}
        <button
          onClick={handleClose}
          onMouseEnter={() => setIsHoveredNo(true)}
          onMouseLeave={() => setIsHoveredNo(false)}
          style={{
            background: 'none',
            border: 'none',
            color: isHoveredNo ? '#06b6d4' : '#71717a',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Outfit', sans-serif",
            transition: 'color 0.2s ease',
            textDecoration: isHoveredNo ? 'underline' : 'none',
          }}
        >
          No thanks, I will pay full price
        </button>
      </div>
    </div>
  );
}
