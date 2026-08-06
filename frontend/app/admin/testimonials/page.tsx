'use client';

import { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  stars: number;
  quote: string;
  icon: string;
  name: string;
  biz: string;
}

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    stars: 5,
    quote: '',
    icon: '',
    name: '',
    biz: '',
  });

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    const token = localStorage.getItem('adminToken');
    fetch('http://localhost:5000/admin/api/testimonials', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load testimonials.');
        return res.json();
      })
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      stars: 5,
      quote: '',
      icon: '👤',
      name: '',
      biz: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      stars: item.stars,
      quote: item.quote,
      icon: item.icon,
      name: item.name,
      biz: item.biz,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const url = editingItem
      ? `http://localhost:5000/admin/api/testimonials/${editingItem.id}`
      : 'http://localhost:5000/admin/api/testimonials';
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save testimonial.');

      showNotification(editingItem ? 'Testimonial updated!' : 'Testimonial created!');
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:5000/admin/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete testimonial.');

      showNotification('Testimonial deleted!');
      setDeletingId(null);
      fetchItems();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ color: '#71717a', fontSize: 14 }}>Loading testimonials...</div>;
  if (error) return <div style={{ color: '#ef4444' }}>Error: {error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#10b981',
          color: '#0a0a0f',
          padding: '12px 24px',
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: '0 10px 30px rgba(16,185,129,0.3)',
          zIndex: 100
        }}>
          {notification}
        </div>
      )}

      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, margin: 0 }}>
            Manage Testimonials
          </h2>
          <p style={{ fontSize: 13, color: '#a1a1aa', marginTop: 4 }}>
            Control review cards shown on the website landing pages.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          style={{
            padding: '10px 18px',
            background: '#06b6d4',
            border: 'none',
            borderRadius: 8,
            color: '#0a0a0f',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          ➕ Add Testimonial
        </button>
      </div>

      {/* List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 24
      }}>
        {items.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#71717a', background: '#12121a', border: '1px solid #27272a', borderRadius: 8 }}>
            No testimonials found.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} style={{
              background: '#12121a',
              border: '1px solid #27272a',
              borderRadius: 10,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 16
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ color: '#f59e0b', fontSize: 15 }}>
                    {'★'.repeat(item.stars)}{'☆'.repeat(5 - item.stars)}
                  </div>
                  <span style={{ fontSize: 24 }}>{item.icon}</span>
                </div>
                <p style={{
                  fontSize: 13,
                  color: '#a1a1aa',
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  marginBottom: 16
                }}>
                  "{item.quote}"
                </p>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#e4e4e7' }}>{item.name}</h4>
                  <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>{item.biz}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #27272a', paddingTop: 16, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleOpenEditModal(item)}
                  style={{
                    padding: '6px 14px',
                    background: 'rgba(6,182,212,0.08)',
                    border: '1px solid rgba(6,182,212,0.15)',
                    borderRadius: 6,
                    color: '#06b6d4',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setDeletingId(item.id)}
                  style={{
                    padding: '6px 14px',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: 6,
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit/Add Modal Overlay */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,5,10,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 90
        }}>
          <div style={{
            width: '100%',
            maxWidth: 500,
            background: '#12121a',
            border: '1px solid #27272a',
            borderRadius: 12,
            padding: 32
          }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              {editingItem ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, color: '#a1a1aa' }}>Avatar Icon</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                    required
                    style={{ padding: 10, background: '#181824', border: '1px solid #27272a', borderRadius: 6, color: '#e4e4e7' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, color: '#a1a1aa' }}>Stars (1 to 5)</label>
                  <select
                    value={formData.stars}
                    onChange={e => setFormData({ ...formData, stars: Number(e.target.value) })}
                    style={{ padding: 10, background: '#181824', border: '1px solid #27272a', borderRadius: 6, color: '#e4e4e7' }}
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: '#a1a1aa' }}>Reviewer Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Ramesh Giri"
                  style={{ padding: 10, background: '#181824', border: '1px solid #27272a', borderRadius: 6, color: '#e4e4e7' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: '#a1a1aa' }}>Company / Designation</label>
                <input
                  type="text"
                  value={formData.biz}
                  onChange={e => setFormData({ ...formData, biz: e.target.value })}
                  required
                  placeholder="e.g. Marketing Director, Foodmandu"
                  style={{ padding: 10, background: '#181824', border: '1px solid #27272a', borderRadius: 6, color: '#e4e4e7' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: '#a1a1aa' }}>Review Quote</label>
                <textarea
                  value={formData.quote}
                  onChange={e => setFormData({ ...formData, quote: e.target.value })}
                  required
                  rows={4}
                  placeholder="Write the client feedback quote..."
                  style={{ padding: 10, background: '#181824', border: '1px solid #27272a', borderRadius: 6, color: '#e4e4e7', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    border: '1px solid #27272a',
                    borderRadius: 6,
                    color: '#a1a1aa',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: '#06b6d4',
                    border: 'none',
                    borderRadius: 6,
                    color: '#0a0a0f',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId !== null && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,5,10,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 90
        }}>
          <div style={{
            width: '100%',
            maxWidth: 400,
            background: '#12121a',
            border: '1px solid #27272a',
            borderRadius: 12,
            padding: 32,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Confirm Deletion
            </h3>
            <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 24 }}>
              Are you sure you want to delete this testimonial?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setDeletingId(null)}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid #27272a',
                  borderRadius: 6,
                  color: '#a1a1aa',
                  cursor: 'pointer'
                }}
              >
                No, Keep It
              </button>
              <button
                onClick={() => deletingId !== null && handleDelete(deletingId)}
                style={{
                  padding: '10px 20px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: 6,
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer'
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
