'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';

interface ContactMessage {
  id: number;
  name: string;
  phone: string;
  email: string;
  company: string;
  serviceNeeded: string;
  budget: string;
  timeline: string;
  message: string;
  createdAt: string;
}

export default function MessagesAdminPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('All');

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Expanded Message State
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/api/messages');
      setMessages(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/admin/api/messages/${id}`, {
        method: 'DELETE',
      });

      showNotification('Client message inquiry deleted successfully!');
      setDeletingId(null);
      fetchMessages();
    } catch (err: any) {
      showNotification(err?.message || 'Failed to delete message.', 'error');
    }
  };

  // Derive unique service categories for filter dropdown
  const serviceOptions = [
    'All',
    ...Array.from(new Set(messages.map((m) => m.serviceNeeded).filter(Boolean))),
  ];

  // Filter messages based on search query and service filter
  const filteredMessages = messages.filter((msg) => {
    const matchesService =
      selectedServiceFilter === 'All' || msg.serviceNeeded === selectedServiceFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      msg.name.toLowerCase().includes(query) ||
      msg.email.toLowerCase().includes(query) ||
      (msg.company && msg.company.toLowerCase().includes(query)) ||
      (msg.phone && msg.phone.toLowerCase().includes(query)) ||
      (msg.serviceNeeded && msg.serviceNeeded.toLowerCase().includes(query)) ||
      (msg.budget && msg.budget.toLowerCase().includes(query)) ||
      (msg.timeline && msg.timeline.toLowerCase().includes(query)) ||
      msg.message.toLowerCase().includes(query);

    return matchesService && matchesSearch;
  });

  // Calculate Metric Stats
  const corporateCount = messages.filter((m) => m.company && m.company.trim()).length;
  const budgetSpecifiedCount = messages.filter((m) => m.budget && m.budget.trim()).length;
  const timelineSpecifiedCount = messages.filter((m) => m.timeline && m.timeline.trim()).length;

  if (loading)
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid #27272a', borderTopColor: '#06b6d4', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#71717a', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>LOADING CLIENT INBOX...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (error)
    return (
      <div style={{ padding: 24, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#ef4444' }}>
        <b>Connection Error: </b>{error}
      </div>
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

        .toast {
          position: fixed; bottom: 28px; right: 28px;
          padding: 14px 26px; border-radius: 12px;
          font-weight: 700; font-size: 13.5px; z-index: 200;
          animation: fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
          font-family: 'Outfit', sans-serif;
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
          display: flex; align-items: center; gap: 10px;
        }
        .toast-success { background: linear-gradient(135deg, #10b981, #059669); color: #050810; }
        .toast-error { background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; }

        .stat-badge-box {
          background: linear-gradient(135deg, rgba(16,20,32,0.95) 0%, rgba(22,27,42,0.85) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 190px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .stat-badge-box:hover {
          border-color: rgba(6,182,212,0.4);
          transform: translateY(-3px);
          box-shadow: 0 14px 32px rgba(6,182,212,0.15);
        }

        .input-cms {
          width: 100%; box-sizing: border-box;
          padding: 12px 16px;
          background: #090a10; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #e4e4e7;
          font-size: 13.5px; font-family: 'Outfit', sans-serif;
          outline: none; transition: all 0.25s ease;
        }
        .input-cms:focus { border-color: #06b6d4; box-shadow: 0 0 0 3.5px rgba(6,182,212,0.2); }

        .inbox-card-cms {
          background: linear-gradient(135deg, #0c0e17 0%, #131622 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 26px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(14px);
        }
        .inbox-card-cms:hover {
          border-color: rgba(6, 182, 212, 0.45);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5), 0 0 20px rgba(6, 182, 212, 0.1);
          transform: translateY(-4px);
        }

        .action-link-btn {
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          font-family: 'Outfit', sans-serif;
        }
      `}</style>

      {/* Notification Toast */}
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          <span>{notification.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, margin: 0, color: '#f4f4f5' }}>
            Client Inbox Messages
          </h2>
          <p style={{ fontSize: 13.5, color: '#71717a', margin: '4px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: '#06b6d4' }}>{messages.length}</span> Total Client Form Submissions &nbsp;·&nbsp;
            <span style={{ color: '#a1a1aa' }}>Inquiries sent via your agency website contact page</span>
          </p>
        </div>
      </div>

      {/* ── Metric Stats Overview ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            📥
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{messages.length}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Inquiries</div>
          </div>
        </div>

        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            💼
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{budgetSpecifiedCount}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Budget Specified</div>
          </div>
        </div>

        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            🏢
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{corporateCount}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Corporate Clients</div>
          </div>
        </div>

        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ⏱️
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{timelineSpecifiedCount}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline Tracked</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 15, pointerEvents: 'none', color: '#71717a' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by client name, email, phone, company, message text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-cms"
            style={{ paddingLeft: 44 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={selectedServiceFilter}
            onChange={(e) => setSelectedServiceFilter(e.target.value)}
            className="input-cms"
            style={{ width: 'auto', paddingRight: 32 }}
          >
            {serviceOptions.map((opt) => (
              <option key={opt} value={opt}>
                Service: {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Inbox Messages List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {filteredMessages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 24px',
              background: '#12121a',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              color: '#71717a',
            }}
          >
            <div style={{ fontSize: 48 }}>📥</div>
            <div style={{ fontWeight: 700, color: '#e4e4e7', fontSize: 16.5 }}>
              {searchQuery || selectedServiceFilter !== 'All' ? 'No messages match search filters' : 'Your client inbox is empty'}
            </div>
            <p style={{ margin: 0, fontSize: 13.5, opacity: 0.7, maxWidth: 340 }}>
              {searchQuery || selectedServiceFilter !== 'All' ? 'Try adjusting your search query or service filter.' : 'Messages submitted from your contact page will appear here.'}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isExpanded = expandedId === msg.id;

            return (
              <div key={msg.id} className="inbox-card-cms">
                {/* Header Row: Client Info & Metadata Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, rgba(6,182,212,0.16) 0%, rgba(139,92,246,0.16) 100%)',
                        border: '1px solid rgba(6,182,212,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        color: '#06b6d4',
                        fontWeight: 800,
                        fontFamily: "'Syne', sans-serif",
                        boxShadow: '0 4px 14px rgba(6,182,212,0.15)',
                      }}
                    >
                      {msg.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f4f4f5', margin: 0, fontFamily: "'Syne', sans-serif", display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span>{msg.name}</span>
                        {msg.company && (
                          <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'JetBrains Mono', monospace" }}>
                            🏢 {msg.company}
                          </span>
                        )}
                      </h3>

                      <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 12.5, color: '#71717a', flexWrap: 'wrap', fontFamily: "'JetBrains Mono', monospace" }}>
                        <span>✉️ {msg.email}</span>
                        <span>📞 {msg.phone}</span>
                        <span>•</span>
                        <span>🕒 {new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Tags & Quick Contact Action Buttons */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {msg.serviceNeeded && (
                      <span
                        style={{
                          background: 'rgba(6,182,212,0.12)',
                          color: '#06b6d4',
                          border: '1px solid rgba(6,182,212,0.3)',
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 11.5,
                          fontWeight: 800,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {msg.serviceNeeded}
                      </span>
                    )}

                    {msg.budget && (
                      <span
                        style={{
                          background: 'rgba(16,185,129,0.12)',
                          color: '#10b981',
                          border: '1px solid rgba(16,185,129,0.3)',
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 11.5,
                          fontWeight: 800,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        💰 {msg.budget}
                      </span>
                    )}

                    {msg.timeline && (
                      <span
                        style={{
                          background: 'rgba(168,85,247,0.12)',
                          color: '#a855f7',
                          border: '1px solid rgba(168,85,247,0.3)',
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 11.5,
                          fontWeight: 800,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        ⏱️ {msg.timeline}
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Body Container */}
                <div
                  style={{
                    background: '#090a10',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: 20,
                    position: 'relative',
                  }}
                >
                  <p
                    style={{
                      fontSize: 13.5,
                      color: '#e4e4e7',
                      lineHeight: 1.7,
                      margin: 0,
                      whiteSpace: isExpanded ? 'pre-wrap' : 'nowrap',
                      textOverflow: isExpanded ? 'clip' : 'ellipsis',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                    title="Click to expand/collapse message"
                  >
                    {msg.message}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px dashed rgba(255,255,255,0.06)' }}>
                    {/* Direct Client Contact Links */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <a
                        href={`mailto:${msg.email}?subject=Re: Inquiry for ${msg.serviceNeeded || 'Digital Solutions'}`}
                        className="action-link-btn"
                        style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.25)' }}
                      >
                        ✉️ Email Client
                      </a>

                      {msg.phone && (
                        <a
                          href={`tel:${msg.phone}`}
                          className="action-link-btn"
                          style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}
                        >
                          📞 Call ({msg.phone})
                        </a>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#06b6d4',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {isExpanded ? 'Collapse Message ▲' : 'Read Full Message ▼'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingId(msg.id)}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.25)',
                          color: '#ef4444',
                          padding: '6px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "'Outfit', sans-serif",
                          transition: 'all 0.2s ease',
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5,5,12,0.88)',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#12121a',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 20,
              padding: 36,
              textAlign: 'center',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 30px rgba(239,68,68,0.15)',
              animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 18px' }}>
              🗑️
            </div>

            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 21, fontWeight: 800, margin: '0 0 8px 0', color: '#f4f4f5' }}>
              Delete Client Message?
            </h3>

            <p style={{ fontSize: 13.5, color: '#a1a1aa', margin: '0 0 24px 0', lineHeight: 1.6 }}>
              This will permanently delete this client message inquiry from your inbox. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setDeletingId(null)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  color: '#a1a1aa',
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                No, Keep It
              </button>

              <button
                onClick={() => deletingId !== null && handleDelete(deletingId)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  borderRadius: 10,
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(239,68,68,0.35)',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Yes, Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
