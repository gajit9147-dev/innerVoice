import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Welcome to your profile!",
    user: req.user,
  });
});

export default router;