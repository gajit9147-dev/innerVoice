import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  uploadVoiceMemo,
  getVoiceMemos,
  getVoiceMemoById,
  updateVoiceMemo,
  deleteVoiceMemo,
} from "../controllers/voiceMemoController.js";

const router = express.Router();

// Configure multer with memory storage and 25MB limit
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB maximum upload
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("audio/") ||
      file.mimetype.includes("video/webm") ||
      file.mimetype.includes("audio/webm") ||
      file.mimetype.includes("audio/ogg") ||
      file.mimetype.includes("audio/mp4") ||
      file.mimetype.includes("audio/aac")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only audio recordings are permitted for voice memos."), false);
    }
  },
});

// Voice Memo CRUD Endpoints
router.post("/", authMiddleware, upload.single("audio"), uploadVoiceMemo);
router.get("/", authMiddleware, getVoiceMemos);
router.get("/:id", authMiddleware, getVoiceMemoById);
router.patch("/:id", authMiddleware, updateVoiceMemo);
router.delete("/:id", authMiddleware, deleteVoiceMemo);

export default router;
