const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getLeads: (token) =>
    request("/leads", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }),
  createLead: (payload) => request("/leads", { method: "POST", body: JSON.stringify(payload) }),
};
