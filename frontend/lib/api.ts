export function getFallbackApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    if (typeof window !== "undefined" && window.location?.hostname) {
      const hostname = window.location.hostname;
      if (hostname !== "localhost" && hostname !== "127.0.0.1") {
        return process.env.NEXT_PUBLIC_API_URL.replace(/localhost|127\.0\.0\.1/g, hostname);
      }
    }
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== "undefined" && window.location?.hostname) {
    const hostname = window.location.hostname;
    return `http://${hostname}:5000`;
  }

  return "http://localhost:5000";
}

const API_URL = getFallbackApiUrl();

export function normalizeImageUrl(url?: string | null): string {
  if (!url) return '';

  let normalized = url;

  // Replace hardcoded localhost:5000 or 127.0.0.1:5000 with active API URL hostname when accessed on mobile/LAN IP
  if (normalized.includes('localhost:5000') || normalized.includes('127.0.0.1:5000')) {
    const activeApiUrl = getFallbackApiUrl();
    normalized = normalized.replace(/http:\/\/(localhost|127\.0\.0\.1):5000/g, activeApiUrl);
  }

  if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('data:')) {
    return normalized;
  }

  const activeApiUrl = getFallbackApiUrl();
  const cleanPath = normalized.startsWith('/') ? normalized : '/' + normalized;
  return `${activeApiUrl}${cleanPath}`;
}

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
  const activeApiUrl = getFallbackApiUrl();

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

  const response = await fetch(`${activeApiUrl}${endpoint}`, {
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