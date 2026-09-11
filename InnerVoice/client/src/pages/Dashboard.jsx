import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SlimRail from "../components/layout/SlimRail";
import NotebookSidebar from "../components/layout/NotebookSidebar";
import Header from "../components/layout/Header";
import CalendarView from "../components/calendar/CalendarView";
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
import MusicLibraryModal from "../components/dashboard/MusicLibraryModal";
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
import { getVoiceMemos, deleteVoiceMemo } from "../api/voiceMemo";
import API from "../api/axios";
import {
  Plus,
  Grid,
  List,
  Sparkles,
  BookOpen,
  HelpCircle,
  Calendar as CalendarIcon,
  X,
  Loader2,
  Copy,
  Check,
  Bot,
  ArrowRight,
  Brain,
} from "lucide-react";

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

function Dashboard({ initialTab = "overview" }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
  const [showMusicLibrary, setShowMusicLibrary] = useState(false);

  // Navigation state matching reference UI
  const [notebooks, setNotebooks] = useState(() => {
    try {
      const saved = localStorage.getItem("innervoice_notebooks");
      return saved ? JSON.parse(saved) : DEFAULT_NOTEBOOKS;
    } catch {
      return DEFAULT_NOTEBOOKS;
    }
  });

  const [isDashboardOverview, setIsDashboardOverview] = useState(false);
  const [selectedNotebook, setSelectedNotebook] = useState("My Journal");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedTag, setSelectedTag] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [showAllNotesSection, setShowAllNotesSection] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Synchronize activeTab when initialTab changes (e.g. navigation to /calendar or /dashboard)
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Handle Dashboard Icon click in SlimRail:
  // If on overview -> toggles sidebar open/closed smoothly (OPEN -> CLOSE -> OPEN -> CLOSE)
  // If on calendar or other view -> navigates to overview and opens sidebar
  const handleDashboardToggle = () => {
    if (activeTab === "overview") {
      setIsSidebarOpen((prev) => !prev);
    } else {
      setActiveTab("overview");
      setIsDashboardOverview(true);
      setIsSidebarOpen(true);
      navigate("/dashboard");
    }
  };

  // Mobile drawer Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when mobile drawer is active
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      if (isSidebarOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const isDashboardActive = isDashboardOverview || (!selectedNotebook && !selectedFolder && !selectedTag);

  // Voice Memos state synchronized with MySQL / Cloudinary backend
  const [recordings, setRecordings] = useState([]);
  const [activeRecording, setActiveRecording] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    const fetchVoiceMemos = async () => {
      try {
        const res = await getVoiceMemos();
        const memos = res.data?.memos || [];
        setRecordings(memos);
        if (memos.length > 0) {
          setActiveRecording(memos[0]);
        } else {
          setActiveRecording(null);
        }
      } catch (err) {
        console.warn("Could not load voice memos from server:", err);
      }
    };
    fetchVoiceMemos();
  }, [user?.id]);

  // Save new voice note to sidebar library
  const handleSaveNewRecording = (newMemo) => {
    setRecordings((prev) => [newMemo, ...prev]);
    setActiveRecording(newMemo);
  };

  // Delete voice memo from backend and local state
  const handleDeleteRecording = async (recId) => {
    try {
      await deleteVoiceMemo(recId);
      setRecordings((prev) => {
        const updated = prev.filter((r) => r.id !== recId);
        if (activeRecording?.id === recId) {
          setActiveRecording(updated[0] || null);
        }
        return updated;
      });
    } catch (err) {
      console.error("Failed to delete voice memo:", err);
      alert("Failed to delete voice memo. Please try again.");
    }
  };

  // Modals for Guide & Help
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // AI Assist Modal State
  const [showAIAssistModal, setShowAIAssistModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiActionType, setAiActionType] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [copiedAiText, setCopiedAiText] = useState(false);

  // Active featured note displayed in main card
  const [activeNote, setActiveNote] = useState(DEFAULT_JOURNAL_NOTE);

  // Real AI Handlers connecting to backend routes
  const handleAISummarize = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiActionType("summary");
    try {
      const content = activeNote?.content || activeNote?.title || "InnerVoice Journal Entry";
      const res = await API.post("/ai/summarize", { note: content });
      setAiResult(res.data.summary || "Summary generated successfully.");
    } catch (err) {
      setAiError(err.response?.data?.message || "Failed to generate AI summary.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIMood = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiActionType("mood");
    try {
      const content = activeNote?.content || activeNote?.title || "InnerVoice Journal Entry";
      const res = await API.post("/ai/mood", { note: content });
      setAiResult(`Detected Mood: ${res.data.mood || "Reflective"} (Confidence: ${Math.round((res.data.confidence || 0.85) * 100)}%)`);
    } catch (err) {
      setAiError(err.response?.data?.message || "Failed to detect mood.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAITags = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiActionType("tags");
    try {
      const content = activeNote?.content || activeNote?.title || "InnerVoice Journal Entry";
      const res = await API.post("/ai/tags", { note: content });
      const tags = Array.isArray(res.data.tags) ? res.data.tags.join(", ") : res.data.tags;
      setAiResult(`Suggested Tags: ${tags || "reflection, mindful, growth"}`);
    } catch (err) {
      setAiError(err.response?.data?.message || "Failed to generate AI tags.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIPrompt = () => {
    setAiActionType("prompt");
    setAiError(null);
    const prompts = [
      "What is one quiet victory or micro-moment from today that brought you a sense of calm?",
      "If you could view your biggest current challenge as a patient mentor, what lesson is it offering you?",
      "What thoughts or anxieties can you consciously give yourself permission to release tonight?",
      "In three sentences, how would your future self encourage you about the decisions you're facing right now?",
      "What is something simple you felt grateful for today that you normally take for granted?",
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setAiResult(randomPrompt);
  };

  // Open modal to create a new note
  const handleNewNote = () => {
    setEditingNote(null);
    setShowModal(true);
  };

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

  // Fetch Notes and Stats concurrently from API
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const notesPromise = filter === "trash" ? getTrashNotes() : getNotes();
      const statsPromise = getDashboardStats();

      const [notesRes, statsRes] = await Promise.all([
        notesPromise.catch((err) => {
          console.error("Fetch Notes Error:", err);
          return { data: { notes: [] } };
        }),
        statsPromise.catch((err) => {
          console.error("Fetch Stats Error:", err);
          return { data: { stats: null } };
        }),
      ]);

      if (statsRes?.data?.stats) {
        setStats(statsRes.data.stats);
      }

      const apiNotes = notesRes.data?.notes || [];
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
    } catch (error) {
      console.error("Fetch Notes Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [filter]);

  // Real dynamic counts of notes per notebook
  const notesCountByNotebook = useMemo(() => {
    const counts = {};
    notes.forEach((n) => {
      const cat = n.category || "My Journal";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [notes]);

  const totalNotesCount = notes.length;
  const starredNotesCount = useMemo(() => {
    return notes.filter((n) => Boolean(n.is_favorite)).length;
  }, [notes]);

  // Helper to set active note and remember selection across refreshes
  const handleSelectActiveNote = (n) => {
    setActiveNote(n);
    if (n && n.id) {
      localStorage.setItem("innervoice_active_note_id", String(n.id));
      localStorage.setItem("innervoice_custom_active_note", JSON.stringify(n));
    }
  };

  // Handle Dashboard Overview selection
  const handleSelectDashboard = () => {
    setIsDashboardOverview(true);
    setSelectedNotebook(null);
    setSelectedFolder(null);
    setSelectedTag("");
    setActiveTab("overview");
    setShowAllNotesSection(true);
    if (notes.length > 0) {
      handleSelectActiveNote(notes[0]);
    }
  };

  // Handle Notebook Selection
  const handleSelectNotebook = (nbName) => {
    setIsDashboardOverview(false);
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
    setIsDashboardOverview(false);
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
    setIsDashboardOverview(false);
    setSelectedTag(tag);
    if (tag) {
      const tagged = notes.filter(
        (n) => n.content && n.content.toLowerCase().includes(tag.toLowerCase())
      );
      if (tagged.length > 0) setActiveNote(tagged[0]);
    }
  };

  // Handle Search Input across title, content, category, feeling
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const match = notes.find(
        (n) =>
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.content && n.content.toLowerCase().includes(q)) ||
          (n.category && n.category.toLowerCase().includes(q)) ||
          (n.feeling && n.feeling.toLowerCase().includes(q))
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
          (n.content && n.content.toLowerCase().includes(q)) ||
          (n.category && n.category.toLowerCase().includes(q)) ||
          (n.feeling && n.feeling.toLowerCase().includes(q))
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
    <div className="min-h-[100dvh] bg-[#04080e] ambient-bg text-slate-100 flex overflow-hidden font-sans select-none">
      <div className="w-full max-w-[2200px] mx-auto flex h-[100dvh] overflow-hidden relative">
        {/* 1. Leftmost Slim Icon Rail (Visible on desktop lg: and up) */}
        <div className="hidden lg:flex shrink-0">
          <SlimRail
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              if (tab === "calendar") {
                navigate("/calendar");
              } else {
                navigate("/dashboard");
                setIsSidebarOpen(true);
                if (tab === "notes") {
                  setShowAllNotesSection(true);
                } else if (tab === "overview") {
                  handleSelectDashboard();
                }
              }
            }}
            onToggleDashboard={handleDashboardToggle}
            onToggleDrawer={() => setIsSidebarOpen((prev) => !prev)}
            onOpenNewNote={handleNewNote}
            onOpenGuide={() => setShowGuideModal(true)}
            onOpenHelp={() => setShowHelpModal(true)}
            onOpenMusicLibrary={() => setShowMusicLibrary(true)}
          />
        </div>

        {/* Mobile Backdrop when drawer is open */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* 2. Notebooks & Folders Navigation Drawer (Drawer overlay on mobile & tablet, static on desktop) */}
        <div
          className={`fixed lg:static top-0 bottom-0 left-0 z-50 bg-[#080f19] lg:bg-transparent ${
            isSidebarOpen
              ? "w-[min(85vw,320px)] sm:w-64 opacity-100 shadow-2xl lg:shadow-none pointer-events-auto"
              : "w-0 opacity-0 pointer-events-none"
          } transition-all duration-300 ease-in-out shrink-0 overflow-hidden h-[100dvh]`}
        >
          <div className="w-[min(85vw,320px)] sm:w-64 min-w-[min(85vw,320px)] sm:min-w-[16rem] h-full">
            <NotebookSidebar
              notebooks={notebooks}
              selectedNotebook={selectedNotebook}
              onSelectNotebook={(name) => {
                handleSelectNotebook(name);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              selectedFolder={selectedFolder}
              onSelectFolder={(folder) => {
                handleSelectFolder(folder);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              selectedTag={selectedTag}
              onSelectTag={(tag) => {
                handleSelectTag(tag);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              onAddNewNotebook={handleAddNewNotebook}
              onDeleteNotebook={handleDeleteNotebook}
              notesCountByNotebook={notesCountByNotebook}
              totalNotesCount={totalNotesCount}
              starredNotesCount={starredNotesCount}
              onSelectDashboard={() => {
                handleSelectDashboard();
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              isDashboardActive={isDashboardActive}
              onSelectCalendar={() => {
                setActiveTab("calendar");
                navigate("/calendar");
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              isCalendarActive={activeTab === "calendar"}
              recordings={recordings}
              activeRecordingId={activeRecording?.id}
              onSelectRecording={(rec) => {
                setActiveRecording(rec);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              onDeleteRecording={handleDeleteRecording}
              isPlayingAudio={isPlayingAudio}
              onClose={() => setIsSidebarOpen(false)}
              onOpenGuide={() => setShowGuideModal(true)}
              onOpenHelp={() => setShowHelpModal(true)}
              onOpenMusicLibrary={() => {
                setShowMusicLibrary(true);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              onLogout={async () => {
                await logout();
                navigate("/login");
              }}
            />
          </div>
        </div>

        {/* 3. Main Center Note & Audio Workspace */}
        <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden px-2 sm:px-5 md:px-7 py-2 sm:py-5 min-w-0 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
          {/* Top Search & Profile Bar */}
          <Header
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            placeholder="Search notes, feelings, ideas, or tags..."
            notes={notes}
            notebooks={notebooks}
            onSelectNote={(note) => {
              handleSelectActiveNote(note);
              setActiveTab("overview");
            }}
            onSelectNotebook={(name) => {
              handleSelectNotebook(name);
              setActiveTab("overview");
            }}
            onAIAssist={() => {
              setShowAIAssistModal(true);
              setAiResult(null);
              setAiError(null);
            }}
          />

          {/* Scrollable Workspace Container */}
          <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pt-1 sm:pt-2 pr-1 sm:pr-2 min-w-0">
            {activeTab === "calendar" ? (
              <CalendarView
                notes={notes}
                isLoading={loading}
                onSelectNote={(note) => {
                  handleSelectActiveNote(note);
                  setActiveTab("overview");
                  navigate("/dashboard");
                }}
                onNewNote={() => {
                  setEditingNote(null);
                  setShowModal(true);
                }}
                onRetry={fetchNotes}
              />
            ) : (
              <>
                {/* Note Title & Date Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 min-w-0">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm break-words leading-tight">
                      {displayTitle}
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5 sm:mt-1 break-words">
                      {displayDate}
                    </p>
                  </div>

                  {/* View Switchers & New Note (touch-friendly 44px on mobile) */}
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0 mt-1 sm:mt-0">
                    <button
                      type="button"
                      onClick={() => setShowAllNotesSection(!showAllNotesSection)}
                      className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold transition cursor-pointer min-h-[44px]"
                    >
                      {showAllNotesSection ? <List size={15} /> : <Grid size={15} />}
                      <span>{showAllNotesSection ? "Hide All Notes" : "View All Notes"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingNote(null);
                        setShowModal(true);
                      }}
                      className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400 hover:bg-cyan-500/30 text-xs font-semibold tracking-wide transition shadow-[0_0_16px_rgba(6,182,212,0.4)] cursor-pointer min-h-[44px]"
                    >
                      <Plus size={16} />
                      <span>New Note</span>
                    </button>
                  </div>
                </div>

                {/* Quick Note Switcher Pills in active notebook */}
                {filteredNotes.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    <span className="text-slate-400 shrink-0 font-medium">Entries:</span>
                    {filteredNotes.slice(0, 8).map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => handleSelectActiveNote(n)}
                        className={`px-3 py-1.5 rounded-lg truncate max-w-[160px] transition cursor-pointer shrink-0 ${
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

                {/* Main 2-Column Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start min-w-0">
                  {/* Left Card: Formatted Markdown Journal Card */}
                  <div className="lg:col-span-7 w-full min-w-0">
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
                  <div className="lg:col-span-5 space-y-5 sm:space-y-6 w-full min-w-0">
                    <AudioVoiceMemo
                      activeRecording={activeRecording}
                      onSaveNewRecording={handleSaveNewRecording}
                      onDeleteRecording={handleDeleteRecording}
                      onAudioPlayStateChange={setIsPlayingAudio}
                      currentNotebook={selectedNotebook}
                    />

                    <TagCard
                      tags={["reflection", "growth", "productivity"]}
                      onAddTag={(tag) => console.log("Added tag:", tag)}
                    />
                  </div>
                </div>

                {/* Mobile and Tablet Journaling Insights (Stacked below main cards without horizontal scroll) */}
                <div className="xl:hidden mt-8 pt-6 border-t border-white/10">
                  <JournalingInsights
                    stats={stats}
                    notes={notes}
                    isInline={true}
                  />
                </div>

                {/* All Notes Expandable Grid */}
                {showAllNotesSection && (
                  <div className="mt-8 sm:mt-10 pt-6 border-t border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
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
                      <div className="text-center py-10 sm:py-12 glass-panel rounded-2xl text-slate-400 text-xs sm:text-sm">
                        No notes in this view yet. Click <strong>+ New Note</strong> to start writing!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
                        {filteredNotes.map((note) => (
                          <div
                            key={note.id}
                            onClick={() => handleSelectActiveNote(note)}
                            className={`cursor-pointer transition-all min-w-0 ${
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
              </>
            )}
          </div>
        </main>

        {/* 4. Rightmost Column: Journaling Insights Analytics (Desktop only) */}
        {activeTab !== "calendar" && (
          <div className="hidden xl:block border-l border-white/5 bg-[#070d15]/50 backdrop-blur-xl shrink-0">
            <JournalingInsights stats={stats} notes={notes} isInline={false} />
          </div>
        )}
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

      {/* =================================================== */}
      {/* AI ASSIST MODAL (Powered by real backend AI routes) */}
      {/* =================================================== */}
      {showAIAssistModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowAIAssistModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-[#09111c]/95 border border-purple-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-5 sm:p-6 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-cyan-500/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>AI Assist</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Copilot
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Analyze, reflect, and enrich your journal entries
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAIAssistModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition"
                aria-label="Close AI Assist"
              >
                <X size={18} />
              </button>
            </div>

            {/* Note Target Context */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">Context Note:</span>
              <span className="font-semibold text-cyan-300 truncate max-w-[240px]">
                {activeNote?.title || "Untitled Note"}
              </span>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={handleAISummarize}
                disabled={aiLoading}
                className="flex items-center gap-2 p-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <Brain size={16} className="text-purple-400 shrink-0" />
                <span>AI Summary</span>
              </button>
              <button
                type="button"
                onClick={handleAIMood}
                disabled={aiLoading}
                className="flex items-center gap-2 p-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-200 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={16} className="text-cyan-400 shrink-0" />
                <span>Mood & Tone</span>
              </button>
              <button
                type="button"
                onClick={handleAITags}
                disabled={aiLoading}
                className="flex items-center gap-2 p-3 rounded-xl bg-teal-950/40 hover:bg-teal-900/50 border border-teal-500/30 text-teal-200 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <Bot size={16} className="text-teal-400 shrink-0" />
                <span>Smart Tags</span>
              </button>
              <button
                type="button"
                onClick={handleAIPrompt}
                disabled={aiLoading}
                className="flex items-center gap-2 p-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 text-amber-200 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <HelpCircle size={16} className="text-amber-400 shrink-0" />
                <span>Writing Prompt</span>
              </button>
            </div>

            {/* Loading Indicator */}
            {aiLoading && (
              <div className="p-6 text-center rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <Loader2 size={24} className="text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Consulting AI model...</p>
              </div>
            )}

            {/* Error Display */}
            {aiError && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
                {aiError}
              </div>
            )}

            {/* Result Display */}
            {aiResult && !aiLoading && (
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                  <span>AI Result ({aiActionType})</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(aiResult);
                      setCopiedAiText(true);
                      setTimeout(() => setCopiedAiText(false), 2000);
                    }}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition cursor-pointer lowercase"
                  >
                    {copiedAiText ? (
                      <>
                        <Check size={12} />
                        <span>copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {aiResult}
                </p>
                {aiActionType === "prompt" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleNewNote();
                      setShowAIAssistModal(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold shadow-md hover:opacity-95 transition cursor-pointer"
                  >
                    <span>Write Note with This Prompt</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAIAssistModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Music Library Modal */}
      <MusicLibraryModal
        isOpen={showMusicLibrary}
        onClose={() => setShowMusicLibrary(false)}
        onSelectNote={(noteId) => {
          const target = notes.find((n) => n.id === noteId);
          if (target) {
            handleSelectActiveNote(target);
          }
        }}
      />
    </div>
  );
}

export default Dashboard;
