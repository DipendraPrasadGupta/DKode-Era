'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

const tk = {
  bg: '#050810',
  bgAlt: 'rgba(8,13,26,0.6)',
  surface: 'rgba(13,20,37,0.65)',
  text: '#e8edf5',
  textMuted: '#9ab0c8',
  textDim: '#7a8aa0',
  border: 'rgba(99,179,237,0.12)',
  borderHover: 'rgba(0,212,255,0.35)',
  cyan: '#00d4ff',
  purple: '#a855f7',
  green: '#00e5a0',
  gold: '#f5c842',
  red: '#ff6b6b',
  fontDisplay: "'Syne', sans-serif",
  fontBody: "'Outfit', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

const ACCENT_COLORS = [tk.cyan, tk.purple, tk.green, tk.gold, tk.red, '#f97316'];

interface ServiceDetailPageProps {
  service: any;
  colors: any;
  dark: boolean;
  scrollTo?: (id: string) => void;
}

export default function ServiceDetailPage({ service }: ServiceDetailPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openModal = (plan: any) => {
    setSelectedPlan(plan);
    setSubmitSuccess(null);
    setFormData({
      name: '', email: '', phone: '',
      message: `Hi, I'm interested in the ${plan.tier} plan for ${service.title}. My requirements: `,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(null);
    try {
      await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          serviceName: service.title,
          tierName: selectedPlan?.tier || '',
          price: selectedPlan?.price || '',
          userName: formData.name,
          userEmail: formData.email,
          userPhone: formData.phone,
          message: formData.message,
        }),
      });
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch {
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const features: string[] = service.features || [];
  const benefits: string[] = service.benefits || [];
  const process: any[] = service.process || [];
  const technologies: string[] = service.technologies || [];
  const pricing: any[] = service.pricing || [];
  const faqs: any[] = service.faqs || [];

  const popularIndex = Math.floor(pricing.length / 2);

  return (
    <div style={{ minHeight: '100vh', background: tk.bg, color: tk.text, fontFamily: tk.fontBody }}>
      <style>{`
        /* ── ANIMATIONS ─────────────────────────────────────── */
        @keyframes sd-fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sd-drift {
          0%,100% { transform: translate(0,0); }
          33%      { transform: translate(18px,-14px); }
          66%      { transform: translate(-10px,12px); }
        }
        @keyframes sd-glow-pulse {
          0%,100% { opacity: 0.55; }
          50%      { opacity: 0.85; }
        }
        @keyframes sd-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes sd-timeline-draw {
          from { height: 0; }
          to   { height: 100%; }
        }
        @keyframes sd-faq-open {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── GLOBAL RESETS ─────────────────────────────────── */
        .sd-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .sd-root a { color: inherit; text-decoration: none; }

        /* ── CONTAINERS ─────────────────────────────────────── */
        .sd-wrap { max-width: 1180px; margin: 0 auto; padding: 0 clamp(20px,5vw,64px); }
        .sd-section { padding: clamp(64px,8vw,100px) 0; }
        .sd-eyebrow {
          display: inline-block;
          font-family: ${tk.fontMono};
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: ${tk.cyan};
          margin-bottom: 14px;
        }
        .sd-h2 {
          font-family: ${tk.fontDisplay};
          font-size: clamp(28px,4vw,44px);
          font-weight: 800;
          color: ${tk.text};
          line-height: 1.18;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
        }

        /* ── HERO ───────────────────────────────────────────── */
        .sd-hero {
          position: relative;
          overflow: hidden;
          padding: 110px 0 80px;
          border-bottom: 1px solid ${tk.border};
        }
        .sd-hero-bg {
          position: absolute; inset: 0; pointer-events: none;
        }
        .sd-orb {
          position: absolute; border-radius: 50%; filter: blur(80px);
          animation: sd-drift 14s ease-in-out infinite;
        }
        .sd-orb-1 {
          width: 480px; height: 480px;
          top: -120px; left: -100px;
          background: rgba(0,212,255,0.13);
        }
        .sd-orb-2 {
          width: 420px; height: 420px;
          bottom: -80px; right: -80px;
          background: rgba(168,85,247,0.12);
          animation-delay: -7s;
        }
        .sd-dot-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(0,212,255,0.28) 1px, transparent 1px);
          background-size: 36px 36px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 0%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 0%, transparent 70%);
          opacity: 0.35;
        }
        .sd-hero-content { position: relative; z-index: 1; animation: sd-fadeUp 0.7s ease-out both; }

        /* ── BREADCRUMB ─────────────────────────────────────── */
        .sd-breadcrumb {
          display: flex; gap: 8px; align-items: center;
          font-family: ${tk.fontMono}; font-size: 12px;
          color: ${tk.textDim}; margin-bottom: 36px;
        }
        .sd-breadcrumb a:hover { color: ${tk.cyan}; }
        .sd-breadcrumb-sep { opacity: 0.4; }

        /* ── HERO ICON ──────────────────────────────────────── */
        .sd-hero-icon-wrap {
          position: relative; width: 84px; height: 84px; margin-bottom: 28px;
        }
        .sd-hero-icon-glow {
          position: absolute; inset: -12px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,212,255,0.22) 0%, transparent 70%);
          animation: sd-glow-pulse 3s ease-in-out infinite;
        }
        .sd-hero-icon-box {
          width: 84px; height: 84px; border-radius: 20px;
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 40px; position: relative;
          box-shadow: 0 0 40px rgba(0,212,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06);
        }

        /* ── HERO TITLE ─────────────────────────────────────── */
        .sd-hero-title {
          font-family: ${tk.fontDisplay};
          font-size: clamp(40px,6vw,72px);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.03em;
          margin-bottom: 22px;
          background: linear-gradient(135deg, ${tk.text} 0%, ${tk.cyan} 60%, ${tk.purple} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sd-hero-desc {
          font-size: clamp(16px,2vw,19px);
          color: ${tk.textMuted};
          line-height: 1.85;
          max-width: 680px;
          margin-bottom: 36px;
        }

        /* ── HERO STATS ─────────────────────────────────────── */
        .sd-hero-stats {
          display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 44px;
        }
        .sd-stat-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 18px;
          background: rgba(0,212,255,0.05);
          border: 1px solid rgba(0,212,255,0.18);
          border-radius: 8px;
          font-family: ${tk.fontMono}; font-size: 12px; color: ${tk.textMuted};
        }
        .sd-stat-chip strong { color: ${tk.text}; font-size: 14px; }

        /* ── CTA BUTTONS ─────────────────────────────────────── */
        .sd-btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 13px 28px;
          background: linear-gradient(135deg, ${tk.cyan}, #0099ff);
          color: #050810; font-weight: 700; font-size: 14px;
          font-family: ${tk.fontBody};
          border: none; border-radius: 10px; cursor: pointer;
          letter-spacing: 0.03em;
          box-shadow: 0 8px 32px rgba(0,212,255,0.3);
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          text-decoration: none;
        }
        .sd-btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 40px rgba(0,212,255,0.45);
        }
        .sd-btn-outline {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 13px 28px;
          background: transparent;
          color: ${tk.cyan}; font-weight: 600; font-size: 14px;
          font-family: ${tk.fontBody};
          border: 1.5px solid rgba(0,212,255,0.35); border-radius: 10px; cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .sd-btn-outline:hover {
          background: rgba(0,212,255,0.08);
          border-color: ${tk.cyan};
          transform: translateY(-2px);
        }

        /* ── FEATURE CARDS ──────────────────────────────────── */
        .sd-feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 22px;
        }
        .sd-feature-card {
          background: rgba(13,20,37,0.65);
          border: 1px solid ${tk.border};
          border-radius: 16px;
          padding: 28px;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .sd-feature-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: var(--accent);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s ease;
        }
        .sd-feature-card:hover {
          transform: translateY(-6px);
          border-color: var(--accent-dim);
          box-shadow: 0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px var(--accent-dim);
        }
        .sd-feature-card:hover::before { transform: scaleX(1); }
        .sd-feature-icon {
          width: 52px; height: 52px; border-radius: 12px;
          background: var(--accent-bg);
          border: 1px solid var(--accent-dim);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; margin-bottom: 18px;
        }

        /* ── PROCESS TIMELINE ───────────────────────────────── */
        .sd-timeline { display: flex; flex-direction: column; gap: 0; }
        .sd-timeline-row {
          display: grid; grid-template-columns: 80px 1fr; gap: 28px;
          position: relative;
        }
        .sd-timeline-left {
          display: flex; flex-direction: column; align-items: center;
        }
        .sd-timeline-dot {
          width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, ${tk.cyan}, #0099ff);
          display: flex; align-items: center; justify-content: center;
          font-family: ${tk.fontDisplay}; font-size: 18px; font-weight: 800;
          color: #050810;
          box-shadow: 0 0 24px rgba(0,212,255,0.4);
          z-index: 1;
        }
        .sd-timeline-line {
          width: 2px; flex: 1; min-height: 48px; margin-top: 4px;
          background: linear-gradient(180deg, rgba(0,212,255,0.4), rgba(0,212,255,0.05));
        }
        .sd-timeline-content {
          padding-bottom: 48px; padding-top: 10px;
        }

        /* ── TECH PILLS ─────────────────────────────────────── */
        .sd-tech-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 16px;
          background: rgba(0,212,255,0.06);
          border: 1px solid rgba(0,212,255,0.2);
          border-radius: 30px;
          font-family: ${tk.fontMono}; font-size: 12px; color: ${tk.cyan};
          margin: 5px; cursor: default;
          transition: all 0.2s ease;
        }
        .sd-tech-pill:hover {
          background: rgba(0,212,255,0.14);
          border-color: ${tk.cyan};
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,212,255,0.18);
        }

        /* ── PRICING CARDS ──────────────────────────────────── */
        .sd-pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          align-items: start;
        }
        .sd-pricing-card {
          background: rgba(13,20,37,0.7);
          border: 1px solid ${tk.border};
          border-radius: 20px;
          padding: 36px;
          position: relative; overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .sd-pricing-card::after {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, ${tk.cyan}, ${tk.purple});
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .sd-pricing-card:hover {
          transform: translateY(-8px);
          border-color: rgba(0,212,255,0.3);
          box-shadow: 0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.1);
        }
        .sd-pricing-card:hover::after { opacity: 1; }
        .sd-pricing-card.popular {
          border-color: rgba(0,212,255,0.35);
          background: rgba(0,212,255,0.04);
          transform: scale(1.02);
        }
        .sd-pricing-card.popular::after { opacity: 1; }
        .sd-pricing-card.popular:hover { transform: scale(1.02) translateY(-8px); }
        .sd-popular-badge {
          position: absolute; top: 16px; right: 16px;
          background: linear-gradient(135deg, ${tk.cyan}, ${tk.purple});
          color: #050810; font-weight: 700; font-size: 10px;
          font-family: ${tk.fontMono}; letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 12px; border-radius: 20px;
        }
        .sd-check { color: ${tk.green}; font-size: 13px; flex-shrink: 0; }
        .sd-cross { color: ${tk.red}; font-size: 13px; flex-shrink: 0; opacity: 0.55; }

        /* ── FAQ ACCORDION ──────────────────────────────────── */
        .sd-faq-item {
          border: 1px solid ${tk.border};
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 12px;
          transition: border-color 0.2s ease;
        }
        .sd-faq-item.open { border-color: rgba(0,212,255,0.35); }
        .sd-faq-q {
          width: 100%; display: flex; align-items: center;
          justify-content: space-between; gap: 16px;
          padding: 20px 24px;
          background: rgba(13,20,37,0.65);
          border: none; cursor: pointer; text-align: left;
          font-family: ${tk.fontBody}; font-size: 15px; font-weight: 600;
          color: ${tk.text}; transition: background 0.2s ease;
        }
        .sd-faq-q:hover { background: rgba(0,212,255,0.04); }
        .sd-faq-chevron {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; color: ${tk.cyan};
          transition: transform 0.25s ease, background 0.2s ease;
        }
        .sd-faq-item.open .sd-faq-chevron {
          transform: rotate(180deg);
          background: rgba(0,212,255,0.15);
        }
        .sd-faq-a {
          padding: 0 24px 20px;
          font-size: 14px; color: ${tk.textMuted}; line-height: 1.8;
          animation: sd-faq-open 0.2s ease-out both;
        }

        /* ── MODAL ──────────────────────────────────────────── */
        .sd-modal-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(5,8,16,0.88);
          backdrop-filter: blur(14px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: sd-fadeUp 0.2s ease-out;
        }
        .sd-modal {
          width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
          background: rgba(13,20,37,0.97);
          border: 1px solid rgba(0,212,255,0.2);
          border-radius: 20px; padding: 44px 40px;
          position: relative;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.08);
          animation: sd-fadeUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .sd-modal::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, ${tk.cyan}, ${tk.purple}, transparent);
          border-radius: 20px 20px 0 0;
        }
        .sd-field {
          display: flex; flex-direction: column; gap: 6px;
        }
        .sd-label {
          font-family: ${tk.fontMono}; font-size: 11px; letter-spacing: 0.1em;
          text-transform: uppercase; color: ${tk.textDim}; font-weight: 600;
        }
        .sd-input {
          padding: 12px 16px;
          background: rgba(5,8,16,0.8);
          border: 1px solid ${tk.border};
          border-radius: 10px;
          color: ${tk.text}; font-size: 14px;
          font-family: ${tk.fontBody};
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          width: 100%;
        }
        .sd-input:focus {
          border-color: ${tk.cyan};
          box-shadow: 0 0 0 3px rgba(0,212,255,0.1);
        }
        .sd-textarea { resize: vertical; min-height: 100px; }

        /* ── CTA SECTION ─────────────────────────────────────── */
        .sd-cta-section {
          background: radial-gradient(ellipse 700px 400px at 50% 0%, rgba(0,212,255,0.07), transparent 70%);
          border-top: 1px solid ${tk.border};
          text-align: center;
        }

        /* ── RESPONSIVE ─────────────────────────────────────── */
        @media (max-width: 640px) {
          .sd-hero { padding: 90px 0 60px; }
          .sd-hero-stats { flex-direction: column; gap: 10px; }
          .sd-modal { padding: 28px 20px; }
          .sd-pricing-card.popular { transform: none; }
          .sd-pricing-card.popular:hover { transform: translateY(-8px); }
        }

        /* ── REDUCED MOTION ─────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .sd-hero-content, .sd-faq-a { animation: none !important; }
          .sd-orb { animation: none !important; }
          .sd-btn-primary:hover, .sd-btn-outline:hover,
          .sd-feature-card:hover, .sd-pricing-card:hover,
          .sd-tech-pill:hover { transform: none !important; }
        }
      `}</style>

      <div className="sd-root">

        {/* ═══════════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════════ */}
        <section className="sd-hero">
          <div className="sd-hero-bg">
            <div className="sd-dot-grid" aria-hidden="true" />
            <div className="sd-orb sd-orb-1" aria-hidden="true" />
            <div className="sd-orb sd-orb-2" aria-hidden="true" />
          </div>

          <div className="sd-wrap">
            <div className="sd-hero-content">
              {/* Breadcrumb */}
              <nav className="sd-breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span className="sd-breadcrumb-sep">›</span>
                <Link href="/pages/services">Services</Link>
                <span className="sd-breadcrumb-sep">›</span>
                <span style={{ color: tk.textMuted }}>{service.title}</span>
              </nav>

              {/* Icon */}
              <div className="sd-hero-icon-wrap">
                <div className="sd-hero-icon-glow" aria-hidden="true" />
                <div className="sd-hero-icon-box">{service.icon || '⚡'}</div>
              </div>

              {/* Title */}
              <h1 className="sd-hero-title">{service.title}</h1>

              {/* Description */}
              <p className="sd-hero-desc">
                {service.longDescription || service.shortDesc}
              </p>

              {/* Stat chips */}
              <div className="sd-hero-stats">
                {service.price && (
                  <div className="sd-stat-chip">
                    <span>💰</span>
                    <div>
                      <div style={{ fontSize: 10, color: tk.textDim, fontFamily: tk.fontMono, marginBottom: 1 }}>STARTING FROM</div>
                      <strong>{service.price}</strong>
                    </div>
                  </div>
                )}
                <div className="sd-stat-chip">
                  <span>⚡</span>
                  <div>
                    <div style={{ fontSize: 10, color: tk.textDim, fontFamily: tk.fontMono, marginBottom: 1 }}>DELIVERY</div>
                    <strong>2–8 Weeks</strong>
                  </div>
                </div>
                <div className="sd-stat-chip">
                  <span>🔧</span>
                  <div>
                    <div style={{ fontSize: 10, color: tk.textDim, fontFamily: tk.fontMono, marginBottom: 1 }}>TECH STACK</div>
                    <strong>{technologies.length}+ Technologies</strong>
                  </div>
                </div>
                <div className="sd-stat-chip">
                  <span>🛡️</span>
                  <div>
                    <div style={{ fontSize: 10, color: tk.textDim, fontFamily: tk.fontMono, marginBottom: 1 }}>SUPPORT</div>
                    <strong>30 Days Free</strong>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <button className="sd-btn-primary" onClick={() => scrollToId('pricing')}>
                  View Pricing Plans →
                </button>
                <button className="sd-btn-outline" onClick={() => scrollToId('contact')}>
                  Free Consultation
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            KEY FEATURES
        ═══════════════════════════════════════════════════ */}
        {features.length > 0 && (
          <section className="sd-section" style={{ borderBottom: `1px solid ${tk.border}` }}>
            <div className="sd-wrap">
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <span className="sd-eyebrow">What You Get</span>
                <h2 className="sd-h2">Key Features & Capabilities</h2>
                <p style={{ fontSize: 16, color: tk.textMuted, maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>
                  Every {service.title} engagement is crafted with these core capabilities to ensure your project succeeds.
                </p>
              </div>
              <div className="sd-feature-grid">
                {features.map((feat: string, i: number) => {
                  const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
                  const icons = ['🚀', '⚡', '🎯', '🔒', '📊', '🌐', '🤖', '🛡️'];
                  return (
                    <div
                      key={i}
                      className="sd-feature-card"
                      style={{ '--accent': accent, '--accent-dim': `${accent}44`, '--accent-bg': `${accent}12` } as React.CSSProperties}
                    >
                      <div className="sd-feature-icon">
                        {icons[i % icons.length]}
                      </div>
                      <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 17, fontWeight: 700, color: tk.text, marginBottom: 10 }}>
                        {feat}
                      </h3>
                      <p style={{ fontSize: 13.5, color: tk.textMuted, lineHeight: 1.75 }}>
                        Enterprise-grade {feat.toLowerCase()} engineered for reliability, performance, and scale in Nepal&apos;s digital ecosystem.
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            PROCESS TIMELINE
        ═══════════════════════════════════════════════════ */}
        {process.length > 0 && (
          <section className="sd-section" style={{ background: tk.bgAlt, borderBottom: `1px solid ${tk.border}` }}>
            <div className="sd-wrap">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 56, alignItems: 'start' }}>
                <div>
                  <span className="sd-eyebrow">How We Work</span>
                  <h2 className="sd-h2">Our Proven<br />Development Process</h2>
                  <p style={{ fontSize: 15, color: tk.textMuted, lineHeight: 1.85, marginBottom: 28 }}>
                    A battle-tested methodology refined across 25+ projects. Every step is transparent, documented, and client-approved before we proceed.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      ['⏱️', 'Sprint-based delivery'],
                      ['📋', 'Weekly progress reports'],
                      ['✅', 'Client sign-off at every milestone'],
                    ].map(([icon, text]) => (
                      <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: tk.textMuted }}>
                        <span>{icon}</span><span>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sd-timeline">
                  {process.map((step: any, i: number) => (
                    <div key={i} className="sd-timeline-row">
                      <div className="sd-timeline-left">
                        <div className="sd-timeline-dot">{step.step}</div>
                        {i < process.length - 1 && <div className="sd-timeline-line" />}
                      </div>
                      <div className="sd-timeline-content">
                        <h4 style={{ fontFamily: tk.fontDisplay, fontSize: 17, fontWeight: 700, color: tk.text, marginBottom: 8 }}>
                          {step.title}
                        </h4>
                        <p style={{ fontSize: 14, color: tk.textMuted, lineHeight: 1.75 }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            TECH STACK
        ═══════════════════════════════════════════════════ */}
        {technologies.length > 0 && (
          <section className="sd-section" style={{ borderBottom: `1px solid ${tk.border}` }}>
            <div className="sd-wrap" style={{ textAlign: 'center' }}>
              <span className="sd-eyebrow">Under the Hood</span>
              <h2 className="sd-h2">Technology Stack</h2>
              <p style={{ fontSize: 15, color: tk.textMuted, maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.8 }}>
                We use the same tools that power the world&apos;s most successful products — battle-tested, scalable, and secure.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                {technologies.map((tech: string, i: number) => (
                  <span key={i} className="sd-tech-pill">
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT_COLORS[i % ACCENT_COLORS.length], flexShrink: 0, display: 'inline-block' }} />
                    {tech}
                  </span>
                ))}
              </div>

              {/* Trust strip */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', marginTop: 56, paddingTop: 40, borderTop: `1px solid ${tk.border}` }}>
                {[
                  ['25+', 'Projects Delivered'],
                  ['18+', 'Happy Clients'],
                  ['98%', 'Satisfaction Rate'],
                  ['30d', 'Free Support'],
                ].map(([num, label]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: tk.fontDisplay, fontSize: 36, fontWeight: 800, color: tk.cyan, lineHeight: 1 }}>{num}</div>
                    <div style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono, marginTop: 6, letterSpacing: '0.08em' }}>{label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            WHY CHOOSE US
        ═══════════════════════════════════════════════════ */}
        {benefits.length > 0 && (
          <section className="sd-section" style={{ background: tk.bgAlt, borderBottom: `1px solid ${tk.border}` }}>
            <div className="sd-wrap">
              <div style={{ textAlign: 'center', marginBottom: 52 }}>
                <span className="sd-eyebrow">Our Advantage</span>
                <h2 className="sd-h2">Why Clients Choose D-Kode Era</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 20 }}>
                {benefits.map((b: string, i: number) => (
                  <div key={i} style={{
                    display: 'flex', gap: 16,
                    padding: '22px 24px',
                    background: 'rgba(13,20,37,0.5)',
                    border: `1px solid ${tk.border}`,
                    borderRadius: 14,
                    transition: 'border-color 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = tk.borderHover)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = tk.border)}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: `${ACCENT_COLORS[i % ACCENT_COLORS.length]}18`,
                      border: `1px solid ${ACCENT_COLORS[i % ACCENT_COLORS.length]}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: ACCENT_COLORS[i % ACCENT_COLORS.length], fontSize: 16,
                    }}>✓</div>
                    <p style={{ fontSize: 14, color: tk.textMuted, lineHeight: 1.75, paddingTop: 6 }}>{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            PRICING
        ═══════════════════════════════════════════════════ */}
        {pricing.length > 0 && (
          <section id="pricing" className="sd-section" style={{ borderBottom: `1px solid ${tk.border}` }}>
            <div className="sd-wrap">
              <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <span className="sd-eyebrow">Transparent Pricing</span>
                <h2 className="sd-h2">Choose Your Plan</h2>
                <p style={{ fontSize: 15, color: tk.textMuted, maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
                  No hidden fees, no lock-ins. All prices include design, development, testing, and 30 days of free post-launch support.
                </p>
              </div>
              <div className="sd-pricing-grid">
                {pricing.map((plan: any, i: number) => {
                  const isPopular = i === popularIndex;
                  return (
                    <div key={i} className={`sd-pricing-card${isPopular ? ' popular' : ''}`}>
                      {isPopular && <span className="sd-popular-badge">Most Popular</span>}

                      {/* Tier */}
                      <div style={{ fontFamily: tk.fontMono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: tk.cyan, marginBottom: 10 }}>
                        {plan.tier}
                      </div>

                      {/* Price */}
                      <div style={{
                        fontFamily: tk.fontDisplay, fontSize: 42, fontWeight: 800, lineHeight: 1,
                        background: isPopular
                          ? `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`
                          : `linear-gradient(135deg, ${tk.text}, ${tk.textMuted})`,
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        marginBottom: 8,
                      }}>
                        {plan.price}
                      </div>
                      <div style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono, marginBottom: 28 }}>
                        One-time · No hidden fees
                      </div>

                      {/* Divider */}
                      <div style={{ height: 1, background: `linear-gradient(90deg, ${tk.cyan}33, transparent)`, marginBottom: 24 }} />

                      {/* Features */}
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 32 }}>
                        {(plan.features || []).map((f: string, j: number) => (
                          <li key={j} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, color: tk.textMuted }}>
                            <span className="sd-check">✓</span>
                            {f}
                          </li>
                        ))}
                        {(plan.notIncluded || []).map((f: string, j: number) => (
                          <li key={`x${j}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, color: tk.textDim, opacity: 0.5 }}>
                            <span className="sd-cross">✗</span>
                            <span style={{ textDecoration: 'line-through' }}>{f}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <button
                        className={isPopular ? 'sd-btn-primary' : 'sd-btn-outline'}
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => openModal(plan)}
                      >
                        Get Started →
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Money-back note */}
              <div style={{ textAlign: 'center', marginTop: 36, fontSize: 13, color: tk.textDim, fontFamily: tk.fontMono }}>
                🔒 Secure payment · 30-day free support · Cancel anytime
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            FAQ ACCORDION
        ═══════════════════════════════════════════════════ */}
        {faqs.length > 0 && (
          <section className="sd-section" style={{ background: tk.bgAlt, borderBottom: `1px solid ${tk.border}` }}>
            <div className="sd-wrap">
              <div style={{ textAlign: 'center', marginBottom: 52 }}>
                <span className="sd-eyebrow">Got Questions?</span>
                <h2 className="sd-h2">Frequently Asked Questions</h2>
              </div>
              <div style={{ maxWidth: 780, margin: '0 auto' }}>
                {faqs.map((faq: any, i: number) => (
                  <div key={i} className={`sd-faq-item${openFaq === i ? ' open' : ''}`}>
                    <button
                      className="sd-faq-q"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      aria-expanded={openFaq === i}
                    >
                      <span>{faq.question}</span>
                      <span className="sd-faq-chevron" aria-hidden="true">▾</span>
                    </button>
                    {openFaq === i && (
                      <div className="sd-faq-a">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════════ */}
        <section id="contact" className="sd-section sd-cta-section">
          <div className="sd-wrap">
            <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
              <span className="sd-eyebrow">Ready to Build?</span>
              <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, color: tk.text, lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 20 }}>
                Let&apos;s Build Something<br />
                <span style={{ background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Extraordinary
                </span>
              </h2>
              <p style={{ fontSize: 17, color: tk.textMuted, lineHeight: 1.8, marginBottom: 40 }}>
                Join 18+ Nepali businesses that trusted D-Kode Era to transform their digital presence. Based in Butwal — available across Nepal.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
                <button className="sd-btn-primary" onClick={() => openModal(pricing[popularIndex] || { tier: 'Standard', price: 'Contact us' })}>
                  Start Your Project →
                </button>
                <Link href="/pages/contact" className="sd-btn-outline">
                  Schedule a Call
                </Link>
              </div>

              {/* Contact strip */}
              <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', paddingTop: 32, borderTop: `1px solid ${tk.border}` }}>
                {[
                  ['📧', 'dipendraofficial45@gmail.com'],
                  ['📱', '+977 9807544395'],
                  ['📍', 'Butwal-10, Rupandehi, Nepal'],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: tk.textDim }}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            INQUIRY MODAL
        ═══════════════════════════════════════════════════ */}
        {selectedPlan && (
          <div className="sd-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedPlan(null); }}>
            <div className="sd-modal" role="dialog" aria-modal="true" aria-label="Service Inquiry">
              {/* Close */}
              <button
                onClick={() => setSelectedPlan(null)}
                aria-label="Close"
                style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 36, height: 36, borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${tk.border}`,
                  color: tk.textMuted, fontSize: 16,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = tk.cyan; e.currentTarget.style.color = tk.cyan; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = tk.border; e.currentTarget.style.color = tk.textMuted; }}
              >✕</button>

              {/* Header */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: tk.fontMono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: tk.cyan, marginBottom: 8 }}>
                  Service Inquiry
                </div>
                <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 26, fontWeight: 800, color: tk.text, marginBottom: 8, lineHeight: 1.15 }}>
                  Get Started with {selectedPlan.tier}
                </h3>
                <p style={{ fontSize: 13, color: tk.textMuted, lineHeight: 1.7 }}>
                  <strong style={{ color: tk.text }}>{service.title}</strong>
                  {' — '}
                  <span style={{ color: tk.cyan, fontWeight: 600 }}>{selectedPlan.tier}</span>
                  {' at '}
                  <strong style={{ color: tk.text }}>{selectedPlan.price}</strong>
                </p>
              </div>

              {submitSuccess === true ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                    background: `${tk.green}20`,
                    border: `2px solid ${tk.green}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36,
                  }}>✓</div>
                  <h4 style={{ fontFamily: tk.fontDisplay, fontSize: 22, fontWeight: 700, color: tk.text, marginBottom: 12 }}>
                    Inquiry Sent!
                  </h4>
                  <p style={{ fontSize: 14, color: tk.textMuted, lineHeight: 1.75, marginBottom: 24 }}>
                    Thank you! Our team will review your inquiry and reach out within 24 hours with a tailored proposal.
                  </p>
                  <button className="sd-btn-primary" onClick={() => setSelectedPlan(null)}>
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {submitSuccess === false && (
                    <div style={{
                      padding: '14px 16px', borderRadius: 10,
                      background: 'rgba(255,107,107,0.08)',
                      border: '1px solid rgba(255,107,107,0.25)',
                      color: tk.red, fontSize: 13, display: 'flex', gap: 10, alignItems: 'center',
                    }}>
                      <span>⚠️</span>
                      <span>Failed to submit. Please try again or contact us directly.</span>
                    </div>
                  )}

                  <div className="sd-field">
                    <label className="sd-label">Full Name *</label>
                    <input className="sd-input" type="text" required placeholder="Your full name"
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="sd-field">
                    <label className="sd-label">Email Address *</label>
                    <input className="sd-input" type="email" required placeholder="you@example.com"
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="sd-field">
                    <label className="sd-label">Phone Number *</label>
                    <input className="sd-input" type="tel" required placeholder="+977 98XXXXXXXX"
                      value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div className="sd-field">
                    <label className="sd-label">Project Details *</label>
                    <textarea className="sd-input sd-textarea" required rows={4}
                      placeholder="Tell us about your requirements..."
                      value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
                  </div>

                  <button
                    type="submit"
                    className="sd-btn-primary"
                    disabled={isSubmitting}
                    style={{ justifyContent: 'center', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                  >
                    {isSubmitting ? '⏳ Sending...' : '✓ Send Inquiry'}
                  </button>

                  <p style={{ fontSize: 11, color: tk.textDim, textAlign: 'center', fontFamily: tk.fontMono }}>
                    We respond within 24 hours. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
