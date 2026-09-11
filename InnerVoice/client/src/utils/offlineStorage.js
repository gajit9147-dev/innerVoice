// ============================================================
// client/src/utils/offlineStorage.js
// Production IndexedDB Offline Storage Manager
// Manages local offline caching of Notes, Photos, Music, and Voice Memos
// ============================================================

const DB_NAME = "innervoice_offline_db";
const DB_VERSION = 1;

/**
 * Open or initialize the IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
export const openOfflineDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported in this browser environment."));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Notes store
      if (!db.objectStoreNames.contains("notes")) {
        const noteStore = db.createObjectStore("notes", { keyPath: "id" });
        noteStore.createIndex("updated_at", "updated_at", { unique: false });
      }

      // 2. Media Blobs store (Photos & Music audio binaries)
      if (!db.objectStoreNames.contains("media_blobs")) {
        const mediaBlobStore = db.createObjectStore("media_blobs", { keyPath: "id" });
        mediaBlobStore.createIndex("note_id", "note_id", { unique: false });
        mediaBlobStore.createIndex("media_type", "media_type", { unique: false });
      }

      // 3. Media Metadata store
      if (!db.objectStoreNames.contains("media_meta")) {
        const mediaMetaStore = db.createObjectStore("media_meta", { keyPath: "id" });
        mediaMetaStore.createIndex("note_id", "note_id", { unique: false });
        mediaMetaStore.createIndex("media_type", "media_type", { unique: false });
      }

      // 4. Voice Memos store
      if (!db.objectStoreNames.contains("voice_memos")) {
        db.createObjectStore("voice_memos", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Helper to execute an IDB transaction
 */
const withStore = async (storeName, mode, callback) => {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);

    let result;
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);

    try {
      result = callback(store);
    } catch (err) {
      reject(err);
    }
  });
};

// ============================================================
// NOTES OFFLINE CACHING
// ============================================================

/**
 * Cache a note and its media items (photos & music) for offline access
 */
export const cacheNoteForOffline = async (note, mediaItems = []) => {
  if (!note || !note.id) return;

  const db = await openOfflineDB();

  // 1. Save note
  const noteData = {
    ...note,
    isOfflineAvailable: true,
    offlineCachedAt: new Date().toISOString(),
  };

  await withStore("notes", "readwrite", (store) => store.put(noteData));

  // 2. Cache media attachments (download binary Blobs and store in media_blobs)
  for (const item of mediaItems) {
    if (!item.id || !item.file_url) continue;

    try {
      // Store metadata
      await withStore("media_meta", "readwrite", (metaStore) =>
        metaStore.put({
          ...item,
          note_id: note.id,
          isOfflineAvailable: true,
        })
      );

      // Download binary Blob if not already cached
      const existingBlob = await getOfflineMediaBlob(item.id);
      if (!existingBlob) {
        const resp = await fetch(item.file_url, { mode: "cors" });
        if (resp.ok) {
          const blob = await resp.blob();
          await withStore("media_blobs", "readwrite", (blobStore) =>
            blobStore.put({
              id: item.id,
              note_id: note.id,
              media_type: item.media_type,
              blob,
              mime_type: item.mime_type || blob.type,
              size: blob.size,
              cachedAt: new Date().toISOString(),
            })
          );
        }
      }
    } catch (err) {
      console.warn(`[OfflineStorage] Failed to cache media ${item.id}:`, err);
    }
  }

  return noteData;
};

/**
 * Remove a note and its media from offline cache (local cache purge only)
 */
export const removeNoteFromOffline = async (noteId) => {
  if (!noteId) return;

  // 1. Remove note
  await withStore("notes", "readwrite", (store) => store.delete(noteId));

  // 2. Find and delete associated media
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(["media_meta", "media_blobs"], "readwrite");
    const metaStore = tx.objectStore("media_meta");
    const blobStore = tx.objectStore("media_blobs");
    const index = metaStore.index("note_id");

    const req = index.getAll(noteId);
    req.onsuccess = () => {
      const items = req.result || [];
      items.forEach((item) => {
        metaStore.delete(item.id);
        blobStore.delete(item.id);
      });
    };
  } catch (err) {
    console.warn("[OfflineStorage] Error removing media for note:", err);
  }
};

/**
 * Check if a note is cached offline
 */
export const isNoteOfflineCached = async (noteId) => {
  if (!noteId) return false;
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction("notes", "readonly");
      const store = tx.objectStore("notes");
      const req = store.get(noteId);
      req.onsuccess = () => resolve(Boolean(req.result));
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
};

/**
 * Retrieve cached note from IndexedDB
 */
export const getOfflineNote = async (noteId) => {
  if (!noteId) return null;
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction("notes", "readonly");
      const store = tx.objectStore("notes");
      const req = store.get(noteId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

/**
 * Retrieve all offline cached notes
 */
export const getAllOfflineNotes = async () => {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction("notes", "readonly");
      const store = tx.objectStore("notes");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

// ============================================================
// MEDIA & MUSIC OFFLINE CACHING
// ============================================================

/**
 * Cache an individual media track/photo offline
 */
export const cacheMediaItemOffline = async (mediaItem) => {
  if (!mediaItem || !mediaItem.id || !mediaItem.file_url) return null;

  try {
    // 1. Fetch remote audio/image as Blob
    const res = await fetch(mediaItem.file_url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();

    // 2. Save Blob
    await withStore("media_blobs", "readwrite", (store) =>
      store.put({
        id: mediaItem.id,
        note_id: mediaItem.note_id || null,
        media_type: mediaItem.media_type,
        blob,
        mime_type: mediaItem.mime_type || blob.type,
        size: blob.size,
        cachedAt: new Date().toISOString(),
      })
    );

    // 3. Save Metadata
    await withStore("media_meta", "readwrite", (store) =>
      store.put({
        ...mediaItem,
        isOfflineAvailable: true,
        file_size: blob.size,
      })
    );

    return true;
  } catch (err) {
    console.error(`[OfflineStorage] Failed to cache media ${mediaItem.id}:`, err);
    throw err;
  }
};

/**
 * Remove an individual media track from offline cache
 */
export const removeMediaItemOffline = async (mediaId) => {
  if (!mediaId) return;
  await withStore("media_blobs", "readwrite", (store) => store.delete(mediaId));
  await withStore("media_meta", "readwrite", (store) => store.delete(mediaId));
};

/**
 * Check if a media item is cached offline
 */
export const isMediaOfflineCached = async (mediaId) => {
  if (!mediaId) return false;
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction("media_blobs", "readonly");
      const store = tx.objectStore("media_blobs");
      const req = store.get(mediaId);
      req.onsuccess = () => resolve(Boolean(req.result));
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
};

/**
 * Retrieve binary Blob for a media item (creates and returns an object URL or raw Blob)
 */
export const getOfflineMediaBlob = async (mediaId) => {
  if (!mediaId) return null;
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction("media_blobs", "readonly");
      const store = tx.objectStore("media_blobs");
      const req = store.get(mediaId);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

/**
 * Get all cached media metadata items for a note
 */
export const getOfflineMediaForNote = async (noteId) => {
  if (!noteId) return [];
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction("media_meta", "readonly");
      const store = tx.objectStore("media_meta");
      const index = store.index("note_id");
      const req = index.getAll(noteId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

/**
 * Get all cached music tracks in the global music library
 */
export const getAllOfflineMusicTracks = async () => {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction("media_meta", "readonly");
      const store = tx.objectStore("media_meta");
      const index = store.index("media_type");
      const req = index.getAll("music");
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

// ============================================================
// VOICE MEMO OFFLINE CACHING
// ============================================================

/**
 * Cache a Voice Memo offline
 */
export const cacheVoiceMemoOffline = async (voiceMemo) => {
  if (!voiceMemo || !voiceMemo.id || !voiceMemo.file_url) return;

  try {
    const res = await fetch(voiceMemo.file_url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();

    await withStore("voice_memos", "readwrite", (store) =>
      store.put({
        ...voiceMemo,
        blob,
        isOfflineAvailable: true,
        file_size: blob.size,
        cachedAt: new Date().toISOString(),
      })
    );
    return true;
  } catch (err) {
    console.error(`[OfflineStorage] Failed to cache voice memo ${voiceMemo.id}:`, err);
    throw err;
  }
};

/**
 * Remove a Voice Memo from offline storage
 */
export const removeVoiceMemoOffline = async (memoId) => {
  if (!memoId) return;
  await withStore("voice_memos", "readwrite", (store) => store.delete(memoId));
};

/**
 * Check if a Voice Memo is cached offline
 */
export const isVoiceMemoOfflineCached = async (memoId) => {
  if (!memoId) return false;
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction("voice_memos", "readonly");
      const store = tx.objectStore("voice_memos");
      const req = store.get(memoId);
      req.onsuccess = () => resolve(Boolean(req.result));
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
};

/**
 * Retrieve cached Voice Memo Blob
 */
export const getOfflineVoiceMemoBlob = async (memoId) => {
  if (!memoId) return null;
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction("voice_memos", "readonly");
      const store = tx.objectStore("voice_memos");
      const req = store.get(memoId);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

// ============================================================
// STORAGE USAGE & QUOTA ESTIMATION
// ============================================================

/**
 * Format bytes into human-readable string (e.g. 14.5 MB)
 */
export const formatStorageBytes = (bytes = 0) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Get accurate offline storage quota and current usage
 */
export const getOfflineStorageUsage = async () => {
  try {
    let usageBytes = 0;
    let quotaBytes = 0;

    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      usageBytes = estimate.usage || 0;
      quotaBytes = estimate.quota || 0;
    }

    const [notes, music] = await Promise.all([
      getAllOfflineNotes(),
      getAllOfflineMusicTracks(),
    ]);

    return {
      usageBytes,
      quotaBytes,
      formattedUsage: formatStorageBytes(usageBytes),
      formattedQuota: formatStorageBytes(quotaBytes),
      notesCount: notes.length,
      musicCount: music.length,
    };
  } catch (err) {
    console.warn("[OfflineStorage] Estimate error:", err);
    return {
      usageBytes: 0,
      quotaBytes: 0,
      formattedUsage: "0 B",
      formattedQuota: "Unlimited",
      notesCount: 0,
      musicCount: 0,
    };
  }
};
