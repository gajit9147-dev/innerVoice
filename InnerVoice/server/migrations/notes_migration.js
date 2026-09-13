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

    // 2. Add ai_status column (required by dashboard stats and AI service)
    if (!(await columnExists("ai_status"))) {
      await connection.query(`
        ALTER TABLE notes ADD COLUMN ai_status VARCHAR(20) NOT NULL DEFAULT 'pending';
      `);
      logger.info("✅ Column 'ai_status' added to notes table");
    }

    // 3. Ensure other AI fields exist so AI analysis never fails on production
    if (!(await columnExists("ai_title"))) {
      await connection.query(`ALTER TABLE notes ADD COLUMN ai_title VARCHAR(255) NULL;`);
      logger.info("✅ Column 'ai_title' added to notes table");
    }
    if (!(await columnExists("ai_summary"))) {
      await connection.query(`ALTER TABLE notes ADD COLUMN ai_summary TEXT NULL;`);
      logger.info("✅ Column 'ai_summary' added to notes table");
    }
    if (!(await columnExists("ai_tags"))) {
      await connection.query(`ALTER TABLE notes ADD COLUMN ai_tags JSON NULL;`);
      logger.info("✅ Column 'ai_tags' added to notes table");
    }
    if (!(await columnExists("ai_keywords"))) {
      await connection.query(`ALTER TABLE notes ADD COLUMN ai_keywords JSON NULL;`);
      logger.info("✅ Column 'ai_keywords' added to notes table");
    }
    if (!(await columnExists("ai_confidence"))) {
      await connection.query(`ALTER TABLE notes ADD COLUMN ai_confidence INT NULL;`);
      logger.info("✅ Column 'ai_confidence' added to notes table");
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
