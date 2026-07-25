import express from "express";
import noteRoutes from "./routes/noteRoutes.js";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import liquidLogger from "./middleware/liquidLogger.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
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
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);

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
      primary: "#c084fc",      // vibrant purple
      secondary: "#22d3ee",    // vibrant cyan
      accent: "#f472b6",       // vibrant pink
      glassBg: "rgba(15, 23, 42, 0.45)", // dark slate glass background
      glassBorder: "rgba(255, 255, 255, 0.08)",
      glassInset: "inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)"
    },
    light: {
      primary: "#d8b4fe",      // soft pastel lavender
      secondary: "#a5f3fc",    // soft pastel sky cyan
      accent: "#fbcfe8",       // soft pastel pink
      glassBg: "rgba(255, 255, 255, 0.4)", // light mode glass background
      glassBorder: "rgba(255, 255, 255, 0.4)",
      glassInset: "inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0, 0, 0, 0.03)"
    }
  });
});

// 404 + global error handler (must be last)
app.use(notFound);
app.use(errorHandler);

// Test MySQL Connection
try {
  const connection = await pool.getConnection();
  console.log("✅ MySQL Connected Successfully");
  connection.release();
} catch (error) {
  console.error("❌ Database Connection Failed");
  console.error(error.message);
}

const PORT = 5000;

// Server start listener
const server = app.listen(PORT, "127.0.0.1", () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Please close the other process and restart.`);
    process.exit(1);
  } else {
    console.error("❌ Server Error:", err);
  }
});

server.on("listening", () => {
  console.log("✅ Express is actually listening");
});
