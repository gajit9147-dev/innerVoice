import API from "./axios";

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

// Search notes
export const searchNotes = (query) =>
  API.get(`/notes/search?q=${encodeURIComponent(query)}`);

// Toggle Pin note
export const togglePinNote = (id) =>
  API.put(`/notes/pin/${id}`);
// Toggle Favorite note
export const toggleFavoriteNote = (id) =>
  API.put(`/notes/favorite/${id}`);

export const toggleLockNote = (id) =>
  API.put(`/notes/lock/${id}`);

export const setNotePassword = (id, data) =>
  API.post(`/notes/${id}/set-password`, data);

export const verifyNotePassword = (id, password) =>
  API.post(`/notes/${id}/verify-password`, { password });

export const deleteNotePassword = (id, password) =>
  API.delete(`/notes/${id}/password`, { data: { password } });

export const changeNotePassword = (id, data) =>
  API.put(`/notes/${id}/change-password`, data);