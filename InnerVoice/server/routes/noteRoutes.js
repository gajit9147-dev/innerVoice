import express from "express";
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  searchNotes,
  togglePinNote,
  toggleFavoriteNote,
  toggleLockNote,
  setNotePassword,
  verifyNotePassword,
  deleteNotePassword,
  changeNotePassword,
  resetNotePassword,
  moveToTrash,
  getTrashNotes,
  restoreNote,
  deleteForever,
  getDashboardStats,
  getMoodStats,
  getCategoryStats,
  getWeeklyStats,
} from "../controllers/noteController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "noteRoutes.js is loaded",
  });
});

// ==========================
// Notes
// ==========================
router.post("/", authMiddleware, createNote);
router.get("/", authMiddleware, getNotes);
router.get("/search", authMiddleware, searchNotes);
router.get("/trash", authMiddleware, getTrashNotes);
router.get("/stats", authMiddleware, getDashboardStats);
router.get("/mood-stats", authMiddleware, getMoodStats);
router.get("/category-stats", authMiddleware, getCategoryStats);
router.get("/weekly-stats", authMiddleware, getWeeklyStats);

// ==========================
// Trash
// ==========================
router.patch("/:id/trash", authMiddleware, moveToTrash);
router.patch("/:id/restore", authMiddleware, restoreNote);
router.delete("/:id/permanent", authMiddleware, deleteForever);

// ==========================
// Pin / Favorite / Lock
// ==========================
router.patch("/:id/pin", authMiddleware, togglePinNote);
router.patch("/:id/favorite", authMiddleware, toggleFavoriteNote);
router.patch("/:id/lock", authMiddleware, toggleLockNote);

// ==========================
// Password Protection
// ==========================
router.post("/:id/set-password", authMiddleware, setNotePassword);
router.post("/:id/verify-password", authMiddleware, verifyNotePassword);
router.delete("/:id/password", authMiddleware, deleteNotePassword);
router.put("/:id/change-password", authMiddleware, changeNotePassword);
router.post("/:id/reset-password", authMiddleware, resetNotePassword);

// ==========================
// CRUD
// ==========================
router.get("/:id", authMiddleware, getNoteById);
router.put("/:id", authMiddleware, updateNote);
router.delete("/:id", authMiddleware, deleteNote);

export default router;