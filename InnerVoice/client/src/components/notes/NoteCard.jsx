import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  MoreVertical,
  Pencil,
  Trash2,
  Pin,
  Star,
  Lock,
  RotateCcw,
  Volume2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import GlassSurface from "../glass/GlassSurface";
import { useAudioPlayer } from "../../context/AudioPlayerContext";

export default function NoteCard({
  note,
  onDelete,
  onEdit,
  onPin,
  onFavorite,
  onLock,
  onRestore,
  onDeleteForever,
  isTrash = false,
  isUnlocked = false,
}) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayer();
  const [showMenu, setShowMenu] = useState(false);
  const [isLocalAudioPlaying, setIsLocalAudioPlaying] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const menuRef = useRef(null);

  const noteId = note?.id ?? note?._id;

  // Dismiss context menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;

    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [showMenu]);

  // Format date parts
  const noteDate = note?.created_at ? new Date(note.created_at) : new Date();
  const dayNumber = noteDate.getDate();
  const monthYear = noteDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const dayOfWeek = noteDate.toLocaleDateString("en-US", { weekday: "short" });

  // Attached media detection
  // 1. Photos
  const attachedPhoto =
    note?.photos?.[0]?.file_url ||
    note?.photos?.[0]?.url ||
    note?.photo_url ||
    (note?.id === "demo-journal-1" ? "/assets/sunset_skyline.jpg" : null) ||
    (note?.id === "demo-journal-2" ? "/assets/coffee_notebook.jpg" : null);

  // 2. Music
  const musicTrack = note?.music?.[0] || note?.attached_music || (
    note?.id === "demo-journal-1"
      ? {
          id: "arijit-tum-hi-ho",
          title: "Tum Hi Ho",
          artist: "Arijit Singh",
          file_url: "/assets/music/tum_hi_ho.mp3",
          artwork_url: "/assets/music/cover_tum_hi_ho.jpg",
          duration: 262,
          durationFormatted: "04:22",
          currentTimeFormatted: "01:15",
        }
      : null
  );

  // 3. Voice Memo
  const voiceMemo = note?.voice_memo || note?.voice?.[0] || (
    note?.id === "demo-journal-2"
      ? {
          id: "demo-voice-1",
          title: "Clarity Session",
          durationFormatted: "04:18",
          currentTimeFormatted: "01:24",
        }
      : null
  );

  // Handwritten phrase selector
  const handwrittenPhrase =
    note?.handwritten_note ||
    (note?.id === "demo-journal-1"
      ? "Good things take time. ♡"
      : note?.id === "demo-journal-2"
      ? "Just me... ♡"
      : "Your story matters. ♡");

  // Check if current global track is this note's music
  const isThisMusicPlaying = isPlaying && currentTrack?.id === musicTrack?.id;

  const handleMusicPlay = (e) => {
    e.stopPropagation();
    if (!musicTrack) return;
    if (currentTrack?.id === musicTrack.id) {
      togglePlay();
    } else {
      playTrack(musicTrack, note);
    }
  };

  const handleVoicePlay = (e) => {
    e.stopPropagation();
    setIsLocalAudioPlaying((prev) => !prev);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete && noteId) {
      onDelete(noteId);
    }
  };

  return (
    <GlassSurface
      level={1}
      className="p-4 sm:p-6 rounded-3xl relative transition-all duration-300 hover:border-white/[0.14] hover:shadow-[0_24px_56px_rgba(0,0,0,0.7)] group w-full min-w-0"
    >
      {/* Top Right Context Menu */}
      <div ref={menuRef} className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-30">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className={`p-1.5 rounded-xl transition cursor-pointer ${
            showMenu
              ? "bg-white/[0.12] text-[#f5f2eb]"
              : "text-[#9e9990] hover:text-[#f5f2eb] hover:bg-white/[0.08]"
          }`}
          aria-label="Note options"
        >
          <MoreVertical size={17} />
        </button>

        {showMenu && (
          <GlassSurface
            level={3}
            className="absolute right-0 top-9 w-44 py-1.5 z-50 shadow-2xl rounded-2xl border border-white/[0.12] text-xs backdrop-blur-2xl animate-scale-up"
            style={{
              background: "rgba(20, 22, 28, 0.96)",
              boxShadow: "0 18px 45px rgba(0, 0, 0, 0.7), 0 0 1px rgba(255, 255, 255, 0.2)",
            }}
          >
            {!isTrash ? (
              <>
                {onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onEdit(note);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#d1cdc7] hover:text-white hover:bg-white/[0.06] transition text-left cursor-pointer"
                  >
                    <Pencil size={14} className="text-[#9e9990]" />
                    <span>Edit Note</span>
                  </button>
                )}

                {onFavorite && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onFavorite(noteId);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#d1cdc7] hover:text-white hover:bg-white/[0.06] transition text-left cursor-pointer"
                  >
                    <Star
                      size={14}
                      className={note?.is_favorite ? "text-[#e2b17a] fill-[#e2b17a]" : "text-[#9e9990]"}
                    />
                    <span>{note?.is_favorite ? "Unfavorite" : "Favorite"}</span>
                  </button>
                )}

                {onPin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onPin(noteId);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#d1cdc7] hover:text-white hover:bg-white/[0.06] transition text-left cursor-pointer"
                  >
                    <Pin
                      size={14}
                      className={note?.is_pinned ? "text-[#e2b17a] fill-[#e2b17a]" : "text-[#9e9990]"}
                    />
                    <span>{note?.is_pinned ? "Unpin Note" : "Pin Note"}</span>
                  </button>
                )}

                {onLock && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onLock(note);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#d1cdc7] hover:text-white hover:bg-white/[0.06] transition text-left cursor-pointer"
                  >
                    <Lock size={14} className="text-[#9e9990]" />
                    <span>{note?.is_locked ? "Unlock Note" : "Protect Note"}</span>
                  </button>
                )}

                {/* Divider */}
                <div className="h-px bg-white/[0.08] my-1 mx-2" />

                {/* Prominent Delete Option */}
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition text-left cursor-pointer font-medium"
                >
                  <Trash2 size={14} className="text-rose-400" />
                  <span>Delete Note</span>
                </button>
              </>
            ) : (
              <>
                {onRestore && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onRestore(noteId);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-emerald-400 hover:bg-emerald-500/15 transition text-left cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Restore Note</span>
                  </button>
                )}
                {onDeleteForever && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDeleteForever(noteId);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-400 hover:bg-rose-500/15 transition text-left cursor-pointer font-medium"
                  >
                    <Trash2 size={14} />
                    <span>Delete Forever</span>
                  </button>
                )}
              </>
            )}
          </GlassSurface>
        )}
      </div>

      {/* Main Grid: Date Column | Content & Media Player | Photo Attachment */}
      <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6 pr-6 w-full min-w-0">
        {/* 1. Left Vertical Date Block */}
        <div className="shrink-0 flex md:flex-col items-baseline md:items-start gap-1.5 md:gap-0 min-w-[55px] sm:min-w-[65px] pt-1">
          <div className="font-serif text-2xl sm:text-4xl text-[#f5f2eb] font-normal leading-none">
            {dayNumber}
          </div>
          <div className="text-xs font-serif text-[#9e9990] mt-0.5 sm:mt-1">
            {monthYear}
          </div>
          <div className="text-[10px] sm:text-[11px] font-sans uppercase tracking-wider text-[#9e9990]/80">
            {dayOfWeek}
          </div>
          {note?.is_pinned ? (
            <span className="mt-1.5 sm:mt-2 text-[#e2b17a]" title="Pinned note">
              <Pin size={12} fill="currentColor" />
            </span>
          ) : null}
        </div>

        {/* 2. Middle Column: Title, Body Text, Embedded Player, Handwritten sign-off */}
        <div className="flex-1 min-w-0 w-full flex flex-col justify-between overflow-hidden">
          <div className="min-w-0 w-full">
            {/* Note Title (Serif Italic) with bulletproof word wrap */}
            <h2 className="font-serif italic text-base sm:text-lg md:text-xl text-[#f5f2eb] tracking-tight leading-snug break-words [overflow-wrap:anywhere]">
              {note?.title || "Untitled Reflection"}
            </h2>

            {/* Note Content with overflow wrapping */}
            {note?.is_locked && !isUnlocked ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (onLock) onLock(note);
                }}
                className="mt-3 py-3 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3 cursor-pointer hover:bg-white/[0.05] transition"
              >
                <Lock size={16} className="text-[#e2b17a]" />
                <span className="text-xs text-[#9e9990]">
                  This note is protected. Click to unlock.
                </span>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[#9e9990] mt-2 leading-relaxed line-clamp-3 break-words [overflow-wrap:anywhere] font-sans">
                {note?.content || "No thoughts recorded yet..."}
              </p>
            )}

            {/* Embedded Level 2 Inner Glass Music Player */}
            {musicTrack && (
              <GlassSurface
                level={2}
                className="mt-3.5 sm:mt-4 p-2.5 sm:p-3 rounded-2xl flex items-center gap-2.5 sm:gap-3.5 w-full max-w-full overflow-hidden"
              >
                {/* Album artwork */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-black/40 shrink-0 relative">
                  <img
                    src={musicTrack.artwork_url || "/assets/sunset_skyline.jpg"}
                    alt={musicTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Track Details */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="text-xs font-semibold text-[#f5f2eb] truncate">
                    {musicTrack.title || "Night Changes"}
                  </div>
                  <div className="text-[11px] text-[#9e9990] truncate">
                    {musicTrack.artist || "One Direction"}
                  </div>

                  {/* Progress slider bar */}
                  <div className="flex items-center gap-2 mt-1 min-w-0">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden min-w-[40px]">
                      <div
                        className="h-full bg-[#e2b17a] rounded-full transition-all"
                        style={{ width: isThisMusicPlaying ? "70%" : "45%" }}
                      />
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-[#9e9990] font-mono shrink-0">
                      {musicTrack.currentTimeFormatted || "02:41"} / {musicTrack.durationFormatted || "03:58"}
                    </span>
                  </div>
                </div>

                {/* Play / Pause button */}
                <button
                  type="button"
                  onClick={handleMusicPlay}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#f5f2eb] text-[#1a140d] hover:bg-[#e2b17a] transition flex items-center justify-center shrink-0 cursor-pointer shadow-md"
                  aria-label="Play music"
                >
                  {isThisMusicPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                </button>
              </GlassSurface>
            )}

            {/* Embedded Level 2 Inner Glass Voice Waveform Player */}
            {voiceMemo && (
              <GlassSurface
                level={2}
                className="mt-3.5 sm:mt-4 p-2.5 sm:p-3 rounded-2xl flex items-center gap-2.5 sm:gap-3.5 w-full max-w-full overflow-hidden"
              >
                {/* Play / Pause */}
                <button
                  type="button"
                  onClick={handleVoicePlay}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#f5f2eb] text-[#1a140d] hover:bg-[#e2b17a] transition flex items-center justify-center shrink-0 cursor-pointer shadow-md"
                  aria-label="Play voice memo"
                >
                  {isLocalAudioPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                </button>

                {/* Waveform graphic bars with overflow protection */}
                <div className="flex-1 flex items-center gap-0.5 h-6 overflow-hidden min-w-0">
                  {[4, 8, 12, 18, 14, 22, 16, 24, 18, 10, 14, 20, 16, 8, 12, 22, 14, 10, 6, 14, 18, 12, 8, 4].map(
                    (height, idx) => (
                      <span
                        key={idx}
                        className={`w-1 rounded-full transition-all shrink-0 ${
                          isLocalAudioPlaying
                            ? "bg-[#e2b17a] wave-bar-active"
                            : "bg-[#9e9990]/60"
                        }`}
                        style={{
                          height: `${height}px`,
                          animationDelay: `${idx * 40}ms`,
                        }}
                      />
                    )
                  )}
                </div>

                {/* Duration */}
                <span className="text-[9px] sm:text-[10px] text-[#9e9990] font-mono shrink-0">
                  {voiceMemo.currentTimeFormatted || "01:24"} / {voiceMemo.durationFormatted || "04:18"}
                </span>
              </GlassSurface>
            )}
          </div>

          {/* Bottom Handwritten Sign-off */}
          <div className="mt-3 sm:mt-4 pt-1 flex justify-end">
            <span className="font-handwriting text-base sm:text-lg text-[#d1cdc7]/80 tracking-wide">
              {handwrittenPhrase}
            </span>
          </div>
        </div>

        {/* 3. Right Column: Attached Photo */}
        {attachedPhoto && (
          <>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="w-full md:w-44 lg:w-48 h-40 sm:h-44 md:h-36 lg:h-40 rounded-2xl overflow-hidden shrink-0 bg-black/40 border border-white/[0.08] relative group/photo cursor-pointer max-w-full"
              title="Click to view full photo"
            >
              <img
                src={attachedPhoto}
                alt="Memory moment"
                className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[11px] font-medium text-white bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20">
                  View Photo
                </span>
              </div>
            </div>

            {/* Full-resolution photo lightbox modal */}
            {isLightboxOpen && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(false);
                }}
                className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
              >
                <div
                  className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/20 shadow-2xl bg-black/70 flex flex-col items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={attachedPhoto}
                    alt="Memory full preview"
                    className="max-h-[82vh] w-auto max-w-full object-contain rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(false)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-white/20 transition cursor-pointer"
                    aria-label="Close photo preview"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </GlassSurface>
  );
}

