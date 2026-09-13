import axios from "axios";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Strictly in local development environment ONLY:
    const isLocalDev =
      !import.meta.env.PROD &&
      (host === "localhost" ||
        host === "127.0.0.1" ||
        host === "0.0.0.0" ||
        /^10\.\d+\.\d+\.\d+$/.test(host) ||
        /^192\.168\.\d+\.\d+$/.test(host) ||
        /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(host));

    if (isLocalDev) {
      return `http://${host}:5000/api`;
    }
  }

  // Production and deployed Cloudflare Pages environments ALWAYS use the production API domain
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

// Semantic error normalization interceptor:
// Ensures clean, informative user-facing messages instead of raw internal errors
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      if (
        error.code === "ECONNABORTED" ||
        error.message?.toLowerCase().includes("timeout")
      ) {
        error.userMessage =
          "Connection timed out. Please check your internet connection and try again.";
      } else if (typeof navigator !== "undefined" && !navigator.onLine) {
        error.userMessage =
          "You are currently offline. Please check your network connection.";
      } else {
        error.userMessage =
          "Unable to reach the server. Please check your connection or try again shortly.";
      }
    } else {
      error.userMessage =
        error.response.data?.message ||
        (error.response.status === 401
          ? "Invalid email or password."
          : error.response.status === 403
          ? "Access denied."
          : error.response.status >= 500
          ? "Server error. Please try again shortly."
          : "An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);


export default API;