import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Get all notes
export const getNotes = () => API.get("/notes");

// Create note
export const createNote = (data) => API.post("/notes", data);

// Update note
export const updateNote = (id, data) =>
  API.put(`/notes/${id}`, data);

// Delete note
export const deleteNote = (id) =>
  API.delete(`/notes/${id}`);

// Get single note
export const getNote = (id) =>
  API.get(`/notes/${id}`);