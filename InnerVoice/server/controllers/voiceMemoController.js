import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import logger from "../utils/logger.js";

/**
 * Upload and save a new voice memo
 * POST /api/voice-memos
 */
export const uploadVoiceMemo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio recording file is required.",
      });
    }

    const { title, duration, notebook } = req.body;
    const userId = req.user.id;

    // Validate MIME type
    const mimeType = req.file.mimetype || "audio/webm";
    if (!mimeType.startsWith("audio/") && !mimeType.includes("video/webm")) {
      return res.status(400).json({
        success: false,
        message: "Uploaded file must be a valid audio recording.",
      });
    }

    logger.info(`Starting voice memo upload for user: ${userId}, size: ${req.file.size} bytes`);

    // Stream buffer into Cloudinary (resource_type: "video" handles audio files in Cloudinary)
    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "innervoice/voice-memos",
            resource_type: "video",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const cloudResult = await uploadToCloudinary();

    const parsedDuration = Math.round(
      parseFloat(duration) || cloudResult.duration || 0
    );
    const memoTitle =
      (title && title.trim()) ||
      `Voice Memo — ${new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;

    const [insertResult] = await pool.query(
      `INSERT INTO voice_memos (user_id, title, file_url, storage_key, mime_type, file_size, duration_seconds, notebook)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        memoTitle,
        cloudResult.secure_url,
        cloudResult.public_id,
        mimeType,
        req.file.size,
        parsedDuration,
        notebook || null,
      ]
    );

    const newMemo = {
      id: insertResult.insertId,
      user_id: userId,
      title: memoTitle,
      file_url: cloudResult.secure_url,
      storage_key: cloudResult.public_id,
      mime_type: mimeType,
      file_size: req.file.size,
      duration_seconds: parsedDuration,
      notebook: notebook || null,
      created_at: new Date().toISOString(),
    };

    logger.info(`Voice memo saved successfully with ID: ${newMemo.id}`);

    return res.status(201).json({
      success: true,
      memo: newMemo,
    });
  } catch (error) {
    logger.error(`Voice memo upload failed: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to upload and save voice memo.",
    });
  }
};

/**
 * Get all voice memos for the authenticated user
 * GET /api/voice-memos
 */
export const getVoiceMemos = async (req, res) => {
  try {
    const userId = req.user.id;

    const [memos] = await pool.query(
      `SELECT id, user_id, title, file_url, storage_key, mime_type, file_size, duration_seconds, notebook, created_at, updated_at
       FROM voice_memos
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      memos,
    });
  } catch (error) {
    logger.error(`Failed to fetch voice memos: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch voice memos.",
    });
  }
};

/**
 * Get single voice memo by ID
 * GET /api/voice-memos/:id
 */
export const getVoiceMemoById = async (req, res) => {
  try {
    const userId = req.user.id;
    const memoId = req.params.id;

    const [rows] = await pool.query(
      `SELECT id, user_id, title, file_url, storage_key, mime_type, file_size, duration_seconds, notebook, created_at, updated_at
       FROM voice_memos
       WHERE id = ? AND user_id = ?`,
      [memoId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Voice memo not found.",
      });
    }

    return res.status(200).json({
      success: true,
      memo: rows[0],
    });
  } catch (error) {
    logger.error(`Failed to fetch voice memo ${req.params.id}: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch voice memo.",
    });
  }
};

/**
 * Update voice memo title or notebook
 * PATCH /api/voice-memos/:id
 */
export const updateVoiceMemo = async (req, res) => {
  try {
    const userId = req.user.id;
    const memoId = req.params.id;
    const { title, notebook } = req.body;

    const [existing] = await pool.query(
      `SELECT id FROM voice_memos WHERE id = ? AND user_id = ?`,
      [memoId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Voice memo not found.",
      });
    }

    await pool.query(
      `UPDATE voice_memos
       SET title = COALESCE(?, title),
           notebook = COALESCE(?, notebook)
       WHERE id = ? AND user_id = ?`,
      [title || null, notebook || null, memoId, userId]
    );

    const [updated] = await pool.query(
      `SELECT * FROM voice_memos WHERE id = ?`,
      [memoId]
    );

    return res.status(200).json({
      success: true,
      memo: updated[0],
    });
  } catch (error) {
    logger.error(`Failed to update voice memo ${req.params.id}: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to update voice memo.",
    });
  }
};

/**
 * Delete a voice memo
 * DELETE /api/voice-memos/:id
 */
export const deleteVoiceMemo = async (req, res) => {
  try {
    const userId = req.user.id;
    const memoId = req.params.id;

    const [rows] = await pool.query(
      `SELECT storage_key FROM voice_memos WHERE id = ? AND user_id = ?`,
      [memoId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Voice memo not found.",
      });
    }

    const storageKey = rows[0].storage_key;

    // Delete asset from Cloudinary
    if (storageKey) {
      try {
        await cloudinary.uploader.destroy(storageKey, {
          resource_type: "video",
        });
      } catch (cloudErr) {
        logger.warn(`Cloudinary deletion warning for ${storageKey}: ${cloudErr.message}`);
      }
    }

    // Delete database record
    await pool.query(`DELETE FROM voice_memos WHERE id = ? AND user_id = ?`, [
      memoId,
      userId,
    ]);

    logger.info(`Voice memo ${memoId} deleted successfully for user ${userId}`);

    return res.status(200).json({
      success: true,
      message: "Voice memo deleted successfully.",
    });
  } catch (error) {
    logger.error(`Failed to delete voice memo ${req.params.id}: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to delete voice memo.",
    });
  }
};
