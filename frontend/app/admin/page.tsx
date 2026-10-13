'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import { fetchIotProjects } from '@/lib/iotProjectsStore';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Legend,
} from 'recharts';

/* ──────────────────────── Types ──────────────────────── */
interface Stats {
  services: number; faqs: number; portfolio: number;
  team: number; testimonials: number; messages: number;
  orders: number; applications?: number;
}
interface Message {
  id: number; name: string; email: string;
  serviceNeeded: string; message: string; createdAt: string;
}
interface Order {
  id: number; serviceName: string; tierName: string;
  price: string; userName: string; status: string; createdAt: string;
}
interface Application {
  id: number; name: string; email: string; phone: string;
  careerTitle: string; department: string; cvUrl: string;
  resumeLink: string; coverNote: string; status: string; createdAt: string;
}

/* ──────────────────────── Helpers ──────────────────────── */
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ──────────────────────── Live Clock ──────────────────────── */
function LiveDateTime() {
  const [dt, setDt] = useState({ date: '', time: '', tz: '' });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setDt({
        date: now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
        {dt.time}
      </div>
      <div style={{ fontSize: 10.5, color: '#52525b', fontFamily: "'JetBrains Mono', monospace" }}>
        {dt.date} · {dt.tz}
      </div>
    </div>
  );
}

/* ──────────────────────── Mini Sparkline ──────────────────────── */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const w = 64, h = 28;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`${color}22`} stroke="none" />
    </svg>
  );
}

/* ──────────────────────── Custom Tooltip ──────────────────────── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f1117', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
      {label && <div style={{ color: '#71717a', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5 }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color ?? '#f4f4f5', fontWeight: 700 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allApps, setAllApps] = useState<Application[]>([]);
  const [iotCount, setIotCount] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;



    Promise.all([
      apiFetch('/admin/api/stats'),
      apiFetch('/admin/api/messages').catch(() => []),
      apiFetch('/admin/api/orders').catch(() => []),
      apiFetch('/admin/api/applications').catch(() => []),
      fetchIotProjects().catch(() => []),
    ]).then(([s, msgs, ords, apps, iotProjects]) => {
      setStats(s);
      setIotCount(Array.isArray(iotProjects) ? iotProjects.length : 0);
      setRecentMessages(Array.isArray(msgs) ? msgs.slice(0, 5) : []);
      setAllOrders(Array.isArray(ords) ? ords : []);
      setRecentOrders(Array.isArray(ords) ? ords.slice(0, 4) : []);
      setAllApps(Array.isArray(apps) ? apps : []);
      setRecentApps(Array.isArray(apps) ? apps.slice(0, 4) : []);
      setLoading(false);
    }).catch(err => { setError(err.message); setLoading(false); });
  }, [refreshKey]);

  /* ── Chart derivations ── */
  const orderStatusData = (() => {
    const map: Record<string, number> = {};
    allOrders.forEach(o => { map[o.status] = (map[o.status] ?? 0) + 1; });
    const colors: Record<string, string> = { Pending: '#f59e0b', Processing: '#3b82f6', Completed: '#10b981', Cancelled: '#ef4444' };
    return Object.entries(map).map(([name, value]) => ({ name, value, color: colors[name] ?? '#8b5cf6' }));
  })();

  const appStatusData = (() => {
    const map: Record<string, number> = {};
    allApps.forEach(a => { map[a.status || 'New'] = (map[a.status || 'New'] ?? 0) + 1; });
    const colors: Record<string, string> = { New: '#06b6d4', Reviewing: '#a78bfa', Shortlisted: '#10b981', Rejected: '#ef4444', Hired: '#00e5a0' };
    return Object.entries(map).map(([name, value]) => ({ name, value, color: colors[name] ?? '#71717a' }));
  })();

  const activityData = (() => {
    const days: { label: string; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), date: d.toISOString().slice(0, 10) });
    }
    return days.map(({ label, date }) => ({
      day: label,
      Messages: recentMessages.filter(m => m.createdAt?.slice(0, 10) === date).length,
      Orders: allOrders.filter(o => o.createdAt?.slice(0, 10) === date).length,
      Applications: allApps.filter(a => a.createdAt?.slice(0, 10) === date).length,
    }));
  })();

  const serviceBarData = (() => {
    const map: Record<string, number> = {};
    allOrders.forEach(o => { map[o.serviceName] = (map[o.serviceName] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name: name.length > 16 ? name.slice(0, 14) + '…' : name, count }));
  })();

  const msgSparkline = activityData.map(d => d.Messages);
  const ordSparkline = activityData.map(d => d.Orders);
  const appSparkline = activityData.map(d => d.Applications);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2.5px solid #1a1a2e', borderTopColor: '#06b6d4', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: '#52525b', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em' }}>LOADING ENTERPRISE ANALYTICS...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: 24, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, color: '#ef4444' }}>
      <h3 style={{ margin: '0 0 6px', fontFamily: "'Syne', sans-serif" }}>Dashboard Error</h3>
      <p style={{ margin: 0, fontSize: 13 }}>{error}</p>
    </div>
  );

  const kpiCards = [
    { title: 'Inbox Messages', count: stats?.messages ?? 0, icon: '📥', color: '#06b6d4', glow: 'rgba(6,182,212,0.2)', desc: 'Contact inquiries', link: '/admin/messages', spark: msgSparkline },
    { title: 'Order Inquiries', count: stats?.orders ?? 0, icon: '📦', color: '#3b82f6', glow: 'rgba(59,130,246,0.2)', desc: 'Client package requests', link: '/admin/orders', spark: ordSparkline },
    { title: 'Job Applications', count: stats?.applications ?? 0, icon: '📄', color: '#00e5a0', glow: 'rgba(0,229,160,0.2)', desc: 'Candidate CVs received', link: '/admin/applications', spark: appSparkline },
    { title: 'Active Services', count: stats?.services ?? 0, icon: '⚙️', color: '#f59e0b', glow: 'rgba(245,158,11,0.2)', desc: 'Agency offerings', link: '/admin/services', spark: [1,1,1,1,1,1,1] },
    { title: 'Portfolio Projects', count: stats?.portfolio ?? 0, icon: '✦', color: '#8b5cf6', glow: 'rgba(139,92,246,0.2)', desc: 'Featured work', link: '/admin/products', spark: [1,1,1,1,1,1,1] },
    { title: 'Team Members', count: stats?.team ?? 0, icon: '👥', color: '#ec4899', glow: 'rgba(236,72,153,0.2)', desc: 'Active roster', link: '/admin/team', spark: [1,1,1,1,1,1,1] },
    { title: 'Testimonials', count: stats?.testimonials ?? 0, icon: '💬', color: '#10b981', glow: 'rgba(16,185,129,0.2)', desc: 'Client reviews', link: '/admin/testimonials', spark: [1,1,1,1,1,1,1] },
    { title: 'IoT Projects', count: iotCount, icon: '⚡', color: '#00d4ff', glow: 'rgba(0,212,255,0.2)', desc: 'Hardware lab builds', link: '/admin/iot-projects', spark: [1,1,1,1,1,1,1] },
  ];

  const statusColor = (s: string) =>
    s === 'Completed' || s === 'Hired' ? '#10b981' :
    s === 'Processing' || s === 'Reviewing' || s === 'Shortlisted' ? '#3b82f6' :
    s === 'Cancelled' || s === 'Rejected' ? '#ef4444' : '#f59e0b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: "'Outfit', sans-serif" }}>
      <style>{css}</style>

      {/* ══ HERO BANNER ══ */}
      <div className="db-hero">
        <div className="db-hero-bg" />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="db-pulse-dot" />
            <span style={{ fontSize: 10.5, color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, letterSpacing: '0.14em' }}>
              AGENCY EXECUTIVE DASHBOARD · LIVE
            </span>
          </div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, margin: '0 0 6px', color: '#f4f4f5', lineHeight: 1.2 }}>
            Welcome back,{' '}
            <span style={{ background: 'linear-gradient(90deg,#06b6d4,#00e5a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Control Center
            </span>
          </h2>
          <p style={{ color: '#71717a', fontSize: 13, margin: 0, maxWidth: 520, lineHeight: 1.6 }}>
            Real-time overview of all agency operations — orders, applications, services, team &amp; analytics.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <LiveDateTime />
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={refresh} className="db-btn-ghost">🔄 Refresh</button>
            <a href="/" target="_blank" rel="noopener noreferrer" className="db-btn-primary">↗ Live Site</a>
          </div>
        </div>
      </div>

      {/* ══ KPI CARDS ══ */}
      <section>
        <div className="db-section-header">
          <span className="db-section-label">LIVE PLATFORM METRICS</span>
          <span className="db-section-sub">real-time database counts</span>
        </div>
        <div className="db-kpi-grid">
          {kpiCards.map((c, i) => (
            <Link key={i} href={c.link} style={{ textDecoration: 'none' }}>
              <div className="db-kpi-card" style={{ '--kpi-accent': c.color, '--kpi-glow': c.glow } as React.CSSProperties}>
                <div className="db-kpi-top-bar" style={{ background: c.color }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: c.glow, border: `1px solid ${c.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {c.icon}
                  </div>
                  <Sparkline values={c.spark} color={c.color} />
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
                  {c.count.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: c.color, marginTop: 4, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                  {c.title.toUpperCase()}
                </div>
                <div style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>{c.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ CHARTS ROW 1: Area Trend + Order Pie ══ */}
      <div className="db-two-col">
        <div className="db-card" style={{ borderTop: '3px solid #06b6d4' }}>
          <div className="db-card-header">
            <div>
              <div className="db-card-title">📈 7-Day Activity Trend</div>
              <div className="db-card-sub">Messages · Orders · Applications per day</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gMsg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gApp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5a0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#52525b', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#71717a' }} />
              <Area type="monotone" dataKey="Messages" stroke="#06b6d4" strokeWidth={2} fill="url(#gMsg)" dot={{ fill: '#06b6d4', r: 3 }} />
              <Area type="monotone" dataKey="Orders" stroke="#3b82f6" strokeWidth={2} fill="url(#gOrd)" dot={{ fill: '#3b82f6', r: 3 }} />
              <Area type="monotone" dataKey="Applications" stroke="#00e5a0" strokeWidth={2} fill="url(#gApp)" dot={{ fill: '#00e5a0', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="db-card" style={{ borderTop: '3px solid #3b82f6' }}>
          <div className="db-card-header">
            <div>
              <div className="db-card-title">🥧 Order Status Breakdown</div>
              <div className="db-card-sub">Distribution of all service orders</div>
            </div>
            <Link href="/admin/orders" className="db-view-all-link" style={{ color: '#3b82f6' }}>View All →</Link>
          </div>
          {orderStatusData.length === 0 ? (
            <div className="db-empty">No orders yet</div>
          ) : (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {orderStatusData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {orderStatusData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: 11.5, color: '#a1a1aa', fontFamily: "'JetBrains Mono', monospace" }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: d.color }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ CHARTS ROW 2: Service Bar + Application Pie ══ */}
      <div className="db-two-col">
        <div className="db-card" style={{ borderTop: '3px solid #f59e0b' }}>
          <div className="db-card-header">
            <div>
              <div className="db-card-title">📊 Orders by Service</div>
              <div className="db-card-sub">Most requested services from clients</div>
            </div>
          </div>
          {serviceBarData.length === 0 ? (
            <div className="db-empty">No order data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={serviceBarData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#52525b', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Orders" radius={[6, 6, 0, 0]}>
                  {serviceBarData.map((_, i) => {
                    const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];
                    return <Cell key={i} fill={colors[i % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="db-card" style={{ borderTop: '3px solid #00e5a0' }}>
          <div className="db-card-header">
            <div>
              <div className="db-card-title">🎯 Application Pipeline</div>
              <div className="db-card-sub">Hiring funnel status distribution</div>
            </div>
            <Link href="/admin/applications" className="db-view-all-link" style={{ color: '#00e5a0' }}>View All →</Link>
          </div>
          {appStatusData.length === 0 ? (
            <div className="db-empty">No applications yet</div>
          ) : (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={appStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {appStatusData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {appStatusData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: 11.5, color: '#a1a1aa', fontFamily: "'JetBrains Mono', monospace" }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: d.color }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ RECENT MESSAGES + ORDERS ══ */}
      <div className="db-two-col">
        <div className="db-card" style={{ borderTop: '3px solid #06b6d4' }}>
          <div className="db-card-header">
            <div>
              <div className="db-card-title">📥 Recent Messages</div>
              <div className="db-card-sub">Contact page submissions</div>
            </div>
            <Link href="/admin/messages" className="db-view-all-link" style={{ color: '#06b6d4' }}>All ({stats?.messages ?? 0}) →</Link>
          </div>
          {recentMessages.length === 0 ? (
            <div className="db-empty">Client inbox is empty</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentMessages.map(msg => (
                <div key={msg.id} className="db-list-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div className="db-avatar" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', color: '#06b6d4' }}>
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f4f4f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.name}</div>
                      <div style={{ fontSize: 10.5, color: '#52525b', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.email}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {msg.serviceNeeded && (
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#06b6d4', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', padding: '2px 7px', borderRadius: 20, marginBottom: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                        {msg.serviceNeeded}
                      </div>
                    )}
                    <div className="db-timeago">{timeAgo(msg.createdAt)}</div>
                    <div style={{ fontSize: 9.5, color: '#3f3f46', fontFamily: "'JetBrains Mono', monospace" }}>{fmtDate(msg.createdAt)} {fmtTime(msg.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="db-card" style={{ borderTop: '3px solid #3b82f6' }}>
          <div className="db-card-header">
            <div>
              <div className="db-card-title">📦 Recent Orders</div>
              <div className="db-card-sub">Service package requests</div>
            </div>
            <Link href="/admin/orders" className="db-view-all-link" style={{ color: '#3b82f6' }}>All ({stats?.orders ?? 0}) →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="db-empty">No service orders yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentOrders.map(ord => (
                <div key={ord.id} className="db-list-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div className="db-avatar" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6' }}>
                      {ord.userName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f4f4f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ord.userName}</div>
                      <div style={{ fontSize: 10.5, color: '#52525b', fontFamily: "'JetBrains Mono', monospace" }}>{ord.serviceName} · {ord.tierName}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>{ord.price}</div>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: statusColor(ord.status), background: `${statusColor(ord.status)}15`, padding: '1px 7px', borderRadius: 20, border: `1px solid ${statusColor(ord.status)}40`, fontFamily: "'JetBrains Mono', monospace" }}>
                      {ord.status.toUpperCase()}
                    </span>
                    <div className="db-timeago" style={{ marginTop: 2 }}>{timeAgo(ord.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ RECENT APPLICATIONS ══ */}
      <div className="db-card" style={{ borderTop: '3px solid #00e5a0' }}>
        <div className="db-card-header">
          <div>
            <div className="db-card-title">📄 Recent Job Applications</div>
            <div className="db-card-sub">Latest candidate submissions with CVs &amp; cover notes</div>
          </div>
          <Link href="/admin/applications" className="db-view-all-link" style={{ color: '#00e5a0' }}>All ({stats?.applications ?? 0}) →</Link>
        </div>
        {recentApps.length === 0 ? (
          <div className="db-empty">No job applications received yet</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {recentApps.map(app => {
              const sc = statusColor(app.status || 'New');
              const cv = app.cvUrl || app.resumeLink;
              return (
                <div key={app.id} className="db-app-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="db-avatar" style={{ width: 38, height: 38, fontSize: 16, background: 'rgba(0,229,160,0.12)', border: '1px solid rgba(0,229,160,0.3)', color: '#00e5a0' }}>
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#fff' }}>{app.name}</div>
                        <div style={{ fontSize: 10.5, color: '#52525b', fontFamily: "'JetBrains Mono', monospace" }}>{app.email}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: sc, background: `${sc}15`, padding: '2px 8px', borderRadius: 20, border: `1px solid ${sc}40`, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                      {(app.status || 'NEW').toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#00e5a0', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                    {app.careerTitle}
                  </div>
                  <p style={{ fontSize: 12, color: '#71717a', margin: '0 0 10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {app.coverNote}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {cv ? (
                      <a href={cv} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10.5, color: '#00e5a0', background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.25)', padding: '3px 10px', borderRadius: 7, fontWeight: 700, textDecoration: 'none', fontFamily: "'JetBrains Mono', monospace" }}>
                        📎 View CV
                      </a>
                    ) : (
                      <span style={{ fontSize: 10.5, color: '#3f3f46', fontFamily: "'JetBrains Mono', monospace" }}>No CV</span>
                    )}
                    <div style={{ textAlign: 'right' }}>
                      <div className="db-timeago">{timeAgo(app.createdAt)}</div>
                      <div style={{ fontSize: 9.5, color: '#3f3f46', fontFamily: "'JetBrains Mono', monospace" }}>{fmtDate(app.createdAt)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ BOTTOM: Quick Actions + System Health ══ */}
      <div className="db-two-col">
        <div className="db-card">
          <div className="db-card-title" style={{ marginBottom: 16 }}>⚡ Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '➕', label: 'Add Service Offering', href: '/admin/services', color: '#06b6d4' },
              { icon: '💰', label: 'Configure Pricing Packages', href: '/admin/pricing', color: '#f59e0b' },
              { icon: '📦', label: 'Manage Order Inquiries', href: '/admin/orders', color: '#3b82f6' },
              { icon: '✦', label: 'Post Portfolio Project', href: '/admin/products', color: '#8b5cf6' },
              { icon: '📰', label: 'Write Blog Article', href: '/admin/blogs', color: '#10b981' },
              { icon: '💼', label: 'Post New Career', href: '/admin/careers', color: '#00e5a0' },
              { icon: '👥', label: 'Roster Team Member', href: '/admin/team', color: '#ec4899' },
            ].map((a, i) => (
              <Link key={i} href={a.href} style={{ textDecoration: 'none' }}>
                <div className="db-quick-action" style={{ '--qa-color': a.color } as React.CSSProperties}>
                  <span>{a.icon} {a.label}</span>
                  <span style={{ opacity: 0.5 }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="db-card">
          <div className="db-card-title" style={{ marginBottom: 16 }}>🖥️ Infrastructure &amp; System Health</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Frontend', value: 'Next.js 14 App Router', status: 'online' },
              { label: 'Backend API', value: 'Node.js + Express', status: 'online' },
              { label: 'Database', value: 'Prisma ORM + SQLite', status: 'online' },
              { label: 'Auth Layer', value: 'JWT Bearer Tokens', status: 'secure' },
              { label: 'File Storage', value: 'Local /uploads', status: 'online' },
              { label: 'Email SMTP', value: 'Gmail App Password', status: 'configured' },
            ].map((row, i, arr) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <span style={{ fontSize: 11.5, color: '#52525b', fontFamily: "'JetBrains Mono', monospace" }}>{row.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7' }}>{row.value}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 20,
                    color: row.status === 'online' ? '#10b981' : row.status === 'secure' ? '#06b6d4' : '#f59e0b',
                    background: row.status === 'online' ? 'rgba(16,185,129,0.1)' : row.status === 'secure' ? 'rgba(6,182,212,0.1)' : 'rgba(245,158,11,0.1)',
                    border: `1px solid ${row.status === 'online' ? 'rgba(16,185,129,0.3)' : row.status === 'secure' ? 'rgba(6,182,212,0.3)' : 'rgba(245,158,11,0.3)'}`,
                    fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase',
                  }}>{row.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.1)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: 10, color: '#10b981', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, letterSpacing: '0.08em' }}>ALL SYSTEMS OPERATIONAL</span>
            </div>
            <div style={{ fontSize: 10.5, color: '#3f3f46', fontFamily: "'JetBrains Mono', monospace" }}>
              Session active · Data refreshes on demand
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── CSS ─────────────────── */
const css = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse-dot { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); } 50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

  .db-hero {
    background: linear-gradient(135deg, rgba(13,15,26,0.97) 0%, rgba(18,22,38,0.9) 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: clamp(20px,4vw,32px) clamp(20px,4vw,40px);
    display: flex; justify-content: space-between; align-items: center;
    position: relative; overflow: hidden; flex-wrap: wrap; gap: 20px;
    backdrop-filter: blur(16px);
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
    animation: fadeUp 0.4s ease;
  }
  .db-hero-bg {
    position: absolute; top: -100px; right: -100px;
    width: 360px; height: 360px;
    background: radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
  .db-pulse-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #10b981; display: inline-block;
    animation: pulse-dot 2s infinite;
  }

  .db-btn-primary {
    padding: 9px 20px; border-radius: 10px;
    background: linear-gradient(135deg, #06b6d4, #0ea5e9);
    color: #fff; font-size: 12.5px; font-weight: 800;
    text-decoration: none; border: none; cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px;
    transition: all 0.2s ease; font-family: 'Outfit', sans-serif;
    box-shadow: 0 4px 16px rgba(6,182,212,0.3);
  }
  .db-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(6,182,212,0.4); }

  .db-btn-ghost {
    padding: 9px 16px; border-radius: 10px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    color: #a1a1aa; font-size: 12.5px; font-weight: 700; cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px;
    transition: all 0.2s ease; font-family: 'Outfit', sans-serif;
  }
  .db-btn-ghost:hover { background: rgba(255,255,255,0.09); color: #f4f4f5; }

  .db-section-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
  }
  .db-section-label { font-size: 11px; font-family: 'JetBrains Mono', monospace; font-weight: 800; letter-spacing: 0.1em; color: #06b6d4; }
  .db-section-sub { font-size: 10.5px; color: #3f3f46; font-family: 'JetBrains Mono', monospace; }

  .db-kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
  }
  .db-kpi-card {
    background: linear-gradient(145deg, #0c0e17 0%, #111320 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 18px;
    position: relative; overflow: hidden;
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    cursor: pointer;
  }
  .db-kpi-card:hover {
    border-color: var(--kpi-accent);
    box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 20px var(--kpi-glow);
    transform: translateY(-4px);
  }
  .db-kpi-top-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; }

  .db-two-col {
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  }
  @media (max-width: 1024px) { .db-two-col { grid-template-columns: 1fr !important; } }

  .db-card {
    background: linear-gradient(145deg, #0c0e17 0%, #111320 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 24px;
    backdrop-filter: blur(12px);
  }
  .db-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; gap: 10px; }
  .db-card-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800; color: #f4f4f5; }
  .db-card-sub { font-size: 11px; color: #52525b; font-family: 'JetBrains Mono', monospace; margin-top: 3px; }
  .db-view-all-link { font-size: 11px; font-weight: 800; font-family: 'JetBrains Mono', monospace; text-decoration: none; white-space: nowrap; flex-shrink: 0; opacity: 0.85; transition: opacity 0.2s; }
  .db-view-all-link:hover { opacity: 1; }

  .db-empty { text-align: center; padding: 40px 20px; color: #3f3f46; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px dashed rgba(255,255,255,0.06); font-size: 13px; }

  .db-list-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 14px; background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; gap: 12px;
    transition: border-color 0.2s;
  }
  .db-list-item:hover { border-color: rgba(255,255,255,0.1); }

  .db-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; flex-shrink: 0;
    font-family: 'Syne', sans-serif;
  }

  .db-timeago { font-size: 10px; color: #71717a; font-family: 'JetBrains Mono', monospace; }

  .db-app-card {
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px; padding: 16px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .db-app-card:hover { border-color: rgba(0,229,160,0.2); box-shadow: 0 4px 20px rgba(0,229,160,0.08); }

  .db-quick-action {
    padding: 11px 14px; background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06); border-radius: 10px;
    color: #a1a1aa; font-size: 13px; font-weight: 600; cursor: pointer;
    transition: all 0.2s ease; display: flex; align-items: center;
    justify-content: space-between; font-family: 'Outfit', sans-serif;
  }
  .db-quick-action:hover {
    background: rgba(6,182,212,0.06);
    border-color: rgba(6,182,212,0.2);
    color: var(--qa-color, #06b6d4);
    transform: translateX(3px);
  }
`;
