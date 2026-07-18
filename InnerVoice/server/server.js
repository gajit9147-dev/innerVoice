import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
app.use(express.json());
app.use("/api/auth", authRoutes);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "InnerVoice API Running 🚀",
  });
});

// Test MySQL Connection
try {
  const connection = await pool.getConnection();
  console.log("✅ MySQL Connected Successfully");
  connection.release();
} catch (error) {
  console.error("❌ Database Connection Failed");
  console.error(error.message);
}

const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});