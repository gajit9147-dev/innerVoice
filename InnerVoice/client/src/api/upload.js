import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const uploadProfileImage = (formData) => {
  return API.post("/auth/upload-profile", formData);
};
