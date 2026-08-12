import { apiFetch } from "../api";

export async function getProducts() {
  return apiFetch("/api/products");
}

export async function getAdminProducts() {
  return apiFetch("/admin/api/products");
}

export async function createProduct(data: unknown) {
  return apiFetch("/admin/api/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: number, data: unknown) {
  return apiFetch(`/admin/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: number) {
  return apiFetch(`/admin/api/products/${id}`, {
    method: "DELETE",
  });
}
