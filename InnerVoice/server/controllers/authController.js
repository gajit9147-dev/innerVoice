// ============================================================
// authController.js
// Handles: Signup, Login, Profile Image Upload,
//          Get/Update Profile, Set/Verify Vault PIN
// ============================================================

import bcrypt from "bcryptjs";      // Used to hash & compare passwords securely
import jwt from "jsonwebtoken";      // Used to create & verify JWT tokens
import pool from "../config/db.js";  // MySQL database connection pool
import cloudinary from "../config/cloudinary.js";  // Cloudinary CDN for image uploads
import streamifier from "streamifier";  // Converts a buffer into a readable stream for Cloudinary
import logger from "../utils/logger.js";

// =========================
// SIGNUP
// Registers a new user account
// POST /api/auth/signup
// =========================
export const signup = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // Check if an account with this email already exists
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash the password with bcrypt (saltRounds = 10) before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await pool.query(
      "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
      [full_name, email, hashedPassword]
    );

    logger.info(`New user registered: ${email}`);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    logger.error("Signup Error: " + (error.stack || error.message));

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// LOGIN
// Authenticates user and returns a JWT token
// POST /api/auth/login
// =========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info(`Login attempt for ${email}`);

    // Look up the user by email
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    // If no user found, return 404
    if (rows.length === 0) {
      logger.warn(`Failed login attempt (user not found) for ${email}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = rows[0];

    // Compare the entered plain password against the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warn(`Failed login attempt for ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate a JWT token valid for 7 days
    // Payload contains user id, email, and role
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,  // Secret key from .env file
      {
        expiresIn: "7d",
      }
    );

    logger.info(`User ${user.email} logged in`);

    // Return token + basic user info (no password)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image,
      },
    });
  } catch (error) {
    logger.error("Login Error: " + (error.stack || error.message));

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// UPLOAD PROFILE IMAGE
// Uploads image to Cloudinary and saves the URL in the DB
// POST /api/auth/upload-profile
// =========================
export const uploadProfileImage = async (req, res) => {
  try {
    // multer puts the uploaded file on req.file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    // Cloudinary doesn't accept buffers directly — wrap it in a Promise
    // that pipes the buffer through a readable stream into Cloudinary's upload_stream
    const uploadFromBuffer = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "innervoice/profile-images",  // Folder inside Cloudinary
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);  // result.secure_url = the CDN image URL
          }
        );

        // Convert req.file.buffer (in-memory file from multer) into a readable stream
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await uploadFromBuffer();

    // Save the Cloudinary image URL to the user's record in MySQL
    await pool.query(
      "UPDATE users SET profile_image = ? WHERE id = ?",
      [result.secure_url, req.user.id]
    );

    // Return the CDN URL so the frontend can display it immediately
    return res.json({
      success: true,
      image: result.secure_url,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};

// =========================
// GET PROFILE
// Returns the logged-in user's profile data
// GET /api/auth/profile
// =========================
export const getProfile = async (req, res) => {
  try {
    // Select only the safe fields (never return the hashed password)
    const [rows] = await pool.query(
      `SELECT id, full_name, email, username, phone, bio, role, profile_image
       FROM users
       WHERE id = ?`,
      [req.user.id]  // req.user is set by authMiddleware after JWT decode
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      profile: rows[0],
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// =========================
// UPDATE PROFILE
// Updates full_name, username, phone, bio
// PUT /api/auth/profile
// =========================
export const updateProfile = async (req, res) => {
  try {
    const { full_name, username, phone, bio } = req.body || {};

    // Treat empty/whitespace username as null (allow clearing it)
    const cleanUsername = username && username.trim() !== "" ? username.trim() : null;

    // If a new username is provided, make sure it's not taken by another user
    if (cleanUsername) {
      const [existingUser] = await pool.query(
        "SELECT id FROM users WHERE username = ? AND id != ?",
        [cleanUsername, req.user.id]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken by another account.",
        });
      }
    }

    // Update the user's profile fields in the database
    await pool.query(
      `UPDATE users
       SET full_name = ?, username = ?, phone = ?, bio = ?
       WHERE id = ?`,
      [
        full_name || null,
        cleanUsername,
        phone || null,
        bio || null,
        req.user.id
      ]
    );

    // Re-fetch the updated row so the frontend gets fresh data
    const [rows] = await pool.query(
      `SELECT id, full_name, email, username, phone, bio, profile_image, role
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: rows[0],
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    // MySQL duplicate entry error (e.g., duplicate username)
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// =========================
// SET VAULT PIN
// Saves a hashed 4-digit PIN used to lock/unlock notes
// PUT /api/auth/set-vault-pin
// =========================
export const setVaultPin = async (req, res) => {
  try {
    const { pin } = req.body;

    // Validate: must be exactly 4 numeric digits
    if (!pin || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "PIN must be exactly 4 digits.",
      });
    }

    // Hash the PIN before storing (same security as passwords)
    const hashedPin = await bcrypt.hash(pin, 10);

    // Save the hashed PIN in the user's row
    await pool.query(
      "UPDATE users SET vault_pin = ? WHERE id = ?",
      [hashedPin, req.user.id]
    );

    return res.json({
      success: true,
      message: "Vault PIN set successfully.",
    });
  } catch (error) {
    console.error("Set Vault PIN Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// VERIFY VAULT PIN
// Checks if the entered PIN matches the stored hash
// POST /api/auth/verify-vault-pin
// =========================
export const verifyVaultPin = async (req, res) => {
  try {
    const { pin } = req.body;

    // Fetch the stored hashed PIN for this user
    const [rows] = await pool.query(
      "SELECT vault_pin FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If no PIN has been set yet, reject
    if (!rows[0].vault_pin) {
      return res.status(400).json({
        success: false,
        message: "Vault PIN not set.",
      });
    }

    // Compare entered PIN (plain) against stored bcrypt hash
    const isMatch = await bcrypt.compare(pin, rows[0].vault_pin);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect PIN",
      });
    }

    return res.json({
      success: true,
      message: "PIN verified.",
    });
  } catch (error) {
    console.error("Verify Vault PIN Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};