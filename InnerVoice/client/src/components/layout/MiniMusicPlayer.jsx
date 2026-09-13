import React from "react";
import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { Play, Pause, X, Disc3, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassSurface from "../glass/GlassSurface";

export default function MiniMusicPlayer() {
  const { currentTrack, isPlaying, togglePlay, closePlayer, currentTime, duration } = useAudioPlayer();
  const navigate = useNavigate();

  if (!currentTrack) return null;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleOpenNote = () => {
    if (currentTrack.note_id) {
      localStorage.setItem("innervoice_active_note_id", String(currentTrack.note_id));
      navigate("/dashboard");
    }
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 max-w-[340px] sm:max-w-sm w-[calc(100vw-2rem)] animate-fade-scale">
      <GlassSurface
        level={3}
        className="relative rounded-2xl p-3 sm:p-3.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden"
      >
        {/* Top Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-[#e2b17a] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          {/* Artwork or Animated Disc */}
          <div className="relative w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            {currentTrack.artwork_url ? (
              <img
                src={currentTrack.artwork_url}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Disc3
                size={20}
                className={`text-[#e2b17a] ${isPlaying ? "animate-spin" : ""}`}
                style={{ animationDuration: "4s" }}
              />
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-medium text-[#f5f2eb] truncate tracking-tight">
              {currentTrack.title || "Memory Track"}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-[#9e9990]">
              <span className="truncate max-w-[120px]">
                {currentTrack.artist || "Personal Reflection"}
              </span>
              <span>•</span>
              <span className="font-mono text-[#e2b17a] text-[10px]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-[#e2b17a] text-[#1a140d] hover:bg-[#f2c794] flex items-center justify-center transition cursor-pointer active:scale-95 shadow-md"
              aria-label={isPlaying ? "Pause music" : "Play music"}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
            </button>

            {/* Jump to Note */}
            {currentTrack.note_id && (
              <button
                onClick={handleOpenNote}
                className="p-1.5 text-[#9e9990] hover:text-white rounded-lg transition cursor-pointer"
                title="Open associated note"
                aria-label="Open note"
              >
                <ExternalLink size={14} />
              </button>
            )}

            {/* Dismiss */}
            <button
              onClick={closePlayer}
              className="p-1.5 text-[#9e9990] hover:text-rose-400 rounded-lg transition cursor-pointer"
              title="Close player"
              aria-label="Close music player"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </GlassSurface>
    </div>
  );
}
