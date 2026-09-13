import React, { useState, useMemo } from "react";
import NoteCard from "./NoteCard";
import { Sparkles, Plus } from "lucide-react";
import GlassSurface from "../glass/GlassSurface";

export default function RecentThoughtsFeed({
  notes = [],
  onDeleteNote,
  onEditNote,
  onPinNote,
  onFavoriteNote,
  onLockNote,
  onRestoreNote,
  onDeleteForever,
  isTrash = false,
  unlockedNoteIds = new Set(),
  onNewNote,
}) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Notes", "Photos", "Voice", "Music"];

  const filteredNotes = useMemo(() => {
    if (activeFilter === "All") return notes;
    if (activeFilter === "Photos") {
      return notes.filter(
        (n) =>
          (n.photos && n.photos.length > 0) ||
          n.photo_url ||
          n.id === "demo-journal-1" ||
          n.id === "demo-journal-2"
      );
    }
    if (activeFilter === "Voice") {
      return notes.filter(
        (n) =>
          (n.voice && n.voice.length > 0) ||
          n.voice_memo ||
          n.id === "demo-journal-2"
      );
    }
    if (activeFilter === "Music") {
      return notes.filter(
        (n) =>
          (n.music && n.music.length > 0) ||
          n.attached_music ||
          n.id === "demo-journal-1"
      );
    }
    if (activeFilter === "Notes") {
      return notes.filter(
        (n) =>
          (!n.photos || n.photos.length === 0) &&
          (!n.voice || n.voice.length === 0) &&
          (!n.music || n.music.length === 0)
      );
    }
    return notes;
  }, [notes, activeFilter]);

  return (
    <div className="space-y-4">
      {/* Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <h2 className="font-serif text-xl sm:text-2xl text-[#f5f2eb] font-normal tracking-tight">
          Recent Thoughts
        </h2>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
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
      </div>

      {/* Note List */}
      {filteredNotes.length === 0 ? (
        <GlassSurface
          level={1}
          className="p-8 sm:p-12 text-center rounded-3xl flex flex-col items-center justify-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center text-[#e2b17a]">
            <Sparkles size={20} />
          </div>
          <h3 className="font-serif text-lg text-[#f5f2eb]">
            No thoughts recorded yet
          </h3>
          <p className="text-xs text-[#9e9990] max-w-sm">
            InnerVoice is ready whenever you are. Write something on your mind above to start your quiet reflection.
          </p>
          {onNewNote && (
            <button
              type="button"
              onClick={onNewNote}
              className="btn-champagne px-4 py-2 rounded-xl text-xs font-semibold mt-2"
            >
              + Create First Note
            </button>
          )}
        </GlassSurface>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={onDeleteNote}
              onEdit={onEditNote}
              onPin={onPinNote}
              onFavorite={onFavoriteNote}
              onLock={onLockNote}
              onRestore={onRestoreNote}
              onDeleteForever={onDeleteForever}
              isTrash={isTrash}
              isUnlocked={unlockedNoteIds.has(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
