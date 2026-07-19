import db from "../config/db.js";

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
        avatar,
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

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export { getProfile };