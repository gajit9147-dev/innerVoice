import React, { useState, useEffect } from "react";
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

  // Format date parts
  const noteDate = note?.created_at ? new Date(note.created_at) : new Date();
  const dayNumber = noteDate.getDate();
  const monthYear = noteDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const dayOfWeek = noteDate.toLocaleDateString("en-US", { weekday: "short" });

  // Attached media detection
  // 1. Photos
  const attachedPhoto =
    note?.photos?.[0]?.file_url ||
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

  return (
    <GlassSurface
      level={1}
      className="p-5 sm:p-6 rounded-3xl relative overflow-hidden transition-all duration-300 hover:border-white/[0.14] hover:shadow-[0_24px_56px_rgba(0,0,0,0.7)] group"
    >
      {/* Top Right Context Menu */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1.5 rounded-lg text-[#9e9990] hover:text-[#f5f2eb] hover:bg-white/[0.06] transition"
          aria-label="Note options"
        >
          <MoreVertical size={16} />
        </button>

        {showMenu && (
          <GlassSurface
            level={3}
            className="absolute right-0 top-8 w-40 py-1.5 z-30 shadow-2xl rounded-xl text-xs"
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
                    className="w-full flex items-center gap-2 px-3 py-2 text-[#d1cdc7] hover:text-white hover:bg-white/[0.06] transition"
                  >
                    <Pencil size={13} />
                    <span>Edit Note</span>
                  </button>
                )}

                {onFavorite && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onFavorite(note.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[#d1cdc7] hover:text-white hover:bg-white/[0.06] transition"
                  >
                    <Star
                      size={13}
                      className={note?.is_favorite ? "text-[#e2b17a] fill-[#e2b17a]" : ""}
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
                      onPin(note.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[#d1cdc7] hover:text-white hover:bg-white/[0.06] transition"
                  >
                    <Pin
                      size={13}
                      className={note?.is_pinned ? "text-[#e2b17a] fill-[#e2b17a]" : ""}
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
                    className="w-full flex items-center gap-2 px-3 py-2 text-[#d1cdc7] hover:text-white hover:bg-white/[0.06] transition"
                  >
                    <Lock size={13} />
                    <span>{note?.is_locked ? "Unlock" : "Protect"}</span>
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete(note.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 size={13} />
                    <span>Move to Trash</span>
                  </button>
                )}
              </>
            ) : (
              <>
                {onRestore && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onRestore(note.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-emerald-400 hover:bg-emerald-500/10 transition"
                  >
                    <RotateCcw size={13} />
                    <span>Restore Note</span>
                  </button>
                )}
                {onDeleteForever && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDeleteForever(note.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 size={13} />
                    <span>Delete Forever</span>
                  </button>
                )}
              </>
            )}
          </GlassSurface>
        )}
      </div>

      {/* Main Grid: Date Column | Content & Media Player | Photo Attachment */}
      <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6 pr-6">
        {/* 1. Left Vertical Date Block */}
        <div className="shrink-0 flex md:flex-col items-baseline md:items-start gap-1.5 md:gap-0 min-w-[65px] pt-1">
          <div className="font-serif text-3xl sm:text-4xl text-[#f5f2eb] font-normal leading-none">
            {dayNumber}
          </div>
          <div className="text-xs font-serif text-[#9e9990] mt-1">
            {monthYear}
          </div>
          <div className="text-[11px] font-sans uppercase tracking-wider text-[#9e9990]/80">
            {dayOfWeek}
          </div>
          {note?.is_pinned ? (
            <span className="mt-2 text-[#e2b17a]" title="Pinned note">
              <Pin size={12} fill="currentColor" />
            </span>
          ) : null}
        </div>

        {/* 2. Middle Column: Title, Body Text, Embedded Player, Handwritten sign-off */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Note Title (Serif Italic) */}
            <h2 className="font-serif italic text-lg sm:text-xl text-[#f5f2eb] tracking-tight leading-snug break-words">
              {note?.title || "Untitled Reflection"}
            </h2>

            {/* Note Content */}
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
              <p className="text-xs sm:text-sm text-[#9e9990] mt-2 leading-relaxed line-clamp-3 break-words font-sans">
                {note?.content || "No thoughts recorded yet..."}
              </p>
            )}

            {/* Embedded Level 2 Inner Glass Music Player */}
            {musicTrack && (
              <GlassSurface
                level={2}
                className="mt-4 p-3 rounded-2xl flex items-center gap-3.5 max-w-md"
              >
                {/* Album artwork */}
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-black/40 shrink-0 relative">
                  <img
                    src={musicTrack.artwork_url || "/assets/sunset_skyline.jpg"}
                    alt={musicTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Track Details */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#f5f2eb] truncate">
                    {musicTrack.title || "Night Changes"}
                  </div>
                  <div className="text-[11px] text-[#9e9990] truncate">
                    {musicTrack.artist || "One Direction"}
                  </div>

                  {/* Progress slider bar */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#e2b17a] rounded-full transition-all"
                        style={{ width: isThisMusicPlaying ? "70%" : "45%" }}
                      />
                    </div>
                    <span className="text-[10px] text-[#9e9990] font-mono shrink-0">
                      {musicTrack.currentTimeFormatted || "02:41"} / {musicTrack.durationFormatted || "03:58"}
                    </span>
                  </div>
                </div>

                {/* Play / Pause button */}
                <button
                  type="button"
                  onClick={handleMusicPlay}
                  className="w-8 h-8 rounded-full bg-[#f5f2eb] text-[#1a140d] hover:bg-[#e2b17a] transition flex items-center justify-center shrink-0 cursor-pointer shadow-md"
                  aria-label="Play music"
                >
                  {isThisMusicPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>
              </GlassSurface>
            )}

            {/* Embedded Level 2 Inner Glass Voice Waveform Player */}
            {voiceMemo && (
              <GlassSurface
                level={2}
                className="mt-4 p-3 rounded-2xl flex items-center gap-3.5 max-w-md"
              >
                {/* Play / Pause */}
                <button
                  type="button"
                  onClick={handleVoicePlay}
                  className="w-8 h-8 rounded-full bg-[#f5f2eb] text-[#1a140d] hover:bg-[#e2b17a] transition flex items-center justify-center shrink-0 cursor-pointer shadow-md"
                  aria-label="Play voice memo"
                >
                  {isLocalAudioPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>

                {/* Waveform graphic bars */}
                <div className="flex-1 flex items-center gap-0.5 h-6">
                  {[4, 8, 12, 18, 14, 22, 16, 24, 18, 10, 14, 20, 16, 8, 12, 22, 14, 10, 6, 14, 18, 12, 8, 4].map(
                    (height, idx) => (
                      <span
                        key={idx}
                        className={`w-1 rounded-full transition-all ${
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
                <span className="text-[10px] text-[#9e9990] font-mono shrink-0">
                  {voiceMemo.currentTimeFormatted || "01:24"} / {voiceMemo.durationFormatted || "04:18"}
                </span>
              </GlassSurface>
            )}
          </div>

          {/* Bottom Handwritten Sign-off */}
          <div className="mt-4 pt-1 flex justify-end">
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
              className="w-full md:w-44 lg:w-52 h-36 sm:h-40 rounded-2xl overflow-hidden shrink-0 bg-black/40 border border-white/[0.08] relative group/photo cursor-pointer"
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
