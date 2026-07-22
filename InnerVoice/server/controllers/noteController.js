import pool from "../config/db.js";
import bcrypt from "bcryptjs";

// Create Note
export const createNote = async (req, res) => {
  try {
    const { title, content, category, feeling, is_locked } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const isLocked = is_locked ? 1 : 0;

    if (isLocked === 1) {
      const [userRows] = await pool.query(
        "SELECT vault_pin FROM users WHERE id = ?",
        [userId]
      );
      if (userRows.length === 0 || !userRows[0].vault_pin) {
        return res.status(400).json({
          success: false,
          message: "Vault PIN not set. Please set a Vault PIN first.",
          pinNotSet: true,
        });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO notes (user_id, title, content, category, feeling, is_locked)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, title, content, category || "General", feeling || "Neutral", isLocked]
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
    const { title, content, category, feeling, is_locked } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    let isLocked = is_locked !== undefined ? (is_locked ? 1 : 0) : null;

    if (isLocked === 1) {
      const [userRows] = await pool.query(
        "SELECT vault_pin FROM users WHERE id = ?",
        [userId]
      );
      if (userRows.length === 0 || !userRows[0].vault_pin) {
        return res.status(400).json({
          success: false,
          message: "Vault PIN not set. Please set a Vault PIN first.",
          pinNotSet: true,
        });
      }
    }

    const queryParams = [title, content, category || "General", feeling || "Neutral"];
    let sql = `UPDATE notes SET title = ?, content = ?, category = ?, feeling = ?`;

    if (isLocked !== null) {
      sql += `, is_locked = ?`;
      queryParams.push(isLocked);
    }

    sql += ` WHERE id = ? AND user_id = ?`;
    queryParams.push(id, userId);

    const [result] = await pool.query(sql, queryParams);

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

// Toggle Lock Note
export const toggleLockNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query(
      "SELECT is_locked FROM notes WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    const current = Number(rows[0].is_locked);
    const newValue = current === 1 ? 0 : 1;

    if (newValue === 1) {
      const [userRows] = await pool.query(
        "SELECT vault_pin FROM users WHERE id = ?",
        [userId]
      );
      if (userRows.length === 0 || !userRows[0].vault_pin) {
        return res.status(400).json({
          success: false,
          message: "Vault PIN not set. Please set a Vault PIN first.",
          pinNotSet: true,
        });
      }
    }

    await pool.query(
      "UPDATE notes SET is_locked = ? WHERE id = ? AND user_id = ?",
      [newValue, id, userId]
    );

    res.json({
      success: true,
      locked: Boolean(newValue),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// SET CUSTOM NOTE PASSWORD
// =========================
export const setNotePassword = async (req, res) => {
  try {
    console.log("Note ID:", req.params.id);
    console.log("req.user:", req.user);
    console.log("req.user.id:", req.user.id);

    const { id } = req.params;
    const { password, hint } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `UPDATE notes
       SET security_type = ?, note_password = ?, password_hint = ?
       WHERE id = ? AND user_id = ?`,
      [
        "password",
        hashedPassword,
        hint || null,
        id,
        req.user.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    return res.json({
      success: true,
      message: "Password added successfully.",
    });

  } catch (error) {
    console.error("Set Note Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// VERIFY CUSTOM NOTE PASSWORD
// =========================
export const verifyNotePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const [rows] = await pool.query(
      "SELECT note_password, security_type FROM notes WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    const note = rows[0];

    if (note.security_type !== "password" || !note.note_password) {
      return res.status(400).json({
        success: false,
        message: "This note is not locked with a custom password.",
      });
    }

    const isMatch = await bcrypt.compare(password, note.note_password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    // Unlock the note
    await pool.query(
      "UPDATE notes SET is_locked = 0 WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    return res.json({
      success: true,
      message: "Note unlocked successfully.",
    });
  } catch (error) {
    console.error("Verify Note Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// DELETE CUSTOM NOTE PASSWORD
// =========================
export const deleteNotePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const [rows] = await pool.query(
      "SELECT note_password, security_type FROM notes WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    const note = rows[0];

    if (note.security_type === "password" && note.note_password) {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required to remove protection.",
        });
      }

      const isMatch = await bcrypt.compare(password, note.note_password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password.",
        });
      }
    }

    // Clear security columns and unlock
    await pool.query(
      `UPDATE notes 
       SET security_type = NULL, note_password = NULL, password_hint = NULL, is_locked = 0 
       WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    return res.json({
      success: true,
      message: "Password protection removed successfully.",
    });
  } catch (error) {
    console.error("Delete Note Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};