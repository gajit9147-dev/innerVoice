import db from "../config/db.js";
import bcrypt from "bcryptjs";

const getProfile = async (req, res) => {
  console.log("✅ getProfile controller is running");

  try {
    const userId = req.user.id;

    const sql = `
      SELECT
        id,
        full_name,
        username,
        email,
        phone,
        bio,
        profile_image,
        created_at
      FROM users
      WHERE id = ?
    `;

    const [rows] = await db.query(sql, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      profile: rows[0],
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { full_name, username, phone, bio } = req.body;

    if (!full_name || !username) {
      return res.status(400).json({
        success: false,
        message: "Full name and username are required.",
      });
    }

    const sql = `
      UPDATE users
      SET
        full_name = ?,
        username = ?,
        phone = ?,
        bio = ?
      WHERE id = ?
    `;

    await db.query(sql, [
      full_name,
      username,
      phone,
      bio,
      userId,
    ]);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// 👇 Add this new controller
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const sql = `
      SELECT password
      FROM users
      WHERE id = ?
    `;

    const [rows] = await db.query(sql, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
  currentPassword,
  rows[0].password
);

if (!isPasswordMatch) {
  return res.status(400).json({
    success: false,
    message: "Current password is incorrect.",
  });
}
const hashedPassword = await bcrypt.hash(newPassword, 10);

const updateSql = `
  UPDATE users
  SET password = ?
  WHERE id = ?
`;

await db.query(updateSql, [hashedPassword, userId]);

return res.status(200).json({
  success: true,
  message: "Password changed successfully.",
});

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export { getProfile, updateProfile, changePassword };