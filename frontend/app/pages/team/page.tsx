'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  id: number;
  icon: string;
  role: string;
  name: string;
  desc: string;
  skills: string[];
}

// ─── Static accent colours cycling per card ──────────────────────────────────

const ACCENTS = [tk.cyan, tk.purple, tk.gold, tk.green, tk.red, '#06b6d4'];

const culture = [
  { icon: '🌅', title: 'Remote-Friendly', desc: 'Our team collaborates across locations while staying deeply connected to Butwal.' },
  { icon: '📚', title: 'Always Learning', desc: 'We invest in training, courses, and conferences to stay ahead of technology trends.' },
  { icon: '🤝', title: 'Client-Centric', desc: 'Every decision we make is filtered through one question: Is this best for the client?' },
  { icon: '⚡', title: 'Move Fast', desc: 'We ship in days, not months. Speed is a feature — and we built it into our culture.' },
];

const openRoles = [
  { title: 'React.js Developer', type: 'Full-Time · Butwal', color: tk.cyan, desc: '2+ years experience, proficiency in Next.js, REST APIs, and TypeScript.' },
  { title: 'Digital Marketing Executive', type: 'Full-Time · Butwal', color: tk.purple, desc: 'Meta Ads, Google Ads, and content creation. Nepal market experience preferred.' },
  { title: 'UI/UX Designer (Intern)', type: 'Internship · 3 months', color: tk.gold, desc: 'Figma skills required. Build real projects for real clients from day one.' },
];

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      padding: 32, borderRadius: 16,
      background: 'rgba(13,20,37,0.6)', border: `1px solid ${tk.border}`,
      display: 'flex', flexDirection: 'column', gap: 16,
      animation: 'pulse 1.6s ease-in-out infinite',
    }}>
      {/* Avatar placeholder */}
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', margin: '0 auto' }} />
      {/* Role badge */}
      <div style={{ width: 100, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.05)', margin: '0 auto' }} />
      {/* Name */}
      <div style={{ width: '70%', height: 20, borderRadius: 6, background: 'rgba(255,255,255,0.05)', margin: '0 auto' }} />
      {/* Bio lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ width: '100%', height: 10, borderRadius: 6, background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ width: '85%', height: 10, borderRadius: 6, background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ width: '60%', height: 10, borderRadius: 6, background: 'rgba(255,255,255,0.04)' }} />
      </div>
      {/* Skill pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {[80, 64, 72].map((w, i) => (
          <div key={i} style={{ width: w, height: 24, borderRadius: 20, background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    </div>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────

function isPhotoUrl(s: string) {
  return s?.startsWith('http') || s?.startsWith('/uploads') || s?.startsWith('data:');
}

function MemberCard({ member, accent }: { member: TeamMember; accent: string }) {
  const [hovered, setHovered] = useState(false);
  const hasPhoto = isPhotoUrl(member.icon);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 32, borderRadius: 16,
        background: hovered
          ? `linear-gradient(135deg, ${accent}12, ${accent}06)`
          : 'rgba(13,20,37,0.6)',
        border: `1px solid ${hovered ? accent + '50' : tk.border}`,
        borderTop: `3px solid ${accent}`,
        textAlign: 'center',
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${accent}20` : 'none',
        cursor: 'default',
      }}
    >
      {/* Avatar — real photo or emoji fallback */}
      <div style={{
        width: 120, height: 120, margin: '0 auto 20px',
        borderRadius: '50%',
        background: `${accent}18`,
        border: `2.5px solid ${accent}45`,
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 54,
        transition: 'border-color 0.3s',
        flexShrink: 0,
      }}>
        {hasPhoto
          ? <img src={member.icon} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (member.icon || '👤')
        }
      </div>

      {/* Role badge */}
      <div style={{
        display: 'inline-block', padding: '3px 12px',
        background: `${accent}14`, border: `1px solid ${accent}30`,
        borderRadius: 20, fontSize: 10,
        fontFamily: tk.fontMono, letterSpacing: '0.1em',
        color: accent, textTransform: 'uppercase',
        marginBottom: 10,
      }}>
        {member.role}
      </div>

      {/* Name */}
      <h2 style={{
        fontFamily: tk.fontDisplay, fontSize: 20, fontWeight: 800,
        color: tk.text, marginBottom: 12, lineHeight: 1.2,
      }}>
        {member.name}
      </h2>

      {/* Bio */}
      <p style={{
        fontSize: 13.5, color: tk.textMuted, lineHeight: 1.8,
        marginBottom: 20, minHeight: 64,
      }}>
        {member.desc}
      </p>

      {/* Divider */}
      <div style={{ height: 1, background: `${accent}20`, margin: '0 0 18px' }} />

      {/* Skills */}
      {member.skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
          {member.skills.map((s) => (
            <span key={s} style={{
              padding: '4px 12px',
              background: `${accent}10`,
              border: `1px solid ${accent}25`,
              borderRadius: 20, fontSize: 11,
              color: accent, fontFamily: tk.fontMono,
            }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/team')
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        return res.json();
      })
      .then((data: TeamMember[]) => {
        setMembers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load team:', err);
        setError('Unable to load team members right now.');
        setLoading(false);
      });
  }, []);

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        background: `
          radial-gradient(ellipse 900px 600px at 10% 0%, rgba(168,85,247,0.14), transparent 60%),
          radial-gradient(ellipse 700px 500px at 90% 40%, rgba(0,212,255,0.10), transparent 60%),
          ${tk.bg}
        `,
        minHeight: '70vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px 20px 80px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Dot-grid texture */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(168,85,247,0.3) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 0%, transparent 75%)',
          opacity: 0.4, pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block', padding: '8px 18px',
            background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.35)',
            borderRadius: 20, color: tk.purple,
            fontSize: 12, fontFamily: tk.fontMono,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: 28,
          }}>
            ◉ Expert Devs
          </div>

          <h1 style={{
            fontFamily: tk.fontDisplay,
            fontSize: 'clamp(36px,6vw,72px)',
            fontWeight: 800, lineHeight: 1.1,
            marginBottom: 22, letterSpacing: '-0.03em',
            color: tk.text,
          }}>
            The People Behind{' '}
            <span style={{
              background: `linear-gradient(135deg, ${tk.purple}, ${tk.cyan})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>
              D-Kode Era.
            </span>
          </h1>

          <p style={{ fontSize: 17, color: tk.textMuted, maxWidth: 580, margin: '0 auto', lineHeight: 1.8 }}>
            A small but mighty team of builders, designers, and strategists obsessed with delivering world-class digital products for Nepal&apos;s businesses.
          </p>

          {/* Live member count badge */}
          {!loading && !error && members.length > 0 && (
            <div style={{
              marginTop: 32, display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 18px',
              background: 'rgba(0,229,160,0.08)', border: `1px solid rgba(0,229,160,0.25)`,
              borderRadius: 20, fontSize: 12, color: tk.green,
              fontFamily: tk.fontMono, letterSpacing: '0.08em',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: tk.green, display: 'inline-block', boxShadow: `0 0 8px ${tk.green}` }} />
              {members.length} active team member{members.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </section>

      {/* ─── Team Grid ────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div style={{
              textAlign: 'center', padding: '64px 24px',
              background: 'rgba(255,107,107,0.05)', border: `1px solid rgba(255,107,107,0.2)`,
              borderRadius: 16,
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 22, fontWeight: 700, color: tk.text, marginBottom: 10 }}>
                {error}
              </h2>
              <p style={{ fontSize: 14, color: tk.textDim, marginBottom: 28 }}>
                Check that the backend server is running at <code style={{ color: tk.cyan }}>localhost:5000</code>.
              </p>
              <button
                onClick={() => { setError(null); setLoading(true); fetch('http://localhost:5000/api/team').then(r => r.json()).then(d => { setMembers(d); setLoading(false); }).catch(() => { setError('Still unable to load team.'); setLoading(false); }); }}
                style={{ padding: '11px 28px', background: tk.cyan, color: '#050810', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: tk.fontBody }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Team cards */}
          {!loading && !error && members.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {members.map((member, i) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  accent={ACCENTS[i % ACCENTS.length]}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && members.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 24px', color: tk.textDim }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
              <p style={{ fontSize: 16 }}>No team members found. Add some from the admin panel.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Culture ──────────────────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)',
        background: 'rgba(13,20,37,0.4)',
        borderTop: `1px solid ${tk.border}`,
        borderBottom: `1px solid ${tk.border}`,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: tk.purple, fontFamily: tk.fontMono, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>HOW WE WORK</div>
            <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: tk.text }}>
              Our Culture & Values
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {culture.map((c) => (
              <div key={c.title} style={{
                padding: 28, background: 'rgba(13,20,37,0.6)',
                border: `1px solid ${tk.border}`, borderRadius: 14, textAlign: 'center',
              }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{c.icon}</div>
                <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 17, fontWeight: 700, color: tk.text, marginBottom: 10 }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: tk.textDim, lineHeight: 1.7 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Open Roles ───────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: tk.cyan, fontFamily: tk.fontMono, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>WE'RE HIRING</div>
            <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: tk.text }}>Join Our Team</h2>
            <p style={{ fontSize: 15, color: tk.textMuted, marginTop: 14, maxWidth: 500, margin: '12px auto 0' }}>
              We&apos;re always looking for talented people passionate about building great tech in Nepal.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {openRoles.map((role) => (
              <div key={role.title} style={{
                padding: '24px 28px', background: 'rgba(13,20,37,0.6)',
                border: `1px solid ${tk.border}`, borderRadius: 12,
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: 16,
                borderLeft: `3px solid ${role.color}`,
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 17, fontWeight: 700, color: tk.text }}>{role.title}</h3>
                    <span style={{ padding: '3px 10px', background: `${role.color}10`, border: `1px solid ${role.color}30`, borderRadius: 20, fontSize: 11, color: role.color, fontFamily: tk.fontMono }}>{role.type}</span>
                  </div>
                  <p style={{ fontSize: 13, color: tk.textDim }}>{role.desc}</p>
                </div>
                <Link href="/pages/contact" style={{
                  padding: '11px 22px', background: 'transparent',
                  color: role.color, border: `2px solid ${role.color}`,
                  borderRadius: 8, textDecoration: 'none',
                  fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
                }}>
                  Apply →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(60px,8vw,100px) 20px', textAlign: 'center',
        background: `radial-gradient(ellipse 700px 400px at 50% 0%, rgba(168,85,247,0.07), transparent 70%), rgba(13,20,37,0.3)`,
        borderTop: `1px solid ${tk.border}`,
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: tk.text, marginBottom: 16 }}>
            Work With Our Team
          </h2>
          <p style={{ fontSize: 16, color: tk.textMuted, marginBottom: 40, lineHeight: 1.8 }}>
            Ready to start a project? Reach out — we respond within 24 hours.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/pages/contact" style={{
              padding: '14px 32px', background: tk.purple, color: '#fff',
              borderRadius: 8, fontSize: 15, fontWeight: 700,
              textDecoration: 'none', fontFamily: tk.fontBody,
              boxShadow: `0 4px 20px rgba(168,85,247,0.3)`,
            }}>
              Contact Us →
            </Link>
            <Link href="/pages/work" style={{
              padding: '14px 32px', background: 'transparent',
              color: tk.purple, border: `2px solid ${tk.purple}`,
              borderRadius: 8, fontSize: 15, fontWeight: 600,
              textDecoration: 'none',
            }}>
              See Our Work
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
