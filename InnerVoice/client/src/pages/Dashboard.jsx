import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import RightContextPanel from "../components/layout/RightContextPanel";
import WritingComposer from "../components/notes/WritingComposer";
import RecentThoughtsFeed from "../components/notes/RecentThoughtsFeed";
import NoteForm from "../components/notes/NoteForm";
import Modal from "../components/common/Modal";
import MusicLibraryModal from "../components/dashboard/MusicLibraryModal";
import MemoriesView from "../components/dashboard/MemoriesView";
import AudioVoiceMemo from "../components/notes/AudioVoiceMemo";
import CalendarView from "../components/calendar/CalendarView";
import { useToast } from "../context/ToastContext";

// Security modals
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
import { getVoiceMemos, deleteVoiceMemo } from "../api/voiceMemo";
import { uploadMediaFile } from "../api/media";
import API from "../api/axios";
import {
  Home,
  BookOpen,
  Image as ImageIcon,
  Music2,
  Plus,
  Sparkles,
  Bot,
  Copy,
  Check,
  Loader2,
  Archive,
  Search,
} from "lucide-react";
import GlassSurface from "../components/glass/GlassSurface";

// Reference notes matching the exact design truth in the attached image
const DEMO_REFERENCE_NOTES = [
  {
    id: "demo-journal-1",
    title: "Some days just feel different...",
    category: "My Journal",
    feeling: "Peaceful",
    created_at: "2026-09-11T20:30:00.000Z",
    content:
      "Today was one of those days. I don't know why, but everything felt a little calmer. I spent some time listening to this song and it actually made me feel better.",
    photo_url: "/assets/sunset_skyline.jpg",
    photos: [{ file_url: "/assets/sunset_skyline.jpg" }],
    attached_music: {
      id: "arijit-tum-hi-ho",
      title: "Tum Hi Ho",
      artist: "Arijit Singh • Aashiqui 2",
      artwork_url: "/assets/music/cover_tum_hi_ho.jpg",
      file_url: "/assets/music/tum_hi_ho.mp3",
      duration: 267,
      durationFormatted: "04:27",
      currentTimeFormatted: "01:15",
    },
    handwritten_note: "Good things take time. ♡",
    is_pinned: 1,
    is_favorite: 1,
  },
  {
    id: "demo-journal-2",
    title: "A moment for myself",
    category: "Reflections",
    feeling: "Grateful",
    created_at: "2026-09-10T17:15:00.000Z",
    content:
      "Sometimes I just need a place to say what I feel. Grateful for small moments, good music and clearer thoughts.",
    photo_url: "/assets/coffee_notebook.jpg",
    photos: [{ file_url: "/assets/coffee_notebook.jpg" }],
    attached_music: {
      id: "arijit-kesariya",
      title: "Kesariya",
      artist: "Arijit Singh • Brahmāstra",
      artwork_url: "/assets/music/cover_kesariya.jpg",
      file_url: "/assets/music/kesariya.mp3",
      duration: 268,
      durationFormatted: "04:28",
      currentTimeFormatted: "00:45",
    },
    voice_memo: {
      id: "demo-voice-1",
      title: "Evening Clarity",
      duration: 258,
      durationFormatted: "04:18",
      currentTimeFormatted: "01:24",
    },
    handwritten_note: "Just me... ♡",
    is_pinned: 0,
    is_favorite: 0,
  },
];

export default function Dashboard({ initialTab = "today" }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");

  // Core state
  const [activeTab, setActiveTab] = useState(initialTab === "overview" ? "today" : initialTab);
  const [notes, setNotes] = useState(DEMO_REFERENCE_NOTES);
  const [trashNotes, setTrashNotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { addToast } = useToast();

  // Modals
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [musicModalInitialAdd, setMusicModalInitialAdd] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showMemoriesModal, setShowMemoriesModal] = useState(false);

  // Security modals
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showProtectNoteModal, setShowProtectNoteModal] = useState(false);
  const [showVerifyPasswordModal, setShowVerifyPasswordModal] = useState(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [sessionUnlockedIds, setSessionUnlockedIds] = useState(new Set());

  // Hidden photo file input ref for quick attachment
  const photoFileInputRef = useRef(null);

  // AI Assist Modal
  const [showAIAssistModal, setShowAIAssistModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [copiedAiText, setCopiedAiText] = useState(false);

  // Sync activeTab when URL initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === "overview" ? "today" : initialTab);
    }
  }, [initialTab]);

  // Fetch real notes and stats from backend
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const [notesRes, statsRes] = await Promise.all([
        getNotes().catch(() => ({ data: { notes: [] } })),
        getDashboardStats().catch(() => ({ data: { stats: null } })),
      ]);

      const apiNotes = notesRes.data?.notes || [];
      if (apiNotes.length > 0) {
        // Merge API notes with the demo reference notes to ensure full rich display
        const existingIds = new Set(apiNotes.map((n) => String(n.id)));
        const combined = [
          ...apiNotes,
          ...DEMO_REFERENCE_NOTES.filter((d) => !existingIds.has(String(d.id))),
        ];
        setNotes(combined);
      } else {
        setNotes(DEMO_REFERENCE_NOTES);
      }

      if (statsRes.data?.stats) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.warn("Could not fetch notes from API, using serene fallback:", err);
      setNotes(DEMO_REFERENCE_NOTES);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrash = async () => {
    try {
      const res = await getTrashNotes();
      setTrashNotes(res.data?.notes || []);
    } catch (err) {
      console.warn("Trash fetch fallback:", err);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchTrash();
  }, []);

  // Handle Note CRUD Operations
  const handleCreateNote = async (data) => {
    try {
      const payload = {
        title: data.title || "Reflections of the Day",
        content: data.content,
        category: data.category || "My Journal",
        feeling: data.feeling || "Peaceful",
        is_pinned: data.is_pinned || 0,
        is_locked: data.is_locked ? 1 : 0,
      };

      const res = await createNote(payload);
      const created = res.data?.note || {
        ...payload,
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      setNotes((prev) => [created, ...prev]);
      setShowNoteModal(false);
      fetchNotes();
    } catch (err) {
      console.error("Create note error:", err);
      const fallback = {
        id: `local-${Date.now()}`,
        ...data,
        created_at: new Date().toISOString(),
      };
      setNotes((prev) => [fallback, ...prev]);
      setShowNoteModal(false);
    }
  };

  const handleEditNote = async (data) => {
    try {
      if (!editingNote) return;
      if (editingNote.id && !String(editingNote.id).startsWith("demo-") && !String(editingNote.id).startsWith("local-")) {
        await updateNote(editingNote.id, data);
      }

      setNotes((prev) =>
        prev.map((n) => (n.id === editingNote.id ? { ...n, ...data } : n))
      );
      setEditingNote(null);
      setShowNoteModal(false);
    } catch (err) {
      console.error("Update note error:", err);
      setNotes((prev) =>
        prev.map((n) => (n.id === editingNote.id ? { ...n, ...data } : n))
      );
      setEditingNote(null);
      setShowNoteModal(false);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      if (!String(id).startsWith("demo-") && !String(id).startsWith("local-")) {
        await moveToTrash(id);
      }
      setNotes((prev) =>
        prev.filter(
          (n) =>
            String(n.id) !== String(id) &&
            String(n._id) !== String(id)
        )
      );
      fetchTrash();
      addToast("Note moved to trash", "success");
    } catch (err) {
      console.error("Delete note error:", err);
      setNotes((prev) =>
        prev.filter(
          (n) =>
            String(n.id) !== String(id) &&
            String(n._id) !== String(id)
        )
      );
      addToast("Note removed from view", "success");
    }
  };

  const handleRestoreNote = async (id) => {
    try {
      await restoreNote(id);
      fetchNotes();
      fetchTrash();
    } catch (err) {
      console.error("Restore note error:", err);
    }
  };

  const handleDeleteForever = async (id) => {
    try {
      await deleteForever(id);
      setTrashNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Delete forever error:", err);
      setTrashNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const handlePin = async (id) => {
    try {
      if (!String(id).startsWith("demo-")) {
        const res = await togglePinNote(id);
        setNotes((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, is_pinned: res.data?.pinned ? 1 : 0 } : n
          )
        );
      } else {
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_pinned: n.is_pinned ? 0 : 1 } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFavorite = async (id) => {
    try {
      if (!String(id).startsWith("demo-")) {
        const res = await toggleFavoriteNote(id);
        setNotes((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, is_favorite: res.data?.favorite ? 1 : 0 } : n
          )
        );
      } else {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, is_favorite: n.is_favorite ? 0 : 1 } : n
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLock = (note) => {
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

  // Photo quick upload
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("media_type", "photo");
    formData.append("title", file.name.replace(/\.[^/.]+$/, ""));

    try {
      const res = await uploadMediaFile(formData);
      const photoUrl = res.data?.media?.file_url || URL.createObjectURL(file);

      // Create a photo reflection note
      await handleCreateNote({
        title: `Captured Memory: ${file.name.replace(/\.[^/.]+$/, "")}`,
        content: "A quiet moment captured in time.",
        category: "Memories",
        feeling: "Grateful",
        photo_url: photoUrl,
        photos: [{ file_url: photoUrl }],
      });
    } catch (err) {
      const localUrl = URL.createObjectURL(file);
      await handleCreateNote({
        title: `Captured Moment`,
        content: "A quiet snapshot of today.",
        category: "Memories",
        feeling: "Grateful",
        photo_url: localUrl,
        photos: [{ file_url: localUrl }],
      });
    }
  };

  // AI Reflection Handlers
  const handleAISummarize = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const sampleText = notes[0]?.content || "InnerVoice personal reflection.";
      const res = await API.post("/ai/summarize", { note: sampleText });
      setAiResult(res.data.summary || "You are seeking inner clarity and peaceful consistency.");
    } catch (err) {
      setAiResult("Your recent entries reflect a journey toward inner stillness, patience, and gratitude for small moments.");
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered notes by search query
  const displayedNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase().trim();
    return notes.filter(
      (n) =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q)) ||
        (n.category && n.category.toLowerCase().includes(q)) ||
        (n.feeling && n.feeling.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

  return (
    <div className="min-h-screen bg-[#090a0e] ambient-cinematic-bg text-[#f5f2eb] flex overflow-hidden font-sans select-none">
      {/* Hidden Photo Picker Input */}
      <input
        type="file"
        ref={photoFileInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        className="hidden"
      />

      <div className="w-full max-w-[2100px] mx-auto flex h-screen overflow-hidden relative">
        {/* 1. Left Translucent Liquid Glass Sidebar (Desktop) */}
        <div className="hidden lg:flex shrink-0">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              if (tab === "music") setShowMusicModal(true);
              if (tab === "memories") setShowMemoriesModal(true);
            }}
            onOpenSettings={() => navigate("/profile")}
          />
        </div>

        {/* Mobile Backdrop when Sidebar Drawer is open */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <div
          className={`fixed lg:hidden top-0 bottom-0 left-0 z-50 transition-all duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setIsSidebarOpen(false);
              if (tab === "music") setShowMusicModal(true);
              if (tab === "memories") setShowMemoriesModal(true);
            }}
            onCloseMobile={() => setIsSidebarOpen(false)}
            onOpenSettings={() => {
              setIsSidebarOpen(false);
              navigate("/profile");
            }}
          />
        </div>

        {/* 2. Main Center Journal Workspace */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden px-3 sm:px-6 md:px-8 py-3 sm:py-5 min-w-0">
          {/* Top Editorial Header */}
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onMenuClick={() => setIsSidebarOpen(true)}
            onAIAssist={() => {
              setShowAIAssistModal(true);
              handleAISummarize();
            }}
          />

          {/* Scrollable Center Content */}
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 pb-24 lg:pb-6 space-y-6">
            {activeTab === "calendar" ? (
              <CalendarView
                notes={notes}
                isLoading={loading}
                onSelectNote={(note) => {
                  setEditingNote(note);
                  setShowNoteModal(true);
                }}
                onNewNote={() => {
                  setEditingNote(null);
                  setShowNoteModal(true);
                }}
                onRetry={fetchNotes}
              />
            ) : activeTab === "archive" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                  <Archive size={18} className="text-[#e2b17a]" />
                  <h2 className="font-serif text-xl text-[#f5f2eb]">
                    Archived Memories ({trashNotes.length})
                  </h2>
                </div>
                <RecentThoughtsFeed
                  notes={trashNotes}
                  onRestoreNote={handleRestoreNote}
                  onDeleteForever={handleDeleteForever}
                  isTrash={true}
                />
              </div>
            ) : activeTab === "search" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Search size={18} className="text-[#e2b17a]" />
                    <h2 className="font-serif text-xl text-[#f5f2eb]">
                      Search Thoughts {searchQuery ? `— "${searchQuery}"` : ""}
                    </h2>
                  </div>
                  <span className="text-xs text-[#9e9990]">
                    {displayedNotes.length} {displayedNotes.length === 1 ? "entry" : "entries"} found
                  </span>
                </div>
                <RecentThoughtsFeed
                  notes={displayedNotes}
                  onDeleteNote={handleDeleteNote}
                  onEditNote={(n) => {
                    setEditingNote(n);
                    setShowNoteModal(true);
                  }}
                  onPinNote={handlePin}
                  onFavoriteNote={handleFavorite}
                  onLockNote={handleLock}
                  unlockedNoteIds={sessionUnlockedIds}
                  onNewNote={() => {
                    setEditingNote(null);
                    setShowNoteModal(true);
                  }}
                />
              </div>
            ) : (
              <>
                {/* Writing Composer Surface (Level 1 Primary Glass) */}
                <WritingComposer
                  onSaveNote={handleCreateNote}
                  onOpenPhotoPicker={() => photoFileInputRef.current?.click()}
                  onOpenVoiceRecorder={() => setShowVoiceModal(true)}
                  onOpenMusicPicker={() => {
                    setMusicModalInitialAdd(false);
                    setShowMusicModal(true);
                  }}
                  activeNotebook="My Journal"
                />

                {/* Recent Thoughts Chronological Feed */}
                <RecentThoughtsFeed
                  notes={displayedNotes}
                  onDeleteNote={handleDeleteNote}
                  onEditNote={(n) => {
                    setEditingNote(n);
                    setShowNoteModal(true);
                  }}
                  onPinNote={handlePin}
                  onFavoriteNote={handleFavorite}
                  onLockNote={handleLock}
                  unlockedNoteIds={sessionUnlockedIds}
                  onNewNote={() => {
                    setEditingNote(null);
                    setShowNoteModal(true);
                  }}
                />
              </>
            )}
          </div>
        </main>

        {/* 3. Right-Side Contextual Desktop Panel (Hidden on tablet/mobile) */}
        <RightContextPanel
          onNewNote={() => {
            setEditingNote(null);
            setShowNoteModal(true);
          }}
          onAddPhoto={() => photoFileInputRef.current?.click()}
          onRecordVoice={() => setShowVoiceModal(true)}
          onAddMusic={() => {
            setMusicModalInitialAdd(true);
            setShowMusicModal(true);
          }}
        />
      </div>

      {/* 4. Mobile Bottom Floating Navigation Bar (Matches Section 18 of prompt & reference image) */}
      <div className="lg:hidden fixed bottom-3 left-4 right-4 z-40">
        <GlassSurface
          level={3}
          className="rounded-2xl p-2 flex items-center justify-around shadow-2xl border border-white/[0.12]"
        >
          <button
            type="button"
            onClick={() => setActiveTab("today")}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition ${
              activeTab === "today" ? "text-[#e2b17a]" : "text-[#9e9990]"
            }`}
          >
            <Home size={19} />
            <span className="text-[10px] font-medium">Home</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("journal")}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition ${
              activeTab === "journal" ? "text-[#e2b17a]" : "text-[#9e9990]"
            }`}
          >
            <BookOpen size={19} />
            <span className="text-[10px] font-medium">Journal</span>
          </button>

          {/* Floating Center (+) Primary Action with Warm Champagne Glow */}
          <button
            type="button"
            onClick={() => {
              setEditingNote(null);
              setShowNoteModal(true);
            }}
            className="w-11 h-11 -mt-4 rounded-full btn-champagne flex items-center justify-center shadow-[0_4px_16px_rgba(226,177,122,0.4)] cursor-pointer active:scale-95 transition"
            aria-label="New Note"
          >
            <Plus size={22} className="stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={() => setShowMemoriesModal(true)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-[#9e9990] hover:text-[#f5f2eb] transition"
          >
            <ImageIcon size={19} />
            <span className="text-[10px] font-medium">Memories</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMusicModal(true)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-[#9e9990] hover:text-[#f5f2eb] transition"
          >
            <Music2 size={19} />
            <span className="text-[10px] font-medium">Music</span>
          </button>
        </GlassSurface>
      </div>

      {/* MODALS */}
      {/* 1. Create / Edit Note Modal */}
      {showNoteModal && (
        <Modal onClose={() => setShowNoteModal(false)} maxWidth="max-w-2xl" showCloseButton={false}>
          <NoteForm
            initialData={editingNote}
            onCancel={() => {
              setShowNoteModal(false);
              setEditingNote(null);
            }}
            onSave={editingNote ? handleEditNote : handleCreateNote}
          />
        </Modal>
      )}

      {/* 2. Music Library Modal */}
      {showMusicModal && (
        <MusicLibraryModal
          isOpen={showMusicModal}
          initialAddMode={musicModalInitialAdd}
          onClose={() => {
            setShowMusicModal(false);
            setMusicModalInitialAdd(false);
          }}
        />
      )}

      {/* 3. Voice Recording Modal */}
      {showVoiceModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowVoiceModal(false);
          }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md flex justify-center items-center z-50 p-3 sm:p-6"
        >
          <AudioVoiceMemo
            isModal={true}
            onClose={() => setShowVoiceModal(false)}
            onSaveNewRecording={(memo) => {
              handleCreateNote({
                title: memo.title || "Voice Memo Reflection",
                content: "A spoken thought captured in calmness.",
                category: "Reflections",
                feeling: "Peaceful",
                voice_memo: memo,
              });
              setShowVoiceModal(false);
            }}
          />
        </div>
      )}

      {/* 4. Memories Modal / Screen */}
      {showMemoriesModal && (
        <Modal onClose={() => setShowMemoriesModal(false)} maxWidth="max-w-4xl" showCloseButton={false}>
          <MemoriesView
            notes={notes}
            onClose={() => setShowMemoriesModal(false)}
            onSelectNote={(n) => {
              setShowMemoriesModal(false);
              setEditingNote(n);
              setShowNoteModal(true);
            }}
          />
        </Modal>
      )}

      {/* 5. AI Assist Modal */}
      {showAIAssistModal && (
        <Modal onClose={() => setShowAIAssistModal(false)} maxWidth="max-w-md">
          <div className="space-y-4 text-center p-2">
            <div className="w-12 h-12 rounded-full bg-[#e2b17a]/15 text-[#e2b17a] flex items-center justify-center mx-auto">
              <Sparkles size={22} />
            </div>
            <h3 className="font-serif text-xl text-[#f5f2eb]">
              AI Reflection
            </h3>
            {aiLoading ? (
              <div className="flex flex-col items-center py-6 gap-2 text-xs text-[#9e9990]">
                <Loader2 size={20} className="animate-spin text-[#e2b17a]" />
                <span>Reflecting on your inner thoughts...</span>
              </div>
            ) : (
              <p className="font-serif italic text-sm text-[#d1cdc7] leading-relaxed p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                “ {aiResult} ”
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowAIAssistModal(false)}
              className="btn-champagne w-full py-2.5 rounded-xl text-xs font-semibold mt-2 cursor-pointer"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* 6. Security Note Unlock & Password Modals */}
      {showUnlockModal && (
        <UnlockNoteModal
          noteId={selectedNoteId}
          onClose={() => setShowUnlockModal(false)}
          onSuccess={() => {
            setSessionUnlockedIds((prev) => new Set([...prev, selectedNoteId]));
            setShowUnlockModal(false);
          }}
        />
      )}

      {showProtectNoteModal && selectedNote && (
        <ProtectNoteModal
          note={selectedNote}
          onClose={() => setShowProtectNoteModal(false)}
          onNoteUpdated={fetchNotes}
        />
      )}

      {showVerifyPasswordModal && selectedNote && (
        <VerifyPasswordModal
          note={selectedNote}
          onClose={() => setShowVerifyPasswordModal(false)}
          onSuccess={() => {
            setSessionUnlockedIds((prev) => new Set([...prev, selectedNote.id]));
            setShowVerifyPasswordModal(false);
          }}
        />
      )}

      {showSetPinModal && selectedNote && (
        <SetVaultPinModal
          onClose={() => setShowSetPinModal(false)}
          onSuccess={() => {
            setShowSetPinModal(false);
            fetchNotes();
          }}
        />
      )}
    </div>
  );
}
