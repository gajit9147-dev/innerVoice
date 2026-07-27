import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

import {
  signup,
  login,
  uploadProfileImage,
  getProfile,
  updateProfile,
  setVaultPin,
  verifyVaultPin,
} from "../controllers/authController.js";

const router = express.Router();

// =========================
// AUTH ROUTES
// =========================
router.post("/signup", signup);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ajeet@example.com
 *               password:
 *                 type: string
 *                 example: MyPassword123
 *     responses:
 *       200:
 *         description: Login successful.
 *       401:
 *         description: Invalid credentials.
 */
router.post("/login", login);

// =========================
// PROFILE
// =========================
router.get("/profile", authMiddleware, getProfile);

router.put("/profile", authMiddleware, updateProfile);



// =========================
// VAULT PIN
// =========================
router.put("/set-vault-pin", authMiddleware, setVaultPin);

router.post("/verify-vault-pin", authMiddleware, verifyVaultPin);


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