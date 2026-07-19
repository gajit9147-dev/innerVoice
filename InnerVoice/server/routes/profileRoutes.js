import express from "express";
import { getProfile, updateProfile, deleteAccount } from "../controllers/profileController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(authMiddleware, getProfile)
  .put(authMiddleware, updateProfile)
  .delete(authMiddleware, deleteAccount);

export default router;
