import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { summarizeNote } from "../controllers/aiController.js";

const router = express.Router();

router.post("/summarize", authMiddleware, summarizeNote);

export default router;