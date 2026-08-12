import { apiFetch } from "../api";

export async function getStats() {
  return apiFetch("/admin/api/stats");
}
