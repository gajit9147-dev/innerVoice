// ============================================================
// client/src/components/layout/MiniMusicPlayer.jsx
// Compact, non-intrusive floating mini-player
// Persists audio playback across route transitions with 1-click note jump
// ============================================================

import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { Play, Pause, X, Music, Disc3, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 max-w-[340px] sm:max-w-sm w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-5 duration-300">
      <div className="relative rounded-2xl bg-[#091122]/85 backdrop-blur-2xl border border-cyan-500/30 p-3 sm:p-3.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_20px_rgba(6,182,212,0.2)] overflow-hidden">
        {/* Top Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          {/* Animated Disc / Icon */}
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-950/80 to-slate-900 border border-cyan-500/30 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Disc3
              size={20}
              className={`text-cyan-400 ${isPlaying ? "animate-spin" : ""}`}
              style={{ animationDuration: "4s" }}
            />
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-white truncate tracking-tight">
              {currentTrack.title || "Memory Track"}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="truncate max-w-[120px]">
                {currentTrack.artist || "Personal Recording"}
              </span>
              <span>•</span>
              <span className="font-mono text-cyan-400/90 text-[10px]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
              aria-label={isPlaying ? "Pause music" : "Play music"}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>

            {/* Jump to Note */}
            {currentTrack.note_id && (
              <button
                onClick={handleOpenNote}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                title="Open associated note"
                aria-label="Open note"
              >
                <ExternalLink size={14} />
              </button>
            )}

            {/* Dismiss */}
            <button
              onClick={closePlayer}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/10 transition cursor-pointer"
              title="Close player"
              aria-label="Close music player"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
