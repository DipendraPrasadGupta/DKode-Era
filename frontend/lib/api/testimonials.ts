import { apiFetch } from "../api";

export async function getTestimonials() {
  return apiFetch("/api/testimonials");
}

export async function getAdminTestimonials() {
  return apiFetch("/admin/api/testimonials");
}

export async function createTestimonial(data: unknown) {
  return apiFetch("/admin/api/testimonials", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTestimonial(id: number, data: unknown) {
  return apiFetch(`/admin/api/testimonials/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTestimonial(id: number) {
  return apiFetch(`/admin/api/testimonials/${id}`, {
    method: "DELETE",
  });
}
