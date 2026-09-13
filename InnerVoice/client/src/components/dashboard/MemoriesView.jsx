import React, { useState, useMemo } from "react";
import {
  Sparkles,
  ArrowLeft,
  X,
  Image as ImageIcon,
  Music2,
  Mic,
  Calendar,
  FileText,
  Play,
  Volume2,
} from "lucide-react";
import GlassSurface from "../glass/GlassSurface";
import { useAudioPlayer } from "../../context/AudioPlayerContext";

export default function MemoriesView({
  notes = [],
  onClose,
  onSelectNote,
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const { playTrack, isPlaying, currentTrack } = useAudioPlayer() || {};

  const filters = ["All", "Notes", "Photos", "Voice", "Music"];

  // Aggregate memories from notes & sample photos
  const memoryItems = useMemo(() => {
    const items = [];

    // Add sample showcase memories matching reference image
    items.push({
      id: "mem-1",
      type: "photo",
      title: "City Sunset Horizon",
      date: "Sep 2026",
      image: "/assets/sunset_skyline.jpg",
    });
    items.push({
      id: "mem-2",
      type: "photo",
      title: "Morning Journal & Coffee",
      date: "Sep 2026",
      image: "/assets/coffee_notebook.jpg",
    });
    items.push({
      id: "mem-3",
      type: "photo",
      title: "Rainy Pine Sanctuary",
      date: "Sep 2026",
      image: "/assets/ambient_bg.jpg",
    });
    items.push({
      id: "mem-4",
      type: "photo",
      title: "Mountain Mist Dawn",
      date: "Sep 2026",
      image: "/assets/peaceful_mountain.jpg",
    });

    // Sample music reflections
    items.push({
      id: "mem-mus-1",
      type: "music",
      title: "Kesariya Reflection",
      subtitle: "Arijit Singh",
      date: "Sep 2026",
      file_url: "/assets/arijit/kesariya.mp3",
    });
    items.push({
      id: "mem-mus-2",
      type: "music",
      title: "Tum Hi Ho Starlight",
      subtitle: "Arijit Singh",
      date: "Sep 2026",
      file_url: "/assets/arijit/tum_hi_ho.mp3",
    });

    // Extract memories from user notes
    notes.forEach((n) => {
      const noteDate = n.created_at
        ? new Date(n.created_at).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "Recent";

      // 1. Photos
      if (n.photos && n.photos.length > 0) {
        n.photos.forEach((p, idx) => {
          items.push({
            id: `note-photo-${n.id || n._id}-${idx}`,
            type: "photo",
            title: n.title || "Note Photo",
            date: noteDate,
            image: p.file_url || p.url || p,
            note: n,
          });
        });
      }

      // 2. Voice Memos
      const voiceSrc = n.voice_memo || n.voice_url || n.audio_url || (n.media && n.media.find?.((m) => m.media_type === "voice")?.file_url);
      if (voiceSrc) {
        items.push({
          id: `note-voice-${n.id || n._id}`,
          type: "voice",
          title: n.title ? `${n.title} (Voice)` : "Voice Reflection",
          date: noteDate,
          file_url: voiceSrc,
          note: n,
        });
      }

      // 3. Music
      const musicSrc = n.attached_music || n.music_url || (n.media && n.media.find?.((m) => m.media_type === "music")?.file_url);
      if (musicSrc) {
        items.push({
          id: `note-music-${n.id || n._id}`,
          type: "music",
          title: n.title || "Musical Memory",
          subtitle: typeof musicSrc === "string" ? "Attached Audio" : (musicSrc.title || "Audio Reflection"),
          date: noteDate,
          file_url: typeof musicSrc === "string" ? musicSrc : (musicSrc.file_url || musicSrc.url),
          note: n,
        });
      }

      // 4. Notes
      if (n.title || n.content) {
        items.push({
          id: `note-text-${n.id || n._id}`,
          type: "note",
          title: n.title || "Untitled Thought",
          excerpt: n.content ? n.content.replace(/<[^>]*>?/gm, "").slice(0, 100) : "No written content...",
          date: noteDate,
          note: n,
        });
      }
    });

    return items;
  }, [notes]);

  const filteredItems = useMemo(() => {
    return memoryItems.filter((item) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Photos") return item.type === "photo";
      if (activeFilter === "Music") return item.type === "music";
      if (activeFilter === "Voice") return item.type === "voice";
      if (activeFilter === "Notes") return item.type === "note";
      return true;
    });
  }, [memoryItems, activeFilter]);

  const handleCardClick = (item) => {
    if (item.type === "music" || item.type === "voice") {
      if (playTrack && item.file_url) {
        playTrack({
          id: item.id,
          title: item.title,
          artist: item.subtitle || (item.type === "voice" ? "Voice Note" : "InnerVoice Sound"),
          file_url: item.file_url,
          cover_url: item.image || "/assets/arijit/arijit_portrait.jpg",
        }, item.note);
      }
    }
    if (item.note && onSelectNote) {
      onSelectNote(item.note);
    }
  };

  return (
    <div className="w-full flex flex-col h-full select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
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
          <h2 className="font-serif text-2xl sm:text-3xl text-[#f5f2eb] font-normal tracking-tight">
            Memories
          </h2>
          <p className="text-xs text-[#9e9990] font-sans mt-0.5">
            Collect moments, not things.
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 my-4 pb-2 border-b border-white/[0.06] overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={`pill-filter ${activeFilter === f ? "active" : ""}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Month Grouping & Mosaic Grid */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        <div>
          <div className="font-serif text-sm text-[#e2b17a] font-medium tracking-wide mb-3 flex items-center gap-2">
            <Calendar size={14} />
            <span>Curated Reflections</span>
            <span className="text-xs text-[#9e9990] font-sans font-normal ml-auto">
              {filteredItems.length} {filteredItems.length === 1 ? "moment" : "moments"}
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <GlassSurface level={1} className="p-8 rounded-2xl text-center my-6">
              <Sparkles size={28} className="mx-auto text-[#d8b27a]/60 mb-2" />
              <h3 className="text-sm font-medium text-[#f5f2eb]">No {activeFilter.toLowerCase()} found</h3>
              <p className="text-xs text-[#9e9990] mt-1 max-w-xs mx-auto">
                Add your thoughts, record voice reflections, or attach melodies to build your archive.
              </p>
            </GlassSurface>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {filteredItems.map((item) => {
                if (item.type === "photo") {
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleCardClick(item)}
                      className="group relative rounded-2xl overflow-hidden bg-black/40 border border-white/[0.08] hover:border-[#e2b17a]/40 transition aspect-square cursor-pointer"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = "/assets/coffee_notebook.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                        <span className="text-[11px] font-semibold text-white truncate">
                          {item.title}
                        </span>
                        <span className="text-[9px] text-[#9e9990]">{item.date}</span>
                      </div>
                    </div>
                  );
                }

                if (item.type === "voice") {
                  const isThisPlaying = isPlaying && currentTrack?.id === item.id;
                  return (
                    <GlassSurface
                      key={item.id}
                      level={2}
                      onClick={() => handleCardClick(item)}
                      className="rounded-2xl p-3.5 flex flex-col justify-between aspect-square cursor-pointer border border-white/[0.08] hover:border-[#e2b17a]/40 transition group relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-full bg-[#d8b27a]/15 text-[#d8b27a] flex items-center justify-center">
                          <Mic size={15} />
                        </div>
                        <span className="text-[10px] text-[#9e9990] font-sans">{item.date}</span>
                      </div>

                      <div className="space-y-1 my-auto">
                        <h4 className="text-xs font-serif font-medium text-[#f5f2eb] line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#d8b27a]">
                          {isThisPlaying ? (
                            <>
                              <Volume2 size={12} className="animate-pulse" />
                              <span>Playing audio...</span>
                            </>
                          ) : (
                            <>
                              <Play size={10} />
                              <span>Tap to listen</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-[#d8b27a] transition-all duration-300 ${
                            isThisPlaying ? "w-full animate-pulse" : "w-1/3"
                          }`}
                        />
                      </div>
                    </GlassSurface>
                  );
                }

                if (item.type === "music") {
                  const isThisPlaying = isPlaying && currentTrack?.id === item.id;
                  return (
                    <GlassSurface
                      key={item.id}
                      level={2}
                      onClick={() => handleCardClick(item)}
                      className="rounded-2xl p-3.5 flex flex-col justify-between aspect-square cursor-pointer border border-white/[0.08] hover:border-[#e2b17a]/40 transition group relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-full bg-[#d8b27a]/15 text-[#d8b27a] flex items-center justify-center">
                          <Music2 size={15} />
                        </div>
                        <span className="text-[10px] text-[#9e9990] font-sans">{item.date}</span>
                      </div>

                      <div className="space-y-1 my-auto">
                        <h4 className="text-xs font-serif font-medium text-[#f5f2eb] line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-[#9e9990] truncate">{item.subtitle}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                        <span className="text-[10px] text-[#d8b27a] flex items-center gap-1">
                          {isThisPlaying ? (
                            <>
                              <Volume2 size={11} className="animate-pulse" />
                              <span>Playing</span>
                            </>
                          ) : (
                            <>
                              <Play size={10} />
                              <span>Play Track</span>
                            </>
                          )}
                        </span>
                      </div>
                    </GlassSurface>
                  );
                }

                // Default: Note
                return (
                  <GlassSurface
                    key={item.id}
                    level={2}
                    onClick={() => handleCardClick(item)}
                    className="rounded-2xl p-3.5 flex flex-col justify-between aspect-square cursor-pointer border border-white/[0.08] hover:border-[#e2b17a]/40 transition group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-full bg-white/[0.06] text-[#d8b27a] flex items-center justify-center">
                        <FileText size={13} />
                      </div>
                      <span className="text-[10px] text-[#9e9990] font-sans">{item.date}</span>
                    </div>

                    <div className="space-y-1 my-auto overflow-hidden">
                      <h4 className="text-xs font-serif font-medium text-[#f5f2eb] line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-[#9e9990] line-clamp-3 font-sans leading-relaxed">
                        {item.excerpt}
                      </p>
                    </div>

                    <span className="text-[9px] text-[#d8b27a]/80 font-sans mt-auto">Read entry →</span>
                  </GlassSurface>
                );
              })}

              {/* Handwritten Quote Card Tile */}
              {activeFilter === "All" && (
                <GlassSurface
                  level={2}
                  className="rounded-2xl p-4 flex flex-col items-center justify-center text-center aspect-square border border-white/[0.08]"
                >
                  <span className="font-handwriting text-xl sm:text-2xl text-[#e2b17a] leading-tight">
                    “ Collect moments not things. ♡ ”
                  </span>
                </GlassSurface>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

