import { useState, useEffect } from "react";
import { Edit3, Check, Eye, Sparkles, HardDriveDownload, Loader2 } from "lucide-react";
import PhotoGallerySection from "./media/PhotoGallerySection";
import MemoryMusicSection from "./media/MemoryMusicSection";
import { getNoteMedia } from "../../api/media";
import {
  cacheNoteForOffline,
  removeNoteFromOffline,
  isNoteOfflineCached,
  getOfflineMediaForNote,
} from "../../utils/offlineStorage";

export default function NoteDisplayCard({
  note,
  onUpdateContent,
  onOpenFullEdit,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  // Attached media state
  const [photos, setPhotos] = useState([]);
  const [musicTracks, setMusicTracks] = useState([]);
  const [isOfflineCached, setIsOfflineCached] = useState(false);
  const [cachingNote, setCachingNote] = useState(false);

  const defaultContent = `#1 Personal Growth Journey

* Today was productive... *Reading *Atomic Habits*.

## Key Insights:
- Need to focus on consistency.

**Action Item:** Daily 15-min journaling.`;

  useEffect(() => {
    if (note) {
      setContent(note.content || defaultContent);
      setTitle(note.title || "October 26: Evening Reflections");
    } else {
      setContent(defaultContent);
      setTitle("October 26: Evening Reflections");
    }
  }, [note]);

  // Load attached media (photos and music) for this note
  useEffect(() => {
    let active = true;

    const loadMedia = async () => {
      if (!note?.id) {
        setPhotos([]);
        setMusicTracks([]);
        setIsOfflineCached(false);
        return;
      }

      // 1. Check offline status
      const cached = await isNoteOfflineCached(note.id);
      if (active) setIsOfflineCached(cached);

      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

      if (isOffline) {
        // Load from IndexedDB
        const offlineItems = await getOfflineMediaForNote(note.id);
        if (active) {
          setPhotos(offlineItems.filter((m) => m.media_type === "photo"));
          setMusicTracks(offlineItems.filter((m) => m.media_type === "music"));
        }
      } else {
        // Fetch from backend
        try {
          const res = await getNoteMedia(note.id);
          const allMedia = res.data?.media || [];
          if (active) {
            setPhotos(allMedia.filter((m) => m.media_type === "photo"));
            setMusicTracks(allMedia.filter((m) => m.media_type === "music"));
          }
        } catch {
          // Fallback to local offline cache if network error
          const offlineItems = await getOfflineMediaForNote(note.id);
          if (active) {
            setPhotos(offlineItems.filter((m) => m.media_type === "photo"));
            setMusicTracks(offlineItems.filter((m) => m.media_type === "music"));
          }
        }
      }
    };

    loadMedia();

    return () => {
      active = false;
    };
  }, [note?.id]);

  // Toggle offline caching for this entire note + its media
  const handleToggleNoteOffline = async () => {
    if (!note?.id) return;
    setCachingNote(true);

    try {
      if (isOfflineCached) {
        await removeNoteFromOffline(note.id);
        setIsOfflineCached(false);
      } else {
        const allMedia = [...photos, ...musicTracks];
        await cacheNoteForOffline(note, allMedia);
        setIsOfflineCached(true);
      }
    } catch (err) {
      console.error("Failed to toggle note offline cache:", err);
      alert("Could not update offline storage for this note.");
    } finally {
      setCachingNote(false);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);

    if (onUpdateContent && note) {
      onUpdateContent(note.id, content, title);
    }
  };

  // Helper to render markdown-like styles matching the exact reference image
  const renderStyledContent = (rawText) => {
    const lines = rawText.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading 1 (like #1 Personal Growth Journey)
      if (trimmed.startsWith("#1 ") || trimmed.startsWith("# ")) {
        const text = trimmed.replace(/^#+1?\s*/, "");
        return (
          <h2
            key={idx}
            className="text-lg sm:text-xl md:text-2xl font-bold text-sky-400 tracking-tight mb-3 sm:mb-4 flex flex-wrap items-center gap-2 break-words"
          >
            <span>#1</span>
            <span className="break-all sm:break-words">{text}</span>
          </h2>
        );
      }

      // Heading 2 (like ## Key Insights:)
      if (trimmed.startsWith("## ")) {
        const text = trimmed.replace(/^##\s*/, "");
        return (
          <h3
            key={idx}
            className="text-base sm:text-lg md:text-xl font-bold text-sky-400/90 tracking-tight mt-5 mb-2 break-words"
          >
            ## {text}
          </h3>
        );
      }

      // Action Item (like **Action Item:** Daily 15-min journaling.)
      if (trimmed.startsWith("**Action Item:**") || trimmed.includes("Action Item")) {
        return (
          <div
            key={idx}
            className="mt-5 p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed break-words"
          >
            <span className="font-bold text-[#e2b17a]">**Action Item:**</span>
            <span className="ml-1 text-slate-200">
              {trimmed.replace("**Action Item:**", "").trim()}
            </span>
          </div>
        );
      }

      // Bullet points
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const text = trimmed.substring(2);
        return (
          <div
            key={idx}
            className="flex items-start gap-2.5 my-2 text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed pl-1 break-words"
          >
            <span className="text-[#e2b17a] mt-1 shrink-0">•</span>
            <span className="break-words min-w-0">{text}</span>
          </div>
        );
      }

      // Empty line
      if (!trimmed) {
        return <div key={idx} className="h-2 sm:h-3" />;
      }

      // Regular text
      return (
        <p
          key={idx}
          className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed my-1.5 break-words"
        >
          {line}
        </p>
      );
    });
  };

  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden text-white transition-all shadow-[0_20px_50px_rgba(0,0,0,0.55)] h-auto min-h-0 flex flex-col justify-start min-w-0">
      {/* Top subtle glow */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#e2b17a]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Card Header & Controls */}
      <div className="relative z-10 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/5 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#e2b17a] truncate">
              <Sparkles size={14} className="shrink-0" />
              <span className="truncate">{note?.category || "Journal Entry"}</span>
            </div>
            {justSaved && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium animate-pulse shrink-0">
                <Check size={11} /> Saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Available Offline Toggle Button */}
            {note?.id && (
              <button
                onClick={handleToggleNoteOffline}
                disabled={cachingNote}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer min-h-[38px] ${
                  isOfflineCached
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                    : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
                title={
                  isOfflineCached
                    ? "Available Offline (Click to remove offline copy)"
                    : "Make this note and its media available offline"
                }
                aria-label="Toggle offline note"
              >
                {cachingNote ? (
                  <Loader2 size={13} className="animate-spin text-[#e2b17a]" />
                ) : isOfflineCached ? (
                  <Check size={13} className="text-emerald-400" />
                ) : (
                  <HardDriveDownload size={13} />
                )}
                <span>{isOfflineCached ? "Offline Ready" : "Make Offline"}</span>
              </button>
            )}

            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl btn-champagne text-xs font-medium transition cursor-pointer min-h-[38px]"
                aria-label="Save note changes"
              >
                <Check size={13} />
                <span>Save</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 text-slate-300 hover:text-[#e2b17a] hover:bg-white/10 text-xs font-medium transition cursor-pointer min-h-[38px]"
                title="Quick edit note"
                aria-label="Quick edit note"
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
            )}

            {onOpenFullEdit && (
              <button
                onClick={onOpenFullEdit}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                title="Full note details"
                aria-label="Full note details"
              >
                <Eye size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
                Note Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#111315]/80 border border-white/15 focus:border-[#e2b17a] rounded-xl px-3.5 py-2 text-white font-semibold text-sm focus:outline-none"
                placeholder="Entry title..."
              />
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
                Markdown Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full bg-[#111315]/80 border border-white/15 focus:border-[#e2b17a] rounded-2xl p-3.5 sm:p-4 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-none"
                placeholder="Write your thoughts..."
              />
            </div>
          </div>
        ) : (
          <div className="py-1 sm:py-2 pr-1 font-sans select-text [overflow-wrap:anywhere]">
            {renderStyledContent(content)}
          </div>
        )}

        {/* 📷 Attached Photos Gallery */}
        <PhotoGallerySection
          noteId={note?.id}
          photos={photos}
          onPhotosChange={setPhotos}
          isLocked={Boolean(note?.is_locked)}
        />

        {/* 🎵 Attached Memory Music Tracks */}
        <MemoryMusicSection
          noteId={note?.id}
          parentNote={note}
          musicTracks={musicTracks}
          onTracksChange={setMusicTracks}
          isLocked={Boolean(note?.is_locked)}
        />
      </div>

      {/* Footer info */}
      <div className="pt-3 mt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>
          {content.split(/\s+/).filter(Boolean).length} words
        </span>
        <span className="text-slate-400">
          Markdown supported
        </span>
      </div>
    </div>
  );
}
