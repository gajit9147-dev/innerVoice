import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Repeat,
  Shuffle,
  Mic,
  Square,
  MoreHorizontal,
  Volume2,
  Trash2,
  Download,
  CheckCircle,
  Save,
  Radio,
} from "lucide-react";

export default function AudioVoiceMemo({
  activeRecording,
  onSaveNewRecording,
  onDeleteRecording,
  onAudioPlayStateChange,
}) {
  const [title, setTitle] = useState(activeRecording?.title || "Deep Thought Session");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(45); // Default 00:00:45 like in reference pic
  const [duration, setDuration] = useState(activeRecording?.duration || 150); // Default 02:30 (150s)
  const [isLooping, setIsLooping] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showMenu, setShowMenu] = useState(false);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [pendingSaveMemo, setPendingSaveMemo] = useState(null); // When recording stops and awaits name/save
  const [customAudioUrl, setCustomAudioUrl] = useState(activeRecording?.audioUrl || null);

  // Audio & Web Audio API references
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const audioContextRef = useRef(null);

  // Number of bars in waveform
  const BAR_COUNT = 38;

  // Waveform height multipliers to form the natural bell shape from reference image
  const defaultWaveProfile = [
    0.2, 0.28, 0.35, 0.45, 0.38, 0.52, 0.65, 0.8, 0.72, 0.9, 0.98, 0.85, 0.7, 0.55,
    0.75, 0.88, 1.0, 0.95, 0.85, 0.78, 0.92, 0.82, 0.68, 0.55, 0.72, 0.88, 0.65, 0.48,
    0.58, 0.42, 0.36, 0.28, 0.22, 0.18, 0.15, 0.12, 0.1, 0.08
  ];

  const [waveProfile, setWaveProfile] = useState(defaultWaveProfile);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const s = Math.floor(secs || 0);
    const m = Math.floor(s / 60);
    const remS = s % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(m)}:${pad(remS)}`;
  };

  // Sync with activeRecording prop from sidebar
  useEffect(() => {
    if (activeRecording) {
      setTitle(activeRecording.title || "Voice Memo");
      setDuration(activeRecording.duration || 90);
      setCustomAudioUrl(activeRecording.audioUrl || null);
      setCurrentTime(0);
      setIsPlaying(false);
      setPendingSaveMemo(null);
    }
  }, [activeRecording]);

  // Notify parent of play state change
  useEffect(() => {
    if (onAudioPlayStateChange) onAudioPlayStateChange(isPlaying);
  }, [isPlaying, onAudioPlayStateChange]);

  // Web Audio Synthesizer for demo playback if no custom audio file loaded
  const playSynthesizerChime = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      
      const freqs = [330, 392, 440, 523, 587, 659];
      const freq = freqs[Math.floor(Math.random() * freqs.length)];
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio context restricted before user interaction
    }
  };

  // Playback timer & simulated waveform movement
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            if (isLooping) return 0;
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });

        // Trigger synth tone if no real audio URL
        if (!customAudioUrl && Math.random() > 0.4) {
          playSynthesizerChime();
        }

        // Animate wave profiles dynamically
        setWaveProfile((prev) =>
          prev.map((val) => {
            const jitter = (Math.random() - 0.5) * 0.25;
            return Math.min(1, Math.max(0.15, val + jitter));
          })
        );
      }, 1000 / playbackSpeed);
    } else {
      setWaveProfile(defaultWaveProfile);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, isLooping, playbackSpeed, customAudioUrl]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (customAudioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Seek Scrubber
  const handleSeek = (e) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (customAudioUrl && audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  // Skip buttons
  const skipTime = (delta) => {
    const newTime = Math.min(duration, Math.max(0, currentTime + delta));
    setCurrentTime(newTime);
    if (customAudioUrl && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Start Voice Recording via Microphone
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Prepare pending save memo
        const recDuration = recordTime || 1;
        const generatedTitle = `Voice Memo ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        setPendingSaveMemo({
          url: audioUrl,
          blob: audioBlob,
          duration: recDuration,
          title: generatedTitle,
        });

        setCustomAudioUrl(audioUrl);
        setDuration(recDuration);
        setCurrentTime(0);
        setTitle(generatedTitle);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordTime(0);

      recordTimerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
        // Live wave animation while recording
        setWaveProfile((prev) =>
          prev.map(() => 0.2 + Math.random() * 0.8)
        );
      }, 1000);
    } catch (err) {
      console.warn("Microphone access denied or not supported:", err);
      alert("Microphone permission is required to record voice notes. Please allow microphone access in your browser.");
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(recordTimerRef.current);
    }
  };

  // Save new recording to permanent library
  const handleConfirmSave = () => {
    if (pendingSaveMemo && onSaveNewRecording) {
      const memoPayload = {
        id: `rec-${Date.now()}`,
        title: pendingSaveMemo.title || title,
        duration: pendingSaveMemo.duration,
        formattedDuration: formatTime(pendingSaveMemo.duration),
        audioUrl: pendingSaveMemo.url,
        created_at: new Date().toISOString(),
      };

      if (pendingSaveMemo.blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          memoPayload.audioUrl = reader.result;
          onSaveNewRecording(memoPayload);
          setPendingSaveMemo(null);
        };
        reader.onerror = () => {
          onSaveNewRecording(memoPayload);
          setPendingSaveMemo(null);
        };
        reader.readAsDataURL(pendingSaveMemo.blob);
      } else {
        onSaveNewRecording(memoPayload);
        setPendingSaveMemo(null);
      }
    }
  };

  // Discard pending recording
  const handleDiscardPending = () => {
    setPendingSaveMemo(null);
    setCustomAudioUrl(activeRecording?.audioUrl || null);
    setTitle(activeRecording?.title || "Deep Thought Session");
    setDuration(activeRecording?.duration || 150);
  };

  // Clean up
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  const progressPercent = Math.min(100, (currentTime / (duration || 1)) * 100);

  return (
    <div className="liquid-glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden text-white transition-all shadow-[0_20px_50px_rgba(0,0,0,0.6)] min-w-0">
      {/* Background soft ambient cyan glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hidden real audio element for recorded voice notes */}
      {customAudioUrl && (
        <audio
          ref={audioRef}
          src={customAudioUrl}
          onTimeUpdate={() => {
            if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) setDuration(audioRef.current.duration);
          }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header: Title and Options Menu */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10 gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 truncate">
          <h3 className="font-semibold text-base sm:text-lg text-white tracking-wide flex items-center gap-2 truncate">
            <span className="truncate">Audio Voice Memo</span>
            {isPlaying && <Radio size={14} className="text-cyan-400 animate-pulse shrink-0" />}
          </h3>

          {isRecording && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              REC {formatTime(recordTime)}
            </span>
          )}
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Voice memo options"
            className="p-1.5 sm:p-2 text-slate-400 hover:text-cyan-300 hover:bg-white/5 rounded-xl transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Options"
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-9 w-52 bg-[#0b1523] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-xl text-xs space-y-1">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  if (isRecording) stopRecording();
                  else startRecording();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-200 rounded-lg transition cursor-pointer"
              >
                <Mic size={14} className="text-cyan-400" />
                {isRecording ? "Stop Recording" : "Record New Voice Memo"}
              </button>

              <button
                type="button"
                onClick={() => {
                  const newT = prompt("Edit Memo Title:", title);
                  if (newT) setTitle(newT);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-200 hover:bg-white/5 rounded-lg transition cursor-pointer"
              >
                <span>Rename Memo</span>
              </button>

              {customAudioUrl && (
                <a
                  href={customAudioUrl}
                  download={`${title.replace(/\s+/g, "_")}.webm`}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-200 hover:bg-white/5 rounded-lg transition cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Audio</span>
                </a>
              )}

              {activeRecording && onDeleteRecording && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    if (window.confirm(`Delete "${activeRecording.title}"?`)) {
                      onDeleteRecording(activeRecording.id);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Delete Recording</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Waveform Visualizer (fluid scaling) */}
      <div
        className="h-24 sm:h-28 flex items-center justify-between gap-[1.5px] sm:gap-[3px] my-3 px-1.5 sm:px-2 py-2 rounded-xl sm:rounded-2xl bg-[#070e17]/50 border border-white/5 cursor-pointer select-none overflow-hidden"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          const newT = ratio * duration;
          setCurrentTime(newT);
          if (customAudioUrl && audioRef.current) audioRef.current.currentTime = newT;
        }}
        title="Click waveform to seek"
      >
        {waveProfile.map((heightFactor, i) => {
          const barProgress = (i / BAR_COUNT) * 100;
          const isPassed = barProgress <= progressPercent;
          const barHeight = Math.max(6, Math.floor(heightFactor * 72));

          return (
            <div
              key={i}
              style={{ height: `${barHeight}px` }}
              className={`w-0.5 sm:w-1 flex-1 max-w-[4px] min-w-0 rounded-full transition-all duration-150 ${
                isPassed
                  ? "bg-gradient-to-t from-cyan-500 to-teal-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  : "bg-slate-700/60 hover:bg-slate-600"
              } ${isPlaying ? "wave-bar-active" : ""}`}
            />
          );
        })}
      </div>

      {/* Scrubber & Time */}
      <div className="space-y-1.5 pt-1">
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Audio playback seeker"
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>

        <div className="flex justify-between text-[11px] sm:text-xs font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 mt-3 sm:mt-4 pt-1">
        {/* Shuffle / Speed Toggle */}
        <button
          type="button"
          onClick={() => {
            const speeds = [1, 1.25, 1.5, 2];
            const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
            setPlaybackSpeed(speeds[nextIdx]);
          }}
          aria-label={`Playback speed: ${playbackSpeed}x`}
          className="text-slate-400 hover:text-cyan-300 transition cursor-pointer text-xs font-mono px-2 py-1 rounded border border-transparent hover:border-cyan-500/30 min-w-[36px] min-h-[36px] flex items-center justify-center"
          title={`Speed: ${playbackSpeed}x`}
        >
          {playbackSpeed === 1 ? <Shuffle size={16} /> : `${playbackSpeed}x`}
        </button>

        {/* Skip Back 10s */}
        <button
          type="button"
          onClick={() => skipTime(-10)}
          aria-label="Rewind 10 seconds"
          className="text-slate-400 hover:text-cyan-300 transition cursor-pointer p-2 rounded-xl hover:bg-white/5 min-w-[36px] min-h-[36px] flex items-center justify-center"
          title="Rewind 10 seconds"
        >
          <RotateCcw size={18} />
        </button>

        {/* Main Play / Pause Circle */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
        </button>

        {/* Skip Forward 10s */}
        <button
          type="button"
          onClick={() => skipTime(10)}
          aria-label="Forward 10 seconds"
          className="text-slate-400 hover:text-cyan-300 transition cursor-pointer p-2 rounded-xl hover:bg-white/5 min-w-[36px] min-h-[36px] flex items-center justify-center"
          title="Forward 10 seconds"
        >
          <RotateCw size={18} />
        </button>

        {/* Loop / Repeat */}
        <button
          type="button"
          onClick={() => setIsLooping(!isLooping)}
          aria-label={isLooping ? "Disable looping" : "Enable looping"}
          className={`transition cursor-pointer p-2 rounded-xl min-w-[36px] min-h-[36px] flex items-center justify-center ${
            isLooping
              ? "text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
              : "text-slate-400 hover:text-cyan-300 hover:bg-white/5"
          }`}
          title={isLooping ? "Looping enabled" : "Loop off"}
        >
          <Repeat size={17} />
        </button>
      </div>

      {/* MODERN SAVE / DISCARD BANNER (Shows when new recording is made) */}
      {pendingSaveMemo && (
        <div className="mt-4 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex flex-col gap-2.5 animate-fade-scale">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
              <CheckCircle size={14} /> New Recording Ready ({formatTime(pendingSaveMemo.duration)})
            </span>
            <span className="text-[11px] text-slate-400">Save to access in sidebar</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={pendingSaveMemo.title}
              onChange={(e) =>
                setPendingSaveMemo({ ...pendingSaveMemo, title: e.target.value })
              }
              placeholder="Recording Title..."
              aria-label="Recording Title"
              className="flex-1 bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmSave}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.4)] min-h-[36px]"
              >
                <Save size={13} />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={handleDiscardPending}
                aria-label="Discard recording"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-xl transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Discard recording"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Recording Quick Button & Memo Title */}
      <div className="mt-4 sm:mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-2 truncate pr-2 min-w-0">
          <span className="text-slate-400">Memo Title:</span>
          <span className="font-medium text-slate-200 truncate">{title}</span>
        </div>

        {/* Voice Note Record Action Button */}
        <div>
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition cursor-pointer font-medium"
            >
              <Square size={13} fill="currentColor" />
              <span>Stop REC</span>
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/40 hover:border-cyan-400 transition cursor-pointer font-medium shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            >
              <Mic size={13} />
              <span>Record Voice</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
