'use client';

import { useState, useEffect } from 'react';

interface Service {
  id: number;
  num: string;
  icon: string;
  title: string;
  titleNp: string;
  desc: string;
  tags: string[] | string;
  price: string;
  pricing: PricingTier[] | string;
}

interface PricingTier {
  tier: string;
  price: string;
  features: string[];
}

interface ServiceAccentTheme {
  gradient: string;
  cyan: string;
  glow: string;
  bg: string;
}

const QUICK_ICONS = ['💼', '🌐', '📱', '🎨', '🤖', '☁️', '🔒', '📊', '🚀', '🛡️', '⚙️', '🔧'];

const POPULAR_SUGGESTED_TAGS = [
  'React',
  'Next.js',
  'Node.js',
  'TypeScript',
  'Python',
  'Mobile App',
  'UI/UX Design',
  'Cloud & DevOps',
  'AI Solutions',
  'PostgreSQL',
  'Docker',
  'SEO Optimized',
];

const SERVICE_ACCENTS: ServiceAccentTheme[] = [
  { gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', cyan: '#06b6d4', glow: 'rgba(6, 182, 212, 0.35)', bg: 'rgba(6, 182, 212, 0.1)' },
  { gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', cyan: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.35)', bg: 'rgba(139, 92, 246, 0.1)' },
  { gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', cyan: '#f59e0b', glow: 'rgba(245, 158, 11, 0.35)', bg: 'rgba(245, 158, 11, 0.1)' },
  { gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', cyan: '#10b981', glow: 'rgba(16, 185, 129, 0.35)', bg: 'rgba(16, 185, 129, 0.1)' },
  { gradient: 'linear-gradient(135deg, #0284c7 0%, #3b82f6 100%)', cyan: '#0284c7', glow: 'rgba(2, 132, 199, 0.35)', bg: 'rgba(2, 132, 199, 0.1)' },
  { gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', cyan: '#ef4444', glow: 'rgba(239, 68, 68, 0.35)', bg: 'rgba(239, 68, 68, 0.1)' },
];

const TIER_COLORS: Record<number, string> = { 0: '#06b6d4', 1: '#a855f7', 2: '#eab308', 3: '#10b981' };

function parseSafe<T>(value: string | T, fallback: T): T {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

const parseJsonOrText = async (res: Response) => {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return { error: text || 'Invalid JSON response from server.' };
    }
  }

  if (text.startsWith('<!DOCTYPE') || text.startsWith('<html') || contentType.includes('text/html')) {
    return { error: 'Server returned HTML instead of JSON. Check the backend route or proxy config.' };
  }

  return { error: text || 'Invalid response from server.' };
};

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Modal Active Tab: 'basic' | 'tags' | 'pricing'
  const [activeTab, setActiveTab] = useState<'basic' | 'tags' | 'pricing'>('basic');

  // Form Fields State
  const [title, setTitle] = useState('');
  const [titleNp, setTitleNp] = useState('');
  const [desc, setDesc] = useState('');
  const [icon, setIcon] = useState('💼');
  const [num, setNum] = useState('');
  const [price, setPrice] = useState('Rs. 25,000');
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagInputText, setTagInputText] = useState('');
  const [pricingList, setPricingList] = useState<PricingTier[]>([]);
  const [newFeatureText, setNewFeatureText] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('http://localhost:5000/admin/api/services', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await parseJsonOrText(res);
        throw new Error(errorData.error || 'Failed to load services.');
      }

      const data = await res.json();
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load services.');
    } finally {
      setLoading(false);
    }
  };

  const showNotif = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  const openAddModal = () => {
    setEditingId(null);
    setNum(String(services.length + 1));
    setTitle('');
    setTitleNp('');
    setDesc('');
    setIcon('💼');
    setPrice('Rs. 25,000');
    setTagsList(['React', 'Next.js', 'TypeScript']);
    setTagInputText('');
    setPricingList([
      { tier: 'Basic', price: 'Rs. 25,000', features: ['5 Pages Responsive', 'SEO Optimization', 'Contact Form'] },
      { tier: 'Pro', price: 'Rs. 50,000', features: ['10 Pages Custom Design', 'CMS Admin Panel', 'Priority Support'] },
    ]);
    setActiveTab('basic');
    setShowModal(true);
  };

  const openEditModal = (s: Service) => {
    setEditingId(s.id);
    setNum((s as any).num || '');
    setTitle(s.title);
    setTitleNp((s as any).titleNp || '');
    setDesc(s.desc);
    setIcon(s.icon || '💼');
    setPrice(s.price || 'Rs. 25,000');

    // Parse tags
    let parsedTags: string[] = [];
    if (Array.isArray(s.tags)) {
      parsedTags = s.tags;
    } else if (typeof s.tags === 'string') {
      parsedTags = parseSafe<string[]>(s.tags, []);
      if (!Array.isArray(parsedTags)) {
        parsedTags = s.tags.split(',').map((t) => t.trim());
      }
    }
    setTagsList(parsedTags.filter(Boolean));
    setTagInputText('');

    // Parse pricing
    let parsedPricing: PricingTier[] = [];
    if (Array.isArray(s.pricing)) {
      parsedPricing = s.pricing;
    } else if (typeof s.pricing === 'string') {
      parsedPricing = parseSafe<PricingTier[]>(s.pricing, []);
    }
    setPricingList(Array.isArray(parsedPricing) ? parsedPricing : []);
    setActiveTab('basic');
    setShowModal(true);
  };

  // Tag Handlers
  const handleAddTag = () => {
    const trimmed = tagInputText.trim();
    if (trimmed && !tagsList.includes(trimmed)) {
      setTagsList([...tagsList, trimmed]);
      setTagInputText('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter((t) => t !== tagToRemove));
  };

  const handleAddSuggestedTag = (tag: string) => {
    if (!tagsList.includes(tag)) {
      setTagsList([...tagsList, tag]);
    }
  };

  // Pricing Handlers
  const handleAddTier = () => {
    const nextTierNames = ['Basic', 'Pro', 'Enterprise', 'Custom Tier'];
    const nextName = nextTierNames[pricingList.length] || `Tier ${pricingList.length + 1}`;
    setPricingList([
      ...pricingList,
      {
        tier: nextName,
        price: 'Rs. 35,000',
        features: ['Feature Deliverable 1', 'Feature Deliverable 2'],
      },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    setPricingList(pricingList.filter((_, i) => i !== index));
  };

  const handleUpdateTier = (index: number, field: 'tier' | 'price', value: string) => {
    const updated = [...pricingList];
    updated[index][field] = value;
    setPricingList(updated);
  };

  const handleAddFeatureToTier = (tierIndex: number) => {
    const text = newFeatureText[tierIndex]?.trim();
    if (!text) return;
    const updated = [...pricingList];
    updated[tierIndex].features = [...(updated[tierIndex].features || []), text];
    setPricingList(updated);
    setNewFeatureText({ ...newFeatureText, [tierIndex]: '' });
  };

  const handleRemoveFeatureFromTier = (tierIndex: number, featureIndex: number) => {
    const updated = [...pricingList];
    updated[tierIndex].features = updated[tierIndex].features.filter((_, i) => i !== featureIndex);
    setPricingList(updated);
  };

  // Save Service Handler
  const handleSave = async () => {
    if (!num.trim() || !title.trim() || !desc.trim() || !price.trim()) {
      showNotif('error', 'Service number, title, description, and price are required.');
      setActiveTab('basic');
      return;
    }

    setFormLoading(true);
    const token = localStorage.getItem('adminToken');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `http://localhost:5000/admin/api/services/${editingId}`
      : 'http://localhost:5000/admin/api/services';

    const payload = {
      num: num.trim(),
      title: title.trim(),
      titleNp: titleNp.trim(),
      desc: desc.trim(),
      icon: icon.trim() || '💼',
      price: price.trim(),
      tags: tagsList,
      pricing: pricingList,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await parseJsonOrText(res);
        throw new Error(errorData.error || `Failed to ${editingId ? 'update' : 'create'} service.`);
      }
      showNotif('success', `Service ${editingId ? 'updated' : 'created'} successfully!`);
      setShowModal(false);
      fetchServices();
    } catch (err: any) {
      showNotif('error', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:5000/admin/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete service.');
      showNotif('success', 'Service deleted successfully.');
      setDeletingId(null);
      if (expandedId === id) setExpandedId(null);
      fetchServices();
    } catch (err: any) {
      showNotif('error', err.message);
    }
  };

  const filtered = services.filter((s) => {
    const q = searchQuery.toLowerCase();
    const tagsText = Array.isArray(s.tags) ? s.tags.join(' ') : s.tags || '';
    return (
      s.title.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      tagsText.toLowerCase().includes(q)
    );
  });

  // Stats Counters
  const totalTags = services.reduce((acc, curr) => {
    const safeTags = typeof curr.tags === 'string' ? parseSafe<string[]>(curr.tags, []) : curr.tags || [];
    return acc + safeTags.length;
  }, 0);
  const totalPricing = services.filter((s) => parseSafe<PricingTier[]>(s.pricing, []).length > 0).length;

  if (loading)
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid #27272a', borderTopColor: '#06b6d4', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#71717a', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>LOADING SERVICES CMS...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (error)
    return (
      <div style={{ padding: 24, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#ef4444', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Connection Error</div>
        <span style={{ fontSize: 13.5, opacity: 0.85 }}>{error}</span>
        <button
          onClick={() => { setLoading(true); setError(null); fetchServices(); }}
          style={{ alignSelf: 'flex-start', padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}
        >
          Retry Connection
        </button>
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
          min-width: 200px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(10px);
        }
        .stat-badge-box:hover {
          border-color: rgba(6,182,212,0.4);
          transform: translateY(-3px);
          box-shadow: 0 14px 32px rgba(6,182,212,0.15);
        }

        .service-card-vibrant {
          border-radius: 18px;
          padding: 26px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(14px);
        }

        .btn-add-cms {
          padding: 12px 24px;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          border: none; border-radius: 10px;
          color: #050810; font-size: 13.5px; font-weight: 800;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          box-shadow: 0 6px 20px rgba(6,182,212,0.3);
          transition: all 0.25s ease;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-add-cms:hover { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(6,182,212,0.45); }

        .search-input-cms {
          width: 100%; box-sizing: border-box;
          padding: 12px 16px;
          background: #090a10; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #e4e4e7;
          font-size: 14px; font-family: 'Outfit', sans-serif;
          outline: none; transition: all 0.25s ease;
        }
        .search-input-cms:focus { border-color: #06b6d4; box-shadow: 0 0 0 3.5px rgba(6,182,212,0.2); }

        .btn-edit-cms {
          flex: 1; padding: 10px 14px;
          background: rgba(6,182,212,0.08);
          border: 1px solid rgba(6,182,212,0.25);
          border-radius: 10px; color: #06b6d4;
          cursor: pointer; font-size: 12.5px; font-weight: 700;
          font-family: 'Outfit', sans-serif;
          transition: all 0.2s ease;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        }
        .btn-edit-cms:hover { background: rgba(6,182,212,0.2); border-color: #06b6d4; box-shadow: 0 4px 14px rgba(6,182,212,0.25); }

        .btn-delete-cms {
          flex: 1; padding: 10px 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px; color: #ef4444;
          cursor: pointer; font-size: 12.5px; font-weight: 700;
          font-family: 'Outfit', sans-serif;
          transition: all 0.2s ease;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        }
        .btn-delete-cms:hover { background: rgba(239,68,68,0.2); border-color: #ef4444; box-shadow: 0 4px 14px rgba(239,68,68,0.25); }

        .modal-overlay-cms {
          position: fixed; inset: 0;
          background: rgba(5,5,12,0.88);
          backdrop-filter: blur(14px);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        .modal-box-cms {
          width: 100%; max-width: 740px;
          background: #10121c;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.75), 0 0 40px rgba(6, 182, 212, 0.12);
          display: flex; flex-direction: column;
          max-height: 92vh; overflow: hidden;
          animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .form-input-cms {
          width: 100%; box-sizing: border-box;
          padding: 12px 16px;
          background: #090a10; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #e4e4e7; font-size: 13.5px;
          font-family: 'Outfit', sans-serif;
          outline: none; transition: all 0.25s ease;
        }
        .form-input-cms:focus { border-color: #06b6d4; box-shadow: 0 0 0 3.5px rgba(6,182,212,0.2); }
        .form-textarea-cms { min-height: 100px; resize: vertical; line-height: 1.65; }

        .btn-save-cms {
          flex: 2; padding: 13px 26px;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          border: none; border-radius: 10px;
          color: #050810; font-size: 14px; font-weight: 800;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          box-shadow: 0 6px 20px rgba(6,182,212,0.35);
          transition: all 0.25s ease;
        }
        .btn-save-cms:disabled { opacity: 0.45; cursor: not-allowed; }
        .btn-save-cms:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(6,182,212,0.45); }

        .btn-cancel-cms {
          flex: 1; padding: 13px 20px;
          background: transparent; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #a1a1aa;
          font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: 'Outfit', sans-serif;
        }

        .tab-btn-cms {
          padding: 10px 18px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: #71717a;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: "'Outfit', sans-serif";
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tab-btn-cms.active {
          color: #06b6d4;
          border-bottom-color: #06b6d4;
          background: rgba(6,182,212,0.06);
        }

        .tag-chip-cms {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 20px;
          background: rgba(6,182,212,0.12);
          border: 1px solid rgba(6,182,212,0.3);
          color: #06b6d4;
          font-size: 12px;
          font-weight: 700;
          font-family: "'JetBrains Mono', monospace";
        }
        .tag-chip-cms button {
          background: none;
          border: none;
          color: #06b6d4;
          cursor: pointer;
          font-size: 12px;
          padding: 0;
          margin-left: 2px;
          opacity: 0.8;
        }
        .tag-chip-cms button:hover { opacity: 1; color: #ef4444; }

        .tier-editor-box {
          background: #0c0e18;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
        }
      `}</style>

      {/* Toast Notification */}
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
            Manage Services
          </h2>
          <p style={{ fontSize: 13.5, color: '#71717a', margin: '4px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: '#06b6d4' }}>{services.length}</span> Total Services &nbsp;·&nbsp;
            <span style={{ color: '#a1a1aa' }}>Control pricing tiers, tech tags, and service listings</span>
          </p>
        </div>
        <button className="btn-add-cms" onClick={openAddModal}>
          <span>➕</span> Add New Service
        </button>
      </div>

      {/* ── Top Stats Cards ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            💼
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{services.length}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Services</div>
          </div>
        </div>

        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            🏷️
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{totalTags}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tech Tags Defined</div>
          </div>
        </div>

        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            💰
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{totalPricing}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priced Tiers</div>
          </div>
        </div>

        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            🌐
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{services.length}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Listings</div>
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 15, pointerEvents: 'none', color: '#71717a' }}>🔍</span>
        <input
          type="text"
          placeholder="Search by title, description or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input-cms"
          style={{ paddingLeft: 44 }}
        />
      </div>

      {/* ── Services Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {filtered.length === 0 ? (
          <div
            style={{
              gridColumn: '1/-1',
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
            <div style={{ fontSize: 44 }}>📦</div>
            <div style={{ fontWeight: 700, color: '#e4e4e7', fontSize: 16.5 }}>
              {searchQuery ? 'No matching services found' : 'No services created yet'}
            </div>
            <p style={{ margin: 0, fontSize: 13.5, opacity: 0.7, maxWidth: 340 }}>
              {searchQuery ? `No services match "${searchQuery}".` : 'Click "Add New Service" above to get started.'}
            </p>
          </div>
        ) : (
          filtered.map((service, idx) => {
            const tags = parseSafe<string[]>(service.tags, []);
            const pricing = parseSafe<PricingTier[]>(service.pricing, []);
            const isExpanded = expandedId === service.id;
            const accent = SERVICE_ACCENTS[idx % SERVICE_ACCENTS.length];

            return (
              <div
                key={service.id}
                className="service-card-vibrant"
                style={{
                  background: `radial-gradient(circle at 90% 0%, ${accent.bg} 0%, transparent 60%), linear-gradient(135deg, #0c0e17 0%, #131622 100%)`,
                  border: `1px solid rgba(255,255,255,0.08)`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = accent.cyan;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 60px rgba(0,0,0,0.6), 0 0 30px ${accent.glow}`;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px) scale(1.01)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}
              >
                {/* Accent top gradient bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: accent.gradient }} />

                <div>
                  {/* Top Row: Icon + Title + Tech Chips */}
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        minWidth: 52,
                        borderRadius: 14,
                        background: accent.bg,
                        border: `1px solid ${accent.cyan}44`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 26,
                        boxShadow: `0 4px 14px ${accent.glow}`,
                      }}
                    >
                      {service.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          margin: '0 0 6px',
                          color: '#f4f4f5',
                          fontFamily: "'Syne', sans-serif",
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {service.title}
                      </h3>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: '3px 9px',
                              borderRadius: 20,
                              color: accent.cyan,
                              background: accent.bg,
                              border: `1px solid ${accent.cyan}33`,
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {tags.length > 3 && (
                          <span style={{ fontSize: 10.5, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", padding: '3px 0' }}>
                            +{tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 13.5, color: '#a1a1aa', lineHeight: 1.7, marginBottom: 18 }}>
                    {isExpanded ? service.desc : service.desc.slice(0, 100) + (service.desc.length > 100 ? '...' : '')}
                  </p>

                  {/* Pricing Tiers Preview Matrix */}
                  {pricing.length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                      <div
                        style={{
                          fontSize: 10,
                          color: '#71717a',
                          fontFamily: "'JetBrains Mono', monospace",
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          marginBottom: 10,
                          fontWeight: 700,
                        }}
                      >
                        PRICING TIERS
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {pricing.map((tier, i) => (
                          <div
                            key={i}
                            style={{
                              flex: '1 1 90px',
                              padding: '12px 14px',
                              background: `${TIER_COLORS[i] || '#a1a1aa'}12`,
                              border: `1px solid ${TIER_COLORS[i] || '#a1a1aa'}33`,
                              borderRadius: 10,
                              textAlign: 'center',
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10.5,
                                color: TIER_COLORS[i] || '#a1a1aa',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: 800,
                                marginBottom: 4,
                                textTransform: 'uppercase',
                              }}
                            >
                              {tier.tier}
                            </div>
                            <div style={{ fontSize: 14, color: '#f4f4f5', fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>
                              {tier.price}
                            </div>
                            {isExpanded && (
                              <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', textAlign: 'left' }}>
                                {tier.features?.map((f, j) => (
                                  <li key={j} style={{ fontSize: 11, color: '#a1a1aa', display: 'flex', gap: 4, marginBottom: 3 }}>
                                    <span style={{ color: TIER_COLORS[i] || '#a1a1aa', fontWeight: 700 }}>✓</span> {f}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {/* Expand Toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : service.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: accent.cyan,
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: 0,
                      marginBottom: 16,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      opacity: 0.9,
                      display: 'block',
                    }}
                  >
                    {isExpanded ? '▲ Collapse details' : '▼ View full details'}
                  </button>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 10, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                    <button
                      className="btn-edit-cms"
                      onClick={() => openEditModal(service)}
                      style={{ color: accent.cyan, borderColor: `${accent.cyan}44`, background: accent.bg }}
                    >
                      ✏️ Edit Service
                    </button>
                    <button className="btn-delete-cms" onClick={() => setDeletingId(service.id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─────────────────────── COMPLETE PROFESSIONAL SERVICE BUILDER MODAL ─────────────────────── */}
      {showModal && (
        <div className="modal-overlay-cms" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-box-cms">
            {/* Modal Header */}
            <div
              style={{
                padding: '24px 32px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(135deg, rgba(6,182,212,0.14) 0%, rgba(168,85,247,0.08) 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 21, fontWeight: 800, margin: 0, color: '#f4f4f5', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>{editingId ? '✏️' : '➕'}</span>
                  <span>{editingId ? 'Edit Service Listing' : 'Create New Service Listing'}</span>
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>
                  Interactive visual builder for info, tech stack chips, and pricing deliverable tiers
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#71717a', fontSize: 20, cursor: 'pointer', padding: 4 }}
                title="Close Modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Tab Navigation Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#090a10', padding: '0 24px' }}>
              <button
                type="button"
                className={`tab-btn-cms ${activeTab === 'basic' ? 'active' : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                <span>📌</span>
                <span>1. General Info</span>
              </button>

              <button
                type="button"
                className={`tab-btn-cms ${activeTab === 'tags' ? 'active' : ''}`}
                onClick={() => setActiveTab('tags')}
              >
                <span>🏷️</span>
                <span>2. Tech Stack ({tagsList.length})</span>
              </button>

              <button
                type="button"
                className={`tab-btn-cms ${activeTab === 'pricing' ? 'active' : ''}`}
                onClick={() => setActiveTab('pricing')}
              >
                <span>💰</span>
                <span>3. Pricing Tiers ({pricingList.length})</span>
              </button>
            </div>

            {/* Form Content Body */}
            <div style={{ padding: '28px 32px', overflowY: 'auto', maxHeight: '64vh', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* TAB 1: BASIC INFORMATION */}
              {activeTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em' }}>
                        Service Number <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input-cms"
                        placeholder="e.g. 1, 2, 3"
                        value={num}
                        onChange={(e) => setNum(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em' }}>
                        Nepali Service Title
                      </label>
                      <input
                        type="text"
                        className="form-input-cms"
                        placeholder="e.g. मोबाइल एप्स विकास"
                        value={titleNp}
                        onChange={(e) => setTitleNp(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em' }}>
                      Service Title <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input-cms"
                      placeholder="e.g. Mobile App Development & UI/UX Design"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em' }}>
                      Base Price Label <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input-cms"
                      placeholder="e.g. Rs. 25,000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em' }}>
                      Full Service Description <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      rows={4}
                      className="form-input-cms form-textarea-cms"
                      placeholder="Explain key deliverables, target business goals, technical features, and timeline..."
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                    />
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.06em' }}>
                      Service Icon / Emoji Badge
                    </label>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
                        {QUICK_ICONS.map((ic) => (
                          <button
                            key={ic}
                            type="button"
                            onClick={() => setIcon(ic)}
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 10,
                              fontSize: 22,
                              cursor: 'pointer',
                              border: `1.5px solid ${icon === ic ? '#06b6d4' : 'rgba(255,255,255,0.08)'}`,
                              background: icon === ic ? 'rgba(6,182,212,0.18)' : '#090a10',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {ic}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(6,182,212,0.12)', border: '1.5px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, boxShadow: '0 4px 16px rgba(6,182,212,0.2)' }}>
                          {icon}
                        </div>
                        <span style={{ fontSize: 10, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>Selected Icon</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VISUAL TECH TAGS CHIP BUILDER */}
              {activeTab === 'tags' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em' }}>
                      Add Technology Tag
                    </label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input
                        type="text"
                        className="form-input-cms"
                        placeholder="Type technology name (e.g. Flutter, GraphQL, Docker) & press Enter..."
                        value={tagInputText}
                        onChange={(e) => setTagInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        style={{
                          padding: '12px 20px',
                          background: 'rgba(6,182,212,0.14)',
                          border: '1px solid rgba(6,182,212,0.3)',
                          borderRadius: 10,
                          color: '#06b6d4',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ➕ Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Active Tags Chips Container */}
                  <div>
                    <div style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", marginBottom: 10, fontWeight: 700 }}>
                      ACTIVE TECHNOLOGY CHIPS ({tagsList.length})
                    </div>
                    {tagsList.length === 0 ? (
                      <div style={{ padding: '24px', background: '#090a10', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, textAlign: 'center', color: '#71717a', fontSize: 13 }}>
                        No technology tags added yet. Type a tag above or click suggestions below!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {tagsList.map((tag) => (
                          <div key={tag} className="tag-chip-cms">
                            <span>{tag}</span>
                            <button type="button" onClick={() => handleRemoveTag(tag)} title="Remove Tag">
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* One-Click Suggestions */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                    <div style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", marginBottom: 10, fontWeight: 700 }}>
                      POPULAR SUGGESTIONS (CLICK TO ADD)
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {POPULAR_SUGGESTED_TAGS.map((tag) => {
                        const isAdded = tagsList.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleAddSuggestedTag(tag)}
                            disabled={isAdded}
                            style={{
                              fontSize: 11,
                              fontFamily: "'JetBrains Mono', monospace",
                              padding: '4px 10px',
                              borderRadius: 6,
                              background: isAdded ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${isAdded ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
                              color: isAdded ? '#52525b' : '#a1a1aa',
                              cursor: isAdded ? 'default' : 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {isAdded ? `✓ ${tag}` : `+ ${tag}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VISUAL PRICING TIERS & DELIVERABLES BUILDER */}
              {activeTab === 'pricing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>Pricing Tiers & Deliverables</div>
                      <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>Configure tier names, price points, and feature checklists</div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddTier}
                      style={{
                        padding: '9px 16px',
                        background: 'rgba(16,185,129,0.12)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: 8,
                        color: '#10b981',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      ➕ Add Tier
                    </button>
                  </div>

                  {pricingList.length === 0 ? (
                    <div style={{ padding: '32px', background: '#090a10', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 14, textAlign: 'center', color: '#71717a' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
                      <div style={{ fontWeight: 700, color: '#e4e4e7', fontSize: 14 }}>No Pricing Tiers Defined</div>
                      <p style={{ margin: '4px 0 14px', fontSize: 12.5, opacity: 0.7 }}>Click "Add Tier" to define custom packages for this service.</p>
                      <button
                        type="button"
                        onClick={handleAddTier}
                        style={{ padding: '8px 16px', background: '#06b6d4', color: '#050810', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
                      >
                        ➕ Create First Tier
                      </button>
                    </div>
                  ) : (
                    pricingList.map((tierItem, tierIdx) => {
                      const tierAccentColor = TIER_COLORS[tierIdx % 4] || '#06b6d4';
                      return (
                        <div key={tierIdx} className="tier-editor-box" style={{ borderLeft: `3px solid ${tierAccentColor}` }}>
                          {/* Header: Tier Name, Price & Delete Button */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'center' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 4 }}>
                                Package Tier Name
                              </label>
                              <input
                                type="text"
                                className="form-input-cms"
                                value={tierItem.tier}
                                onChange={(e) => handleUpdateTier(tierIdx, 'tier', e.target.value)}
                                placeholder="e.g. Basic, Pro, Enterprise"
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 4 }}>
                                Price Tag
                              </label>
                              <input
                                type="text"
                                className="form-input-cms"
                                value={tierItem.price}
                                onChange={(e) => handleUpdateTier(tierIdx, 'price', e.target.value)}
                                placeholder="e.g. Rs. 25,000 or $299/mo"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveTier(tierIdx)}
                              style={{
                                marginTop: 18,
                                padding: '10px 14px',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                borderRadius: 8,
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                              title="Delete Tier"
                            >
                              🗑️ Delete Tier
                            </button>
                          </div>

                          {/* Feature Bullet Points List */}
                          <div>
                            <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 6 }}>
                              Feature Deliverables Checklist ({tierItem.features?.length || 0})
                            </label>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                              {tierItem.features?.map((feat, featIdx) => (
                                <div key={featIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#121422', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <span style={{ color: tierAccentColor, fontWeight: 800, fontSize: 12 }}>✓</span>
                                  <span style={{ flex: 1, fontSize: 12.5, color: '#e4e4e7' }}>{feat}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFeatureFromTier(tierIdx, featIdx)}
                                    style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 13, padding: 0 }}
                                    title="Remove feature"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Add Feature Row */}
                            <div style={{ display: 'flex', gap: 8 }}>
                              <input
                                type="text"
                                className="form-input-cms"
                                style={{ padding: '8px 12px', fontSize: 12 }}
                                placeholder="Add feature item (e.g. 24/7 Priority Support)..."
                                value={newFeatureText[tierIdx] || ''}
                                onChange={(e) => setNewFeatureText({ ...newFeatureText, [tierIdx]: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddFeatureToTier(tierIdx);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleAddFeatureToTier(tierIdx)}
                                style={{
                                  padding: '8px 14px',
                                  background: 'rgba(6,182,212,0.12)',
                                  border: '1px solid rgba(6,182,212,0.3)',
                                  borderRadius: 8,
                                  color: '#06b6d4',
                                  fontWeight: 700,
                                  fontSize: 12,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                ➕ Add Feature
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div style={{ padding: '20px 32px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 14, background: '#090a10', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {activeTab !== 'basic' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'pricing' ? 'tags' : 'basic')}
                    style={{ padding: '11px 18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#a1a1aa', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    ← Previous Step
                  </button>
                )}

                {activeTab !== 'pricing' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'basic' ? 'tags' : 'pricing')}
                    style={{ padding: '11px 18px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 10, color: '#06b6d4', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Next Step →
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-cancel-cms" onClick={() => setShowModal(false)} disabled={formLoading}>
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={formLoading || !title.trim() || !desc.trim()}
                  className="btn-save-cms"
                  style={{ minWidth: 180 }}
                >
                  {formLoading ? '⏳ Saving Service...' : `💾 ${editingId ? 'Update Service' : 'Create Service'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────── DELETE CONFIRM MODAL ─────────────────────── */}
      {deletingId !== null && (
        <div className="modal-overlay-cms" onClick={(e) => { if (e.target === e.currentTarget) setDeletingId(null); }}>
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
              Delete Service Listing?
            </h3>

            <p style={{ fontSize: 13.5, color: '#a1a1aa', margin: '0 0 24px 0', lineHeight: 1.6 }}>
              This will permanently remove the service from the platform listings. This action cannot be undone.
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
                onClick={() => deletingId && handleDelete(deletingId)}
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
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
