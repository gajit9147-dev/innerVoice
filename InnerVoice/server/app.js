import "dotenv/config";
import env from "./config/env.js";

import express from "express";
import cors from "cors";

import noteRoutes from "./routes/noteRoutes.js";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import voiceMemoRoutes from "./routes/voiceMemoRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import liquidLogger from "./middleware/liquidLogger.js";
import logger from "./utils/logger.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();

// CORS — allow localhost for dev, Cloudflare Pages, custom domain, and CORS_ORIGIN env var
const explicitOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://innervoice-bt6.pages.dev",
  "https://innervoice4u.in",
  "https://www.innervoice4u.in",
  "https://api.innervoice4u.in",
];

if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(",").forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed) explicitOrigins.push(trimmed);
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);

      if (
        explicitOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        /\.pages\.dev$/.test(origin) ||
        /(^|\.)innervoice4u\.in$/.test(origin)
      ) {
        return callback(null, true);
      }

      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Liquid rainbow request logger — logs every request with iridescent chalk colors
app.use(liquidLogger);

// Handle malformed JSON body — return clean JSON instead of HTML error
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body. Please send valid JSON.",
    });
  }
  next(err);
});

// Routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/voice-memos", voiceMemoRoutes);
app.use("/api/media", mediaRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "Hey Ajeet You are connected to the server",
  });
});

// =========================
// LIQUID GLASS THEME API
// Returns an iridescent color palette.
// The frontend (LiquidGlassProvider) fetches this on load
// and injects the colors into CSS custom properties.
// GET /api/glass-theme
// =========================
app.get("/api/glass-theme", (req, res) => {
  res.json({
    dark: {
      primary: "#06b6d4", // vibrant cyan
      secondary: "#14b8a6", // vibrant teal
      accent: "#38bdf8", // vibrant sky cyan
      glassBg: "rgba(11, 19, 31, 0.72)", // dark obsidian glass background
      glassBorder: "rgba(255, 255, 255, 0.08)",
      glassInset:
        "inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
    },
    light: {
      primary: "#d8b4fe", // soft pastel lavender
      secondary: "#a5f3fc", // soft pastel sky cyan
      accent: "#fbcfe8", // soft pastel pink
      glassBg: "rgba(255, 255, 255, 0.4)", // light mode glass background
      glassBorder: "rgba(255, 255, 255, 0.4)",
      glassInset:
        "inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0, 0, 0, 0.03)",
    },
  });
});

// 404 + global error handler (must be last)
app.use(notFound);
app.use(errorHandler);

// Test database connection without crashing the app on startup.
// This allows Express to keep listening while the database is warming up or unavailable.
try {
  const connection = await pool.getConnection();
  logger.info("✅ Database Connected Successfully");

  // Ensure email_otps table exists
  await connection.query(`
    CREATE TABLE IF NOT EXISTS email_otps (
      id INT NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL,
      otp_hash VARCHAR(255) NOT NULL,
      purpose VARCHAR(50) NOT NULL DEFAULT 'signup',
      attempts INT NOT NULL DEFAULT 0,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_email_purpose (email, purpose)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Ensure voice_memos table exists
  await connection.query(`
    CREATE TABLE IF NOT EXISTS voice_memos (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      file_url TEXT NOT NULL,
      storage_key VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100) NOT NULL DEFAULT 'audio/webm',
      file_size INT NOT NULL DEFAULT 0,
      duration_seconds INT NOT NULL DEFAULT 0,
      notebook VARCHAR(100) DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_user_id (user_id),
      INDEX idx_created_at (created_at),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  connection.release();
} catch (error) {
  logger.warn(
    "⚠️ Database unavailable on startup. Server continues running without a live DB connection: " +
      error.message,
  );
}

export default app;
