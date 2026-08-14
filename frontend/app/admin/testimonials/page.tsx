'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

interface Testimonial {
  id: number;
  name: string;
  email: string;
  company: string;
  position: string;
  biz: string;
  quote: string;
  stars: number;
  icon: string;
  status: string; // 'Pending' | 'Approved' | 'Rejected'
  featured: boolean;
  createdAt: string;
}

type TabType = 'all' | 'Pending' | 'Approved' | 'Rejected' | 'featured';

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [viewingItem, setViewingItem] = useState<Testimonial | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    position: '',
    biz: '',
    quote: '',
    stars: 5,
    icon: '',
    status: 'Approved',
    featured: false,
  });

  const handleAdminImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const token = localStorage.getItem('adminToken') || '';
      const formDataObj = new FormData();
      formDataObj.append('image', file);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/admin/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to upload image');
      }

      const data = await res.json();
      setFormData((prev) => ({ ...prev, icon: data.url }));
    } catch (err: any) {
      alert(err.message || 'Error uploading file');
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchItems = useCallback(() => {
    setLoading(true);
    apiFetch('/admin/api/testimonials')
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      email: '',
      company: '',
      position: '',
      biz: '',
      quote: '',
      stars: 5,
      icon: '',
      status: 'Approved',
      featured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      email: item.email || '',
      company: item.company || '',
      position: item.position || '',
      biz: item.biz || '',
      quote: item.quote,
      stars: item.stars,
      icon: item.icon || '',
      status: item.status || 'Approved',
      featured: Boolean(item.featured),
    });
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await apiFetch(`/admin/api/testimonials/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      showNotification(`Testimonial status set to ${newStatus}`);
      fetchItems();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleToggleFeatured = async (item: Testimonial) => {
    try {
      await apiFetch(`/admin/api/testimonials/${item.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ featured: !item.featured }),
      });
      showNotification(item.featured ? 'Removed from featured' : 'Marked as featured!');
      fetchItems();
    } catch (err: any) {
      alert(err.message || 'Failed to update featured state');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingItem
      ? `/admin/api/testimonials/${editingItem.id}`
      : '/admin/api/testimonials';
    const method = editingItem ? 'PUT' : 'POST';

    try {
      await apiFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      showNotification(editingItem ? 'Testimonial updated!' : 'Testimonial created!');
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      alert(err.message || 'Error saving testimonial');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/admin/api/testimonials/${id}`, {
        method: 'DELETE',
      });
      showNotification('Testimonial deleted');
      setDeletingId(null);
      fetchItems();
    } catch (err: any) {
      alert(err.message || 'Error deleting item');
    }
  };

  // Status counts
  const pendingCount = items.filter((i) => (i.status || 'Pending') === 'Pending').length;
  const approvedCount = items.filter((i) => (i.status || 'Approved') === 'Approved' || i.status === 'APPROVED' || !i.status).length;
  const rejectedCount = items.filter((i) => i.status === 'Rejected').length;
  const featuredCount = items.filter((i) => i.featured).length;

  // Filtered items
  const filteredItems = items.filter((item) => {
    const statusVal = item.status || 'Approved';
    if (activeTab === 'Pending' && statusVal !== 'Pending') return false;
    if (activeTab === 'Approved' && statusVal !== 'Approved' && statusVal !== 'APPROVED' && item.status !== '') return false;
    if (activeTab === 'Rejected' && statusVal !== 'Rejected') return false;
    if (activeTab === 'featured' && !item.featured) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchQuote = item.quote.toLowerCase().includes(q);
      const matchBiz = (item.biz || item.company || '').toLowerCase().includes(q);
      const matchEmail = (item.email || '').toLowerCase().includes(q);
      return matchName || matchQuote || matchBiz || matchEmail;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
      <style>{adminCss}</style>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(6,182,212,0.2))',
              border: '1px solid rgba(236,72,153,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>💬</div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: '#f4f4f5', margin: 0, fontFamily: "'Syne', sans-serif" }}>
                Testimonials & Reviews
              </h1>
              <p style={{ fontSize: 13, color: '#71717a', margin: '2px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
                VERIFY · APPROVE · MANAGE CUSTOMER REVIEWS
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-add-testimonial"
          onClick={handleOpenAddModal}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 20px', borderRadius: 10,
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            border: 'none', color: '#fff', fontSize: 14, fontWeight: 800,
            cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            boxShadow: '0 4px 14px rgba(6,182,212,0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          <span>+</span> Add Testimonial
        </button>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'rgba(16, 185, 129, 0.95)', color: '#fff',
          padding: '12px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
        }}>
          {notification}
        </div>
      )}

      {/* Stats Header */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Reviews', count: items.length, color: '#06b6d4', icon: '📋' },
          { label: 'Pending Approval', count: pendingCount, color: '#f59e0b', icon: '⏳' },
          { label: 'Approved', count: approvedCount, color: '#10b981', icon: '✅' },
          { label: 'Featured', count: featuredCount, color: '#8b5cf6', icon: '📌' },
        ].map((s) => (
          <div key={s.label} style={{
            flex: '1 1 140px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: 11, color: '#71717a', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: 4, borderRadius: 12 }}>
          {([
            { key: 'all', label: 'All Reviews', count: items.length },
            { key: 'Pending', label: 'Pending', count: pendingCount, badge: true },
            { key: 'Approved', label: 'Approved', count: approvedCount },
            { key: 'Rejected', label: 'Rejected', count: rejectedCount },
            { key: 'featured', label: 'Featured', count: featuredCount },
          ] as { key: TabType; label: string; count: number; badge?: boolean }[]).map((tab) => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
                background: activeTab === tab.key ? 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(6,182,212,0.06))' : 'transparent',
                color: activeTab === tab.key ? '#06b6d4' : '#a1a1aa',
                borderLeft: activeTab === tab.key ? '2px solid #06b6d4' : '2px solid transparent',
                transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: 11, padding: '1px 6px', borderRadius: 20,
                background: tab.badge && tab.count > 0 ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)',
                color: tab.badge && tab.count > 0 ? '#f59e0b' : '#71717a',
                fontWeight: 800,
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search name, email, review..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '9px 14px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f4f4f5', fontSize: 13, outline: 'none',
            minWidth: 240, fontFamily: "'Outfit', sans-serif",
          }}
        />
      </div>

      {/* Main List Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#71717a' }}>
          Loading testimonials...
        </div>
      ) : error ? (
        <div style={{ padding: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, color: '#ef4444' }}>
          Error: {error}
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 20px', background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 16,
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#71717a' }}>No testimonials found</div>
          <div style={{ fontSize: 13, color: '#52525b', marginTop: 4 }}>
            {activeTab === 'Pending' ? 'There are currently no pending reviews waiting for approval.' : 'No items match your selected filter or search keyword.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredItems.map((item) => {
            const statusStr = item.status || 'Approved';
            const isPending = statusStr === 'Pending';
            const isApproved = statusStr === 'Approved' || statusStr === 'APPROVED' || !item.status;
            const isRejected = statusStr === 'Rejected';

            return (
              <div
                key={item.id}
                style={{
                  background: isPending
                    ? 'linear-gradient(90deg, rgba(245,158,11,0.06) 0%, rgba(255,255,255,0.02) 100%)'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isPending ? 'rgba(245,158,11,0.3)' : item.featured ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 14, padding: '18px 22px',
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: item.icon?.startsWith('http') || item.icon?.startsWith('/')
                    ? 'transparent'
                    : 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color: '#fff', overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  {item.icon?.startsWith('http') || item.icon?.startsWith('/') ? (
                    <img src={item.icon} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    item.name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#f4f4f5' }}>{item.name}</span>
                    
                    {/* Status Badge */}
                    <span style={{
                      fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
                      background: isPending ? 'rgba(245,158,11,0.15)' : isApproved ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: isPending ? '#f59e0b' : isApproved ? '#10b981' : '#ef4444',
                      border: `1px solid ${isPending ? 'rgba(245,158,11,0.3)' : isApproved ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      ● {statusStr.toUpperCase()}
                    </span>

                    {/* Featured Badge */}
                    {item.featured && (
                      <span style={{
                        fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
                        background: 'rgba(139,92,246,0.18)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        ★ FEATURED
                      </span>
                    )}

                    {/* Rating */}
                    <span style={{ color: '#f59e0b', fontSize: 13 }}>
                      {'★'.repeat(item.stars)}{'☆'.repeat(5 - item.stars)}
                    </span>
                  </div>

                  {/* Subtitle info */}
                  <div style={{ fontSize: 12, color: '#71717a', marginTop: 3, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    {(item.biz || item.company || item.position) && (
                      <span>💼 {item.biz || `${item.position || ''} ${item.company ? `@ ${item.company}` : ''}`}</span>
                    )}
                    {item.email && <span>✉️ {item.email}</span>}
                    {item.createdAt && <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>}
                  </div>

                  {/* Quote Message */}
                  <p style={{
                    fontSize: 14, color: '#d4d4d8', marginTop: 10, lineHeight: 1.6,
                    borderLeft: '2px solid rgba(6,182,212,0.4)', paddingLeft: 12, fontStyle: 'italic',
                  }}>
                    "{item.quote}"
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                  {/* Approve / Reject buttons if pending or rejected */}
                  {!isApproved && (
                    <button
                      id={`btn-approve-${item.id}`}
                      onClick={() => handleStatusChange(item.id, 'Approved')}
                      style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800,
                        background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)',
                        cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'all 0.15s ease',
                      }}
                      title="Approve & Publish to Website"
                    >
                      ✅ Approve
                    </button>
                  )}

                  {!isRejected && (
                    <button
                      id={`btn-reject-${item.id}`}
                      onClick={() => handleStatusChange(item.id, 'Rejected')}
                      style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800,
                        background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)',
                        cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'all 0.15s ease',
                      }}
                      title="Reject Testimonial"
                    >
                      ❌ Reject
                    </button>
                  )}

                  {/* Feature toggle */}
                  <button
                    onClick={() => handleToggleFeatured(item)}
                    style={{
                      padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      background: item.featured ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                      color: item.featured ? '#a78bfa' : '#a1a1aa',
                      border: `1px solid ${item.featured ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.1)'}`,
                      cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                    }}
                    title={item.featured ? 'Unmark Featured' : 'Mark Featured'}
                  >
                    📌 {item.featured ? 'Featured' : 'Feature'}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    style={{
                      padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      background: 'rgba(255,255,255,0.04)', color: '#e4e4e7',
                      border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                    }}
                    title="Edit Review"
                  >
                    ✏️ Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeletingId(item.id)}
                    style={{
                      padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                      border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
                    }}
                    title="Delete Review"
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD / EDIT MODAL ────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="admin-modal-box"
            style={{
              maxWidth: 620,
              background: '#0d101e',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              borderRadius: 20,
              padding: '30px 34px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(6, 182, 212, 0.15)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))',
                  border: '1px solid rgba(6,182,212,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>💬</div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: '#f4f4f5', margin: 0, fontFamily: "'Syne', sans-serif" }}>
                    {editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
                  </h3>
                  <p style={{ fontSize: 12, color: '#71717a', margin: '3px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
                    CONFIGURE REVIEW DETAILS & PUBLICATION STATUS
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="admin-close-btn" style={{ fontSize: 18, color: '#a1a1aa' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Star Rating Picker */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '14px 18px', textAlign: 'center',
              }}>
                <label className="admin-form-label" style={{ marginBottom: 6 }}>STAR RATING</label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, stars: star })}
                      style={{
                        background: 'none', border: 'none', fontSize: 26, cursor: 'pointer',
                        color: star <= formData.stars ? '#f59e0b' : 'rgba(255,255,255,0.15)',
                        transition: 'transform 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="admin-form-label">Reviewer Name *</label>
                  <input
                    required
                    className="admin-form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                  />
                </div>
                <div>
                  <label className="admin-form-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    className="admin-form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. sarah@acme.com"
                  />
                </div>
              </div>

              {/* Company & Position Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="admin-form-label">Company / Organization</label>
                  <input
                    className="admin-form-input"
                    value={formData.company}
                    onChange={(e) => setFormData({
                      ...formData,
                      company: e.target.value,
                      biz: `${formData.position ? `${formData.position}, ` : ''}${e.target.value}`,
                    })}
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div>
                  <label className="admin-form-label">Position / Role</label>
                  <input
                    className="admin-form-input"
                    value={formData.position}
                    onChange={(e) => setFormData({
                      ...formData,
                      position: e.target.value,
                      biz: `${e.target.value}${formData.company ? `, ${formData.company}` : ''}`,
                    })}
                    placeholder="e.g. CEO / Founder"
                  />
                </div>
              </div>

              {/* Message Quote */}
              <div>
                <label className="admin-form-label">Testimonial Quote *</label>
                <textarea
                  required
                  rows={4}
                  className="admin-form-input"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="Enter testimonial message..."
                  style={{ resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>

              {/* Photo / Avatar Upload from Gallery or Device */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '16px 18px',
              }}>
                <label className="admin-form-label" style={{ marginBottom: 8 }}>REVIEWER PHOTO / AVATAR</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* File Upload Button */}
                  <label
                    style={{
                      padding: '9px 16px', borderRadius: 9,
                      background: 'rgba(6,182,212,0.14)',
                      border: '1px solid rgba(6,182,212,0.35)',
                      color: '#06b6d4', fontSize: 13, fontWeight: 700,
                      cursor: uploadingImage ? 'not-allowed' : 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    <span>📷</span> {uploadingImage ? 'Uploading...' : 'Upload from Gallery'}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={handleAdminImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <span style={{ color: '#52525b', fontSize: 12, fontWeight: 700 }}>OR</span>

                  {/* URL Input */}
                  <input
                    type="text"
                    className="admin-form-input"
                    style={{ flex: 1, minWidth: 180 }}
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="https://... or photo URL"
                  />
                </div>

                {/* Attached Image Preview */}
                {formData.icon && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'rgba(6,182,212,0.06)', borderRadius: 8, border: '1px solid rgba(6,182,212,0.2)' }}>
                    {formData.icon.startsWith('http') || formData.icon.startsWith('/') ? (
                      <img
                        src={formData.icon.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${formData.icon}` : formData.icon}
                        alt="Avatar Preview"
                        style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #06b6d4' }}
                      />
                    ) : (
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#06b6d4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                        {formData.icon}
                      </div>
                    )}
                    <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700, flex: 1 }}>✓ Avatar Selected</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: '' })}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Status & Featured Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="admin-form-label">Publication Status</label>
                  <select
                    className="admin-form-input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Approved">✅ Approved (Public)</option>
                    <option value="Pending">⏳ Pending (Hidden)</option>
                    <option value="Rejected">❌ Rejected</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <label
                    style={{
                      width: '100%',
                      padding: '10px 14px', borderRadius: 9,
                      background: formData.featured ? 'rgba(139,92,246,0.14)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${formData.featured ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.1)'}`,
                      cursor: 'pointer', fontSize: 13, fontWeight: 700,
                      color: formData.featured ? '#a78bfa' : '#a1a1aa',
                      display: 'flex', alignItems: 'center', gap: 10, boxSizing: 'border-box',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      style={{ accentColor: '#8b5cf6', width: 16, height: 16 }}
                    />
                    📌 Feature on Website
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="admin-submit-btn" style={{ minWidth: 140 }}>
                  {editingItem ? 'Save Changes' : 'Create Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ────────────────────────────────── */}
      {deletingId && (
        <div className="admin-modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="admin-modal-box" style={{ maxWidth: 400, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f4f4f5', margin: 0 }}>Delete Testimonial?</h3>
            <p style={{ fontSize: 13, color: '#a1a1aa', margin: '10px 0 20px' }}>
              Are you sure you want to permanently delete this testimonial?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeletingId(null)} className="admin-cancel-btn">Cancel</button>
              <button onClick={() => handleDelete(deletingId)} className="admin-danger-btn">Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const adminCss = `
  .admin-modal-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.75); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .admin-modal-box {
    background: #0d0e18; border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px; padding: 28px; width: 100%; maxWidth: 540px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
  }
  .admin-form-label {
    display: block; font-size: 11.5px; font-weight: 700; color: #71717a;
    letter-spacing: 0.08em; margin-bottom: 6px; font-family: 'JetBrains Mono', monospace;
  }
  .admin-form-input {
    width: 100%; padding: 10px 14px; border-radius: 8px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    color: #f4f4f5; font-size: 13.5px; outline: none; box-sizing: border-box;
    font-family: 'Outfit', sans-serif;
  }
  .admin-form-input:focus { border-color: #06b6d4; background: rgba(6,182,212,0.04); }
  .admin-close-btn { background: transparent; border: none; color: #a1a1aa; cursor: pointer; font-size: 16px; }
  .admin-cancel-btn { padding: 9px 16px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #a1a1aa; font-weight: 700; cursor: pointer; }
  .admin-submit-btn { padding: 9px 18px; border-radius: 8px; background: linear-gradient(135deg, #06b6d4, #0891b2); border: none; color: #fff; font-weight: 800; cursor: pointer; }
  .admin-danger-btn { padding: 9px 18px; border-radius: 8px; background: #ef4444; border: none; color: #fff; font-weight: 800; cursor: pointer; }
`;
