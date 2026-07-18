import express from "express";
import { listMoods } from "../controllers/moodController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, listMoods);

export default router;