import { apiFetch } from "../api";

export async function createOrder(data: unknown) {
  return apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getOrders() {
  return apiFetch("/admin/api/orders");
}

export async function updateOrder(id: number, data: unknown) {
  return apiFetch(`/admin/api/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteOrder(id: number) {
  return apiFetch(`/admin/api/orders/${id}`, {
    method: "DELETE",
  });
}
