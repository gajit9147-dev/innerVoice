import React, { useState } from "react";
import {
  FileEdit,
  Image as ImageIcon,
  Mic,
  Music2,
  Sparkles,
} from "lucide-react";
import GlassSurface from "../glass/GlassSurface";

export default function RightContextPanel({
  onNewNote,
  onAddPhoto,
  onRecordVoice,
  onAddMusic,
  currentMood,
  onSelectMood,
}) {
  const [selectedMood, setSelectedMood] = useState(currentMood || "neutral");
  const [moodFeedback, setMoodFeedback] = useState("It's okay to feel, whatever it is.");

  const moods = [
    { key: "happy", emoji: "😄", label: "Happy", feedback: "Cherish this bright warmth today." },
    { key: "calm", emoji: "🙂", label: "Calm", feedback: "Peace is a quiet victory." },
    { key: "neutral", emoji: "😐", label: "Neutral", feedback: "It's okay to feel, whatever it is." },
    { key: "sad", emoji: "🙁", label: "Sad", feedback: "Give yourself gentle space to breathe." },
    { key: "stressed", emoji: "😡", label: "Stressed", feedback: "Release what is out of your hands." },
  ];

  const handleMoodClick = (mood) => {
    setSelectedMood(mood.key);
    setMoodFeedback(mood.feedback);
    if (onSelectMood) onSelectMood(mood.key);
  };

  return (
    <aside className="w-80 h-[calc(100vh-2rem)] my-4 mr-4 hidden xl:flex flex-col gap-4 select-none shrink-0 overflow-y-auto">
      {/* 1. Top Inspiration Visual Card */}
      <GlassSurface
        level={1}
        className="relative overflow-hidden rounded-2xl h-48 group shrink-0 p-0"
      >
        <img
          src="/assets/peaceful_mountain.jpg"
          alt="Peaceful contemplation"
          className="w-full h-full object-cover brightness-[0.7] group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0e]/90 via-black/30 to-transparent flex flex-col justify-end p-4">
          <div className="font-serif text-lg text-[#f5f2eb] leading-snug font-normal">
            Small Thoughts
          </div>
          <div className="font-serif text-2xl text-[#e2b17a] font-medium leading-none">
            Big Peace
          </div>
        </div>
      </GlassSurface>

      {/* 2. Quick Actions (2x2 Liquid Glass Grid) */}
      <GlassSurface level={1} className="p-4 rounded-2xl">
        <h3 className="text-xs font-semibold text-[#9e9990] uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onNewNote}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-[#e2b17a]/30 transition-all cursor-pointer group"
          >
            <FileEdit
              size={18}
              className="text-[#9e9990] group-hover:text-[#e2b17a] transition-colors"
            />
            <span className="text-xs font-medium text-[#f5f2eb] mt-2">
              New Note
            </span>
          </button>

          <button
            type="button"
            onClick={onAddPhoto}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-[#e2b17a]/30 transition-all cursor-pointer group"
          >
            <ImageIcon
              size={18}
              className="text-[#9e9990] group-hover:text-[#e2b17a] transition-colors"
            />
            <span className="text-xs font-medium text-[#f5f2eb] mt-2">
              Add Photo
            </span>
          </button>

          <button
            type="button"
            onClick={onRecordVoice}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-[#e2b17a]/30 transition-all cursor-pointer group"
          >
            <Mic
              size={18}
              className="text-[#9e9990] group-hover:text-[#e2b17a] transition-colors"
            />
            <span className="text-xs font-medium text-[#f5f2eb] mt-2">
              Record Voice
            </span>
          </button>

          <button
            type="button"
            onClick={onAddMusic}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-[#e2b17a]/30 transition-all cursor-pointer group"
          >
            <Music2
              size={18}
              className="text-[#9e9990] group-hover:text-[#e2b17a] transition-colors"
            />
            <span className="text-xs font-medium text-[#f5f2eb] mt-2">
              Add Music
            </span>
          </button>
        </div>
      </GlassSurface>

      {/* 3. Subtle Mindful Quote Card */}
      <GlassSurface level={2} className="p-4 rounded-2xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <p className="font-serif italic text-sm text-[#d1cdc7] leading-relaxed">
            “ Not everything needs to be solved. Some things just need to be felt. ”
          </p>
          <svg
            className="w-6 h-12 text-[#e2b17a]/30 shrink-0"
            viewBox="0 0 24 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 44 C12 28, 14 18, 12 4" />
            <path d="M12 32 C18 28, 22 30, 21 34 C19 37, 15 35, 12 32" />
            <path d="M12 22 C6 18, 2 20, 3 24 C5 27, 9 25, 12 22" />
            <path d="M12 12 C17 8, 21 10, 20 14 C18 17, 15 15, 12 12" />
          </svg>
        </div>
      </GlassSurface>

      {/* 4. Your Mood Section */}
      <GlassSurface level={1} className="p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-semibold text-[#9e9990] uppercase tracking-wider">
            Your Mood
          </h3>
          <span className="text-[11px] text-[#e2b17a] font-medium capitalize">
            {selectedMood}
          </span>
        </div>
        <p className="text-xs text-[#9e9990] mb-3">
          How are you feeling right now?
        </p>

        {/* 5 Emojis */}
        <div className="flex items-center justify-between gap-1 p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          {moods.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => handleMoodClick(m)}
              className={`w-9 h-9 flex items-center justify-center text-lg rounded-lg transition-all duration-200 cursor-pointer ${
                selectedMood === m.key
                  ? "bg-[#e2b17a]/20 scale-110 shadow-[0_0_12px_rgba(226,177,122,0.3)] border border-[#e2b17a]/40"
                  : "opacity-60 hover:opacity-100 hover:scale-105"
              }`}
              title={m.label}
              aria-label={m.label}
            >
              <span>{m.emoji}</span>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-[#9e9990] text-center mt-2.5 italic">
          {moodFeedback}
        </p>
      </GlassSurface>
    </aside>
  );
}
