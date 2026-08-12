'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';
import {
  projectTypes,
  complexityLevels,
  featureOptions,
  urgencyOptions,
  calculateEstimate,
  formatNPR,
  type ProjectTypeId,
  type ComplexityId,
  type UrgencyId,
} from '@/lib/estimateEngine';

const faqs = [
  {
    q: 'How accurate is this estimate?',
    a: 'This calculator provides a ballpark range based on typical D-Kode Era projects. After a discovery call, we deliver a detailed proposal with fixed milestones and transparent pricing.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept eSewa, Khalti, bank transfers, and international wire transfers. Projects are typically billed in milestones: 40% upfront, 40% at mid-delivery, and 20% on launch.',
  },
  {
    q: 'Can I adjust the scope later?',
    a: 'Yes. We work in agile sprints, so features can be added or reprioritized. Any scope changes are documented and agreed upon before implementation.',
  },
  {
    q: 'Is design included in the base price?',
    a: 'Basic styling is included. For a full UI/UX design package with wireframes, prototypes, and a design system, add the UI/UX Design Package from the features list.',
  },
  {
    q: 'Do you offer post-launch support?',
    a: 'Every project includes 30 days of free post-launch support. You can also add 3-Month Maintenance or subscribe to our monthly maintenance plan from Rs. 3,000/month.',
  },
];

const methodology = [
  { step: '01', title: 'Discovery', desc: 'We review your goals, audience, and technical requirements to validate the estimate.' },
  { step: '02', title: 'Proposal', desc: 'You receive a detailed scope document with timeline, deliverables, and fixed pricing.' },
  { step: '03', title: 'Design & Build', desc: 'Iterative development with weekly updates, Figma previews, and staging demos.' },
  { step: '04', title: 'Launch & Support', desc: 'Deployment, training, documentation, and 30 days of complimentary support.' },
];

export default function QuoteCalcPage() {
  const [projectType, setProjectType] = useState<ProjectTypeId>('business');
  const [complexity, setComplexity] = useState<ComplexityId>('standard');
  const [features, setFeatures] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<UrgencyId>('standard');
  const [pageCount, setPageCount] = useState(8);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const estimate = useMemo(
    () => calculateEstimate({ projectType, complexity, features, urgency, pageCount }),
    [projectType, complexity, features, urgency, pageCount],
  );

  const toggleFeature = (id: string) => {
    setFeatures(prev => (prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(estimate.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const selectedProject = projectTypes.find(p => p.id === projectType)!;

  const cardStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
    border: `1px solid ${tk.border}`,
    borderRadius: 16,
    padding: '28px 24px',
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    fontFamily: tk.fontMono,
    fontWeight: 600,
    color: tk.textDim,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 16,
  };

  const optionBtn = (active: boolean, color: string = tk.gold): React.CSSProperties => ({
    background: active ? `${color}18` : 'rgba(255,255,255,0.02)',
    border: `1px solid ${active ? `${color}55` : tk.border}`,
    borderRadius: 12,
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left' as const,
    color: tk.text,
  });

  return (
    <div style={{ background: tk.bg, color: tk.text, minHeight: '100vh', fontFamily: tk.fontBody }}>
      {/* Hero */}
      <section
        style={{
          background: `radial-gradient(ellipse 900px 600px at 15% 20%, rgba(245,200,66,0.14), transparent 60%),
                       radial-gradient(ellipse 700px 500px at 85% 30%, rgba(168,85,247,0.1), transparent 60%),
                       ${tk.bg}`,
          padding: '48px 20px 56px',
          borderBottom: `1px solid ${tk.border}`,
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link
            href="/pages/tools"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontFamily: tk.fontMono,
              color: tk.textDim,
              textDecoration: 'none',
              marginBottom: 28,
              letterSpacing: '0.05em',
            }}
          >
            ← Back to Tools
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 420px', maxWidth: 640 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(245,200,66,0.1)',
                  border: '1px solid rgba(245,200,66,0.3)',
                  borderRadius: 20,
                  padding: '6px 14px',
                  color: tk.gold,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 20,
                }}
              >
                💰 Interactive · Business Tool
              </div>
              <h1
                style={{
                  fontFamily: tk.fontDisplay,
                  fontSize: 'clamp(32px, 5vw, 52px)',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  marginBottom: 16,
                  letterSpacing: '-0.03em',
                }}
              >
                Project Cost{' '}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${tk.gold}, ${tk.purple})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Estimator
                </span>
              </h1>
              <p style={{ fontSize: 16, color: tk.textDim, lineHeight: 1.75, marginBottom: 0 }}>
                Configure your Web, Mobile, or AI project scope and get an instant budget range and delivery timeline —
                powered by D-Kode Era&apos;s real project pricing data from Nepal.
              </p>
            </div>

            <div
              style={{
                ...cardStyle,
                flex: '0 1 280px',
                borderColor: `${tk.gold}35`,
                background: `linear-gradient(135deg, rgba(245,200,66,0.08), ${tk.surfaceMuted}aa)`,
              }}
            >
              <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.gold, marginBottom: 8, letterSpacing: '0.1em' }}>
                LIVE ESTIMATE
              </div>
              <div style={{ fontFamily: tk.fontDisplay, fontSize: 36, fontWeight: 900, color: tk.gold, lineHeight: 1 }}>
                {formatNPR(estimate.total)}
              </div>
              <div style={{ fontSize: 13, color: tk.textDim, marginTop: 10 }}>
                {estimate.weeksMin}–{estimate.weeksMax} weeks delivery
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Estimator */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 28, alignItems: 'start' }}>
          {/* Left — Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Project Type */}
            <div style={cardStyle}>
              <div style={sectionLabel}>1 · Project Type</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {projectTypes.map(pt => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setProjectType(pt.id)}
                    style={optionBtn(projectType === pt.id)}
                  >
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{pt.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: tk.fontDisplay, marginBottom: 4 }}>{pt.label}</div>
                    <div style={{ fontSize: 11, color: tk.textDim, lineHeight: 1.4 }}>{pt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Complexity */}
            <div style={cardStyle}>
              <div style={sectionLabel}>2 · Complexity Level</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {complexityLevels.map(cl => (
                  <button
                    key={cl.id}
                    type="button"
                    onClick={() => setComplexity(cl.id)}
                    style={{
                      ...optionBtn(complexity === cl.id, tk.purple),
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: tk.fontDisplay }}>{cl.label}</div>
                      <div style={{ fontSize: 12, color: tk.textDim, marginTop: 2 }}>{cl.desc}</div>
                    </div>
                    <span style={{ fontFamily: tk.fontMono, fontSize: 11, color: tk.purple }}>
                      ×{cl.multiplier}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Page Count */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ ...sectionLabel, marginBottom: 0 }}>3 · Pages / Screens</div>
                <span style={{ fontFamily: tk.fontMono, fontSize: 14, color: tk.cyan, fontWeight: 700 }}>{pageCount}</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={pageCount}
                onChange={e => setPageCount(Number(e.target.value))}
                style={{ width: '100%', accentColor: tk.cyan, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: tk.textDim, marginTop: 8, fontFamily: tk.fontMono }}>
                <span>1 page</span>
                <span>First 5 included · Rs. 3,500/page after</span>
                <span>50 pages</span>
              </div>
            </div>

            {/* Features */}
            <div style={cardStyle}>
              <div style={sectionLabel}>4 · Add-on Features</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {featureOptions.map(f => {
                  const checked = features.includes(f.id);
                  return (
                    <label
                      key={f.id}
                      style={{
                        ...optionBtn(checked, tk.cyan),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFeature(f.id)}
                          style={{ accentColor: tk.cyan, width: 16, height: 16 }}
                        />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{f.label}</div>
                          <div style={{ fontSize: 11, color: tk.textDim }}>{f.desc}</div>
                        </div>
                      </div>
                      <span style={{ fontFamily: tk.fontMono, fontSize: 11, color: tk.cyan, flexShrink: 0, marginLeft: 12 }}>
                        +{formatNPR(f.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Urgency */}
            <div style={cardStyle}>
              <div style={sectionLabel}>5 · Delivery Timeline</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                {urgencyOptions.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUrgency(u.id)}
                    style={optionBtn(urgency === u.id, tk.green)}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: tk.fontDisplay, marginBottom: 4 }}>{u.label}</div>
                    <div style={{ fontSize: 11, color: tk.textDim }}>{u.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Results */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{ ...cardStyle, borderColor: `${tk.gold}40`, marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.gold, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
                Your Estimate
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: tk.textDim, marginBottom: 6 }}>Estimated Total</div>
                <div style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(36px, 6vw, 48px)', fontWeight: 900, color: tk.gold, lineHeight: 1 }}>
                  {formatNPR(estimate.total)}
                </div>
                <div style={{ fontSize: 13, color: tk.green, marginTop: 8, fontFamily: tk.fontMono }}>
                  Includes 30 days post-launch support
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 24,
                  padding: '16px 0',
                  borderTop: `1px solid ${tk.border}`,
                  borderBottom: `1px solid ${tk.border}`,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, marginBottom: 4 }}>DELIVERY</div>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: tk.fontDisplay }}>
                    {estimate.weeksMin}–{estimate.weeksMax} wks
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, marginBottom: 4 }}>PROJECT</div>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: tk.fontDisplay }}>
                    {selectedProject.icon} {selectedProject.label}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, marginBottom: 12, letterSpacing: '0.08em' }}>
                  COST BREAKDOWN
                </div>
                {estimate.breakdown.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: i < estimate.breakdown.length - 1 ? `1px solid ${tk.border}` : 'none',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: tk.textMuted, paddingRight: 12 }}>{item.label}</span>
                    <span
                      style={{
                        fontFamily: tk.fontMono,
                        color: item.amount < 0 ? tk.green : tk.text,
                        flexShrink: 0,
                      }}
                    >
                      {item.amount < 0 ? '−' : ''}{formatNPR(Math.abs(item.amount))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Visual bar */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, marginBottom: 10 }}>BUDGET COMPOSITION</div>
                <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
                  {estimate.breakdown.filter(b => b.amount > 0).map((item, i, arr) => {
                    const positiveTotal = arr.reduce((s, x) => s + x.amount, 0);
                    const pct = (item.amount / positiveTotal) * 100;
                    const colors = [tk.gold, tk.purple, tk.cyan, tk.green, tk.red];
                    return (
                      <div
                        key={i}
                        title={`${item.label}: ${formatNPR(item.amount)}`}
                        style={{ width: `${pct}%`, background: colors[i % colors.length], transition: 'width 0.4s ease' }}
                      />
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link
                  href="/pages/contact"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: tk.gold,
                    color: '#050810',
                    padding: '14px 24px',
                    borderRadius: 10,
                    fontFamily: tk.fontMono,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s',
                  }}
                >
                  Get Official Quote →
                </Link>
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: 'transparent',
                    color: copied ? tk.green : tk.textDim,
                    padding: '12px 24px',
                    borderRadius: 10,
                    border: `1px solid ${copied ? tk.green : tk.border}`,
                    fontFamily: tk.fontMono,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? '✓ Copied to Clipboard' : 'Copy Estimate Summary'}
                </button>
              </div>

              <p style={{ fontSize: 11, color: tk.textDim, lineHeight: 1.6, marginTop: 16, marginBottom: 0 }}>
                Indicative estimate only. Final pricing confirmed after a free discovery call. No obligation.
              </p>
            </div>

            <div style={{ ...cardStyle, padding: '20px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: tk.fontDisplay, marginBottom: 8, color: tk.cyan }}>
                💡 Pro Tip
              </div>
              <p style={{ fontSize: 13, color: tk.textDim, lineHeight: 1.65, margin: 0 }}>
                Start with <strong style={{ color: tk.text }}>Standard</strong> complexity and add features incrementally.
                Most clients save 15–20% by choosing a flexible timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section style={{ background: tk.bgAlt, borderTop: `1px solid ${tk.border}`, borderBottom: `1px solid ${tk.border}`, padding: '64px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ ...sectionLabel, textAlign: 'center' }}>How It Works</div>
            <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, margin: 0 }}>
              From Estimate to Launch
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {methodology.map(m => (
              <div
                key={m.step}
                style={{
                  ...cardStyle,
                  padding: '24px 20px',
                }}
              >
                <div style={{ fontFamily: tk.fontMono, fontSize: 28, fontWeight: 700, color: tk.gold, opacity: 0.5, marginBottom: 12 }}>
                  {m.step}
                </div>
                <div style={{ fontFamily: tk.fontDisplay, fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{m.title}</div>
                <p style={{ fontSize: 13, color: tk.textDim, lineHeight: 1.65, margin: 0 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '64px 20px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ ...sectionLabel, textAlign: 'center' }}>FAQ</div>
          <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, margin: 0 }}>
            Common Questions
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                ...cardStyle,
                padding: 0,
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 22px',
                  background: 'none',
                  border: 'none',
                  color: tk.text,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: tk.fontDisplay,
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {faq.q}
                <span style={{ color: tk.gold, fontSize: 18, flexShrink: 0, marginLeft: 16 }}>
                  {openFaq === i ? '−' : '+'}
                </span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 22px 18px', fontSize: 14, color: tk.textDim, lineHeight: 1.75 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 48,
            textAlign: 'center',
            padding: '36px 24px',
            borderRadius: 16,
            background: `linear-gradient(135deg, rgba(245,200,66,0.1), rgba(168,85,247,0.08))`,
            border: `1px solid ${tk.gold}30`,
          }}
        >
          <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 22, fontWeight: 900, marginBottom: 10 }}>
            Ready to build something great?
          </h3>
          <p style={{ fontSize: 14, color: tk.textDim, marginBottom: 20, lineHeight: 1.7 }}>
            Share your estimate with our team and get a detailed proposal within 24 hours.
          </p>
          <Link
            href="/pages/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: tk.gold,
              color: '#050810',
              padding: '12px 28px',
              borderRadius: 10,
              fontFamily: tk.fontMono,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Start Your Project →
          </Link>
        </div>
      </section>
    </div>
  );
}
