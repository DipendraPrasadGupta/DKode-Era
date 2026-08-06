'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  services: number;
  faqs: number;
  portfolio: number;
  team: number;
  testimonials: number;
  messages: number;
  orders: number;
}

interface Message {
  id: number;
  name: string;
  email: string;
  serviceNeeded: string;
  message: string;
  createdAt: string;
}

interface Order {
  id: number;
  serviceName: string;
  tierName: string;
  price: string;
  userName: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const fetchStats = fetch('http://localhost:5000/admin/api/stats', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to load stats');
      return res.json();
    });

    const fetchMessages = fetch('http://localhost:5000/admin/api/messages', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to load messages');
      return res.json();
    });

    const fetchOrders = fetch('http://localhost:5000/admin/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .catch(() => []);

    Promise.all([fetchStats, fetchMessages, fetchOrders])
      .then(([statsData, messagesData, ordersData]) => {
        setStats(statsData);
        setRecentMessages(Array.isArray(messagesData) ? messagesData.slice(0, 4) : []);
        setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 4) : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading dashboard data:', err);
        setError(err.message || 'Error fetching metrics.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid #27272a', borderTopColor: '#06b6d4', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#71717a', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>COMPUTING ENTERPRISE METRICS...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#ef4444' }}>
        <h3 style={{ margin: '0 0 8px 0', fontFamily: "'Syne', sans-serif" }}>Dashboard Connection Failure</h3>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.85 }}>{error}</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Active Services', count: stats?.services ?? 0, icon: '💼', color: '#06b6d4', glow: 'rgba(6,182,212,0.25)', desc: 'Main agency service offerings', link: '/admin/services' },
    { title: 'Order Inquiries', count: stats?.orders ?? 0, icon: '📦', color: '#3b82f6', glow: 'rgba(59,130,246,0.25)', desc: 'Client package requests', link: '/admin/orders' },
    { title: 'Inbox Messages', count: stats?.messages ?? 0, icon: '📥', color: '#10b981', glow: 'rgba(16,185,129,0.25)', desc: 'Contact page submissions', link: '/admin/messages' },
    { title: 'Portfolio Showcase', count: stats?.portfolio ?? 0, icon: '✦', color: '#eab308', glow: 'rgba(234,179,8,0.25)', desc: 'Featured agency projects', link: '/admin/portfolio' },
    { title: 'Agency Team', count: stats?.team ?? 0, icon: '👥', color: '#8b5cf6', glow: 'rgba(139,92,246,0.25)', desc: 'Active team roster', link: '/admin/team' },
    { title: 'Testimonials', count: stats?.testimonials ?? 0, icon: '💬', color: '#ec4899', glow: 'rgba(236,72,153,0.25)', desc: 'Verified client reviews', link: '/admin/testimonials' },
    { title: 'FAQs Library', count: stats?.faqs ?? 0, icon: '❓', color: '#f97316', glow: 'rgba(249,115,22,0.25)', desc: 'Help desk items defined', link: '/admin/faqs' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.8; } 50% { opacity: 0.4; } }

        .welcome-hero-banner {
          background: linear-gradient(135deg, rgba(16,20,32,0.95) 0%, rgba(22,27,42,0.85) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: clamp(20px, 4vw, 34px) clamp(20px, 4vw, 40px);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(14px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          flex-wrap: wrap;
          gap: 16px;
        }
        .welcome-hero-banner::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .admin-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .admin-two-col {
            grid-template-columns: 1fr !important;
          }
        }

        .stat-card-enterprise {
          background: linear-gradient(135deg, #0c0e17 0%, #131622 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(14px);
        }
        .stat-card-enterprise:hover {
          border-color: var(--stat-accent, #06b6d4);
          box-shadow: 0 20px 48px rgba(0,0,0,0.5), 0 0 25px var(--stat-glow, rgba(6,182,212,0.25));
          transform: translateY(-5px);
        }

        .dashboard-module {
          background: linear-gradient(135deg, #0c0e17 0%, #131622 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 28px;
          backdrop-filter: blur(14px);
        }

        .quick-action-link {
          padding: 13px 18px;
          background: #090a10;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #e4e4e7;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'Outfit', sans-serif;
        }
        .quick-action-link:hover {
          background: rgba(6,182,212,0.12);
          border-color: rgba(6,182,212,0.3);
          color: #06b6d4;
          transform: translateX(4px);
        }

        .system-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 10px;
        }
        .system-label {
          color: #71717a;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
        }
        .system-value {
          font-weight: 700;
          color: #e4e4e7;
          font-size: 12.5px;
        }
      `}</style>

      {/* ── Welcome Hero Banner ── */}
      <div className="welcome-hero-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <span style={{ fontSize: 11, color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              AGENCY EXECUTIVE DASHBOARD
            </span>
          </div>

          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, margin: 0, color: '#f4f4f5', lineHeight: 1.2 }}>
            Welcome back to D-Kode Era Control Center
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: 14, margin: '8px 0 0 0', maxWidth: 640, lineHeight: 1.6 }}>
            Manage agency services, client subscription pricing, live order inquiries, portfolio showcases, and team rosters in real time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '11px 20px',
              background: 'rgba(6,182,212,0.12)',
              border: '1px solid rgba(6,182,212,0.3)',
              borderRadius: 10,
              color: '#06b6d4',
              fontSize: 13,
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
            }}
          >
            <span>🚀 View Live Site</span>
          </a>
        </div>
      </div>

      {/* ── Grid Metrics Cards ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
            LIVE PLATFORM METRICS
          </h3>
          <span style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>REALTIME DATABASE COUNTS</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {statCards.map((c, i) => (
            <Link key={i} href={c.link} style={{ textDecoration: 'none' }}>
              <div
                className="stat-card-enterprise"
                style={{ '--stat-accent': c.color, '--stat-glow': c.glow } as React.CSSProperties}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3.5, background: c.color }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 11.5, color: '#71717a', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                    {c.title.toUpperCase()}
                  </span>

                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: c.glow,
                      border: `1px solid ${c.color}44`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                    }}
                  >
                    {c.icon}
                  </div>
                </div>

                <div style={{ margin: '4px 0 6px 0' }}>
                  <span style={{ fontSize: 34, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{c.count}</span>
                </div>

                <span style={{ fontSize: 12, color: '#71717a' }}>{c.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Activity Feed: Messages & Orders side-by-side ── */}
      <div className="admin-two-col">

        {/* ── Recent Client Messages Panel ── */}
        <div className="dashboard-module" style={{ borderTop: '3px solid #06b6d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
                  📥
                </div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, margin: 0, color: '#f4f4f5' }}>
                  Recent Messages
                </h3>
              </div>
              <p style={{ fontSize: 11.5, color: '#71717a', margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                Contact page inquiries &amp; project requests
              </p>
            </div>
            <Link href="/admin/messages" style={{ fontSize: 11.5, color: '#06b6d4', textDecoration: 'none', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap', flexShrink: 0 }}>
              View All ({stats?.messages ?? 0}) →
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '42px 20px', color: '#71717a', background: '#090a10', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.08)', fontSize: 13 }}>
              📥 Client inbox is empty.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    background: '#090a10',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#06b6d4', flexShrink: 0 }}>
                        {msg.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#f4f4f5' }}>{msg.name}</div>
                        <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>{msg.email}</div>
                      </div>
                    </div>
                    {msg.serviceNeeded && (
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20, color: '#06b6d4', background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                        {msg.serviceNeeded}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12.5, color: '#a1a1aa', lineHeight: 1.6, margin: '0 0 8px 0' }}>
                    {msg.message.length > 100 ? msg.message.slice(0, 100) + '...' : msg.message}
                  </p>
                  <div style={{ fontSize: 10.5, color: '#52525b', fontFamily: "'JetBrains Mono', monospace", textAlign: 'right' }}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Recent Order Inquiries Panel ── */}
        <div className="dashboard-module" style={{ borderTop: '3px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
                  📦
                </div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, margin: 0, color: '#f4f4f5' }}>
                  Recent Orders
                </h3>
              </div>
              <p style={{ fontSize: 11.5, color: '#71717a', margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                Client service package purchase requests
              </p>
            </div>
            <Link href="/admin/orders" style={{ fontSize: 11.5, color: '#3b82f6', textDecoration: 'none', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap', flexShrink: 0 }}>
              View All ({stats?.orders ?? 0}) →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '42px 20px', color: '#71717a', background: '#090a10', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.08)', fontSize: 13 }}>
              📦 No service orders yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentOrders.map((ord) => {
                const statusColor = ord.status === 'Completed' ? '#10b981' : ord.status === 'Processing' ? '#3b82f6' : ord.status === 'Cancelled' ? '#ef4444' : '#f59e0b';
                return (
                  <div key={ord.id} style={{ background: '#090a10', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#3b82f6', flexShrink: 0 }}>
                          {ord.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#f4f4f5' }}>{ord.userName}</div>
                          <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>
                            {ord.serviceName} · {ord.tierName}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>{ord.price}</div>
                        <span style={{ fontSize: 10, color: statusColor, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", background: `${statusColor}15`, padding: '2px 8px', borderRadius: 20, border: `1px solid ${statusColor}40` }}>
                          {ord.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row: Quick Actions & Infrastructure ── */}
      <div className="admin-two-col">
        {/* Quick Actions Module */}
        <div className="dashboard-module">
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, margin: '0 0 16px 0', color: '#f4f4f5' }}>
            ⚡ Quick Actions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/admin/services" style={{ textDecoration: 'none' }}>
              <div className="quick-action-link">
                <span>➕ Add Service Offering</span>
                <span>→</span>
              </div>
            </Link>

            <Link href="/admin/pricing" style={{ textDecoration: 'none' }}>
              <div className="quick-action-link">
                <span>💰 Configure Pricing Packages</span>
                <span>→</span>
              </div>
            </Link>

            <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
              <div className="quick-action-link">
                <span>📦 Manage Order Inquiries</span>
                <span>→</span>
              </div>
            </Link>

            <Link href="/admin/portfolio" style={{ textDecoration: 'none' }}>
              <div className="quick-action-link">
                <span>✦ Post Portfolio Project</span>
                <span>→</span>
              </div>
            </Link>

            <Link href="/admin/team" style={{ textDecoration: 'none' }}>
              <div className="quick-action-link">
                <span>👥 Roster Team Member</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </div>

        {/* System Infrastructure Health */}
        <div className="dashboard-module">
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, margin: '0 0 16px 0', color: '#f4f4f5' }}>
            🖥️ Infrastructure Stack
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12.5 }}>
            <div className="system-row">
              <span className="system-label">Database</span>
              <span className="system-value" style={{ color: '#10b981' }}>✓ PostgreSQL</span>
            </div>

            <div className="system-row">
              <span className="system-label">Framework</span>
              <span className="system-value">Next.js App Router</span>
            </div>

            <div className="system-row">
              <span className="system-label">Engine</span>
              <span className="system-value">Node.js Express Server</span>
            </div>

            <div className="system-row">
              <span className="system-label">ORM Layer</span>
              <span className="system-value">Prisma Client v5</span>
            </div>

            <div className="system-row" style={{ border: 'none', paddingBottom: 0 }}>
              <span className="system-label">Security</span>
              <span className="system-value" style={{ color: '#06b6d4' }}>JWT Authorization</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
