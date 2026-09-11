// ============================================================
// server/migrations/media_migration.js
// Idempotent migration for note_media table
// Supports Memory Music, Photos, and Voice attachments per note
// ============================================================

import pool from "../config/db.js";
import logger from "../utils/logger.js";

export const runMediaMigration = async () => {
  const connection = await pool.getConnection();
  try {
    logger.info("🔄 Running note_media database migration...");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS note_media (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        note_id INT DEFAULT NULL,
        media_type ENUM('music', 'photo', 'voice') NOT NULL,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) DEFAULT NULL,
        album VARCHAR(255) DEFAULT NULL,
        file_url TEXT NOT NULL,
        storage_key VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_size INT NOT NULL DEFAULT 0,
        duration_seconds INT NOT NULL DEFAULT 0,
        is_favorite TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_user_media (user_id, media_type),
        INDEX idx_note_media (note_id, media_type),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    logger.info("✅ note_media table created or verified successfully");
  } catch (error) {
    logger.error("❌ Media migration failed: " + (error.stack || error.message));
    throw error;
  } finally {
    connection.release();
  }
};

if (process.argv[1]?.endsWith("media_migration.js")) {
  runMediaMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
