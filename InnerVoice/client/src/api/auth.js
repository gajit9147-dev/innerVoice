import API from "./axios";

export const signupUser = (userData) => {
  return API.post("/auth/signup", userData);
};

export const loginUser = (userData) => {
  return API.post("/auth/login", userData);
};
