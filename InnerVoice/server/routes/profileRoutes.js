import express from "express";

import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/profileController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);
router.put("/password", authMiddleware, changePassword);


export default router;