// ============================================================
// client/src/components/dashboard/MusicLibraryModal.jsx
// Global Music Library Explorer:
// - All tracks, Favorites, and Offline Available tracks
// - Offline Storage Quota indicator (e.g. 24.5 MB used)
// - 1-Click play and Jump to parent note
// ============================================================

import { useState, useEffect } from "react";
import {
  Music,
  X,
  Play,
  Pause,
  Heart,
  Download,
  HardDriveDownload,
  Check,
  ExternalLink,
  Disc3,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { getMusicLibrary, toggleFavoriteMedia } from "../../api/media";
import {
  getOfflineStorageUsage,
  getAllOfflineMusicTracks,
  isMediaOfflineCached,
  cacheMediaItemOffline,
  removeMediaItemOffline,
  getOfflineMediaBlob,
} from "../../utils/offlineStorage";

export default function MusicLibraryModal({ isOpen, onClose, onSelectNote }) {
  const { currentTrack, isPlaying, playTrack } = useAudioPlayer();

  const [activeTab, setActiveTab] = useState("all"); // "all" | "favorites" | "offline"
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offlineMap, setOfflineMap] = useState({});
  const [storageInfo, setStorageInfo] = useState({
    formattedUsage: "0 B",
    musicCount: 0,
  });

  const loadTracks = async () => {
    setLoading(true);
    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

    try {
      let trackList = [];
      if (!isOffline) {
        try {
          const res = await getMusicLibrary();
          trackList = res.data?.tracks || [];
        } catch {
          // fallback to offline
          trackList = await getAllOfflineMusicTracks();
        }
      } else {
        trackList = await getAllOfflineMusicTracks();
      }

      setTracks(trackList);

      // Map offline status
      const oMap = {};
      for (const t of trackList) {
        if (t.id) {
          oMap[t.id] = await isMediaOfflineCached(t.id);
        }
      }
      setOfflineMap(oMap);

      // Usage info
      const usage = await getOfflineStorageUsage();
      setStorageInfo(usage);
    } catch (err) {
      console.error("Failed to load music library:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTracks();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs <= 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleToggleFav = async (trackId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await toggleFavoriteMedia(trackId);
      const isFav = res.data.is_favorite;
      setTracks((prev) =>
        prev.map((t) => (t.id === trackId ? { ...t, is_favorite: isFav } : t))
      );
    } catch (err) {
      console.error("Favorite toggle error:", err);
    }
  };

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

  const handleToggleOffline = async (track, e) => {
    if (e) e.stopPropagation();
    const isCached = offlineMap[track.id];
    try {
      if (isCached) {
        await removeMediaItemOffline(track.id);
        setOfflineMap((prev) => ({ ...prev, [track.id]: false }));
      } else {
        await cacheMediaItemOffline(track);
        setOfflineMap((prev) => ({ ...prev, [track.id]: true }));
      }
      const usage = await getOfflineStorageUsage();
      setStorageInfo(usage);
    } catch (err) {
      console.error("Offline toggle error:", err);
    }
  };

  const filteredTracks = tracks.filter((t) => {
    if (activeTab === "favorites") return Boolean(t.is_favorite);
    if (activeTab === "offline") return Boolean(offlineMap[t.id]);
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#071322] border border-cyan-500/30 shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Disc3 size={20} className={isPlaying ? "animate-spin" : ""} style={{ animationDuration: "5s" }} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Memory Music Library</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-normal">
                  {tracks.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                All soundtracks and audio memories attached to your journal entries
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 transition cursor-pointer"
            aria-label="Close music library"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Tabs & Storage Quota */}
        <div className="px-5 py-3 border-b border-white/5 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-white/10">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === "all"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Tracks
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                activeTab === "favorites"
                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Heart size={12} className="fill-pink-500 text-pink-500" />
              <span>Favorites</span>
            </button>
            <button
              onClick={() => setActiveTab("offline")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                activeTab === "offline"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Check size={12} className="text-emerald-400" />
              <span>Offline Available</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              Offline storage:{" "}
              <strong className="text-slate-200">{storageInfo.formattedUsage}</strong>
            </span>
          </div>
        </div>

        {/* Tracks List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 text-xs">
              <Loader2 size={24} className="animate-spin text-cyan-400" />
              <span>Loading music tracks...</span>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No tracks found for this view. Attach music to your notes to populate your library.
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isPlayingThis = currentTrack?.id === track.id && isPlaying;
              const isOffline = offlineMap[track.id];

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`group flex items-center justify-between gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                    currentTrack?.id === track.id
                      ? "bg-cyan-500/15 border-cyan-500/40 text-white"
                      : "bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition ${
                        isPlayingThis
                          ? "bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                          : "bg-white/5 border-white/10 text-slate-400 group-hover:text-cyan-400"
                      }`}
                    >
                      {isPlayingThis ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold truncate">
                          {track.title || "Memory Track"}
                        </span>
                        {isOffline && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                            Offline
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 truncate">
                        <span>{track.artist || "Personal Recording"}</span>
                        <span>•</span>
                        <span>{formatTime(track.duration_seconds)}</span>
                        {track.note_title && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-400/80 truncate">
                              Note: {track.note_title}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Offline toggle */}
                    <button
                      onClick={(e) => handleToggleOffline(track, e)}
                      className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                        isOffline
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                      title={isOffline ? "Cached offline" : "Make available offline"}
                      aria-label="Toggle offline"
                    >
                      {isOffline ? <Check size={13} className="text-emerald-400" /> : <HardDriveDownload size={13} />}
                    </button>

                    {/* Download to Device */}
                    <button
                      onClick={(e) => handleDownloadTrack(track, e)}
                      className="p-1.5 text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                      title="Download audio file to device"
                      aria-label="Download music track"
                    >
                      <Download size={14} />
                    </button>

                    {/* Favorite toggle */}
                    <button
                      onClick={(e) => handleToggleFav(track.id, e)}
                      className="p-1.5 text-slate-400 hover:text-pink-400 transition cursor-pointer"
                      title="Favorite"
                      aria-label="Favorite"
                    >
                      <Heart
                        size={14}
                        className={track.is_favorite ? "fill-pink-500 text-pink-500" : ""}
                      />
                    </button>

                    {/* Jump to Note */}
                    {track.note_id && onSelectNote && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNote(track.note_id);
                          onClose();
                        }}
                        className="p-1.5 text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                        title="Open note in journal"
                        aria-label="Open note"
                      >
                        <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
