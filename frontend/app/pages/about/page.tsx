'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';
import { useSiteSettings } from '@/lib/useSiteSettings';
import { apiFetch } from '@/lib/api';

const stats = [
  { value: '25+', label: 'Projects Delivered', icon: '🚀' },
  { value: '18+', label: 'Happy Clients', icon: '🤝' },
  { value: '8+', label: 'Industries Served', icon: '🏭' },
  { value: '98%', label: 'Satisfaction Rate', icon: '⭐' },
];

const values = [
  { icon: '🇳🇵', title: 'Nepal First', desc: "We don't copy foreign playbooks. Every solution is tailored to Nepal's payment systems, regulations, languages, and market realities.", color: tk.cyan },
  { icon: '⚡', title: 'Speed Without Compromise', desc: 'We move fast — most websites are live in 5–7 days. But speed never means sloppy. Every line of code is reviewed, tested, and optimized.', color: tk.purple },
  { icon: '🔓', title: 'Full Transparency', desc: 'You own your code, your data, and your domain. No lock-ins. No hidden fees. Clear pricing, clear timelines, clear communication.', color: tk.gold },
  { icon: '📞', title: 'Local, Reachable, Accountable', desc: "We're based in Butwal-10. You can walk in, call us, WhatsApp us. We're not an anonymous agency — we're your neighbors.", color: tk.green },
  { icon: '🛡️', title: 'Post-Launch Support', desc: "30 days of free support after launch. Ongoing maintenance plans from Rs. 3,000/month. We don't disappear after delivery.", color: tk.red },
  { icon: '🧠', title: 'Continuous Innovation', desc: 'We stay ahead of the curve — AI tools, modern frameworks, cutting-edge design. Your business deserves the best technology.', color: tk.cyan },
];

const milestones = [
  { year: '2026', month: 'Jan', title: 'D-Kode Era Founded', desc: 'Started with a mission to bring world-class digital solutions to Butwal and Nepal.', icon: '🌱' },
  { year: '2026', month: 'Feb', title: 'First 5 Projects Delivered', desc: 'Launched our first batch of websites and apps for local businesses in Butwal.', icon: '🚀' },
  { year: '2026', month: 'Mar', title: 'HMS Pro SaaS Launched', desc: 'Our flagship hotel management SaaS product went live with 3 tiers and Stripe billing.', icon: '🏨' },
  { year: '2026', month: 'Apr', title: '18+ Clients Milestone', desc: 'Reached 18 satisfied clients across hotels, schools, retail, and tech startups.', icon: '🎯' },
  { year: '2026', month: 'Jun', title: 'Official Pvt. Ltd. Registration', desc: "Registered as D-Kode Era Pvt. Ltd., cementing our commitment to Nepal's digital future.", icon: '🏢', featured: true },
];

const contactRows: [string, string][] = [];

export default function AboutPage() {
  const { settings } = useSiteSettings();
  const [counts, setCounts] = useState({
    projects: 25,
    clients: 18,
    team: 8,
    satisfaction: '99%',
  });

  useEffect(() => {
    Promise.all([
      apiFetch('/api/services').catch(() => []),
      apiFetch('/api/testimonials').catch(() => []),
      apiFetch('/api/team').catch(() => []),
      apiFetch('/api/products').catch(() => []),
    ]).then(([servicesData, testimonialsData, teamData, productsData]) => {
      const sCount = Array.isArray(servicesData) ? servicesData.length : 0;
      const tCount = Array.isArray(testimonialsData) ? testimonialsData.length : 0;
      const tmCount = Array.isArray(teamData) ? teamData.length : 0;
      const pCount = Array.isArray(productsData) ? productsData.length : 0;

      setCounts({
        projects: Math.max(25, sCount * 3 + pCount * 4 + 10),
        clients: Math.max(18, tCount > 0 ? tCount : 18),
        team: Math.max(8, tmCount > 0 ? tmCount : 8),
        satisfaction: '99%',
      });
    });
  }, []);

  const liveStats = [
    { value: `${counts.projects}+`, label: 'Projects Delivered', icon: '🚀' },
    { value: `${counts.clients}+`, label: 'Happy Clients', icon: '🤝' },
    { value: `${counts.team}+`, label: 'Team Members', icon: '👥' },
    { value: counts.satisfaction, label: 'Satisfaction Rate', icon: '⭐' },
  ];

  const liveContactRows: [string, string][] = [
    ['📧', settings.agency_email || 'hello@dkodeera.com'],
    ['📱', settings.agency_phone || '+977-9800000000'],
    ['💬', `WhatsApp: ${settings.whatsapp_number || '+977-9800000000'}`],
    ['🕐', settings.business_hours || 'Sun–Fri 9AM–6PM NST'],
  ];

  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: `
            radial-gradient(ellipse 1000px 700px at 0% 0%, rgba(0,212,255,0.18), transparent 55%),
            radial-gradient(ellipse 800px 600px at 100% 20%, rgba(168,85,247,0.16), transparent 55%),
            radial-gradient(ellipse 600px 500px at 50% 100%, rgba(168,85,247,0.08), transparent 60%),
            ${tk.bg || '#050810'}
          `,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 20px 100px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated dot-grid */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(rgba(0,212,255,0.3) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            maskImage: 'radial-gradient(ellipse 75% 65% at 50% 40%, black 0%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 40%, black 0%, transparent 80%)',
            opacity: 0.45,
            pointerEvents: 'none',
          }}
        />

        {/* Floating orbs */}
        <div aria-hidden="true" className="orb orb-cyan" />
        <div aria-hidden="true" className="orb orb-purple" />
        <div aria-hidden="true" style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
          top: '60%', left: '10%', pointerEvents: 'none',
          animation: 'floatSlow 8s ease-in-out infinite',
        }} />

        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }} className="fade-up">
          {/* Eyebrow badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 20px',
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.4)',
            borderRadius: 30,
            color: tk.cyan,
            fontSize: 11.5,
            fontFamily: tk.fontMono,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 32,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: tk.cyan, display: 'inline-block', boxShadow: `0 0 10px ${tk.cyan}` }} />
            Est. {settings.agency_founded || '2026'} · {settings.agency_address || 'Butwal, Nepal'}
          </div>

          <h1
            style={{
              fontFamily: tk.fontDisplay,
              fontSize: 'clamp(42px,7.5vw,88px)',
              fontWeight: 800,
              color: tk.text,
              lineHeight: 1.05,
              marginBottom: 28,
              letterSpacing: '-0.04em',
            }}
          >
            Built in Butwal.
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${tk.cyan} 0%, ${tk.purple} 60%, #ff6eb4 100%)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                filter: 'drop-shadow(0 0 40px rgba(0,212,255,0.25))',
              }}
            >
              Built for Nepal.
            </span>
          </h1>

          <p
            style={{
              fontSize: 18,
              color: tk.textMuted,
              maxWidth: 660,
              margin: '0 auto 20px',
              lineHeight: 1.85,
            }}
          >
            Nepal&apos;s fastest-growing IT company — delivering world-class websites, apps,
            management systems, and digital marketing engineered for Nepal&apos;s market,
            culture, and payment ecosystem.
          </p>

          {/* Tech tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 40 }}>
            {['Next.js', 'Node.js', 'PostgreSQL', 'React Native', 'AI/LLM', 'TypeScript'].map((tag) => (
              <span key={tag} style={{
                padding: '5px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${tk.border}`,
                borderRadius: 20,
                fontSize: 12,
                color: tk.textMuted,
                fontFamily: tk.fontMono,
              }}>
                {tag}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 72 }}>
            <Link href="/pages/contact" className="btn-primary">
              Get a Free Quote →
            </Link>
            <Link href="/pages/services" className="btn-secondary">
              See Our Work
            </Link>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 2,
              borderTop: `1px solid ${tk.border}`,
              paddingTop: 0,
            }}
          >
            {liveStats.map((s, i) => (
              <div key={s.label} style={{
                textAlign: 'center',
                padding: '32px 16px',
                borderRight: i < liveStats.length - 1 ? `1px solid ${tk.border}` : 'none',
                position: 'relative',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }} aria-hidden="true">{s.icon}</div>
                <div style={{
                  fontFamily: tk.fontDisplay, fontSize: 36, fontWeight: 800,
                  background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
                  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12.5, color: tk.textMuted, fontFamily: tk.fontBody, marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Our Story ─────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)' }}>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 64,
            alignItems: 'center',
          }}
        >
          {/* Text side */}
          <div>
            <div style={{ fontSize: 11, color: tk.cyan, fontFamily: tk.fontMono, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
              OUR STORY
            </div>
            <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: tk.text, marginBottom: 24, lineHeight: 1.2 }}>
              Why We Started D-Kode Era
            </h2>
            <p style={{ fontSize: 16, color: tk.textMuted, lineHeight: 1.9, marginBottom: 18 }}>
              Dipendra Prasad Gupta saw a gap in Nepal&apos;s digital landscape — businesses outside Kathmandu were being underserved. Agencies in the capital charged high prices, missed deadlines, and delivered generic solutions.
            </p>
            <p style={{ fontSize: 16, color: tk.textMuted, lineHeight: 1.9, marginBottom: 18 }}>
              So he started D-Kode Era in Butwal — combining world-class technical skill with deep local understanding. We speak your language, accept eSewa and Khalti, and understand your market.
            </p>
            <p style={{ fontSize: 16, color: tk.textMuted, lineHeight: 1.9, marginBottom: 32 }}>
              Today, we&apos;re proud to serve 18+ clients across hotels, schools, retail, and tech — and we&apos;re just getting started.
            </p>

            {/* Contact info compact row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {liveContactRows.map(([icon, text]) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tk.border}`,
                  borderRadius: 10,
                  fontSize: 13, color: tk.textMuted,
                }}>
                  <span aria-hidden="true">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image side */}
          <div style={{ position: 'relative' }}>
            {/* Glow behind image */}
            <div aria-hidden="true" style={{
              position: 'absolute', inset: -20,
              background: `radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,212,255,0.12), transparent 70%)`,
              borderRadius: 28,
              pointerEvents: 'none',
            }} />

            {/* Image container */}
            <div style={{
              position: 'relative',
              borderRadius: 24,
              overflow: 'hidden',
              border: `1px solid rgba(0,212,255,0.25)`,
              boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,85,247,0.15)`,
            }}>
              {/* Corner tech accents */}
              <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: 28, height: 28, borderTop: `2px solid ${tk.cyan}`, borderLeft: `2px solid ${tk.cyan}`, borderRadius: '24px 0 0 0', zIndex: 2 }} />
              <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, width: 28, height: 28, borderTop: `2px solid ${tk.purple}`, borderRight: `2px solid ${tk.purple}`, borderRadius: '0 24px 0 0', zIndex: 2 }} />
              <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, width: 28, height: 28, borderBottom: `2px solid ${tk.purple}`, borderLeft: `2px solid ${tk.purple}`, borderRadius: '0 0 0 24px', zIndex: 2 }} />
              <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderBottom: `2px solid ${tk.cyan}`, borderRight: `2px solid ${tk.cyan}`, borderRadius: '0 0 24px 0', zIndex: 2 }} />

              <img
                src="/D-Kode Era.jpeg"
                alt="D-Kode Era Office — Butwal, Nepal"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'cover',
                }}
              />

              {/* Overlay caption */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '32px 24px 20px',
                background: 'linear-gradient(to top, rgba(5,8,16,0.92) 0%, transparent 100%)',
              }}>
                <div style={{ fontSize: 10, color: tk.cyan, fontFamily: tk.fontMono, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                  📍 Butwal-10, Rupandehi · Lumbini Province
                </div>
                <div style={{ fontFamily: tk.fontDisplay, fontSize: 16, fontWeight: 700, color: tk.text }}>
                  D-Kode Era Headquarters
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div style={{
              position: 'absolute', top: 20, right: -16,
              padding: '10px 16px',
              background: 'rgba(5,8,16,0.9)',
              border: `1px solid rgba(0,212,255,0.35)`,
              borderRadius: 12,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', gap: 8,
              zIndex: 3,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: tk.green, display: 'inline-block', boxShadow: `0 0 10px ${tk.green}` }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: tk.text, fontFamily: tk.fontMono }}>Est. Jan 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOUNDER ────────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)',
          background: `radial-gradient(ellipse 800px 500px at 80% 50%, rgba(168,85,247,0.08), transparent 60%),
                       radial-gradient(ellipse 600px 400px at 10% 50%, rgba(0,212,255,0.07), transparent 55%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(0,212,255,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 60% 80% at 80% 50%, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 80% at 80% 50%, black 0%, transparent 70%)',
          opacity: 0.3,
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, color: tk.cyan, fontFamily: tk.fontMono, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>
              MEET THE FOUNDER
            </div>
            <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: tk.text, lineHeight: 1.2 }}>
              The Mind Behind{' '}
              <span style={{ background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                D-Kode Era
              </span>
            </h2>
          </div>

          {/* Founder card */}
          <div className="founder-card">
            {/* LEFT — portrait */}
            <div className="founder-portrait-col">
              {/* Glow ring */}
              <div aria-hidden="true" className="founder-glow-ring" />

              {/* Image frame */}
              <div className="founder-img-frame">
                {/* Corner accents */}
                <div aria-hidden="true" style={{ position: 'absolute', top: -1, left: -1, width: 24, height: 24, borderTop: `2px solid ${tk.cyan}`, borderLeft: `2px solid ${tk.cyan}`, borderRadius: '12px 0 0 0' }} />
                <div aria-hidden="true" style={{ position: 'absolute', top: -1, right: -1, width: 24, height: 24, borderTop: `2px solid ${tk.purple}`, borderRight: `2px solid ${tk.purple}`, borderRadius: '0 12px 0 0' }} />
                <div aria-hidden="true" style={{ position: 'absolute', bottom: -1, left: -1, width: 24, height: 24, borderBottom: `2px solid ${tk.purple}`, borderLeft: `2px solid ${tk.purple}`, borderRadius: '0 0 0 12px' }} />
                <div aria-hidden="true" style={{ position: 'absolute', bottom: -1, right: -1, width: 24, height: 24, borderBottom: `2px solid ${tk.cyan}`, borderRight: `2px solid ${tk.cyan}`, borderRadius: '0 0 12px 0' }} />

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/founder-dipendra.png"
                  alt="Dipendra Prasad Gupta — Founder & CEO of D-Kode Era"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 16,
                    display: 'block',
                  }}
                />

                {/* Status badge */}
                <div style={{
                  position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(0,0,0,0.75)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid rgba(0,212,255,0.3)`,
                  borderRadius: 20, padding: '6px 14px',
                  whiteSpace: 'nowrap',
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: '#e2e8f0', fontFamily: tk.fontMono, letterSpacing: '0.06em' }}>Available for projects</span>
                </div>
              </div>

              {/* Floating skill badges */}
              <div className="founder-badge founder-badge-tl" style={{ background: 'rgba(0,212,255,0.12)', border: `1px solid rgba(0,212,255,0.3)` }}>
                <span style={{ fontSize: 14 }}>⚡</span>
                <span style={{ fontSize: 11, color: tk.cyan, fontFamily: tk.fontMono }}>Full-Stack</span>
              </div>
              <div className="founder-badge founder-badge-tr" style={{ background: 'rgba(168,85,247,0.12)', border: `1px solid rgba(168,85,247,0.3)` }}>
                <span style={{ fontSize: 14 }}>🏆</span>
                <span style={{ fontSize: 11, color: tk.purple, fontFamily: tk.fontMono }}>CEO & Founder</span>
              </div>
            </div>

            {/* RIGHT — bio */}
            <div className="founder-bio-col">
              {/* Name & role */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: tk.cyan, fontFamily: tk.fontMono, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Founder & Chief Executive Officer
                </div>
                <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, color: tk.text, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 8 }}>
                  Dipendra<br />
                  <span style={{ background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                    Prasad Gupta
                  </span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                  <span style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono }}>📍 Butwal-10, Rupandehi, Nepal</span>
                </div>
              </div>

              {/* Quote */}
              <blockquote style={{
                margin: '0 0 28px',
                padding: '18px 22px',
                background: 'rgba(0,212,255,0.05)',
                borderLeft: `3px solid ${tk.cyan}`,
                borderRadius: '0 10px 10px 0',
              }}>
                <p style={{ fontSize: 16, color: tk.textMuted, lineHeight: 1.8, fontStyle: 'italic', margin: 0 }}>
                  &ldquo;I believe every business in Nepal — from a tea shop in Butwal to a hotel in Pokhara — deserves world-class digital infrastructure. That&apos;s why I built D-Kode Era.&rdquo;
                </p>
              </blockquote>

              {/* Bio paragraphs */}
              <p style={{ fontSize: 15, color: tk.textMuted, lineHeight: 1.9, marginBottom: 16 }}>
                Dipendra is a self-taught full-stack developer and entrepreneur who founded D-Kode Era with a singular mission: to democratize premium digital solutions for Nepali businesses. With expertise spanning React, Next.js, Node.js, and cloud architecture, he personally oversees every project to ensure quality exceeds expectations.
              </p>
              <p style={{ fontSize: 15, color: tk.textMuted, lineHeight: 1.9, marginBottom: 28 }}>
                Before D-Kode Era, Dipendra worked on freelance projects across Nepal and internationally, refining his craft and understanding business needs from the ground up. His vision: build a tech company from Butwal that can compete on a global stage.
              </p>

              {/* Tech stack */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Tech Stack
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Next.js', 'React', 'TypeScript', 'Node.js', 'Prisma', 'PostgreSQL', 'Tailwind', 'AWS'].map((tech) => (
                    <span key={tech} style={{
                      padding: '4px 12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid rgba(255,255,255,0.1)`,
                      borderRadius: 20,
                      fontSize: 12,
                      color: tk.textMuted,
                      fontFamily: tk.fontMono,
                      letterSpacing: '0.04em',
                      transition: 'all 0.2s ease',
                    }}
                      className="tech-pill"
                    >{tech}</span>
                  ))}
                </div>
              </div>

              {/* Social / contact */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { icon: '💼', label: 'LinkedIn', href: 'https://www.linkedin.com/in/technicaldipendra/', target: '_blank' },
                  { icon: '🐙', label: 'GitHub', href: 'https://github.com/DipendraPrasadGupta' },
                  { icon: '✉️', label: 'Email', href: `mailto:${settings.agency_email || 'dipendraofficial45@gmail.com'}` },
                  { icon: '📱', label: 'WhatsApp', href: `https://wa.me/${(settings.whatsapp_number || '9779807544395').replace(/[^0-9]/g, '')}` },
                ].map((s) => (
                  <a key={s.label} href={s.href} className="founder-social-btn"
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', background: 'rgba(13,20,37,0.4)', borderTop: `1px solid ${tk.border}`, borderBottom: `1px solid ${tk.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, color: tk.cyan, fontFamily: tk.fontMono, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>
              WHAT WE STAND FOR
            </div>
            <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: tk.text, lineHeight: 1.2 }}>
              Our Core Values
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {values.map((v) => (
              <div
                key={v.title}
                className="value-card"
                style={{ borderTop: `3px solid ${v.color}`, '--glow': v.color } as React.CSSProperties}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: `${v.color}1f`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    marginBottom: 18,
                  }}
                >
                  {v.icon}
                </div>
                <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 18, fontWeight: 700, color: tk.text, marginBottom: 10 }}>
                  {v.title}
                </h3>
                <p style={{ fontSize: 14, color: tk.textDim, lineHeight: 1.8 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, color: tk.cyan, fontFamily: tk.fontMono, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>
              MILESTONES
            </div>
            <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: tk.text }}>
              Our Journey So Far
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {milestones.map((m, i) => (
              <div key={i} className="milestone-row" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                {/* Left: date */}
                <div style={{ minWidth: 64, textAlign: 'right', paddingTop: 6, flexShrink: 0 }}>
                  <div style={{ fontFamily: tk.fontMono, fontSize: 11, color: tk.cyan, letterSpacing: '0.1em' }}>{m.month}</div>
                  <div style={{ fontFamily: tk.fontMono, fontSize: 10, color: tk.textDim }}>{m.year}</div>
                </div>
                {/* Center: line + dot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div
                    aria-hidden="true"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: m.featured ? `${tk.gold}22` : 'rgba(0,212,255,0.12)',
                      border: `2px solid ${m.featured ? tk.gold : tk.cyan}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {m.icon}
                  </div>
                  {i < milestones.length - 1 && (
                    <div style={{ width: 1, flex: 1, minHeight: 40, background: `linear-gradient(${tk.cyan}, transparent)`, opacity: 0.25, marginTop: 4 }} />
                  )}
                </div>
                {/* Right: content */}
                <div style={{ paddingBottom: 40, paddingTop: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 18, fontWeight: 700, color: tk.text }}>{m.title}</h3>
                    {m.featured && (
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: tk.fontMono,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: tk.gold,
                          border: `1px solid ${tk.gold}55`,
                          borderRadius: 20,
                          padding: '2px 8px',
                        }}
                      >
                        Latest
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: tk.textDim, lineHeight: 1.7, maxWidth: 520 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: 'clamp(60px,8vw,100px) 20px',
          textAlign: 'center',
          background: `radial-gradient(ellipse 700px 400px at 50% 0%, rgba(0,212,255,0.08), transparent 70%), rgba(13,20,37,0.4)`,
          borderTop: `1px solid ${tk.border}`,
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: tk.text, marginBottom: 16 }}>
            Want to Work With Us?
          </h2>
          <p style={{ fontSize: 16, color: tk.textMuted, marginBottom: 40, lineHeight: 1.8 }}>
            We&apos;re based in Butwal and love meeting clients in person. Let&apos;s build something great together.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/pages/contact" className="btn-primary">
              Contact Us →
            </Link>
            <Link href="/pages/services" className="btn-secondary">
              View Services
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -16px); }
        }
        .fade-up { animation: fadeUp 0.7s ease-out both; }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          animation: drift 12s ease-in-out infinite;
        }
        .orb-cyan {
          width: 340px; height: 340px;
          top: -60px; left: -80px;
          background: rgba(0,212,255,0.18);
        }
        .orb-purple {
          width: 380px; height: 380px;
          bottom: -100px; right: -100px;
          background: rgba(168,85,247,0.15);
          animation-delay: -6s;
        }

        .btn-primary {
          padding: 14px 32px;
          background: ${tk.cyan};
          color: #050810;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          font-family: ${tk.fontBody};
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
          display: inline-block;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,212,255,0.35);
        }
        .btn-primary:focus-visible {
          outline: 2px solid ${tk.cyan};
          outline-offset: 3px;
        }

        .btn-secondary {
          padding: 14px 32px;
          background: transparent;
          color: ${tk.cyan};
          border: 2px solid ${tk.cyan};
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.15s ease, background 0.15s ease;
          display: inline-block;
        }
        .btn-secondary:hover {
          transform: translateY(-2px);
          background: rgba(0,212,255,0.08);
        }
        .btn-secondary:focus-visible {
          outline: 2px solid ${tk.cyan};
          outline-offset: 3px;
        }

        .story-card {
          background: rgba(13,20,37,0.6);
          border: 1px solid ${tk.border};
          border-radius: 16px;
          padding: 40px;
          position: relative;
          transition: border-color 0.2s ease;
        }
        .story-card:hover {
          border-color: rgba(0,212,255,0.4);
        }

        .value-card {
          padding: 28px;
          background: rgba(13,20,37,0.6);
          border: 1px solid ${tk.border};
          border-radius: 14px;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .value-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.35);
          border-color: var(--glow);
        }

        .milestone-row {
          border-radius: 12px;
          transition: background 0.2s ease;
        }
        .milestone-row:hover {
          background: rgba(255,255,255,0.02);
        }

        a:focus-visible {
          outline: 2px solid ${tk.cyan};
          outline-offset: 3px;
        }

        /* ── FOUNDER SECTION ─────────────────────────────────────── */
        .founder-card {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 72px;
          align-items: center;
          background: rgba(13,20,37,0.55);
          border: 1px solid rgba(0,212,255,0.12);
          border-radius: 24px;
          padding: 56px;
          backdrop-filter: blur(20px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
          position: relative;
          overflow: hidden;
        }
        .founder-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,212,255,0.5), rgba(168,85,247,0.5), transparent);
        }

        .founder-portrait-col {
          position: relative;
          display: flex;
          justify-content: center;
        }

        .founder-glow-ring {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,212,255,0.18) 0%, rgba(168,85,247,0.1) 40%, transparent 70%);
          animation: founder-pulse 4s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes founder-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }

        .founder-img-frame {
          position: relative;
          width: 300px;
          height: 380px;
          border-radius: 18px;
          overflow: visible;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.15);
        }
        .founder-img-frame img {
          border: 1px solid rgba(0,212,255,0.15);
        }

        .founder-badge {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 20px;
          backdrop-filter: blur(12px);
          animation: badge-float 3s ease-in-out infinite;
          z-index: 10;
        }
        .founder-badge-tl {
          top: -16px;
          left: -20px;
          animation-delay: 0s;
        }
        .founder-badge-tr {
          top: 40px;
          right: -24px;
          animation-delay: -1.5s;
        }
        @keyframes badge-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        .founder-bio-col {
          min-width: 0;
        }

        .tech-pill:hover {
          background: rgba(0,212,255,0.08) !important;
          border-color: rgba(0,212,255,0.3) !important;
          color: ${tk.cyan} !important;
        }

        .founder-social-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: ${tk.textMuted};
          font-size: 13px;
          font-family: ${tk.fontBody};
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .founder-social-btn:hover {
          background: rgba(0,212,255,0.08);
          border-color: rgba(0,212,255,0.35);
          color: ${tk.cyan};
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,212,255,0.15);
        }

        @media (max-width: 860px) {
          .founder-card {
            grid-template-columns: 1fr;
            padding: 36px 24px;
            gap: 48px;
          }
          .founder-portrait-col {
            justify-content: center;
          }
          .founder-badge-tl { left: 0; }
          .founder-badge-tr { right: 0; }
        }

        @media (max-width: 640px) {
          .btn-primary, .btn-secondary {
            width: 100%;
            text-align: center;
          }
          .story-card {
            padding: 24px 20px;
          }
          .value-card {
            padding: 20px 16px;
          }
        }
        /* ─────────────────────────────────────────────────────────── */

        @media (prefers-reduced-motion: reduce) {
          .fade-up, .orb {
            animation: none !important;
          }
          .btn-primary:hover, .btn-secondary:hover, .value-card:hover {
            transform: none !important;
          }
          .founder-glow-ring, .founder-badge {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}