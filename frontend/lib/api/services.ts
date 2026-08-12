import { apiFetch } from "../api";

export async function getServices() {
  return apiFetch("/api/services");
}

export async function getServiceBySlug(slug: string) {
  return apiFetch(`/api/services/${slug}`);
}

export async function getAdminServices() {
  return apiFetch("/admin/api/services");
}

export async function createService(data: unknown) {
  return apiFetch("/admin/api/services", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateService(id: number, data: unknown) {
  return apiFetch(`/admin/api/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteService(id: number) {
  return apiFetch(`/admin/api/services/${id}`, {
    method: "DELETE",
  });
}