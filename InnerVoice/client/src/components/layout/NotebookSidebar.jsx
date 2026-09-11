import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  BookMarked,
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
  LayoutDashboard,
  Calendar,
  Settings,
  BookOpen,
  HelpCircle,
  LogOut,
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
  onDeleteNotebook,
  notesCountByNotebook = {},
  // Dashboard & Counts Props
  onSelectDashboard,
  isDashboardActive = false,
  onSelectCalendar,
  isCalendarActive = false,
  totalNotesCount = 0,
  starredNotesCount = 0,
  // Voice Memos Props
  recordings = [],
  activeRecordingId,
  onSelectRecording,
  onDeleteRecording,
  onTriggerRecord,
  isPlayingAudio = false,
  // Responsive drawer controls
  onClose,
  onOpenGuide,
  onOpenHelp,
  onLogout,
}) {
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [recordingsOpen, setRecordingsOpen] = useState(true);
  const [isAddingNotebook, setIsAddingNotebook] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState(null);

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

  const handleDeleteClick = (e, nbName) => {
    e.stopPropagation();
    setNotebookToDelete(nbName);
  };

  return (
    <>
      <aside className="w-full max-w-[min(85vw,320px)] sm:w-64 h-full flex flex-col justify-between py-5 px-3 sm:px-4 bg-[#080f19]/95 border-r border-white/5 backdrop-blur-2xl shrink-0 select-none overflow-y-auto">
      <div className="space-y-5">
        {/* Brand / Logo with Animated Cyan Soundwave */}
        <div className="flex items-center justify-between px-1 py-1">
          <div
            onClick={() => {
              if (onSelectDashboard) onSelectDashboard();
            }}
            className="flex items-center gap-3 cursor-pointer"
          >
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

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Primary Navigation Items: Dashboard & Calendar */}
        <div className="space-y-1.5">
          {/* Dashboard Item */}
          <button
            type="button"
            onClick={() => {
              if (onSelectDashboard) onSelectDashboard();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer group ${
              isDashboardActive
                ? "pill-active-glow"
                : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard
                size={16}
                className={isDashboardActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-300"}
              />
              <span>Dashboard</span>
            </div>
            {totalNotesCount > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-md ${
                  isDashboardActive
                    ? "bg-cyan-500/30 text-cyan-200"
                    : "text-slate-500 group-hover:text-slate-400"
                }`}
              >
                {totalNotesCount}
              </span>
            )}
          </button>

          {/* Calendar Item */}
          <button
            type="button"
            onClick={() => {
              if (onSelectCalendar) onSelectCalendar();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer group ${
              isCalendarActive
                ? "pill-active-glow"
                : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
            aria-label="Open calendar"
          >
            <div className="flex items-center gap-2.5">
              <Calendar
                size={16}
                className={isCalendarActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-300"}
              />
              <span>Calendar</span>
            </div>
          </button>
        </div>

        {/* Notebooks Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Notebooks</span>
            <div className="flex items-center gap-1">
              {/* Option 1: Add Notebook */}
              <button
                onClick={() => setIsAddingNotebook(true)}
                className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-white/5 rounded transition cursor-pointer"
                title="Add New Notebook"
              >
                <Plus size={15} />
              </button>
              {/* Option 2: Delete Notebook */}
              <button
                onClick={() => setDeleteMode((prev) => !prev)}
                className={`p-1 rounded transition cursor-pointer ${
                  deleteMode
                    ? "text-rose-400 bg-rose-500/10"
                    : "text-slate-400 hover:text-rose-400 hover:bg-white/5"
                }`}
                title={deleteMode ? "Exit Delete Mode" : "Delete Notebooks"}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            {notebooks.length === 0 ? (
              <div className="px-3 py-4 text-center rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 space-y-2">
                <p>No notebooks yet</p>
                <button
                  type="button"
                  onClick={() => setIsAddingNotebook(true)}
                  className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Notebook</span>
                </button>
              </div>
            ) : (
              notebooks.map((nb) => {
                const isSelected = selectedNotebook === nb.name;
                const count = notesCountByNotebook[nb.name] || 0;
                return (
                  <div
                    key={nb.id || nb.name}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      onSelectNotebook(nb.name);
                      if (onSelectFolder) onSelectFolder(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectNotebook(nb.name);
                        if (onSelectFolder) onSelectFolder(null);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer group select-none ${
                      isSelected
                        ? "pill-active-glow"
                        : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5"
                    }`}
                    aria-label={`Notebook ${nb.name}, ${count} notes`}
                  >
                    <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                      <BookMarked
                        size={16}
                        className={
                          isSelected
                            ? "text-cyan-400 shrink-0 group-hover:scale-105 transition-transform"
                            : "text-slate-400 group-hover:text-cyan-300 shrink-0 transition-colors"
                        }
                      />
                      <span className="truncate">{nb.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {count > 0 && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-md font-mono ${
                            isSelected
                              ? "bg-cyan-500/30 text-cyan-200"
                              : "text-slate-500 group-hover:text-slate-400"
                          }`}
                        >
                          {count}
                        </span>
                      )}

                      {/* Delete Option Icon on Hover or in Delete Mode */}
                      {(deleteMode || nb.name !== "My Journal") && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(e, nb.name)}
                          className={`p-1 rounded-md transition cursor-pointer ${
                            deleteMode
                              ? "text-rose-400 hover:bg-rose-500/20"
                              : "opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 hover:bg-white/10"
                          }`}
                          title={`Delete "${nb.name}" notebook`}
                          aria-label={`Delete "${nb.name}" notebook`}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Inline New Notebook Input with explicit Add and Discard/Delete options */}
            {isAddingNotebook ? (
              <form
                onSubmit={handleCreateSubmit}
                className="space-y-2 p-2.5 rounded-xl bg-slate-900/90 border border-cyan-400/60 shadow-lg"
              >
                <input
                  type="text"
                  placeholder="Notebook title..."
                  value={newNotebookName}
                  onChange={(e) => setNewNotebookName(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-1.5 py-1 border-b border-white/10"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 text-xs font-semibold transition cursor-pointer"
                  >
                    <Check size={13} />
                    <span>Add</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNotebook(false);
                      setNewNotebookName("");
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
                  >
                    <X size={13} />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Two Explicit Options in Notebook Management: Add Notebook & Delete Notebook */
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNotebook(true)}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-cyan-300 hover:border-cyan-500/40 border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <Plus size={14} className="text-cyan-400" />
                  <span>Add</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedNotebook && selectedNotebook !== "My Journal") {
                      setNotebookToDelete(selectedNotebook);
                    } else {
                      setDeleteMode((prev) => !prev);
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-rose-300 hover:border-rose-500/40 border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                  aria-label="Delete notebook"
                >
                  <Trash2 size={13} className="text-rose-400" />
                  <span>Delete</span>
                </button>
              </div>
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                  selectedFolder === "all"
                    ? "pill-active-glow"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Folder size={16} className="text-slate-400" />
                  <span>All Notes</span>
                </div>
                {totalNotesCount > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                    selectedFolder === "all"
                      ? "bg-cyan-500/30 text-cyan-200"
                      : "text-slate-500 hover:text-slate-400"
                  }`}>
                    {totalNotesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onSelectFolder("starred");
                  if (onSelectNotebook) onSelectNotebook(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                  selectedFolder === "starred"
                    ? "pill-active-glow"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star size={16} className="text-yellow-400" />
                  <span>Starred</span>
                </div>
                {starredNotesCount > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                    selectedFolder === "starred"
                      ? "bg-cyan-500/30 text-cyan-200"
                      : "text-slate-500 hover:text-slate-400"
                  }`}>
                    {starredNotesCount}
                  </span>
                )}
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

        {/* Mobile Quick Actions (Settings, Guide, Help, Logout) */}
        <div className="lg:hidden space-y-1 pt-3 mt-4 border-t border-white/10 pb-2">
          <Link
            to="/profile"
            onClick={onClose}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
          >
            <Settings size={15} className="text-slate-400" />
            <span>Profile & Settings</span>
          </Link>

          {onOpenGuide && (
            <button
              type="button"
              onClick={() => {
                onOpenGuide();
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer text-left"
            >
              <BookOpen size={15} className="text-slate-400" />
              <span>Journaling Guide</span>
            </button>
          )}

          {onOpenHelp && (
            <button
              type="button"
              onClick={() => {
                onOpenHelp();
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer text-left"
            >
              <HelpCircle size={15} className="text-slate-400" />
              <span>Help & Support</span>
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              onClick={() => {
                onLogout();
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer text-left"
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>
    </aside>

    {/* Confirmation Dialog for Notebook Deletion */}
    {notebookToDelete && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-sm rounded-2xl bg-[#0b1320] border border-rose-500/30 p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-3 text-rose-400">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Notebook</h3>
              <p className="text-xs text-slate-400">Confirmation required</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Are you sure you want to delete <strong className="text-white font-semibold">"{notebookToDelete}"</strong>? Notes in this notebook will remain safely accessible in All Notes.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setNotebookToDelete(null)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/10 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (onDeleteNotebook) {
                  onDeleteNotebook(notebookToDelete);
                }
                setNotebookToDelete(null);
              }}
              className="flex-1 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/40 transition shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
