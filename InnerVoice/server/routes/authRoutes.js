// ============================================================
// server/routes/authRoutes.js
// Production Authentication and Profile API Routes
// ============================================================

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

import {
  register,
  signup,
  login,
  googleAuth,
  appleAuth,
  linkAccount,
  getCurrentUser,
  logout,
  uploadProfileImage,
  getProfile,
  updateProfile,
  setVaultPin,
  verifyVaultPin,
} from "../controllers/authController.js";

const router = express.Router();

// =========================
// AUTHENTICATION ROUTES
// =========================

// Email + Password Registration
router.post("/register", register);
router.post("/signup", signup); // Backwards compatibility

// Email + Password Login
router.post("/login", login);

// Official Google Identity Services OAuth
router.post("/google", googleAuth);

// Official Sign in with Apple OAuth
router.post("/apple", appleAuth);

// Secure Account Linking
router.post("/link-account", linkAccount);

// Session State & Logout
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", logout);

// Database Migration Trigger
router.get("/run-migration", async (req, res) => {
  try {
    const { runAuthMigration } = await import("../migrations/auth_migration.js");
    await runAuthMigration();
    return res.json({ success: true, message: "Auth database migration completed successfully!" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================
// PROFILE ROUTES
// =========================
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post(
  "/upload-profile",
  authMiddleware,
  upload.single("image"),
  uploadProfileImage
);

// =========================
// VAULT PIN ROUTES
// =========================
router.put("/set-vault-pin", authMiddleware, setVaultPin);
router.post("/verify-vault-pin", authMiddleware, verifyVaultPin);

export default router;