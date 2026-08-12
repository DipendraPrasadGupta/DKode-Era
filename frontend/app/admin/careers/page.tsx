'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { createCareer, updateCareer, deleteCareer } from '@/lib/api/careers';

interface Career {
  id: number;
  title: string;
  department: string;
  type: string;
  location: string;
  experience: string;
  salary?: string;
  description: string;
  responsibilities?: string[] | string;
  requirements?: string[] | string;
  benefits?: string[] | string;
  tags: string[];
  color: string;
  published: boolean;
  order: number;
  createdAt?: string;
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

export default function AdminCareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [toast, setToast] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [customDept, setCustomDept] = useState('');
  const [type, setType] = useState('Full-time');
  const [location, setLocation] = useState('Butwal / Remote (Nepal)');
  const [experience, setExperience] = useState('2+ Years');
  const [salary, setSalary] = useState('Competitive / Performance Bonus');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [tags, setTags] = useState('');
  const [color, setColor] = useState('#06b6d4');
  const [published, setPublished] = useState(true);
  const [order, setOrder] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Brand Section State
  const [heroDesc, setHeroDesc] = useState('');
  const [whyJoinItems, setWhyJoinItems] = useState('');
  const [applySteps, setApplySteps] = useState('');
  const [companyTagline, setCompanyTagline] = useState('');
  const [companyFounded, setCompanyFounded] = useState('');
  const [companyLocation2, setCompanyLocation2] = useState('');
  const [companyFocus, setCompanyFocus] = useState('');
  const [companyCulture, setCompanyCulture] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Safely parse a field that may be a plain string, a proper string[],
  // or a double-encoded JSON string stored as string[] (e.g. ["[\"item1\",\"item2\"]"]).
  const parseArrayField = (field: string[] | string | undefined): string => {
    if (!field) return '';
    if (typeof field === 'string') {
      // Already a plain string — return as-is
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) return parsed.map((s: string) => `- ${s}`).join('\n');
      } catch { }
      return field;
    }
    if (Array.isArray(field)) {
      // Detect double-encoded: array whose first element is itself a JSON array string
      if (field.length === 1 && typeof field[0] === 'string' && field[0].trimStart().startsWith('[')) {
        try {
          const inner = JSON.parse(field[0]);
          if (Array.isArray(inner)) return inner.map((s: string) => `- ${s}`).join('\n');
        } catch { }
      }
      return field.map((s: string) => `- ${s}`).join('\n');
    }
    return '';
  };

  const getAuthToken = async (): Promise<string | null> => {
    let token = localStorage.getItem('adminToken');
    if (token) return token;
    try {
      const data = await apiFetch('/admin/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      });
      if (data?.token) {
        localStorage.setItem('adminToken', data.token);
        return data.token;
      }
    } catch { }
    return null;
  };

  const fetchCareers = async () => {
    const token = await getAuthToken();
    if (!token) return;
    try {
      setLoading(true);
      const data = await apiFetch('/admin/api/careers');
      setCareers(data);
    } catch (err) {
      console.error('Error fetching careers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const openCreateModal = () => {
    setEditingCareer(null);
    setTitle('');
    setDepartment('Engineering');
    setCustomDept('');
    setType('Full-time');
    setLocation('Butwal / Remote (Nepal)');
    setExperience('2+ Years');
    setSalary('Competitive / Negotiable');
    setDescription('');
    setResponsibilities('- Architecture and development of core features\n- Code reviews and API optimizations\n- Collaborate with product designers & cross-functional teams');
    setRequirements('- 3+ years experience with React, Next.js, Node.js\n- Strong TypeScript & PostgreSQL skills\n- Experience with modern state management and clean architecture');
    setBenefits('- Competitive salary & performance bonuses\n- Flexible hybrid/remote work schedule\n- Annual learning budget & AI certifications');
    setTags('React, Next.js, TypeScript');
    setColor('#06b6d4');
    setPublished(true);
    setOrder(0);
    // Brand defaults
    setHeroDesc('Join a team of passionate engineers, designers, and visionaries who are reshaping the digital landscape in Nepal and beyond. At D-Kode Era, your work matters — we build products that impact thousands of users every day.');
    setWhyJoinItems('🚀 Cutting-Edge Stack | Work with Next.js, AI/ML, and modern cloud infrastructure\n🌏 Remote-Friendly | Hybrid & fully remote options across Nepal\n📈 Career Growth | Structured paths, mentorship & AI upskilling budgets\n💡 Innovative Culture | Flat hierarchy, ship fast, learn faster\n🎯 Real Impact | Build products used by thousands — not shelf projects\n💰 Competitive Pay | Market-leading salaries + performance bonuses');
    setApplySteps('Submit Your Application | Fill out the online form on our careers page with your resume & portfolio.\nInitial Screening | Our team reviews your profile within 3–5 business days and reaches out.\nTechnical Assessment | A take-home task or live coding session relevant to the role.\nTeam Interview | Meet the team — technical deep-dive + culture fit conversation.\nOffer & Onboarding | Receive your offer letter and kick off your journey with D-Kode Era.');
    setCompanyTagline('Building Digital Futures from Butwal, Nepal 🇳🇵');
    setCompanyFounded('2023');
    setCompanyLocation2('Butwal, Nepal');
    setCompanyFocus('Web · AI · Mobile');
    setCompanyCulture('Remote-First');
    setModalOpen(true);
  };

  const openEditModal = (c: Career) => {
    setEditingCareer(c);
    setTitle(c.title);
    if (['Engineering', 'AI Research', 'Design', 'Product', 'Operations'].includes(c.department)) {
      setDepartment(c.department);
      setCustomDept('');
    } else {
      setDepartment('Other');
      setCustomDept(c.department);
    }
    setType(c.type);
    setLocation(c.location);
    setExperience(c.experience);
    setSalary(c.salary || 'Competitive / Negotiable');
    setDescription(c.description);
    setResponsibilities(parseArrayField(c.responsibilities));
    setRequirements(parseArrayField(c.requirements));
    setBenefits(parseArrayField(c.benefits));
    setTags(Array.isArray(c.tags) ? c.tags.join(', ') : c.tags);
    setColor(c.color || '#06b6d4');
    setPublished(c.published);
    setOrder(c.order || 0);
    // Brand fields
    setHeroDesc(c.heroDesc || 'Join a team of passionate engineers, designers, and visionaries who are reshaping the digital landscape in Nepal and beyond. At D-Kode Era, your work matters — we build products that impact thousands of users every day.');
    setWhyJoinItems(c.whyJoinItems || '🚀 Cutting-Edge Stack | Work with Next.js, AI/ML, and modern cloud infrastructure\n🌏 Remote-Friendly | Hybrid & fully remote options across Nepal\n📈 Career Growth | Structured paths, mentorship & AI upskilling budgets\n💡 Innovative Culture | Flat hierarchy, ship fast, learn faster\n🎯 Real Impact | Build products used by thousands — not shelf projects\n💰 Competitive Pay | Market-leading salaries + performance bonuses');
    setApplySteps(c.applySteps || 'Submit Your Application | Fill out the online form on our careers page with your resume & portfolio.\nInitial Screening | Our team reviews your profile within 3–5 business days and reaches out.\nTechnical Assessment | A take-home task or live coding session relevant to the role.\nTeam Interview | Meet the team — technical deep-dive + culture fit conversation.\nOffer & Onboarding | Receive your offer letter and kick off your journey with D-Kode Era.');
    setCompanyTagline(c.companyTagline || 'Building Digital Futures from Butwal, Nepal 🇳🇵');
    setCompanyFounded(c.companyFounded || '2023');
    setCompanyLocation2(c.companyLocation || 'Butwal, Nepal');
    setCompanyFocus(c.companyFocus || 'Web · AI · Mobile');
    setCompanyCulture(c.companyCulture || 'Remote-First');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill in required fields (Title and Description).');
      return;
    }

    const token = await getAuthToken();
    if (!token) { alert('Session expired'); return; }

    const finalDepartment = department === 'Other' ? (customDept.trim() || 'General') : department;
    const payload = {
      title: title.trim(),
      department: finalDepartment,
      type: type.trim(),
      location: location.trim(),
      experience: experience.trim(),
      salary: salary.trim(),
      description: description.trim(),
      responsibilities: responsibilities.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean),
      requirements: requirements.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean),
      benefits: benefits.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      color,
      published,
      order: Number(order) || 0,
      heroDesc: heroDesc.trim(),
      whyJoinItems: whyJoinItems.trim(),
      applySteps: applySteps.trim(),
      companyTagline: companyTagline.trim(),
      companyFounded: companyFounded.trim(),
      companyLocation: companyLocation2.trim(),
      companyFocus: companyFocus.trim(),
      companyCulture: companyCulture.trim(),
    };

    try {
      setIsSubmitting(true);
      if (editingCareer) {
        await updateCareer(editingCareer.id, payload);
      } else {
        await createCareer(payload);
      }
      showToast(editingCareer ? 'Job opening updated successfully!' : 'New job opening created live!');
      setModalOpen(false);
      fetchCareers();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to save job opening');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job opening? This action cannot be undone.')) return;
    const token = await getAuthToken();
    if (!token) return;
    try {
      await deleteCareer(id);
      showToast('Job opening deleted.');
      fetchCareers();
    } catch (err) {
      console.error('Error deleting career:', err);
    }
  };

  const togglePublishStatus = async (c: Career) => {
    const token = await getAuthToken();
    if (!token) return;
    try {
      await apiFetch(`/admin/api/careers/${c.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ published: !c.published }),
      });
      showToast(`Job opening is now ${!c.published ? 'Live / Published' : 'Draft / Hidden'}`);
      fetchCareers();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered List
  const departmentsList = Array.from(new Set(['All', ...careers.map(c => c.department)]));

  const filtered = careers.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'published' ? c.published : !c.published;
    const matchesDept = deptFilter === 'All' ? true : c.department === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const liveCount = careers.filter(c => c.published).length;
  const draftCount = careers.filter(c => !c.published).length;

  return (
    <div style={{ padding: '32px 24px', color: '#e4e4e7', fontFamily: "'Outfit', sans-serif" }}>
      {/* Toast message */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'linear-gradient(135deg, #06b6d4, #00e5a0)', color: '#050810',
          padding: '12px 22px', borderRadius: 12, fontWeight: 800, fontSize: 13,
          boxShadow: '0 10px 30px rgba(0,229,160,0.4)', fontFamily: "'JetBrains Mono', monospace",
        }}>
          ✓ {toast}
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
            ✦ CMS CAREER & RECRUITMENT MANAGEMENT
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Job Openings ({careers.length})
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            href="/admin/applications"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#00e5a0',
              border: '1px solid rgba(0,229,160,0.3)',
              padding: '12px 20px',
              borderRadius: 12,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
            }}
          >
            📄 View Applications →
          </Link>
          <button
            onClick={openCreateModal}
            style={{
              background: 'linear-gradient(135deg, #00e5a0, #06b6d4)',
              color: '#050810',
              border: 'none',
              padding: '12px 22px',
              borderRadius: 12,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,229,160,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add New Job Opening
          </button>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>TOTAL OPENINGS</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginTop: 4 }}>{careers.length}</div>
        </div>
        <div style={{ background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, color: '#00e5a0', fontFamily: "'JetBrains Mono', monospace" }}>LIVE / PUBLISHED</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#00e5a0', marginTop: 4 }}>{liveCount}</div>
        </div>
        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, color: '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>DRAFTS / UNPUBLISHED</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#ef4444', marginTop: 4 }}>{draftCount}</div>
        </div>
        <div style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace" }}>DEPARTMENTS</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#06b6d4', marginTop: 4 }}>{departmentsList.length - 1}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 24, background: 'rgba(255,255,255,0.02)', padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
        <input
          type="text"
          placeholder="Search openings by title, dept, or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 240,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            padding: '9px 14px',
            color: '#fff',
            fontSize: 13,
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* Dept Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              outline: 'none',
            }}
          >
            {departmentsList.map(d => (
              <option key={d} value={d} style={{ background: '#0c0f1a' }}>Dept: {d}</option>
            ))}
          </select>

          {/* Status Filter */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                background: statusFilter === 'all' ? '#06b6d4' : 'transparent',
                color: statusFilter === 'all' ? '#000' : '#a1a1aa',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              All ({careers.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              style={{
                background: statusFilter === 'published' ? '#00e5a0' : 'transparent',
                color: statusFilter === 'published' ? '#000' : '#a1a1aa',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Live ({liveCount})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              style={{
                background: statusFilter === 'draft' ? '#ef4444' : 'transparent',
                color: statusFilter === 'draft' ? '#fff' : '#a1a1aa',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Drafts ({draftCount})
            </button>
          </div>
        </div>
      </div>

      {/* Careers Openings Grid */}
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>
          Loading career openings...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>💼</div>
          <h3 style={{ fontSize: 16, color: '#fff', margin: '0 0 8px' }}>No Job Openings Found</h3>
          <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>Try clearing filters or click "Add New Job Opening" to create one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${c.published ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.2)'}`,
                borderRadius: 16,
                padding: '24px 28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 20,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => togglePublishStatus(c)}
                    style={{
                      background: c.published ? 'rgba(0, 229, 160, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: c.published ? '#00e5a0' : '#ef4444',
                      border: `1px solid ${c.published ? 'rgba(0, 229, 160, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 10,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {c.published ? '● Live' : '○ Draft'}
                  </button>

                  <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(6,182,212,0.12)', color: c.color || '#06b6d4', padding: '3px 10px', borderRadius: 12, border: `1px solid ${c.color || '#06b6d4'}40`, fontWeight: 700 }}>
                    {c.department}
                  </span>

                  <span style={{ fontSize: 11, color: '#a1a1aa', fontFamily: "'JetBrains Mono', monospace" }}>
                    {c.type}
                  </span>

                  <span style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>
                    📍 {c.location}
                  </span>

                  <span style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>
                    ⏳ {c.experience}
                  </span>
                </div>

                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
                  {c.title}
                </h3>

                <p style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.6, margin: '0 0 14px 0', maxWidth: 800 }}>
                  {c.description}
                </p>

                {Array.isArray(c.tags) && c.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {c.tags.map((tag, i) => (
                      <span key={i} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(255,255,255,0.04)', color: '#71717a', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  onClick={() => openEditModal(c)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#06b6d4',
                    padding: '8px 16px',
                    borderRadius: 10,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444',
                    padding: '8px 16px',
                    borderRadius: 10,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT JOB OPENING MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0c0f1a', border: '1px solid rgba(0,229,160,0.3)', borderRadius: 24, width: '100%', maxWidth: 760, maxHeight: '92vh', overflowY: 'auto', padding: 32, boxShadow: '0 24px 60px rgba(0,0,0,0.85)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  {editingCareer ? '✦ EDIT JOB OPENING' : '✦ CREATE NEW JOB OPENING'}
                </span>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 900, color: '#fff', margin: '4px 0 0 0' }}>
                  {editingCareer ? 'Update Opening Details' : 'Post New Opening'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Job Title */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', marginBottom: 6 }}>
                  JOB TITLE *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full-Stack Engineer (Next.js / Node)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              {/* Department & Job Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', marginBottom: 6 }}>
                    DEPARTMENT *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', background: '#070a14', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="AI Research">AI Research</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Other">Custom Department...</option>
                  </select>
                  {department === 'Other' && (
                    <input
                      type="text"
                      placeholder="Type custom department name..."
                      value={customDept}
                      onChange={(e) => setCustomDept(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,229,160,0.3)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', marginTop: 8, boxSizing: 'border-box' }}
                    />
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', marginBottom: 6 }}>
                    EMPLOYMENT TYPE
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', background: '#070a14', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              {/* Location & Experience */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', marginBottom: 6 }}>
                    LOCATION
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Butwal / Remote (Nepal)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', marginBottom: 6 }}>
                    EXPERIENCE REQUIRED
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2+ Years"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', marginBottom: 6 }}>
                    SALARY / COMPENSATION
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Competitive / Negotiable"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', marginBottom: 6 }}>
                  ROLE OVERVIEW / SUMMARY *
                </label>
                <textarea
                  rows={3}
                  placeholder="High-level summary of the role..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                  required
                />
              </div>

              {/* Responsibilities */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', marginBottom: 6 }}>
                  KEY RESPONSIBILITIES (ONE PER LINE)
                </label>
                <textarea
                  rows={4}
                  placeholder="Architect scalable features&#10;Conduct technical code reviews&#10;Collaborate with product & engineering teams"
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                />
              </div>

              {/* Requirements */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', marginBottom: 6 }}>
                  REQUIREMENTS & QUALIFICATIONS (ONE PER LINE)
                </label>
                <textarea
                  rows={4}
                  placeholder="3+ years React, Next.js, Node.js&#10;Strong TypeScript & PostgreSQL proficiency&#10;Experience with high-throughput REST & GraphQL APIs"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                />
              </div>

              {/* Benefits */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', marginBottom: 6 }}>
                  WHAT WE OFFER / BENEFITS (ONE PER LINE)
                </label>
                <textarea
                  rows={3}
                  placeholder="Competitive salary + performance bonuses&#10;Hybrid / flexible working hours&#10;Annual learning budget & AI certifications"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                />
              </div>

              {/* Tech Tags */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', marginBottom: 6 }}>
                  SKILLS / TAGS (COMMA SEPARATED)
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, Next.js, TypeScript, PostgreSQL"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Accent Color & Display Order */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', marginBottom: 6 }}>
                    BUTTON ACCENT COLOR
                  </label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      style={{ width: 44, height: 38, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', marginBottom: 6 }}>
                    DISPLAY ORDER / SORT INDEX
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Status Radio Choice */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 18, borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
                <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', marginBottom: 12 }}>
                  PUBLISHING STATUS
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div
                    onClick={() => setPublished(true)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 12,
                      background: published ? 'rgba(0, 229, 160, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1.5px solid ${published ? '#00e5a0' : 'rgba(255, 255, 255, 0.1)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <input
                      type="radio"
                      name="careerStatus"
                      checked={published}
                      onChange={() => setPublished(true)}
                      style={{ cursor: 'pointer', accentColor: '#00e5a0' }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: published ? '#00e5a0' : '#fff' }}>
                        ● Publish Live Now
                      </div>
                      <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 2 }}>
                        Visible to all career page visitors immediately
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPublished(false)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 12,
                      background: !published ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1.5px solid ${!published ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <input
                      type="radio"
                      name="careerStatus"
                      checked={!published}
                      onChange={() => setPublished(false)}
                      style={{ cursor: 'pointer', accentColor: '#ef4444' }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: !published ? '#ef4444' : '#fff' }}>
                        ○ Save as Draft (Hidden)
                      </div>
                      <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 2 }}>
                        Saved in admin panel but hidden on live site
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Brand Info Sections (Editable) ── */}

              {/* Divider */}
              <div style={{ borderTop: '1px solid rgba(0,229,160,0.15)', paddingTop: 4 }}>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>
                  ✦ CAREERS PAGE BRAND SECTIONS
                </div>
                <div style={{ fontSize: 11, color: '#52525b', marginBottom: 16 }}>Edit the content shown below the job listing on the careers page.</div>
              </div>

              {/* Build the Future — Hero Description */}
              <div style={{ background: 'linear-gradient(135deg, rgba(0,229,160,0.06) 0%, rgba(6,182,212,0.06) 100%)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                  ✦ BUILD THE FUTURE WITH D-KODE ERA — Description
                </div>
                <div style={{ fontSize: 11, color: '#52525b', marginBottom: 8 }}>This appears as the tagline paragraph in the hero banner on the careers page.</div>
                <textarea
                  rows={3}
                  value={heroDesc}
                  onChange={(e) => setHeroDesc(e.target.value)}
                  placeholder="Join a team of passionate engineers..."
                  style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,229,160,0.25)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box' }}
                />
              </div>

              {/* Why Join D-Kode Era */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#06b6d4', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                  ✦ WHY JOIN D-KODE ERA? — Perk Items
                </div>
                <div style={{ fontSize: 11, color: '#52525b', marginBottom: 8 }}>One perk per line. Format: <span style={{ color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace" }}>emoji Title | Description</span></div>
                <textarea
                  rows={7}
                  value={whyJoinItems}
                  onChange={(e) => setWhyJoinItems(e.target.value)}
                  placeholder={'🚀 Cutting-Edge Stack | Work with Next.js, AI/ML...\n🌏 Remote-Friendly | Hybrid & fully remote options...'}
                  style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 10, color: '#fff', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", outline: 'none', resize: 'vertical', lineHeight: 1.8, boxSizing: 'border-box' }}
                />
              </div>

              {/* How to Apply */}
              <div style={{ background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.18)', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#06b6d4', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                  ✦ HOW TO APPLY — Steps
                </div>
                <div style={{ fontSize: 11, color: '#52525b', marginBottom: 8 }}>One step per line. Format: <span style={{ color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace" }}>Step Title | Description</span></div>
                <textarea
                  rows={6}
                  value={applySteps}
                  onChange={(e) => setApplySteps(e.target.value)}
                  placeholder={'Submit Your Application | Fill out the online form...\nInitial Screening | Our team reviews your profile...'}
                  style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 10, color: '#fff', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", outline: 'none', resize: 'vertical', lineHeight: 1.8, boxSizing: 'border-box' }}
                />
              </div>

              {/* D-Kode Era Footer Details */}
              <div style={{ background: 'linear-gradient(135deg, rgba(0,229,160,0.04) 0%, rgba(6,182,212,0.04) 100%)', border: '1px solid rgba(0,229,160,0.15)', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
                  ✦ D-KODE ERA — Company Footer Details
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#71717a', marginBottom: 5 }}>COMPANY TAGLINE</label>
                    <input
                      type="text"
                      value={companyTagline}
                      onChange={(e) => setCompanyTagline(e.target.value)}
                      placeholder="Building Digital Futures from Butwal, Nepal 🇳🇵"
                      style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#71717a', marginBottom: 5 }}>FOUNDED</label>
                      <input type="text" value={companyFounded} onChange={(e) => setCompanyFounded(e.target.value)} placeholder="2023" style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#71717a', marginBottom: 5 }}>LOCATION</label>
                      <input type="text" value={companyLocation2} onChange={(e) => setCompanyLocation2(e.target.value)} placeholder="Butwal, Nepal" style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#71717a', marginBottom: 5 }}>FOCUS / SERVICES</label>
                      <input type="text" value={companyFocus} onChange={(e) => setCompanyFocus(e.target.value)} placeholder="Web · AI · Mobile" style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#71717a', marginBottom: 5 }}>CULTURE</label>
                      <input type="text" value={companyCulture} onChange={(e) => setCompanyCulture(e.target.value)} placeholder="Remote-First" style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#a1a1aa',
                    padding: '11px 22px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: published ? 'linear-gradient(135deg, #00e5a0, #06b6d4)' : 'linear-gradient(135deg, #ef4444, #f59e0b)',
                    color: '#050810',
                    border: 'none',
                    padding: '11px 28px',
                    borderRadius: 10,
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {isSubmitting ? 'Saving...' : editingCareer ? 'Save Changes' : published ? 'Publish Job Opening →' : 'Save Draft →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
