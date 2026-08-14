'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch, normalizeImageUrl } from '@/lib/api';

interface TeamMember {
  id: number;
  icon: string; // stores image URL or emoji fallback
  role: string;
  name: string;
  desc: string;
  skills: string[];
  order: number;
}

const ROLE_COLORS: string[] = ['#06b6d4', '#a855f7', '#eab308', '#10b981', '#ef4444'];

function isUrl(s: string) {
  return s?.startsWith('http') || s?.startsWith('/uploads') || s?.startsWith('data:');
}

export default function TeamAdminPage() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    icon: '',
    role: '',
    name: '',
    desc: '',
    skillsString: '',
    order: 0,
  });

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [reorderingId, setReorderingId] = useState<number | null>(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = () => {
    apiFetch('/admin/api/team')
      .then(data => { setItems(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  const showNotif = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  const uploadImage = async (file: File): Promise<string> => {
    setUploadingImage(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const data = await apiFetch('/admin/api/upload', {
        method: 'POST',
        body: fd,
      });
      return data.url;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = useCallback(async (file: File | null) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) {
      showNotif('error', 'Only JPEG, PNG, WebP or GIF allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotif('error', 'Image must be under 5 MB.');
      return;
    }

    // Local instant preview
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      if (result) setImagePreview(result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, icon: url }));
      setImagePreview(normalizeImageUrl(url));
      showNotif('success', '📷 Profile photo uploaded!');
    } catch {
      showNotif('error', 'Image upload failed. Check backend connection.');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFileSelect(file);
  }, [handleFileSelect]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ icon: '', role: '', name: '', desc: '', skillsString: '', order: items.length + 1 });
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: TeamMember) => {
    setEditingItem(item);
    setFormData({
      icon: item.icon,
      role: item.role,
      name: item.name,
      desc: item.desc,
      skillsString: Array.isArray(item.skills) ? item.skills.join(', ') : '',
      order: item.order || 0,
    });
    setImagePreview(isUrl(item.icon) ? normalizeImageUrl(item.icon) : '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      showNotif('error', 'Name and Role are required.');
      return;
    }
    setFormLoading(true);
    const url = editingItem
      ? `/admin/api/team/${editingItem.id}`
      : '/admin/api/team';
    const method = editingItem ? 'PUT' : 'POST';
    const payload = {
      icon: formData.icon || '👤',
      role: formData.role,
      name: formData.name,
      desc: formData.desc,
      skills: formData.skillsString.split(',').map(s => s.trim()).filter(Boolean),
      order: Number(formData.order || 0),
    };
    try {
      await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      showNotif('success', editingItem ? '✅ Team member updated!' : '✅ Team member added!');
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      showNotif('error', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleOrderChange = async (item: TeamMember, newOrder: number) => {
    if (newOrder < 0) return;
    setReorderingId(item.id);
    try {
      await apiFetch(`/admin/api/team/${item.id}/order`, {
        method: 'PATCH',
        body: JSON.stringify({ order: newOrder }),
      });
      showNotif('success', `↕️ Position rank updated for ${item.name}!`);
      fetchItems();
    } catch (err: any) {
      showNotif('error', err.message);
    } finally {
      setReorderingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/admin/api/team/${id}`, {
        method: 'DELETE',
      });
      showNotif('success', '🗑️ Team member removed.');
      setDeletingId(null);
      fetchItems();
    } catch (err: any) {
      showNotif('error', err.message);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '45vh', gap: 12 }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', border: '2.5px solid #27272a', borderTopColor: '#a855f7', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: '#71717a', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>LOADING TEAM...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: 20, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#ef4444', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <b>Error</b><span style={{ fontSize: 13 }}>{error}</span>
      <button onClick={() => { setLoading(true); setError(null); fetchItems(); }} style={{ alignSelf: 'flex-start', padding: '7px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Retry</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: "'Outfit', sans-serif" }}>
      <style>{css}</style>

      {/* Toast */}
      {notification && (
        <div className={`toast toast-${notification.type}`}>{notification.msg}</div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, margin: 0, color: '#f4f4f5' }}>
            Team Members & Position Ordering
          </h2>
          <p style={{ fontSize: 13, color: '#71717a', margin: '4px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: '#a855f7' }}>{items.length}</span> members &nbsp;·&nbsp; Drag & Drop uploads & Position ordering supported
          </p>
        </div>
        <button className="btn-add" onClick={openAddModal}>➕ Add Member</button>
      </div>

      {/* ── Team Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 22 }}>
        {items.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 24px', background: '#12121a', border: '1px solid #27272a', borderRadius: 12, color: '#71717a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 40 }}>👥</div>
            <div style={{ fontWeight: 600, color: '#a1a1aa' }}>No team members yet</div>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>Add your first team member using the button above.</p>
          </div>
        ) : items.map((item, idx) => {
          const accent = ROLE_COLORS[idx % ROLE_COLORS.length];
          const hasPhoto = isUrl(item.icon);
          const photoUrl = normalizeImageUrl(item.icon);

          return (
            <div key={item.id} className="member-card" style={{ '--accent': accent } as React.CSSProperties}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '12px 12px 0 0' }} />

              {/* Order Badge & Reorder Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span className="order-badge">
                  RANK #{item.order || idx + 1}
                </span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <button
                    type="button"
                    title="Move Up in Display Order"
                    disabled={reorderingId === item.id || idx === 0}
                    onClick={() => handleOrderChange(item, Math.max(0, (item.order || idx + 1) - 1))}
                    className="btn-order"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    title="Move Down in Display Order"
                    disabled={reorderingId === item.id || idx === items.length - 1}
                    onClick={() => handleOrderChange(item, (item.order || idx + 1) + 1)}
                    className="btn-order"
                  >
                    ▼
                  </button>
                </div>
              </div>

              {/* Avatar */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${accent}40`,
                  overflow: 'hidden', background: `${accent}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {hasPhoto && photoUrl
                    ? <img src={photoUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 30 }}>{item.icon || '👤'}</span>
                  }
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f4f4f5', margin: '0 0 4px', fontFamily: "'Syne', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </h3>
                  <div style={{ fontSize: 12, color: accent, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                    {item.role}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.7, marginBottom: 16, flex: 1 }}>
                {item.desc || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>No bio yet.</span>}
              </p>

              {/* Skills */}
              {item.skills?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                  {item.skills.map((skill, i) => (
                    <span key={i} style={{
                      fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                      color: accent, background: `${accent}12`, border: `1px solid ${accent}25`,
                      fontFamily: "'JetBrains Mono', monospace"
                    }}>{skill}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #27272a', paddingTop: 16 }}>
                <button className="btn-edit" onClick={() => openEditModal(item)}>✏️ Edit</button>
                <button className="btn-delete" onClick={() => setDeletingId(item.id)}>🗑️ Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─────────────────── ADD / EDIT MODAL ─────────────────── */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="modal-box" style={{ maxWidth: 640 }}>
            {/* Header Bar */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="modal-icon-badge">
                  {editingItem ? '✏️' : '👥'}
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, margin: 0, color: '#f4f4f5', letterSpacing: '-0.02em' }}>
                    {editingItem ? 'Edit Team Member' : 'Add New Team Member'}
                  </h2>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8', fontFamily: "'Outfit', sans-serif" }}>
                    Configure member profile, photo, designation, and position rank
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="modal-close-btn"
                title="Close Modal"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="team-form" onSubmit={handleSubmit} className="modal-form-body">
              {/* ── Photo Upload & Avatar Preview Card ── */}
              <div className="photo-card-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label className="form-label" style={{ color: '#a855f7', margin: 0 }}>
                    📷 Profile Photo / Avatar
                  </label>
                  {imagePreview && (
                    <span className="photo-loaded-tag">
                      ✓ Photo Loaded
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Avatar Circle Preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div className="avatar-preview-ring">
                      {imagePreview ? (
                        <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : formData.icon && !isUrl(formData.icon) ? (
                        <span style={{ fontSize: 38 }}>{formData.icon}</span>
                      ) : (
                        <span style={{ fontSize: 38 }}>👤</span>
                      )}
                    </div>
                  </div>

                  {/* Upload Drop Zone & Controls */}
                  <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div
                      className={`drop-zone${dragOver ? ' drag-active' : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadingImage ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <div className="spinner-sm" />
                          <span style={{ fontSize: 12, color: '#a855f7', fontWeight: 600 }}>Uploading image...</span>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#f4f4f5' }}>
                            Click to Upload from Gallery
                          </div>
                          <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>
                            Drag & drop JPG, PNG, WebP · Max 5 MB
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                    />

                    {/* Image URL or Emoji Fallback input */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ fontSize: 12, padding: '8px 12px' }}
                        placeholder="Or paste Image URL or Emoji (e.g. 👨‍💻)"
                        value={formData.icon}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({ ...prev, icon: val }));
                          if (isUrl(val)) {
                            setImagePreview(normalizeImageUrl(val));
                          } else {
                            setImagePreview('');
                          }
                        }}
                      />
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData((prev) => ({ ...prev, icon: '' }));
                          }}
                          className="btn-clear-photo"
                        >
                          ✕ Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Name + Role Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="form-label">
                    Full Name <span className="req-badge">REQUIRED</span>
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dipendra Gupta"
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="form-label">
                    Role / Designation <span className="req-badge">REQUIRED</span>
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Lead Full-Stack Engineer"
                    required
                  />
                </div>
              </div>

              {/* Display Order Position */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="form-label">
                  Display Order Rank <span style={{ fontSize: 10.5, color: '#06b6d4', fontWeight: 600, textTransform: 'none' }}>(Rank #1 appears first on website)</span>
                </label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  placeholder="1, 2, 3..."
                />
              </div>

              {/* Bio */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="form-label">Short Bio / Description</label>
                <textarea
                  className="form-input form-textarea"
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Tell something inspiring about this team member..."
                />
              </div>

              {/* Skills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="form-label">
                  Key Skills / Tech Stack <span style={{ fontSize: 10.5, color: '#71717a', fontWeight: 400, textTransform: 'none' }}>(comma-separated)</span>
                </label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.skillsString}
                  onChange={(e) => setFormData({ ...formData, skillsString: e.target.value })}
                  placeholder="React, Next.js, Node.js, PostgreSQL, AWS"
                />
                {/* Live skill chips preview */}
                {formData.skillsString.trim() && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {formData.skillsString
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((s, i) => (
                        <span key={i} className="skill-chip-preview">
                          {s}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </form>

            {/* Sticky Footer Bar */}
            <div className="modal-footer-bar">
              <button
                type="submit"
                form="team-form"
                className="btn-save"
                disabled={formLoading || uploadingImage}
              >
                {formLoading ? '⏳ Saving Member...' : `💾 ${editingItem ? 'Update Team Member' : 'Add Team Member'}`}
              </button>
              <button className="btn-cancel" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────── DELETE CONFIRM ─────────────────── */}
      {deletingId !== null && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 400, textAlign: 'center', padding: 32, margin: 'auto' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, margin: '0 0 10px', color: '#f4f4f5' }}>
              Remove Member?
            </h3>
            <p style={{ fontSize: 13.5, color: '#a1a1aa', marginBottom: 24, lineHeight: 1.7 }}>
              This will permanently remove the team member from the platform.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-cancel" style={{ flex: 1, padding: '12px 20px' }} onClick={() => setDeletingId(null)}>
                No, Keep
              </button>
              <button className="btn-danger" style={{ flex: 1 }} onClick={() => deletingId && handleDelete(deletingId)}>
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const css = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .toast {
    position: fixed; bottom: 24px; right: 24px;
    padding: 14px 26px; border-radius: 10px;
    font-weight: 700; font-size: 14px; z-index: 200000;
    animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
    font-family: 'Outfit', sans-serif;
  }
  .toast-success { background: #10b981; color: #050810; box-shadow: 0 12px 32px rgba(16,185,129,0.35); }
  .toast-error   { background: #ef4444; color: #fff;    box-shadow: 0 12px 32px rgba(239,68,68,0.35); }

  .order-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px; font-weight: 800;
    color: #06b6d4; background: rgba(6,182,212,0.1);
    border: 1px solid rgba(6,182,212,0.25);
    padding: 3px 8px; border-radius: 6px;
    letter-spacing: 0.05em;
  }

  .btn-order {
    background: #181824; border: 1px solid #27272a;
    color: #a1a1aa; border-radius: 5px;
    width: 26px; height: 26px; font-size: 11px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .btn-order:not(:disabled):hover { background: #27272a; color: #06b6d4; border-color: #06b6d4; }
  .btn-order:disabled { opacity: 0.3; cursor: not-allowed; }

  .btn-add {
    padding: 11px 22px;
    background: linear-gradient(135deg, #a855f7, #7c3aed);
    border: none; border-radius: 8px;
    color: #fff; font-size: 13.5px; font-weight: 700;
    cursor: pointer; font-family: 'Outfit', sans-serif;
    box-shadow: 0 4px 16px rgba(168,85,247,0.3);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .btn-add:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(168,85,247,0.45); }

  .member-card {
    background: #12121a; border: 1px solid #27272a;
    border-radius: 12px; padding: 22px 20px;
    display: flex; flex-direction: column;
    position: relative; overflow: hidden;
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
  }
  .member-card:hover {
    border-color: var(--accent, rgba(168,85,247,0.4));
    box-shadow: 0 14px 40px rgba(0,0,0,0.4);
    transform: translateY(-4px);
  }

  .drop-zone {
    border: 1.5px dashed rgba(168,85,247,0.35); border-radius: 10px;
    padding: 16px 14px; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; transition: border-color 0.2s, background 0.2s;
    background: rgba(168,85,247,0.04);
  }
  .drop-zone:hover, .drop-zone.drag-active {
    border-color: #a855f7; background: rgba(168,85,247,0.1);
  }

  .spinner-sm {
    width: 22px; height: 22px; border-radius: 50%;
    border: 2.5px solid rgba(168,85,247,0.2);
    border-top-color: #a855f7;
    animation: spin 0.8s linear infinite;
  }

  .form-label {
    font-size: 11px; font-weight: 700; color: #a1a1aa;
    text-transform: uppercase; letter-spacing: 0.07em;
    display: flex; align-items: center; gap: 6px;
  }
  .req-badge {
    background: #ef4444; color: #fff;
    border-radius: 3px; padding: 1px 5px;
    font-size: 8px; font-weight: 800;
  }

  .form-input {
    width: 100%; box-sizing: border-box;
    padding: 11px 14px; background: #07080e;
    border: 1px solid #27272a; border-radius: 8px;
    color: #e4e4e7; font-size: 13px;
    font-family: 'Outfit', sans-serif;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .form-input:focus { border-color: rgba(168,85,247,0.5); box-shadow: 0 0 0 3px rgba(168,85,247,0.1); }
  .form-textarea { min-height: 85px; resize: vertical; line-height: 1.65; }

  /* ── Modal Positioning & Containers ── */
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    width: 100vw; height: 100vh;
    background: rgba(3, 4, 10, 0.86); backdrop-filter: blur(14px);
    display: flex; align-items: center; justify-content: center;
    z-index: 99999; padding: 24px; box-sizing: border-box;
    animation: fadeIn 0.2s ease-out;
  }
  .modal-box {
    width: 100%; max-width: 640px; max-height: 88vh;
    background: #0c0d16; border: 1px solid rgba(168, 85, 247, 0.4);
    border-radius: 20px; box-shadow: 0 32px 90px rgba(0, 0, 0, 0.95);
    display: flex; flex-direction: column;
    overflow: hidden; position: relative; z-index: 100000;
  }

  .modal-header {
    padding: 20px 26px; border-bottom: 1px solid #27272a;
    background: linear-gradient(135deg, rgba(168,85,247,0.12), rgba(6,182,212,0.06));
    display: flex; justify-content: space-between; alignItems: center;
    position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px);
  }

  .modal-icon-badge {
    width: 42px; height: 42px; borderRadius: 12px;
    background: linear-gradient(135deg, rgba(168,85,247,0.25), rgba(6,182,212,0.15));
    border: 1px solid rgba(168,85,247,0.35);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }

  .modal-close-btn {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    color: #a1a1aa; border-radius: 50%; width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 15px; font-weight: 700; transition: all 0.2s;
  }
  .modal-close-btn:hover { background: rgba(239,68,68,0.2); border-color: #ef4444; color: #ffffff; }

  .modal-form-body {
    padding: 24px 28px; display: flex; flex-direction: column; gap: 20px;
    overflow-y: auto; flex: 1;
  }

  .photo-card-container {
    background: #07080e; border: 1px solid #27272a; borderRadius: 14px; padding: 18px;
  }

  .avatar-preview-ring {
    width: 90px; height: 90px; borderRadius: 50%; flex-shrink: 0;
    border: 3px solid rgba(168,85,247,0.45); overflow: hidden;
    background: rgba(168,85,247,0.08);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 24px rgba(0,0,0,0.6); position: relative;
  }

  .photo-loaded-tag {
    font-size: 10px; font-weight: 800; color: #10b981;
    background: rgba(16,185,129,0.15); padding: 3px 8px;
    border-radius: 10px; border: 1px solid rgba(16,185,129,0.3);
  }

  .btn-clear-photo {
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
    color: #ef4444; border-radius: 6px; padding: 8px 12px;
    font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap;
    transition: background 0.15s;
  }
  .btn-clear-photo:hover { background: rgba(239,68,68,0.2); }

  .skill-chip-preview {
    font-size: 10.5px; padding: 3px 9px; borderRadius: 20px;
    color: #a855f7; background: rgba(168,85,247,0.12);
    border: 1px solid rgba(168,85,247,0.25);
    font-family: 'JetBrains Mono', monospace; font-weight: 700;
  }

  .modal-footer-bar {
    padding: 16px 28px; border-top: 1px solid #27272a;
    display: flex; gap: 12px; background: #07080d;
    position: sticky; bottom: 0; z-index: 10;
  }

  .btn-edit {
    flex: 1; padding: 9px 14px;
    background: rgba(6,182,212,0.06); border: 1px solid rgba(6,182,212,0.2);
    border-radius: 7px; color: #06b6d4;
    cursor: pointer; font-size: 12.5px; font-weight: 700;
    font-family: 'Outfit', sans-serif; transition: background 0.15s, border-color 0.15s;
  }
  .btn-edit:hover { background: rgba(6,182,212,0.12); border-color: #06b6d4; }

  .btn-delete {
    flex: 1; padding: 9px 14px;
    background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2);
    border-radius: 7px; color: #ef4444;
    cursor: pointer; font-size: 12.5px; font-weight: 700;
    font-family: 'Outfit', sans-serif; transition: background 0.15s, border-color 0.15s;
  }
  .btn-delete:hover { background: rgba(239,68,68,0.12); border-color: #ef4444; }

  .btn-save {
    flex: 2; padding: 12px 24px;
    background: linear-gradient(135deg, #a855f7, #7c3aed);
    border: none; border-radius: 8px;
    color: #fff; font-size: 13.5px; font-weight: 700;
    cursor: pointer; font-family: 'Outfit', sans-serif;
    box-shadow: 0 4px 14px rgba(168,85,247,0.3);
    transition: opacity 0.2s, transform 0.15s;
  }
  .btn-save:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-save:not(:disabled):hover { transform: translateY(-1.5px); }

  .btn-cancel {
    flex: 1; padding: 12px 20px;
    background: transparent; border: 1px solid #27272a;
    border-radius: 8px; color: #a1a1aa;
    font-size: 13.5px; font-weight: 600;
    cursor: pointer; font-family: 'Outfit', sans-serif;
    transition: border-color 0.2s, color 0.2s;
  }
  .btn-cancel:hover { border-color: #3f3f46; color: #e4e4e7; }

  .btn-danger {
    padding: 12px 20px; background: #ef4444; border: none;
    border-radius: 8px; color: #fff;
    font-size: 13.5px; font-weight: 700; cursor: pointer;
    font-family: 'Outfit', sans-serif;
    box-shadow: 0 4px 14px rgba(239,68,68,0.25);
    transition: transform 0.15s;
  }
  .btn-danger:hover { transform: translateY(-1.5px); }
`;


