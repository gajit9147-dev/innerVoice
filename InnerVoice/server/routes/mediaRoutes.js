// ============================================================
// server/routes/mediaRoutes.js
// Production API routes for Memory Music & Photo Attachments
// ============================================================

import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  uploadMedia,
  importAudioUrl,
  getNoteMedia,
  getMusicLibrary,
  updateMedia,
  toggleFavoriteMedia,
  deleteMedia,
} from "../controllers/mediaController.js";

const router = express.Router();

// 25MB in-memory buffer limit for audio and photos
const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

// Upload media file (music or photo)
router.post(
  "/",
  authMiddleware,
  mediaUpload.single("file"),
  uploadMedia
);

// Import direct audio resource with SSRF protection
router.post(
  "/import-audio",
  authMiddleware,
  importAudioUrl
);

// Get all media attached to a note
router.get(
  "/note/:noteId",
  authMiddleware,
  getNoteMedia
);

// Global user music library
router.get(
  "/music-library",
  authMiddleware,
  getMusicLibrary
);

// Update media metadata
router.patch(
  "/:id",
  authMiddleware,
  updateMedia
);

// Toggle favorite status
router.post(
  "/:id/favorite",
  authMiddleware,
  toggleFavoriteMedia
);

// Delete media
router.delete(
  "/:id",
  authMiddleware,
  deleteMedia
);

export default router;
