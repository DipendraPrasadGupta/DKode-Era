'use client';

import { useState, useEffect } from 'react';

interface JobApplication {
  id: number;
  careerId: number;
  careerTitle: string;
  department: string;
  name: string;
  email: string;
  phone: string;
  portfolio: string;
  cvUrl: string;
  resumeLink: string;
  coverNote: string;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['New', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'];

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  New:        { bg: 'rgba(6,182,212,0.12)',  color: '#06b6d4', border: 'rgba(6,182,212,0.3)' },
  Reviewing:  { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
  Shortlisted:{ bg: 'rgba(0,229,160,0.12)',  color: '#00e5a0', border: 'rgba(0,229,160,0.3)' },
  Rejected:   { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
  Hired:      { bg: 'rgba(168,85,247,0.12)', color: '#a855f7', border: 'rgba(168,85,247,0.3)' },
};

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = () => {
    const token = localStorage.getItem('adminToken');
    fetch('http://localhost:5000/admin/api/applications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load applications');
        return r.json();
      })
      .then((data) => { setApps(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  };

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleStatusChange = async (id: number, status: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:5000/admin/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      showNotification(`Status updated to "${status}"`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:5000/admin/api/applications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      setApps((prev) => prev.filter((a) => a.id !== id));
      setDeletingId(null);
      showNotification('Application deleted.');
    } catch (err: any) {
      showNotification(err.message || 'Delete failed', 'error');
    }
  };

  // Derived filters
  const departments = ['All', ...Array.from(new Set(apps.map((a) => a.department).filter(Boolean)))];

  const filtered = apps.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.careerTitle.toLowerCase().includes(q) ||
      (a.department || '').toLowerCase().includes(q) ||
      (a.coverNote || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchDept = deptFilter === 'All' || a.department === deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  // Stats
  const stats = STATUS_OPTIONS.map((s) => ({ label: s, count: apps.filter((a) => a.status === s).length }));

  const inputSt: React.CSSProperties = {
    padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff',
    fontSize: 13, outline: 'none', fontFamily: "'Outfit', sans-serif",
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1400, margin: '0 auto', fontFamily: "'Outfit', sans-serif", color: '#fff' }}>
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: notification.type === 'success' ? 'rgba(0,229,160,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${notification.type === 'success' ? 'rgba(0,229,160,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: notification.type === 'success' ? '#00e5a0' : '#ef4444',
          padding: '14px 20px', borderRadius: 14, fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {notification.type === 'success' ? '✓ ' : '⚠ '}{notification.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          ✦ RECRUITMENT
        </span>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: '#fff', margin: '6px 0 4px' }}>
          Job Applications
        </h1>
        <p style={{ fontSize: 14, color: '#71717a', margin: 0 }}>
          Manage candidate applications, review CVs, and update hiring status.
        </p>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: "'Syne', sans-serif" }}>{apps.length}</span>
          <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#71717a', textTransform: 'uppercase' }}>Total</span>
        </div>
        {stats.map(({ label, count }) => {
          const c = STATUS_COLORS[label] || STATUS_COLORS['New'];
          return (
            <div
              key={label}
              onClick={() => setStatusFilter(statusFilter === label ? 'All' : label)}
              style={{
                background: statusFilter === label ? c.bg : 'rgba(255,255,255,0.03)',
                border: `1px solid ${statusFilter === label ? c.border : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12, padding: '14px 20px', cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 900, color: c.color, fontFamily: "'Syne', sans-serif" }}>{count}</span>
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: c.color, textTransform: 'uppercase' }}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <input
          type="text"
          placeholder="🔍  Search by name, email, role, or note..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ ...inputSt, flex: '1 1 260px', minWidth: 240 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ ...inputSt, minWidth: 140 }}
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          style={{ ...inputSt, minWidth: 160 }}
        >
          {departments.map((d) => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
        </select>
      </div>

      {/* Applications List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>
          Loading applications...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#ef4444' }}>{error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p style={{ color: '#71717a', fontSize: 15 }}>No applications match your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((app) => {
            const sc = STATUS_COLORS[app.status] || STATUS_COLORS['New'];
            const isExpanded = expandedId === app.id;
            const isDeleting = deletingId === app.id;
            const cvLink = app.cvUrl || app.resumeLink;

            return (
              <div
                key={app.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(12,15,26,0.95), rgba(6,9,18,0.9))',
                  border: `1px solid ${isExpanded ? sc.border : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 18, overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                  boxShadow: isExpanded ? `0 8px 32px rgba(0,0,0,0.4)` : 'none',
                }}
              >
                {/* Summary Row */}
                <div
                  style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${sc.color}33, ${sc.color}11)`,
                    border: `2px solid ${sc.color}50`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 800, color: sc.color, fontFamily: "'Syne', sans-serif",
                  }}>
                    {app.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{app.name}</div>
                    <div style={{ fontSize: 13, color: '#71717a', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span>✉ {app.email}</span>
                      {app.phone && <span>📞 {app.phone}</span>}
                    </div>
                  </div>

                  {/* Role */}
                  <div style={{ minWidth: 180 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{app.careerTitle}</div>
                    <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#71717a' }}>{app.department}</div>
                  </div>

                  {/* CV Download */}
                  {cvLink && (
                    <a
                      href={cvLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'rgba(0,229,160,0.1)', color: '#00e5a0',
                        border: '1px solid rgba(0,229,160,0.3)', padding: '6px 14px',
                        borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none',
                        fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      {app.cvUrl ? 'View CV' : 'Cloud Link'}
                    </a>
                  )}

                  {/* Status Badge + Dropdown */}
                  <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      style={{
                        background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                        borderRadius: 8, padding: '6px 10px', fontSize: 11,
                        fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                        cursor: 'pointer', outline: 'none',
                      }}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: 11, color: '#52525b', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                    {new Date(app.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>

                  {/* Expand chevron */}
                  <div style={{ color: '#52525b', fontSize: 14, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>▾</div>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 28 }}>
                      {/* Left — Cover Note */}
                      <div>
                        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Cover Note / Pitch
                        </div>
                        <div style={{
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: 12, padding: '16px 18px', fontSize: 14, color: '#a1a1aa',
                          lineHeight: 1.7, whiteSpace: 'pre-wrap',
                        }}>
                          {app.coverNote || '—'}
                        </div>
                      </div>

                      {/* Right — Candidate Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00e5a0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Candidate Details
                        </div>

                        {[
                          { label: 'Applied For', value: app.careerTitle },
                          { label: 'Department', value: app.department },
                          { label: 'Email', value: app.email },
                          { label: 'Phone', value: app.phone || '—' },
                          { label: 'Portfolio', value: app.portfolio },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#52525b', textTransform: 'uppercase' }}>{label}</span>
                            {label === 'Portfolio' && value ? (
                              <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#06b6d4', textDecoration: 'none', wordBreak: 'break-all' }}>{value}</a>
                            ) : label === 'Email' ? (
                              <a href={`mailto:${value}`} style={{ fontSize: 13, color: '#06b6d4', textDecoration: 'none' }}>{value}</a>
                            ) : (
                              <span style={{ fontSize: 13, color: '#d4d4d8' }}>{value || '—'}</span>
                            )}
                          </div>
                        ))}

                        {/* CV / Resume */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#52525b', textTransform: 'uppercase' }}>CV / Resume</span>
                          {app.cvUrl ? (
                            <a
                              href={app.cvUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'rgba(0,229,160,0.1)', color: '#00e5a0',
                                border: '1px solid rgba(0,229,160,0.3)', padding: '10px 16px',
                                borderRadius: 10, fontSize: 12, fontWeight: 700, textDecoration: 'none',
                                fontFamily: "'JetBrains Mono', monospace", width: 'fit-content',
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                              </svg>
                              Download Uploaded CV
                            </a>
                          ) : app.resumeLink ? (
                            <a
                              href={app.resumeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: 13, color: '#06b6d4', textDecoration: 'none', wordBreak: 'break-all' }}
                            >
                              🔗 {app.resumeLink}
                            </a>
                          ) : (
                            <span style={{ fontSize: 13, color: '#52525b' }}>No CV provided</span>
                          )}
                        </div>

                        {/* Applied date */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#52525b', textTransform: 'uppercase' }}>Applied On</span>
                          <span style={{ fontSize: 13, color: '#d4d4d8' }}>{new Date(app.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                      {!isDeleting ? (
                        <button
                          onClick={() => setDeletingId(app.id)}
                          style={{
                            background: 'transparent', color: '#ef4444',
                            border: '1px solid rgba(239,68,68,0.3)', padding: '8px 18px',
                            borderRadius: 10, fontSize: 12, cursor: 'pointer', fontWeight: 700,
                            fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: 6,
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          Delete Application
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 13, color: '#ef4444' }}>Confirm delete?</span>
                          <button
                            onClick={() => handleDelete(app.id)}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                          >
                            Yes, Delete
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            style={{ background: 'transparent', color: '#71717a', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
