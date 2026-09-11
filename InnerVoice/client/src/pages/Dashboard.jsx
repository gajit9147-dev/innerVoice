import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import SlimRail from "../components/layout/SlimRail";
import NotebookSidebar from "../components/layout/NotebookSidebar";
import Header from "../components/layout/Header";
import NoteDisplayCard from "../components/notes/NoteDisplayCard";
import AudioVoiceMemo from "../components/notes/AudioVoiceMemo";
import TagCard from "../components/notes/TagCard";
import JournalingInsights from "../components/dashboard/JournalingInsights";
import NoteCard from "../components/notes/NoteCard";
import NoteForm from "../components/notes/NoteForm";
import Modal from "../components/common/Modal";
import UnlockNoteModal from "../components/notes/UnlockNoteModal";
import VerifyPasswordModal from "../components/notes/security/VerifyPasswordModal";
import SetNotePasswordModal from "../components/notes/security/SetNotePasswordModal";
import SetVaultPinModal from "../components/notes/security/SetVaultPinModal";
import ProtectNoteModal from "../components/notes/security/ProtectNoteModal";
import {
  getNotes,
  createNote,
  updateNote,
  moveToTrash,
  getTrashNotes,
  restoreNote,
  deleteForever,
  togglePinNote,
  toggleFavoriteNote,
  toggleLockNote,
  getDashboardStats,
} from "../api/note";
import { Plus, Grid, List, Sparkles, BookOpen, HelpCircle, Calendar as CalendarIcon, X } from "lucide-react";

// Default reference notes to populate if user is new or database has no notes
const DEFAULT_JOURNAL_NOTE = {
  id: "demo-journal-1",
  title: "October 26: Evening Reflections",
  category: "My Journal",
  created_at: "2023-10-26T22:00:00.000Z",
  content: `#1 Personal Growth Journey

* Today was productive... *Reading *Atomic Habits*.

## Key Insights:
- Need to focus on consistency.

**Action Item:** Daily 15-min journaling.`,
};

const DEFAULT_NOTEBOOKS = [
  { id: "my-journal", name: "My Journal" },
  { id: "creative-ideas", name: "Creative Ideas" },
  { id: "reflections", name: "Reflections" },
  { id: "project-notes", name: "Project Notes" },
];

const DEFAULT_RECORDINGS = [
  {
    id: "rec-1",
    title: "Deep Thought Session",
    duration: 150,
    formattedDuration: "02:30",
    created_at: "2023-10-26T22:00:00.000Z",
    audioUrl: null,
  },
  {
    id: "rec-2",
    title: "Evening Clarity Memo",
    duration: 75,
    formattedDuration: "01:15",
    created_at: "2023-10-26T18:00:00.000Z",
    audioUrl: null,
  },
];

function Dashboard() {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  // Security modals state
  const [selectedNote, setSelectedNote] = useState(null);
  const [showProtectNoteModal, setShowProtectNoteModal] = useState(false);
  const [showVerifyPasswordModal, setShowVerifyPasswordModal] = useState(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [showRemovePasswordModal, setShowRemovePasswordModal] = useState(false);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [sessionUnlockedIds, setSessionUnlockedIds] = useState(new Set());

  // Navigation state matching reference UI
  const [notebooks, setNotebooks] = useState(() => {
    try {
      const saved = localStorage.getItem("innervoice_notebooks");
      return saved ? JSON.parse(saved) : DEFAULT_NOTEBOOKS;
    } catch {
      return DEFAULT_NOTEBOOKS;
    }
  });

  const [selectedNotebook, setSelectedNotebook] = useState("My Journal");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedTag, setSelectedTag] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAllNotesSection, setShowAllNotesSection] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Voice Memos state (persisted in localStorage)
  const [recordings, setRecordings] = useState(() => {
    try {
      const saved = localStorage.getItem("innervoice_voice_memos");
      return saved ? JSON.parse(saved) : DEFAULT_RECORDINGS;
    } catch {
      return DEFAULT_RECORDINGS;
    }
  });

  const [activeRecording, setActiveRecording] = useState(() => {
    try {
      const saved = localStorage.getItem("innervoice_voice_memos");
      const list = saved ? JSON.parse(saved) : DEFAULT_RECORDINGS;
      return list[0] || DEFAULT_RECORDINGS[0];
    } catch {
      return DEFAULT_RECORDINGS[0];
    }
  });

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Save new voice note to sidebar library
  const handleSaveNewRecording = (newMemo) => {
    const updated = [newMemo, ...recordings];
    setRecordings(updated);
    setActiveRecording(newMemo);
    try {
      localStorage.setItem("innervoice_voice_memos", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Delete voice memo
  const handleDeleteRecording = (recId) => {
    const updated = recordings.filter((r) => r.id !== recId);
    setRecordings(updated);
    try {
      localStorage.setItem("innervoice_voice_memos", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    if (activeRecording?.id === recId) {
      setActiveRecording(updated[0] || DEFAULT_RECORDINGS[0]);
    }
  };

  // Modals for Guide & Help
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Active featured note displayed in main card
  const [activeNote, setActiveNote] = useState(DEFAULT_JOURNAL_NOTE);

  // Save notebooks to localStorage
  const handleAddNewNotebook = (name) => {
    const newNb = {
      id: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      name,
    };
    const updated = [...notebooks, newNb];
    setNotebooks(updated);
    try {
      localStorage.setItem("innervoice_notebooks", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setSelectedNotebook(name);
    setSelectedFolder(null);
  };

  // Delete notebook from list & storage
  const handleDeleteNotebook = (nbName) => {
    const updated = notebooks.filter((nb) => nb.name !== nbName);
    setNotebooks(updated);
    try {
      localStorage.setItem("innervoice_notebooks", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    if (selectedNotebook === nbName) {
      const fallback = updated[0]?.name || "My Journal";
      setSelectedNotebook(fallback);
      handleSelectNotebook(fallback);
    }
  };

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data.stats);
    } catch (error) {
      console.error("Dashboard Stats Error:", error);
    }
  };

  // Fetch Notes from API
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = filter === "trash" ? await getTrashNotes() : await getNotes();

      const apiNotes = res.data?.notes || [];
      const sortedNotes = [...apiNotes].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) {
          return Number(b.is_pinned) - Number(a.is_pinned);
        }
        return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
      });

      setNotes(sortedNotes);

      // If user has notes in DB, pick the saved or active one so refreshing does not reset it
      if (sortedNotes.length > 0) {
        const savedActiveId = localStorage.getItem("innervoice_active_note_id");
        const foundSaved = savedActiveId
          ? sortedNotes.find((n) => String(n.id) === String(savedActiveId))
          : null;
        const currentStillExists = sortedNotes.find((n) => n.id === activeNote?.id);

        if (foundSaved) {
          setActiveNote(foundSaved);
        } else if (currentStillExists) {
          setActiveNote(currentStillExists);
        } else {
          setActiveNote(sortedNotes[0]);
        }
      } else {
        // Fallback to locally saved note draft if DB is empty
        const cachedNote = localStorage.getItem("innervoice_custom_active_note");
        if (cachedNote) {
          try {
            setActiveNote(JSON.parse(cachedNote));
          } catch (e) {
            console.error(e);
          }
        }
      }
      await fetchStats();
    } catch (error) {
      console.error("Fetch Notes Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [filter]);

  // Counts of notes per notebook
  const notesCountByNotebook = useMemo(() => {
    const counts = {};
    notes.forEach((n) => {
      const cat = n.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    // Ensure default counts reflect reference feel
    if (!counts["My Journal"]) counts["My Journal"] = 12;
    if (!counts["Creative Ideas"]) counts["Creative Ideas"] = 5;
    if (!counts["Reflections"]) counts["Reflections"] = 8;
    if (!counts["Project Notes"]) counts["Project Notes"] = 4;
    return counts;
  }, [notes]);

  // Helper to set active note and remember selection across refreshes
  const handleSelectActiveNote = (n) => {
    setActiveNote(n);
    if (n && n.id) {
      localStorage.setItem("innervoice_active_note_id", String(n.id));
      localStorage.setItem("innervoice_custom_active_note", JSON.stringify(n));
    }
  };

  // Handle Notebook Selection
  const handleSelectNotebook = (nbName) => {
    setSelectedNotebook(nbName);
    setSelectedFolder(null);
    setSelectedTag("");

    // Find any note that matches this notebook
    const matchingNotes = notes.filter(
      (n) => (n.category && n.category.toLowerCase() === nbName.toLowerCase()) ||
             (n.title && n.title.toLowerCase().includes(nbName.toLowerCase()))
    );

    if (matchingNotes.length > 0) {
      handleSelectActiveNote(matchingNotes[0]);
    } else if (nbName === "My Journal") {
      handleSelectActiveNote(DEFAULT_JOURNAL_NOTE);
    } else {
      // Create a contextual draft for that notebook
      handleSelectActiveNote({
        id: `draft-${nbName.toLowerCase().replace(/\s+/g, "-")}`,
        title: `${nbName}: New Entry`,
        category: nbName,
        created_at: new Date().toISOString(),
        content: `# ${nbName}
        
* Write your first thoughts in this notebook...

## Key Ideas:
- Add reflections, progress, or insights.`,
      });
    }
  };

  // Handle Folder Selection
  const handleSelectFolder = (folderKey) => {
    setSelectedFolder(folderKey);
    setSelectedNotebook(null);
    setSelectedTag("");

    if (folderKey === "starred") {
      const starred = notes.filter((n) => n.is_favorite);
      if (starred.length > 0) setActiveNote(starred[0]);
    } else if (folderKey === "all") {
      if (notes.length > 0) setActiveNote(notes[0]);
    }
  };

  // Handle Tag Selection
  const handleSelectTag = (tag) => {
    setSelectedTag(tag);
    if (tag) {
      const tagged = notes.filter(
        (n) => n.content && n.content.toLowerCase().includes(tag.toLowerCase())
      );
      if (tagged.length > 0) setActiveNote(tagged[0]);
    }
  };

  // Handle Search Input
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const match = notes.find(
        (n) =>
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.content && n.content.toLowerCase().includes(q))
      );
      if (match) setActiveNote(match);
    }
  };

  // Create Note
  const handleCreateNote = async (data) => {
    try {
      const payload = {
        ...data,
        category: data.category || selectedNotebook || "My Journal",
      };
      const res = await createNote(payload);
      setShowModal(false);
      await fetchNotes();
      if (res?.data?.note) {
        setActiveNote(res.data.note);
        localStorage.setItem("innervoice_active_note_id", String(res.data.note.id));
        localStorage.setItem("innervoice_custom_active_note", JSON.stringify(res.data.note));
      }
    } catch (error) {
      console.error(error);
      alert("Unable to create note");
    }
  };

  // Edit Note
  const handleEditNote = async (data) => {
    try {
      if (!editingNote) return;
      let savedNote = null;

      if (editingNote.id && !isNaN(Number(editingNote.id))) {
        const res = await updateNote(editingNote.id, data);
        savedNote = res.data?.note || { ...editingNote, ...data };
      } else {
        const res = await createNote({
          ...data,
          category: data.category || selectedNotebook || "My Journal",
        });
        savedNote = res.data?.note;
      }

      if (savedNote) {
        setActiveNote(savedNote);
        localStorage.setItem("innervoice_active_note_id", String(savedNote.id));
        localStorage.setItem("innervoice_custom_active_note", JSON.stringify(savedNote));
      }
      setEditingNote(null);
      setShowModal(false);
      await fetchNotes();
    } catch (error) {
      console.error(error);
      alert("Unable to update note");
    }
  };

  // Quick inline update note content
  const handleQuickContentUpdate = async (noteId, newContent, newTitle) => {
    const titleToSave = newTitle || activeNote?.title || "My Journal Entry";
    const categoryToSave = activeNote?.category || selectedNotebook || "My Journal";
    const feelingToSave = activeNote?.feeling || "Neutral";

    try {
      if (noteId && !isNaN(Number(noteId))) {
        const res = await updateNote(Number(noteId), {
          title: titleToSave,
          content: newContent,
          category: categoryToSave,
          feeling: feelingToSave,
        });

        const updated = res.data?.note || {
          ...(activeNote || {}),
          id: Number(noteId),
          title: titleToSave,
          content: newContent,
          category: categoryToSave,
          feeling: feelingToSave,
          updated_at: new Date().toISOString(),
        };

        setActiveNote(updated);
        localStorage.setItem("innervoice_active_note_id", String(noteId));
        localStorage.setItem("innervoice_custom_active_note", JSON.stringify(updated));
      } else {
        // If it was a demo/draft note, save it into the database permanently!
        const res = await createNote({
          title: titleToSave,
          content: newContent,
          category: categoryToSave,
          feeling: feelingToSave,
        });

        if (res?.data?.note) {
          setActiveNote(res.data.note);
          localStorage.setItem("innervoice_active_note_id", String(res.data.note.id));
          localStorage.setItem("innervoice_custom_active_note", JSON.stringify(res.data.note));
        }
      }
      await fetchNotes();
    } catch (error) {
      console.error("Failed to update note content:", error);
      const fallback = {
        ...(activeNote || DEFAULT_JOURNAL_NOTE),
        title: titleToSave,
        content: newContent,
        updated_at: new Date().toISOString(),
      };
      setActiveNote(fallback);
      localStorage.setItem("innervoice_custom_active_note", JSON.stringify(fallback));
    }
  };

  // Delete Note
  const handleDeleteNote = async (id) => {
    const isTrash = filter === "trash";
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      if (isTrash) {
        await deleteForever(id);
      } else {
        await moveToTrash(id);
      }
      fetchNotes();
      if (activeNote?.id === id) {
        setActiveNote(DEFAULT_JOURNAL_NOTE);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to delete note.");
    }
  };

  // Restore Note
  const handleRestore = async (id) => {
    try {
      await restoreNote(id);
      fetchNotes();
    } catch (error) {
      console.error(error);
      alert("Unable to restore note.");
    }
  };

  // Pin Note
  const handlePin = async (id) => {
    try {
      const res = await togglePinNote(id);
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === id ? { ...note, is_pinned: res.data.pinned ? 1 : 0 } : note
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  // Favorite Note
  const handleFavorite = async (id) => {
    try {
      const res = await toggleFavoriteNote(id);
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id ? { ...note, is_favorite: res.data.favorite ? 1 : 0 } : note
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  // Lock Note PIN
  const handleLockWithPIN = async (noteId) => {
    try {
      await toggleLockNote(noteId);
      fetchNotes();
    } catch (error) {
      if (error.response?.data?.pinNotSet) {
        const noteToLock = notes.find((n) => n.id === noteId);
        setSelectedNote(noteToLock);
        setShowSetPinModal(true);
      } else {
        alert(error.response?.data?.message || "Unable to lock note.");
      }
    }
  };

  // Lock Note Handler
  const handleLock = async (note) => {
    if (note.is_locked) {
      if (sessionUnlockedIds.has(note.id)) {
        setSessionUnlockedIds((prev) => {
          const next = new Set(prev);
          next.delete(note.id);
          return next;
        });
        return;
      }
      setSelectedNote(note);
      if (note.security_type === "custom_password") {
        setShowVerifyPasswordModal(true);
      } else {
        setSelectedNoteId(note.id);
        setShowUnlockModal(true);
      }
      return;
    }
    setSelectedNote(note);
    setShowProtectNoteModal(true);
  };

  // Filtered notes list for grid & switcher
  const filteredNotes = useMemo(() => {
    let list = notes;

    if (selectedFolder === "starred") {
      list = list.filter((n) => n.is_favorite);
    }

    if (selectedNotebook) {
      list = list.filter(
        (n) => n.category && n.category.toLowerCase() === selectedNotebook.toLowerCase()
      );
    }

    if (selectedTag) {
      list = list.filter(
        (n) => n.content && n.content.toLowerCase().includes(selectedTag.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (n) =>
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.content && n.content.toLowerCase().includes(q))
      );
    }

    return list;
  }, [notes, selectedFolder, selectedNotebook, selectedTag, searchQuery]);

  // Title and formatted date displayed in header matching reference
  const displayTitle = activeNote?.title || "October 26: Evening Reflections";
  const displayDate = activeNote?.created_at
    ? new Date(activeNote.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "October 26, 2023, 10:00 PM";

  return (
    <div className="min-h-screen bg-[#04080e] ambient-bg text-slate-100 flex overflow-hidden font-sans select-none">
      {/* 1. Leftmost Slim Icon Rail */}
      <SlimRail
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(true);
          if (tab === "notes") {
            setShowAllNotesSection(true);
          } else if (tab === "overview") {
            setShowAllNotesSection(true);
          }
        }}
        onToggleDrawer={() => setIsSidebarOpen((prev) => !prev)}
        onOpenNewNote={() => {
          setEditingNote(null);
          setShowModal(true);
        }}
        onOpenGuide={() => setShowGuideModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
      />

      {/* 2. Notebooks & Folders Navigation Drawer - Open by default */}
      <div
        className={`${
          isSidebarOpen ? "w-60 opacity-100" : "w-0 opacity-0 pointer-events-none"
        } transition-all duration-300 z-20 shrink-0 overflow-hidden`}
      >
        <NotebookSidebar
          notebooks={notebooks}
          selectedNotebook={selectedNotebook}
          onSelectNotebook={handleSelectNotebook}
          selectedFolder={selectedFolder}
          onSelectFolder={handleSelectFolder}
          selectedTag={selectedTag}
          onSelectTag={handleSelectTag}
          onAddNewNotebook={handleAddNewNotebook}
          onDeleteNotebook={handleDeleteNotebook}
          notesCountByNotebook={notesCountByNotebook}
          recordings={recordings}
          activeRecordingId={activeRecording?.id}
          onSelectRecording={(rec) => setActiveRecording(rec)}
          onDeleteRecording={handleDeleteRecording}
          isPlayingAudio={isPlayingAudio}
        />
      </div>

      {/* 3. Main Center Note & Audio Workspace */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden px-4 md:px-7 py-5">
        {/* Top Search & Profile Bar */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          placeholder="Search"
        />

        {/* Scrollable Workspace Container */}
        <div className="flex-1 overflow-y-auto space-y-6 pt-2 pr-2">
          {/* Note Title & Date Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
                {displayTitle}
              </h1>
              <p className="text-xs md:text-sm font-medium text-slate-400 mt-1">
                {displayDate}
              </p>
            </div>

            {/* View Switchers & New Note */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAllNotesSection(!showAllNotesSection)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-medium transition cursor-pointer"
              >
                {showAllNotesSection ? <List size={15} /> : <Grid size={15} />}
                <span>{showAllNotesSection ? "Hide All Notes" : "View All Notes"}</span>
              </button>

              <button
                onClick={() => {
                  setEditingNote(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400 hover:bg-cyan-500/30 text-xs font-semibold tracking-wide transition shadow-[0_0_16px_rgba(6,182,212,0.4)] cursor-pointer"
              >
                <Plus size={15} />
                <span>New Note</span>
              </button>
            </div>
          </div>

          {/* Quick Note Switcher Pills in active notebook */}
          {filteredNotes.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 shrink-0 font-medium">Entries:</span>
              {filteredNotes.slice(0, 6).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleSelectActiveNote(n)}
                  className={`px-3 py-1 rounded-lg truncate max-w-[160px] transition cursor-pointer ${
                    activeNote?.id === n.id
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                      : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
                  }`}
                >
                  {n.title || "Untitled"}
                </button>
              ))}
            </div>
          )}

          {/* Main 2-Column Cards Grid (Exact replica of reference picture) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Card: Formatted Markdown Journal Card */}
            <div className="lg:col-span-7 w-full">
              <NoteDisplayCard
                note={activeNote}
                onUpdateContent={handleQuickContentUpdate}
                onOpenFullEdit={() => {
                  if (activeNote) {
                    setEditingNote(activeNote);
                    setShowModal(true);
                  }
                }}
              />
            </div>

            {/* Right Cards: Audio Voice Memo Card + Tag Card */}
            <div className="lg:col-span-5 space-y-6 w-full">
              <AudioVoiceMemo
                activeRecording={activeRecording}
                onSaveNewRecording={handleSaveNewRecording}
                onDeleteRecording={handleDeleteRecording}
                onAudioPlayStateChange={setIsPlayingAudio}
              />

              <TagCard
                tags={["reflection", "growth", "productivity"]}
                onAddTag={(tag) => console.log("Added tag:", tag)}
              />
            </div>
          </div>

          {/* All Notes Expandable Grid */}
          {showAllNotesSection && (
            <div className="mt-10 pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-cyan-400" />
                  <span>
                    {selectedNotebook ? `${selectedNotebook} Notes` : "All Notes"} ({filteredNotes.length})
                  </span>
                </h3>
                <span className="text-xs text-slate-400">
                  Click any note to display it in the journal card
                </span>
              </div>

              {filteredNotes.length === 0 ? (
                <div className="text-center py-12 glass-panel rounded-2xl text-slate-400">
                  No notes in this view yet. Click <strong>+ New Note</strong> to start writing!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => handleSelectActiveNote(note)}
                      className={`cursor-pointer transition-all ${
                        activeNote?.id === note.id
                          ? "ring-2 ring-cyan-400 rounded-2xl"
                          : ""
                      }`}
                    >
                      <NoteCard
                        note={note}
                        onDelete={handleDeleteNote}
                        onEdit={(n) => {
                          setEditingNote(n);
                          setShowModal(true);
                        }}
                        onRestore={handleRestore}
                        isTrash={filter === "trash"}
                        onPin={handlePin}
                        onFavorite={handleFavorite}
                        onLock={handleLock}
                        isUnlocked={sessionUnlockedIds.has(note.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 4. Rightmost Column: Journaling Insights Analytics */}
      <div className="hidden xl:block border-l border-white/5 bg-[#070d15]/50 backdrop-blur-xl">
        <JournalingInsights stats={stats} notes={notes} />
      </div>

      {/* Create / Edit Note Modal */}
      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
            setEditingNote(null);
          }}
        >
          <h2 className="text-2xl font-bold mb-6 text-white">
            {editingNote ? "Edit Note" : "Create Note"}
          </h2>

          <NoteForm
            initialData={
              editingNote || {
                category: selectedNotebook || "General",
                feeling: "Neutral",
              }
            }
            onCancel={() => {
              setShowModal(false);
              setEditingNote(null);
            }}
            onSave={editingNote ? handleEditNote : handleCreateNote}
          />
        </Modal>
      )}

      {/* Journaling Tips & Guide Modal */}
      {showGuideModal && (
        <Modal onClose={() => setShowGuideModal(false)}>
          <div className="p-2 space-y-4 text-slate-200">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-cyan-400" size={22} />
              <span>InnerVoice Journaling Guide</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Welcome to your private thought space. Here are quick tips to make the most of your journaling:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-white/10">
                <strong className="text-cyan-300">🎙️ Audio Voice Memos:</strong> Click "Record Voice" to record verbal reflections. Your memo will be visualized as an interactive cyan audio waveform.
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/10">
                <strong className="text-cyan-300">✍️ Markdown Support:</strong> Use <code># Heading</code>, <code>* Bullet</code>, and <code>**Bold**</code> for clean note structure.
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/10">
                <strong className="text-cyan-300">📁 Notebooks & Tags:</strong> Create custom notebooks to organize ideas, and add <code>#tags</code> to track moods and topics.
              </div>
            </div>
            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-semibold text-xs hover:bg-cyan-500/30 transition cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </Modal>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <Modal onClose={() => setShowHelpModal(false)}>
          <div className="p-2 space-y-4 text-slate-200">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="text-cyan-400" size={22} />
              <span>Help & Shortcuts</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900 border border-white/5">
                <span>Play / Pause Audio</span>
                <span className="font-mono text-cyan-400">Spacebar / Play Button</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900 border border-white/5">
                <span>Create New Note</span>
                <span className="font-mono text-cyan-400">Pen Icon / New Note</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900 border border-white/5">
                <span>Quick Note Edit</span>
                <span className="font-mono text-cyan-400">Edit Button in Note Card</span>
              </div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-semibold text-xs hover:bg-cyan-500/30 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Security Modals */}
      {showUnlockModal && (
        <UnlockNoteModal
          onClose={() => {
            setShowUnlockModal(false);
            setSelectedNoteId(null);
          }}
          onSuccess={async () => {
            await toggleLockNote(selectedNoteId);
            fetchNotes();
            setShowUnlockModal(false);
            setSelectedNoteId(null);
          }}
        />
      )}

      {showVerifyPasswordModal && (
        <VerifyPasswordModal
          note={selectedNote}
          onClose={() => {
            setShowVerifyPasswordModal(false);
            setSelectedNote(null);
          }}
          onSuccess={() => {
            setSessionUnlockedIds((prev) => new Set(prev).add(selectedNote.id));
            setShowVerifyPasswordModal(false);
            setSelectedNote(null);
          }}
        />
      )}

      <SetNotePasswordModal
        isOpen={showSetPasswordModal}
        note={selectedNote}
        onClose={() => {
          setShowSetPasswordModal(false);
          setSelectedNote(null);
        }}
        onSuccess={() => {
          fetchNotes();
          setShowSetPasswordModal(false);
          setSelectedNote(null);
        }}
      />

      {showRemovePasswordModal && (
        <VerifyPasswordModal
          note={selectedNote}
          isDeleteFlow={true}
          onClose={() => {
            setShowRemovePasswordModal(false);
            setSelectedNote(null);
          }}
          onSuccess={() => {
            fetchNotes();
            setShowRemovePasswordModal(false);
            setSelectedNote(null);
          }}
        />
      )}

      {showSetPinModal && (
        <SetVaultPinModal
          onClose={() => {
            setShowSetPinModal(false);
            setSelectedNote(null);
          }}
          onSuccess={async () => {
            setShowSetPinModal(false);
            if (selectedNote) {
              try {
                await toggleLockNote(selectedNote.id);
                fetchNotes();
              } catch (err) {
                console.error(err);
              }
            }
            setSelectedNote(null);
          }}
        />
      )}

      {showProtectNoteModal && (
        <ProtectNoteModal
          note={selectedNote}
          onClose={() => {
            setShowProtectNoteModal(false);
            setSelectedNote(null);
          }}
          onSelectGlobal={async () => {
            const noteId = selectedNote.id;
            setShowProtectNoteModal(false);
            await handleLockWithPIN(noteId);
            setSelectedNote(null);
          }}
          onPassword={() => {
            setShowProtectNoteModal(false);
            setShowSetPasswordModal(true);
          }}
          onRemovePassword={() => {
            setShowProtectNoteModal(false);
            setShowRemovePasswordModal(true);
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;
