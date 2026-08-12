import { apiFetch } from "../api";

export async function getJobs() {
  return apiFetch("/api/careers");
}

export async function getCareers() {
  return getJobs();
}

export async function getCareerById(id: string) {
  return apiFetch(`/api/careers/${id}`);
}

export async function uploadCv(formData: FormData) {
  return apiFetch("/api/cv-upload", {
    method: "POST",
    body: formData,
  });
}

export async function applyCareer(payload: unknown) {
  return apiFetch("/api/apply", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createCareer(data: unknown) {
  return apiFetch("/admin/api/careers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCareer(id: number, data: unknown) {
  return apiFetch(`/admin/api/careers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCareer(id: number) {
  return apiFetch(`/admin/api/careers/${id}`, {
    method: "DELETE",
  });
}