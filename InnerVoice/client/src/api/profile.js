import API from "./axios";

export const getProfileInfo = () => API.get("/profile");

export const updateProfileInfo = (data) =>
  API.put("/profile", data);

export const changePassword = (data) =>
  API.put("/profile/password", data);

export const deleteAccount = () => API.delete("/profile");