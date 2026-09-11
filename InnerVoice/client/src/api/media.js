// ============================================================
// client/src/api/media.js
// Production Media API Client (Memory Music & Photos)
// ============================================================

import API from "./axios";

// Upload audio or photo file
export const uploadMediaFile = (formData) => {
  return API.post("/media", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Import direct audio resource with SSRF protection
export const importAudioResource = (payload) => {
  return API.post("/media/import-audio", payload);
};

// Get all media attached to a note
export const getNoteMedia = (noteId) => {
  return API.get(`/media/note/${noteId}`);
};

// Global music library
export const getMusicLibrary = () => {
  return API.get("/media/music-library");
};

// Update media metadata (title, artist, album)
export const updateMediaMetadata = (id, data) => {
  return API.patch(`/media/${id}`, data);
};

// Toggle favorite status
export const toggleFavoriteMedia = (id) => {
  return API.post(`/media/${id}/favorite`);
};

// Delete media item
export const deleteMediaItem = (id) => {
  return API.delete(`/media/${id}`);
};
