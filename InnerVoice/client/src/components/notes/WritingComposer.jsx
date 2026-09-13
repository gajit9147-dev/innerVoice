import React, { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Mic,
  Music2,
  MoreHorizontal,
  ArrowRight,
  Loader2,
  Lock,
  Tag as TagIcon,
  Smile,
  X,
} from "lucide-react";
import GlassSurface from "../glass/GlassSurface";

export default function WritingComposer({
  onSaveNote,
  onOpenPhotoPicker,
  onOpenVoiceRecorder,
  onOpenMusicPicker,
  activeNotebook = "My Journal",
}) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState("Peaceful");
  const [tagsInput, setTagsInput] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const textareaRef = useRef(null);

  const feelings = [
    "Peaceful",
    "Grateful",
    "Inspired",
    "Reflective",
    "Hopeful",
    "Overthinking",
  ];

  const handleSave = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Auto-extract or suggest a serene title from first sentence
      const firstLine = content.trim().split("\n")[0];
      const title =
        firstLine.length > 45
          ? firstLine.substring(0, 42) + "..."
          : firstLine;

      const payload = {
        title: title || "Reflections of the Day",
        content: content.trim(),
        category: activeNotebook || "My Journal",
        feeling: selectedFeeling,
        is_pinned: 0,
        is_locked: isPrivate ? 1 : 0,
      };

      if (onSaveNote) {
        await onSaveNote(payload);
      }

      setContent("");
      setShowMoreMenu(false);
    } catch (err) {
      console.error("Failed to save note from composer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <GlassSurface
      level={1}
      className="p-5 sm:p-6 rounded-3xl relative transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
    >
      {/* Writing Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="Write something on your mind..."
          className="w-full bg-transparent border-none text-[#f5f2eb] placeholder-[#7d7870] font-sans text-sm sm:text-base leading-relaxed focus:outline-none resize-none min-h-[76px]"
        />
      </div>

      {/* Optional More Options Expansion (Feeling / Tags / Privacy) */}
      {showMoreMenu && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-3 animate-fade-scale text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#9e9990]">Feeling:</span>
            <div className="flex gap-1 overflow-x-auto py-1">
              {feelings.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedFeeling(f)}
                  className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
                    selectedFeeling === f
                      ? "bg-[#e2b17a]/20 text-[#e2b17a] border border-[#e2b17a]/40"
                      : "bg-white/[0.04] text-[#9e9990] hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-1.5 text-[#9e9990] cursor-pointer hover:text-white ml-auto">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="accent-[#e2b17a] rounded"
            />
            <Lock size={13} />
            <span>Protect Note</span>
          </label>
        </div>
      )}

      {/* Bottom Bar: Action buttons & Primary Save */}
      <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
        {/* Secondary Media Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onOpenPhotoPicker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#9e9990] hover:text-[#f5f2eb] text-xs font-medium transition cursor-pointer border border-white/[0.04]"
          >
            <ImageIcon size={15} className="text-[#9e9990]" />
            <span>Photo</span>
          </button>

          <button
            type="button"
            onClick={onOpenVoiceRecorder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#9e9990] hover:text-[#f5f2eb] text-xs font-medium transition cursor-pointer border border-white/[0.04]"
          >
            <Mic size={15} className="text-[#9e9990]" />
            <span>Voice</span>
          </button>

          <button
            type="button"
            onClick={onOpenMusicPicker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#9e9990] hover:text-[#f5f2eb] text-xs font-medium transition cursor-pointer border border-white/[0.04]"
          >
            <Music2 size={15} className="text-[#9e9990]" />
            <span>Music</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition cursor-pointer border ${
              showMoreMenu
                ? "bg-[#e2b17a]/15 text-[#e2b17a] border-[#e2b17a]/30"
                : "bg-white/[0.04] hover:bg-white/[0.08] text-[#9e9990] hover:text-[#f5f2eb] border-white/[0.04]"
            } text-xs font-medium`}
            title="More options"
          >
            <MoreHorizontal size={15} />
            <span className="hidden sm:inline">More</span>
          </button>
        </div>

        {/* Primary Save Action: Warm Champagne Button */}
        <button
          type="button"
          disabled={!content.trim() || isSubmitting}
          onClick={handleSave}
          className="btn-champagne flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin text-[#1a140d]" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Save Note</span>
              <ArrowRight size={14} className="stroke-[2.5]" />
            </>
          )}
        </button>
      </div>
    </GlassSurface>
  );
}
