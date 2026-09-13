import React, { useState, useMemo } from "react";
import {
  Sparkles,
  ArrowLeft,
  X,
  Image as ImageIcon,
  Heart,
  Music2,
  Mic,
  Calendar,
} from "lucide-react";
import GlassSurface from "../glass/GlassSurface";

export default function MemoriesView({
  notes = [],
  onClose,
  onSelectNote,
}) {
  const [activeFilter, setActiveFilter] = useState("All");

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

    // Extract photos from user notes
    notes.forEach((n) => {
      if (n.photos && n.photos.length > 0) {
        n.photos.forEach((p, idx) => {
          items.push({
            id: `note-photo-${n.id}-${idx}`,
            type: "photo",
            title: n.title || "Note Photo",
            date: n.created_at ? new Date(n.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recent",
            image: p.file_url,
            note: n,
          });
        });
      }
    });

    return items;
  }, [notes]);

  const filteredItems = memoryItems.filter((item) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Photos") return item.type === "photo";
    if (activeFilter === "Music") return item.type === "music";
    if (activeFilter === "Voice") return item.type === "voice";
    return true;
  });

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
            <span>September 2026</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.note && onSelectNote) onSelectNote(item.note);
                }}
                className="group relative rounded-2xl overflow-hidden bg-black/40 border border-white/[0.08] hover:border-[#e2b17a]/40 transition aspect-square cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                  <span className="text-[11px] font-semibold text-white truncate">
                    {item.title}
                  </span>
                  <span className="text-[9px] text-[#9e9990]">{item.date}</span>
                </div>
              </div>
            ))}

            {/* Handwritten Quote Card Tile */}
            <GlassSurface
              level={2}
              className="rounded-2xl p-4 flex flex-col items-center justify-center text-center aspect-square"
            >
              <span className="font-handwriting text-xl sm:text-2xl text-[#e2b17a] leading-tight">
                “ Collect moments not things. ♡ ”
              </span>
            </GlassSurface>
          </div>
        </div>
      </div>
    </div>
  );
}
