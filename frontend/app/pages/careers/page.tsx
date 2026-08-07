'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';

interface JobOpening {
  id: number | string;
  title: string;
  type: string;
  location: string;
  department: string;
  experience: string;
  description: string;
  tags: string[];
  color: string;
}

const fallbackOpenings: JobOpening[] = [
  {
    id: 1,
    title: 'Senior Full-Stack Engineer (Next.js / Node / PostgreSQL)',
    type: 'Full-time',
    location: 'Butwal / Remote (Nepal)',
    department: 'Engineering',
    experience: '3+ Years',
    description: 'Lead the architecture and implementation of scalable web applications, custom SaaS products, and high-throughput APIs.',
    tags: ['React', 'Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
    color: tk.cyan,
  },
  {
    id: 2,
    title: 'AI / LLM Integration Specialist',
    type: 'Full-time',
    location: 'Remote / Office',
    department: 'AI Research',
    experience: '2+ Years',
    description: 'Develop multi-agent workflows, vector database RAG pipelines, and intelligent chatbots for business automation.',
    tags: ['Python', 'LangChain', 'OpenAI API', 'Vector DBs'],
    color: tk.purple,
  },
  {
    id: 3,
    title: 'Product Designer (UI/UX & Glassmorphism Aesthetics)',
    type: 'Full-time / Contract',
    location: 'Butwal / Remote',
    department: 'Design',
    experience: '2+ Years',
    description: 'Craft intuitive web interfaces, mobile app visual languages, design systems, and modern interactive prototypes.',
    tags: ['Figma', 'Design Systems', 'Prototyping', 'CSS/Web Aesthetics'],
    color: tk.green,
  },
];

const perks = [
  { icon: '🚀', title: 'High-Impact Work', desc: 'Build software that powers hotels, schools, retail, and tech ventures across Nepal & abroad.' },
  { icon: '💸', title: 'Competitive Compensation', desc: 'Industry-leading salary, performance bonuses, and annual growth reviews.' },
  { icon: '🧠', title: 'Continuous Growth', desc: 'Unlimited access to tech courses, AI certifications, and mentorship from senior engineers.' },
  { icon: '🏖️', title: 'Flexible Working', desc: 'Hybrid & remote work options, paid leave, and work-life balance built into company culture.' },
];

export default function CareersPage() {
  const [openings, setOpenings] = useState<JobOpening[]>(fallbackOpenings);
  const [loading, setLoading] = useState(true);
  const [activeDept, setActiveDept] = useState('All');

  useEffect(() => {
    fetch('http://localhost:5000/api/careers')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch careers');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setOpenings(data);
        }
      })
      .catch((err) => {
        console.warn('Using fallback career openings:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Compute unique departments dynamically
  const departments = ['All', ...Array.from(new Set(openings.map(o => o.department)))];

  const filteredOpenings = activeDept === 'All'
    ? openings
    : openings.filter(o => o.department === activeDept);

  return (
    <div style={{ background: tk.bg || '#050810', color: tk.text, minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
      {/* Hero */}
      <section
        style={{
          background: `radial-gradient(ellipse 900px 600px at 50% 20%, rgba(0,229,160,0.12), transparent 60%),
                       radial-gradient(ellipse 800px 700px at 10% 80%, rgba(0,212,255,0.1), transparent 60%),
                       ${tk.bg || '#050810'}`,
          padding: '120px 20px 70px',
          textAlign: 'center',
          position: 'relative',
          borderBottom: `1px solid ${tk.border}`,
        }}
      >
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0,229,160,0.08)',
              border: '1px solid rgba(0,229,160,0.25)',
              borderRadius: 20,
              padding: '6px 16px',
              color: tk.green,
              fontSize: 11,
              fontFamily: tk.fontMono,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            💼 Join Our Team
          </div>
          <h1
            style={{
              fontFamily: tk.fontDisplay,
              fontSize: 'clamp(36px, 6vw, 64px)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: 20,
              letterSpacing: '-0.03em',
            }}
          >
            Build the Future of Tech with{' '}
            <span
              style={{
                background: `linear-gradient(135deg, ${tk.green}, ${tk.cyan})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              D-Kode Era
            </span>
          </h1>
          <p style={{ fontSize: 17, color: tk.textDim, lineHeight: 1.8, maxWidth: 640, margin: '0 auto' }}>
            We are looking for passionate engineers, AI innovators, and UI/UX designers ready to push boundaries and build world-class digital products.
          </p>
        </div>
      </section>

      {/* Perks Section */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px' }}>
        <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 40, color: tk.text }}>
          Why Work With Us?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
          {perks.map((p, idx) => (
            <div
              key={idx}
              style={{
                background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                border: `1px solid ${tk.border}`,
                borderRadius: 14,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 12 }}>{p.icon}</div>
              <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 18, fontWeight: 700, marginBottom: 8, color: tk.text }}>
                {p.title}
              </h3>
              <p style={{ fontSize: 14, color: tk.textDim, lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Openings Section */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
          <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 28, fontWeight: 800, color: tk.text }}>
            Open Roles ({filteredOpenings.length})
          </h2>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDept(dept)}
                style={{
                  background: activeDept === dept ? tk.green : 'rgba(255,255,255,0.03)',
                  color: activeDept === dept ? '#050810' : tk.textDim,
                  border: `1px solid ${activeDept === dept ? tk.green : tk.border}`,
                  padding: '6px 14px',
                  borderRadius: 16,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  fontWeight: activeDept === dept ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: tk.textDim, fontFamily: tk.fontMono }}>
            Loading job openings...
          </div>
        ) : filteredOpenings.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', background: tk.surface, border: `1px dashed ${tk.border}`, borderRadius: 16 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>💼</div>
            <h3 style={{ fontSize: 18, color: tk.text, margin: '0 0 8px' }}>No Current Openings in {activeDept}</h3>
            <p style={{ fontSize: 14, color: tk.textDim, margin: 0 }}>Select another department or send an open application via our contact page.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filteredOpenings.map((role) => (
              <div
                key={role.id}
                style={{
                  background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                  border: `1px solid ${tk.border}`,
                  borderRadius: 16,
                  padding: 28,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 20,
                  transition: 'all 0.25s ease',
                }}
              >
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontFamily: tk.fontMono, padding: '2px 8px', borderRadius: 8, background: 'rgba(0,229,160,0.1)', color: tk.green, border: '1px solid rgba(0,229,160,0.25)', fontWeight: 600 }}>
                      {role.type}
                    </span>
                    <span style={{ fontSize: 10, fontFamily: tk.fontMono, padding: '2px 8px', borderRadius: 8, background: 'rgba(6,182,212,0.1)', color: tk.cyan, border: '1px solid rgba(6,182,212,0.25)', fontWeight: 600 }}>
                      {role.department}
                    </span>
                    <span style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono }}>
                      📍 {role.location}
                    </span>
                    <span style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono }}>
                      ⏳ {role.experience}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 20, fontWeight: 800, marginBottom: 8, color: tk.text }}>
                    {role.title}
                  </h3>
                  <p style={{ fontSize: 14, color: tk.textDim, lineHeight: 1.6, marginBottom: 16 }}>
                    {role.description}
                  </p>

                  {Array.isArray(role.tags) && role.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {role.tags.map((tag) => (
                        <span key={tag} style={{ fontSize: 10, fontFamily: tk.fontMono, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', color: tk.textMuted, border: `1px solid ${tk.border}` }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href={`/pages/careers/${role.id}`}
                  style={{
                    background: role.color || tk.cyan,
                    color: '#050810',
                    padding: '12px 24px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontFamily: tk.fontMono,
                    fontWeight: 800,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    boxShadow: `0 4px 14px ${role.color || tk.cyan}40`,
                  }}
                >
                  View Role & Apply →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
