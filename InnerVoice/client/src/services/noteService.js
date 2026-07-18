import api from "./api";

export const noteService = {
  list: () => api.get("/notes"),
  create: (payload) => api.post("/notes", payload),
  update: (id, payload) => api.put(`/notes/${id}`, payload),
  remove: (id) => api.delete(`/notes/${id}`)
};