import axios from "axios";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8001").replace(/\/$/, "");
export const API = `${BACKEND_URL}/api`;

const TOKEN_KEY = "che_token";
const USER_KEY = "che_user";

export const authStore = {
  get token() {
    return localStorage.getItem(TOKEN_KEY);
  },
  get user() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  save({ token, user }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = authStore.token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      authStore.clear();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export async function login(username, password) {
  const { data } = await api.post("/auth/login", { username, password });
  authStore.save({ token: data.token, user: data.user });
  return data;
}

export async function fetchBranches(q = "") {
  const { data } = await api.get("/branches", { params: q ? { q } : {} });
  return data;
}

export async function fetchBranch(id) {
  const { data } = await api.get(`/branches/${id}`);
  return data.branch;
}
