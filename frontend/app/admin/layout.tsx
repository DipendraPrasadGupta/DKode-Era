'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/api/auth';

const NAV = [
  { name: 'Dashboard', path: '/admin', icon: '⊞', group: 'overview' },
  { name: 'Products', path: '/admin/products', icon: '🚀', group: 'content' },
  { name: 'Blogs & Articles', path: '/admin/blogs', icon: '📰', group: 'content' },
  { name: 'Careers', path: '/admin/careers', icon: '💼', group: 'content' },
  { name: 'Job Applications', path: '/admin/applications', icon: '📄', group: 'content' },
  { name: 'Services', path: '/admin/services', icon: '⚙️', group: 'content' },
  { name: 'Pricing Plans', path: '/admin/pricing', icon: '💰', group: 'content' },
  { name: 'Orders', path: '/admin/orders', icon: '🛒', group: 'content' },
  { name: 'Team', path: '/admin/team', icon: '👥', group: 'content' },
  { name: 'Testimonials', path: '/admin/testimonials', icon: '💬', group: 'content' },
  { name: 'FAQs', path: '/admin/faqs', icon: '❓', group: 'content' },
  { name: 'Messages', path: '/admin/messages', icon: '✉️', group: 'comms' },
  { name: 'Settings', path: '/admin/settings', icon: '⚙️', group: 'comms' },
];

const GROUPS: Record<string, string> = {
  overview: 'OVERVIEW',
  content: 'CONTENT MANAGEMENT',
  comms: 'SYSTEM & COMMS',
};

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <>{time}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    getCurrentUser()
      .then((data) => {
        setAdminUser(data.user?.username || 'Admin');
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
      });
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  if (loading && pathname !== '/admin/login') {
    return (
      <div style={{ background: '#060608', color: '#e4e4e7', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ position: 'relative', width: 56, height: 56 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid #1a1a2e', borderTopColor: '#06b6d4', animation: 'spin 0.9s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#71717a', letterSpacing: '0.12em' }}>VERIFYING SESSION...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (pathname === '/admin/login') return <>{children}</>;

  const currentPageObj = NAV.find((l) => l.path === pathname);
  const currentPage = currentPageObj?.name ?? 'Dashboard';

  // Group links
  const grouped: Record<string, typeof NAV> = {};
  NAV.forEach((link) => {
    (grouped[link.group] ??= []).push(link);
  });

  return (
    <div style={{ display: 'flex', background: '#060608', color: '#e4e4e7', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
      <style>{layoutCss}</style>

      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="admin-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`admin-sidebar ${mobileSidebarOpen ? 'admin-sidebar-open' : ''}`}
      >
        {/* Logo Header */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#050810',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(6,182,212,0.3)',
                }}
              >
                D
              </div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #f4f4f5 0%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  D-Kode Era
                </div>
                <div style={{ fontSize: 10, color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', fontWeight: 700 }}>
                  CONTROL CENTER v2.0
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              className="admin-sidebar-close-btn"
              onClick={() => setMobileSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* System Online Badge */}
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ fontSize: 10.5, color: '#10b981', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.06em' }}>
              ALL SYSTEMS ONLINE
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {Object.entries(grouped).map(([group, links], gi) => (
            <div key={group}>
              {gi > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '10px 8px' }} />}
              <div style={{ fontSize: 9.5, color: '#52525b', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', padding: '10px 8px 6px', fontWeight: 800 }}>
                {GROUPS[group]}
              </div>
              {links.map((link) => {
                const isActive = pathname === link.path;
                const isHov = hovered === link.path;
                return (
                  <Link key={link.path} href={link.path} style={{ textDecoration: 'none' }}>
                    <div
                      onMouseEnter={() => setHovered(link.path)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 10,
                        margin: '2px 0',
                        fontSize: 13.5,
                        fontWeight: isActive ? 800 : 500,
                        color: isActive ? '#06b6d4' : isHov ? '#f4f4f5' : '#a1a1aa',
                        background: isActive
                          ? 'linear-gradient(90deg, rgba(6,182,212,0.14) 0%, rgba(6,182,212,0.04) 100%)'
                          : isHov
                            ? 'rgba(255,255,255,0.04)'
                            : 'transparent',
                        borderLeft: isActive ? '3px solid #06b6d4' : '3px solid transparent',
                        paddingLeft: isActive ? 12 : 14,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ fontSize: 16, lineHeight: 1, opacity: isActive ? 1 : isHov ? 0.9 : 0.6 }}>{link.icon}</span>
                      <span>{link.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer / User Info */}
        <div style={{ padding: '14px 14px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 15,
                color: '#fff',
                boxShadow: '0 4px 12px rgba(6,182,212,0.3)',
              }}
            >
              {adminUser?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#f4f4f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adminUser ?? 'Admin'}
              </div>
              <div style={{ fontSize: 10.5, color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                SUPER ADMIN
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Workspace Area ─────────────────────────────────────── */}
      <div className="admin-main">
        {/* ── ENTERPRISE HEADER TOPBAR ── */}
        <header className="admin-header">
          {/* Left: Hamburger & High-Tech Breadcrumb Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="admin-hamburger-btn"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Toggle Navigation Drawer"
            >
              ☰
            </button>

            <Link href="/admin" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1aa', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <span>🏠</span>
                <span className="admin-breadcrumb-hide-mobile">Control Room</span>
              </div>
            </Link>

            <span style={{ color: '#3f3f46', fontSize: 14 }}>/</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', padding: '6px 14px', borderRadius: 10 }}>
              <span style={{ fontSize: 15 }}>{currentPageObj?.icon || '⚡'}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#06b6d4', fontFamily: "'Syne', sans-serif" }}>
                {currentPage}
              </span>
            </div>
          </div>

          {/* Right: Quick Action Buttons & Real-Time Clock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* View Website Launch Button */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="topbar-action-btn"
              style={{ background: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.3)', color: '#06b6d4' }}
            >
              <span>↗</span>
              <span className="admin-site-btn-label">Open Site</span>
            </a>

            {/* Live Clock Badge */}
            <div className="topbar-action-btn admin-clock-btn" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#a1a1aa' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
              <LiveClock />
            </div>
          </div>
        </header>

        {/* Content Page */}
        <main className="admin-content-area">
          {children}
        </main>
      </div>
    </div>
  );
}

const layoutCss = `
  @keyframes spin { to { transform: rotate(360deg); } }

  .admin-sidebar {
    width: 256px;
    background: linear-gradient(180deg, #0d0e18 0%, #080910 100%);
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; bottom: 0; left: 0;
    z-index: 1000;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .admin-sidebar-close-btn {
    display: none;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.15);
    color: #a1a1aa;
    width: 32px; height: 32px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    align-items: center;
    justify-content: center;
  }

  .admin-main {
    margin-left: 256px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    transition: margin-left 0.3s ease;
  }

  .admin-header {
    height: 70px;
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(9, 10, 16, 0.85);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .admin-content-area {
    padding: 36px 40px;
    flex: 1;
  }

  .admin-hamburger-btn {
    display: none;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: #06b6d4;
    font-size: 18px;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
  }

  .admin-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(4px);
    z-index: 999;
  }

  .logout-btn {
    width: 100%; padding: 11px 14px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 9px; color: #ef4444;
    font-size: 13px; font-weight: 700;
    cursor: pointer; font-family: 'Outfit', sans-serif;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s ease;
  }
  .logout-btn:hover { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.35); box-shadow: 0 4px 14px rgba(239,68,68,0.2); }

  .topbar-action-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 16px; border-radius: 9px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    font-size: 12.5px; color: #e4e4e7; font-weight: 700;
    transition: all 0.2s ease; cursor: pointer;
    text-decoration: none;
    font-family: 'Outfit', sans-serif;
  }
  .topbar-action-btn:hover { background: rgba(255,255,255,0.08); color: #ffffff; }

  @media (max-width: 1024px) {
    .admin-sidebar {
      transform: translateX(-100%);
      box-shadow: 0 0 40px rgba(0,0,0,0.8);
    }
    .admin-sidebar-open {
      transform: translateX(0);
    }
    .admin-sidebar-close-btn {
      display: flex;
    }
    .admin-main {
      margin-left: 0;
    }
    .admin-header {
      padding: 0 20px;
    }
    .admin-hamburger-btn {
      display: block;
    }
    .admin-content-area {
      padding: 24px 20px;
    }
  }

  @media (max-width: 640px) {
    .admin-header {
      padding: 0 16px;
    }
    .admin-content-area {
      padding: 20px 16px;
    }
    .admin-breadcrumb-hide-mobile, .admin-clock-btn {
      display: none !important;
    }
  }
`;

