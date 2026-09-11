// ============================================================
// server/utils/jwt.js
// Centralized JWT generation, verification, and user sanitization
// ============================================================

import jwt from "jsonwebtoken";

/**
 * Generate standard application session JWT
 * @param {Object} user - User record from database
 * @returns {string} Signed JWT token
 */
export const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured on the server.");
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || "user",
      auth_provider: user.auth_provider || "local",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

/**
 * Verify an application session JWT
 * @param {string} token
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Sanitize user object to never leak sensitive hashes or secrets to clients
 * @param {Object} user - Raw database user object
 * @returns {Object} Safe client-facing user object
 */
export const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    full_name: user.full_name || "",
    email: user.email,
    auth_provider: user.auth_provider || "local",
    role: user.role || "user",
    avatar_url: user.avatar_url || user.profile_image || user.avatar || null,
    profile_image: user.profile_image || user.avatar_url || null,
    email_verified: Boolean(user.email_verified),
    username: user.username || null,
    phone: user.phone || null,
    bio: user.bio || null,
    created_at: user.created_at,
    has_password: Boolean(user.password),
    has_google: Boolean(user.google_id),
    has_apple: Boolean(user.apple_id),
  };
};
