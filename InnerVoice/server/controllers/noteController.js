import pool from "../config/db.js";

// Create Note
export const createNote = async (req, res) => {
  try {
    const { title, content, category, feeling } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO notes (user_id, title, content, category, feeling)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, title, content, category || "General", feeling || "Neutral"]
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

// Search Notes
export const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;

    if (!q || q.trim() === "") {
      return res.status(200).json({
        success: true,
        notes: [],
      });
    }

    const search = `%${q}%`;

    const [notes] = await pool.query(
      `SELECT *
       FROM notes
       WHERE user_id = ?
       AND (title LIKE ? OR content LIKE ?)
       ORDER BY updated_at DESC`,
      [userId, search, search]
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

// Get Single Note
export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [notes] = await pool.query(
      "SELECT * FROM notes WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (notes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      note: notes[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update Note
export const updateNote = async (req, res) => {
  try {
    const { title, content, category, feeling } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await pool.query(
      `UPDATE notes
       SET title = ?, content = ?, category = ?, feeling = ?
       WHERE id = ? AND user_id = ?`,
      [title, content, category || "General", feeling || "Neutral", id, userId]
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

// Toggle Pin Note

export const togglePinNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log("ID:", id);
    console.log("User ID:", userId);

    const [rows] = await pool.query(
      "SELECT * FROM notes WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    console.log("Rows:", rows);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    const current = Number(rows[0].is_pinned);
    const newValue = current === 1 ? 0 : 1;

    console.log("Current:", current);
    console.log("New Value:", newValue);

    const [result] = await pool.query(
      "UPDATE notes SET is_pinned = ? WHERE id = ? AND user_id = ?",
      [newValue, id, userId]
    );

    console.log("Affected Rows:", result.affectedRows);

    res.json({
      success: true,
      pinned: Boolean(newValue),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// Toggle Favorite Note
export const toggleFavoriteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query(
      "SELECT is_favorite FROM notes WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    const current = Number(rows[0].is_favorite);
    const newValue = current === 1 ? 0 : 1;

    await pool.query(
      "UPDATE notes SET is_favorite = ? WHERE id = ? AND user_id = ?",
      [newValue, id, userId]
    );

    res.json({
      success: true,
      favorite: Boolean(newValue),
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};