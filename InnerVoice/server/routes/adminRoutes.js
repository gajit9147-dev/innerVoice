import express from "express";
import { getAllUsers, deleteUser } from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.route("/users")
  .get(authMiddleware, adminMiddleware, getAllUsers);

router.route("/users/:id")
  .delete(authMiddleware, adminMiddleware, deleteUser);

export default router;
