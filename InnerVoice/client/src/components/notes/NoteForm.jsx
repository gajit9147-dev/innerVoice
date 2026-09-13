import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  Mic,
  Music2,
  MoreHorizontal,
  Lock,
  Save,
  Tag,
  Check,
} from "lucide-react";
import GlassSurface from "../glass/GlassSurface";

export default function NoteForm({ onSave, onCancel, initialData }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "My Journal",
    feeling: "Peaceful",
    is_locked: false,
  });

  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        content: initialData.content || "",
        category: initialData.category || "My Journal",
        feeling: initialData.feeling || "Peaceful",
        is_locked: initialData.is_locked === 1 || initialData.is_locked === true || false,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!formData.content.trim()) {
      alert("Please write something for your note.");
      return;
    }

    const titleToSave =
      formData.title.trim() ||
      formData.content.trim().split("\n")[0].substring(0, 45) ||
      "My Journal Entry";

    onSave({
      ...formData,
      title: titleToSave,
    });
  };

  const feelings = [
    "Peaceful",
    "Grateful",
    "Inspired",
    "Happy",
    "Reflective",
    "Overthinking",
    "Sad",
    "Stressed",
  ];

  const categories = [
    "My Journal",
    "Reflections",
    "Creative Ideas",
    "Project Notes",
    "Memories",
  ];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 mb-3 border-b border-white/[0.08]">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-medium text-[#9e9990] hover:text-[#f5f2eb] transition cursor-pointer p-1"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <h2 className="font-serif text-xl sm:text-2xl text-[#f5f2eb] font-normal tracking-tight">
          {initialData ? "Edit Note" : "Create a Note"}
        </h2>

        <button
          type="button"
          onClick={handleSubmit}
          className="btn-champagne px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
        >
          Save
        </button>
      </div>

      {/* Inputs Area */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {/* Title Input */}
        <div>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title (optional)"
            className="w-full bg-transparent border-b border-white/[0.08] focus:border-[#e2b17a]/50 py-2.5 text-base sm:text-lg font-serif italic text-[#f5f2eb] placeholder-[#6f6b64] focus:outline-none transition"
          />
        </div>

        {/* Content Textarea */}
        <div>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={10}
            placeholder="Start writing..."
            className="w-full bg-transparent border-none py-2 text-sm sm:text-base leading-relaxed text-[#f5f2eb] placeholder-[#6f6b64] font-sans focus:outline-none resize-none"
          />
        </div>

        {/* More Details Drawer */}
        {showMore && (
          <GlassSurface level={2} className="p-4 rounded-2xl space-y-3 animate-fade-scale text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[#9e9990] block mb-1">Notebook:</span>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="bg-[#121319] border border-white/[0.1] rounded-xl px-3 py-1.5 text-[#f5f2eb] text-xs focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-[#121319]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[#9e9990] block mb-1">Feeling:</span>
                <select
                  name="feeling"
                  value={formData.feeling}
                  onChange={handleChange}
                  className="bg-[#121319] border border-white/[0.1] rounded-xl px-3 py-1.5 text-[#f5f2eb] text-xs focus:outline-none"
                >
                  {feelings.map((f) => (
                    <option key={f} value={f} className="bg-[#121319]">
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-[#9e9990] hover:text-white cursor-pointer mt-4 sm:mt-0">
                <input
                  type="checkbox"
                  name="is_locked"
                  checked={formData.is_locked}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_locked: e.target.checked }))
                  }
                  className="accent-[#e2b17a] rounded"
                />
                <Lock size={13} />
                <span>Protect with Lock</span>
              </label>
            </div>
          </GlassSurface>
        )}
      </div>

      {/* Bottom Action Row */}
      <div className="pt-3 mt-2 border-t border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#9e9990] hover:text-[#f5f2eb] text-xs font-medium transition cursor-pointer"
            onClick={() => alert("Photo attachment is available once saved or via the quick composer!")}
          >
            <ImageIcon size={15} />
            <span>Photo</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#9e9990] hover:text-[#f5f2eb] text-xs font-medium transition cursor-pointer"
            onClick={() => alert("Voice memos can be attached via Voice Recorder!")}
          >
            <Mic size={15} />
            <span>Voice</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#9e9990] hover:text-[#f5f2eb] text-xs font-medium transition cursor-pointer"
            onClick={() => alert("Music tracks can be connected via the Music Library!")}
          >
            <Music2 size={15} />
            <span>Music</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              showMore
                ? "bg-[#e2b17a]/20 text-[#e2b17a]"
                : "bg-white/[0.04] hover:bg-white/[0.08] text-[#9e9990] hover:text-[#f5f2eb]"
            }`}
          >
            <MoreHorizontal size={15} />
            <span>More</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="btn-champagne px-5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  );
}