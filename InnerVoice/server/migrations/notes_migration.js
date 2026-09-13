// ============================================================
// server/migrations/notes_migration.js
// Safe, idempotent migration to add missing columns to notes table
// ============================================================

import pool from "../config/db.js";
import logger from "../utils/logger.js";

export const runNotesMigration = async () => {
  const connection = await pool.getConnection();
  try {
    logger.info("🔄 Running notes table migration...");

    // Helper to check if a column exists on the notes table
    const columnExists = async (colName) => {
      const [rows] = await connection.query(`
        SELECT COUNT(*) AS cnt 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'notes' 
          AND COLUMN_NAME = ?
      `, [colName]);
      return rows[0].cnt > 0;
    };

    // 1. Add is_archived column (required by dashboard stats)
    if (!(await columnExists("is_archived"))) {
      await connection.query(`
        ALTER TABLE notes ADD COLUMN is_archived TINYINT(1) NOT NULL DEFAULT 0 AFTER is_favorite;
      `);
      logger.info("✅ Column 'is_archived' added to notes table");
    }

    logger.info("🎉 Notes table migration completed successfully!");
  } catch (error) {
    logger.error("❌ Notes migration failed: " + (error.stack || error.message));
    throw error;
  } finally {
    connection.release();
  }
};

// If run directly via node
if (process.argv[1]?.endsWith("notes_migration.js")) {
  runNotesMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
