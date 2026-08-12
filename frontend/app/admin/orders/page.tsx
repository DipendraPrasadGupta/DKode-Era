'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface Order {
  id: number;
  serviceName: string;
  tierName: string;
  price: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  message: string;
  status: string; // Pending, Processing, Completed, Cancelled
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  Pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', icon: '⏳' },
  Processing: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', icon: '⚙️' },
  Completed: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', icon: '✅' },
  Cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', icon: '🚫' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected Order for Details View
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/api/orders');
      const ordersData = Array.isArray(data) ? data : [];
      setOrders(ordersData);
      if (ordersData.length > 0 && !selectedOrder) {
        setSelectedOrder(ordersData[0]);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    setStatusUpdating(id);
    try {
      const updatedOrder = await apiFetch(`/admin/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      showNotification('success', `Order #${id} status updated to "${status}"`);

      // Update local state
      setOrders(orders.map((o) => (o.id === id ? updatedOrder : o)));
      if (selectedOrder?.id === id) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err: any) {
      showNotification('error', err?.message || 'Unable to update order status.');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/admin/api/orders/${id}`, {
        method: 'DELETE',
      });

      showNotification('success', 'Order inquiry deleted successfully.');
      setDeletingId(null);
      if (selectedOrder?.id === id) {
        setSelectedOrder(null);
      }
      fetchOrders();
    } catch (err: any) {
      showNotification('error', err?.message || 'Unable to delete order inquiry.');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      order.userName.toLowerCase().includes(q) ||
      order.userEmail.toLowerCase().includes(q) ||
      order.userPhone.toLowerCase().includes(q) ||
      order.serviceName.toLowerCase().includes(q) ||
      order.tierName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Calculate Metric Stats
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const processingCount = orders.filter((o) => o.status === 'Processing').length;
  const completedCount = orders.filter((o) => o.status === 'Completed').length;

  if (loading)
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid #27272a', borderTopColor: '#06b6d4', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#71717a', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>LOADING SERVICE ORDERS DATABASE...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (error)
    return (
      <div style={{ padding: 24, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#ef4444' }}>
        <b>Connection Error: </b>{error}
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
          min-width: 190px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .stat-badge-box:hover {
          border-color: rgba(6,182,212,0.4);
          transform: translateY(-3px);
          box-shadow: 0 14px 32px rgba(6,182,212,0.15);
        }

        .input-cms {
          width: 100%; box-sizing: border-box;
          padding: 12px 16px;
          background: #090a10; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #e4e4e7;
          font-size: 13.5px; font-family: 'Outfit', sans-serif;
          outline: none; transition: all 0.25s ease;
        }
        .input-cms:focus { border-color: #06b6d4; box-shadow: 0 0 0 3.5px rgba(6,182,212,0.2); }

        .order-row-item {
          padding: 18px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          transition: all 0.25s ease;
          background: transparent;
        }
        .order-row-item.selected {
          background: linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(59,130,246,0.06) 100%);
          border-left: 4px solid #06b6d4;
        }
        .order-row-item:hover:not(.selected) {
          background: rgba(255,255,255,0.02);
        }
        @media (max-width: 1024px) {
          .admin-master-detail {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Notification Toast */}
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
            Service Order Inquiries
          </h2>
          <p style={{ fontSize: 13.5, color: '#71717a', margin: '4px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: '#06b6d4' }}>{orders.length}</span> Total Client Purchase Inquiries &nbsp;·&nbsp;
            <span style={{ color: '#a1a1aa' }}>Manage fulfillment status and client communications</span>
          </p>
        </div>
      </div>

      {/* ── Metric Stats Bar ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            📦
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{orders.length}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Inquiries</div>
          </div>
        </div>

        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ⏳
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{pendingCount}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Review</div>
          </div>
        </div>

        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ⚙️
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{processingCount}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Processing</div>
          </div>
        </div>

        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ✅
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{completedCount}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</div>
          </div>
        </div>
      </div>

      {/* ── Search & Status Filters Bar ── */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', background: 'linear-gradient(135deg, #0c0e17 0%, #131622 100%)', padding: '18px 22px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          {['All', 'Pending', 'Processing', 'Completed', 'Cancelled'].map((status) => {
            const isSelected = statusFilter === status;
            const count = status === 'All' ? orders.length : orders.filter((o) => o.status === status).length;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '8px 16px',
                  background: isSelected ? 'rgba(6,182,212,0.16)' : '#090a10',
                  color: isSelected ? '#06b6d4' : '#a1a1aa',
                  border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>{status}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: '2px 7px',
                    borderRadius: 10,
                    background: isSelected ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.05)',
                    color: isSelected ? '#06b6d4' : '#71717a',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        <div style={{ position: 'relative', width: 280 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none', color: '#71717a' }}>🔍</span>
          <input
            type="text"
            placeholder="Search client, service, tier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-cms"
            style={{ paddingLeft: 40, padding: '10px 14px 10px 40px', fontSize: 13 }}
          />
        </div>
      </div>

      {/* ── Main Layout: Orders List Table & Inspection Sidebar Drawer ── */}
      <div className="admin-master-detail" style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 380px' : '1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Orders List */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0c0e17 0%, #131622 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 18,
            overflow: 'hidden',
            backdropFilter: 'blur(14px)',
          }}
        >
          {filteredOrders.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center', color: '#71717a' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📦</div>
              <div style={{ fontWeight: 700, color: '#e4e4e7', fontSize: 16 }}>
                {searchTerm || statusFilter !== 'All' ? 'No orders match search filters' : 'No service orders received yet'}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.7 }}>
                {searchTerm || statusFilter !== 'All' ? 'Try adjusting your search term or status filter.' : 'Inquiries submitted by clients will populate here automatically.'}
              </p>
            </div>
          ) : (
            <div>
              {filteredOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                const statusStyle = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`order-row-item ${isSelected ? 'selected' : ''}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'rgba(6,182,212,0.12)',
                            border: '1px solid rgba(6,182,212,0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            color: '#06b6d4',
                            fontWeight: 800,
                          }}
                        >
                          {order.userName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div style={{ fontWeight: 800, color: '#f4f4f5', fontSize: 15, fontFamily: "'Syne', sans-serif" }}>
                            {order.userName}
                          </div>
                          <div style={{ fontSize: 12, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>
                            {order.userEmail} &nbsp;·&nbsp; {order.userPhone}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          color: statusStyle.color,
                          background: statusStyle.bg,
                          border: statusStyle.border,
                          borderRadius: 20,
                          padding: '4px 12px',
                          fontSize: 11,
                          fontWeight: 800,
                          fontFamily: "'JetBrains Mono', monospace",
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span>{statusStyle.icon}</span>
                        <span>{order.status.toUpperCase()}</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, paddingTop: 10, borderTop: '1px dashed rgba(255,255,255,0.06)' }}>
                      <div>
                        <div style={{ fontSize: 12.5, color: '#a1a1aa' }}>
                          Service: <span style={{ color: '#06b6d4', fontWeight: 700 }}>{order.serviceName}</span> &nbsp;·&nbsp; Tier: <span style={{ color: '#f4f4f5', fontWeight: 700 }}>{order.tierName}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>
                          {order.price}
                        </span>
                        <span style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Order Inspection Drawer */}
        {selectedOrder && (
          <div
            style={{
              background: 'linear-gradient(135deg, #0c0e17 0%, #131622 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 18,
              padding: 26,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              position: 'sticky',
              top: 20,
              backdropFilter: 'blur(14px)',
              boxShadow: '0 20px 48px rgba(0,0,0,0.5)',
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>
                  Order Inspection #{selectedOrder.id}
                </h3>
                <span style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>
                  Submitted {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', color: '#71717a', fontSize: 18, cursor: 'pointer', padding: 4 }}
                title="Close Inspection Drawer"
              >
                ✕
              </button>
            </div>

            {/* Client Info Section */}
            <div style={{ background: '#090a10', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10.5, color: '#06b6d4', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>
                👤 CLIENT CONTACT INFORMATION
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#71717a' }}>Full Name</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#f4f4f5' }}>{selectedOrder.userName}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: '#71717a' }}>Email Address</div>
                  <a
                    href={`mailto:${selectedOrder.userEmail}`}
                    style={{ fontSize: 12.5, color: '#06b6d4', textDecoration: 'none', fontWeight: 700, wordBreak: 'break-all' }}
                  >
                    ✉️ {selectedOrder.userEmail}
                  </a>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: '#71717a' }}>Phone Number</div>
                  <a
                    href={`tel:${selectedOrder.userPhone}`}
                    style={{ fontSize: 12.5, color: '#10b981', textDecoration: 'none', fontWeight: 700 }}
                  >
                    📞 {selectedOrder.userPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Package Details Section */}
            <div style={{ background: '#090a10', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10.5, color: '#06b6d4', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>
                📦 ORDERED PACKAGE DETAILS
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#71717a' }}>Service:</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#06b6d4' }}>{selectedOrder.serviceName}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#71717a' }}>Package Tier:</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#f4f4f5' }}>{selectedOrder.tierName}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: 12, color: '#71717a' }}>Quoted Price:</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#10b981', fontFamily: "'Syne', sans-serif" }}>{selectedOrder.price}</span>
                </div>
              </div>
            </div>

            {/* Status Selector */}
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em', fontFamily: "'JetBrains Mono', monospace" }}>
                Fulfillment Status
              </label>

              <select
                value={selectedOrder.status}
                onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                disabled={statusUpdating === selectedOrder.id}
                className="input-cms"
                style={{ fontWeight: 700, fontSize: 13.5, cursor: statusUpdating === selectedOrder.id ? 'wait' : 'pointer' }}
              >
                <option value="Pending">⏳ Pending Review</option>
                <option value="Processing">⚙️ In Processing</option>
                <option value="Completed">✅ Completed & Delivered</option>
                <option value="Cancelled">🚫 Cancelled Inquiry</option>
              </select>
            </div>

            {/* Client Notes / Instructions */}
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em', fontFamily: "'JetBrains Mono', monospace" }}>
                Client Requirements / Message
              </label>

              <div
                style={{
                  background: '#090a10',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: 14,
                  fontSize: 13,
                  color: '#e4e4e7',
                  lineHeight: 1.6,
                  maxHeight: 140,
                  overflowY: 'auto',
                }}
              >
                {selectedOrder.message || 'No additional notes provided by client.'}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
              <button
                onClick={() => setDeletingId(selectedOrder.id)}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 10,
                  color: '#ef4444',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span>🗑️</span>
                <span>Delete Order</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5,5,12,0.88)',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
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
              Delete Service Order?
            </h3>

            <p style={{ fontSize: 13.5, color: '#a1a1aa', margin: '0 0 24px 0', lineHeight: 1.6 }}>
              This will permanently delete this client service order inquiry. This action cannot be undone.
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
                Yes, Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
