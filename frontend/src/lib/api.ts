import { auth } from "./firebase";

const getApiBaseUrl = (): string => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "");
    }
  } catch (e) {}
  try {
    if (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) {
      return process.env.REACT_APP_API_BASE_URL.replace(/\/+$/, "");
    }
  } catch (e) {}
  return "http://localhost:8080";
};

export const API_BASE_URL = getApiBaseUrl();

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    } catch (e) {
      console.warn("Could not get Firebase ID token:", e);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = `API request failed (${response.status})`;
    try {
      const errJson = await response.json();
      detail = errJson.detail || detail;
    } catch {
      detail = await response.text() || detail;
    }
    throw new Error(detail);
  }

  return response.json();
}

export const api = {
  getHealth: () => apiRequest<{ status: string; service: string }>("/health"),
  getCurrentUser: () => apiRequest<any>("/api/me"),
  getAdminOverview: () => apiRequest<any>("/api/admin/overview"),
  getOfficerAnalysis: () => apiRequest<any>("/api/officer/analysis"),
  getWetlands: () => apiRequest<any[]>("/api/wetlands"),
  submitReport: (report: any) => apiRequest<any>("/api/reports", { method: "POST", body: JSON.stringify(report) }),
  getAuditLogs: () => apiRequest<any>("/api/audit-logs"),
};

export default api;
