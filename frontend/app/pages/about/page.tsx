'use client';

import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';

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

const contactRows = [
  ['📧', 'hello@dkodeera.com'],
  ['📱', '+977-9800000000'],
  ['💬', 'WhatsApp Available'],
  ['🕐', 'Sun–Fri 9AM–6PM NST'],
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section
        style={{
          background: `radial-gradient(ellipse 900px 600px at 15% 10%, rgba(0,212,255,0.14), transparent 60%),
                       radial-gradient(ellipse 800px 700px at 90% 30%, rgba(168,85,247,0.12), transparent 60%),
                       ${tk.bg || '#050810'}`,
          minHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '100px 20px 80px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* dot-grid backdrop, signature "space" texture */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(0,212,255,0.35) 1px, transparent 1px)',
            backgroundSize: '34px 34px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 75%)',
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        />
        <div aria-hidden="true" className="orb orb-cyan" />
        <div aria-hidden="true" className="orb orb-purple" />

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }} className="fade-up">
          <div
            style={{
              display: 'inline-block',
              padding: '8px 18px',
              background: 'rgba(0,212,255,0.12)',
              border: `1px solid rgba(0,212,255,0.4)`,
              borderRadius: 20,
              color: tk.cyan,
              fontSize: 12,
              fontFamily: tk.fontMono,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 28,
            }}
          >
            ◈ About D-Kode Era
          </div>

          <h1
            style={{
              fontFamily: tk.fontDisplay,
              fontSize: 'clamp(40px,7vw,80px)',
              fontWeight: 800,
              color: tk.text,
              lineHeight: 1.1,
              marginBottom: 24,
              letterSpacing: '-0.03em',
            }}
          >
            Built in Butwal.
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Built for Nepal.
            </span>
          </h1>

          <p
            style={{
              fontSize: 18,
              color: tk.textMuted,
              maxWidth: 640,
              margin: '0 auto 44px',
              lineHeight: 1.8,
            }}
          >
            D-Kode Era is Nepal&apos;s fastest-growing IT company, headquartered in Butwal. We deliver world-class websites, mobile apps, management systems, and digital marketing — engineered specifically for Nepal&apos;s market, culture, and payment ecosystem.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
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
              gap: 24,
              borderTop: `1px solid ${tk.border}`,
              paddingTop: 40,
            }}
          >
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, marginBottom: 6 }} aria-hidden="true">{s.icon}</div>
                <div style={{ fontFamily: tk.fontDisplay, fontSize: 32, fontWeight: 800, color: tk.text }}>{s.value}</div>
                <div style={{ fontSize: 13, color: tk.textMuted, fontFamily: tk.fontBody, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
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
            <p style={{ fontSize: 16, color: tk.textMuted, lineHeight: 1.9 }}>
              Today, we&apos;re proud to serve 18+ clients across hotels, schools, retail, and tech — and we&apos;re just getting started.
            </p>
          </div>

          <div className="story-card">
            <div style={{ fontSize: 44, marginBottom: 20 }} aria-hidden="true">🏢</div>
            <div style={{ fontSize: 11, color: tk.cyan, fontFamily: tk.fontMono, letterSpacing: '0.12em', marginBottom: 12 }}>
              HEADQUARTERS
            </div>
            <div style={{ fontFamily: tk.fontDisplay, fontSize: 22, fontWeight: 700, color: tk.text, marginBottom: 8 }}>
              Butwal-10, Rupandehi
            </div>
            <div style={{ fontSize: 14, color: tk.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
              Lumbini Province, Nepal
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {contactRows.map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: tk.textMuted }}>
                  <span aria-hidden="true">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
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
                  { icon: '✉️', label: 'Email', href: 'mailto:dipendraofficial45@gmail.com' },
                  { icon: '📱', label: 'WhatsApp', href: 'https://wa.me/9779807544395' },
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

      <style jsx global>{`
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