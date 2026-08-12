import { apiFetch } from "../api";

export async function getPortfolio() {
  return apiFetch("/api/portfolio");
}
