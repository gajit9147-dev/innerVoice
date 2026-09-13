import React, { useState, useEffect, useRef } from "react";
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
  X,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import GlassSurface from "../glass/GlassSurface";
import { ARIJIT_SINGH_TRACKS } from "../dashboard/MusicLibraryModal";

export default function NoteForm({ onSave, onCancel, initialData }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "My Journal",
    feeling: "Peaceful",
    is_locked: false,
  });

  const [showMore, setShowMore] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState(
    initialData?.photo_url || initialData?.photos?.[0]?.file_url || null
  );
  const [attachedMusic, setAttachedMusic] = useState(
    initialData?.attached_music || initialData?.music?.[0] || null
  );
  const [attachedVoice, setAttachedVoice] = useState(
    initialData?.voice_memo || initialData?.voice?.[0] || null
  );
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const photoInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        content: initialData.content || "",
        category: initialData.category || "My Journal",
        feeling: initialData.feeling || "Peaceful",
        is_locked: initialData.is_locked === 1 || initialData.is_locked === true || false,
      });
      setAttachedPhoto(
        initialData.photo_url || initialData.photos?.[0]?.file_url || null
      );
      setAttachedMusic(
        initialData.attached_music || initialData.music?.[0] || null
      );
      setAttachedVoice(
        initialData.voice_memo || initialData.voice?.[0] || null
      );
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedPhoto(event.target.result);
      setErrorMessage("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!formData.content.trim()) {
      setErrorMessage("Please write something for your note.");
      return;
    }

    const titleToSave =
      formData.title.trim() ||
      formData.content.trim().split("\n")[0].substring(0, 45) ||
      "My Journal Entry";

    const payload = {
      ...formData,
      title: titleToSave,
      photo_url: attachedPhoto || null,
      photos: attachedPhoto ? [{ file_url: attachedPhoto }] : [],
      attached_music: attachedMusic || null,
      music: attachedMusic ? [attachedMusic] : [],
      voice_memo: attachedVoice || null,
      voice: attachedVoice ? [attachedVoice] : [],
    };

    onSave(payload);
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
      {/* Hidden Photo File Input */}
      <input
        type="file"
        ref={photoInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        className="hidden"
      />

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
          className="btn-champagne px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shadow-md"
        >
          Save
        </button>
      </div>

      {/* Error Feedback Banner */}
      {errorMessage && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

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
            rows={7}
            placeholder="Start writing..."
            className="w-full bg-transparent border-none py-2 text-sm sm:text-base leading-relaxed text-[#f5f2eb] placeholder-[#6f6b64] font-sans focus:outline-none resize-none"
          />
        </div>

        {/* Media Attachments Preview Tray */}
        {(attachedPhoto || attachedMusic || attachedVoice) && (
          <div className="py-2.5 flex flex-wrap items-center gap-2.5 border-t border-white/[0.06]">
            {/* Attached Photo Preview */}
            {attachedPhoto && (
              <div className="relative group/thumb w-16 h-16 rounded-xl overflow-hidden border border-white/20 bg-black/40 shrink-0">
                <img
                  src={attachedPhoto}
                  alt="Attached preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setAttachedPhoto(null)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition"
                  title="Remove photo"
                  aria-label="Remove photo"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Attached Music Chip */}
            {attachedMusic && (
              <div className="glass-inner px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs border border-[#e2b17a]/30 text-[#f5f2eb]">
                <Music2 size={14} className="text-[#e2b17a]" />
                <span className="truncate max-w-[140px] font-medium">
                  {attachedMusic.title || "Selected Music"}
                </span>
                <button
                  type="button"
                  onClick={() => setAttachedMusic(null)}
                  className="text-[#9e9990] hover:text-white transition"
                  aria-label="Remove music"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Attached Voice Memo Chip */}
            {attachedVoice && (
              <div className="glass-inner px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs border border-[#e2b17a]/30 text-[#f5f2eb]">
                <Mic size={14} className="text-[#e2b17a]" />
                <span className="font-medium">Voice Reflection Attached</span>
                <button
                  type="button"
                  onClick={() => setAttachedVoice(null)}
                  className="text-[#9e9990] hover:text-white transition"
                  aria-label="Remove voice memo"
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Music Quick Selector Drawer */}
        {showMusicPicker && (
          <GlassSurface level={2} className="p-3.5 rounded-2xl animate-fade-scale text-xs space-y-2">
            <div className="flex items-center justify-between text-[#9e9990] pb-1 border-b border-white/[0.06]">
              <span className="font-medium text-[#f5f2eb]">Attach Background Music</span>
              <button
                type="button"
                onClick={() => setShowMusicPicker(false)}
                className="hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {ARIJIT_SINGH_TRACKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setAttachedMusic(t);
                    setShowMusicPicker(false);
                  }}
                  className={`p-2 rounded-xl flex items-center gap-2.5 text-left transition border cursor-pointer ${
                    attachedMusic?.id === t.id
                      ? "bg-[#e2b17a]/20 border-[#e2b17a]/40 text-[#f5f2eb]"
                      : "bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.06] text-[#d1cdc7]"
                  }`}
                >
                  <img
                    src={t.artwork_url}
                    alt={t.title}
                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-xs truncate">{t.title}</div>
                    <div className="text-[10px] text-[#9e9990] truncate">{t.artist}</div>
                  </div>
                </button>
              ))}
            </div>
          </GlassSurface>
        )}

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
          {/* Photo Button */}
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
              attachedPhoto
                ? "bg-[#e2b17a]/15 text-[#e2b17a] border-[#e2b17a]/30"
                : "bg-white/[0.04] hover:bg-white/[0.08] text-[#9e9990] hover:text-[#f5f2eb] border-white/[0.04]"
            }`}
            title="Attach photo"
          >
            <ImageIcon size={15} />
            <span>Photo</span>
          </button>

          {/* Voice Memo Button */}
          <button
            type="button"
            onClick={() => {
              if (attachedVoice) {
                setAttachedVoice(null);
              } else {
                setAttachedVoice({
                  title: "Spoken Reflection",
                  durationFormatted: "01:24",
                });
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
              attachedVoice
                ? "bg-[#e2b17a]/15 text-[#e2b17a] border-[#e2b17a]/30"
                : "bg-white/[0.04] hover:bg-white/[0.08] text-[#9e9990] hover:text-[#f5f2eb] border-white/[0.04]"
            }`}
            title="Attach voice memo"
          >
            <Mic size={15} />
            <span>Voice</span>
          </button>

          {/* Music Button */}
          <button
            type="button"
            onClick={() => setShowMusicPicker(!showMusicPicker)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
              attachedMusic || showMusicPicker
                ? "bg-[#e2b17a]/15 text-[#e2b17a] border-[#e2b17a]/30"
                : "bg-white/[0.04] hover:bg-white/[0.08] text-[#9e9990] hover:text-[#f5f2eb] border-white/[0.04]"
            }`}
            title="Attach background music"
          >
            <Music2 size={15} />
            <span>Music</span>
          </button>

          {/* More Options Button */}
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
              showMore
                ? "bg-[#e2b17a]/20 text-[#e2b17a] border-[#e2b17a]/40"
                : "bg-white/[0.04] hover:bg-white/[0.08] text-[#9e9990] hover:text-[#f5f2eb] border-white/[0.04]"
            }`}
            title="Notebook, feelings, and lock settings"
          >
            <MoreHorizontal size={15} />
            <span>More</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="btn-champagne px-5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shadow-md"
        >
          Save
        </button>
      </div>
    </div>
  );
}