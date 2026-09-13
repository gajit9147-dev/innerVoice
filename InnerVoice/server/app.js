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
  "https://innervoice-b6t.pages.dev",
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

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);

    if (
      explicitOrigins.includes(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(
        origin,
      ) ||
      /\.pages\.dev$/.test(origin) ||
      /(^|\.)innervoice4u\.in$/.test(origin)
    ) {
      return callback(null, true);
    }

    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cache-Control",
    "Pragma",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  optionsSuccessStatus: 200,
  maxAge: 86400, // Cache preflight response for 24h
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

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

// Hosting and reverse-proxy health check. Keep this independent of the database.
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// =========================
// LIQUID GLASS THEME API
// Returns dark translucent glass theme with warm champagne accent
// GET /api/glass-theme
// =========================
app.get("/api/glass-theme", (req, res) => {
  res.json({
    dark: {
      primary: "rgba(20, 22, 24, 0.48)", // dark translucent glass
      secondary: "rgba(26, 28, 34, 0.55)", // inner glass
      accent: "#d8b27a", // warm champagne accent
      glassBg: "rgba(20, 22, 24, 0.48)", // dark translucent glass
      glassBorder: "rgba(255, 255, 255, 0.12)",
      glassInset:
        "inset 0 1px 0 rgba(255, 255, 255, 0.10), inset 0 -1px 0 rgba(0, 0, 0, 0.4)",
    },
    light: {
      primary: "rgba(255, 255, 255, 0.75)",
      secondary: "rgba(245, 245, 245, 0.85)",
      accent: "#c49856",
      glassBg: "rgba(255, 255, 255, 0.75)",
      glassBorder: "rgba(0, 0, 0, 0.08)",
      glassInset:
        "inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.03)",
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
