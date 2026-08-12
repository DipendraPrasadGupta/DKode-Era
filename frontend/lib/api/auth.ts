import { apiFetch } from "../api";

export async function getCurrentUser() {
  return apiFetch("/admin/api/auth/me");
}

export async function login(email: string, password: string) {
  return apiFetch("/admin/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}