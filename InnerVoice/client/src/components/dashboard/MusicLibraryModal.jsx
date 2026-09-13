import React, { useState, useEffect, useRef } from "react";
import {
  Music2,
  X,
  Play,
  Pause,
  Plus,
  Search,
  Upload,
  Link2,
  Check,
  HardDriveDownload,
  Trash2,
  Loader2,
  ArrowLeft,
  Sparkles,
  Disc3,
  Heart,
  FileAudio,
} from "lucide-react";
import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { useToast } from "../../context/ToastContext";
import {
  getAllOfflineMusicTracks,
  isMediaOfflineCached,
  cacheMediaItemOffline,
  removeMediaItemOffline,
} from "../../utils/offlineStorage";
import GlassSurface from "../glass/GlassSurface";

// 6 Iconic Arijit Singh Tracks with local MP3 audio files and custom cover artwork
export const ARIJIT_SINGH_TRACKS = [
  {
    id: "arijit-tum-hi-ho",
    title: "Tum Hi Ho",
    artist: "Arijit Singh • Aashiqui 2",
    duration: 267,
    durationFormatted: "04:27",
    artwork_url: "/assets/music/cover_tum_hi_ho.jpg",
    file_url: "/assets/music/tum_hi_ho.mp3",
    feeling: "Deep Love",
    category: "Arijit Singh",
  },
  {
    id: "arijit-kesariya",
    title: "Kesariya",
    artist: "Arijit Singh • Brahmāstra",
    duration: 268,
    durationFormatted: "04:28",
    artwork_url: "/assets/music/cover_kesariya.jpg",
    file_url: "/assets/music/kesariya.mp3",
    feeling: "Warmth",
    category: "Arijit Singh",
  },
  {
    id: "arijit-chaleya",
    title: "Chaleya",
    artist: "Arijit Singh • Jawan",
    duration: 188,
    durationFormatted: "03:08",
    artwork_url: "/assets/music/cover_chaleya.jpg",
    file_url: "/assets/music/chaleya.mp3",
    feeling: "Joyful Romance",
    category: "Arijit Singh",
  },
  {
    id: "arijit-gerua",
    title: "Gerua",
    artist: "Arijit Singh • Dilwale",
    duration: 293,
    durationFormatted: "04:53",
    artwork_url: "/assets/music/cover_gerua.jpg",
    file_url: "/assets/music/gerua.mp3",
    feeling: "Soulful",
    category: "Arijit Singh",
  },
  {
    id: "arijit-apna-bana-le",
    title: "Apna Bana Le",
    artist: "Arijit Singh • Bhediya",
    duration: 204,
    durationFormatted: "03:24",
    artwork_url: "/assets/music/cover_apna_bana_le.jpg",
    file_url: "/assets/music/apna_bana_le.mp3",
    feeling: "Longing",
    category: "Arijit Singh",
  },
  {
    id: "arijit-phir-aur-kya-chahiye",
    title: "Phir Aur Kya Chahiye",
    artist: "Arijit Singh • Zara Hatke Zara Bachke",
    duration: 215,
    durationFormatted: "03:35",
    artwork_url: "/assets/music/cover_phir_aur_kya_chahiye.jpg",
    file_url: "/assets/music/phir_aur_kya_chahiye.mp3",
    feeling: "Gratitude & Peace",
    category: "Arijit Singh",
  },
];

export default function MusicLibraryModal({
  isOpen,
  onClose,
  onSelectTrackForNote,
  initialAddMode = false,
}) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayer();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("all"); // "all" | "arijit" | "custom" | "downloaded"
  const [tracks, setTracks] = useState(ARIJIT_SINGH_TRACKS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [offlineMap, setOfflineMap] = useState({});

  // Add Music Form State
  const [isAddOpen, setIsAddOpen] = useState(initialAddMode);
  const [addMode, setAddMode] = useState("file"); // "file" | "url"
  const [newTitle, setNewTitle] = useState("");
  const [newArtist, setNewArtist] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDuration, setFileDuration] = useState(0);
  const [isProcessingAdd, setIsProcessingAdd] = useState(false);
  const [addSuccessMessage, setAddSuccessMessage] = useState("");

  const fileInputRef = useRef(null);

  // Load custom stored tracks and offline status
  const loadLibrary = async () => {
    try {
      setLoading(true);
      const customRaw = localStorage.getItem("innervoice_custom_tracks");
      const customTracks = customRaw ? JSON.parse(customRaw) : [];

      // Combine Custom User Tracks + 6 Arijit Singh Tracks
      const combined = [...customTracks, ...ARIJIT_SINGH_TRACKS];
      setTracks(combined);

      // Check offline caching status
      const oMap = {};
      for (const t of combined) {
        if (t.id) {
          try {
            oMap[t.id] = await isMediaOfflineCached(t.id);
          } catch {
            oMap[t.id] = false;
          }
        }
      }
      setOfflineMap(oMap);
    } catch (err) {
      console.error("Failed to load custom tracks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLibrary();
      if (initialAddMode) {
        setIsAddOpen(true);
      }
    }
  }, [isOpen, initialAddMode]);

  if (!isOpen) return null;

  // Handle local audio file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("audio/")) {
      addToast("Please select a valid audio file (MP3, WAV, AAC, etc.)", "error");
      return;
    }

    setSelectedFile(file);

    // Default title from file name
    if (!newTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setNewTitle(cleanName);
    }
    if (!newArtist) {
      setNewArtist("My Audio");
    }

    // Get audio duration
    try {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        setFileDuration(Math.round(audio.duration));
      };
    } catch {
      setFileDuration(180);
    }
  };

  // Add custom track to local storage library
  const handleAddCustomTrack = async (e) => {
    e.preventDefault();
    if (isProcessingAdd) return;

    let trackUrl = "";
    let durSec = fileDuration;

    setIsProcessingAdd(true);

    try {
      if (addMode === "file") {
        if (!selectedFile) {
          addToast("Please select an audio file.", "error");
          setIsProcessingAdd(false);
          return;
        }

        // Create permanent/local blob URL for current session
        trackUrl = URL.createObjectURL(selectedFile);
      } else {
        if (!newUrl.trim()) {
          addToast("Please enter a valid audio URL.", "error");
          setIsProcessingAdd(false);
          return;
        }
        trackUrl = newUrl.trim();
      }

      const formatDur = (secs) => {
        if (!secs) return "03:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? "0" : ""}${s}`;
      };

      const newTrackObj = {
        id: `custom-track-${Date.now()}`,
        title: newTitle.trim() || "My Audio Track",
        artist: newArtist.trim() || "Personal Reflection",
        duration: durSec || 180,
        durationFormatted: formatDur(durSec || 180),
        artwork_url: "/assets/music/cover_tum_hi_ho.jpg",
        file_url: trackUrl,
        is_custom: true,
        category: "Custom",
        date_added: new Date().toISOString(),
      };

      // Save to localStorage
      const customRaw = localStorage.getItem("innervoice_custom_tracks");
      const existing = customRaw ? JSON.parse(customRaw) : [];
      const updated = [newTrackObj, ...existing];
      localStorage.setItem("innervoice_custom_tracks", JSON.stringify(updated));

      // Update state
      setTracks([newTrackObj, ...tracks]);
      setAddSuccessMessage(`Added "${newTrackObj.title}" to your music library!`);
      addToast(`Added "${newTrackObj.title}" to library`, "success");

      // Reset form
      setNewTitle("");
      setNewArtist("");
      setNewUrl("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Auto-dismiss add form after short delay
      setTimeout(() => {
        setAddSuccessMessage("");
        setIsAddOpen(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to add music track:", err);
      addToast("Error adding track: " + err.message, "error");
    } finally {
      setIsProcessingAdd(false);
    }
  };

  // Delete a custom user track
  const handleDeleteCustomTrack = (trackId, e) => {
    e.stopPropagation();
    if (!window.confirm("Remove this track from your music library?")) return;

    const customRaw = localStorage.getItem("innervoice_custom_tracks");
    const existing = customRaw ? JSON.parse(customRaw) : [];
    const filtered = existing.filter((t) => t.id !== trackId);
    localStorage.setItem("innervoice_custom_tracks", JSON.stringify(filtered));

    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  // Toggle offline cache for a track
  const handleToggleOffline = async (track, e) => {
    e.stopPropagation();
    const isCached = offlineMap[track.id];

    try {
      if (isCached) {
        await removeMediaItemOffline(track.id);
        setOfflineMap((prev) => ({ ...prev, [track.id]: false }));
      } else {
        await cacheMediaItemOffline({
          id: track.id,
          file_url: track.file_url,
          media_type: "music",
          title: track.title,
          artist: track.artist,
        });
        setOfflineMap((prev) => ({ ...prev, [track.id]: true }));
      }
    } catch (err) {
      console.error("Failed to toggle offline music:", err);
    }
  };

  // Filtered tracks
  const filteredTracks = tracks.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.artist && t.artist.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (activeTab === "arijit") {
      return t.id?.startsWith("arijit-") || t.artist?.toLowerCase().includes("arijit");
    }
    if (activeTab === "custom") {
      return t.is_custom || t.category === "Custom";
    }
    if (activeTab === "downloaded") {
      return offlineMap[t.id] || t.id?.startsWith("arijit-");
    }
    return true;
  });

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-3 sm:p-6"
    >
      <GlassSurface
        level={3}
        className="w-full max-w-2xl max-h-[92vh] flex flex-col p-5 sm:p-7 rounded-3xl relative overflow-hidden shadow-[0_28px_70px_rgba(0,0,0,0.85)] border border-white/[0.12]"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#9e9990] hover:text-[#f5f2eb] rounded-xl hover:bg-white/[0.06] transition cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#f5f2eb] font-normal tracking-tight flex items-center gap-2">
                <span>Music Sanctuary</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#e2b17a]/15 text-[#e2b17a] font-sans font-medium border border-[#e2b17a]/30">
                  Arijit Singh Edition
                </span>
              </h2>
              <p className="text-[11px] text-[#9e9990]">
                Calming melodies & soulful soundtracks for your reflections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* + Add Music Trigger Button */}
            <button
              type="button"
              onClick={() => setIsAddOpen(!isAddOpen)}
              className={`btn-champagne flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isAddOpen ? "ring-2 ring-[#e2b17a]/50" : ""
              }`}
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>{isAddOpen ? "Close Form" : "Add Music"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#9e9990] hover:text-[#f5f2eb] rounded-xl hover:bg-white/[0.06] transition cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Collapsible "Add Music" Section */}
        {isAddOpen && (
          <div className="mt-4 p-4 rounded-2xl glass-inner border border-white/[0.12] animate-fade-scale">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#f5f2eb]">
                <Plus size={14} className="text-[#e2b17a]" />
                <span>Add Your Personal Soundtrack</span>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#111315] border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setAddMode("file")}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                    addMode === "file"
                      ? "bg-[#e2b17a]/20 text-[#e2b17a] font-medium"
                      : "text-[#9e9990] hover:text-white"
                  }`}
                >
                  <Upload size={12} />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode("url")}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                    addMode === "url"
                      ? "bg-[#e2b17a]/20 text-[#e2b17a] font-medium"
                      : "text-[#9e9990] hover:text-white"
                  }`}
                >
                  <Link2 size={12} />
                  <span>Audio URL</span>
                </button>
              </div>
            </div>

            {addSuccessMessage && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-scale">
                <Check size={14} />
                <span>{addSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddTrack} className="space-y-3">
              {addMode === "file" ? (
                <div>
                  <label className="text-[11px] font-medium text-[#9e9990] block mb-1">
                    Select MP3, M4A, WAV, or Audio File
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg"
                    className="w-full text-xs text-[#f5f1e8] bg-[#111315]/80 border border-white/10 rounded-xl p-2 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#e2b17a]/20 file:text-[#e2b17a] hover:file:bg-[#e2b17a]/30 cursor-pointer"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-medium text-[#9e9990] block mb-1">
                    Direct Audio File URL (MP3 / Stream Link)
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://example.com/audio/my-song.mp3"
                    className="w-full bg-[#111315]/80 border border-white/10 focus:border-[#e2b17a] rounded-xl px-3 py-2 text-xs text-[#f5f1e8] outline-none font-mono"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-[#9e9990] block mb-1">
                    Song Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Raabta"
                    className="w-full bg-[#111315]/80 border border-white/10 focus:border-[#e2b17a] rounded-xl px-3 py-1.5 text-xs text-[#f5f1e8] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#9e9990] block mb-1">
                    Artist / Note Tag
                  </label>
                  <input
                    type="text"
                    value={newArtist}
                    onChange={(e) => setNewArtist(e.target.value)}
                    placeholder="e.g. Arijit Singh"
                    className="w-full bg-[#111315]/80 border border-white/10 focus:border-[#e2b17a] rounded-xl px-3 py-1.5 text-xs text-[#f5f1e8] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#9e9990] hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingAdd}
                  className="btn-champagne px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isProcessingAdd ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-[#1a140d]" />
                      <span>Saving Track...</span>
                    </>
                  ) : (
                    <span>Save to Library</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Spotlight: Arijit Singh Special Banner */}
        <div className="mt-4 p-3.5 sm:p-4 rounded-2xl glass-inner border border-white/[0.10] flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 relative shadow-md">
              <img
                src="/assets/music/cover_tum_hi_ho.jpg"
                alt="Arijit Singh Special"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Disc3 size={20} className="text-[#e2b17a] animate-spin" style={{ animationDuration: "8s" }} />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#e2b17a]">
                  Featured Artist
                </span>
                <span className="text-[10px] text-[#9e9990]">• 6 Iconic Songs</span>
              </div>
              <h3 className="text-sm sm:text-base font-serif text-[#f5f1e8] font-normal truncate">
                Arijit Singh Reflection Collection
              </h3>
              <p className="text-[11px] text-[#9e9990] truncate">
                Tum Hi Ho, Kesariya, Chaleya, Gerua, Apna Bana Le & more
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => playTrack(ARIJIT_SINGH_TRACKS[0])}
            className="btn-champagne px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Play size={13} className="fill-[#1a140d]" />
            <span>Play Tum Hi Ho</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="mt-4 relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9e9990]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Arijit Singh songs, titles, or your custom tracks..."
            className="w-full bg-[#111315]/80 border border-white/[0.08] focus:border-[#e2b17a]/40 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-[#f5f1e8] placeholder-[#6f6b64] focus:outline-none transition"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-white/[0.06] text-xs flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`pill-filter ${activeTab === "all" ? "active" : ""}`}
          >
            All Tracks ({tracks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("arijit")}
            className={`pill-filter ${activeTab === "arijit" ? "active" : ""}`}
          >
            Arijit Singh ({ARIJIT_SINGH_TRACKS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`pill-filter ${activeTab === "custom" ? "active" : ""}`}
          >
            Custom Added ({tracks.filter((t) => t.is_custom).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("downloaded")}
            className={`pill-filter ${activeTab === "downloaded" ? "active" : ""}`}
          >
            Offline Ready
          </button>
        </div>

        {/* Track Rows */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1 min-h-[220px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-xs text-[#9e9990]">
              <Loader2 size={20} className="animate-spin text-[#e2b17a]" />
              <span>Loading music memories...</span>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#9e9990]">
              No tracks matching &quot;{searchQuery}&quot;. Click &quot;Add Music&quot; to upload your own.
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isPlayingThis = currentTrack?.id === track.id && isPlaying;
              const isCached = offlineMap[track.id] || track.id?.startsWith("arijit-");

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl border transition cursor-pointer group ${
                    currentTrack?.id === track.id
                      ? "bg-[#e2b17a]/15 border-[#e2b17a]/40 shadow-sm"
                      : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.04] hover:border-white/[0.1]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-black/40 shrink-0 relative border border-white/10 shadow-sm">
                      <img
                        src={track.artwork_url || "/assets/music/cover_tum_hi_ho.jpg"}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-[#f5f1e8] truncate">
                          {track.title}
                        </h4>
                        {track.feeling && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/5 border border-white/10 text-[#e2b17a] shrink-0">
                            {track.feeling}
                          </span>
                        )}
                        {track.is_custom && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#e2b17a]/20 border border-[#e2b17a]/30 text-[#e2b17a] shrink-0">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#9e9990] truncate mt-0.5">
                        {track.artist} {track.durationFormatted ? `• ${track.durationFormatted}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Attach to Note action (if invoked from note picker) */}
                    {onSelectTrackForNote && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTrackForNote(track);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#e2b17a] hover:text-[#1a140d] text-xs font-medium text-[#d1cdc7] transition"
                        title="Attach track to this note"
                      >
                        Attach
                      </button>
                    )}

                    {/* Offline toggle */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleOffline(track, e)}
                      className={`p-1.5 rounded-lg text-xs transition ${
                        isCached
                          ? "text-emerald-400 hover:text-emerald-300"
                          : "text-[#9e9990] hover:text-white"
                      }`}
                      title={isCached ? "Available offline" : "Save for offline"}
                    >
                      {isCached ? <Check size={14} /> : <HardDriveDownload size={14} />}
                    </button>

                    {/* Delete custom track if added by user */}
                    {track.is_custom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCustomTrack(track.id, e)}
                        className="p-1.5 text-[#9e9990] hover:text-rose-400 transition"
                        title="Delete custom track"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    {/* Play / Pause button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentTrack?.id === track.id) {
                          togglePlay();
                        } else {
                          playTrack(track);
                        }
                      }}
                      className={`w-8 h-8 rounded-full transition flex items-center justify-center cursor-pointer shadow-sm ${
                        isPlayingThis
                          ? "bg-[#e2b17a] text-[#1a140d]"
                          : "bg-white/[0.08] hover:bg-[#e2b17a] hover:text-[#1a140d] text-[#f5f1e8]"
                      }`}
                      aria-label={isPlayingThis ? "Pause" : "Play"}
                    >
                      {isPlayingThis ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </GlassSurface>
    </div>
  );
}
