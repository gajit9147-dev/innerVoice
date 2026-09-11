import { useState } from "react";
import { MoreHorizontal, Plus, X } from "lucide-react";

export default function TagCard({
  tags = ["reflection", "growth", "productivity"],
  onAddTag,
  onRemoveTag,
}) {
  const [tagList, setTagList] = useState(tags);
  const [isAdding, setIsAdding] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = newTagInput.trim().replace(/^#/, "");
    if (trimmed && !tagList.includes(trimmed)) {
      const updated = [...tagList, trimmed];
      setTagList(updated);
      if (onAddTag) onAddTag(trimmed);
    }
    setNewTagInput("");
    setIsAdding(false);
  };

  const handleRemove = (tagToRemove) => {
    const updated = tagList.filter((t) => t !== tagToRemove);
    setTagList(updated);
    if (onRemoveTag) onRemoveTag(tagToRemove);
  };

  return (
    <div className="glass-panel rounded-3xl p-5 relative overflow-hidden text-white transition-all shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm text-slate-300 tracking-wide">
          Tag
        </h4>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-white/5 rounded-lg transition cursor-pointer"
          title="Add tag"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Tags list */}
      <div className="flex flex-wrap items-center gap-2">
        {tagList.map((t) => (
          <span
            key={t}
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#0e1b2b]/80 text-slate-300 border border-white/10 hover:border-cyan-500/40 hover:text-cyan-200 transition shadow-sm"
          >
            <span>#{t}</span>
            <button
              onClick={() => handleRemove(t)}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition cursor-pointer"
              title="Remove tag"
            >
              <X size={12} />
            </button>
          </span>
        ))}

        {/* Add Tag Form */}
        {isAdding ? (
          <form onSubmit={handleAdd} className="inline-flex items-center">
            <input
              type="text"
              placeholder="tag name..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              autoFocus
              className="bg-slate-900 border border-cyan-400/50 rounded-full px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 w-24"
            />
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-slate-400 hover:text-cyan-300 border border-dashed border-white/10 hover:border-cyan-500/40 transition cursor-pointer"
          >
            <Plus size={12} />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
}
