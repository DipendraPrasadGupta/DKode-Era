'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { IOT_LEVELS, IoTProject } from '@/lib/iotData';
import { fetchIotProjects, IOT_CHANGE_EVENT } from '@/lib/iotProjectsStore';
import { normalizeImageUrl } from '@/lib/api';
import { pageTokens as tk } from '@/lib/pageTokens';

// ─── CSS Keyframes ─────────────────────────────────────────────────────────
const CSS_ANIM = [
  '@keyframes floatUp{0%{opacity:0;transform:translateY(24px)}100%{opacity:1;transform:translateY(0)}}',
  '@keyframes shimmerBg{0%{background-position:-200% center}100%{background-position:200% center}}',
  '@keyframes pulseRing{0%{transform:scale(0.9);opacity:1}100%{transform:scale(1.6);opacity:0}}',
  '@keyframes cardEnter{0%{opacity:0;transform:translateY(28px) scale(0.97)}100%{opacity:1;transform:translateY(0) scale(1)}}',
  '@keyframes modalEnter{0%{opacity:0;transform:scale(0.93) translateY(18px)}100%{opacity:1;transform:scale(1) translateY(0)}}',
].join(' ');

// ─── Animated counter ──────────────────────────────────────────────────────
function AnimCount({ to, suf = '' }: { to: number; suf?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let cur = 0; const step = Math.ceil(to / 40);
        const t = setInterval(() => { cur += step; if (cur >= to) { setV(to); clearInterval(t); } else setV(cur); }, 28);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{v}{suf}</span>;
}

const LC: Record<number, { from: string; to: string }> = {
  1: { from: 'rgba(0,212,255,0.15)', to: 'rgba(0,212,255,0.04)' },
  2: { from: 'rgba(168,85,247,0.15)', to: 'rgba(168,85,247,0.04)' },
  3: { from: 'rgba(0,229,160,0.15)', to: 'rgba(0,229,160,0.04)' },
};

export default function IoTProjectsPage() {
  const [allProjects, setAllProjects] = useState<IoTProject[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSensorTag, setSelectedSensorTag] = useState<string | null>(null);
  const [activeModalProject, setActiveModalProject] = useState<IoTProject | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [copiedCode, setCopiedCode] = useState(false);
  const [brochureModalOpen, setBrochureModalOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'pins' | 'code'>('overview');

  useEffect(() => {
    fetchIotProjects()
      .then((data) => setAllProjects(data))
      .catch(() => setAllProjects([]));

    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent;
      if (Array.isArray(custom.detail)) setAllProjects(custom.detail);
    };
    window.addEventListener(IOT_CHANGE_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(IOT_CHANGE_EVENT, handleUpdate);
    };
  }, []);

  // Inquiry form states
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryProject, setInquiryProject] = useState('');
  const [inquiryType, setInquiryType] = useState('Hands-on Workshop');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Extract top sensor tags for quick filter chips
  const allSensorTags = useMemo(() => {
    const counts: Record<string, number> = {};
    allProjects.forEach((p) => {
      p.sensors.forEach((s) => {
        const clean = s.split('(')[0].replace(/Module|Sensor|Driver|Module/gi, '').trim();
        if (clean.length > 2) counts[clean] = (counts[clean] || 0) + 1;
      });
    });
    return Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 10);
  }, [allProjects]);

  // Filter projects based on level, search, and sensor tag
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      const matchesLevel = selectedLevel === 'all' || p.levelNum === selectedLevel;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sensors.some((s) => s.toLowerCase().includes(q)) ||
        p.microcontroller.toLowerCase().includes(q);

      const matchesSensor =
        !selectedSensorTag ||
        p.sensors.some((s) => s.toLowerCase().includes(selectedSensorTag.toLowerCase()));

      return matchesLevel && matchesSearch && matchesSensor;
    });
  }, [allProjects, selectedLevel, searchQuery, selectedSensorTag]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleQuickInquire = (project: IoTProject) => {
    setInquiryProject(project.title);
    setActiveModalProject(null);
    const formEl = document.getElementById('inquiry-section');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div style={{ background: tk.bg, minHeight: '100vh', color: tk.text, position: 'relative', overflow: 'hidden' }}>
      {/* Inject CSS Animations */}
      <style>{CSS_ANIM}</style>

      {/* ─── DYNAMIC BACKGROUND CIRCUIT GRID & GLOW ──────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 700,
          background: 'radial-gradient(ellipse 90% 60% at 50% -20%, rgba(0, 212, 255, 0.18), transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 350,
          right: '-8%',
          width: 550,
          height: 550,
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 900,
          left: '-10%',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(0, 229, 160, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '30px 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* ─── HERO SHOWCASE SECTION ─────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 40,
            alignItems: 'center',
            marginBottom: 60,
            background: 'linear-gradient(135deg, rgba(13, 20, 37, 0.7) 0%, rgba(8, 13, 26, 0.9) 100%)',
            border: `1px solid ${tk.border}`,
            borderRadius: 24,
            padding: 'clamp(28px, 4vw, 48px)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Left Column: Heading, Value Props, and CTAs */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 20,
                background: 'rgba(0, 212, 255, 0.08)',
                border: '1px solid rgba(0, 212, 255, 0.28)',
                marginBottom: 18,
                fontFamily: tk.fontMono,
                fontSize: 11,
                letterSpacing: '0.12em',
                color: tk.cyan,
                textTransform: 'uppercase',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 10px #00d4ff' }} />
              D-KODE ERA • EMBEDDED & HARDWARE LAB
            </div>

            <h1
              style={{
                fontFamily: tk.fontDisplay,
                fontSize: 'clamp(32px, 4.8vw, 56px)',
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                marginBottom: 16,
              }}
            >
              Build Real-World <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #00e5a0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Smart IoT Solutions
              </span>
            </h1>

            <p
              style={{
                fontFamily: tk.fontBody,
                fontSize: 'clamp(15px, 1.8vw, 17px)',
                color: tk.textMuted,
                lineHeight: 1.65,
                marginBottom: 28,
                maxWidth: 580,
              }}
            >
              From simple sensors to connected smart systems — explore <strong>{allProjects.length} practical IoT projects</strong>.
              Equip yourself with hands-on embedded skills, wiring blueprints, and production firmware.
            </p>

            {/* Quick Metrics Chips with Animated Counters */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${tk.border}`, padding: '10px 16px', borderRadius: 12, minWidth: 90 }}>
                <div style={{ color: tk.cyan, fontWeight: 900, fontFamily: tk.fontDisplay, fontSize: 22, lineHeight: 1 }}>
                  <AnimCount to={allProjects.length} />
                </div>
                <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, marginTop: 3 }}>Projects Catalog</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${tk.border}`, padding: '10px 16px', borderRadius: 12, minWidth: 90 }}>
                <div style={{ color: tk.purple, fontWeight: 900, fontFamily: tk.fontDisplay, fontSize: 22, lineHeight: 1 }}>
                  <AnimCount to={3} />
                </div>
                <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, marginTop: 3 }}>Skill Levels</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${tk.border}`, padding: '10px 16px', borderRadius: 12, minWidth: 90 }}>
                <div style={{ color: tk.green, fontWeight: 900, fontFamily: tk.fontDisplay, fontSize: 22, lineHeight: 1 }}>
                  <AnimCount to={100} suf="%" />
                </div>
                <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, marginTop: 3 }}>Hands-on Lab</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="#project-catalog"
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0077ff 100%)',
                  color: '#050810',
                  padding: '12px 24px',
                  borderRadius: 10,
                  fontWeight: 800,
                  fontSize: 13.5,
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(0, 212, 255, 0.3)',
                }}
              >
                Browse {allProjects.length} Projects ↓
              </a>
              <button
                onClick={() => setBrochureModalOpen(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#fff',
                  padding: '12px 20px',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>📜</span> View Official Brochure
              </button>
            </div>
          </div>

          {/* Right Column: Visual Showcase Preview Card */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: 20,
                overflow: 'hidden',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 212, 255, 0.15)',
                background: '#0a0f1d',
              }}
            >
              <img
                src="/iot/hero-robot-car2.png"
                alt="D-Kode Era IoT Smart Solutions"
                style={{
                  width: '100%',
                  height: 480,
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'contrast(1.05)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10, 15, 29, 0.95) 0%, rgba(10, 15, 29, 0.2) 60%, transparent 100%)',
                }}
              />

              <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.cyan, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    PROTOTYPE FABRICATION
                  </span>
                  <div style={{ fontFamily: tk.fontDisplay, fontSize: 18, fontWeight: 800, color: '#fff' }}>
                    Real Projects, Real Skills
                  </div>
                  <div style={{ fontSize: 12, color: tk.textMuted }}>
                    Turn smart ideas into working models in Manigram, Butwal.
                  </div>
                </div>

                <button
                  onClick={() => setBrochureModalOpen(true)}
                  style={{
                    background: 'rgba(0, 212, 255, 0.2)',
                    border: '1px solid rgba(0, 212, 255, 0.4)',
                    color: tk.cyan,
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: tk.fontMono,
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Poster HD ↗
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 3 PROGRESSION LEVELS ROADMAP ────────────────────────────────────── */}
        <div style={{ marginBottom: 50 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ fontFamily: tk.fontMono, fontSize: 11, letterSpacing: '0.2em', color: tk.cyan, textTransform: 'uppercase' }}>
              STRUCTURED LEARNING ROADMAP
            </span>
            <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, margin: '8px 0 0' }}>
              Three-Tier Progression Path
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[1, 2, 3].map((lvlNum) => {
              const info = IOT_LEVELS[lvlNum];
              const isCurrentFilter = selectedLevel === lvlNum;
              const count = allProjects.filter((p) => p.levelNum === lvlNum).length;

              return (
                <div
                  key={lvlNum}
                  onClick={() => setSelectedLevel(isCurrentFilter ? 'all' : lvlNum)}
                  style={{
                    background: isCurrentFilter ? info.bgColor : 'rgba(13, 20, 37, 0.55)',
                    border: `1px solid ${isCurrentFilter ? info.color : tk.border}`,
                    borderRadius: 16,
                    padding: '24px 22px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                    boxShadow: isCurrentFilter ? `0 10px 30px ${info.borderColor}` : 'none',
                    transform: isCurrentFilter ? 'translateY(-4px)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        background: info.bgColor,
                        border: `1px solid ${info.borderColor}`,
                        color: info.color,
                        fontFamily: tk.fontMono,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {info.badge} • {count} Projects
                    </span>
                    <span style={{ fontSize: 24 }}>{info.icon}</span>
                  </div>

                  <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>
                    {info.title} Tier
                  </h3>

                  <p style={{ fontFamily: tk.fontBody, fontSize: 13, color: info.color, fontWeight: 600, margin: '0 0 14px', lineHeight: 1.5 }}>
                    {info.tagline}
                  </p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {info.focus.map((f, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: tk.textMuted }}>
                        <span style={{ color: info.color, fontSize: 9 }}>◆</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${tk.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim }}>
                      {isCurrentFilter ? 'Showing active level' : 'Filter by this level'}
                    </span>
                    <span style={{ color: info.color, fontSize: 12.5, fontWeight: 700 }}>
                      {isCurrentFilter ? 'Active ✓' : 'Filter →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── PROJECT CATALOG CONTROLS ────────────────────────────────────────── */}
        <div id="project-catalog" style={{ marginBottom: 36, scrollMarginTop: 100 }}>

          <div
            style={{
              background: 'rgba(13, 20, 37, 0.75)',
              border: `1px solid ${tk.border}`,
              borderRadius: 18,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Top row: Filter Pills & Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>

              {/* Level Segmented Buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedLevel('all')}
                  style={{
                    background: selectedLevel === 'all' ? tk.cyan : 'rgba(255, 255, 255, 0.05)',
                    color: selectedLevel === 'all' ? '#050810' : '#fff',
                    border: '1px solid transparent',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: tk.fontBody,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  All Projects ({allProjects.length})
                </button>
                <button
                  onClick={() => setSelectedLevel(1)}
                  style={{
                    background: selectedLevel === 1 ? '#00d4ff' : 'rgba(0, 212, 255, 0.06)',
                    color: selectedLevel === 1 ? '#050810' : '#00d4ff',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: tk.fontBody,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  🌱 Level 1: Beginner ({allProjects.filter((p) => p.levelNum === 1).length})
                </button>
                <button
                  onClick={() => setSelectedLevel(2)}
                  style={{
                    background: selectedLevel === 2 ? '#a855f7' : 'rgba(168, 85, 247, 0.06)',
                    color: selectedLevel === 2 ? '#fff' : '#a855f7',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: tk.fontBody,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  ⚙️ Level 2: Intermediate ({allProjects.filter((p) => p.levelNum === 2).length})
                </button>
                <button
                  onClick={() => setSelectedLevel(3)}
                  style={{
                    background: selectedLevel === 3 ? '#00e5a0' : 'rgba(0, 229, 160, 0.06)',
                    color: selectedLevel === 3 ? '#050810' : '#00e5a0',
                    border: '1px solid rgba(0, 229, 160, 0.3)',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: tk.fontBody,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  🚀 Level 3: Advanced ({allProjects.filter((p) => p.levelNum === 3).length})
                </button>
              </div>

              {/* View Mode Toggle & Search */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', background: 'rgba(5, 8, 16, 0.6)', border: `1px solid ${tk.border}`, borderRadius: 8, padding: 2 }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                    style={{
                      background: viewMode === 'grid' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                      color: viewMode === 'grid' ? '#fff' : tk.textDim,
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    ▦ Grid
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    title="Table View"
                    style={{
                      background: viewMode === 'table' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                      color: viewMode === 'table' ? '#fff' : tk.textDim,
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    ☰ Specs Table
                  </button>
                </div>

                <div style={{ position: 'relative', minWidth: 220, maxWidth: 300, flex: '1 1 220px' }}>
                  <input
                    type="text"
                    placeholder="Search 30 projects, sensors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(5, 8, 16, 0.8)',
                      border: `1px solid ${tk.border}`,
                      borderRadius: 8,
                      padding: '8px 12px 8px 32px',
                      color: '#fff',
                      fontSize: 13,
                      fontFamily: tk.fontBody,
                      outline: 'none',
                    }}
                  />
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: tk.textDim, fontSize: 13 }}>
                    🔍
                  </span>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: tk.textDim,
                        cursor: 'pointer',
                        fontSize: 11,
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Popular Sensor Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 4 }}>
              <span style={{ fontFamily: tk.fontMono, fontSize: 11, color: tk.textDim, textTransform: 'uppercase' }}>
                Hardware Filter:
              </span>
              <button
                onClick={() => setSelectedSensorTag(null)}
                style={{
                  background: selectedSensorTag === null ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${selectedSensorTag === null ? 'rgba(255, 255, 255, 0.3)' : tk.border}`,
                  color: selectedSensorTag === null ? '#fff' : tk.textMuted,
                  borderRadius: 20,
                  padding: '3px 10px',
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  cursor: 'pointer',
                }}
              >
                All Components
              </button>
              {allSensorTags.map((tag) => {
                const isActive = selectedSensorTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedSensorTag(isActive ? null : tag)}
                    style={{
                      background: isActive ? 'rgba(0, 212, 255, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isActive ? tk.cyan : tk.border}`,
                      color: isActive ? tk.cyan : tk.textMuted,
                      borderRadius: 20,
                      padding: '3px 10px',
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── VIEW 1: ENHANCED GRID VIEW WITH IMAGES ──────────────────────────── */}
        {viewMode === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24, marginBottom: 70 }}>
            {filteredProjects.map((project, cardIdx) => {
              const levelInfo = IOT_LEVELS[project.levelNum];
              const isHov = hoveredCard === project.id;

              return (
                <div
                  key={project.id}
                  style={{
                    background: 'rgba(13, 20, 37, 0.65)',
                    border: `1px solid ${isHov ? project.badgeColor + '70' : tk.border}`,
                    borderRadius: 18,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
                    backdropFilter: 'blur(16px)',
                    transform: isHov ? 'translateY(-8px)' : 'none',
                    boxShadow: isHov ? `0 20px 48px rgba(0,0,0,0.5), 0 0 28px ${project.accentGlow}` : '0 4px 16px rgba(0,0,0,0.2)',
                    animation: `cardEnter 0.5s ${Math.min(cardIdx * 0.06, 0.45)}s both`,
                  }}
                  onMouseEnter={() => setHoveredCard(project.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Glowing Top Line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, transparent, ${project.badgeColor}, transparent)`,
                      zIndex: 2,
                    }}
                  />

                  {/* PROJECT IMAGE BANNER */}
                  <div
                    style={{
                      height: 190,
                      position: 'relative',
                      background: '#060a17',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => setActiveModalProject(project)}
                  >
                    <img
                      src={normalizeImageUrl(project.image)}
                      alt={project.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: '12px',
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(5, 8, 16, 0.8) 100%)',
                        transition: 'transform 0.4s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                    />

                    {/* Gradient Overlay for seamless blending */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(13, 20, 37, 0.95) 0%, rgba(13, 20, 37, 0.1) 60%, transparent 100%)',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Project Number Badge on Image */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: 'rgba(5, 8, 16, 0.85)',
                        border: `1px solid ${project.badgeColor}50`,
                        borderRadius: 8,
                        padding: '3px 9px',
                        fontFamily: tk.fontMono,
                        fontSize: 11,
                        fontWeight: 800,
                        color: project.badgeColor,
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      #{project.id.toString().padStart(2, '0')}
                    </div>

                    {/* Level Pill on Image */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: levelInfo.bgColor,
                        border: `1px solid ${levelInfo.borderColor}`,
                        borderRadius: 14,
                        padding: '3px 10px',
                        fontFamily: tk.fontMono,
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: levelInfo.color,
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {levelInfo.title}
                    </div>

                    {/* Quick Expand Icon */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 12,
                        background: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: 6,
                        padding: '3px 8px',
                        fontSize: 11,
                        color: '#fff',
                        fontFamily: tk.fontMono,
                      }}
                    >
                      🔍 Inspect
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>

                    {/* Title & Icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{project.icon}</span>
                      <h3
                        style={{
                          fontFamily: tk.fontDisplay,
                          fontSize: 19,
                          fontWeight: 800,
                          color: '#fff',
                          margin: 0,
                          lineHeight: 1.25,
                        }}
                      >
                        {project.title}
                      </h3>
                    </div>

                    {/* Tagline / Subtitle */}
                    <p
                      style={{
                        fontFamily: tk.fontBody,
                        fontSize: 13,
                        color: tk.textMuted,
                        lineHeight: 1.55,
                        marginBottom: 16,
                        flexGrow: 1,
                      }}
                    >
                      {project.description}
                    </p>

                    {/* Hardware Components Chips */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontFamily: tk.fontMono, fontSize: 10, color: tk.textDim, textTransform: 'uppercase', marginBottom: 6 }}>
                        Hardware Components:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {project.sensors.slice(0, 3).map((sensor, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: 10.5,
                              fontFamily: tk.fontMono,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              color: '#cbd5e1',
                            }}
                          >
                            {sensor.split('(')[0].trim()}
                          </span>
                        ))}
                        {project.sensors.length > 3 && (
                          <span
                            style={{
                              fontSize: 10.5,
                              fontFamily: tk.fontMono,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: `${project.badgeColor}12`,
                              color: project.badgeColor,
                            }}
                          >
                            +{project.sensors.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Info & Button */}
                    <div
                      style={{
                        paddingTop: 14,
                        borderTop: `1px solid ${isHov ? project.badgeColor + '25' : tk.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'border-color 0.3s',
                      }}
                    >
                      <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim }}>
                        MCU: <span style={{ color: '#fff' }}>{project.microcontroller.split('/')[0]}</span>
                      </div>

                      <button
                        onClick={() => { setModalTab('overview'); setActiveModalProject(project); }}
                        style={{
                          background: isHov ? project.badgeColor : `linear-gradient(135deg, ${project.badgeColor}22 0%, ${project.badgeColor}10 100%)`,
                          border: `1px solid ${project.badgeColor}50`,
                          color: isHov ? '#050810' : project.badgeColor,
                          padding: '6px 14px',
                          borderRadius: 8,
                          fontSize: 11.5,
                          fontWeight: 700,
                          fontFamily: tk.fontMono,
                          cursor: 'pointer',
                          transition: 'all 0.25s',
                        }}
                      >
                        Blueprint →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── VIEW 2: TECHNICAL HIGH-DENSITY SPECS TABLE ──────────────────────── */}
        {viewMode === 'table' && (
          <div
            style={{
              background: 'rgba(13, 20, 37, 0.7)',
              border: `1px solid ${tk.border}`,
              borderRadius: 18,
              overflowX: 'auto',
              marginBottom: 70,
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: tk.fontBody }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: `1px solid ${tk.border}`, textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', color: tk.textDim, fontFamily: tk.fontMono, fontSize: 11 }}>#</th>
                  <th style={{ padding: '14px 16px', color: '#fff', fontFamily: tk.fontMono, fontSize: 11 }}>PROJECT & HARDWARE</th>
                  <th style={{ padding: '14px 16px', color: tk.cyan, fontFamily: tk.fontMono, fontSize: 11 }}>LEVEL</th>
                  <th style={{ padding: '14px 16px', color: tk.textDim, fontFamily: tk.fontMono, fontSize: 11 }}>MICROCONTROLLER</th>
                  <th style={{ padding: '14px 16px', color: tk.textDim, fontFamily: tk.fontMono, fontSize: 11 }}>CORE SENSORS / ACTUATORS</th>
                  <th style={{ padding: '14px 16px', color: tk.textDim, fontFamily: tk.fontMono, fontSize: 11, textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => {
                  const levelInfo = IOT_LEVELS[p.levelNum];
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: `1px solid rgba(255, 255, 255, 0.04)`, transition: 'background 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px', fontFamily: tk.fontMono, color: p.badgeColor, fontWeight: 700 }}>
                        #{p.id.toString().padStart(2, '0')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={p.image}
                            alt={p.title}
                            style={{ width: 44, height: 34, objectFit: 'contain', borderRadius: 6, background: '#070b16' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#fff' }}>{p.title}</div>
                            <div style={{ fontSize: 11.5, color: tk.textMuted }}>{p.tagline}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 12,
                            background: levelInfo.bgColor,
                            border: `1px solid ${levelInfo.borderColor}`,
                            color: levelInfo.color,
                            fontSize: 10.5,
                            fontFamily: tk.fontMono,
                          }}
                        >
                          {p.level}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: tk.fontMono, fontSize: 12, color: '#cbd5e1' }}>
                        {p.microcontroller}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {p.sensors.slice(0, 2).map((s, idx) => (
                            <span key={idx} style={{ fontSize: 10.5, fontFamily: tk.fontMono, background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: 4 }}>
                              {s.split('(')[0].trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => setActiveModalProject(p)}
                          style={{
                            background: `${p.badgeColor}18`,
                            border: `1px solid ${p.badgeColor}40`,
                            color: p.badgeColor,
                            padding: '5px 12px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontFamily: tk.fontMono,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Blueprint →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(13, 20, 37, 0.4)', borderRadius: 16, border: `1px solid ${tk.border}`, marginBottom: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 20 }}>No projects found</h3>
            <p style={{ color: tk.textMuted, fontSize: 14 }}>Try adjusting your search terms or level filters.</p>
            <button
              onClick={() => { setSelectedLevel('all'); setSearchQuery(''); setSelectedSensorTag(null); }}
              style={{
                marginTop: 16,
                padding: '8px 18px',
                borderRadius: 8,
                background: tk.cyan,
                color: '#050810',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ─── 4 CORE PILLARS SECTION ────────────────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(13, 20, 37, 0.8) 0%, rgba(5, 8, 16, 0.95) 100%)',
            border: `1px solid ${tk.border}`,
            borderRadius: 24,
            padding: 'clamp(32px, 5vw, 60px) clamp(20px, 4vw, 48px)',
            marginBottom: 70,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 40px' }}>
            <span style={{ fontFamily: tk.fontMono, fontSize: 11, letterSpacing: '0.2em', color: tk.cyan, textTransform: 'uppercase' }}>
              OUR PEDAGOGICAL PHILOSOPHY
            </span>
            <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, margin: '8px 0 12px' }}>
              Small Steps, Big Innovations
            </h2>
            <p style={{ color: tk.textMuted, fontSize: 15, lineHeight: 1.6 }}>
              We bridge academic theoretical engineering with industry-grade hardware fabrication.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              {
                icon: '🎯',
                title: 'Hands-on Learning',
                desc: 'No theoretical boredom. Build physical circuits, connect breadboards, program firmware, and troubleshoot real hardware.',
                color: '#00d4ff',
              },
              {
                icon: '🧠',
                title: 'Build Real Projects',
                desc: 'Turn your ideas into working prototypes ready for science exhibitions, college capstones, and patentable inventions.',
                color: '#a855f7',
              },
              {
                icon: '👨‍🏫',
                title: 'Expert Mentors',
                desc: 'Direct 1-on-1 guidance from experienced embedded systems developers, robotics engineers, and IoT architects.',
                color: '#00e5a0',
              },
              {
                icon: '🛡️',
                title: 'Industry Ready',
                desc: 'Acquire practical proficiency in sensor interfacing, PWM control, I2C/UART protocols, and cloud IoT telemetry.',
                color: '#f5c842',
              },
            ].map((pillar, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${tk.border}`,
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${pillar.color}15`,
                    border: `1px solid ${pillar.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                  }}
                >
                  {pillar.icon}
                </div>
                <h4 style={{ fontFamily: tk.fontDisplay, fontSize: 18, fontWeight: 700, margin: 0, color: '#fff' }}>
                  {pillar.title}
                </h4>
                <p style={{ fontFamily: tk.fontBody, fontSize: 13.5, color: tk.textMuted, lineHeight: 1.6, margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── INQUIRY & WORKSHOP REGISTRATION FORM ────────────────────────────── */}
        <div
          id="inquiry-section"
          style={{
            background: 'rgba(13, 20, 37, 0.7)',
            border: `1px solid ${tk.border}`,
            borderRadius: 24,
            padding: 'clamp(32px, 5vw, 60px) clamp(20px, 4vw, 48px)',
            marginBottom: 60,
            scrollMarginTop: 90,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'center' }}>

            {/* Left Info Column */}
            <div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: 'rgba(0, 212, 255, 0.08)',
                  border: '1px solid rgba(0, 212, 255, 0.25)',
                  color: tk.cyan,
                  fontFamily: tk.fontMono,
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                HARDWARE LAB & WORKSHOP INQUIRY
              </div>

              <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>
                Ready to Build Your <br />
                <span style={{ color: tk.cyan }}>Smart IoT Model?</span>
              </h2>

              <p style={{ color: tk.textMuted, fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                Whether you are an engineering student preparing for a final project, a school wanting STEM IoT workshops, or an enthusiast ordering hardware kits, our mentors are ready to guide you.
              </p>

              {/* Direct Info Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0, 212, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    📍
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim }}>LOCATION</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Manigram, Butwal, Nepal</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0, 229, 160, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    📞
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim }}>PHONE / WHATSAPP</div>
                    <a href="tel:+9779807544395" style={{ fontSize: 14, fontWeight: 600, color: tk.green, textDecoration: 'none' }}>
                      +977 9807544395
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ✉️
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim }}>OFFICIAL EMAIL</div>
                    <a href="mailto:dkodeera2026@gmail.com" style={{ fontSize: 14, fontWeight: 600, color: tk.purple, textDecoration: 'none' }}>
                      dkodeera2026@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* WhatsApp Instant Chat Button */}
              <div style={{ marginTop: 28 }}>
                <a
                  href={`https://wa.me/9779807544395?text=${encodeURIComponent(
                    `Hello D-Kode Era team, I am interested in IoT Projects / Hardware Training (Project: ${inquiryProject || 'General IoT'}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    background: '#25D366',
                    color: '#050810',
                    padding: '12px 22px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                    boxShadow: '0 6px 20px rgba(37, 211, 102, 0.3)',
                  }}
                >
                  <span style={{ fontSize: 18 }}>💬</span> Chat on WhatsApp (+977 9807544395)
                </a>
              </div>
            </div>

            {/* Right Form Column */}
            <div
              style={{
                background: 'rgba(5, 8, 16, 0.6)',
                border: `1px solid ${tk.border}`,
                borderRadius: 20,
                padding: '32px 28px',
              }}
            >
              {formSubmitted ? (
                <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                  <div style={{ fontSize: 50, marginBottom: 16 }}>🎉</div>
                  <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 22, color: tk.green, marginBottom: 10 }}>
                    Inquiry Received Successfully!
                  </h3>
                  <p style={{ color: tk.textMuted, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                    Thank you, <strong>{inquiryName || 'Future Innovator'}</strong>. Our IoT mentor team from Manigram, Butwal will contact you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setInquiryMessage('');
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: `1px solid ${tk.border}`,
                      color: '#fff',
                      padding: '10px 20px',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 20, fontWeight: 700, margin: 0, color: '#fff' }}>
                    Send Direct Inquiry
                  </h3>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 6 }}>
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aayush Sharma"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(13, 20, 37, 0.8)',
                        border: `1px solid ${tk.border}`,
                        borderRadius: 8,
                        padding: '10px 14px',
                        color: '#fff',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 6 }}>
                        PHONE / WHATSAPP *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+977 98..."
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(13, 20, 37, 0.8)',
                          border: `1px solid ${tk.border}`,
                          borderRadius: 8,
                          padding: '10px 14px',
                          color: '#fff',
                          fontSize: 14,
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 6 }}>
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        placeholder="you@domain.com"
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(13, 20, 37, 0.8)',
                          border: `1px solid ${tk.border}`,
                          borderRadius: 8,
                          padding: '10px 14px',
                          color: '#fff',
                          fontSize: 14,
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 6 }}>
                        PROJECT FOCUS
                      </label>
                      <select
                        value={inquiryProject}
                        onChange={(e) => setInquiryProject(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(13, 20, 37, 0.8)',
                          border: `1px solid ${tk.border}`,
                          borderRadius: 8,
                          padding: '10px 14px',
                          color: '#fff',
                          fontSize: 13,
                          outline: 'none',
                        }}
                      >
                        <option value="">Select a Project (Optional)</option>
                        {allProjects.map((p) => (
                          <option key={p.id} value={p.title}>
                            #{p.id.toString().padStart(2, '0')} - {p.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 6 }}>
                        PURPOSE
                      </label>
                      <select
                        value={inquiryType}
                        onChange={(e) => setInquiryType(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(13, 20, 37, 0.8)',
                          border: `1px solid ${tk.border}`,
                          borderRadius: 8,
                          padding: '10px 14px',
                          color: '#fff',
                          fontSize: 13,
                          outline: 'none',
                        }}
                      >
                        <option value="Hands-on Workshop">Hands-on Workshop</option>
                        <option value="Order Hardware Kit">Order Hardware Kit</option>
                        <option value="College Project">College / Capstone Project</option>
                        <option value="School Training">School STEM Training</option>
                        <option value="Commercial IoT Prototype">Commercial IoT Prototype</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 6 }}>
                      MESSAGE OR SPECIAL REQUIREMENTS
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell us what you'd like to build or your timeline..."
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(13, 20, 37, 0.8)',
                        border: `1px solid ${tk.border}`,
                        borderRadius: 8,
                        padding: '10px 14px',
                        color: '#fff',
                        fontSize: 14,
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #00d4ff 0%, #0077ff 100%)',
                      border: 'none',
                      color: '#050810',
                      padding: '13px 20px',
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: 'pointer',
                      transition: 'all 0.25s',
                      marginTop: 4,
                    }}
                  >
                    Submit IoT Inquiry →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ─── TECHNICAL PROJECT DEEP-DIVE MODAL ───────────────────────────────── */}
      {activeModalProject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3, 6, 12, 0.88)',
            backdropFilter: 'blur(18px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setActiveModalProject(null)}
        >
          <div
            style={{
              background: '#090e1c',
              border: `1px solid ${activeModalProject.badgeColor}45`,
              borderRadius: 24,
              maxWidth: 860,
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: `0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px ${activeModalProject.accentGlow}`,
              position: 'relative',
              padding: 'clamp(24px, 4vw, 38px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalProject(null)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#fff',
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3,
              }}
            >
              ✕
            </button>

            {/* Modal Image + Header Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 24, alignItems: 'center' }}>
              <div
                style={{
                  height: 190,
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: `1px solid ${activeModalProject.badgeColor}35`,
                  background: '#050812',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={normalizeImageUrl(activeModalProject.image)}
                  alt={activeModalProject.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontFamily: tk.fontMono, fontSize: 11, fontWeight: 800, color: activeModalProject.badgeColor }}>
                    PROJECT #{activeModalProject.id.toString().padStart(2, '0')}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: tk.textDim,
                    }}
                  >
                    {activeModalProject.level}
                  </span>
                </div>
                <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>
                  {activeModalProject.title}
                </h2>
                <p style={{ color: activeModalProject.badgeColor, fontFamily: tk.fontMono, fontSize: 12.5, margin: 0 }}>
                  ⚡ {activeModalProject.tagline}
                </p>
              </div>
            </div>

            {/* Working Principle */}
            <div style={{ marginBottom: 20, background: 'rgba(255, 255, 255, 0.02)', padding: 18, borderRadius: 12, border: `1px solid ${tk.border}` }}>
              <h4 style={{ fontFamily: tk.fontMono, fontSize: 11, color: tk.cyan, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.1em' }}>
                HOW IT WORKS • WORKING PRINCIPLE
              </h4>
              <p style={{ color: tk.text, fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>
                {activeModalProject.workingPrinciple}
              </p>
            </div>

            {/* Real World Impact */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontFamily: tk.fontMono, fontSize: 11, color: tk.green, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.1em' }}>
                REAL-WORLD IMPACT & APPLICATION
              </h4>
              <p style={{ color: tk.textMuted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                {activeModalProject.realWorldImpact}
              </p>
            </div>

            {/* Sensors & Microcontroller Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 12, borderRadius: 10, border: `1px solid ${tk.border}` }}>
                <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, textTransform: 'uppercase' }}>Microcontroller</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', marginTop: 4 }}>{activeModalProject.microcontroller}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 12, borderRadius: 10, border: `1px solid ${tk.border}` }}>
                <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, textTransform: 'uppercase' }}>Difficulty & Time</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: activeModalProject.badgeColor, marginTop: 4 }}>{activeModalProject.difficulty} ({activeModalProject.estimatedHours})</div>
              </div>
            </div>

            {/* Pin Connections Blueprint Table */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontFamily: tk.fontMono, fontSize: 11, color: tk.purple, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.1em' }}>
                PIN CONNECTION BLUEPRINT
              </h4>
              <div style={{ overflowX: 'auto', border: `1px solid ${tk.border}`, borderRadius: 10 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: tk.fontMono }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.04)', textAlign: 'left', borderBottom: `1px solid ${tk.border}` }}>
                      <th style={{ padding: '8px 12px', color: tk.textDim }}>Component</th>
                      <th style={{ padding: '8px 12px', color: tk.cyan }}>MCU Pin</th>
                      <th style={{ padding: '8px 12px', color: tk.textDim }}>Signal Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeModalProject.pinConnections.map((conn, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid rgba(255, 255, 255, 0.03)` }}>
                        <td style={{ padding: '7px 12px', color: '#fff', fontWeight: 600 }}>{conn.component}</td>
                        <td style={{ padding: '7px 12px', color: tk.cyan }}>{conn.pin}</td>
                        <td style={{ padding: '7px 12px', color: tk.textMuted }}>{conn.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Firmware Code Snippet */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h4 style={{ fontFamily: tk.fontMono, fontSize: 11, color: tk.cyan, textTransform: 'uppercase', margin: 0, letterSpacing: '0.1em' }}>
                  FIRMWARE LOGIC (ARDUINO / C++)
                </h4>
                <button
                  onClick={() => handleCopyCode(activeModalProject.codeSnippet)}
                  style={{
                    background: copiedCode ? tk.green : 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: copiedCode ? '#050810' : '#fff',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: tk.fontMono,
                    cursor: 'pointer',
                  }}
                >
                  {copiedCode ? '✓ Copied' : '📋 Copy Code'}
                </button>
              </div>
              <pre
                style={{
                  background: '#040711',
                  border: `1px solid ${tk.border}`,
                  borderRadius: 10,
                  padding: 14,
                  color: '#93c5fd',
                  fontSize: 12,
                  fontFamily: tk.fontMono,
                  overflowX: 'auto',
                  maxHeight: 180,
                  margin: 0,
                }}
              >
                <code>{activeModalProject.codeSnippet}</code>
              </pre>
            </div>

            {/* Modal Bottom CTAs */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveModalProject(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  color: '#fff',
                  padding: '9px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                onClick={() => handleQuickInquire(activeModalProject)}
                style={{
                  background: `linear-gradient(135deg, ${activeModalProject.badgeColor} 0%, #0066ff 100%)`,
                  border: 'none',
                  color: '#050810',
                  padding: '9px 20px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: `0 4px 16px ${activeModalProject.accentGlow}`,
                }}
              >
                Inquire About This Kit / Workshop →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── FULL OFFICIAL BROCHURE LIGHTBOX MODAL ───────────────────────────── */}
      {brochureModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(20px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setBrochureModalOpen(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: 750,
              maxHeight: '94vh',
              width: '100%',
              background: '#070b14',
              border: `1px solid ${tk.cyan}40`,
              borderRadius: 20,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 212, 255, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: `1px solid ${tk.border}`, background: '#0a1020' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>📜</span>
                <span style={{ fontFamily: tk.fontDisplay, fontSize: 16, fontWeight: 800, color: '#fff' }}>
                  D-Kode Era Official IoT Projects Brochure
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <a
                  href="/iot/dkode-iot-brochure.png"
                  download="D-Kode-Era-IoT-Projects.jpg"
                  style={{
                    background: tk.cyan,
                    color: '#050810',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontFamily: tk.fontMono,
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Download HD ↓
                </a>
                <button
                  onClick={() => setBrochureModalOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#fff',
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable image view */}
            <div style={{ overflowY: 'auto', padding: 12, textAlign: 'center', flexGrow: 1 }}>
              <img
                src="/iot/dkode-iot-brochure.png"
                alt="D-Kode Era IoT Projects Poster"
                style={{ width: '100%', height: 'auto', borderRadius: 8, display: 'block' }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
