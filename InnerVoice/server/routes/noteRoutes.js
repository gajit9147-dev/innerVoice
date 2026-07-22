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
} from "../controllers/noteController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createNote);

router.get("/", authMiddleware, getNotes);

router.get("/search", authMiddleware, searchNotes);

router.put("/pin/:id", authMiddleware, togglePinNote);

router.put("/favorite/:id", authMiddleware, toggleFavoriteNote);


router.put("/lock/:id", authMiddleware, toggleLockNote);

router.post(
  "/:id/set-password",
  authMiddleware,
  setNotePassword
);

router.post(
  "/:id/verify-password",
  authMiddleware,
  verifyNotePassword
);

router.delete(
  "/:id/password",
  authMiddleware,
  deleteNotePassword
);

router.get("/:id", authMiddleware, getNoteById);

router.put("/:id", authMiddleware, updateNote);

router.delete("/:id", authMiddleware, deleteNote);




export default router;