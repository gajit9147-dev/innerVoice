import pool from "../config/db.js";
import bcrypt from "bcryptjs";

// @desc    Get user profile and stats
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user details
    const [userRows] = await pool.query(
      "SELECT id, full_name, email, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = userRows[0];

    // Get stats (Total Notes)
    const [noteRows] = await pool.query(
      "SELECT COUNT(*) as totalNotes FROM notes WHERE user_id = ?",
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        created_at: user.created_at,
        stats: {
          totalNotes: noteRows[0].totalNotes,
          streak: 1 // Placeholder for now
        }
      }
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, currentPassword, newPassword } = req.body;

    // Fetch user to verify password if trying to update it
    const [userRows] = await pool.query(
      "SELECT full_name, password FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = userRows[0];
    const updatedName = full_name || user.full_name;

    let query = "UPDATE users SET full_name = ?";
    const queryParams = [updatedName];

    // If password change is requested
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Incorrect current password" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      query += ", password = ?";
      queryParams.push(hashedPassword);
    }

    query += " WHERE id = ?";
    queryParams.push(userId);

    await pool.query(query, queryParams);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        full_name: updatedName
      }
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete user account and all their notes
// @route   DELETE /api/profile
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all notes belonging to the user first to avoid Foreign Key constraint errors
    await pool.query("DELETE FROM notes WHERE user_id = ?", [userId]);

    // Delete the user
    await pool.query("DELETE FROM users WHERE id = ?", [userId]);

    res.status(200).json({
      success: true,
      message: "Account permanently deleted"
    });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
