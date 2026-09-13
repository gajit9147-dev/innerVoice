import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Mic,
  Square,
  MoreHorizontal,
  Volume2,
  Trash2,
  Download,
  CheckCircle,
  Save,
  Loader2,
  AlertCircle,
  X,
  ArrowLeft,
} from "lucide-react";
import { uploadVoiceMemo } from "../../api/voiceMemo";
import GlassSurface from "../glass/GlassSurface";

export default function AudioVoiceMemo({
  activeRecording,
  onSaveNewRecording,
  onDeleteRecording,
  onAudioPlayStateChange,
  currentNotebook = "My Journal",
  isModal = false,
  onClose,
}) {
  const [title, setTitle] = useState(activeRecording?.title || "Voice Reflection");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(
    activeRecording?.duration_seconds || activeRecording?.duration || 0
  );

  const [recordingState, setRecordingState] = useState("idle"); // "idle" | "recording" | "stopped" | "uploading" | "saved"
  const [recordTime, setRecordTime] = useState(0);
  const [recordingError, setRecordingError] = useState(null);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(null);

  const [audioUrl, setAudioUrl] = useState(
    activeRecording?.file_url || activeRecording?.audioUrl || null
  );
  const [recordedBlob, setRecordedBlob] = useState(null);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  const BAR_COUNT = 32;
  const defaultWaveProfile = useMemo(
    () => [0.2, 0.3, 0.45, 0.6, 0.8, 0.95, 0.75, 0.9, 0.65, 0.5, 0.7, 0.85, 1, 0.8, 0.6, 0.4, 0.55, 0.75, 0.9, 0.7, 0.5, 0.35, 0.6, 0.8, 0.65, 0.45, 0.3, 0.2, 0.35, 0.5, 0.3, 0.2],
    []
  );
  const [waveProfile, setWaveProfile] = useState(defaultWaveProfile);

  const formatTime = (secs) => {
    const s = Math.max(0, Math.floor(secs || 0));
    const m = Math.floor(s / 60);
    const remS = s % 60;
    return `${String(m).padStart(2, "0")}:${String(remS).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (activeRecording) {
      setTitle(activeRecording.title || "Voice Memo");
      setDuration(activeRecording.duration_seconds || activeRecording.duration || 0);
      setAudioUrl(activeRecording.file_url || activeRecording.audioUrl || null);
      setRecordedBlob(null);
      setRecordingState("idle");
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [activeRecording]);

  useEffect(() => {
    if (onAudioPlayStateChange) onAudioPlayStateChange(isPlaying);
  }, [isPlaying, onAudioPlayStateChange]);

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

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      cleanupRecordingTracks();
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, cleanupRecordingTracks]);

  const startRecording = async () => {
    setRecordingError(null);
    setSavedSuccessMsg(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      audioStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordingState("stopped");
        setDuration(recordTime);
        setCurrentTime(0);
      };

      // Live waveform visualizer
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;

          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateWaveform = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            const normalized = Array.from(dataArray)
              .slice(0, BAR_COUNT)
              .map((val) => Math.max(0.15, val / 255));
            setWaveProfile(normalized);
            animFrameRef.current = requestAnimationFrame(updateWaveform);
          };
          updateWaveform();
        }
      } catch (err) {
        console.warn("Visualizer fallback:", err);
      }

      mediaRecorder.start(200);
      setRecordingState("recording");
      setRecordTime(0);

      recordTimerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      cleanupRecordingTracks();
      setRecordingError("Microphone access was denied or is unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      cleanupRecordingTracks();
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  const handleSaveRecording = async () => {
    if (!recordedBlob || recordingState === "uploading") return;

    setRecordingState("uploading");
    setRecordingError(null);

    try {
      const formData = new FormData();
      const ext = recordedBlob.type.includes("mp4") ? "mp4" : "webm";
      const fileName = `recording-${Date.now()}.${ext}`;

      formData.append("audio", recordedBlob, fileName);
      formData.append("title", title || "Voice Reflection");
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

        setTimeout(() => setSavedSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.warn("Failed to upload voice memo to cloud, falling back to local recording:", err);
      try {
        const localUrl = URL.createObjectURL(recordedBlob);
        const fallbackMemo = {
          id: `local-memo-${Date.now()}`,
          title: title || "Voice Reflection",
          file_url: localUrl,
          duration_seconds: duration || recordTime || 0,
          is_offline: true,
        };
        setAudioUrl(localUrl);
        setRecordedBlob(null);
        setRecordingState("saved");
        setSavedSuccessMsg("Voice memo saved locally to note!");

        if (onSaveNewRecording) {
          onSaveNewRecording(fallbackMemo);
        }

        setTimeout(() => setSavedSuccessMsg(null), 3000);
      } catch (localErr) {
        console.error("Local fallback error:", localErr);
        setRecordingState("stopped");
        setRecordingError("Could not save recording.");
      }
    }
  };

  const handleDiscard = () => {
    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl);
    }
    setRecordedBlob(null);
    setRecordingState("idle");
    setRecordTime(0);
    setWaveProfile(defaultWaveProfile);
    setAudioUrl(activeRecording?.file_url || null);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  return (
    <GlassSurface
      level={isModal ? 3 : 1}
      className={`p-6 sm:p-7 rounded-3xl relative overflow-hidden select-none ${
        isModal ? "w-full max-w-md mx-auto" : "w-full"
      }`}
    >
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#9e9990] hover:text-[#f5f2eb] rounded-xl transition"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="text-center flex-1">
          <h2 className="font-serif text-xl sm:text-2xl text-[#f5f2eb] font-normal tracking-tight">
            Record Voice
          </h2>
          <p className="text-[11px] text-[#9e9990]">
            Speak your thoughts in peace
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#9e9990] hover:text-[#f5f2eb] rounded-xl transition"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      {recordingError && (
        <div className="mt-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{recordingError}</span>
        </div>
      )}
      {savedSuccessMsg && (
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle size={14} />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Large Microphone & Timer */}
      <div className="flex flex-col items-center justify-center my-6">
        <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#e2b17a] mb-3">
          <Mic size={28} />
        </div>

        {/* 00:00 Digital Timer */}
        <div className="font-mono text-3xl sm:text-4xl text-[#f5f2eb] tracking-wider font-light">
          {recordingState === "recording" ? formatTime(recordTime) : formatTime(duration || currentTime)}
        </div>

        {/* Glowing Waveform Visualization */}
        <div className="w-full max-w-xs h-16 flex items-center justify-center gap-1 my-5 px-3 py-2 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
          {waveProfile.map((val, idx) => (
            <span
              key={idx}
              className={`w-1 rounded-full transition-all duration-100 ${
                recordingState === "recording"
                  ? "bg-[#e2b17a] wave-bar-active"
                  : isPlaying
                  ? "bg-[#e2b17a]"
                  : "bg-[#9e9990]/40"
              }`}
              style={{
                height: `${Math.max(6, Math.floor(val * 48))}px`,
                animationDelay: `${idx * 40}ms`,
              }}
            />
          ))}
        </div>

        {/* Record / Stop Button */}
        {recordingState === "recording" ? (
          <button
            type="button"
            onClick={stopRecording}
            className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-[0_0_24px_rgba(225,29,72,0.6)] cursor-pointer hover:scale-105 transition"
            title="Stop recording"
          >
            <Square size={20} fill="currentColor" />
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            className="w-14 h-14 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-[0_0_24px_rgba(225,29,72,0.4)] cursor-pointer hover:scale-105 transition"
            title="Tap to start recording"
          >
            <div className="w-5 h-5 rounded-full bg-white" />
          </button>
        )}

        <span className="text-xs text-[#9e9990] mt-3 font-sans">
          {recordingState === "recording" ? "Recording... tap to finish" : "Tap to start recording"}
        </span>
      </div>

      {/* Post-Recording Actions */}
      {(recordingState === "stopped" || recordedBlob || audioUrl) && (
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
          {audioUrl && (
            <button
              type="button"
              onClick={togglePlayAudio}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-[#f5f2eb] transition"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>
          )}

          {recordedBlob && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleDiscard}
                className="p-2 text-[#9e9990] hover:text-rose-400 rounded-xl hover:bg-white/[0.05] transition text-xs"
                title="Discard"
              >
                <Trash2 size={16} />
              </button>

              <button
                type="button"
                onClick={handleSaveRecording}
                disabled={recordingState === "uploading"}
                className="btn-champagne px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                {recordingState === "uploading" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                <span>Save Memo</span>
              </button>
            </div>
          )}
        </div>
      )}
    </GlassSurface>
  );
}
