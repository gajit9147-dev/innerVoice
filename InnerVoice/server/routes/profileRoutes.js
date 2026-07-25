import express from "express";

import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/profileController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);
router.put("/password", authMiddleware, changePassword);
router.delete("/", authMiddleware, deleteAccount);


export default router;