import API from "./axios";

export const uploadProfileImage = (formData) => {
  return API.post("/auth/upload-profile", formData);
};
