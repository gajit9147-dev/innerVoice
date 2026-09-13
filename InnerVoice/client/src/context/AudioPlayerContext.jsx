// ============================================================
// client/src/context/AudioPlayerContext.jsx
// Global Audio Player Context & Background Playback Engine
// Supports uninterrupted playback, seeking, volume, and offline Blob playback
// ============================================================

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { getOfflineMediaBlob, getOfflineVoiceMemoBlob } from "../utils/offlineStorage";

export const AudioPlayerContext = createContext(null);

export function AudioPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const activeBlobUrlRef = useRef(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.volume = volume;
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoadingAudio(false);
    };
    const onWaiting = () => setIsLoadingAudio(true);
    const onPlaying = () => setIsLoadingAudio(false);
    const onEnded = () => {
      if (audio.loop) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };
    const onError = (e) => {
      console.warn("[AudioPlayer] Playback error:", e);
      setIsLoadingAudio(false);
      setIsPlaying(false);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
      }
    };
  }, []);

  // Play a track (with offline fallback check)
  const playTrack = useCallback(async (track, parentNote = null) => {
    if (!audioRef.current || !track) return;
    const audio = audioRef.current;

    // Clean up previous blob URL if exists
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }

    setIsLoadingAudio(true);

    // If same track is already playing/paused, just toggle
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch((err) => console.warn("Play error:", err));
      }
      return;
    }

    let sourceUrl = track.file_url;

    // Check offline Blob storage if offline or URL fails
    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
    if (isOffline || !sourceUrl) {
      try {
        let blob = await getOfflineMediaBlob(track.id);
        if (!blob && track.media_type === "voice") {
          blob = await getOfflineVoiceMemoBlob(track.id);
        }
        if (blob) {
          sourceUrl = URL.createObjectURL(blob);
          activeBlobUrlRef.current = sourceUrl;
        }
      } catch (err) {
        console.warn("Could not load offline audio Blob:", err);
      }
    }

    if (!sourceUrl) {
      setIsLoadingAudio(false);
      console.warn("[AudioPlayer] Audio source is not available offline.");
      return;
    }

    audio.src = sourceUrl;
    audio.currentTime = 0;
    audio.loop = isRepeating;

    setCurrentTrack({
      ...track,
      parentNote: parentNote || track.parentNote || null,
    });

    try {
      await audio.play();
    } catch (err) {
      console.warn("[AudioPlayer] Autoplay prevented or failed:", err);
      // Try fallback from IndexedDB if remote fetch failed
      try {
        const blob = await getOfflineMediaBlob(track.id);
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          activeBlobUrlRef.current = blobUrl;
          audio.src = blobUrl;
          await audio.play();
        }
      } catch {
        setIsPlaying(false);
      }
    } finally {
      setIsLoadingAudio(false);
    }
  }, [currentTrack, isPlaying, isRepeating]);

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.warn("Toggle play error:", err));
    }
  }, [isPlaying]);

  const seekTrack = useCallback((seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(seconds, audioRef.current.duration || 0));
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const setVolume = useCallback((val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeating((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.loop = next;
      }
      return next;
    });
  }, []);

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isRepeating,
        isLoadingAudio,
        playTrack,
        pauseTrack,
        togglePlay,
        seekTrack,
        setVolume,
        toggleRepeat,
        closePlayer,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}
