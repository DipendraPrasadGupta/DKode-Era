const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getStoredToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token")
  );
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = getStoredToken();

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = new Headers(options.headers || {});

  if (
    !isFormData &&
    !headers.has("Content-Type") &&
    !headers.has("content-type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (
    token &&
    !headers.has("Authorization") &&
    !headers.has("authorization")
  ) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      errorText || `API Error: ${response.status}`
    );
  }

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export { API_URL };