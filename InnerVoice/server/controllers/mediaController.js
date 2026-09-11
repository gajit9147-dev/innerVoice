// ============================================================
// server/controllers/mediaController.js
// Production Media Management:
// - Memory Music Upload & Direct URL Import (SSRF protected)
// - Photo Upload & Attachment
// - Note Media Association with Ownership Validation
// - Global Music Library & Favorites
// ============================================================

import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import logger from "../utils/logger.js";
import dns from "node:dns";
import { promisify } from "node:util";

const lookupAsync = promisify(dns.lookup);

// Helper: Check if an IP address is private, loopback, or cloud metadata
export const isPrivateOrReservedIP = (ip) => {
  if (!ip) return true;

  // IPv4 Loopback (127.0.0.0/8)
  if (/^127\./.test(ip)) return true;

  // 0.0.0.0/8
  if (/^0\./.test(ip)) return true;

  // RFC-1918 Private ranges
  // 10.0.0.0/8
  if (/^10\./.test(ip)) return true;
  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  // 192.168.0.0/16
  if (/^192\.168\./.test(ip)) return true;

  // Link-local / Cloud Metadata (169.254.0.0/16)
  if (/^169\.254\./.test(ip)) return true;

  // Broadcast / Multicast
  if (/^(22[4-9]|23[0-9]|24[0-9]|25[0-5])\./.test(ip)) return true;

  // IPv6 checks
  if (ip === "::1" || ip === "::") return true;
  if (/^fe80:/i.test(ip)) return true; // link-local
  if (/^fc00:/i.test(ip) || /^fd00:/i.test(ip)) return true; // unique local

  return false;
};

// Known streaming/video platforms that are not direct audio downloads
const PROHIBITED_DOMAINS = [
  "youtube.com",
  "youtu.be",
  "spotify.com",
  "soundcloud.com",
  "music.apple.com",
  "vimeo.com",
  "dailymotion.com",
  "tiktok.com",
  "instagram.com",
  "facebook.com",
  "twitter.com",
  "x.com",
];

// Supported audio MIME types
const SUPPORTED_AUDIO_MIMES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/aac",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "video/webm",
];

// Supported photo MIME types
const SUPPORTED_PHOTO_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * Upload Audio or Photo file and attach to a note
 * POST /api/media
 */
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file was uploaded.",
      });
    }

    const userId = req.user.id;
    const { note_id, media_type = "music", title, artist, album } = req.body;

    // Verify note ownership if note_id is provided
    let verifiedNoteId = null;
    if (note_id && note_id !== "null" && note_id !== "undefined") {
      const [noteRows] = await pool.query(
        "SELECT id FROM notes WHERE id = ? AND user_id = ?",
        [note_id, userId]
      );
      if (noteRows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to attach media to this note.",
        });
      }
      verifiedNoteId = noteRows[0].id;
    }

    const mimeType = req.file.mimetype || "";
    const isAudio = media_type === "music" || media_type === "voice";
    const isPhoto = media_type === "photo";

    if (isAudio) {
      if (!SUPPORTED_AUDIO_MIMES.includes(mimeType) && !mimeType.startsWith("audio/")) {
        return res.status(400).json({
          success: false,
          message: "Unsupported audio format. Supported formats: MP3, M4A, AAC, WAV, OGG, WebM.",
        });
      }
      // Max audio size: 25MB
      if (req.file.size > 25 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "Audio file size exceeds the 25MB limit.",
        });
      }
    } else if (isPhoto) {
      if (!SUPPORTED_PHOTO_MIMES.includes(mimeType) && !mimeType.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          message: "Unsupported image format. Supported formats: JPEG, PNG, WEBP, GIF.",
        });
      }
      // Max image size: 10MB
      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "Photo size exceeds the 10MB limit.",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid media_type. Must be 'music' or 'photo'.",
      });
    }

    // Stream to Cloudinary
    const folder = isAudio ? "innervoice/music" : "innervoice/photos";
    const resourceType = isAudio ? "video" : "image";

    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const cloudResult = await uploadToCloudinary();

    const mediaTitle =
      (title && title.trim()) ||
      req.file.originalname?.replace(/\.[^/.]+$/, "") ||
      (isAudio ? "Untitled Music" : "Untitled Photo");

    const durationSeconds = isAudio
      ? Math.round(cloudResult.duration || 0)
      : 0;

    const [insertResult] = await pool.query(
      `INSERT INTO note_media 
       (user_id, note_id, media_type, title, artist, album, file_url, storage_key, mime_type, file_size, duration_seconds)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        verifiedNoteId,
        media_type,
        mediaTitle,
        artist?.trim() || null,
        album?.trim() || null,
        cloudResult.secure_url,
        cloudResult.public_id,
        mimeType,
        req.file.size,
        durationSeconds,
      ]
    );

    const newMedia = {
      id: insertResult.insertId,
      user_id: userId,
      note_id: verifiedNoteId,
      media_type,
      title: mediaTitle,
      artist: artist?.trim() || null,
      album: album?.trim() || null,
      file_url: cloudResult.secure_url,
      storage_key: cloudResult.public_id,
      mime_type: mimeType,
      file_size: req.file.size,
      duration_seconds: durationSeconds,
      is_favorite: 0,
      created_at: new Date().toISOString(),
    };

    logger.info(`Media uploaded: [${media_type}] ${mediaTitle} (ID: ${newMedia.id}) by User ${userId}`);

    return res.status(201).json({
      success: true,
      message: `${media_type === "music" ? "Music track" : "Photo"} uploaded successfully.`,
      media: newMedia,
    });
  } catch (error) {
    logger.error("Upload Media Error: " + (error.stack || error.message));
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload media. Please try again.",
    });
  }
};

/**
 * Import a legitimate direct audio resource from URL (with SSRF protection)
 * POST /api/media/import-audio
 */
export const importAudioUrl = async (req, res) => {
  try {
    const rawUrl = req.body?.url || req.body?.audioUrl || "";
    const { title, artist, album, note_id } = req.body || {};
    const userId = req.user.id;

    if (!rawUrl || typeof rawUrl !== "string" || !rawUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: "Audio resource URL is required.",
      });
    }

    const url = rawUrl.trim();

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid URL provided. Please provide a valid HTTP/HTTPS audio URL.",
      });
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return res.status(400).json({
        success: false,
        message: "Only HTTP and HTTPS protocols are supported.",
      });
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    // Direct loopback / private hostname check
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot import from local, private, or prohibited hostnames.",
      });
    }

    // Check prohibited web / streaming video domains
    if (PROHIBITED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith("." + domain))) {
      return res.status(400).json({
        success: false,
        message:
          "Importing directly from video streaming platforms (such as YouTube or Spotify) is not supported. Please provide a direct audio URL or upload an audio file.",
      });
    }

    // SSRF DNS Lookup Validation: resolve host and reject private/reserved IPs
    try {
      const lookupResult = await lookupAsync(hostname);
      if (isPrivateOrReservedIP(lookupResult.address)) {
        logger.warn(`SSRF Blocked: ${hostname} resolved to ${lookupResult.address}`);
        return res.status(400).json({
          success: false,
          message: "Cannot import from local, private, or prohibited hostnames.",
        });
      }
    } catch (dnsErr) {
      return res.status(400).json({
        success: false,
        message: `Could not resolve hostname: ${hostname}. Please verify the URL.`,
      });
    }

    // Verify note ownership if note_id is provided
    let verifiedNoteId = null;
    if (note_id && note_id !== "null" && note_id !== "undefined") {
      const [noteRows] = await pool.query(
        "SELECT id FROM notes WHERE id = ? AND user_id = ?",
        [note_id, userId]
      );
      if (noteRows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to attach media to this note.",
        });
      }
      verifiedNoteId = noteRows[0].id;
    }

    // Fetch the remote audio with a strict timeout and content validation
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    let response;
    try {
      response = await fetch(parsedUrl.href, {
        signal: controller.signal,
        headers: {
          "User-Agent": "InnerVoice/1.0 (Audio Resource Fetcher)",
          Accept: "audio/*,application/octet-stream",
        },
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      if (fetchErr.name === "AbortError") {
        return res.status(408).json({
          success: false,
          message: "Audio download timed out. The remote host took too long to respond.",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Failed to connect to audio URL: ${fetchErr.message}`,
      });
    }
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: `Remote audio resource returned error HTTP status ${response.status}.`,
      });
    }

    const contentType = (response.headers.get("content-type") || "").toLowerCase();

    // Verify content type is audio or direct audio container
    const isDirectAudio =
      contentType.startsWith("audio/") ||
      contentType.includes("application/ogg") ||
      SUPPORTED_AUDIO_MIMES.some((m) => contentType.includes(m)) ||
      /\.(mp3|m4a|wav|ogg|aac|webm)(\?.*)?$/i.test(parsedUrl.pathname);

    if (!isDirectAudio) {
      return res.status(400).json({
        success: false,
        message:
          "This link is not a downloadable audio resource. Please provide an audio file or an authorized direct audio URL.",
      });
    }

    // Check Content-Length if provided
    const contentLength = parseInt(response.headers.get("content-length") || "0", 10);
    const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB
    if (contentLength > MAX_AUDIO_SIZE) {
      return res.status(400).json({
        success: false,
        message: "The remote audio file exceeds the 25MB size limit.",
      });
    }

    // Stream download into a buffer with size guard
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_AUDIO_SIZE) {
      return res.status(400).json({
        success: false,
        message: "The remote audio file exceeds the 25MB size limit.",
      });
    }

    // Upload to Cloudinary
    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "innervoice/music",
            resource_type: "video",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });

    const cloudResult = await uploadToCloudinary();

    const fallbackTitle = parsedUrl.pathname.split("/").pop()?.replace(/\.[^/.]+$/, "") || "Imported Audio";
    const mediaTitle = (title && title.trim()) || decodeURIComponent(fallbackTitle);
    const durationSeconds = Math.round(cloudResult.duration || 0);

    const [insertResult] = await pool.query(
      `INSERT INTO note_media 
       (user_id, note_id, media_type, title, artist, album, file_url, storage_key, mime_type, file_size, duration_seconds)
       VALUES (?, ?, 'music', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        verifiedNoteId,
        mediaTitle,
        artist?.trim() || null,
        album?.trim() || null,
        cloudResult.secure_url,
        cloudResult.public_id,
        contentType || "audio/mpeg",
        buffer.length,
        durationSeconds,
      ]
    );

    const newMedia = {
      id: insertResult.insertId,
      user_id: userId,
      note_id: verifiedNoteId,
      media_type: "music",
      title: mediaTitle,
      artist: artist?.trim() || null,
      album: album?.trim() || null,
      file_url: cloudResult.secure_url,
      storage_key: cloudResult.public_id,
      mime_type: contentType || "audio/mpeg",
      file_size: buffer.length,
      duration_seconds: durationSeconds,
      is_favorite: 0,
      created_at: new Date().toISOString(),
    };

    logger.info(`Audio URL imported successfully: ${mediaTitle} (ID: ${newMedia.id}) by User ${userId}`);

    return res.status(201).json({
      success: true,
      message: "Audio track imported successfully.",
      media: newMedia,
    });
  } catch (error) {
    logger.error("Import Audio URL Error: " + (error.stack || error.message));
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to import audio resource.",
    });
  }
};

/**
 * Get all media items for a specific note
 * GET /api/media/note/:noteId
 */
export const getNoteMedia = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    // Verify ownership of the note
    const [noteRows] = await pool.query(
      "SELECT id FROM notes WHERE id = ? AND user_id = ?",
      [noteId, userId]
    );

    if (noteRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found or access denied.",
      });
    }

    const [rows] = await pool.query(
      `SELECT * FROM note_media 
       WHERE note_id = ? AND user_id = ? 
       ORDER BY created_at ASC`,
      [noteId, userId]
    );

    return res.status(200).json({
      success: true,
      media: rows,
    });
  } catch (error) {
    logger.error("Get Note Media Error: " + (error.stack || error.message));
    return res.status(500).json({
      success: false,
      message: "Server error retrieving media.",
    });
  }
};

/**
 * Global Music Library for the user
 * GET /api/media/music-library
 */
export const getMusicLibrary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT m.*, n.title as note_title, n.category as note_category
       FROM note_media m
       LEFT JOIN notes n ON m.note_id = n.id
       WHERE m.user_id = ? AND m.media_type = 'music'
       ORDER BY m.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      tracks: rows,
    });
  } catch (error) {
    logger.error("Get Music Library Error: " + (error.stack || error.message));
    return res.status(500).json({
      success: false,
      message: "Server error retrieving music library.",
    });
  }
};

/**
 * Update media metadata (title, artist, album, note_id)
 * PATCH /api/media/:id
 */
export const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, artist, album, note_id } = req.body || {};

    const [existing] = await pool.query(
      "SELECT id FROM note_media WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Media item not found or access denied.",
      });
    }

    await pool.query(
      `UPDATE note_media 
       SET title = COALESCE(?, title),
           artist = COALESCE(?, artist),
           album = COALESCE(?, album),
           note_id = COALESCE(?, note_id)
       WHERE id = ? AND user_id = ?`,
      [title?.trim() || null, artist?.trim() || null, album?.trim() || null, note_id || null, id, userId]
    );

    const [updated] = await pool.query("SELECT * FROM note_media WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: "Media updated successfully.",
      media: updated[0],
    });
  } catch (error) {
    logger.error("Update Media Error: " + (error.stack || error.message));
    return res.status(500).json({
      success: false,
      message: "Server error updating media.",
    });
  }
};

/**
 * Toggle favorite status
 * POST /api/media/:id/favorite
 */
export const toggleFavoriteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await pool.query(
      "SELECT id, is_favorite FROM note_media WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Media item not found or access denied.",
      });
    }

    const newFav = existing[0].is_favorite ? 0 : 1;
    await pool.query(
      "UPDATE note_media SET is_favorite = ? WHERE id = ? AND user_id = ?",
      [newFav, id, userId]
    );

    return res.status(200).json({
      success: true,
      is_favorite: newFav,
      message: newFav ? "Added to favorites" : "Removed from favorites",
    });
  } catch (error) {
    logger.error("Toggle Favorite Media Error: " + (error.stack || error.message));
    return res.status(500).json({
      success: false,
      message: "Server error toggling favorite.",
    });
  }
};

/**
 * Delete a media item (MySQL record and Cloudinary asset)
 * DELETE /api/media/:id
 */
export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query(
      "SELECT id, media_type, storage_key FROM note_media WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Media item not found or access denied.",
      });
    }

    const item = rows[0];

    // Remove from Cloudinary asynchronously
    if (item.storage_key) {
      const resourceType = item.media_type === "photo" ? "image" : "video";
      cloudinary.uploader.destroy(item.storage_key, { resource_type: resourceType }).catch((err) => {
        logger.warn(`Failed to destroy Cloudinary asset: ${item.storage_key} - ${err.message}`);
      });
    }

    await pool.query("DELETE FROM note_media WHERE id = ? AND user_id = ?", [id, userId]);

    logger.info(`Media deleted: ID ${id} by User ${userId}`);

    return res.status(200).json({
      success: true,
      message: "Media deleted successfully.",
    });
  } catch (error) {
    logger.error("Delete Media Error: " + (error.stack || error.message));
    return res.status(500).json({
      success: false,
      message: "Server error deleting media.",
    });
  }
};
