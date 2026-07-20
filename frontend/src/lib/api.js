import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "tc_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const api = axios.create({ baseURL });

// Attach the JWT bearer token (stored in localStorage) to every request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralised 401 handling — clear the session so the auth gate re-appears.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      window.dispatchEvent(new Event("tc-unauthorized"));
    }
    return Promise.reject(error);
  }
);

// Small helper to surface a readable message from an axios error.
export const errMsg = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.message || fallback;

export default api;
