'use client';

import { useState, useEffect, useCallback } from 'react';
import { API_URL, apiFetch } from '@/lib/api';
import { invalidateSiteSettingsCache } from '@/lib/useSiteSettings';

interface Setting {
  id: string;
  label: string;
  defaultValue: string;
  type: 'text' | 'email' | 'number' | 'select' | 'toggle' | 'password' | 'url' | 'textarea';
  category: 'agency' | 'social' | 'seo' | 'notifications' | 'security' | 'system';
  options?: { label: string; value: string }[];
  description?: string;
  readOnly?: boolean;
  sensitive?: boolean;
}

const CATEGORIES = [
  { id: 'agency',        name: 'Agency Profile',  icon: '🏢', description: 'Company identity, contact & location' },
  { id: 'social',        name: 'Social & Links',   icon: '🔗', description: 'Social media & external profiles' },
  { id: 'seo',           name: 'SEO & Meta',       icon: '🔍', description: 'Search engine & metadata configuration' },
  { id: 'notifications', name: 'Notifications',    icon: '🔔', description: 'Alert preferences & email triggers' },
  { id: 'security',      name: 'Security',         icon: '🔐', description: 'Admin access, sessions & auth' },
  { id: 'system',        name: 'System Info',      icon: '🖥️', description: 'Runtime environment (read-only)' },
];

const SCHEMA: Setting[] = [
  // ── Agency Profile ──────────────────────────────────
  { id: 'agency_name',      label: 'Agency Name',           defaultValue: 'D-Kode Era',              type: 'text',   category: 'agency', description: 'Your agency or company display name' },
  { id: 'agency_tagline',   label: 'Tagline / Slogan',      defaultValue: 'We Build Digital Futures', type: 'text',   category: 'agency', description: 'Short tagline shown on hero sections' },
  { id: 'agency_email',     label: 'Primary Email',         defaultValue: 'hello@dkodeera.com',       type: 'email',  category: 'agency', description: 'Main business contact email address' },
  { id: 'support_email',    label: 'Support Email',         defaultValue: 'support@dkodeera.com',     type: 'email',  category: 'agency', description: 'Client support and helpdesk email' },
  { id: 'agency_phone',     label: 'Phone / WhatsApp',      defaultValue: '+977-9800000000',          type: 'text',   category: 'agency', description: 'Primary phone for WhatsApp and calls' },
  { id: 'agency_website',   label: 'Website URL',           defaultValue: 'https://dkodeera.com',     type: 'url',    category: 'agency', description: 'Your live public-facing website URL' },
  { id: 'agency_address',   label: 'Office Address',        defaultValue: 'Butwal-10, Rupandehi, Nepal', type: 'text', category: 'agency', description: 'Physical office or mailing address' },
  { id: 'agency_country',   label: 'Country',               defaultValue: 'Nepal',                    type: 'select', category: 'agency', options: [{ label: 'Nepal', value: 'Nepal' }, { label: 'India', value: 'India' }, { label: 'USA', value: 'USA' }, { label: 'UK', value: 'UK' }], description: 'Country of registration' },
  { id: 'agency_currency',  label: 'Default Currency',      defaultValue: 'NPR',                      type: 'select', category: 'agency', options: [{ label: 'NPR - Nepali Rupee', value: 'NPR' }, { label: 'INR - Indian Rupee', value: 'INR' }, { label: 'USD - US Dollar', value: 'USD' }], description: 'Default currency for pricing and invoices' },
  { id: 'agency_founded',   label: 'Founded Year',          defaultValue: '2026',                     type: 'number', category: 'agency', description: 'Year the agency was founded' },
  { id: 'agency_team_size', label: 'Team Size Range',       defaultValue: '5-10',                     type: 'select', category: 'agency', options: [{ label: '1-5', value: '1-5' }, { label: '5-10', value: '5-10' }, { label: '10-25', value: '10-25' }, { label: '25-50', value: '25-50' }, { label: '50+', value: '50+' }], description: 'Company headcount range' },
  { id: 'business_hours',   label: 'Business Hours',        defaultValue: 'Sun–Fri 9AM–6PM NST',      type: 'text',   category: 'agency', description: 'Working hours shown on contact pages' },

  // ── Social & External Links ──────────────────────────
  { id: 'social_linkedin',  label: 'LinkedIn Profile',      defaultValue: 'https://linkedin.com/company/d-kode-era', type: 'url',  category: 'social', description: 'Agency LinkedIn company page URL' },
  { id: 'social_instagram', label: 'Instagram URL',         defaultValue: 'https://instagram.com/d_kode_era',        type: 'url',  category: 'social', description: 'Agency Instagram profile URL' },
  { id: 'social_facebook',  label: 'Facebook Page URL',     defaultValue: 'https://facebook.com/dkodeera',           type: 'url',  category: 'social', description: 'Agency Facebook business page' },
  { id: 'social_twitter',   label: 'Twitter / X Profile',   defaultValue: 'https://twitter.com/dkodeera',            type: 'url',  category: 'social', description: 'Agency Twitter (X) account URL' },
  { id: 'social_youtube',   label: 'YouTube Channel URL',   defaultValue: '',                                        type: 'url',  category: 'social', description: 'Agency YouTube channel link (optional)' },
  { id: 'social_github',    label: 'GitHub Organization',   defaultValue: 'https://github.com/d-kode-era',           type: 'url',  category: 'social', description: 'Public GitHub organization profile' },
  { id: 'whatsapp_number',  label: 'WhatsApp Business No.', defaultValue: '+977-9800000000',                         type: 'text', category: 'social', description: 'WhatsApp number for direct client chat' },
  { id: 'calendly_link',    label: 'Calendly Booking Link', defaultValue: 'https://calendly.com/d-kode-era',         type: 'url',  category: 'social', description: 'Meeting booking link for client discovery calls' },

  // ── SEO & Meta ──────────────────────────────────────
  { id: 'seo_title',        label: 'Default Page Title',    defaultValue: 'D-Kode Era — Digital Agency',          type: 'text',   category: 'seo', description: 'Default HTML title tag for all pages' },
  { id: 'seo_description',  label: 'Meta Description',      defaultValue: 'Nepal\'s fastest-growing IT company.', type: 'textarea', category: 'seo', description: '150-160 character site meta description' },
  { id: 'seo_keywords',     label: 'Focus Keywords',        defaultValue: 'digital agency, web development, Nepal', type: 'text', category: 'seo', description: 'Comma-separated SEO focus keywords' },
  { id: 'seo_og_image',     label: 'OG Social Share Image', defaultValue: 'https://dkodeera.com/og-image.jpg',    type: 'url',    category: 'seo', description: 'Image shown when shared on social (1200x630px)' },
  { id: 'seo_twitter_handle', label: 'Twitter Card Handle', defaultValue: '@dkodeera',                            type: 'text',   category: 'seo', description: 'Twitter handle for Twitter Card meta tags' },
  { id: 'seo_ga_id',        label: 'Google Analytics ID',   defaultValue: 'G-XXXXXXXXXX',                         type: 'text',   category: 'seo', description: 'GA4 Measurement ID (e.g. G-XXXXXXXXXX)' },
  { id: 'seo_robots',       label: 'Robots Meta Tag',       defaultValue: 'index,follow',                         type: 'select', category: 'seo', options: [{ label: 'index, follow (Public)', value: 'index,follow' }, { label: 'noindex, nofollow (Hidden)', value: 'noindex,nofollow' }], description: 'Instructions for search engine crawlers' },

  // ── Notifications & Alerts ───────────────────────────
  { id: 'notify_new_order',    label: 'New Order Alert',       defaultValue: 'true',               type: 'toggle', category: 'notifications', description: 'Email admin when a new service order is submitted' },
  { id: 'notify_new_message',  label: 'New Message Alert',     defaultValue: 'true',               type: 'toggle', category: 'notifications', description: 'Email admin when a new contact form message arrives' },
  { id: 'notify_email_to',     label: 'Alert Recipient Email', defaultValue: 'admin@dkodeera.com', type: 'email',  category: 'notifications', description: 'Email address that receives all admin notification alerts' },
  { id: 'notify_order_client', label: 'Auto-Reply to Client',  defaultValue: 'true',               type: 'toggle', category: 'notifications', description: 'Auto-send confirmation email to client after order' },
  { id: 'notify_daily_digest', label: 'Daily Activity Digest', defaultValue: 'false',              type: 'toggle', category: 'notifications', description: 'Receive a daily summary of orders, messages and stats' },
  { id: 'notify_channel',      label: 'Notification Channel',  defaultValue: 'email',              type: 'select', category: 'notifications', options: [{ label: 'Email Only', value: 'email' }, { label: 'WhatsApp Only', value: 'whatsapp' }, { label: 'Email + WhatsApp', value: 'both' }], description: 'Primary notification delivery channel' },

  // ── Security ────────────────────────────────────────
  { id: 'jwt_expiry',       label: 'JWT Session Expiry',         defaultValue: '24h',  type: 'select',   category: 'security', options: [{ label: '1 Hour (High Security)', value: '1h' }, { label: '6 Hours', value: '6h' }, { label: '24 Hours (Default)', value: '24h' }, { label: '7 Days', value: '7d' }], description: 'Admin login token validity duration' },
  { id: 'session_timeout',  label: 'Idle Session Timeout (min)', defaultValue: '60',   type: 'number',   category: 'security', description: 'Auto-logout admin after N minutes of inactivity' },
  { id: 'login_attempts',   label: 'Max Failed Login Attempts',  defaultValue: '5',    type: 'number',   category: 'security', description: 'Lock account after N consecutive failed logins' },
  { id: 'admin_2fa',        label: 'Two-Factor Auth (2FA)',      defaultValue: 'false', type: 'toggle',  category: 'security', description: 'Require TOTP 2FA verification for all admin logins' },
  { id: 'admin_password',   label: 'Change Admin Password',      defaultValue: '',      type: 'password', category: 'security', description: 'Set a new admin panel login password', sensitive: true },

  // ── System Info (Read-Only) ──────────────────────────
  { id: 'node_version',  label: 'Node.js Version',        defaultValue: 'v20.11.0',                  type: 'text', category: 'system', description: 'Backend server runtime version',           readOnly: true },
  { id: 'db_engine',     label: 'Database Engine',        defaultValue: 'PostgreSQL + Prisma v5',     type: 'text', category: 'system', description: 'Active database and ORM versions',           readOnly: true },
  { id: 'framework',     label: 'Frontend Framework',     defaultValue: 'Next.js 14 (App Router)',    type: 'text', category: 'system', description: 'Admin and public site framework',            readOnly: true },
  { id: 'backend',       label: 'Backend Framework',      defaultValue: 'Express.js v4.18',           type: 'text', category: 'system', description: 'REST API server framework',                  readOnly: true },
  { id: 'cms_version',   label: 'CMS Build Version',      defaultValue: 'v2.1.0 — Aug 2026',         type: 'text', category: 'system', description: 'Current admin panel release version',        readOnly: true },
  { id: 'api_base',      label: 'Live API Base URL',      defaultValue: API_URL,                      type: 'text', category: 'system', description: 'Active API server endpoint',                 readOnly: true },
  { id: 'deploy_env',    label: 'Deployment Environment', defaultValue: 'Development (localhost)',    type: 'text', category: 'system', description: 'Current runtime environment',               readOnly: true },
];

export default function SettingsPage() {
  const [liveValues, setLiveValues]       = useState<Record<string, string>>({});
  const [localEdits, setLocalEdits]       = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState('agency');
  const [loadStatus, setLoadStatus]       = useState<'loading' | 'ready' | 'error'>('loading');
  const [saveStatus, setSaveStatus]       = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  // ── Load from backend ────────────────────────────────
  const loadSettings = useCallback(async () => {
    setLoadStatus('loading');
    try {
      const data = await apiFetch('/admin/api/settings');
      setLiveValues(data as Record<string, string>);
      setLoadStatus('ready');
    } catch {
      setLoadStatus('error');
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // ── Derived helpers ─────────────────────────────────
  const getValue = (id: string, defaultValue: string) =>
    localEdits[id] !== undefined ? localEdits[id] : (liveValues[id] ?? defaultValue);

  const handleChange = (id: string, value: string) =>
    setLocalEdits(prev => ({ ...prev, [id]: value }));

  const hasChanges   = Object.keys(localEdits).length > 0;
  const changesCount = Object.keys(localEdits).length;

  const categorySchema   = SCHEMA.filter(s => s.category === activeCategory);
  const activeCat        = CATEGORIES.find(c => c.id === activeCategory)!;

  // ── Save to backend ─────────────────────────────────
  const handleSave = async () => {
    if (!hasChanges) return;
    setSaveStatus('saving');
    try {
      const updated = await apiFetch('/admin/api/settings', {
        method: 'PUT',
        body: JSON.stringify(localEdits),
      });
      setLiveValues(updated as Record<string, string>);
      setLocalEdits({});
      setSaveStatus('saved');
      invalidateSiteSettingsCache(); // bust frontend cache so pages reload fresh data
      setTimeout(() => setSaveStatus('idle'), 3500);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  const handleReset = () => setLocalEdits({});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); }  to { opacity:1; transform:translateY(0); } }
        @keyframes spin     { to { transform: rotate(360deg); } }

        .settings-cat-btn {
          display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
          padding: 14px 18px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          background: transparent; cursor: pointer; transition: all 0.22s ease;
          text-align: left; min-width: 150px;
        }
        .settings-cat-btn:hover:not(.active) { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); color:#f4f4f5; }
        .settings-cat-btn.active { background: linear-gradient(135deg,rgba(6,182,212,0.14) 0%,rgba(6,182,212,0.06) 100%); border-color: rgba(6,182,212,0.4); box-shadow: 0 4px 18px rgba(6,182,212,0.15); }

        .settings-input {
          width:100%; box-sizing:border-box; padding:12px 16px;
          background:#090a10; border:1px solid rgba(255,255,255,0.1); border-radius:10px;
          color:#e4e4e7; font-size:13.5px; font-family:'Outfit',sans-serif;
          outline:none; transition:all 0.25s ease;
        }
        .settings-input:focus   { border-color:#06b6d4; box-shadow:0 0 0 3.5px rgba(6,182,212,0.2); }
        .settings-input:disabled{ opacity:0.45; cursor:not-allowed; border-style:dashed; }
        .settings-input.textarea{ min-height:80px; resize:vertical; }

        .setting-card {
          background:linear-gradient(135deg,#0c0e17 0%,#131622 100%);
          border:1px solid rgba(255,255,255,0.07); border-radius:14px;
          padding:22px 24px; display:flex; flex-direction:column; gap:14px;
          transition:border-color 0.2s ease; position:relative;
        }
        .setting-card:hover  { border-color:rgba(255,255,255,0.14); }
        .setting-card.edited { border-color:rgba(245,158,11,0.4); }
      `}</style>

      {/* Toast */}
      {saveStatus === 'saved' && (
        <div style={{ position:'fixed', bottom:28, right:28, zIndex:200, padding:'14px 26px', borderRadius:12, fontWeight:700, fontSize:13.5, animation:'fadeUp 0.35s cubic-bezier(0.16,1,0.3,1)', boxShadow:'0 16px 40px rgba(0,0,0,0.4)', display:'flex', alignItems:'center', gap:10, background:'linear-gradient(135deg,#10b981,#059669)', color:'#050810' }}>
          ✅ Settings saved — live on all frontend pages!
        </div>
      )}
      {saveStatus === 'error' && (
        <div style={{ position:'fixed', bottom:28, right:28, zIndex:200, padding:'14px 26px', borderRadius:12, fontWeight:700, fontSize:13.5, animation:'fadeUp 0.35s cubic-bezier(0.16,1,0.3,1)', boxShadow:'0 16px 40px rgba(0,0,0,0.4)', display:'flex', alignItems:'center', gap:10, background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'#fff' }}>
          ❌ Save failed — check your connection and retry.
        </div>
      )}

      {/* Page Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, margin:0, color:'#f4f4f5' }}>
            System Configuration
          </h2>
          <p style={{ fontSize:13.5, color:'#71717a', margin:'4px 0 0', fontFamily:"'JetBrains Mono',monospace" }}>
            <span style={{ color:'#06b6d4' }}>D-Kode Era CMS v2.1</span>&nbsp;·&nbsp;
            Changes save to database and reflect on all frontend pages instantly
          </p>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {loadStatus === 'loading' && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', background:'rgba(6,182,212,0.08)', border:'1px solid rgba(6,182,212,0.25)', borderRadius:10 }}>
              <div style={{ width:14, height:14, border:'2px solid rgba(6,182,212,0.3)', borderTop:'2px solid #06b6d4', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              <span style={{ fontSize:12, color:'#06b6d4', fontFamily:"'JetBrains Mono',monospace" }}>Loading…</span>
            </div>
          )}
          {loadStatus === 'error' && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10 }}>
              <span style={{ fontSize:12, color:'#ef4444', fontFamily:"'JetBrains Mono',monospace" }}>⚠ Load failed</span>
              <button onClick={loadSettings} style={{ fontSize:12, color:'#06b6d4', background:'none', border:'none', cursor:'pointer', padding:0 }}>Retry</button>
            </div>
          )}
          {hasChanges && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.35)', borderRadius:10 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#f59e0b', boxShadow:'0 0 8px #f59e0b', display:'inline-block' }} />
              <span style={{ fontSize:12.5, color:'#f59e0b', fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>
                {changesCount} UNSAVED
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display:'flex', gap:12, overflowX:'auto', padding:'2px 0', flexWrap:'wrap' }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`settings-cat-btn ${isActive ? 'active' : ''}`}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:18 }}>{cat.icon}</span>
                <span style={{ fontSize:13.5, fontWeight:800, color: isActive ? '#06b6d4' : '#e4e4e7' }}>{cat.name}</span>
              </div>
              <span style={{ fontSize:11, color:'#71717a', fontFamily:"'JetBrains Mono',monospace", paddingLeft:28 }}>{cat.description}</span>
            </button>
          );
        })}
      </div>

      {/* Category Banner */}
      <div style={{ background:'linear-gradient(135deg,#0c0e17 0%,#131622 100%)', border:'1px solid rgba(6,182,212,0.2)', borderRadius:16, padding:'18px 24px', display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:'rgba(6,182,212,0.12)', border:'1px solid rgba(6,182,212,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
          {activeCat.icon}
        </div>
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:'#f4f4f5', fontFamily:"'Syne',sans-serif" }}>{activeCat.name} Settings</div>
          <div style={{ fontSize:12.5, color:'#71717a', marginTop:2, fontFamily:"'JetBrains Mono',monospace" }}>
            {categorySchema.length} field{categorySchema.length !== 1 ? 's' : ''}&nbsp;·&nbsp;{activeCat.description}
          </div>
        </div>
        {activeCategory === 'system' && (
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8, padding:'6px 14px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:8 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', boxShadow:'0 0 8px #10b981', display:'inline-block' }} />
            <span style={{ fontSize:11, color:'#10b981', fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>READ-ONLY</span>
          </div>
        )}
        {activeCategory === 'agency' && (
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8, padding:'6px 14px', background:'rgba(6,182,212,0.06)', border:'1px solid rgba(6,182,212,0.2)', borderRadius:8 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#06b6d4', boxShadow:'0 0 8px #06b6d4', display:'inline-block' }} />
            <span style={{ fontSize:11, color:'#06b6d4', fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>LIVE ON FRONTEND</span>
          </div>
        )}
      </div>

      {/* Settings Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
        {categorySchema.map(setting => {
          const isReadOnly = setting.readOnly || setting.category === 'system';
          const value      = getValue(setting.id, setting.defaultValue);
          const isEdited   = localEdits[setting.id] !== undefined;
          const showPw     = showPasswords[setting.id] || false;

          return (
            <div key={setting.id} className={`setting-card ${isEdited ? 'edited' : ''}`}>
              {isEdited && (
                <div style={{ position:'absolute', top:14, right:14, width:8, height:8, borderRadius:'50%', background:'#f59e0b', boxShadow:'0 0 8px #f59e0b' }} />
              )}

              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <label style={{ fontSize:13.5, fontWeight:800, color:'#f4f4f5' }}>{setting.label}</label>
                  {isReadOnly && (
                    <span style={{ fontSize:9.5, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:'#71717a', padding:'2px 7px', borderRadius:6, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>READ-ONLY</span>
                  )}
                  {setting.sensitive && (
                    <span style={{ fontSize:9.5, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:'#f59e0b', padding:'2px 7px', borderRadius:6, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)' }}>SENSITIVE</span>
                  )}
                </div>
                {setting.description && (
                  <p style={{ fontSize:12, color:'#71717a', margin:0, lineHeight:1.5 }}>{setting.description}</p>
                )}
              </div>

              {/* Controls */}
              {setting.type === 'toggle' ? (
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <button
                    onClick={() => handleChange(setting.id, value === 'true' ? 'false' : 'true')}
                    style={{ width:52, height:30, borderRadius:15, border:'none', background: value === 'true' ? 'linear-gradient(135deg,#06b6d4,#0891b2)' : 'rgba(255,255,255,0.08)', cursor:'pointer', position:'relative', transition:'all 0.25s ease', flexShrink:0, boxShadow: value === 'true' ? '0 4px 14px rgba(6,182,212,0.35)' : 'none' }}
                  >
                    <div style={{ width:24, height:24, borderRadius:'50%', background:'#ffffff', position:'absolute', top:3, left: value === 'true' ? 25 : 3, transition:'left 0.25s cubic-bezier(0.34,1.56,0.64,1)', boxShadow:'0 2px 6px rgba(0,0,0,0.3)' }} />
                  </button>
                  <span style={{ fontSize:13, fontWeight:700, color: value === 'true' ? '#06b6d4' : '#71717a' }}>
                    {value === 'true' ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              ) : setting.type === 'select' ? (
                <select value={value} onChange={e => handleChange(setting.id, e.target.value)} disabled={isReadOnly} className="settings-input" style={{ cursor: isReadOnly ? 'not-allowed' : 'pointer', fontWeight:600 }}>
                  {setting.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              ) : setting.type === 'password' ? (
                <div style={{ position:'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={value} onChange={e => handleChange(setting.id, e.target.value)} placeholder="Enter new password…" className="settings-input" style={{ paddingRight:50 }} />
                  <button type="button" onClick={() => setShowPasswords(p => ({ ...p, [setting.id]: !showPw }))} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#71717a', cursor:'pointer', fontSize:16 }}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              ) : setting.type === 'textarea' ? (
                <textarea value={value} onChange={e => handleChange(setting.id, e.target.value)} disabled={isReadOnly} className="settings-input textarea" rows={3} />
              ) : (
                <input type={setting.type} value={value} onChange={e => handleChange(setting.id, e.target.value)} disabled={isReadOnly} className="settings-input" />
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Footer Bar */}
      <div style={{ display:'flex', gap:12, alignItems:'center', padding:'20px 24px', background:'linear-gradient(135deg,#0c0e17 0%,#131622 100%)', border:`1px solid ${hasChanges ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius:16, position:'sticky', bottom:24, backdropFilter:'blur(16px)', boxShadow:'0 16px 40px rgba(0,0,0,0.5)', zIndex:10, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:200 }}>
          {hasChanges ? (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#f59e0b', boxShadow:'0 0 8px #f59e0b', flexShrink:0, display:'inline-block' }} />
              <span style={{ fontSize:12.5, color:'#f59e0b', fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>
                {changesCount} UNSAVED CHANGE{changesCount > 1 ? 'S' : ''} — PENDING SAVE
              </span>
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#10b981', boxShadow:'0 0 8px #10b981', display:'inline-block' }} />
              <span style={{ fontSize:12.5, color:'#10b981', fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>
                ALL SETTINGS SYNCED WITH DATABASE
              </span>
            </div>
          )}
        </div>

        <button onClick={handleReset} disabled={!hasChanges} style={{ padding:'11px 22px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color: hasChanges ? '#a1a1aa' : '#3f3f46', fontSize:13.5, fontWeight:700, cursor: hasChanges ? 'pointer' : 'not-allowed', fontFamily:"'Outfit',sans-serif", transition:'all 0.2s ease' }}>
          ↺ Discard Changes
        </button>

        <button onClick={handleSave} disabled={!hasChanges || saveStatus === 'saving'} style={{ padding:'12px 28px', background: hasChanges ? 'linear-gradient(135deg,#06b6d4,#0891b2)' : 'rgba(255,255,255,0.05)', border: hasChanges ? 'none' : '1px solid rgba(255,255,255,0.08)', borderRadius:10, color: hasChanges ? '#050810' : '#3f3f46', fontSize:13.5, fontWeight:800, cursor: hasChanges ? 'pointer' : 'not-allowed', fontFamily:"'Outfit',sans-serif", boxShadow: hasChanges ? '0 6px 20px rgba(6,182,212,0.35)' : 'none', transition:'all 0.2s ease', display:'flex', alignItems:'center', gap:8 }}>
          {saveStatus === 'saving' ? (
            <>
              <div style={{ width:14, height:14, border:'2px solid rgba(5,8,16,0.3)', borderTop:'2px solid #050810', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              <span>Saving…</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>Save to Database</span>
            </>
          )}
        </button>
      </div>

      {activeCategory === 'system' && (
        <div style={{ background:'rgba(6,182,212,0.06)', border:'1px solid rgba(6,182,212,0.18)', borderRadius:14, padding:'16px 20px', display:'flex', gap:14 }}>
          <span style={{ fontSize:22 }}>💡</span>
          <div>
            <div style={{ fontSize:13.5, fontWeight:800, color:'#06b6d4', marginBottom:4 }}>Read-Only System Fields</div>
            <div style={{ fontSize:12.5, color:'#a1a1aa', lineHeight:1.6 }}>
              These values are automatically detected by the backend infrastructure. To modify runtime versions or database systems, update the server environment directly.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
