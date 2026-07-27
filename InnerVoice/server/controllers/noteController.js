import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import fs from "fs";

const logDebug = (msg) => {
  try {
    fs.appendFileSync("c:/Users/ajeet/Desktop/Proj1/InnerVoice/server/debug.log", `[${new Date().toISOString()}] ${msg}\n`);
  } catch (err) {
    console.error("Failed to write to debug.log", err);
  }
};

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

    const noteId = result.insertId;

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      noteId,
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
      `SELECT *
       FROM notes
       WHERE user_id = ?
         AND is_deleted = 0
       ORDER BY is_pinned DESC, updated_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("Get Notes Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get Trash Notes
export const getTrashNotes = async (req, res) => {
  try {
    const userId = req.user.id;

    const [notes] = await pool.query(
      `SELECT *
       FROM notes
       WHERE user_id = ?
         AND is_deleted = 1
       ORDER BY deleted_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("Get Trash Notes Error:", error);

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
         AND is_deleted = 0
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
// MOVE NOTE TO TRASH
// =========================
export const moveToTrash = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if note exists
    const [rows] = await pool.query(
      "SELECT id FROM notes WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    await pool.query(
      `UPDATE notes
       SET is_deleted = 1,
           deleted_at = NOW(),
           updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    res.status(200).json({
      success: true,
      message: "Note moved to Trash successfully.",
    });
  } catch (error) {
    console.error("Move To Trash Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// RESTORE NOTE FROM TRASH
// =========================
export const restoreNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if the note exists in Trash
    const [rows] = await pool.query(
      `SELECT id
       FROM notes
       WHERE id = ?
         AND user_id = ?
         AND is_deleted = 1`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found in Trash.",
      });
    }

    // Restore the note
    await pool.query(
      `UPDATE notes
       SET is_deleted = 0,
           deleted_at = NULL,
           updated_at = NOW()
       WHERE id = ?
         AND user_id = ?`,
      [id, userId]
    );

    res.status(200).json({
      success: true,
      message: "Note restored successfully.",
    });
  } catch (error) {
    console.error("Restore Note Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// DELETE NOTE PERMANENTLY (FOREVER)
// =========================
export const deleteForever = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if the note exists in Trash
    const [rows] = await pool.query(
      `SELECT id
       FROM notes
       WHERE id = ?
         AND user_id = ?
         AND is_deleted = 1`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found in Trash.",
      });
    }

    // Permanently delete the note
    await pool.query(
      "DELETE FROM notes WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    res.status(200).json({
      success: true,
      message: "Note deleted permanently.",
    });
  } catch (error) {
    console.error("Delete Forever Error:", error);

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
    logDebug(`setNotePassword - ID: ${req.params.id}, req.user.id: ${req.user?.id}, req.body: ${JSON.stringify(req.body)}`);

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
       SET security_type = ?, note_password = ?, password_hint = ?, is_locked = 1
       WHERE id = ? AND user_id = ?`,
      [
        "custom_password",
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
    console.log("Verify Note Password - Note ID:", req.params.id);
    console.log("Verify Note Password - req.user:", req.user);
    console.log("Verify Note Password - req.user.id:", req.user?.id);
    logDebug(`verifyNotePassword - ID: ${req.params.id}, req.user.id: ${req.user?.id}, req.body: ${JSON.stringify(req.body)}`);

    const { id } = req.params;
    const { password } = req.body;

    const [rows] = await pool.query(
      "SELECT note_password, security_type FROM notes WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    console.log("Rows:", rows);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    const note = rows[0];

    if (note.security_type !== "custom_password" || !note.note_password) {
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

    // Password is correct — do NOT permanently unlock in DB.
    // The frontend tracks the session-unlocked state in memory.

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
    console.log("Delete Note Password - Note ID:", req.params.id);
    console.log("Delete Note Password - req.user:", req.user);
    console.log("Delete Note Password - req.user.id:", req.user?.id);
    logDebug(`deleteNotePassword - ID: ${req.params.id}, req.user.id: ${req.user?.id}, req.body: ${JSON.stringify(req.body)}`);

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

    if (note.security_type === "custom_password" && note.note_password) {
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

//change note password
export const changeNotePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, hint } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 4 characters.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password.",
      });
    }

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

    if (note.security_type !== "custom_password" || !note.note_password) {
      return res.status(400).json({
        success: false,
        message: "This note is not locked with a custom password.",
      });
    }

    console.log("Current Password:", currentPassword);
    console.log("Stored Hash:", note.note_password);

    const isMatch = await bcrypt.compare(currentPassword, note.note_password);

    console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE notes
       SET note_password = ?, password_hint = ?
       WHERE id = ? AND user_id = ?`,
      [hashedNewPassword, hint || null, id, req.user.id]
    );

    return res.json({
      success: true,
      message: "Note password changed successfully.",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Reset note password using user's main account password (recovery flow)
export const resetNotePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountPassword, newNotePassword, hint } = req.body;

    if (!accountPassword || !newNotePassword) {
      return res.status(400).json({
        success: false,
        message: "Account password and new note password are required.",
      });
    }

    if (newNotePassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: "New note password must be at least 4 characters.",
      });
    }

    // 1. Fetch user's hashed login password
    const [userRows] = await pool.query(
      "SELECT password FROM users WHERE id = ?",
      [req.user.id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // 2. Validate the user's account password
    const isAccountPasswordCorrect = await bcrypt.compare(
      accountPassword,
      userRows[0].password
    );

    if (!isAccountPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect account password. Verification failed.",
      });
    }

    // 3. Hash and save the new note password
    const hashedNewPassword = await bcrypt.hash(newNotePassword, 10);

    const [noteResult] = await pool.query(
      `UPDATE notes
       SET note_password = ?, password_hint = ?, security_type = 'custom_password'
       WHERE id = ? AND user_id = ?`,
      [hashedNewPassword, hint || null, id, req.user.id]
    );

    if (noteResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found or you do not have permission to access it.",
      });
    }

    return res.json({
      success: true,
      message: "Note password reset successfully.",
    });

  } catch (error) {
    console.error("Reset Note Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// GET DASHBOARD STATS
// =========================
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [[stats]] = await pool.query(
      `
      SELECT
        COUNT(CASE WHEN is_deleted = 0 THEN 1 END) AS total,
        COUNT(CASE WHEN is_pinned = 1 AND is_deleted = 0 THEN 1 END) AS pinned,
        COUNT(CASE WHEN is_favorite = 1 AND is_deleted = 0 THEN 1 END) AS favorite,
        COUNT(CASE WHEN is_archived = 1 AND is_deleted = 0 THEN 1 END) AS archived,
        COUNT(CASE WHEN is_deleted = 1 THEN 1 END) AS trash,
        COUNT(CASE WHEN is_locked = 1 AND is_deleted = 0 THEN 1 END) AS locked
      FROM notes
      WHERE user_id = ?
      `,
      [userId]
    );

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// GET MOOD STATS
// =========================
export const getMoodStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        feeling,
        COUNT(*) AS count
      FROM notes
      WHERE user_id = ?
        AND is_deleted = 0
      GROUP BY feeling
      ORDER BY count DESC
      `,
      [userId]
    );

    res.status(200).json({
      success: true,
      moods: rows,
    });
  } catch (error) {
    console.error("Mood Stats Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// GET CATEGORY STATS
// =========================
export const getCategoryStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        category,
        COUNT(*) AS count
      FROM notes
      WHERE user_id = ?
        AND is_deleted = 0
      GROUP BY category
      ORDER BY count DESC
      `,
      [userId]
    );

    res.status(200).json({
      success: true,
      categories: rows,
    });
  } catch (error) {
    console.error("Category Stats Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// GET WEEKLY STATS
// =========================
export const getWeeklyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS count
      FROM notes
      WHERE user_id = ?
        AND is_deleted = 0
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
      `,
      [userId]
    );

    res.status(200).json({
      success: true,
      weekly: rows,
    });
  } catch (error) {
    console.error("Weekly Stats Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};