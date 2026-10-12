'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ThemeColors } from '@/lib/styles';

interface ProcessSectionProps {
  colors: ThemeColors;
}

interface StepItem {
  n: string;
  phase: string;
  title: string;
  badge: string;
  desc: string;
  deliverables: string[];
  gradient: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  icon: React.ReactNode;
}

export default function ProcessSection({ colors }: ProcessSectionProps) {
  const isDark = colors.bg !== '#fafafa';
  const trackRef = useRef<HTMLDivElement>(null);

  const [activeStep, setActiveStep] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isStickyActive, setIsStickyActive] = useState<boolean>(false);

  const steps: StepItem[] = [
    {
      n: '01',
      phase: 'Discovery',
      title: 'Free Consult',
      badge: '1 Hour · 100% Free',
      desc: 'Meet our senior engineers, analyze business goals, and assess technical architecture with zero financial obligation.',
      deliverables: ['Tech Feasibility Study', 'Architecture Advisory', 'Scope Definition'],
      gradient: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)',
      primaryColor: '#00F2FE',
      secondaryColor: '#4FACFE',
      glowColor: 'rgba(0, 242, 254, 0.45)',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      ),
    },
    {
      n: '02',
      phase: 'Architecture',
      title: 'Proposal & Quote',
      badge: 'Within 24 Hours',
      desc: 'Comprehensive itemized scope of work, sprint milestones, tech stack blueprint, and guaranteed fixed pricing.',
      deliverables: ['Itemized Deliverables SOW', 'Fixed-Price Blueprint', 'Milestone Roadmaps'],
      gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      primaryColor: '#6366F1',
      secondaryColor: '#8B5CF6',
      glowColor: 'rgba(99, 102, 241, 0.45)',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      n: '03',
      phase: 'Commitment',
      title: 'Sign & Kickoff',
      badge: 'Same Day Onboard',
      desc: 'Sign mutual NDA and contract agreement, initiate 50% milestone advance, and get assigned your dedicated agile squad.',
      deliverables: ['Mutual NDA & Agreement', 'Private WhatsApp/Slack', 'Git Repo & Board Setup'],
      gradient: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
      primaryColor: '#A855F7',
      secondaryColor: '#EC4899',
      glowColor: 'rgba(168, 85, 247, 0.45)',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
    {
      n: '04',
      phase: 'Execution',
      title: 'Build & Review',
      badge: '7–21 Days Sprints',
      desc: 'Agile sprints with live staging deployments. Receive direct WhatsApp video/screen demos and test every iteration.',
      deliverables: ['Bi-Weekly Live Demos', 'Interactive Staging URL', 'Direct WhatsApp Feedback'],
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #FF6B00 100%)',
      primaryColor: '#F59E0B',
      secondaryColor: '#FF6B00',
      glowColor: 'rgba(245, 158, 11, 0.45)',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="14" y1="4" x2="10" y2="20" />
        </svg>
      ),
    },
    {
      n: '05',
      phase: 'Delivery',
      title: 'Launch & Support',
      badge: '30-Day Free Care',
      desc: 'Zero-downtime production launch, team training video walk-throughs, and 30 days of complimentary maintenance support.',
      deliverables: ['Zero-Downtime Live Deploy', 'Admin Hands-on Training', '30-Day Bug-Free Warranty'],
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      glowColor: 'rgba(16, 185, 129, 0.45)',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      ),
    },
  ];

  // ── Precision Scroll-Driven Pinned Sticky Timeline Tracker ──
  useEffect(() => {
    const handleScroll = () => {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const totalScrollDistance = rect.height - window.innerHeight;

      if (totalScrollDistance <= 0) return;

      // Scrolled distance within the outer track
      const scrolledWithin = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolledWithin / totalScrollDistance));

      setScrollProgress(progress);
      setIsStickyActive(rect.top <= 10 && rect.bottom >= window.innerHeight - 10);

      // Divide scroll progress cleanly across the 5 steps:
      // 0.00 - 0.20 -> Step 0 (Phase 01)
      // 0.20 - 0.40 -> Step 1 (Phase 02)
      // 0.40 - 0.60 -> Step 2 (Phase 03)
      // 0.60 - 0.80 -> Step 3 (Phase 04)
      // 0.80 - 1.00 -> Step 4 (Phase 05)
      const calculatedStep = Math.min(4, Math.floor(progress * 5));
      setActiveStep(calculatedStep);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Jump to specific step by scrolling to its proportional offset
  const scrollToStep = (index: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const trackTop = rect.top + scrollTop;
    const totalScrollDistance = rect.height - window.innerHeight;
    const targetOffset = trackTop + (index / 4.5) * totalScrollDistance;

    window.scrollTo({
      top: targetOffset + 10,
      behavior: 'smooth',
    });
  };

  return (
    // ── Outer Pinned Scroll Track (300vh on Desktop, sticky inside) ──
    <section
      id="process"
      ref={trackRef}
      style={{
        position: 'relative',
        zIndex: 5,
        // Height allows user to scroll through all 5 phases while pinned on screen
        minHeight: '280vh',
        background: isDark ? '#0a0a0f' : '#f8fafc',
      }}
    >
      <style>{`
        /* ── Breathing Radar Pulse on Active Node ── */
        @keyframes radar-pulse {
          0% {
            transform: scale(0.96);
            box-shadow: 0 0 0 0 var(--pulse-color);
          }
          70% {
            transform: scale(1.06);
            box-shadow: 0 0 0 16px rgba(0, 0, 0, 0);
          }
          100% {
            transform: scale(0.96);
            box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
          }
        }

        /* ── Energy Flow Particle ── */
        @keyframes laser-particle-drift {
          0% { transform: scale(0.8); opacity: 0.7; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0.7; }
        }

        .radar-active {
          animation: radar-pulse 2s infinite;
        }

        .energy-particle {
          animation: laser-particle-drift 1.6s ease-in-out infinite;
        }

        .process-sticky-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      background 0.4s ease,
                      opacity 0.4s ease;
          will-change: transform, box-shadow;
        }

        .process-sticky-card:hover {
          transform: translateY(-8px) scale(1.02) !important;
        }

        @media (max-width: 1024px) {
          #process {
            min-height: auto !important;
          }
          .process-sticky-viewport {
            position: relative !important;
            height: auto !important;
            padding: 60px 0 !important;
          }
          .process-pipeline-svg {
            display: none !important;
          }
          .process-cards-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .process-sticky-card {
            min-height: auto !important;
          }
        }
      `}</style>

      {/* ── Sticky Viewport Window (Pinned to Screen while scrolling) ── */}
      <div
        className="process-sticky-viewport"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: 'clamp(50px, 7vh, 70px) 0 clamp(20px, 3vh, 30px)',
          background: isDark
            ? 'radial-gradient(ellipse 90% 60% at 50% 20%, rgba(14, 165, 233, 0.12), transparent 70%), #0a0a0f'
            : 'radial-gradient(ellipse 90% 60% at 50% 20%, rgba(14, 165, 233, 0.06), transparent 70%), #f8fafc',
        }}
      >
        {/* Dynamic Ambient Color Halo tracking current active phase */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            maxWidth: 1100,
            height: 380,
            background: `radial-gradient(circle, ${steps[activeStep].glowColor} 0%, rgba(6, 182, 212, 0.04) 55%, transparent 80%)`,
            filter: 'blur(90px)',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'background 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '0 clamp(16px, 3.5vw, 40px)', position: 'relative', zIndex: 2 }}>
          
          {/* Header Row: Title + Live Scroll Progress Meter */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 'clamp(20px, 3vh, 32px)',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 14px',
                  borderRadius: 24,
                  background: isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.08)',
                  border: `1px solid ${isDark ? 'rgba(6, 182, 212, 0.25)' : 'rgba(6, 182, 212, 0.2)'}`,
                  color: '#06b6d4',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#06b6d4',
                    display: 'inline-block',
                    boxShadow: '0 0 8px #06b6d4',
                  }}
                />
                How We Work · Scroll Controlled
              </div>

              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 'clamp(26px, 3.6vw, 44px)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.025em',
                  color: colors.text,
                  margin: 0,
                }}
              >
                From Idea to Launch —{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 35%, #A855F7 70%, #F59E0B 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                  }}
                >
                  5 Simple Steps.
                </span>
              </h2>
            </div>

            {/* Live Progress Odometer HUD */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                padding: '8px 16px',
                borderRadius: 16,
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                backdropFilter: 'blur(16px)',
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Scroll Milestone
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: steps[activeStep].primaryColor }}>
                  Phase 0{activeStep + 1} / 05
                </div>
              </div>

              {/* Circular Gauge */}
              <div style={{ position: 'relative', width: 36, height: 36 }}>
                <svg viewBox="0 0 36 36" width="36" height="36" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="14" fill="none" stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke={steps[activeStep].primaryColor}
                    strokeWidth="3"
                    strokeDasharray="88"
                    strokeDashoffset={88 - (scrollProgress * 88)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.2s ease, stroke 0.4s ease' }}
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    fontWeight: 800,
                    color: colors.text,
                  }}
                >
                  {Math.round(scrollProgress * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* ── High-Tech Connecting Laser Bus (Scroll Driven) ── */}
          <div style={{ position: 'relative' }}>
            
            {/* Desktop Horizontal Laser Pipeline */}
            <div
              className="process-pipeline-svg"
              style={{
                position: 'absolute',
                top: 48,
                left: '7%',
                right: '7%',
                height: 3,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            >
              {/* Base Track */}
              <div
                style={{
                  width: '100%',
                  height: 3,
                  borderRadius: 3,
                  background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                }}
              />

              {/* Filled Laser Beam (Grows proportionately to scroll progress) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: 3,
                  borderRadius: 3,
                  width: `${Math.min(100, Math.max(8, scrollProgress * 100))}%`,
                  background: 'linear-gradient(90deg, #00F2FE 0%, #6366F1 30%, #A855F7 60%, #F59E0B 85%, #10B981 100%)',
                  boxShadow: `0 0 16px ${steps[activeStep].glowColor}`,
                  transition: 'width 0.25s ease-out, box-shadow 0.4s ease',
                }}
              />

              {/* Glowing Pulse Head Particle */}
              <div
                className="energy-particle"
                style={{
                  position: 'absolute',
                  top: -5,
                  left: `calc(${Math.min(100, Math.max(0, scrollProgress * 100))}% - 6px)`,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: steps[activeStep].primaryColor,
                  boxShadow: `0 0 20px ${steps[activeStep].primaryColor}, 0 0 6px #ffffff`,
                  transition: 'left 0.25s ease-out, background 0.4s ease',
                }}
              />
            </div>

            {/* ── The 5 Phase Cards Grid ── */}
            <div
              className="process-cards-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 14,
                position: 'relative',
                zIndex: 2,
              }}
            >
              {steps.map((step, idx) => {
                const isCurrent = activeStep === idx;
                const isPast = activeStep > idx;

                return (
                  <div
                    key={idx}
                    className="process-sticky-card"
                    onClick={() => scrollToStep(idx)}
                    style={{
                      position: 'relative',
                      borderRadius: 18,
                      padding: '22px 16px',
                      background: isCurrent
                        ? isDark
                          ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)'
                          : 'linear-gradient(180deg, #ffffff 0%, rgba(248, 250, 252, 0.98) 100%)'
                        : isPast
                        ? isDark
                          ? 'rgba(17, 24, 39, 0.65)'
                          : 'rgba(255, 255, 255, 0.85)'
                        : isDark
                        ? 'rgba(15, 23, 42, 0.35)'
                        : 'rgba(248, 250, 252, 0.6)',
                      border: isCurrent
                        ? `1.5px solid ${step.primaryColor}`
                        : isPast
                        ? `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)'}`
                        : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
                      boxShadow: isCurrent
                        ? `0 18px 45px -10px ${step.glowColor}, 0 0 0 1px ${step.primaryColor}33`
                        : isPast
                        ? isDark
                          ? '0 6px 20px -8px rgba(0, 0, 0, 0.4)'
                          : '0 6px 16px -8px rgba(0, 0, 0, 0.05)'
                        : 'none',
                      backdropFilter: 'blur(16px)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 335,
                      overflow: 'hidden',
                      transform: isCurrent ? 'translateY(-6px) scale(1.03)' : 'translateY(0px) scale(1)',
                      opacity: isCurrent ? 1 : isPast ? 0.88 : 0.55,
                    }}
                  >
                    {/* Top Laser Highlight on Current Active Card */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: isCurrent ? step.gradient : isPast ? '#10B981' : 'transparent',
                        boxShadow: isCurrent ? `0 0 16px ${step.glowColor}` : 'none',
                        transition: 'background 0.35s ease',
                      }}
                    />

                    {/* Corner Phase Badge + Completed Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: isCurrent ? step.primaryColor : isPast ? '#10B981' : colors.muted,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {isPast && <span>✓</span>}
                        Phase {step.n}
                      </span>

                      <span
                        style={{
                          fontSize: 9,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 10,
                          background: isCurrent
                            ? `${step.primaryColor}22`
                            : isPast
                            ? 'rgba(16, 185, 129, 0.12)'
                            : isDark
                            ? 'rgba(255, 255, 255, 0.04)'
                            : 'rgba(0, 0, 0, 0.04)',
                          color: isCurrent ? step.primaryColor : isPast ? '#10B981' : colors.muted,
                          border: `1px solid ${isCurrent ? step.primaryColor + '44' : isPast ? 'rgba(16, 185, 129, 0.25)' : 'transparent'}`,
                        }}
                      >
                        {isPast ? 'Completed' : step.badge}
                      </span>
                    </div>

                    {/* Central Node with Radar Pulse */}
                    <div style={{ marginBottom: 14 }}>
                      <div
                        className={isCurrent ? 'radar-active' : ''}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          margin: '0 0 14px 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isCurrent
                            ? step.gradient
                            : isPast
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)'
                            : isDark
                            ? 'rgba(255, 255, 255, 0.04)'
                            : 'rgba(0, 0, 0, 0.04)',
                          color: isCurrent ? '#ffffff' : isPast ? '#10B981' : colors.muted,
                          border: isCurrent
                            ? 'none'
                            : isPast
                            ? '1px solid rgba(16, 185, 129, 0.3)'
                            : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                          boxShadow: isCurrent ? `0 6px 20px ${step.glowColor}` : 'none',
                          transform: isCurrent ? 'scale(1.06)' : 'scale(1)',
                          transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          ['--pulse-color' as any]: step.glowColor,
                        }}
                      >
                        {step.icon}
                      </div>

                      <h3
                        style={{
                          fontFamily: "'Syne', sans-serif",
                          fontSize: 16,
                          fontWeight: 700,
                          color: isCurrent ? colors.text : isPast ? colors.text : colors.muted,
                          marginBottom: 8,
                          lineHeight: 1.25,
                        }}
                      >
                        {step.title}
                      </h3>

                      <p
                        style={{
                          fontSize: 12,
                          color: colors.muted,
                          lineHeight: 1.55,
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {step.desc}
                      </p>
                    </div>

                    {/* Micro-Deliverables Checklist */}
                    <div
                      style={{
                        borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
                        paddingTop: 12,
                        marginTop: 10,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {step.deliverables.map((item, dIdx) => (
                          <div
                            key={dIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 10.5,
                              fontFamily: "'Outfit', sans-serif",
                              color: isCurrent ? colors.text : isPast ? colors.muted : colors.muted,
                              transition: 'color 0.25s ease',
                            }}
                          >
                            <svg
                              viewBox="0 0 16 16"
                              width="12"
                              height="12"
                              fill="none"
                              stroke={isCurrent ? step.primaryColor : isPast ? '#10B981' : colors.muted}
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ flexShrink: 0 }}
                            >
                              <polyline points="3 8.5 6.5 12 13 4" />
                            </svg>
                            <span style={{ lineHeight: 1.25 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Sticky Bottom Fast-Track Footer & Downward Scroll Cue ── */}
          <div
            style={{
              marginTop: 'clamp(18px, 2.5vh, 26px)',
              padding: '12px 24px',
              borderRadius: 16,
              background: isDark
                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(241, 245, 249, 0.85) 100%)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              backdropFilter: 'blur(16px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: steps[activeStep].gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: `0 0 12px ${steps[activeStep].glowColor}`,
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                0{activeStep + 1}
              </div>
              <div style={{ fontSize: 13, color: colors.text, fontWeight: 600 }}>
                {steps[activeStep].phase}: <span style={{ color: colors.muted, fontWeight: 400 }}>{steps[activeStep].title} — {steps[activeStep].badge}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Scroll down indicator showing progress toward Client Success */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: colors.muted }}>
                <span>Scroll to complete</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'bounce 1.5s infinite' }}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
                {scrollProgress >= 0.95 && (
                  <span style={{ color: '#10B981', fontWeight: 700 }}>✓ Next: Client Success</span>
                )}
              </div>

              <a
                href="#contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)',
                  color: '#0a0a0f',
                  fontWeight: 700,
                  fontSize: 12,
                  fontFamily: "'Outfit', sans-serif",
                  textDecoration: 'none',
                  boxShadow: '0 2px 10px rgba(0, 242, 254, 0.35)',
                }}
              >
                <span>Free Consult</span>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
