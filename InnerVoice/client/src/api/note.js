import axios from "./axios";

export const getNotes = () => axios.get("/notes");

export const createNote = (data) => axios.post("/notes", data);

export const updateNote = (id, data) =>
  axios.put(`/notes/${id}`, data);

export const deleteNote = (id) =>
  axios.delete(`/notes/${id}`);