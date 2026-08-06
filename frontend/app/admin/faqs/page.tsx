'use client';

import { useState, useEffect } from 'react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function FAQsAdminPage() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
  });

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    const token = localStorage.getItem('adminToken');
    fetch('http://localhost:5000/admin/api/faqs', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load FAQs.');
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
      question: '',
      answer: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: FAQ) => {
    setEditingItem(item);
    setFormData({
      question: item.question,
      answer: item.answer,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const url = editingItem
      ? `http://localhost:5000/admin/api/faqs/${editingItem.id}`
      : 'http://localhost:5000/admin/api/faqs';
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

      if (!res.ok) throw new Error('Failed to save FAQ.');

      showNotification(editingItem ? 'FAQ updated successfully!' : 'FAQ created successfully!');
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:5000/admin/api/faqs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete FAQ.');

      showNotification('FAQ deleted successfully!');
      setDeletingId(null);
      fetchItems();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ color: '#71717a', fontSize: 14 }}>Loading FAQs list...</div>;
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
            Manage FAQs
          </h2>
          <p style={{ fontSize: 13, color: '#a1a1aa', marginTop: 4 }}>
            Create and edit Frequently Asked Questions to help users navigate their doubts.
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
          ➕ Add FAQ
        </button>
      </div>

      {/* FAQ Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#71717a', background: '#12121a', border: '1px solid #27272a', borderRadius: 8 }}>
            No FAQs defined in the database.
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
              gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e4e4e7' }}>
                  ❓ {item.question}
                </h3>
                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(6,182,212,0.08)',
                      border: '1px solid rgba(6,182,212,0.15)',
                      borderRadius: 6,
                      color: '#06b6d4',
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingId(item.id)}
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.15)',
                      borderRadius: 6,
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p style={{
                fontSize: 13,
                color: '#a1a1aa',
                lineHeight: 1.6,
                padding: '12px 16px',
                background: '#0a0a0f',
                borderRadius: 6,
                border: '1px solid #1c1c24',
                margin: 0
              }}>
                {item.answer}
              </p>
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
              {editingItem ? 'Edit FAQ' : 'Add New FAQ'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: '#a1a1aa' }}>Question</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                  required
                  placeholder="e.g. How long does development take?"
                  style={{ padding: 10, background: '#181824', border: '1px solid #27272a', borderRadius: 6, color: '#e4e4e7' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: '#a1a1aa' }}>Answer</label>
                <textarea
                  value={formData.answer}
                  onChange={e => setFormData({ ...formData, answer: e.target.value })}
                  required
                  rows={5}
                  placeholder="Write the FAQ response..."
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
              Are you sure you want to delete this FAQ entry?
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
