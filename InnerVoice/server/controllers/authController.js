// ============================================================
// authController.js
// Production Authentication System:
// - Email + Password (Register & Login)
// - Google Identity Services (Server-verified ID token)
// - Sign in with Apple (Server-verified Identity token)
// - Secure Account Linking
// - Current User (GET /api/auth/me) & Logout
// - Profile Management & Vault PIN
// ============================================================

import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import logger from "../utils/logger.js";
import { generateToken, sanitizeUser } from "../utils/jwt.js";
import { verifyGoogleIdToken } from "../services/googleAuth.service.js";
import { verifyAppleIdToken } from "../services/appleAuth.service.js";

// Helper: validate password complexity
const validatePasswordStrength = (password) => {
  if (!password || typeof password !== "string") {
    return "Password is required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Za-z]/.test(password)) {
    return "Password must contain at least one letter.";
  }
  if (!/[0-9]/.test(password) && !/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one number or special character.";
  }
  return null;
};

// =========================
// REGISTER (EMAIL + PASSWORD)
// POST /api/auth/register
// =========================
export const register = async (req, res) => {
  try {
    const { name, full_name, email, password, confirmPassword } = req.body || {};
    const displayName = (name || full_name || "").trim();

    if (!displayName) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Validate password strength
    const pwdError = validatePasswordStrength(password);
    if (pwdError) {
      return res.status(400).json({
        success: false,
        message: pwdError,
      });
    }

    // Validate confirmPassword if supplied
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Check for existing account
    const [existing] = await pool.query(
      "SELECT id, auth_provider FROM users WHERE email = ?",
      [cleanEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account already exists with this email.",
      });
    }

    // Hash password with bcrypt cost factor 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in MySQL
    const [insertResult] = await pool.query(
      `INSERT INTO users (full_name, email, password, auth_provider, email_verified)
       VALUES (?, ?, ?, 'local', 0)`,
      [displayName, cleanEmail, hashedPassword]
    );

    const [newUsers] = await pool.query("SELECT * FROM users WHERE id = ?", [
      insertResult.insertId,
    ]);
    const newUser = newUsers[0];

    logger.info(`New local user registered: ${cleanEmail} (ID: ${newUser.id})`);

    // Generate standard session JWT
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    logger.error("Register Error: " + (error.stack || error.message));
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during signup. Please try again.",
    });
  }
};

// Signup alias for backward compatibility
export const signup = register;

// =========================
// LOGIN (EMAIL + PASSWORD)
// POST /api/auth/login
// =========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Look up user by email
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      cleanEmail,
    ]);

    // Use generic error message to prevent account enumeration vulnerabilities
    if (rows.length === 0) {
      logger.warn(`Failed login attempt (user not found): ${cleanEmail}`);
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect.",
      });
    }

    const user = rows[0];

    // If account was created with Google or Apple and has no local password
    if (!user.password) {
      logger.warn(`User ${cleanEmail} attempted password login on OAuth account`);
      return res.status(401).json({
        success: false,
        message: `This account was registered using ${user.auth_provider}. Please sign in with ${user.auth_provider}.`,
      });
    }

    // Compare entered password with bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Failed login attempt (wrong password): ${cleanEmail}`);
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect.",
      });
    }

    // Issue application session JWT
    const token = generateToken(user);
    logger.info(`User logged in: ${cleanEmail} (ID: ${user.id})`);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    logger.error("Login Error: " + (error.stack || error.message));
    return res.status(500).json({
      success: false,
      message: "An unexpected server error occurred during login.",
    });
  }
};

// =========================
// GOOGLE SIGN IN / SIGN UP
// POST /api/auth/google
// =========================
export const googleAuth = async (req, res) => {
  try {
    const { id_token, credential, access_token, userinfo, link_account, password } = req.body || {};
    const tokenToVerify = id_token || credential || access_token;

    if (!tokenToVerify) {
      return res.status(400).json({
        success: false,
        message: "Missing Google authentication token or credential.",
      });
    }

    // Verify Google token cryptographically with Google Identity Services
    const verifiedGoogleUser = await verifyGoogleIdToken(tokenToVerify, userinfo);
    const { sub, email, name, picture, email_verified } = verifiedGoogleUser;

    // 1. Check if user exists by google_id
    const [byGoogleId] = await pool.query(
      "SELECT * FROM users WHERE google_id = ?",
      [sub]
    );

    let user;

    if (byGoogleId.length > 0) {
      user = byGoogleId[0];
      // Update avatar if not yet set
      if (!user.profile_image && picture) {
        await pool.query(
          "UPDATE users SET profile_image = ?, avatar_url = ? WHERE id = ?",
          [picture, picture, user.id]
        );
        user.profile_image = picture;
        user.avatar_url = picture;
      }
      logger.info(`Existing Google user signed in: ${email} (sub: ${sub})`);
    } else {
      // 2. Check if user exists with the same email
      const [byEmail] = await pool.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      if (byEmail.length > 0) {
        const existingUser = byEmail[0];

        // If existing user already has a local password and user hasn't confirmed linking
        if (existingUser.password && !link_account) {
          return res.status(409).json({
            success: false,
            requireLinking: true,
            email: existingUser.email,
            message:
              "An account with this email already exists. Please verify your password to link your Google account.",
          });
        }

        // If link_account is requested, verify the user's password
        if (existingUser.password && link_account) {
          if (!password) {
            return res.status(400).json({
              success: false,
              requireLinking: true,
              message: "Please enter your password to authorize linking.",
            });
          }

          const passwordValid = await bcrypt.compare(password, existingUser.password);
          if (!passwordValid) {
            return res.status(401).json({
              success: false,
              requireLinking: true,
              message: "Incorrect password. Could not link Google account.",
            });
          }
        }

        // Safely link Google ID to existing account
        await pool.query(
          `UPDATE users 
           SET google_id = ?, email_verified = 1,
               avatar_url = COALESCE(avatar_url, ?),
               profile_image = COALESCE(profile_image, ?)
           WHERE id = ?`,
          [sub, picture, picture, existingUser.id]
        );

        const [updatedRows] = await pool.query(
          "SELECT * FROM users WHERE id = ?",
          [existingUser.id]
        );
        user = updatedRows[0];
        logger.info(`Google sub linked to existing account: ${email}`);
      } else {
        // 3. Completely new Google user
        const [insertRes] = await pool.query(
          `INSERT INTO users 
           (full_name, email, password, auth_provider, google_id, avatar_url, profile_image, email_verified)
           VALUES (?, ?, NULL, 'google', ?, ?, ?, ?)`,
          [name, email, sub, picture, picture, email_verified ? 1 : 0]
        );

        const [newRows] = await pool.query("SELECT * FROM users WHERE id = ?", [
          insertRes.insertId,
        ]);
        user = newRows[0];
        logger.info(`New user registered via Google: ${email} (sub: ${sub})`);
      }
    }

    // Issue application session JWT
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Successfully signed in with Google!",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    logger.error("Google Auth Error: " + (error.stack || error.message));
    return res.status(400).json({
      success: false,
      message: error.message || "Google sign-in could not be completed. Please try again.",
    });
  }
};

// =========================
// APPLE SIGN IN / SIGN UP
// POST /api/auth/apple
// =========================
export const appleAuth = async (req, res) => {
  try {
    const { id_token, user: rawAppleUser, link_account, password } = req.body || {};

    if (!id_token) {
      return res.status(400).json({
        success: false,
        message: "Missing Apple identity token.",
      });
    }

    // Verify Apple identity token cryptographically using Apple's official JWKS
    const verifiedApple = await verifyAppleIdToken(id_token);
    const { sub, email: appleEmail, email_verified } = verifiedApple;

    // 1. Check if user exists by apple_id
    const [byAppleId] = await pool.query(
      "SELECT * FROM users WHERE apple_id = ?",
      [sub]
    );

    let user;

    if (byAppleId.length > 0) {
      user = byAppleId[0];
      logger.info(`Returning Apple user authenticated: sub=${sub}`);
    } else {
      // 2. Check if user exists by email (if email was provided by Apple)
      if (appleEmail) {
        const [byEmail] = await pool.query(
          "SELECT * FROM users WHERE email = ?",
          [appleEmail]
        );

        if (byEmail.length > 0) {
          const existingUser = byEmail[0];

          if (existingUser.password && !link_account) {
            return res.status(409).json({
              success: false,
              requireLinking: true,
              email: existingUser.email,
              message:
                "An account with this email already exists. Please verify your password to link your Apple ID.",
            });
          }

          if (existingUser.password && link_account) {
            if (!password) {
              return res.status(400).json({
                success: false,
                requireLinking: true,
                message: "Please enter your password to authorize linking.",
              });
            }

            const passwordValid = await bcrypt.compare(
              password,
              existingUser.password
            );
            if (!passwordValid) {
              return res.status(401).json({
                success: false,
                requireLinking: true,
                message: "Incorrect password. Could not link Apple ID.",
              });
            }
          }

          // Link Apple ID
          await pool.query(
            "UPDATE users SET apple_id = ?, email_verified = 1 WHERE id = ?",
            [sub, existingUser.id]
          );

          const [updatedRows] = await pool.query(
            "SELECT * FROM users WHERE id = ?",
            [existingUser.id]
          );
          user = updatedRows[0];
          logger.info(`Apple ID linked to existing account: ${appleEmail}`);
        }
      }

      // 3. Completely new Apple user
      if (!user) {
        // Parse user name from Apple's first-time user payload
        let displayName = "Apple User";
        if (rawAppleUser) {
          let parsed = rawAppleUser;
          if (typeof rawAppleUser === "string") {
            try {
              parsed = JSON.parse(rawAppleUser);
            } catch {
              parsed = {};
            }
          }
          const firstName = parsed?.name?.firstName || "";
          const lastName = parsed?.name?.lastName || "";
          const combined = `${firstName} ${lastName}`.trim();
          if (combined) displayName = combined;
        }

        const effectiveEmail =
          appleEmail || `${sub}@privaterelay.appleid.com`;

        const [insertRes] = await pool.query(
          `INSERT INTO users 
           (full_name, email, password, auth_provider, apple_id, email_verified)
           VALUES (?, ?, NULL, 'apple', ?, ?)`,
          [displayName, effectiveEmail, sub, email_verified ? 1 : 0]
        );

        const [newRows] = await pool.query("SELECT * FROM users WHERE id = ?", [
          insertRes.insertId,
        ]);
        user = newRows[0];
        logger.info(`New user registered via Apple ID: ${effectiveEmail} (sub: ${sub})`);
      }
    }

    // Issue application session JWT
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Successfully signed in with Apple!",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    logger.error("Apple Auth Error: " + (error.stack || error.message));
    return res.status(400).json({
      success: false,
      message: error.message || "Apple sign-in could not be completed. Please try again.",
    });
  }
};

// =========================
// SECURE ACCOUNT LINKING
// POST /api/auth/link-account
// =========================
export const linkAccount = async (req, res) => {
  try {
    const { email, password, provider, oauth_id } = req.body || {};

    if (!email || !password || !provider || !oauth_id) {
      return res.status(400).json({
        success: false,
        message: "Email, password, provider, and OAuth ID are required for linking.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      cleanEmail,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    const user = rows[0];

    // Verify existing password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Account linking rejected.",
      });
    }

    if (provider === "google") {
      await pool.query("UPDATE users SET google_id = ? WHERE id = ?", [
        oauth_id,
        user.id,
      ]);
    } else if (provider === "apple") {
      await pool.query("UPDATE users SET apple_id = ? WHERE id = ?", [
        oauth_id,
        user.id,
      ]);
    } else {
      return res.status(400).json({
        success: false,
        message: `Unknown provider: ${provider}`,
      });
    }

    const [updated] = await pool.query("SELECT * FROM users WHERE id = ?", [
      user.id,
    ]);
    const token = generateToken(updated[0]);

    return res.status(200).json({
      success: true,
      message: `Successfully linked ${provider} to your account!`,
      token,
      user: sanitizeUser(updated[0]),
    });
  } catch (error) {
    logger.error("Link Account Error: " + (error.stack || error.message));
    return res.status(500).json({
      success: false,
      message: "Server error during account linking.",
    });
  }
};

// =========================
// GET CURRENT USER
// GET /api/auth/me
// =========================
export const getCurrentUser = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.user.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(rows[0]),
    });
  } catch (error) {
    logger.error("Get Current User Error: " + (error.stack || error.message));
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// LOGOUT
// POST /api/auth/logout
// =========================
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

// =========================
// GET PROFILE
// GET /api/auth/profile
// =========================
export const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, full_name, email, username, phone, bio, role, profile_image, avatar_url, auth_provider, email_verified
       FROM users
       WHERE id = ?`,
      [req.user.id]
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
    logger.error("Get Profile Error: " + (error.stack || error.message));
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// =========================
// UPDATE PROFILE
// PUT /api/auth/profile
// =========================
export const updateProfile = async (req, res) => {
  try {
    const { full_name, username, phone, bio } = req.body || {};

    const cleanUsername =
      username && username.trim() !== "" ? username.trim() : null;

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

    await pool.query(
      `UPDATE users
       SET full_name = ?, username = ?, phone = ?, bio = ?
       WHERE id = ?`,
      [
        full_name || null,
        cleanUsername,
        phone || null,
        bio || null,
        req.user.id,
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, full_name, email, username, phone, bio, profile_image, avatar_url, role
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
    logger.error("Update Profile Error: " + (error.stack || error.message));
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
// UPLOAD PROFILE IMAGE
// POST /api/auth/upload-profile
// =========================
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const uploadFromBuffer = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "innervoice/profile-images" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await uploadFromBuffer();

    await pool.query(
      "UPDATE users SET profile_image = ?, avatar_url = ? WHERE id = ?",
      [result.secure_url, result.secure_url, req.user.id]
    );

    return res.json({
      success: true,
      image: result.secure_url,
    });
  } catch (error) {
    logger.error("Upload Profile Image Error: " + (error.stack || error.message));
    return res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};

// =========================
// SET VAULT PIN
// PUT /api/auth/set-vault-pin
// =========================
export const setVaultPin = async (req, res) => {
  try {
    const { pin } = req.body || {};

    if (!pin || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "PIN must be exactly 4 digits.",
      });
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    await pool.query("UPDATE users SET vault_pin = ? WHERE id = ?", [
      hashedPin,
      req.user.id,
    ]);

    return res.json({
      success: true,
      message: "Vault PIN set successfully.",
    });
  } catch (error) {
    logger.error("Set Vault PIN Error: " + (error.stack || error.message));
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// VERIFY VAULT PIN
// POST /api/auth/verify-vault-pin
// =========================
export const verifyVaultPin = async (req, res) => {
  try {
    const { pin } = req.body || {};

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

    if (!rows[0].vault_pin) {
      return res.status(400).json({
        success: false,
        message: "Vault PIN not set.",
      });
    }

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
    logger.error("Verify Vault PIN Error: " + (error.stack || error.message));
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
