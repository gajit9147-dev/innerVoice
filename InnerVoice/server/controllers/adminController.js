import pool from "../config/db.js";

// @desc    Get all users and their total notes count
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.created_at, COUNT(n.id) as totalNotes 
       FROM users u 
       LEFT JOIN notes n ON u.id = n.user_id 
       GROUP BY u.id 
       ORDER BY u.created_at DESC`
    );

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete a user by ID
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === parseInt(req.user.id)) {
      return res.status(400).json({ success: false, message: "Admins cannot delete their own accounts via the dashboard." });
    }

    // Delete user's notes first to prevent foreign key errors
    await pool.query("DELETE FROM notes WHERE user_id = ?", [id]);
    
    // Delete user
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User and their notes deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
