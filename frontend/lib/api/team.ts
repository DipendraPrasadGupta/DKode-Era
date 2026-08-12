import { apiFetch } from "../api";

export async function getTeam() {
  return apiFetch("/api/team");
}

export async function getAdminTeam() {
  return apiFetch("/admin/api/team");
}

export async function createTeamMember(data: unknown) {
  return apiFetch("/admin/api/team", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTeamMember(id: number, data: unknown) {
  return apiFetch(`/admin/api/team/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTeamMember(id: number) {
  return apiFetch(`/admin/api/team/${id}`, {
    method: "DELETE",
  });
}
