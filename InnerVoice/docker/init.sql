CREATE TABLE IF NOT EXISTS users (
  id            INT NOT NULL AUTO_INCREMENT,
  full_name     VARCHAR(255) NOT NULL,
  username      VARCHAR(100) UNIQUE,
  email         VARCHAR(255) UNIQUE NOT NULL,
  phone         VARCHAR(20),
  bio           TEXT,
  password      VARCHAR(255) NOT NULL,
  vault_pin     VARCHAR(255),
  role          VARCHAR(20) NOT NULL DEFAULT 'user',
  profile_image VARCHAR(500),
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notes (
  id            INT NOT NULL AUTO_INCREMENT,
  user_id       INT NOT NULL,
  title         VARCHAR(500) NOT NULL,
  content       TEXT NOT NULL,
  category      VARCHAR(100) NOT NULL DEFAULT 'General',
  feeling       VARCHAR(100) NOT NULL DEFAULT 'Neutral',
  is_locked     TINYINT(1) NOT NULL DEFAULT 0,
  is_pinned     TINYINT(1) NOT NULL DEFAULT 0,
  is_favorite   TINYINT(1) NOT NULL DEFAULT 0,
  is_deleted    TINYINT(1) NOT NULL DEFAULT 0,
  deleted_at    TIMESTAMP NULL,
  security_type VARCHAR(50),
  note_password VARCHAR(255),
  password_hint VARCHAR(255),
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_notes_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;