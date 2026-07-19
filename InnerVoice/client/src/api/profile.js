import API from "./axios";

export const getProfileInfo = () => API.get("/profile");
export const updateProfileInfo = (data) => API.put("/profile", data);
export const deleteAccount = () => API.delete("/profile");
