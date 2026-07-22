import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

export const signupUser = (userData) => API.post("/auth/signup", userData);

export const loginUser = (userData) => API.post("/auth/login", userData);
export const setVaultPin = (pin) =>
  API.put("/auth/set-vault-pin", { pin });

export const verifyVaultPin = (pin) =>
  API.post("/auth/verify-vault-pin", { pin });