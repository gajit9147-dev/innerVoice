// ============================================================
// server/migrations/auth_migration.js
// Safe, idempotent migration to upgrade users table for
// production authentication (Local, Google, Apple)
// ============================================================

import pool from "../config/db.js";
import logger from "../utils/logger.js";

export const runAuthMigration = async () => {
  const connection = await pool.getConnection();
  try {
    logger.info("🔄 Running safe auth database migration...");

    // 1. Make password column nullable so OAuth users can register without a dummy password
    await connection.query(`
      ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;
    `);
    logger.info("✅ Column 'password' made NULLABLE");

    // Helper to check if a column exists
    const columnExists = async (colName) => {
      const [rows] = await connection.query(`
        SELECT COUNT(*) AS cnt 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND COLUMN_NAME = ?
      `, [colName]);
      return rows[0].cnt > 0;
    };

    // Helper to check if an index exists
    const indexExists = async (idxName) => {
      const [rows] = await connection.query(`
        SELECT COUNT(*) AS cnt 
        FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND INDEX_NAME = ?
      `, [idxName]);
      return rows[0].cnt > 0;
    };

    // 2. Add auth_provider
    if (!(await columnExists("auth_provider"))) {
      await connection.query(`
        ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) NOT NULL DEFAULT 'local' AFTER email;
      `);
      logger.info("✅ Column 'auth_provider' added");
    }

    // 3. Add google_id
    if (!(await columnExists("google_id"))) {
      await connection.query(`
        ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL AFTER auth_provider;
      `);
      logger.info("✅ Column 'google_id' added");
    }

    // 4. Add apple_id
    if (!(await columnExists("apple_id"))) {
      await connection.query(`
        ALTER TABLE users ADD COLUMN apple_id VARCHAR(255) NULL AFTER google_id;
      `);
      logger.info("✅ Column 'apple_id' added");
    }

    // 5. Add avatar_url
    if (!(await columnExists("avatar_url"))) {
      await connection.query(`
        ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL AFTER profile_image;
      `);
      logger.info("✅ Column 'avatar_url' added");
    }

    // 6. Add email_verified
    if (!(await columnExists("email_verified"))) {
      await connection.query(`
        ALTER TABLE users ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER avatar_url;
      `);
      logger.info("✅ Column 'email_verified' added");
    }

    // 7. Add updated_at
    if (!(await columnExists("updated_at"))) {
      await connection.query(`
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
      `);
      logger.info("✅ Column 'updated_at' added");
    }

    // 8. Add unique index on google_id
    if (!(await indexExists("idx_users_google_id"))) {
      await connection.query(`
        ALTER TABLE users ADD UNIQUE INDEX idx_users_google_id (google_id);
      `);
      logger.info("✅ Index 'idx_users_google_id' added");
    }

    // 9. Add unique index on apple_id
    if (!(await indexExists("idx_users_apple_id"))) {
      await connection.query(`
        ALTER TABLE users ADD UNIQUE INDEX idx_users_apple_id (apple_id);
      `);
      logger.info("✅ Index 'idx_users_apple_id' added");
    }

    logger.info("🎉 Auth database migration completed successfully!");
  } catch (error) {
    logger.error("❌ Auth migration failed: " + (error.stack || error.message));
    throw error;
  } finally {
    connection.release();
  }
};

// If run directly via node
if (process.argv[1]?.endsWith("auth_migration.js")) {
  runAuthMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
