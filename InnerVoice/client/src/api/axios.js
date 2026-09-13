import axios from "axios";

const getBaseURL = () => {
  // If running in browser on localhost or 127.0.0.1, use local backend port 5000
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") {
      return "http://localhost:5000/api";
    }
  }

  const envUrl = import.meta.env.VITE_API_URL || "https://api.innervoice4u.in";
  const clean = envUrl.trim().replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Resilient fallback interceptor:
// If a request fails due to Network Error (e.g. remote down, CORS issue, or DNS lookup failure),
// and we are running in a local environment, automatically retry against the local backend.
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      !error.response &&
      originalRequest &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      originalRequest._retry = true;
      const isLocalHost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      if (!originalRequest.baseURL?.includes("5000") && isLocalHost) {
        originalRequest.baseURL = "http://localhost:5000/api";
        return API(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default API;