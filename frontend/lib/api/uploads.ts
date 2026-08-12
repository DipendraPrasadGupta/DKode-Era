import { apiFetch } from "../api";

export async function uploadAdminFile(formData: FormData) {
  return apiFetch("/admin/api/upload", {
    method: "POST",
    body: formData,
  });
}
