import { IOT_PROJECTS, IoTProject } from './iotData';

export const IOT_STORAGE_KEY = 'dkode_iot_projects_v2';
export const IOT_CHANGE_EVENT = 'dkode_iot_projects_updated';

/**
 * Retrieve all IoT projects: checks localStorage first, falls back to default 30 curated projects.
 */
export function getStoredProjects(): IoTProject[] {
  if (typeof window === 'undefined') {
    return IOT_PROJECTS;
  }

  try {
    const raw = localStorage.getItem(IOT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse IoT projects from localStorage, falling back to default:', err);
  }

  return IOT_PROJECTS;
}

/**
 * Persist the entire IoT projects list and notify all open tabs/components.
 */
export function saveProjects(projects: IoTProject[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(IOT_STORAGE_KEY, JSON.stringify(projects));
    // Dispatch local custom event for current window
    window.dispatchEvent(new CustomEvent(IOT_CHANGE_EVENT, { detail: projects }));
  } catch (err) {
    console.error('Failed to save IoT projects to localStorage:', err);
  }
}

/**
 * Add a new IoT Project
 */
export function addStoredProject(
  projectData: Omit<IoTProject, 'id'> & { id?: number }
): IoTProject {
  const current = getStoredProjects();
  const maxId = current.reduce((max, p) => (p.id > max ? p.id : max), 0);
  const newId = projectData.id && projectData.id > maxId ? projectData.id : maxId + 1;

  // Ensure slug uniqueness
  let baseSlug = projectData.slug || projectData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!baseSlug) baseSlug = `project-${newId}`;
  let slug = baseSlug;
  let counter = 1;
  while (current.some((p) => p.slug === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const newProject: IoTProject = {
    ...projectData,
    id: newId,
    slug,
  };

  const updated = [newProject, ...current];
  saveProjects(updated);
  return newProject;
}

/**
 * Update an existing IoT Project by id
 */
export function updateStoredProject(updatedProject: IoTProject): boolean {
  const current = getStoredProjects();
  const index = current.findIndex((p) => p.id === updatedProject.id);
  if (index === -1) return false;

  const next = [...current];
  next[index] = { ...updatedProject };
  saveProjects(next);
  return true;
}

/**
 * Delete an IoT Project by id
 */
export function deleteStoredProject(id: number): boolean {
  const current = getStoredProjects();
  const next = current.filter((p) => p.id !== id);
  if (next.length === current.length) return false;

  saveProjects(next);
  return true;
}

/**
 * Reset back to the pristine 30 projects from iotData.ts
 */
export function resetStoredProjects(): IoTProject[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(IOT_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(IOT_CHANGE_EVENT, { detail: IOT_PROJECTS }));
  }
  return IOT_PROJECTS;
}
