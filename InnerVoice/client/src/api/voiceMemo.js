import API from "./axios";

// Get all voice memos for authenticated user
export const getVoiceMemos = () => API.get("/voice-memos");

// Upload new voice memo (multipart/form-data)
export const uploadVoiceMemo = (formData) =>
  API.post("/voice-memos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Get single voice memo by ID
export const getVoiceMemo = (id) => API.get(`/voice-memos/${id}`);

// Update voice memo (e.g. rename title or notebook)
export const updateVoiceMemo = (id, data) =>
  API.patch(`/voice-memos/${id}`, data);

// Delete voice memo permanently
export const deleteVoiceMemo = (id) =>
  API.delete(`/voice-memos/${id}`);
