'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';

interface JobRole {
  id: number;
  title: string;
  department: string;
  type: string;
  location: string;
  experience: string;
  salary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  tags: string[];
  color: string;
  published: boolean;
  createdAt: string;
  // Brand sections
  heroDesc?: string;
  whyJoinItems?: string;
  applySteps?: string;
  companyTagline?: string;
  companyFounded?: string;
  companyLocation?: string;
  companyFocus?: string;
  companyCulture?: string;
}

export default function CareerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params?.id;

  const [role, setRole] = useState<JobRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [experience, setExperience] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvUploadedUrl, setCvUploadedUrl] = useState('');
  const [cvDragOver, setCvDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Unwrap double-encoded JSON arrays from the backend
  // e.g. ["[\"item1\",\"item2\"]"] → ["item1", "item2"]
  const parseArrayField = (field: string[] | string | undefined): string[] => {
    if (!field) return [];
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch { }
      return [field];
    }
    if (Array.isArray(field)) {
      if (field.length === 1 && typeof field[0] === 'string' && field[0].trimStart().startsWith('[')) {
        try {
          const inner = JSON.parse(field[0]);
          if (Array.isArray(inner)) return inner.map(String);
        } catch { }
      }
      return field.map(String);
    }
    return [];
  };

  useEffect(() => {
    if (!roleId) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/careers/${roleId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Job opening not found or no longer active');
        return res.json();
      })
      .then((data) => {
        // Normalize array fields that may be double-encoded
        data.responsibilities = parseArrayField(data.responsibilities);
        data.requirements = parseArrayField(data.requirements);
        data.benefits = parseArrayField(data.benefits);
        if (!Array.isArray(data.tags)) data.tags = [];

        // Brand section defaults if not customized per job
        data.heroDesc = data.heroDesc || 'Join a team of passionate engineers, designers, and visionaries who are reshaping the digital landscape in Nepal and beyond. At D-Kode Era, your work matters — we build products that impact thousands of users every day.';
        data.whyJoinItems = data.whyJoinItems || '🚀 Cutting-Edge Stack | Work with Next.js, AI/ML, and modern cloud infrastructure\n🌏 Remote-Friendly | Hybrid & fully remote options across Nepal\n📈 Career Growth | Structured paths, mentorship & AI upskilling budgets\n💡 Innovative Culture | Flat hierarchy, ship fast, learn faster\n🎯 Real Impact | Build products used by thousands — not shelf projects\n💰 Competitive Pay | Market-leading salaries + performance bonuses';
        data.applySteps = data.applySteps || 'Submit Your Application | Fill out the online form on our careers page with your resume & portfolio.\nInitial Screening | Our team reviews your profile within 3–5 business days and reaches out.\nTechnical Assessment | A take-home task or live coding session relevant to the role.\nTeam Interview | Meet the team — technical deep-dive + culture fit conversation.\nOffer & Onboarding | Receive your offer letter and kick off your journey with D-Kode Era.';
        data.companyTagline = data.companyTagline || 'Building Digital Futures from Butwal, Nepal 🇳🇵';
        data.companyFounded = data.companyFounded || '2023';
        data.companyLocation = data.companyLocation || 'Butwal, Nepal';
        data.companyFocus = data.companyFocus || 'Web · AI · Mobile';
        data.companyCulture = data.companyCulture || 'Remote-First';

        setRole(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Error loading role:', err);
        setError(err.message || 'Job opening not found.');
      })
      .finally(() => setLoading(false));
  }, [roleId]);

  const handleCvUpload = async (file: File) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      alert('Only PDF, DOC, and DOCX files are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10 MB.');
      return;
    }
    setCvFile(file);
    setCvUploading(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);
      const res = await fetch('http://localhost:5000/api/cv-upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setCvUploadedUrl(data.url);
      } else {
        alert(data.error || 'CV upload failed. Please try a cloud link instead.');
        setCvFile(null);
      }
    } catch (err) {
      alert('Network error uploading CV.');
      setCvFile(null);
    } finally {
      setCvUploading(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !coverNote.trim()) {
      alert('Please fill in required fields (Name, Email, and Cover Note).');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('http://localhost:5000/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          careerId: role?.id,
          careerTitle: role?.title || '',
          department: role?.department || '',
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          portfolio: portfolio.trim(),
          cvUrl: cvUploadedUrl,
          resumeLink: resumeUrl.trim(),
          coverNote: coverNote.trim(),
        }),
      });

      if (res.ok) {
        setAppliedSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Network error submitting application.');
    } finally {
      setSubmitting(false);
    }
  };

  const accentColor = role?.color || tk.cyan;

  return (
    <div style={{ background: tk.bg || '#050810', color: tk.text, minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
      {/* Dynamic Background Radial Glow */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 1200,
          height: 600,
          background: `radial-gradient(circle at 50% 10%, ${accentColor}18, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '100px 20px 80px' }}>
        {/* Back Link */}
        <Link
          href="/pages/careers"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: tk.textDim,
            fontSize: 13,
            fontFamily: tk.fontMono,
            textDecoration: 'none',
            marginBottom: 32,
            transition: 'color 0.2s ease',
          }}
        >
          ← Back to All Openings
        </Link>

        {loading ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: tk.textDim, fontFamily: tk.fontMono }}>
            Loading role specification details...
          </div>
        ) : error || !role ? (
          <div style={{ padding: '60px 30px', background: tk.surface, border: `1px solid ${tk.border}`, borderRadius: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>💼</div>
            <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 24, fontWeight: 800, color: tk.text, marginBottom: 12 }}>
              Role No Longer Active
            </h2>
            <p style={{ fontSize: 15, color: tk.textDim, marginBottom: 24 }}>
              This job position may have been filled or moved. Explore our active careers page.
            </p>
            <Link
              href="/pages/careers"
              style={{
                background: tk.green,
                color: '#050810',
                padding: '10px 22px',
                borderRadius: 10,
                fontWeight: 700,
                textDecoration: 'none',
                fontFamily: tk.fontMono,
                fontSize: 12,
              }}
            >
              Browse All Careers →
            </Link>
          </div>
        ) : (
          <div>
            {/* Header Header Bar */}
            <div style={{ background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`, border: `1px solid ${tk.border}`, borderRadius: 24, padding: '36px 40px', marginBottom: 40, boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontFamily: tk.fontMono, padding: '4px 12px', borderRadius: 20, background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}40`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {role.department}
                </span>
                <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.textDim, background: 'rgba(255,255,255,0.04)', padding: '4px 12px', borderRadius: 20, border: `1px solid ${tk.border}` }}>
                  ⚡ {role.type}
                </span>
                <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.textDim, background: 'rgba(255,255,255,0.04)', padding: '4px 12px', borderRadius: 20, border: `1px solid ${tk.border}` }}>
                  📍 {role.location}
                </span>
                <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.textDim, background: 'rgba(255,255,255,0.04)', padding: '4px 12px', borderRadius: 20, border: `1px solid ${tk.border}` }}>
                  ⏳ {role.experience}
                </span>
                {role.salary && (
                  <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.green, background: 'rgba(0,229,160,0.1)', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(0,229,160,0.25)', fontWeight: 700 }}>
                    💰 {role.salary}
                  </span>
                )}
              </div>

              <h1 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: tk.text, margin: '0 0 16px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                {role.title}
              </h1>

              {Array.isArray(role.tags) && role.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {role.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 11, fontFamily: tk.fontMono, padding: '3px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: tk.textMuted, border: `1px solid ${tk.border}` }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content Two-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(0, 1.1fr)', gap: 36, alignItems: 'start' }}>
              {/* Left Column: Role Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

                {/* 1. Overview */}
                <div style={{ background: tk.surface, border: `1px solid ${tk.border}`, borderRadius: 20, padding: 32 }}>
                  <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 20, fontWeight: 800, color: tk.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: accentColor }}>✦</span> Role Overview
                  </h2>
                  <p style={{ fontSize: 15, color: tk.textDim, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>
                    {role.description}
                  </p>
                </div>

                {/* 2. Key Responsibilities */}
                {Array.isArray(role.responsibilities) && role.responsibilities.length > 0 && (
                  <div style={{ background: tk.surface, border: `1px solid ${tk.border}`, borderRadius: 20, padding: 32 }}>
                    <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 20, fontWeight: 800, color: tk.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: accentColor }}>✦</span> Key Responsibilities
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {role.responsibilities.map((resp, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <div style={{ background: `${accentColor}20`, color: accentColor, borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, flexShrink: 0, marginTop: 2 }}>
                            ✓
                          </div>
                          <span style={{ fontSize: 15, color: tk.textDim, lineHeight: 1.6 }}>{resp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Requirements & Qualifications */}
                {Array.isArray(role.requirements) && role.requirements.length > 0 && (
                  <div style={{ background: tk.surface, border: `1px solid ${tk.border}`, borderRadius: 20, padding: 32 }}>
                    <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 20, fontWeight: 800, color: tk.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: accentColor }}>✦</span> Requirements & Qualifications
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {role.requirements.map((req, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <div style={{ background: 'rgba(255,255,255,0.06)', color: tk.cyan, borderRadius: 6, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, flexShrink: 0, marginTop: 2 }}>
                            •
                          </div>
                          <span style={{ fontSize: 15, color: tk.textDim, lineHeight: 1.6 }}>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. What We Offer */}
                {Array.isArray(role.benefits) && role.benefits.length > 0 && (
                  <div style={{ background: tk.surface, border: `1px solid ${tk.border}`, borderRadius: 20, padding: 32 }}>
                    <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 20, fontWeight: 800, color: tk.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: accentColor }}>✦</span> Perks & What We Offer
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {role.benefits.map((b, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 16 }}>🎁</span>
                          <span style={{ fontSize: 15, color: tk.textDim, lineHeight: 1.6 }}>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Application Form */}
              <div style={{ position: 'sticky', top: 100 }}>
                <div
                  style={{
                    background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                    border: `1px solid ${accentColor}40`,
                    borderRadius: 24,
                    padding: 32,
                    boxShadow: `0 20px 40px rgba(0,0,0,0.6), 0 0 30px ${accentColor}15`,
                  }}
                >
                  <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: accentColor, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                    🚀 QUICK APPLICATION
                  </div>
                  <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 22, fontWeight: 800, color: tk.text, margin: '0 0 6px' }}>
                    Apply for this Position
                  </h3>
                  <p style={{ fontSize: 13, color: tk.textDim, margin: '0 0 24px', lineHeight: 1.5 }}>
                    Submit your application directly to our engineering hiring team.
                  </p>

                  {appliedSuccess ? (
                    <div style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
                      <h4 style={{ fontFamily: tk.fontDisplay, fontSize: 18, fontWeight: 800, color: tk.green, margin: '0 0 8px' }}>
                        Application Submitted!
                      </h4>
                      <p style={{ fontSize: 13, color: tk.textDim, margin: '0 0 16px', lineHeight: 1.6 }}>
                        Thank you, {fullName}! Our recruitment team will review your application and reach out via email/phone soon.
                      </p>
                      <button
                        onClick={() => setAppliedSuccess(false)}
                        style={{ background: 'rgba(255,255,255,0.06)', color: tk.text, border: `1px solid ${tk.border}`, padding: '8px 16px', borderRadius: 8, fontSize: 11, fontFamily: tk.fontMono, cursor: 'pointer' }}
                      >
                        Submit Another Application
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 6 }}>
                          FULL NAME *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Dipendra Prasad Gupta"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${tk.border}`, borderRadius: 10, color: tk.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 6 }}>
                            EMAIL ADDRESS *
                          </label>
                          <input
                            type="email"
                            placeholder="you@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${tk.border}`, borderRadius: 10, color: tk.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                            required
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 6 }}>
                            PHONE NUMBER
                          </label>
                          <input
                            type="tel"
                            placeholder="+977 9800000000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${tk.border}`, borderRadius: 10, color: tk.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      <div>
                          <label style={{ display: 'block', fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 6 }}>
                            PORTFOLIO / GITHUB / LINKEDIN
                          </label>
                          <input
                            type="url"
                            placeholder="https://github.com/..."
                            value={portfolio}
                            onChange={(e) => setPortfolio(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${tk.border}`, borderRadius: 10, color: tk.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>

                        {/* CV / Resume Upload Zone */}
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 6 }}>
                            CV / RESUME <span style={{ color: tk.textMuted }}>(PDF, DOC, DOCX · max 10 MB)</span>
                          </label>

                          {/* Drag-and-drop zone */}
                          <div
                            onDragOver={(e) => { e.preventDefault(); setCvDragOver(true); }}
                            onDragLeave={() => setCvDragOver(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setCvDragOver(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file) handleCvUpload(file);
                            }}
                            style={{
                              border: `2px dashed ${cvDragOver ? accentColor : cvUploadedUrl ? 'rgba(0,229,160,0.5)' : tk.border}`,
                              borderRadius: 12,
                              padding: '18px 14px',
                              textAlign: 'center',
                              background: cvDragOver
                                ? `${accentColor}08`
                                : cvUploadedUrl
                                ? 'rgba(0,229,160,0.06)'
                                : 'rgba(255,255,255,0.03)',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                              position: 'relative',
                            }}
                          >
                            {cvUploading ? (
                              <div style={{ color: tk.textDim, fontSize: 13, fontFamily: tk.fontMono }}>
                                <span style={{ display: 'block', fontSize: 22, marginBottom: 6 }}>⟳</span>
                                Uploading…
                              </div>
                            ) : cvUploadedUrl ? (
                              <div>
                                <div style={{ fontSize: 22, marginBottom: 6 }}>✅</div>
                                <div style={{ fontSize: 12, color: tk.green, fontFamily: tk.fontMono, fontWeight: 700, marginBottom: 4 }}>
                                  CV Uploaded Successfully!
                                </div>
                                <div style={{ fontSize: 11, color: tk.textDim, wordBreak: 'break-all' }}>
                                  {cvFile?.name}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => { setCvFile(null); setCvUploadedUrl(''); }}
                                  style={{ marginTop: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', padding: '4px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: tk.fontMono }}
                                >
                                  Remove & re-upload
                                </button>
                              </div>
                            ) : (
                              <label style={{ cursor: 'pointer', display: 'block' }}>
                                <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                                <div style={{ fontSize: 13, color: tk.textDim, marginBottom: 4 }}>
                                  Drag & drop your CV here, or{' '}
                                  <span style={{ color: accentColor, fontWeight: 700 }}>browse files</span>
                                </div>
                                <div style={{ fontSize: 11, color: tk.textMuted }}>
                                  PDF, DOC, DOCX accepted · Max 10 MB
                                </div>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleCvUpload(file);
                                  }}
                                />
                              </label>
                            )}
                          </div>

                          {/* Fallback: cloud link */}
                          {!cvUploadedUrl && (
                            <div style={{ marginTop: 8 }}>
                              <input
                                type="url"
                                placeholder="Or paste a Google Drive / Dropbox link"
                                value={resumeUrl}
                                onChange={(e) => setResumeUrl(e.target.value)}
                                style={{ width: '100%', padding: '9px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${tk.border}`, borderRadius: 8, color: tk.textDim, fontSize: 12, outline: 'none', boxSizing: 'border-box', fontFamily: tk.fontMono }}
                              />
                            </div>
                          )}
                        </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 6 }}>
                          BRIEF PITCH / COVER NOTE *
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Tell us why you are a great fit for this role and highlight your key achievements..."
                          value={coverNote}
                          onChange={(e) => setCoverNote(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${tk.border}`, borderRadius: 10, color: tk.text, fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.5, boxSizing: 'border-box' }}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          background: `linear-gradient(135deg, ${accentColor}, ${tk.green})`,
                          color: '#050810',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: 10,
                          fontSize: 13,
                          fontFamily: tk.fontMono,
                          fontWeight: 900,
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          marginTop: 4,
                          boxShadow: `0 4px 16px ${accentColor}40`,
                        }}
                      >
                        {submitting ? 'Submitting Application...' : '🚀 Submit Application →'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* ── Brand Sections (inside role block) ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 48 }}>

            {/* Build the Future with D-Kode Era */}
            {role.heroDesc && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,229,160,0.07) 0%, rgba(6,182,212,0.07) 100%)',
                border: `1px solid rgba(0,229,160,0.22)`,
                borderRadius: 20,
                padding: '36px 40px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: -30, right: -30,
                  width: 180, height: 180,
                  background: 'radial-gradient(circle, rgba(0,229,160,0.12) 0%, transparent 70%)',
                  borderRadius: '50%', pointerEvents: 'none',
                }} />
                <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: '#00e5a0', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                  ✦ Careers at D-Kode Era
                </div>
                <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, color: tk.text, marginBottom: 14, lineHeight: 1.2 }}>
                  Build the Future with{' '}
                  <span style={{ background: 'linear-gradient(90deg, #00e5a0, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    D-Kode Era
                  </span>
                </h2>
                <p style={{ fontSize: 16, color: tk.textDim, lineHeight: 1.8, margin: 0, maxWidth: 720 }}>
                  {role.heroDesc}
                </p>
              </div>
            )}

            {/* Why Join D-Kode Era */}
            {role.whyJoinItems && (
              <div style={{ background: tk.surface, border: `1px solid ${tk.border}`, borderRadius: 20, padding: '36px 40px' }}>
                <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.cyan, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                  ✦ Why Join Us
                </div>
                <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 26, fontWeight: 800, color: tk.text, marginBottom: 24 }}>
                  Why Join D-Kode Era?
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  {role.whyJoinItems.split('\n').filter(Boolean).map((line, idx) => {
                    const pipeIdx = line.indexOf('|');
                    const left = pipeIdx > -1 ? line.slice(0, pipeIdx).trim() : line.trim();
                    const right = pipeIdx > -1 ? line.slice(pipeIdx + 1).trim() : '';
                    // Extract emoji (first char cluster) and title
                    const emojiMatch = left.match(/^(\p{Emoji}\S*\s*)/u);
                    const emoji = emojiMatch ? emojiMatch[1].trim() : '✦';
                    const title = emojiMatch ? left.slice(emojiMatch[0].length).trim() : left;
                    return (
                      <div key={idx} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${tk.border}`,
                        borderRadius: 14,
                        padding: '16px 18px',
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                        transition: 'border-color 0.2s',
                      }}>
                        <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{emoji}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: tk.text, marginBottom: 4 }}>{title}</div>
                          {right && <div style={{ fontSize: 13, color: tk.textDim, lineHeight: 1.6 }}>{right}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* How to Apply */}
            {role.applySteps && (
              <div style={{ background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.18)', borderRadius: 20, padding: '36px 40px' }}>
                <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.cyan, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                  ✦ Application Process
                </div>
                <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 26, fontWeight: 800, color: tk.text, marginBottom: 24 }}>
                  How to Apply
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {role.applySteps.split('\n').filter(Boolean).map((line, idx) => {
                    const pipeIdx = line.indexOf('|');
                    const stepLabel = pipeIdx > -1 ? line.slice(0, pipeIdx).trim() : line.trim();
                    const stepDesc = pipeIdx > -1 ? line.slice(pipeIdx + 1).trim() : '';
                    const stepNum = String(idx + 1).padStart(2, '0');
                    return (
                      <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div style={{
                          minWidth: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(0,229,160,0.12))',
                          border: '1px solid rgba(6,182,212,0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontFamily: tk.fontMono, fontWeight: 800, color: tk.cyan, flexShrink: 0,
                        }}>
                          {stepNum}
                        </div>
                        <div style={{ paddingTop: 8 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: tk.text, marginBottom: 4 }}>{stepLabel}</div>
                          {stepDesc && <div style={{ fontSize: 14, color: tk.textDim, lineHeight: 1.6 }}>{stepDesc}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* D-Kode Era Footer */}
            {(role.companyTagline || role.companyFounded) && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,229,160,0.05) 0%, rgba(6,182,212,0.05) 100%)',
                border: '1px solid rgba(0,229,160,0.15)',
                borderRadius: 20,
                padding: '28px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 24,
              }}>
                <div>
                  <div style={{ fontFamily: tk.fontDisplay, fontSize: 22, fontWeight: 900, color: tk.text, marginBottom: 6 }}>
                    <span style={{ background: 'linear-gradient(90deg, #00e5a0, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      D-Kode Era
                    </span>
                  </div>
                  {role.companyTagline && (
                    <div style={{ fontSize: 14, color: tk.textDim, fontFamily: tk.fontMono }}>
                      {role.companyTagline}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Founded', value: role.companyFounded },
                    { label: 'Location', value: role.companyLocation },
                    { label: 'Focus', value: role.companyFocus },
                    { label: 'Culture', value: role.companyCulture },
                  ].filter(i => i.value).map((info) => (
                    <div key={info.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#00e5a0', marginBottom: 2 }}>{info.value}</div>
                      <div style={{ fontSize: 10, color: tk.textMuted, fontFamily: tk.fontMono, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{info.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  </div>
);
}
