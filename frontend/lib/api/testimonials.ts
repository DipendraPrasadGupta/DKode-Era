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

export async function submitTestimonial(data: {
  name: string;
  email?: string;
  company?: string;
  position?: string;
  biz?: string;
  quote: string;
  stars?: number;
  icon?: string;
}) {
  return apiFetch("/api/testimonials", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteTestimonial(id: number) {
  return apiFetch(`/admin/api/testimonials/${id}`, {
    method: "DELETE",
  });
}

export async function updateTestimonialStatus(id: number, data: { status?: string; featured?: boolean }) {
  return apiFetch(`/admin/api/testimonials/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

