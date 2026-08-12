import { apiFetch } from "../api";

export async function getMessages() {
  return apiFetch("/admin/api/messages");
}

export async function deleteMessage(id: number) {
  return apiFetch(`/admin/api/messages/${id}`, {
    method: "DELETE",
  });
}
