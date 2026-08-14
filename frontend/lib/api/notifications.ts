// lib/api/notifications.ts
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : ''}`,
});

export interface Subscriber {
  id: number;
  email: string;
  name: string;
  source: string;
  active: boolean;
  createdAt: string;
}

export interface NotificationRecipient {
  id: number;
  email: string;
  name: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt: string | null;
}

export interface Notification {
  id: number;
  subject: string;
  body: string;
  channel: string;
  targetType: string;
  sentBy: string;
  status: string;
  createdAt: string;
  recipients: NotificationRecipient[];
}

// ── Subscribers ────────────────────────────────────────────────────────────────
export async function getSubscribers(): Promise<Subscriber[]> {
  const res = await fetch(`${BASE}/admin/api/subscribers`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch subscribers');
  return res.json();
}

export async function addSubscriber(email: string, name: string): Promise<Subscriber> {
  const res = await fetch(`${BASE}/admin/api/subscribers`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, name, source: 'manual' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add subscriber');
  }
  return res.json();
}

export async function toggleSubscriberActive(id: number, active: boolean): Promise<Subscriber> {
  const res = await fetch(`${BASE}/admin/api/subscribers/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ active }),
  });
  if (!res.ok) throw new Error('Failed to update subscriber');
  return res.json();
}

export async function deleteSubscriber(id: number): Promise<void> {
  const res = await fetch(`${BASE}/admin/api/subscribers/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete subscriber');
}

// ── Notifications ──────────────────────────────────────────────────────────────
export async function getNotifications(): Promise<Notification[]> {
  const res = await fetch(`${BASE}/admin/api/notifications`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function sendNotification(payload: {
  subject: string;
  body: string;
  channel: string;
  targetType: string;
  recipientEmails?: string[];
}): Promise<{ notification: Notification; summary: { total: number; sent: number; failed: number } }> {
  const res = await fetch(`${BASE}/admin/api/notifications/send`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send notification');
  }
  return res.json();
}

export async function deleteNotification(id: number): Promise<void> {
  const res = await fetch(`${BASE}/admin/api/notifications/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete notification');
}
