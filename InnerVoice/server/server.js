import express from "express";
import noteRoutes from "./routes/noteRoutes.js";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

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
