import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  Loader2,
  AlertCircle,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { uploadVoiceMemo, updateVoiceMemo } from "../../api/voiceMemo";

export default function AudioVoiceMemo({
  activeRecording,
  onSaveNewRecording,
  onDeleteRecording,
  onAudioPlayStateChange,
  currentNotebook = "My Journal",
}) {
  // Playback & UI State
  const [title, setTitle] = useState(activeRecording?.title || "Deep Thought Session");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(activeRecording?.duration_seconds || activeRecording?.duration || 0);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);

  // Recording State Machine: "idle" | "recording" | "stopped" | "uploading" | "saved"
  const [recordingState, setRecordingState] = useState("idle");
  const [recordTime, setRecordTime] = useState(0);
  const [recordingError, setRecordingError] = useState(null);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(null);

  // Active Audio Source URL (local preview Blob URL or persistent Cloudinary HTTPS URL)
  const [audioUrl, setAudioUrl] = useState(
    activeRecording?.file_url || activeRecording?.audioUrl || null
  );
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [pendingTitle, setPendingTitle] = useState("");

  // Refs
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Number of bars in waveform
  const BAR_COUNT = 38;

  // Natural bell-shape default waveform
  const defaultWaveProfile = useMemo(
    () => [
      0.2, 0.28, 0.35, 0.45, 0.38, 0.52, 0.65, 0.8, 0.72, 0.9, 0.98, 0.85, 0.7, 0.55,
      0.75, 0.88, 1.0, 0.95, 0.85, 0.78, 0.92, 0.82, 0.68, 0.55, 0.72, 0.88, 0.65, 0.48,
      0.58, 0.42, 0.36, 0.28, 0.22, 0.18, 0.15, 0.12, 0.1, 0.08,
    ],
    []
  );

  const [waveProfile, setWaveProfile] = useState(defaultWaveProfile);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const s = Math.max(0, Math.floor(secs || 0));
    const m = Math.floor(s / 60);
    const remS = s % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(m)}:${pad(remS)}`;
  };

  // Sync with activeRecording prop
  useEffect(() => {
    if (activeRecording) {
      const activeTitle = activeRecording.title || "Voice Memo";
      setTitle(activeTitle);
      setEditableTitle(activeTitle);
      setDuration(activeRecording.duration_seconds || activeRecording.duration || 0);
      setAudioUrl(activeRecording.file_url || activeRecording.audioUrl || null);
      setRecordedBlob(null);
      setRecordingState("idle");
      setCurrentTime(0);
      setIsPlaying(false);
      setRecordingError(null);
    }
  }, [activeRecording]);

  // Notify parent of play state change
  useEffect(() => {
    if (onAudioPlayStateChange) onAudioPlayStateChange(isPlaying);
  }, [isPlaying, onAudioPlayStateChange]);

  // Clean up recording tracks & audio context
  const cleanupRecordingTracks = useCallback(() => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      cleanupRecordingTracks();
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, cleanupRecordingTracks]);

  // Detect supported MIME type
  const getSupportedMimeType = () => {
    if (typeof MediaRecorder === "undefined") return "";
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/aac",
      "audio/ogg;codecs=opus",
      "audio/ogg",
    ];
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  };

  // Start Real Microphone Recording
  const startRecording = async () => {
    setRecordingError(null);
    setSavedSuccessMsg(null);

    // Pause any active playback
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setRecordingError("Your browser does not support microphone recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalMime = mediaRecorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: finalMime });
        setRecordedBlob(blob);

        const newBlobUrl = URL.createObjectURL(blob);
        setAudioUrl(newBlobUrl);

        const finalDuration = recordTime || 1;
        setDuration(finalDuration);
        setCurrentTime(0);

        const dynamicTitle = `Voice Memo — ${new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}`;
        setPendingTitle(dynamicTitle);
        setTitle(dynamicTitle);
        setRecordingState("stopped");
        setWaveProfile(defaultWaveProfile);
      };

      // Set up real-time Web Audio AnalyserNode for live waveform animation
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.8;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateWaveform = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);

            // Compute normalized values across BAR_COUNT bars
            const step = Math.max(1, Math.floor(dataArray.length / BAR_COUNT));
            const newProfile = Array.from({ length: BAR_COUNT }, (_, i) => {
              const val = dataArray[i * step] || 0;
              const normalized = val / 255;
              // Base minimum height of 0.15 + actual audio amplitude
              return Math.min(1, Math.max(0.15, normalized * 1.3));
            });

            setWaveProfile(newProfile);
            animFrameRef.current = requestAnimationFrame(updateWaveform);
          };

          updateWaveform();
        }
      } catch (audioCtxErr) {
        console.warn("Real-time audio visualizer fallback:", audioCtxErr);
      }

      mediaRecorder.start(250); // Emit chunks every 250ms
      setRecordingState("recording");
      setRecordTime(0);

      recordTimerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      cleanupRecordingTracks();
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setRecordingError("Microphone permission is required to record a voice note. Please allow microphone access in your browser settings.");
      } else {
        setRecordingError("Microphone unavailable or not detected. Please verify your audio input device.");
      }
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      cleanupRecordingTracks();
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  // Save Recorded Voice Memo to Persistent Cloudinary & MySQL
  const handleSaveRecording = async () => {
    if (!recordedBlob || recordingState === "uploading") return;

    setRecordingState("uploading");
    setRecordingError(null);

    try {
      const formData = new FormData();
      const ext = recordedBlob.type.includes("mp4")
        ? "mp4"
        : recordedBlob.type.includes("ogg")
        ? "ogg"
        : "webm";
      const fileName = `recording-${Date.now()}.${ext}`;

      formData.append("audio", recordedBlob, fileName);
      formData.append("title", pendingTitle || title || "Voice Memo");
      formData.append("duration", String(duration || recordTime || 0));
      if (currentNotebook) {
        formData.append("notebook", currentNotebook);
      }

      const res = await uploadVoiceMemo(formData);
      const savedMemo = res.data?.memo;

      if (savedMemo) {
        setAudioUrl(savedMemo.file_url);
        setTitle(savedMemo.title);
        setDuration(savedMemo.duration_seconds);
        setRecordedBlob(null);
        setRecordingState("saved");
        setSavedSuccessMsg("Voice memo saved permanently!");

        if (onSaveNewRecording) {
          onSaveNewRecording(savedMemo);
        }

        setTimeout(() => setSavedSuccessMsg(null), 4000);
      } else {
        throw new Error("Invalid response received from voice memo service.");
      }
    } catch (err) {
      console.error("Failed to upload voice memo:", err);
      setRecordingState("stopped");
      setRecordingError(
        err.response?.data?.message || "Recording could not be uploaded. Please try again."
      );
    }
  };

  // Discard Unsatisfactory Recording
  const handleDiscardRecording = () => {
    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl);
    }
    setRecordedBlob(null);
    setRecordingState("idle");
    setRecordTime(0);
    setWaveProfile(defaultWaveProfile);
    setAudioUrl(activeRecording?.file_url || activeRecording?.audioUrl || null);
    setTitle(activeRecording?.title || "Deep Thought Session");
    setDuration(activeRecording?.duration_seconds || activeRecording?.duration || 0);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Toggle Audio Playback
  const togglePlay = () => {
    if (!audioUrl || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Playback error:", err);
          setIsPlaying(false);
        });
    }
  };

  // Handle Scrubber Seek
  const handleSeek = (e) => {
    const target = Number(e.target.value);
    setCurrentTime(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  // Skip Backward/Forward
  const skipTime = (delta) => {
    const newTime = Math.min(duration || 100, Math.max(0, currentTime + delta));
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Save Renamed Title
  const handleSaveRenamedTitle = async () => {
    if (!editableTitle.trim()) return;
    setTitle(editableTitle);
    setIsEditingTitle(false);

    if (activeRecording?.id && typeof activeRecording.id === "number") {
      try {
        await updateVoiceMemo(activeRecording.id, { title: editableTitle.trim() });
      } catch (err) {
        console.error("Failed to update title:", err);
      }
    }
  };

  // Delete Voice Memo with confirmation
  const handleDeleteMemo = () => {
    setShowMenu(false);
    if (!activeRecording?.id) return;

    if (window.confirm(`Delete "${title}"? This will permanently remove the audio recording.`)) {
      if (onDeleteRecording) {
        onDeleteRecording(activeRecording.id);
      }
    }
  };

  const progressPercent = Math.min(100, (currentTime / (duration || 1)) * 100);

  return (
    <div className="liquid-glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden text-white transition-all shadow-[0_20px_50px_rgba(0,0,0,0.6)] min-w-0">
      {/* Soft ambient cyan glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Real HTML5 Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onTimeUpdate={() => {
            if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
              setDuration(audioRef.current.duration);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            if (!isLooping) setCurrentTime(duration);
          }}
          onError={() => {
            setIsPlaying(false);
            console.warn("Audio element failed to load source:", audioUrl);
          }}
        />
      )}

      {/* Header: Title and Options Menu */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10 gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5 flex-1 max-w-sm">
              <input
                type="text"
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveRenamedTitle()}
                className="bg-slate-900/90 border border-cyan-400/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none w-full"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveRenamedTitle}
                className="p-1 text-cyan-400 hover:text-cyan-300 rounded"
              >
                <Check size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingTitle(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <h3 className="font-semibold text-base sm:text-lg text-white tracking-wide flex items-center gap-2 truncate">
              <span className="truncate">{title}</span>
              {isPlaying && (
                <Radio size={14} className="text-cyan-400 animate-pulse shrink-0" />
              )}
            </h3>
          )}

          {/* Recording Badge */}
          {recordingState === "recording" && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              REC {formatTime(recordTime)}
            </span>
          )}
        </div>

        {/* Options Menu Button */}
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
                  if (recordingState === "recording") stopRecording();
                  else startRecording();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-200 rounded-lg transition cursor-pointer"
              >
                <Mic size={14} className="text-cyan-400" />
                <span>{recordingState === "recording" ? "Stop Recording" : "Record New Voice Memo"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  setIsEditingTitle(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-200 hover:bg-white/5 rounded-lg transition cursor-pointer"
              >
                <Edit2 size={14} />
                <span>Rename Memo</span>
              </button>

              {audioUrl && (
                <a
                  href={audioUrl}
                  download={`${title.replace(/\s+/g, "_")}.webm`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-200 hover:bg-white/5 rounded-lg transition cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Audio</span>
                </a>
              )}

              {activeRecording && onDeleteRecording && (
                <button
                  type="button"
                  onClick={handleDeleteMemo}
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

      {/* Error Banner */}
      {recordingError && (
        <div className="mb-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{recordingError}</span>
          </div>
          <button
            type="button"
            onClick={() => setRecordingError(null)}
            className="text-rose-400 hover:text-white p-0.5"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Success Banner */}
      {savedSuccessMsg && (
        <div className="mb-3 p-3 rounded-xl bg-teal-950/40 border border-teal-500/40 text-teal-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle size={15} className="shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Waveform Visualizer (Responsive & Real-time) */}
      <div
        className="h-24 sm:h-28 flex items-center justify-between gap-[1.5px] sm:gap-[3px] my-3 px-1.5 sm:px-2 py-2 rounded-xl sm:rounded-2xl bg-[#070e17]/60 border border-white/5 cursor-pointer select-none overflow-hidden"
        onClick={(e) => {
          if (recordingState === "recording") return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          const newT = ratio * (duration || 1);
          setCurrentTime(newT);
          if (audioRef.current) audioRef.current.currentTime = newT;
        }}
        title={recordingState === "recording" ? "Recording live audio..." : "Click waveform to seek"}
      >
        {waveProfile.map((heightFactor, i) => {
          const barProgress = (i / BAR_COUNT) * 100;
          const isPassed = barProgress <= progressPercent && recordingState !== "recording";
          const barHeight = Math.max(6, Math.floor(heightFactor * 72));

          return (
            <div
              key={i}
              style={{ height: `${barHeight}px` }}
              className={`w-0.5 sm:w-1 flex-1 max-w-[4px] min-w-0 rounded-full transition-all duration-100 ${
                recordingState === "recording"
                  ? "bg-gradient-to-t from-red-500 to-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                  : isPassed
                  ? "bg-gradient-to-t from-cyan-500 to-teal-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  : "bg-slate-700/60 hover:bg-slate-600"
              } ${isPlaying ? "wave-bar-active" : ""}`}
            />
          );
        })}
      </div>

      {/* Scrubber & Time Display */}
      <div className="space-y-1.5 pt-1">
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={recordingState === "recording"}
            aria-label="Audio playback seeker"
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none disabled:opacity-30"
          />
        </div>

        <div className="flex justify-between text-[11px] sm:text-xs font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls (Play, Pause, Skip, Speed, Loop) */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 mt-3 sm:mt-4 pt-1">
        {/* Speed Toggle */}
        <button
          type="button"
          onClick={() => {
            const speeds = [1, 1.25, 1.5, 2];
            const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
            const nextSpeed = speeds[nextIdx];
            setPlaybackSpeed(nextSpeed);
            if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
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
          disabled={recordingState === "recording"}
          aria-label="Rewind 10 seconds"
          className="text-slate-400 hover:text-cyan-300 transition cursor-pointer p-2 rounded-xl hover:bg-white/5 min-w-[36px] min-h-[36px] flex items-center justify-center disabled:opacity-30"
          title="Rewind 10 seconds"
        >
          <RotateCcw size={18} />
        </button>

        {/* Main Play / Pause / Record Circle */}
        {recordingState === "recording" ? (
          <button
            type="button"
            onClick={stopRecording}
            aria-label="Stop recording"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 animate-pulse"
            title="Stop recording"
          >
            <Square size={18} fill="currentColor" />
          </button>
        ) : (
          <button
            type="button"
            onClick={togglePlay}
            disabled={!audioUrl}
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-30"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
        )}

        {/* Skip Forward 10s */}
        <button
          type="button"
          onClick={() => skipTime(10)}
          disabled={recordingState === "recording"}
          aria-label="Forward 10 seconds"
          className="text-slate-400 hover:text-cyan-300 transition cursor-pointer p-2 rounded-xl hover:bg-white/5 min-w-[36px] min-h-[36px] flex items-center justify-center disabled:opacity-30"
          title="Forward 10 seconds"
        >
          <RotateCw size={18} />
        </button>

        {/* Loop / Repeat */}
        <button
          type="button"
          onClick={() => {
            const next = !isLooping;
            setIsLooping(next);
            if (audioRef.current) audioRef.current.loop = next;
          }}
          disabled={recordingState === "recording"}
          aria-label={isLooping ? "Disable looping" : "Enable looping"}
          className={`transition cursor-pointer p-2 rounded-xl min-w-[36px] min-h-[36px] flex items-center justify-center disabled:opacity-30 ${
            isLooping
              ? "text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
              : "text-slate-400 hover:text-cyan-300 hover:bg-white/5"
          }`}
          title={isLooping ? "Looping enabled" : "Loop off"}
        >
          <Repeat size={17} />
        </button>
      </div>

      {/* NEW RECORDING PREVIEW & SAVE BANNER */}
      {recordingState === "stopped" && (
        <div className="mt-4 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex flex-col gap-2.5 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
              <CheckCircle size={14} /> New Recording Ready ({formatTime(duration)})
            </span>
            <span className="text-[11px] text-slate-400">Save to upload permanently</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={pendingTitle}
              onChange={(e) => setPendingTitle(e.target.value)}
              placeholder="Recording Title..."
              aria-label="Recording Title"
              className="flex-1 bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveRecording}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.4)] min-h-[36px]"
              >
                <Save size={13} />
                <span>Save Note</span>
              </button>
              <button
                type="button"
                onClick={handleDiscardRecording}
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

      {/* UPLOADING PROGRESS BANNER */}
      {recordingState === "uploading" && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-center gap-3 animate-pulse">
          <Loader2 size={18} className="text-cyan-400 animate-spin" />
          <span className="text-xs text-cyan-200 font-medium">
            Uploading and storing voice note permanently...
          </span>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="mt-4 sm:mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-2 truncate pr-2 min-w-0">
          <span className="text-slate-400">Notebook:</span>
          <span className="font-medium text-slate-200 truncate">{currentNotebook || "My Journal"}</span>
        </div>

        {/* Primary Record Button */}
        <div>
          {recordingState === "recording" ? (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition cursor-pointer font-medium active:scale-95"
            >
              <Square size={13} fill="currentColor" />
              <span>Stop REC</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/40 hover:border-cyan-400 transition cursor-pointer font-medium shadow-[0_0_12px_rgba(6,182,212,0.2)] active:scale-95"
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
