import API from "./axios";

export const getAllUsers = () => API.get("/admin/users");
export const deleteUserByAdmin = (id) => API.delete(`/admin/users/${id}`);
