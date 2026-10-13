/**
 * IoT Projects Store — API-backed
 * All data now lives in the backend database.
 * localStorage is no longer used for IoT projects.
 */

import { IoTProject } from './iotData';

export const IOT_CHANGE_EVENT = 'dkode_iot_projects_updated';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Auth helper (admin only) ─────────────────────────────────────────────────
function authHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

// ── Dispatch change event so components re-render ────────────────────────────
function notifyChange(projects: IoTProject[]) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(IOT_CHANGE_EVENT, { detail: projects }));
  }
}

// ── PUBLIC: fetch all published IoT projects ─────────────────────────────────
export async function fetchIotProjects(): Promise<IoTProject[]> {
  const res = await fetch(`${API_BASE}/api/iot-projects`);
  if (!res.ok) throw new Error('Failed to fetch IoT projects');
  return res.json();
}

// ── ADMIN: fetch all IoT projects (including unpublished) ────────────────────
export async function fetchIotProjectsAdmin(): Promise<IoTProject[]> {
  const res = await fetch(`${API_BASE}/admin/api/iot-projects`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch IoT projects');
  return res.json();
}

// ── ADMIN: create a new IoT project ─────────────────────────────────────────
export async function addStoredProject(
  projectData: Omit<IoTProject, 'id'> & { id?: number }
): Promise<IoTProject> {
  const res = await fetch(`${API_BASE}/admin/api/iot-projects`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(projectData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create IoT project');
  }
  const created: IoTProject = await res.json();
  // Refresh all and notify
  const all = await fetchIotProjectsAdmin().catch(() => []);
  notifyChange(all);
  return created;
}

// ── ADMIN: update an existing IoT project ───────────────────────────────────
export async function updateStoredProject(project: IoTProject): Promise<boolean> {
  const res = await fetch(`${API_BASE}/admin/api/iot-projects/${project.id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(project),
  });
  if (!res.ok) return false;
  const all = await fetchIotProjectsAdmin().catch(() => []);
  notifyChange(all);
  return true;
}

// ── ADMIN: delete an IoT project ─────────────────────────────────────────────
export async function deleteStoredProject(id: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/admin/api/iot-projects/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) return false;
  const all = await fetchIotProjectsAdmin().catch(() => []);
  notifyChange(all);
  return true;
}

// ── Legacy sync shim — kept for backward compatibility ───────────────────────
// Components that called getStoredProjects() synchronously now get an empty
// array on first render; the async fetchIotProjects* calls will fill data.
export function getStoredProjects(): IoTProject[] {
  return [];
}

// ── resetStoredProjects is no longer applicable (no localStorage seed) ───────
export function resetStoredProjects(): IoTProject[] {
  return [];
}

// ── saveProjects is no longer used (API handles persistence) ─────────────────
export function saveProjects(_projects: IoTProject[]): void {
  // no-op: data is persisted in the backend database
}

export const IOT_STORAGE_KEY = 'dkode_iot_projects_v2'; // kept for compat
