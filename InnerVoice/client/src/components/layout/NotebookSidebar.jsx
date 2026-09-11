import { useState } from "react";
import {
  Plus,
  Square,
  Check,
  X,
  Folder,
  Star,
  ChevronUp,
  ChevronDown,
  Mic,
  Play,
  Pause,
  Trash2,
  Volume2,
} from "lucide-react";

export default function NotebookSidebar({
  notebooks = [
    { id: "my-journal", name: "My Journal" },
    { id: "creative-ideas", name: "Creative Ideas" },
    { id: "reflections", name: "Reflections" },
    { id: "project-notes", name: "Project Notes" },
  ],
  selectedNotebook,
  onSelectNotebook,
  selectedFolder,
  onSelectFolder,
  selectedTag,
  onSelectTag,
  onAddNewNotebook,
  notesCountByNotebook = {},
  // Voice Memos Props
  recordings = [],
  activeRecordingId,
  onSelectRecording,
  onDeleteRecording,
  onTriggerRecord,
  isPlayingAudio = false,
}) {
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [recordingsOpen, setRecordingsOpen] = useState(true);
  const [isAddingNotebook, setIsAddingNotebook] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");

  const tags = ["Life", "Work", "Dreams"];

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const trimmed = newNotebookName.trim();
    if (trimmed) {
      if (onAddNewNotebook) {
        onAddNewNotebook(trimmed);
      }
      onSelectNotebook(trimmed);
      setNewNotebookName("");
      setIsAddingNotebook(false);
    }
  };

  return (
    <aside className="w-60 h-screen flex flex-col justify-between py-6 px-4 bg-[#080f19]/95 border-r border-white/5 backdrop-blur-2xl shrink-0 select-none overflow-y-auto">
      <div className="space-y-6">
        {/* Brand / Logo with Animated Cyan Soundwave */}
        <div className="flex items-center gap-3 px-2 py-1 cursor-pointer">
          <div className="flex items-center gap-1 h-7">
            <span className="w-1 h-3.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.9)]"></span>
            <span className="w-1 h-6 bg-cyan-300 rounded-full shadow-[0_0_12px_rgba(6,182,212,1)]"></span>
            <span className="w-1 h-4 bg-teal-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.9)]"></span>
            <span className="w-1 h-7 bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(6,182,212,1)]"></span>
            <span className="w-1 h-3 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.9)]"></span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-sans">
            InnerVoice
          </span>
        </div>

        {/* Notebooks Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Notebooks</span>
            <button
              onClick={() => setIsAddingNotebook(true)}
              className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-white/5 rounded transition cursor-pointer"
              title="Add New Notebook"
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            {notebooks.map((nb) => {
              const isSelected = selectedNotebook === nb.name;
              const count = notesCountByNotebook[nb.name] || 0;
              return (
                <button
                  key={nb.id || nb.name}
                  onClick={() => {
                    onSelectNotebook(nb.name);
                    if (onSelectFolder) onSelectFolder(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer group ${
                    isSelected
                      ? "pill-active-glow"
                      : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Square
                      size={15}
                      className={
                        isSelected
                          ? "text-cyan-400"
                          : "text-slate-500 group-hover:text-slate-300"
                      }
                    />
                    <span className="truncate">{nb.name}</span>
                  </div>
                  {count > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? "bg-cyan-500/30 text-cyan-200"
                          : "text-slate-500 group-hover:text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Inline New Notebook Input */}
            {isAddingNotebook ? (
              <form
                onSubmit={handleCreateSubmit}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-slate-900 border border-cyan-400/60"
              >
                <input
                  type="text"
                  placeholder="Notebook title..."
                  value={newNotebookName}
                  onChange={(e) => setNewNotebookName(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-1"
                />
                <button
                  type="submit"
                  className="text-cyan-400 hover:text-cyan-300 p-1 cursor-pointer"
                  title="Save"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNotebook(false);
                    setNewNotebookName("");
                  }}
                  className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingNotebook(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 border border-white/10 hover:bg-white/5 transition-all mt-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>New Notebook</span>
              </button>
            )}
          </div>
        </div>

        {/* VOICE MEMOS / RECORDINGS SECTION (Modern Recording System) */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <button
              onClick={() => setRecordingsOpen(!recordingsOpen)}
              className="flex items-center gap-1.5 hover:text-slate-200 cursor-pointer"
            >
              <Mic size={14} className="text-cyan-400" />
              <span>Voice Memos</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                {recordings.length}
              </span>
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={onTriggerRecord}
                className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-white/5 rounded transition cursor-pointer"
                title="Record New Voice Memo"
              >
                <Plus size={15} />
              </button>
              <button
                onClick={() => setRecordingsOpen(!recordingsOpen)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {recordingsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {recordingsOpen && (
            <div className="space-y-1 pt-1 max-h-44 overflow-y-auto pr-1">
              {recordings.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-500 italic">
                  No voice memos yet. Click + to record.
                </div>
              ) : (
                recordings.map((rec) => {
                  const isActive = activeRecordingId === rec.id;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => onSelectRecording && onSelectRecording(rec)}
                      className={`group w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-cyan-950/40 text-cyan-200 border border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                          : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-1">
                        <span className={isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-cyan-300"}>
                          {isActive && isPlayingAudio ? (
                            <Volume2 size={13} className="animate-pulse" />
                          ) : (
                            <Mic size={13} />
                          )}
                        </span>
                        <span className="truncate">{rec.title || "Voice Memo"}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                          {rec.formattedDuration || "01:30"}
                        </span>
                        {onDeleteRecording && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete recording "${rec.title}"?`)) {
                                onDeleteRecording(rec.id);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition cursor-pointer"
                            title="Delete Memo"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Folders Section */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <button
            onClick={() => setFoldersOpen(!foldersOpen)}
            className="w-full flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <span>Folders</span>
            {foldersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {foldersOpen && (
            <div className="space-y-1 pt-1">
              <button
                onClick={() => {
                  onSelectFolder("all");
                  if (onSelectNotebook) onSelectNotebook(null);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                  selectedFolder === "all"
                    ? "pill-active-glow"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Folder size={16} className="text-slate-400" />
                <span>All Notes</span>
              </button>

              <button
                onClick={() => {
                  onSelectFolder("starred");
                  if (onSelectNotebook) onSelectNotebook(null);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                  selectedFolder === "starred"
                    ? "pill-active-glow"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Star size={16} className="text-yellow-400" />
                <span>Starred</span>
              </button>
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <button
            onClick={() => setTagsOpen(!tagsOpen)}
            className="w-full flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <span>Tags</span>
            {tagsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {tagsOpen && (
            <div className="flex flex-wrap gap-2 px-1 pt-1">
              {tags.map((tag) => {
                const isTagSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => onSelectTag(isTagSelected ? "" : tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isTagSelected
                        ? "bg-cyan-500/30 text-cyan-200 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                        : "bg-slate-800/80 text-slate-300 border border-white/5 hover:bg-slate-700/60 hover:text-white"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
