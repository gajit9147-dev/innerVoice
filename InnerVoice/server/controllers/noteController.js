import pool from "../config/db.js";

// Create Note
export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)",
      [userId, title, content]
    );

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      noteId: result.insertId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get All Notes
export const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;

    const [notes] = await pool.query(
      "SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.status(200).json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await pool.query(
      `UPDATE notes
       SET title = ?, content = ?
       WHERE id = ? AND user_id = ?`,
      [title, content, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.json({
      success: true,
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await pool.query(
      "DELETE FROM notes WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};