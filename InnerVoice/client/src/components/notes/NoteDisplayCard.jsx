import { useState, useEffect } from "react";
import { Edit3, Check, Eye, Sparkles } from "lucide-react";

export default function NoteDisplayCard({
  note,
  onUpdateContent,
  onOpenFullEdit,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const defaultContent = `#1 Personal Growth Journey

* Today was productive... *Reading *Atomic Habits*.

## Key Insights:
- Need to focus on consistency.

**Action Item:** Daily 15-min journaling.`;

  useEffect(() => {
    if (note) {
      setContent(note.content || defaultContent);
      setTitle(note.title || "October 26: Evening Reflections");
    } else {
      setContent(defaultContent);
      setTitle("October 26: Evening Reflections");
    }
  }, [note]);

  const handleSave = () => {
    setIsEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);

    if (onUpdateContent && note) {
      onUpdateContent(note.id, content, title);
    }
  };

  // Helper to render markdown-like styles matching the exact reference image
  const renderStyledContent = (rawText) => {
    const lines = rawText.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading 1 (like #1 Personal Growth Journey)
      if (trimmed.startsWith("#1 ") || trimmed.startsWith("# ")) {
        const text = trimmed.replace(/^#+1?\s*/, "");
        return (
          <h2
            key={idx}
            className="text-xl md:text-2xl font-bold text-sky-400 tracking-tight mb-4 flex items-center gap-2"
          >
            <span>#1</span>
            <span>{text}</span>
          </h2>
        );
      }

      // Heading 2 (like ## Key Insights:)
      if (trimmed.startsWith("## ")) {
        const text = trimmed.replace(/^##\s*/, "");
        return (
          <h3
            key={idx}
            className="text-lg md:text-xl font-bold text-sky-400/90 tracking-tight mt-6 mb-2"
          >
            ## {text}
          </h3>
        );
      }

      // Action Item (like **Action Item:** Daily 15-min journaling.)
      if (trimmed.startsWith("**Action Item:**") || trimmed.includes("Action Item")) {
        const parts = trimmed.split(/(\*\*Action Item:\*\*)/);
        return (
          <div
            key={idx}
            className="mt-6 p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-slate-200 text-sm md:text-base leading-relaxed"
          >
            <span className="font-bold text-white">**Action Item:**</span>
            <span className="ml-1 text-slate-200">
              {trimmed.replace("**Action Item:**", "").trim()}
            </span>
          </div>
        );
      }

      // Bullet points
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const text = trimmed.substring(2);
        return (
          <div
            key={idx}
            className="flex items-start gap-2.5 my-2 text-slate-300 text-sm md:text-base leading-relaxed pl-1"
          >
            <span className="text-cyan-400 mt-1.5">•</span>
            <span>{text}</span>
          </div>
        );
      }

      // Empty line
      if (!trimmed) {
        return <div key={idx} className="h-3" />;
      }

      // Regular text
      return (
        <p
          key={idx}
          className="text-slate-300 text-sm md:text-base leading-relaxed my-1.5"
        >
          {line}
        </p>
      );
    });
  };

  return (
    <div className="glass-panel rounded-3xl p-7 relative overflow-hidden text-white transition-all shadow-[0_20px_50px_rgba(0,0,0,0.55)] min-h-[380px] flex flex-col justify-between">
      {/* Top subtle glow */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Card Header & Controls */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <Sparkles size={14} />
              <span>Journal Entry</span>
            </div>
            {justSaved && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium animate-pulse">
                <Check size={11} /> Saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400 text-xs font-medium hover:bg-cyan-500/30 transition cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              >
                <Check size={13} />
                <span>Save</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 text-slate-300 hover:text-cyan-300 hover:bg-white/10 text-xs font-medium transition cursor-pointer"
                title="Quick edit note"
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
            )}

            {onOpenFullEdit && (
              <button
                onClick={onOpenFullEdit}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
                title="Full note details"
              >
                <Eye size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
                Note Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#070e17]/80 border border-cyan-500/30 rounded-xl px-3.5 py-2 text-white font-semibold text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
                placeholder="Entry title..."
              />
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
                Markdown Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={11}
                className="w-full bg-[#070e17]/80 border border-cyan-500/30 rounded-2xl p-4 text-slate-100 font-mono text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none"
                placeholder="Write your thoughts..."
              />
            </div>
          </div>
        ) : (
          <div className="py-2 pr-1 font-sans select-text">
            {renderStyledContent(content)}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="pt-4 mt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <span>
          {content.split(/\s+/).filter(Boolean).length} words
        </span>
        <span className="text-slate-400">
          Markdown supported
        </span>
      </div>
    </div>
  );
}
