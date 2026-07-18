import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
});

export const signupUser = (userData) => API.post("/auth/signup", userData);

export const loginUser = (userData) => API.post("/auth/login", userData);
