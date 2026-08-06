'use client';

import { useState, useEffect } from 'react';

interface ProductItem {
  id: number;
  pillName: string;
  badge: string;
  title: string;
  description: string;
  category?: string;
  tech?: string[] | string;
  image?: string;
  demoUrl?: string;
  order?: number;
  highlight?: boolean;
}

interface FormDataState {
  pillName: string;
  badge: string;
  title: string;
  description: string;
  category: string;
  tech: string;
  image: string;
  demoUrl: string;
  order: number;
  highlight: boolean;
}

interface AccentTheme {
  gradient: string;
  cyan: string;
  glow: string;
  bg: string;
  icon: string;
}

const PRODUCT_ACCENTS: Record<string, AccentTheme> = {
  'RESTRO MS': {
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    cyan: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.4)',
    bg: 'rgba(6, 182, 212, 0.12)',
    icon: '🍽️',
  },
  'SMART KAROBAR': {
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    cyan: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
    bg: 'rgba(59, 130, 246, 0.12)',
    icon: '💼',
  },
  UPASTHITI: {
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    cyan: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    bg: 'rgba(16, 185, 129, 0.12)',
    icon: '⏱️',
  },
  'MENU MA K CHHA': {
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    cyan: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    bg: 'rgba(245, 158, 11, 0.12)',
    icon: '📱',
  },
  ATITHYA: {
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    cyan: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.4)',
    bg: 'rgba(139, 92, 246, 0.12)',
    icon: '🏨',
  },
  'SMART TRAINING': {
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    cyan: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.4)',
    bg: 'rgba(236, 72, 153, 0.12)',
    icon: '🎓',
  },
  'N-CARD': {
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
    cyan: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.4)',
    bg: 'rgba(6, 182, 212, 0.12)',
    icon: '🎴',
  },
};

const DEFAULT_ACCENT: AccentTheme = {
  gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  cyan: '#06b6d4',
  glow: 'rgba(6, 182, 212, 0.4)',
  bg: 'rgba(6, 182, 212, 0.12)',
  icon: '⚡',
};

export default function ProductsAdminPage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'order' | 'title' | 'id'>('order');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormDataState>({
    pillName: '',
    badge: '',
    title: '',
    description: '',
    category: '',
    tech: '',
    image: '',
    demoUrl: '',
    order: 1,
    highlight: true,
  });

  // Delete Confirm State
  const [deletingItem, setDeletingItem] = useState<ProductItem | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    const token = localStorage.getItem('adminToken');
    fetch('http://localhost:5000/admin/api/products', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load Product Ecosystem items.');
        return res.json();
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      pillName: '',
      badge: '',
      title: '',
      description: '',
      category: 'SaaS',
      tech: 'React, Node.js, PostgreSQL',
      image: '',
      demoUrl: '',
      order: (items.length || 0) + 1,
      highlight: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ProductItem) => {
    setEditingItem(item);
    let techStr = '';
    if (Array.isArray(item.tech)) {
      techStr = item.tech.join(', ');
    } else if (typeof item.tech === 'string') {
      try {
        const parsed = JSON.parse(item.tech);
        techStr = Array.isArray(parsed) ? parsed.join(', ') : item.tech;
      } catch {
        techStr = item.tech;
      }
    }

    setFormData({
      pillName: item.pillName || '',
      badge: item.badge || '',
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'General',
      tech: techStr,
      image: item.image || '',
      demoUrl: item.demoUrl || '',
      order: item.order || 1,
      highlight: item.highlight ?? true,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const token = localStorage.getItem('adminToken');
    const body = new FormData();
    body.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/admin/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      if (!res.ok) throw new Error('Image upload failed.');
      const data = await res.json();
      setFormData((prev) => ({ ...prev, image: data.url }));
      showToast('success', 'Preview graphic uploaded successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.pillName.trim() || !formData.description.trim()) {
      showToast('error', 'Please fill out all required fields.');
      return;
    }

    setFormLoading(true);
    const token = localStorage.getItem('adminToken');
    const url = editingItem
      ? `http://localhost:5000/admin/api/products/${editingItem.id}`
      : 'http://localhost:5000/admin/api/products';
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const techArray = formData.tech
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        ...formData,
        tech: techArray,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${editingItem ? 'update' : 'create'} product.`);
      }

      showToast(
        'success',
        editingItem ? 'Product updated successfully!' : 'Product created successfully!'
      );
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred while saving.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:5000/admin/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete product.');

      showToast('success', 'Product ecosystem entry deleted.');
      setDeletingItem(null);
      fetchItems();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete product.');
    }
  };

  // Derive categories for filter
  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category || 'General')))];

  // Filter & Sort Logic
  const filteredItems = items
    .filter((item) => {
      const matchesCategory = selectedCategory === 'All' || (item.category || 'General') === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.pillName.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'order') return (a.order || 0) - (b.order || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return b.id - a.id;
    });

  // Calculate Quick Stats
  const highlightedCount = items.filter((i) => i.highlight).length;
  const demoCount = items.filter((i) => i.demoUrl && i.demoUrl.trim()).length;
  const imageCount = items.filter((i) => i.image && i.image.trim()).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid #27272a', borderTopColor: '#06b6d4', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#71717a', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>LOADING PRODUCT ECOSYSTEM...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#ef4444', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Connection Failure</div>
        <span style={{ fontSize: 13.5, opacity: 0.85 }}>{error}</span>
        <button
          onClick={() => { setLoading(true); setError(null); fetchItems(); }}
          style={{ alignSelf: 'flex-start', padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

        .toast-banner {
          position: fixed;
          bottom: 28px;
          right: 28px;
          padding: 14px 26px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13.5px;
          z-index: 200;
          animation: fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: "'Outfit', sans-serif";
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
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

        .product-card-vibrant {
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

        .card-img-container {
          position: relative;
          margin-bottom: 18px;
          border-radius: 12px;
          overflow: hidden;
          height: 140px;
          background: rgba(9, 10, 16, 0.8);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-img-container img {
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
          transition: transform 0.4s ease;
        }
        .product-card-vibrant:hover .card-img-container img {
          transform: scale(1.08);
        }

        .btn-primary-cms {
          padding: 12px 24px;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          border: none;
          border-radius: 10px;
          color: #050810;
          font-size: 13.5px;
          font-weight: 800;
          cursor: pointer;
          font-family: "'Outfit', sans-serif";
          box-shadow: 0 6px 20px rgba(6,182,212,0.3);
          transition: all 0.25s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-primary-cms:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 26px rgba(6,182,212,0.45);
        }

        .input-cms {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 16px;
          background: #090a10;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #e4e4e7;
          font-size: 13.5px;
          font-family: "'Outfit', sans-serif";
          outline: none;
          transition: all 0.25s ease;
        }
        .input-cms:focus {
          border-color: #06b6d4;
          box-shadow: 0 0 0 3.5px rgba(6,182,212,0.2);
        }

        .btn-action-edit {
          flex: 1;
          padding: 10px 14px;
          background: rgba(6,182,212,0.08);
          border: 1px solid rgba(6,182,212,0.25);
          border-radius: 10px;
          color: #06b6d4;
          cursor: pointer;
          font-size: 12.5px;
          font-weight: 700;
          font-family: "'Outfit', sans-serif";
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-action-edit:hover {
          background: rgba(6,182,212,0.2);
          border-color: #06b6d4;
          box-shadow: 0 4px 14px rgba(6,182,212,0.25);
        }

        .btn-action-delete {
          flex: 1;
          padding: 10px 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          color: #ef4444;
          cursor: pointer;
          font-size: 12.5px;
          font-weight: 700;
          font-family: "'Outfit', sans-serif";
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-action-delete:hover {
          background: rgba(239,68,68,0.2);
          border-color: #ef4444;
          box-shadow: 0 4px 14px rgba(239,68,68,0.25);
        }

        .modal-overlay-cms {
          position: fixed;
          inset: 0;
          background: rgba(5, 5, 12, 0.88);
          backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        .modal-box-cms {
          width: 100%;
          max-width: 720px;
          background: #10121c;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.75), 0 0 40px rgba(6, 182, 212, 0.12);
          display: flex;
          flex-direction: column;
          max-height: 92vh;
          overflow: hidden;
          animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Custom Toggle Switch */
        .toggle-switch-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .toggle-switch-track {
          width: 46px;
          height: 24px;
          background: #27272a;
          border-radius: 14px;
          position: relative;
          transition: background 0.3s ease;
        }
        .toggle-switch-track.active {
          background: #06b6d4;
        }
        .toggle-switch-thumb {
          width: 18px;
          height: 18px;
          background: #ffffff;
          border-radius: 50%;
          position: absolute;
          top: 3px;
          left: 3px;
          transition: transform 0.3s ease;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .toggle-switch-track.active .toggle-switch-thumb {
          transform: translateX(22px);
        }
      `}</style>

      {/* Toast Notification Banner */}
      {notification && (
        <div className={`toast-banner toast-${notification.type}`}>
          <span>{notification.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, margin: 0, color: '#f4f4f5' }}>
            Product Ecosystem CMS
          </h2>
          <p style={{ fontSize: 13.5, color: '#71717a', margin: '4px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: '#06b6d4' }}>{items.length}</span> Total Products &nbsp;·&nbsp;
            <span style={{ color: '#a1a1aa' }}>Manage homepage tabs, badges, preview graphics & demo links</span>
          </p>
        </div>
        <button className="btn-primary-cms" onClick={handleOpenAddModal}>
          <span>➕</span> Add New Product
        </button>
      </div>

      {/* ── Top Stats Cards ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            📦
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{items.length}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Products</div>
          </div>
        </div>

        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ⭐
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{highlightedCount}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Highlighted</div>
          </div>
        </div>

        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            🚀
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{demoCount}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Demo Links</div>
          </div>
        </div>

        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            📷
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{imageCount}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Graphics Loaded</div>
          </div>
        </div>
      </div>

      {/* ── Search, Category & Sort Bar ── */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 15, pointerEvents: 'none', color: '#71717a' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by title, tab name, badge, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-cms"
            style={{ paddingLeft: 44 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-cms"
            style={{ width: 'auto', paddingRight: 32 }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input-cms"
            style={{ width: 'auto', paddingRight: 32 }}
          >
            <option value="order">Sort by: Display Order</option>
            <option value="title">Sort by: Title (A-Z)</option>
            <option value="id">Sort by: Recently Added</option>
          </select>
        </div>
      </div>

      {/* ── Product List Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
        {filteredItems.length === 0 ? (
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
            <div style={{ fontSize: 48 }}>📦</div>
            <div style={{ fontWeight: 700, color: '#e4e4e7', fontSize: 16.5 }}>
              {searchQuery ? 'No matching products found' : 'No product ecosystem items yet'}
            </div>
            <p style={{ margin: 0, fontSize: 13.5, opacity: 0.7, maxWidth: 360 }}>
              {searchQuery ? `No products match "${searchQuery}". Try clearing search filters.` : 'Click "Add New Product" above to populate your ecosystem tabs.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            const accent = PRODUCT_ACCENTS[item.pillName.toUpperCase()] || DEFAULT_ACCENT;

            let techList: string[] = [];
            if (Array.isArray(item.tech)) {
              techList = item.tech;
            } else if (typeof item.tech === 'string') {
              try {
                const parsed = JSON.parse(item.tech);
                techList = Array.isArray(parsed) ? parsed : item.tech.split(',');
              } catch {
                techList = item.tech.split(',');
              }
            }

            return (
              <div
                key={item.id}
                className="product-card-vibrant"
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
                {/* Top Accent Gradient Bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: accent.gradient }} />

                <div>
                  {/* Pill Name & Order Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: accent.bg,
                          border: `1px solid ${accent.cyan}44`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                        }}
                      >
                        {accent.icon}
                      </div>

                      <span
                        style={{
                          fontSize: 11.5,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 800,
                          background: accent.bg,
                          color: accent.cyan,
                          padding: '4px 12px',
                          borderRadius: 20,
                          border: `1px solid ${accent.cyan}44`,
                          letterSpacing: '0.06em',
                        }}
                      >
                        {item.pillName.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {item.highlight && (
                        <span style={{ fontSize: 10, color: '#f59e0b', background: 'rgba(245,158,11,0.14)', padding: '3px 9px', borderRadius: 12, border: '1px solid rgba(245,158,11,0.3)', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                          ⭐ Featured
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                        #{item.order || 1}
                      </span>
                    </div>
                  </div>

                  {/* Industry Badge Tag */}
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: '#ef4444',
                      fontFamily: "'JetBrains Mono', monospace",
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 10,
                    }}
                  >
                    {item.badge}
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f4f4f5', margin: '0 0 10px 0', fontFamily: "'Syne', sans-serif", lineHeight: 1.25 }}>
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: 13.5,
                      color: '#a1a1aa',
                      lineHeight: 1.7,
                      margin: '0 0 16px 0',
                    }}
                  >
                    {isExpanded ? item.description : item.description.slice(0, 110) + (item.description.length > 110 ? '...' : '')}
                  </p>

                  {/* Tech Stack Chips */}
                  {techList.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                      {techList.map((t, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: 10.5,
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 600,
                            padding: '3px 9px',
                            borderRadius: 6,
                            background: accent.bg,
                            border: `1px solid ${accent.cyan}33`,
                            color: accent.cyan,
                          }}
                        >
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Graphic Thumbnail */}
                  {item.image && (
                    <div className="card-img-container">
                      <img src={item.image} alt={item.title} />
                    </div>
                  )}
                </div>

                <div>
                  {/* Expand Toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
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

                  {/* Actions Footer */}
                  <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                      className="btn-action-edit"
                      onClick={() => handleOpenEditModal(item)}
                      style={{ color: accent.cyan, borderColor: `${accent.cyan}44`, background: accent.bg }}
                    >
                      ✏️ Edit
                    </button>
                    {item.demoUrl && (
                      <button
                        onClick={() => window.open(item.demoUrl, '_blank')}
                        className="btn-action-edit"
                        style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)' }}
                      >
                        🔗 Live Demo
                      </button>
                    )}
                    <button className="btn-action-delete" onClick={() => setDeletingItem(item)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─────────────────────── ENHANCED ADD / EDIT POPUP MODAL ─────────────────────── */}
      {isModalOpen && (
        <div className="modal-overlay-cms" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-box-cms">
            {/* Modal Header */}
            <div style={{ padding: '26px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(135deg, rgba(6,182,212,0.14) 0%, rgba(59,130,246,0.08) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 21, fontWeight: 800, margin: 0, color: '#f4f4f5', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>{editingItem ? '✏️' : '➕'}</span>
                  <span>{editingItem ? 'Edit Product Ecosystem Entry' : 'Add New Product Ecosystem Entry'}</span>
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>
                  Configure pill name, industry tag, description, tech stack, and graphic preview URL
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#71717a', fontSize: 20, cursor: 'pointer', padding: 4 }}
                title="Close Modal"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto', maxHeight: '70vh' }}>
              {/* Section 1: Basic Identifiers */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 16 }}>📌</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace" }}>Basic Identifiers</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(6,182,212,0.2)' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
                      Pill Tab Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.pillName}
                      onChange={(e) => setFormData({ ...formData, pillName: e.target.value })}
                      placeholder="e.g. RESTRO MS"
                      required
                      className="input-cms"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
                      Industry Badge Tag <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="e.g. HOSPITALITY POS & MANAGEMENT"
                      required
                      className="input-cms"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
                      Product Title <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Restro Ms"
                      required
                      className="input-cms"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
                      Category Tag
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. SaaS, ERP, HR"
                      className="input-cms"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Content & Tech Stack */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 16 }}>📝</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace" }}>Content & Technology</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(6,182,212,0.2)' }} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
                    Full Description <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    placeholder="Describe core functionalities, POS integration, billing modules, and target business users..."
                    className="input-cms"
                    style={{ resize: 'vertical', lineHeight: 1.6 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
                    Tech Stack (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tech}
                    onChange={(e) => setFormData({ ...formData, tech: e.target.value })}
                    placeholder="React, Node.js, Prisma, PostgreSQL, Docker"
                    className="input-cms"
                  />

                  {/* Live Tech Tag Preview Chips */}
                  {formData.tech.trim() && (
                    <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>PREVIEW CHIPS:</span>
                      {formData.tech.split(',').map((t, idx) => t.trim() && (
                        <span
                          key={idx}
                          style={{
                            fontSize: 10.5,
                            fontFamily: "'JetBrains Mono', monospace",
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'rgba(6,182,212,0.1)',
                            border: '1px solid rgba(6,182,212,0.25)',
                            color: '#06b6d4',
                          }}
                        >
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Display Settings & Live Demo */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 16 }}>⚙️</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace" }}>Display & Demo Link</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(6,182,212,0.2)' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 16, alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
                      Order #
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                      className="input-cms"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
                      Live Demo Link URL
                    </label>
                    <input
                      type="text"
                      value={formData.demoUrl}
                      onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                      placeholder="https://restroms.dkodeera.com"
                      className="input-cms"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
                      Featured Star
                    </label>
                    <div
                      className="toggle-switch-wrapper"
                      onClick={() => setFormData({ ...formData, highlight: !formData.highlight })}
                    >
                      <div className={`toggle-switch-track ${formData.highlight ? 'active' : ''}`}>
                        <div className="toggle-switch-thumb" />
                      </div>
                      <span style={{ fontSize: 12, color: formData.highlight ? '#f59e0b' : '#71717a', fontWeight: 700 }}>
                        {formData.highlight ? 'Featured' : 'Standard'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Image & Preview Graphic */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 16 }}>🖼️</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace" }}>Graphic Preview</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(6,182,212,0.2)' }} />
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Image URL or upload file..."
                    className="input-cms"
                    style={{ flex: 1 }}
                  />

                  <label
                    style={{
                      padding: '12px 20px',
                      background: 'rgba(6,182,212,0.12)',
                      border: '1px solid rgba(6,182,212,0.3)',
                      borderRadius: 10,
                      color: '#06b6d4',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>{uploadingImage ? '⏳' : '📁'}</span>
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                {/* Live Image Preview Card */}
                {formData.image && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 14,
                      background: '#09090e',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <img
                      src={formData.image}
                      alt="Graphic Preview"
                      style={{ width: 70, height: 70, objectFit: 'contain', borderRadius: 8, background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', padding: 4 }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>✓</span> Graphic Ready
                      </div>
                      <div style={{ fontSize: 11, color: '#71717a', wordBreak: 'break-all', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                        {formData.image}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Modal Footer */}
            <div style={{ padding: '20px 32px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 14, background: '#09090e' }}>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={formLoading || uploadingImage || !formData.title.trim() || !formData.pillName.trim()}
                style={{
                  flex: 2,
                  padding: '13px 26px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  border: 'none',
                  borderRadius: 10,
                  color: '#050810',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  opacity: formLoading ? 0.6 : 1,
                  boxShadow: '0 6px 20px rgba(6,182,212,0.35)',
                }}
              >
                {formLoading ? '⏳ Saving Entry...' : editingItem ? '💾 Update Product Entry' : '💾 Create Product Entry'}
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={formLoading}
                style={{
                  flex: 1,
                  padding: '13px 20px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  color: '#a1a1aa',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────── ENHANCED DELETE CONFIRMATION MODAL ─────────────────────── */}
      {deletingItem !== null && (
        <div className="modal-overlay-cms" onClick={(e) => { if (e.target === e.currentTarget) setDeletingItem(null); }}>
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
              Delete Product Entry?
            </h3>

            <p style={{ fontSize: 13.5, color: '#a1a1aa', margin: '0 0 24px 0', lineHeight: 1.6 }}>
              Are you sure you want to delete <b style={{ color: '#06b6d4' }}>"{deletingItem.title}"</b> ({deletingItem.pillName})? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setDeletingItem(null)}
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
                Cancel
              </button>

              <button
                onClick={() => handleDelete(deletingItem.id)}
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
                Yes, Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
