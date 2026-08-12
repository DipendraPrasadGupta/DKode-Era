import { apiFetch } from "../api";

export async function getApplications() {
  return apiFetch("/admin/api/applications");
}

export async function updateApplicationStatus(id: number, status: string) {
  return apiFetch(`/admin/api/applications/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function deleteApplication(id: number) {
  return apiFetch(`/admin/api/applications/${id}`, {
    method: "DELETE",
  });
}
