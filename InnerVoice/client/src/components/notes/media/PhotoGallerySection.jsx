// ============================================================
// client/src/components/notes/media/PhotoGallerySection.jsx
// Note Photo Attachments: Grid gallery, Lightbox preview, Next/Previous, Delete
// Supports local offline caching and secure Cloudinary storage
// ============================================================

import { useState, useEffect, useRef } from "react";
import {
  Camera,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Image as ImageIcon,
  ZoomIn,
} from "lucide-react";
import { uploadMediaFile, deleteMediaItem } from "../../../api/media";
import { getOfflineMediaBlob } from "../../../utils/offlineStorage";
import { useToast } from "../../../context/ToastContext";

export default function PhotoGallerySection({
  noteId,
  photos = [],
  onPhotosChange,
  isLocked = false,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [photoBlobs, setPhotoBlobs] = useState({});
  const { addToast } = useToast();

  // Check for local offline Blobs if images fail or offline
  useEffect(() => {
    let active = true;
    const loadOfflineBlobs = async () => {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      if (!isOffline) return;

      const blobs = {};
      for (const p of photos) {
        if (p.id) {
          try {
            const blob = await getOfflineMediaBlob(p.id);
            if (blob && active) {
              blobs[p.id] = URL.createObjectURL(blob);
            }
          } catch (err) {
            console.warn("Could not load offline photo Blob:", err);
          }
        }
      }
      if (active) setPhotoBlobs(blobs);
    };

    if (photos.length > 0) {
      loadOfflineBlobs();
    }

    return () => {
      active = false;
      Object.values(photoBlobs).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photos]);

  // Handle Photo file upload
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Please upload a valid image file (JPEG, PNG, WEBP, or GIF).", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast("Image size exceeds the 10MB limit.", "error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("media_type", "photo");
    if (noteId) {
      formData.append("note_id", noteId);
    }
    formData.append("title", file.name.replace(/\.[^/.]+$/, ""));

    try {
      const res = await uploadMediaFile(formData);
      if (res.data?.media) {
        if (onPhotosChange) {
          onPhotosChange([...photos, res.data.media]);
        }
        addToast("Photo attached to note", "success");
      }
    } catch (err) {
      console.error("Upload photo error:", err);
      addToast(err.response?.data?.message || "Failed to upload photo. Please try again.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Delete photo
  const handleDeletePhoto = async (photoId, e) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this photo from your note?")) return;

    setDeletingId(photoId);
    try {
      await deleteMediaItem(photoId);
      if (onPhotosChange) {
        onPhotosChange(photos.filter((p) => p.id !== photoId));
      }
      if (activeLightboxIndex !== null) {
        setActiveLightboxIndex(null);
      }
      addToast("Photo removed", "success");
    } catch (err) {
      console.error("Delete photo error:", err);
      addToast("Failed to delete photo.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Lightbox keyboard navigation
  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveLightboxIndex(null);
      } else if (e.key === "ArrowLeft" && activeLightboxIndex > 0) {
        setActiveLightboxIndex((prev) => prev - 1);
      } else if (e.key === "ArrowRight" && activeLightboxIndex < photos.length - 1) {
        setActiveLightboxIndex((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxIndex, photos.length]);

  return (
    <div className="mt-6 pt-5 border-t border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Camera size={15} className="text-pink-400 shrink-0" />
          <span>Photos & Visuals ({photos.length})</span>
        </div>

        {!isLocked && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-xs font-medium transition cursor-pointer disabled:opacity-50"
              aria-label="Attach photo to note"
            >
              {uploading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Plus size={13} />
                  <span>Add Photo</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Thumbnails Grid */}
      {photos.length === 0 ? (
        <div className="rounded-2xl p-4 border border-dashed border-white/10 bg-white/[0.02] text-center text-xs text-slate-400">
          No photos attached to this memory yet. Click &quot;Add Photo&quot; to capture a visual moment.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
          {photos.map((photo, idx) => {
            const imgSrc = photoBlobs[photo.id] || photo.file_url;
            return (
              <div
                key={photo.id || idx}
                onClick={() => setActiveLightboxIndex(idx)}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-white/10 hover:border-pink-500/50 transition cursor-pointer shadow-lg"
              >
                <img
                  src={imgSrc}
                  alt={photo.title || "Note Photo"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback placeholder if image load fails
                    e.currentTarget.style.display = "none";
                  }}
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => handleDeletePhoto(photo.id, e)}
                      disabled={deletingId === photo.id}
                      className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition cursor-pointer"
                      title="Delete photo"
                      aria-label="Delete photo"
                    >
                      {deletingId === photo.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-200 font-medium truncate">
                    <ZoomIn size={12} className="shrink-0 text-pink-400" />
                    <span className="truncate">{photo.title || "View Full Photo"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {activeLightboxIndex !== null && photos[activeLightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
          onClick={() => setActiveLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between pb-3 text-white text-xs font-medium">
              <span className="truncate max-w-xs sm:max-w-md font-semibold">
                {photos[activeLightboxIndex].title || "Photo Preview"} (
                {activeLightboxIndex + 1} of {photos.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeletePhoto(photos[activeLightboxIndex].id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setActiveLightboxIndex(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                  title="Close preview (Esc)"
                  aria-label="Close photo preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Photo View */}
            <div className="relative w-full max-h-[78vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/10 shadow-2xl">
              <img
                src={photoBlobs[photos[activeLightboxIndex].id] || photos[activeLightboxIndex].file_url}
                alt="Full Preview"
                className="max-h-[76vh] max-w-full object-contain rounded-xl"
              />

              {/* Prev / Next controls */}
              {activeLightboxIndex > 0 && (
                <button
                  onClick={() => setActiveLightboxIndex((prev) => prev - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition cursor-pointer shadow-lg"
                  title="Previous photo (Left Arrow)"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              {activeLightboxIndex < photos.length - 1 && (
                <button
                  onClick={() => setActiveLightboxIndex((prev) => prev + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition cursor-pointer shadow-lg"
                  title="Next photo (Right Arrow)"
                  aria-label="Next photo"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
