import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  summarizeNote,
  detectMoodFromNote,
  generateTitleFromNote,
  detectCategoryFromNote,
  generateTagsFromNote,
  analyzeNote,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/summarize", authMiddleware, summarizeNote);

router.post("/mood", authMiddleware, detectMoodFromNote);

router.post("/title", authMiddleware, generateTitleFromNote);

router.post("/category", authMiddleware, detectCategoryFromNote);

router.post("/tags", authMiddleware, generateTagsFromNote);

router.post("/analyze/:noteId", authMiddleware, analyzeNote);

export default router;