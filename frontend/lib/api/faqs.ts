import { apiFetch } from "../api";

export async function getFaqs() {
  return apiFetch("/api/faqs");
}

export async function getAdminFaqs() {
  return apiFetch("/admin/api/faqs");
}

export async function createFaq(data: unknown) {
  return apiFetch("/admin/api/faqs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFaq(id: number, data: unknown) {
  return apiFetch(`/admin/api/faqs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteFaq(id: number) {
  return apiFetch(`/admin/api/faqs/${id}`, {
    method: "DELETE",
  });
}
