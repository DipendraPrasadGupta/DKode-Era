'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface TeamMember {
  id: number;
  icon: string; // stores image URL or emoji fallback
  role: string;
  name: string;
  desc: string;
  skills: string[];
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
  });

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = () => {
    const token = localStorage.getItem('adminToken');
    fetch('http://localhost:5000/admin/api/team', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => { if (!res.ok) throw new Error('Failed to load team members.'); return res.json(); })
      .then(data => { setItems(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  const showNotif = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  const uploadImage = async (file: File): Promise<string> => {
    setUploadingImage(true);
    const token = localStorage.getItem('adminToken');
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch('http://localhost:5000/admin/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.url;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = useCallback(async (file: File | null) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
      showNotif('error', 'Only JPEG, PNG, WebP or GIF allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotif('error', 'Image must be under 5 MB.');
      return;
    }
    // Local preview first
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    // Upload to server
    try {
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, icon: url }));
      setImagePreview(url);
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
    setFormData({ icon: '', role: '', name: '', desc: '', skillsString: '' });
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
    });
    setImagePreview(isUrl(item.icon) ? item.icon : '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      showNotif('error', 'Name and Role are required.');
      return;
    }
    setFormLoading(true);
    const token = localStorage.getItem('adminToken');
    const url = editingItem
      ? `http://localhost:5000/admin/api/team/${editingItem.id}`
      : 'http://localhost:5000/admin/api/team';
    const method = editingItem ? 'PUT' : 'POST';
    const payload = {
      icon: formData.icon || '👤',
      role: formData.role,
      name: formData.name,
      desc: formData.desc,
      skills: formData.skillsString.split(',').map(s => s.trim()).filter(Boolean),
    };
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save team member.');
      showNotif('success', editingItem ? '✅ Team member updated!' : '✅ Team member added!');
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      showNotif('error', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:5000/admin/api/team/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed.');
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
            Team Members
          </h2>
          <p style={{ fontSize: 13, color: '#71717a', margin: '4px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: '#a855f7' }}>{items.length}</span> members &nbsp;·&nbsp; Photo uploads supported
          </p>
        </div>
        <button className="btn-add" onClick={openAddModal}>➕ Add Member</button>
      </div>

      {/* ── Team Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 22 }}>
        {items.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 24px', background: '#12121a', border: '1px solid #27272a', borderRadius: 12, color: '#71717a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 40 }}>👥</div>
            <div style={{ fontWeight: 600, color: '#a1a1aa' }}>No team members yet</div>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>Add your first team member using the button above.</p>
          </div>
        ) : items.map((item, idx) => {
          const accent = ROLE_COLORS[idx % ROLE_COLORS.length];
          const hasPhoto = isUrl(item.icon);
          return (
            <div key={item.id} className="member-card" style={{ '--accent': accent } as React.CSSProperties}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '12px 12px 0 0' }} />

              {/* Avatar */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${accent}40`,
                  overflow: 'hidden', background: `${accent}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {hasPhoto
                    ? <img src={item.icon} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
              <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.7, marginBottom: 16 }}>
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
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-box" style={{ maxWidth: 580 }}>
            {/* Header */}
            <div style={{ padding: '24px 30px', borderBottom: '1px solid #27272a', background: 'linear-gradient(135deg, rgba(168,85,247,0.07), rgba(6,182,212,0.04))' }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 21, fontWeight: 800, margin: 0, color: '#f4f4f5' }}>
                {editingItem ? '✏️ Edit Team Member' : '➕ Add Team Member'}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#71717a' }}>
                Upload a photo from your gallery and fill in their details
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: 22, overflowY: 'auto', maxHeight: '68vh' }}>

              {/* ── Photo Upload Zone ── */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>
                  Profile Photo
                </label>
                <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                  {/* Preview circle */}
                  <div style={{
                    width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
                    border: '2px dashed #27272a', overflow: 'hidden',
                    background: 'rgba(168,85,247,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                  }}>
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (formData.icon && !isUrl(formData.icon) ? formData.icon : '👤')
                    }
                  </div>

                  {/* Drop zone */}
                  <div
                    className={`drop-zone${dragOver ? ' drag-active' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ flex: 1 }}
                  >
                    {uploadingImage ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <div className="spinner-sm" />
                        <span style={{ fontSize: 12, color: '#a855f7' }}>Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 26, marginBottom: 6 }}>📷</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>Click or drag & drop</div>
                        <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>JPEG, PNG, WebP · Max 5 MB</div>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: 'none' }}
                    onChange={e => handleFileSelect(e.target.files?.[0] ?? null)}
                  />
                </div>

                {/* Remove photo button */}
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImagePreview(''); setFormData(prev => ({ ...prev, icon: '' })); }}
                    style={{ marginTop: 8, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 0 }}
                  >
                    ✕ Remove photo
                  </button>
                )}
              </div>

              {/* Name + Role row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="form-label">Full Name <span className="req-badge">REQUIRED</span></label>
                  <input
                    className="form-input"
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Samir Thapa"
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="form-label">Role / Designation <span className="req-badge">REQUIRED</span></label>
                  <input
                    className="form-input"
                    type="text"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Lead Developer"
                    required
                  />
                </div>
              </div>

              {/* Bio */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="form-label">Short Bio</label>
                <textarea
                  className="form-input form-textarea"
                  value={formData.desc}
                  onChange={e => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Tell something inspiring about this team member..."
                />
              </div>

              {/* Skills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="form-label">Skills <span style={{ fontSize: 10, color: '#71717a', fontWeight: 400, textTransform: 'none' }}>comma-separated</span></label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.skillsString}
                  onChange={e => setFormData({ ...formData, skillsString: e.target.value })}
                  placeholder="React, Node.js, PostgreSQL, AWS"
                />
                {/* Live skill chips preview */}
                {formData.skillsString.trim() && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {formData.skillsString.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                      <span key={i} style={{ fontSize: 10.5, padding: '3px 9px', borderRadius: 20, color: '#a855f7', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </form>

            {/* Footer */}
            <div style={{ padding: '16px 30px', borderTop: '1px solid #27272a', display: 'flex', gap: 12, background: '#0a0a0f', borderRadius: '0 0 16px 16px' }}>
              <button type="submit" className="btn-save" onClick={handleSubmit as any} disabled={formLoading || uploadingImage}>
                {formLoading ? '⏳ Saving...' : `💾 ${editingItem ? 'Update Member' : 'Add Member'}`}
              </button>
              <button className="btn-cancel" type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────── DELETE CONFIRM ─────────────────── */}
      {deletingId !== null && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 400, textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, margin: '0 0 10px', color: '#f4f4f5' }}>Remove Member?</h3>
            <p style={{ fontSize: 13.5, color: '#a1a1aa', marginBottom: 28, lineHeight: 1.7 }}>
              This will permanently remove the team member from the platform.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-cancel" style={{ flex: 1, padding: '12px 20px' }} onClick={() => setDeletingId(null)}>No, Keep</button>
              <button className="btn-danger" style={{ flex: 1 }} onClick={() => deletingId && handleDelete(deletingId)}>Yes, Remove</button>
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
    font-weight: 700; font-size: 14px; z-index: 200;
    animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
    font-family: 'Outfit', sans-serif;
  }
  .toast-success { background: #10b981; color: #050810; box-shadow: 0 12px 32px rgba(16,185,129,0.35); }
  .toast-error   { background: #ef4444; color: #fff;    box-shadow: 0 12px 32px rgba(239,68,68,0.35); }

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
    border-radius: 12px; padding: 26px 22px;
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
    border: 1.5px dashed #27272a; border-radius: 10px;
    padding: 20px 16px; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; transition: border-color 0.2s, background 0.2s;
    background: rgba(168,85,247,0.03);
  }
  .drop-zone:hover, .drop-zone.drag-active {
    border-color: #a855f7; background: rgba(168,85,247,0.07);
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
    padding: 11px 14px; background: #0a0a0f;
    border: 1px solid #27272a; border-radius: 8px;
    color: #e4e4e7; font-size: 13px;
    font-family: 'Outfit', sans-serif;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .form-input:focus { border-color: rgba(168,85,247,0.5); box-shadow: 0 0 0 3px rgba(168,85,247,0.08); }
  .form-textarea { min-height: 90px; resize: vertical; line-height: 1.65; }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(5,5,10,0.88); backdrop-filter: blur(10px);
    display: flex; align-items: center; justify-content: center;
    z-index: 90; padding: 20px; animation: fadeIn 0.2s ease;
  }
  .modal-box {
    width: 100%; background: #12121a;
    border: 1px solid #27272a; border-radius: 16px;
    box-shadow: 0 28px 72px rgba(0,0,0,0.6);
    display: flex; flex-direction: column;
    max-height: 94vh; overflow: hidden;
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
    box-shadow: 0 4px 14px rgba(168,85,247,0.25);
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
