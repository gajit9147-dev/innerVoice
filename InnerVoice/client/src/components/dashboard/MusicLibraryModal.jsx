import React, { useState, useEffect } from "react";
import {
  Music2,
  X,
  Play,
  Pause,
  Heart,
  HardDriveDownload,
  Check,
  Search,
  MoreVertical,
  Loader2,
  ArrowLeft,
  Upload,
} from "lucide-react";
import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { getMusicLibrary, toggleFavoriteMedia } from "../../api/media";
import {
  getOfflineStorageUsage,
  getAllOfflineMusicTracks,
  isMediaOfflineCached,
} from "../../utils/offlineStorage";
import GlassSurface from "../glass/GlassSurface";

export default function MusicLibraryModal({ isOpen, onClose, onSelectNote }) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayer();

  const [activeTab, setActiveTab] = useState("all"); // "all" | "playlists" | "downloaded"
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [offlineMap, setOfflineMap] = useState({});

  const sampleTracks = [
    {
      id: "track-1",
      title: "Sunset Lover",
      artist: "Petit Biscuit",
      durationFormatted: "03:57",
      artwork_url: "/assets/sunset_skyline.jpg",
    },
    {
      id: "track-2",
      title: "Night Changes",
      artist: "One Direction",
      durationFormatted: "03:58",
      artwork_url: "/assets/sunset_skyline.jpg",
    },
    {
      id: "track-3",
      title: "Until I Found You",
      artist: "Stephen Sanchez",
      durationFormatted: "02:56",
      artwork_url: "/assets/peaceful_mountain.jpg",
    },
    {
      id: "track-4",
      title: "Another Love",
      artist: "Tom Odell",
      durationFormatted: "04:04",
      artwork_url: "/assets/coffee_notebook.jpg",
    },
  ];

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
          trackList = await getAllOfflineMusicTracks();
        }
      } else {
        trackList = await getAllOfflineMusicTracks();
      }

      if (trackList.length === 0) {
        trackList = sampleTracks;
      }

      setTracks(trackList);

      const oMap = {};
      for (const t of trackList) {
        if (t.id) {
          oMap[t.id] = await isMediaOfflineCached(t.id);
        }
      }
      setOfflineMap(oMap);
    } catch (err) {
      console.error("Failed to load music library:", err);
      setTracks(sampleTracks);
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

  const filteredTracks = tracks.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.artist && t.artist.toLowerCase().includes(q));

    if (activeTab === "downloaded") return matchesSearch && (offlineMap[t.id] || true);
    return matchesSearch;
  });

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex justify-center items-center z-50 p-3 sm:p-6"
    >
      <GlassSurface
        level={3}
        className="w-full max-w-xl max-h-[90vh] flex flex-col p-5 sm:p-7 rounded-3xl relative overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#9e9990] hover:text-[#f5f2eb] rounded-xl transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center">
            <h2 className="font-serif text-xl sm:text-2xl text-[#f5f2eb] font-normal tracking-tight">
              Music
            </h2>
            <p className="text-[11px] text-[#9e9990]">
              Music connected to your memories
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#9e9990] hover:text-[#f5f2eb] rounded-xl transition"
          >
            <X size={18} />
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
            placeholder="Search songs, artists or paste link..."
            className="w-full bg-[#121319] border border-white/[0.08] focus:border-[#e2b17a]/40 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-[#f5f2eb] placeholder-[#6f6b64] focus:outline-none transition"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-white/[0.06] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`pill-filter ${activeTab === "all" ? "active" : ""}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("playlists")}
            className={`pill-filter ${activeTab === "playlists" ? "active" : ""}`}
          >
            Playlists
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("downloaded")}
            className={`pill-filter ${activeTab === "downloaded" ? "active" : ""}`}
          >
            Downloaded
          </button>
        </div>

        {/* Track Rows */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-xs text-[#9e9990]">
              <Loader2 size={20} className="animate-spin text-[#e2b17a]" />
              <span>Loading music memories...</span>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#9e9990]">
              No tracks found.
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isPlayingThis = currentTrack?.id === track.id && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.1] transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 shrink-0 relative">
                      <img
                        src={track.artwork_url || "/assets/sunset_skyline.jpg"}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-[#f5f2eb] truncate">
                        {track.title}
                      </div>
                      <div className="text-[11px] text-[#9e9990] truncate">
                        {track.artist} {track.durationFormatted ? `• ${track.durationFormatted}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
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
                      className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-[#e2b17a] hover:text-[#1a140d] text-[#f5f2eb] transition flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      {isPlayingThis ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                    </button>

                    <button
                      type="button"
                      className="p-1.5 text-[#9e9990] hover:text-white transition"
                    >
                      <MoreVertical size={15} />
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
