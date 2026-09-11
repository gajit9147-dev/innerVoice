// ============================================================
// client/src/api/auth.js
// Production Authentication API Client
// ============================================================

import API from "./axios";

// Email + Password
export const registerUser = (userData) => API.post("/auth/register", userData);
export const signupUser = registerUser; // Backwards compatibility
export const loginUser = (userData) => API.post("/auth/login", userData);

// Official OAuth
export const googleAuthUser = (data) => API.post("/auth/google", data);
export const appleAuthUser = (data) => API.post("/auth/apple", data);

// Account Linking
export const linkAccountUser = (data) => API.post("/auth/link-account", data);

// Session State & Current User
export const getMe = () => API.get("/auth/me");
export const logoutUser = () => API.post("/auth/logout");

// Vault PIN
export const setVaultPin = (pin) => API.put("/auth/set-vault-pin", { pin });
export const verifyVaultPin = (pin) => API.post("/auth/verify-vault-pin", { pin });