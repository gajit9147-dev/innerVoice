import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

import {
  signup,
  login,
  uploadProfileImage,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";

const router = express.Router();

// =========================
// AUTH ROUTES
// =========================
router.post("/signup", signup);
router.post("/login", login);

// =========================
// PROFILE
// =========================
router.get("/profile", authMiddleware, getProfile);

router.put("/profile", authMiddleware, updateProfile);

// =========================
// UPLOAD PROFILE IMAGE
// =========================
router.post(
  "/upload-profile",
  authMiddleware,
  upload.single("image"),
  uploadProfileImage
);

export default router;