// ============================================================
// client/src/components/notes/media/MemoryMusicSection.jsx
// Memory Music System:
// - Multiple audio tracks per note
// - Interactive Liquid Glass Player (Play, Pause, Seek, Repeat, Volume)
// - Upload Audio (MP3, M4A/AAC, WAV, OGG, WebM) & Direct Audio Link import
// - Available Offline Toggle & IndexedDB Blob Caching
// ============================================================

import { useState, useEffect, useRef } from "react";
import {
  Music,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Heart,
  Download,
  Check,
  Trash2,
  Loader2,
  Link2,
  UploadCloud,
  X,
  Disc3,
  HardDriveDownload,
  AlertCircle,
} from "lucide-react";
import { useAudioPlayer } from "../../../context/AudioPlayerContext";
import { useToast } from "../../../context/ToastContext";
import {
  uploadMediaFile,
  importAudioResource,
  toggleFavoriteMedia,
  deleteMediaItem,
} from "../../../api/media";
import {
  cacheMediaItemOffline,
  removeMediaItemOffline,
  isMediaOfflineCached,
  getOfflineMediaBlob,
} from "../../../utils/offlineStorage";

export default function MemoryMusicSection({
  noteId,
  parentNote,
  musicTracks = [],
  onTracksChange,
  isLocked = false,
}) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isRepeating,
    isLoadingAudio,
    playTrack,
    togglePlay,
    seekTrack,
    setVolume,
    toggleRepeat,
  } = useAudioPlayer();

  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [offlineMap, setOfflineMap] = useState({});
  const [cachingTrackId, setCachingTrackId] = useState(null);

  // Add Music Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState("upload"); // "upload" | "url"
  const [uploadFile, setUploadFile] = useState(null);
  const [directUrl, setDirectUrl] = useState("");
  const [trackTitle, setTrackTitle] = useState("");
  const [trackArtist, setTrackArtist] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fileInputRef = useRef(null);

  // Active track being controlled by this note's player
  const activeTrack = musicTracks[activeTrackIndex] || musicTracks[0] || null;
  const isThisTrackActive = currentTrack && activeTrack && currentTrack.id === activeTrack.id;

  // Check offline status for all tracks
  useEffect(() => {
    let active = true;
    const checkAllOffline = async () => {
      const map = {};
      for (const t of musicTracks) {
        if (t.id) {
          map[t.id] = await isMediaOfflineCached(t.id);
        }
      }
      if (active) setOfflineMap(map);
    };
    checkAllOffline();
    return () => {
      active = false;
    };
  }, [musicTracks]);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs) || secs <= 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Toggle Play / Pause for selected track
  const handlePlaySelected = (track, idx) => {
    setActiveTrackIndex(idx);
    playTrack(track, parentNote);
  };

  // Toggle Favorite
  const handleToggleFav = async (trackId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await toggleFavoriteMedia(trackId);
      const isFav = res.data.is_favorite;
      onTracksChange(
        musicTracks.map((t) => (t.id === trackId ? { ...t, is_favorite: isFav } : t))
      );
    } catch (err) {
      console.error("Favorite toggle error:", err);
    }
  };

  // Toggle Offline caching for track
  const handleToggleOffline = async (track, e) => {
    if (e) e.stopPropagation();
    const isCurrentlyCached = offlineMap[track.id];
    setCachingTrackId(track.id);

    try {
      if (isCurrentlyCached) {
        await removeMediaItemOffline(track.id);
        setOfflineMap((prev) => ({ ...prev, [track.id]: false }));
        addToast("Audio removed from offline cache", "success");
      } else {
        await cacheMediaItemOffline(track);
        setOfflineMap((prev) => ({ ...prev, [track.id]: true }));
        addToast("Audio saved for offline playback", "success");
      }
    } catch (err) {
      console.error("Offline toggle error:", err);
      addToast("Failed to update offline storage. Please check connection.", "error");
    } finally {
      setCachingTrackId(null);
    }
  };

  // Delete Track permanently
  const handleDeleteTrack = async (trackId, e) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this music track?")) return;

    try {
      await deleteMediaItem(trackId);
      await removeMediaItemOffline(trackId);
      const updated = musicTracks.filter((t) => t.id !== trackId);
      onTracksChange(updated);
      if (activeTrackIndex >= updated.length) {
        setActiveTrackIndex(Math.max(0, updated.length - 1));
      }
      addToast("Music track deleted", "success");
    } catch (err) {
      console.error("Delete track error:", err);
      addToast("Failed to delete music track.", "error");
    }
  };

  // Download track directly to device
  const handleDownloadTrack = async (track, e) => {
    if (e) e.stopPropagation();
    try {
      const offlineItem = await getOfflineMediaBlob(track.id);
      let downloadUrl = "";
      let isBlob = false;

      if (offlineItem && offlineItem.blob) {
        downloadUrl = URL.createObjectURL(offlineItem.blob);
        isBlob = true;
      } else if (track.file_url) {
        if (track.file_url.includes("/upload/")) {
          downloadUrl = track.file_url.replace("/upload/", "/upload/fl_attachment/");
        } else {
          const res = await fetch(track.file_url);
          const blob = await res.blob();
          downloadUrl = URL.createObjectURL(blob);
          isBlob = true;
        }
      }

      if (!downloadUrl) return;

      const a = document.createElement("a");
      a.href = downloadUrl;
      const cleanTitle = (track.title || "memory-track").replace(/[^a-zA-Z0-9_-]/g, "_");
      const ext = track.mime_type?.includes("ogg")
        ? "ogg"
        : track.mime_type?.includes("wav")
        ? "wav"
        : track.mime_type?.includes("webm")
        ? "webm"
        : "mp3";
      a.download = `${cleanTitle}.${ext}`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (isBlob) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
      }
    } catch (err) {
      console.error("Download failed:", err);
      if (track.file_url) window.open(track.file_url, "_blank");
    }
  };

  // Submit Add Music
  const handleAddMusicSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      if (addMode === "upload") {
        if (!uploadFile) {
          setSubmitError("Please select an audio file to upload.");
          setIsSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("media_type", "music");
        if (noteId) formData.append("note_id", noteId);
        if (trackTitle) formData.append("title", trackTitle);
        if (trackArtist) formData.append("artist", trackArtist);

        const res = await uploadMediaFile(formData);
        if (res.data?.media) {
          onTracksChange([...musicTracks, res.data.media]);
          setShowAddModal(false);
          resetModalState();
        }
      } else {
        if (!directUrl.trim()) {
          setSubmitError("Please paste a direct audio URL.");
          setIsSubmitting(false);
          return;
        }

        const res = await importAudioResource({
          url: directUrl.trim(),
          title: trackTitle.trim() || undefined,
          artist: trackArtist.trim() || undefined,
          note_id: noteId || undefined,
        });

        if (res.data?.media) {
          onTracksChange([...musicTracks, res.data.media]);
          setShowAddModal(false);
          resetModalState();
        }
      }
    } catch (err) {
      console.error("Add music error:", err);
      setSubmitError(
        err.response?.data?.message || err.message || "Failed to add music. Please check the URL/file."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModalState = () => {
    setUploadFile(null);
    setDirectUrl("");
    setTrackTitle("");
    setTrackArtist("");
    setSubmitError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const currentProgress = isThisTrackActive && duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mt-6 pt-5 border-t border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d1cdc7]">
          <Music size={15} className="text-[#e2b17a] shrink-0" />
          <span>Memory Music ({musicTracks.length})</span>
        </div>

        {!isLocked && (
          <button
            onClick={() => {
              resetModalState();
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#e2b17a]/30 text-[#d1cdc7] hover:text-[#f5f1e8] text-xs font-medium transition cursor-pointer"
            aria-label="Add music track to note"
          >
            <Plus size={13} />
            <span>Add Music</span>
          </button>
        )}
      </div>

      {/* Main Music Player Card if tracks exist */}
      {musicTracks.length > 0 && activeTrack ? (
        <div className="mb-4 rounded-2xl glass-inner p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#e2b17a]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Track Header & Waveform */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-[#111315] border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                <Disc3
                  size={24}
                  className={`text-[#e2b17a] ${isThisTrackActive && isPlaying ? "animate-spin" : ""}`}
                  style={{ animationDuration: "5s" }}
                />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white truncate tracking-tight">
                  {activeTrack.title || "Memory Audio"}
                </h3>
                <p className="text-xs text-[#9e9990] truncate">
                  {activeTrack.artist || "Personal Recording"}
                </p>
              </div>
            </div>

            {/* Offline & Favorite Icons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={(e) => handleToggleOffline(activeTrack, e)}
                disabled={cachingTrackId === activeTrack.id}
                className={`p-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-1 border ${
                  offlineMap[activeTrack.id]
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                }`}
                title={offlineMap[activeTrack.id] ? "Available Offline (Click to remove local cache)" : "Make available offline"}
                aria-label="Toggle offline music"
              >
                {cachingTrackId === activeTrack.id ? (
                  <Loader2 size={13} className="animate-spin text-cyan-400" />
                ) : offlineMap[activeTrack.id] ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="hidden sm:inline text-[10px]">Offline</span>
                  </>
                ) : (
                  <>
                    <HardDriveDownload size={13} />
                    <span className="hidden sm:inline text-[10px]">Cache</span>
                  </>
                )}
              </button>

              <button
                onClick={(e) => handleToggleFav(activeTrack.id, e)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-pink-400 transition cursor-pointer"
                title="Toggle favorite"
                aria-label="Toggle favorite"
              >
                <Heart
                  size={14}
                  className={activeTrack.is_favorite ? "fill-pink-500 text-pink-500" : ""}
                />
              </button>
            </div>
          </div>

          {/* Interactive Seek Bar */}
          <div className="space-y-1 my-3">
            <input
              type="range"
              min={0}
              max={isThisTrackActive && duration > 0 ? duration : activeTrack.duration_seconds || 100}
              value={isThisTrackActive ? currentTime : 0}
              onChange={(e) => {
                if (isThisTrackActive) {
                  seekTrack(parseFloat(e.target.value));
                }
              }}
              disabled={!isThisTrackActive}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#e2b17a] disabled:opacity-50"
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-[#9e9990]">
              <span>{isThisTrackActive ? formatTime(currentTime) : "0:00"}</span>
              <span>
                {isThisTrackActive
                  ? formatTime(duration)
                  : formatTime(activeTrack.duration_seconds)}
              </span>
            </div>
          </div>

          {/* Playback Controls Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Loop / Repeat */}
            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isRepeating
                  ? "bg-[#e2b17a]/20 border-[#e2b17a]/40 text-[#e2b17a]"
                  : "bg-white/5 border-white/10 text-[#9e9990] hover:text-white"
              }`}
              title={isRepeating ? "Repeat enabled" : "Enable repeat"}
              aria-label="Repeat music"
            >
              <RotateCcw size={14} />
            </button>

            {/* Play / Pause Main Button */}
            <button
              onClick={() => handlePlaySelected(activeTrack, activeTrackIndex)}
              className="w-12 h-12 rounded-full btn-champagne flex items-center justify-center transition cursor-pointer"
              aria-label={isThisTrackActive && isPlaying ? "Pause music" : "Play music"}
            >
              {isLoadingAudio ? (
                <Loader2 size={18} className="animate-spin text-[#1a140d]" />
              ) : isThisTrackActive && isPlaying ? (
                <Pause size={18} className="text-[#1a140d]" />
              ) : (
                <Play size={18} className="ml-0.5 text-[#1a140d]" />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 text-[#9e9990]">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                className="p-1.5 hover:text-white transition cursor-pointer"
                aria-label="Toggle mute"
              >
                {volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#e2b17a]"
                aria-label="Volume slider"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Track List */}
      {musicTracks.length === 0 ? (
        <div className="rounded-2xl p-4 border border-dashed border-white/10 bg-white/[0.02] text-center text-xs text-[#9e9990]">
          No music attached to this note. Click &quot;Add Music&quot; to attach personal soundtrack memories.
        </div>
      ) : (
        <div className="space-y-2">
          {musicTracks.map((track, idx) => {
            const isPlayingThis = isThisTrackActive && isPlaying && activeTrackIndex === idx;
            const isOffline = offlineMap[track.id];

            return (
              <div
                key={track.id || idx}
                onClick={() => handlePlaySelected(track, idx)}
                className={`group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl border transition cursor-pointer ${
                  activeTrackIndex === idx
                    ? "bg-white/[0.06] border-white/20 text-white"
                    : "bg-white/[0.02] hover:bg-white/[0.06] border-white/5 text-[#d1cdc7]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isPlayingThis
                        ? "bg-[#e2b17a]/20 border-[#e2b17a]/40 text-[#e2b17a]"
                        : "bg-white/5 border-white/10 text-[#9e9990] group-hover:text-white"
                    }`}
                  >
                    {isPlayingThis ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium truncate">
                        {track.title || "Memory Track"}
                      </span>
                      {isOffline && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          Offline
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {track.artist || "Personal Recording"} • {formatTime(track.duration_seconds)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => handleToggleFav(track.id, e)}
                    className="p-1.5 text-slate-400 hover:text-pink-400 transition cursor-pointer"
                    aria-label="Favorite track"
                  >
                    <Heart
                      size={13}
                      className={track.is_favorite ? "fill-pink-500 text-pink-500" : ""}
                    />
                  </button>

                  {/* Download to Device */}
                  <button
                    onClick={(e) => handleDownloadTrack(track, e)}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                    title="Download audio file to device"
                    aria-label="Download music track"
                  >
                    <Download size={13} />
                  </button>

                  <button
                    onClick={(e) => handleDeleteTrack(track.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Delete track"
                    aria-label="Delete music track"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Music Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl glass-floating p-5 sm:p-6 shadow-2xl text-white relative border border-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Music size={18} className="text-[#e2b17a]" />
                <h3 className="text-base sm:text-lg font-bold text-[#f5f1e8]">Add Memory Music</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-[#9e9990] transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-400 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl bg-[#111315] border border-white/10">
              <button
                type="button"
                onClick={() => setAddMode("upload")}
                className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  addMode === "upload"
                    ? "bg-[#e2b17a]/20 text-[#e2b17a] border border-[#e2b17a]/40 shadow-sm"
                    : "text-[#9e9990] hover:text-white"
                }`}
              >
                <UploadCloud size={14} />
                <span>Upload Audio</span>
              </button>

              <button
                type="button"
                onClick={() => setAddMode("url")}
                className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  addMode === "url"
                    ? "bg-[#e2b17a]/20 text-[#e2b17a] border border-[#e2b17a]/40 shadow-sm"
                    : "text-[#9e9990] hover:text-white"
                }`}
              >
                <Link2 size={14} />
                <span>Audio Link</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddMusicSubmit} className="space-y-3.5">
              {addMode === "upload" ? (
                <div>
                  <label className="text-[11px] font-medium text-[#d1cdc7] block mb-1">
                    Select Audio File (MP3, M4A, WAV, OGG, WebM — Max 25MB)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setUploadFile(f);
                        if (!trackTitle) {
                          setTrackTitle(f.name.replace(/\.[^/.]+$/, ""));
                        }
                      }
                    }}
                    accept="audio/*,audio/mpeg,audio/mp3,audio/x-m4a,audio/m4a,audio/aac,audio/wav,audio/ogg,audio/webm"
                    className="w-full text-xs text-[#d1cdc7] bg-[#111315]/80 border border-white/15 rounded-xl p-2.5 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#e2b17a]/20 file:text-[#e2b17a] hover:file:bg-[#e2b17a]/30 cursor-pointer"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-medium text-[#d1cdc7] block mb-1">
                    Direct Audio Resource URL
                  </label>
                  <input
                    type="url"
                    value={directUrl}
                    onChange={(e) => setDirectUrl(e.target.value)}
                    placeholder="https://example.com/audio/focus-track.mp3"
                    className="w-full bg-[#111315]/80 border border-white/15 focus:border-[#e2b17a] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                    required
                  />
                  <p className="text-[10px] text-[#9e9990] mt-1">
                    Must be a direct, public audio resource file. Protected streaming video sites are not supported.
                  </p>
                </div>
              )}

              {/* Title input */}
              <div>
                <label className="text-[11px] font-medium text-[#d1cdc7] block mb-1">
                  Track Title
                </label>
                <input
                  type="text"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  placeholder="e.g. Evening Reflection Track"
                  className="w-full bg-[#111315]/80 border border-white/15 focus:border-[#e2b17a] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Artist input */}
              <div>
                <label className="text-[11px] font-medium text-[#d1cdc7] block mb-1">
                  Artist or Memory Tag (Optional)
                </label>
                <input
                  type="text"
                  value={trackArtist}
                  onChange={(e) => setTrackArtist(e.target.value)}
                  placeholder="e.g. Focus Session or Composer"
                  className="w-full bg-[#111315]/80 border border-white/15 focus:border-[#e2b17a] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9e9990] hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-champagne px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-[#1a140d]" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Add to Note</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
