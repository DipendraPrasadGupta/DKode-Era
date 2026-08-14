'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getSubscribers,
  addSubscriber,
  toggleSubscriberActive,
  deleteSubscriber,
  getNotifications,
  sendNotification,
  deleteNotification,
  type Subscriber,
  type Notification,
} from '@/lib/api/notifications';

// ─── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'compose' | 'history' | 'subscribers';
type Channel = 'email' | 'in-app' | 'both';
type Target = 'all' | 'selected';

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>('compose');

  // Compose state
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [channel, setChannel] = useState<Channel>('email');
  const [targetType, setTargetType] = useState<Target>('all');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // History state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [expandedNotif, setExpandedNotif] = useState<number | null>(null);

  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [addingSub, setAddingSub] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);
  const [subSearch, setSubSearch] = useState('');
  const [deletingSubId, setDeletingSubId] = useState<number | null>(null);

  // ── Load data ─────────────────────────────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try { setNotifications(await getNotifications()); } catch { /* ignore */ } finally { setNotifLoading(false); }
  }, []);

  const loadSubscribers = useCallback(async () => {
    setSubLoading(true);
    try { setSubscribers(await getSubscribers()); } catch { /* ignore */ } finally { setSubLoading(false); }
  }, []);

  useEffect(() => { loadNotifications(); loadSubscribers(); }, [loadNotifications, loadSubscribers]);

  // ── Compose / Send ────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setSendResult({ type: 'error', msg: 'Subject and message body are required.' });
      return;
    }
    setSending(true);
    setSendResult(null);
    try {
      const res = await sendNotification({
        subject, body, channel, targetType,
        recipientEmails: targetType === 'selected' ? selectedEmails : undefined,
      });
      const { summary } = res;
      setSendResult({
        type: 'success',
        msg: `✅ Notification sent to ${summary.sent} recipient${summary.sent !== 1 ? 's' : ''}${summary.failed > 0 ? ` (${summary.failed} failed)` : ''}.`,
      });
      setSubject('');
      setBody('');
      setSelectedEmails([]);
      loadNotifications();
    } catch (err: any) {
      setSendResult({ type: 'error', msg: err.message || 'Failed to send notification.' });
    } finally {
      setSending(false);
    }
  };

  // ── Subscribers ────────────────────────────────────────────────────────────────
  const handleAddSub = async () => {
    if (!newEmail.trim()) { setSubError('Email is required.'); return; }
    setAddingSub(true);
    setSubError(null);
    try {
      const sub = await addSubscriber(newEmail.trim(), newName.trim());
      setSubscribers((prev) => [sub, ...prev.filter((s) => s.id !== sub.id)]);
      setNewEmail('');
      setNewName('');
    } catch (err: any) {
      setSubError(err.message || 'Failed to add subscriber.');
    } finally { setAddingSub(false); }
  };

  const handleToggleSub = async (sub: Subscriber) => {
    try {
      const updated = await toggleSubscriberActive(sub.id, !sub.active);
      setSubscribers((prev) => prev.map((s) => (s.id === sub.id ? updated : s)));
    } catch { /* ignore */ }
  };

  const handleDeleteSub = async (id: number) => {
    setDeletingSubId(id);
    try {
      await deleteSubscriber(id);
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch { /* ignore */ } finally { setDeletingSubId(null); }
  };

  const handleDeleteNotif = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch { /* ignore */ }
  };

  const toggleEmailSelection = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const filteredSubs = subscribers.filter(
    (s) =>
      s.email.toLowerCase().includes(subSearch.toLowerCase()) ||
      s.name.toLowerCase().includes(subSearch.toLowerCase())
  );

  const activeCount = subscribers.filter((s) => s.active).length;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <style>{pageCss}</style>

      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(139,92,246,0.18))',
            border: '1px solid rgba(6,182,212,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>🔔</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#f4f4f5', margin: 0, fontFamily: "'Syne', sans-serif" }}>
              Notification Center
            </h1>
            <p style={{ fontSize: 13, color: '#71717a', margin: '2px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
              BROADCAST · EMAIL · HISTORY · SUBSCRIBERS
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Sent', value: notifications.length, icon: '📨', color: '#06b6d4' },
            { label: 'Active Subscribers', value: activeCount, icon: '👥', color: '#10b981' },
            { label: 'Total Subscribers', value: subscribers.length, icon: '📋', color: '#8b5cf6' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid rgba(${stat.color === '#06b6d4' ? '6,182,212' : stat.color === '#10b981' ? '16,185,129' : '139,92,246'},0.2)`,
              borderRadius: 12, padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 12, minWidth: 160,
            }}>
              <span style={{ fontSize: 22 }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: '#71717a', marginTop: 2, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 4 }}>
        {([
          { key: 'compose', label: 'Compose & Send', icon: '✍️' },
          { key: 'history', label: 'Sent History', icon: '📜' },
          { key: 'subscribers', label: 'Subscribers', icon: '👥' },
        ] as { key: Tab; label: string; icon: string }[]).map(({ key, label, icon }) => (
          <button
            key={key}
            id={`tab-${key}`}
            onClick={() => setTab(key)}
            className={`notif-tab ${tab === key ? 'notif-tab-active' : ''}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
            {key === 'subscribers' && subscribers.length > 0 && (
              <span style={{
                background: 'rgba(6,182,212,0.2)', color: '#06b6d4',
                borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700,
              }}>{activeCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── COMPOSE TAB ──────────────────────────────────────────────────────────── */}
      {tab === 'compose' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          {/* Left: Composer */}
          <div className="notif-card">
            <div style={{ marginBottom: 20 }}>
              <label className="notif-label">Subject *</label>
              <input
                id="notif-subject"
                className="notif-input"
                placeholder="e.g. Important Update from D-Kode Era"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="notif-label">Message Body *</label>
              <textarea
                id="notif-body"
                className="notif-textarea"
                placeholder="Write your notification message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
              />
              <div style={{ fontSize: 11, color: '#52525b', marginTop: 4, textAlign: 'right' }}>
                {body.length} characters
              </div>
            </div>

            {/* Preview */}
            {subject || body ? (
              <div style={{
                background: 'rgba(6,182,212,0.04)',
                border: '1px solid rgba(6,182,212,0.15)',
                borderRadius: 10, padding: '16px 20px', marginBottom: 20,
              }}>
                <div style={{ fontSize: 11, color: '#06b6d4', fontWeight: 700, marginBottom: 8, letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace" }}>
                  LIVE PREVIEW
                </div>
                {subject && <div style={{ fontSize: 16, fontWeight: 800, color: '#f4f4f5', marginBottom: 8 }}>{subject}</div>}
                {body && (
                  <div style={{ fontSize: 13.5, color: '#a1a1aa', lineHeight: 1.7, borderLeft: '2px solid #06b6d4', paddingLeft: 12 }}>
                    {body.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
                  </div>
                )}
              </div>
            ) : null}

            {sendResult && (
              <div style={{
                padding: '12px 16px', borderRadius: 10, marginBottom: 16,
                background: sendResult.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${sendResult.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: sendResult.type === 'success' ? '#10b981' : '#ef4444',
                fontSize: 13.5, fontWeight: 600,
              }}>
                {sendResult.msg}
              </div>
            )}

            <button
              id="btn-send-notification"
              className="notif-send-btn"
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? (
                <><span className="notif-spin">⟳</span> Sending...</>
              ) : (
                <><span>🚀</span> Send Notification</>
              )}
            </button>
          </div>

          {/* Right: Settings Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Channel */}
            <div className="notif-card">
              <div style={{ fontSize: 12, color: '#71717a', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 14, fontFamily: "'JetBrains Mono', monospace" }}>
                DELIVERY CHANNEL
              </div>
              {([
                { val: 'email', label: 'Email Only', icon: '📧', desc: 'Send via SMTP email' },
                { val: 'in-app', label: 'In-App Only', icon: '🔔', desc: 'Record in notification log' },
                { val: 'both', label: 'Email + In-App', icon: '⚡', desc: 'Both channels simultaneously' },
              ] as { val: Channel; label: string; icon: string; desc: string }[]).map(({ val, label, icon, desc }) => (
                <button
                  key={val}
                  id={`channel-${val}`}
                  onClick={() => setChannel(val)}
                  className={`notif-option-btn ${channel === val ? 'notif-option-active' : ''}`}
                >
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: channel === val ? '#06b6d4' : '#e4e4e7' }}>{label}</div>
                    <div style={{ fontSize: 11, color: '#71717a' }}>{desc}</div>
                  </div>
                  {channel === val && <span style={{ color: '#06b6d4', fontSize: 16 }}>✓</span>}
                </button>
              ))}
            </div>

            {/* Audience */}
            <div className="notif-card">
              <div style={{ fontSize: 12, color: '#71717a', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 14, fontFamily: "'JetBrains Mono', monospace" }}>
                TARGET AUDIENCE
              </div>
              <button
                id="target-all"
                onClick={() => setTargetType('all')}
                className={`notif-option-btn ${targetType === 'all' ? 'notif-option-active' : ''}`}
              >
                <span style={{ fontSize: 18 }}>🌍</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: targetType === 'all' ? '#06b6d4' : '#e4e4e7' }}>All Subscribers</div>
                  <div style={{ fontSize: 11, color: '#71717a' }}>{activeCount} active subscribers</div>
                </div>
                {targetType === 'all' && <span style={{ color: '#06b6d4' }}>✓</span>}
              </button>
              <button
                id="target-selected"
                onClick={() => setTargetType('selected')}
                className={`notif-option-btn ${targetType === 'selected' ? 'notif-option-active' : ''}`}
              >
                <span style={{ fontSize: 18 }}>🎯</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: targetType === 'selected' ? '#06b6d4' : '#e4e4e7' }}>Select Recipients</div>
                  <div style={{ fontSize: 11, color: '#71717a' }}>
                    {selectedEmails.length > 0 ? `${selectedEmails.length} selected` : 'Pick specific subscribers'}
                  </div>
                </div>
                {targetType === 'selected' && <span style={{ color: '#06b6d4' }}>✓</span>}
              </button>

              {targetType === 'selected' && (
                <div style={{ marginTop: 12, maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {subscribers.filter((s) => s.active).length === 0 ? (
                    <div style={{ color: '#52525b', fontSize: 12, textAlign: 'center', padding: '12px 0' }}>No active subscribers</div>
                  ) : (
                    subscribers.filter((s) => s.active).map((s) => (
                      <label
                        key={s.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                          background: selectedEmails.includes(s.email) ? 'rgba(6,182,212,0.08)' : 'transparent',
                          border: `1px solid ${selectedEmails.includes(s.email) ? 'rgba(6,182,212,0.25)' : 'transparent'}`,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEmails.includes(s.email)}
                          onChange={() => toggleEmailSelection(s.email)}
                          style={{ accentColor: '#06b6d4' }}
                        />
                        <div>
                          <div style={{ fontSize: 12, color: '#e4e4e7', fontWeight: 600 }}>{s.name || s.email}</div>
                          {s.name && <div style={{ fontSize: 10, color: '#71717a' }}>{s.email}</div>}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* SMTP Status */}
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.2)',
            }}>
              <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                ⚠ SMTP CONFIG
              </div>
              <div style={{ fontSize: 11.5, color: '#a1a1aa', lineHeight: 1.6 }}>
                Configure <code style={{ color: '#06b6d4', fontSize: 10.5 }}>SMTP_*</code> vars in <code style={{ color: '#06b6d4', fontSize: 10.5 }}>backend/.env</code> to enable real email delivery. Without SMTP, notifications are logged but not emailed.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ──────────────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#71717a' }}>
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''} sent
            </div>
            <button className="notif-refresh-btn" onClick={loadNotifications} disabled={notifLoading}>
              <span className={notifLoading ? 'notif-spin' : ''}>⟳</span> Refresh
            </button>
          </div>

          {notifLoading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#52525b' }}>Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty">
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#71717a' }}>No notifications sent yet</div>
              <div style={{ fontSize: 13, color: '#52525b', marginTop: 4 }}>Go to Compose & Send to broadcast your first notification</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.map((n) => {
                const sentCount = n.recipients.filter((r) => r.status === 'sent').length;
                const failedCount = n.recipients.filter((r) => r.status === 'failed').length;
                const isExpanded = expandedNotif === n.id;

                return (
                  <div key={n.id} className="notif-card" style={{ cursor: 'default' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      {/* Channel badge */}
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                      }}>
                        {n.channel === 'email' ? '📧' : n.channel === 'in-app' ? '🔔' : '⚡'}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#f4f4f5' }}>{n.subject}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                            background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)',
                          }}>
                            {n.status.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#71717a', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <span>📅 {new Date(n.createdAt).toLocaleString()}</span>
                          <span>👤 By {n.sentBy}</span>
                          <span>🎯 {n.targetType === 'all' ? 'All subscribers' : 'Selected'}</span>
                          <span style={{ color: '#10b981' }}>✅ {sentCount} sent</span>
                          {failedCount > 0 && <span style={{ color: '#ef4444' }}>❌ {failedCount} failed</span>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button
                          className="notif-icon-btn"
                          onClick={() => setExpandedNotif(isExpanded ? null : n.id)}
                          title="Toggle Details"
                        >
                          {isExpanded ? '▲' : '▼'}
                        </button>
                        <button
                          className="notif-icon-btn notif-delete-btn"
                          onClick={() => handleDeleteNotif(n.id)}
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                        <div style={{
                          background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '12px 16px',
                          fontSize: 13.5, color: '#a1a1aa', lineHeight: 1.8, marginBottom: 16,
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                          {n.body.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
                        </div>

                        {n.recipients.length > 0 && (
                          <div>
                            <div style={{ fontSize: 11, color: '#52525b', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                              RECIPIENTS ({n.recipients.length})
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {n.recipients.map((r) => (
                                <div key={r.id} style={{
                                  padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                  background: r.status === 'sent' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                  border: `1px solid ${r.status === 'sent' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                                  color: r.status === 'sent' ? '#10b981' : '#ef4444',
                                }}>
                                  {r.email}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SUBSCRIBERS TAB ──────────────────────────────────────────────────────── */}
      {tab === 'subscribers' && (
        <div>
          {/* Add Subscriber Form */}
          <div className="notif-card" style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#71717a', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 14, fontFamily: "'JetBrains Mono', monospace" }}>
              ADD SUBSCRIBER
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                id="sub-name"
                className="notif-input"
                style={{ flex: '1 1 160px', minWidth: 120 }}
                placeholder="Full name (optional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                id="sub-email"
                className="notif-input"
                style={{ flex: '2 1 220px', minWidth: 180 }}
                placeholder="Email address *"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddSub(); }}
              />
              <button
                id="btn-add-subscriber"
                className="notif-send-btn"
                style={{ padding: '10px 20px', fontSize: 13 }}
                onClick={handleAddSub}
                disabled={addingSub}
              >
                              {addingSub ? <><span className="notif-spin">⟳</span> Adding...</> : '+ Add'}
              </button>
            </div>
            {subError && (
              <div style={{ marginTop: 10, color: '#ef4444', fontSize: 12.5 }}>{subError}</div>
            )}
          </div>

          {/* Search & Stats */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              id="sub-search"
              className="notif-input"
              style={{ flex: 1, minWidth: 200 }}
              placeholder="🔍 Search subscribers..."
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
            />
            <div style={{ fontSize: 13, color: '#71717a', flexShrink: 0 }}>
              <span style={{ color: '#10b981', fontWeight: 700 }}>{activeCount}</span> active ·{' '}
              <span style={{ color: '#71717a' }}>{subscribers.length - activeCount}</span> inactive
            </div>
            <button className="notif-refresh-btn" onClick={loadSubscribers} disabled={subLoading}>
              <span className={subLoading ? 'notif-spin' : ''}>⟳</span> Refresh
            </button>
          </div>

          {subLoading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#52525b' }}>Loading...</div>
          ) : filteredSubs.length === 0 ? (
            <div className="notif-empty">
              <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#71717a' }}>
                {subSearch ? 'No subscribers match your search' : 'No subscribers yet'}
              </div>
              <div style={{ fontSize: 13, color: '#52525b', marginTop: 4 }}>
                {subSearch ? 'Try a different keyword' : 'Add your first subscriber using the form above'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredSubs.map((sub) => (
                <div key={sub.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${sub.active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)'}`,
                  transition: 'all 0.2s ease',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, hsl(${sub.email.charCodeAt(0) * 7 % 360}, 60%, 40%), hsl(${sub.email.charCodeAt(1) * 11 % 360}, 60%, 30%))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 800, color: '#fff',
                  }}>
                    {(sub.name || sub.email).charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#f4f4f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sub.name || sub.email}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#71717a', display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
                      {sub.name && <span>{sub.email}</span>}
                      <span style={{
                        padding: '1px 6px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                        background: 'rgba(139,92,246,0.12)', color: '#8b5cf6',
                      }}>{sub.source}</span>
                      <span>📅 {new Date(sub.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Active toggle */}
                  <button
                    onClick={() => handleToggleSub(sub)}
                    style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      background: sub.active ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.08)',
                      border: `1px solid ${sub.active ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'}`,
                      color: sub.active ? '#10b981' : '#ef4444',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {sub.active ? '● Active' : '○ Inactive'}
                  </button>

                  <button
                    className="notif-icon-btn notif-delete-btn"
                    onClick={() => handleDeleteSub(sub.id)}
                    disabled={deletingSubId === sub.id}
                    title="Delete subscriber"
                  >
                    {deletingSubId === sub.id ? <span className="notif-spin">⟳</span> : '🗑'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CSS ────────────────────────────────────────────────────────────────────────
const pageCss = `
  @keyframes notif-spin { to { transform: rotate(360deg); } }
  .notif-spin { display: inline-block; animation: notif-spin 0.7s linear infinite; }

  .notif-tab {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
    padding: 10px 16px; border-radius: 9px; border: none; cursor: pointer;
    font-size: 13px; font-weight: 700; font-family: 'Outfit', sans-serif;
    background: transparent; color: #71717a; transition: all 0.2s ease;
  }
  .notif-tab:hover { color: #a1a1aa; background: rgba(255,255,255,0.04); }
  .notif-tab-active { background: linear-gradient(135deg, rgba(6,182,212,0.14), rgba(139,92,246,0.1)) !important; color: #06b6d4 !important; border: 1px solid rgba(6,182,212,0.25) !important; }

  .notif-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 22px 24px;
    transition: border-color 0.2s ease;
  }
  .notif-card:hover { border-color: rgba(255,255,255,0.12); }

  .notif-label {
    display: block; font-size: 12px; font-weight: 700; color: #71717a;
    letter-spacing: 0.08em; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace;
  }

  .notif-input {
    width: 100%; padding: 11px 14px; border-radius: 9px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    color: #f4f4f5; font-size: 14px; font-family: 'Outfit', sans-serif;
    outline: none; transition: all 0.2s ease; box-sizing: border-box;
  }
  .notif-input:focus { border-color: rgba(6,182,212,0.4); background: rgba(6,182,212,0.04); box-shadow: 0 0 0 3px rgba(6,182,212,0.08); }
  .notif-input::placeholder { color: #3f3f46; }

  .notif-textarea {
    width: 100%; padding: 12px 14px; border-radius: 9px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    color: #f4f4f5; font-size: 14px; font-family: 'Outfit', sans-serif;
    outline: none; transition: all 0.2s ease; resize: vertical;
    min-height: 140px; box-sizing: border-box; line-height: 1.7;
  }
  .notif-textarea:focus { border-color: rgba(6,182,212,0.4); background: rgba(6,182,212,0.04); box-shadow: 0 0 0 3px rgba(6,182,212,0.08); }
  .notif-textarea::placeholder { color: #3f3f46; }

  .notif-send-btn {
    width: 100%; padding: 14px 20px; border-radius: 10px;
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    border: none; color: #fff; font-size: 15px; font-weight: 800;
    font-family: 'Outfit', sans-serif; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s ease; letter-spacing: 0.02em;
  }
  .notif-send-btn:hover:not(:disabled) { background: linear-gradient(135deg, #0891b2, #0e7490); box-shadow: 0 6px 20px rgba(6,182,212,0.35); transform: translateY(-1px); }
  .notif-send-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  .notif-option-btn {
    width: 100%; display: flex; align-items: center; gap: 10;
    padding: 11px 14px; border-radius: 10px; margin-bottom: 6px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    cursor: pointer; text-align: left; transition: all 0.2s ease; font-family: 'Outfit', sans-serif;
  }
  .notif-option-btn:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); }
  .notif-option-active { background: rgba(6,182,212,0.08) !important; border-color: rgba(6,182,212,0.3) !important; }

  .notif-icon-btn {
    width: 34px; height: 34px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04); color: #a1a1aa; cursor: pointer; font-size: 14px;
    display: flex; align-items: center; justify-content: center; transition: all 0.15s ease;
    flex-shrink: 0;
  }
  .notif-icon-btn:hover { background: rgba(255,255,255,0.08); color: #f4f4f5; }
  .notif-delete-btn:hover { background: rgba(239,68,68,0.1) !important; border-color: rgba(239,68,68,0.3) !important; color: #ef4444 !important; }

  .notif-refresh-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 700;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    color: #a1a1aa; cursor: pointer; font-family: 'Outfit', sans-serif;
    transition: all 0.15s ease;
  }
  .notif-refresh-btn:hover { background: rgba(255,255,255,0.08); color: #e4e4e7; }
  .notif-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .notif-empty {
    text-align: center; padding: 64px 24px;
    background: rgba(255,255,255,0.02); border-radius: 14px;
    border: 1px dashed rgba(255,255,255,0.08);
  }

  @media (max-width: 768px) {
    .notif-tab span:last-child { display: none; }
  }
`;
