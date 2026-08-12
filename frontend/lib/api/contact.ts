import { apiFetch } from "../api";

export async function submitContact(data: unknown) {
  return apiFetch("/api/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
