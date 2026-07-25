import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
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
  searchNotes,
  togglePinNote,
  toggleFavoriteNote,
  toggleLockNote,
  getDashboardStats,
} from "../api/note";
import StatsGrid from "../components/dashboard/StatsGrid";

function Dashboard() {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const [selectedNote, setSelectedNote] = useState(null);
  const [showProtectNoteModal, setShowProtectNoteModal] = useState(false);
  const [showVerifyPasswordModal, setShowVerifyPasswordModal] = useState(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [showRemovePasswordModal, setShowRemovePasswordModal] = useState(false);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  // Track notes unlocked this session via custom password (resets on refresh)
  const [sessionUnlockedIds, setSessionUnlockedIds] = useState(new Set());

  // Advanced search & filtering state
  const [selectedFeeling, setSelectedFeeling] = useState("All");
  const [selectedTag, setSelectedTag] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data.stats);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = filter === "trash" ? await getTrashNotes() : await getNotes();

      const sortedNotes = [...res.data.notes].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) {
          return Number(b.is_pinned) - Number(a.is_pinned);
        }
        return new Date(b.updated_at) - new Date(a.updated_at);
      });

      setNotes(sortedNotes);
      await fetchStats();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [filter]);
  // Create Note
  const handleCreateNote = async (data) => {
    try {
      await createNote(data);

      setShowModal(false);
      fetchNotes();
    } catch (error) {
      console.error(error);
      alert("Unable to create note");
    }
  };

  // Edit Note
  const handleEditNote = async (data) => {
    try {
      await updateNote(editingNote.id, data);

      setEditingNote(null);
      setShowModal(false);

      fetchNotes();
    } catch (error) {
      console.error(error);
      alert("Unable to update note");
    }
  };
  // Delete Note
  const handleDeleteNote = async (id) => {
    const isTrash = filter === "trash";
    const confirmMessage = isTrash
      ? "Are you sure you want to permanently delete this note? This action cannot be undone."
      : "Are you sure you want to delete this note?";

    const confirmDelete = window.confirm(confirmMessage);
    if (!confirmDelete) return;

    try {
      if (isTrash) {
        await deleteForever(id);
      } else {
        await moveToTrash(id);
      }
      fetchNotes();
    } catch (error) {
      console.error(error);
      alert(isTrash ? "Unable to permanently delete note." : "Unable to delete note.");
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
  // Toggle Pin Note

  const handlePin = async (id) => {
    try {
      const res = await togglePinNote(id);
      setNotes((prevNotes) =>
        prevNotes
          .map((note) =>
            note.id === id
              ? {
                  ...note,
                  is_pinned: res.data.pinned ? 1 : 0,
                  updated_at: new Date().toISOString(),
                }
              : note
          )
          .sort((a, b) => {
            if (a.is_pinned !== b.is_pinned) {
              return Number(b.is_pinned) - Number(a.is_pinned);
            }
            return new Date(b.updated_at) - new Date(a.updated_at);
          })
      );
    } catch (error) {
      console.error(error);
      alert("Unable to pin note.");
    }
  };
  // Toggle Favorite Note

  const handleFavorite = async (id) => {
    try {
      const res = await toggleFavoriteNote(id);
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? { ...note, is_favorite: res.data.favorite ? 1 : 0 }
            : note
        )
      );
    } catch (error) {
      console.error(error);
      alert("Unable to favorite note.");
    }
  };
  const handleLockWithPIN = async (noteId) => {
    try {
      await toggleLockNote(noteId);
      fetchNotes();
    } catch (error) {
      console.error(error);
      if (error.response?.data?.pinNotSet) {
        const noteToLock = notes.find((n) => n.id === noteId);
        setSelectedNote(noteToLock);
        setShowSetPinModal(true);
      } else {
        alert(error.response?.data?.message || "Unable to lock note.");
      }
    }
  };

  // Toggle Lock Note
  const handleLock = async (note) => {
    if (note.is_locked) {
      // If already session-unlocked, just re-lock it (remove from session)
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

    // If note is unlocked, open ProtectNoteModal to select security type
    setSelectedNote(note);
    setShowProtectNoteModal(true);
  };

  // Search Notes
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const categories = [
    "All",
    "General",
    "Work",
    "Study",
    "Personal",
    "Ideas",
    "Journal",
  ];

  // List of all unique feelings available to select
  const feelingsList = [
    "All",
    "Neutral",
    "Happy",
    "Excited",
    "Grateful",
    "Motivated",
    "Proud",
    "Hopeful",
    "Peaceful",
    "Inspired",
    "Lonely",
    "Sad",
    "Heartbroken",
    "Disappointed",
    "Anxious",
    "Worried",
    "Overwhelmed",
    "Exhausted",
    "Angry",
    "Frustrated",
    "Confused",
    "Overthinking",
    "Stressed",
    "Love",
    "Crush",
    "Friendship",
    "Family",
    "Breakup",
    "Healing",
    "Learning",
    "Focused",
    "Self Growth",
    "Dream",
    "Goal",
    "Career",
    "Finance",
    "Fitness",
    "Secret",
    "Confession",
    "Fantasy",
    "Memory",
    "Random Thoughts",
    "Private",
    "Travel",
    "Food",
    "Gaming",
    "Music",
    "Movies",
    "Photography",
    "Pets",
  ];

  // Extract unique hashtags dynamically from all notes
  const allHashtags = Array.from(
    new Set(
      notes.flatMap((note) => {
        if (!note.content) return [];
        const matches = note.content.match(/#\w+/g);
        return matches ? matches.map((tag) => tag.toLowerCase()) : [];
      })
    )
  );

  let displayNotes = notes;
  if (filter === "favorites") {
    displayNotes = notes.filter((note) => note.is_favorite);
  } else if (filter === "archive") {
    // If you support archiving in future, you can filter by note.is_archived. For now, empty placeholder.
    displayNotes = [];
  } else if (filter === "trash") {
    // Show all trash notes
    displayNotes = notes;
  }

  // 1. Text Search Filter (Fuzzy Search in title & content)
  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase().trim();
    displayNotes = displayNotes.filter(
      (note) =>
        (note.title && note.title.toLowerCase().includes(q)) ||
        (note.content && note.content.toLowerCase().includes(q))
    );
  }

  // 2. Feeling / Emotion Filter
  if (selectedFeeling !== "All") {
    displayNotes = displayNotes.filter((note) => note.feeling === selectedFeeling);
  }

  // 3. Dynamic Hashtag Filter
  if (selectedTag) {
    displayNotes = displayNotes.filter(
      (note) =>
        note.content &&
        note.content.toLowerCase().includes(selectedTag.toLowerCase())
    );
  }

  // 4. Date Range Filter
  if (startDate) {
    displayNotes = displayNotes.filter((note) => {
      if (!note.created_at) return false;
      const noteDate = new Date(note.created_at).toISOString().split("T")[0];
      return noteDate >= startDate;
    });
  }
  if (endDate) {
    displayNotes = displayNotes.filter((note) => {
      if (!note.created_at) return false;
      const noteDate = new Date(note.created_at).toISOString().split("T")[0];
      return noteDate <= endDate;
    });
  }

  const filteredNotes =
    selectedCategory === "All"
      ? displayNotes
      : displayNotes.filter((note) => note.category === selectedCategory);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {filter === "favorites"
              ? "Favorite Notes"
              : filter === "archive"
              ? "Archived Notes"
              : filter === "trash"
              ? "Trash Notes"
              : "My Notes"}
          </h1>

          <button
            onClick={() => {
              setEditingNote(null);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-lg shadow-md transition"
          >
            + New Note
          </button>
        </div>

        {stats && (
          <div className="mb-8">
            <StatsGrid stats={stats} />
          </div>
        )}

        {/* Search & Filtering */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="🔍 Search notes by title or content..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-5 py-3 rounded-xl font-medium border transition-all duration-200 flex items-center gap-2 select-none ${
                showAdvanced || selectedFeeling !== "All" || selectedTag || startDate || endDate
                  ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-400"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <span>⚙️</span>
              <span>Filters</span>
              {(selectedFeeling !== "All" || selectedTag || startDate || endDate) && (
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>

          {/* Advanced Filtering Panel */}
          {showAdvanced && (
            <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-5 animate-fade-scale">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Feeling selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Emotion / Feeling
                  </label>
                  <select
                    value={selectedFeeling}
                    onChange={(e) => setSelectedFeeling(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    {feelingsList.map((f) => (
                      <option key={f} value={f}>
                        {f === "All" ? "Any Emotion" : f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Dynamic Hashtag Pills */}
              {allHashtags.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Hashtags in your notes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allHashtags.map((tag) => {
                      const isSelected = selectedTag === tag;
                      return (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(isSelected ? "" : tag)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reset controls */}
              {(selectedFeeling !== "All" || selectedTag || startDate || endDate || searchQuery) && (
                <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedFeeling("All");
                      setSelectedTag("");
                      setStartDate("");
                      setEndDate("");
                      setSearchQuery("");
                    }}
                    className="text-xs text-red-500 hover:text-red-700 font-bold transition flex items-center gap-1.5"
                  >
                    <span>🗑️</span>
                    <span>Clear All Filters</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-slate-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Notes */}
        {loading ? (
          <p className="text-gray-500 dark:text-slate-400">Loading...</p>
        ) : filteredNotes.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400">No notes found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={handleDeleteNote}
                onPin={handlePin}
                onFavorite={handleFavorite}
                onLock={handleLock}
                onRestore={handleRestore}
                isSessionUnlocked={sessionUnlockedIds.has(note.id)}
                onEdit={(noteToEdit) => {
                  setEditingNote(noteToEdit);
                  setShowModal(true);
                }}
                mode="dashboard"
              />
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <Modal
            onClose={() => {
              setShowModal(false);
              setEditingNote(null);
            }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingNote ? "Edit Note" : "Create Note"}
            </h2>

            <NoteForm
              initialData={editingNote}
              onCancel={() => {
                setShowModal(false);
                setEditingNote(null);
              }}
              onSave={editingNote ? handleEditNote : handleCreateNote}
            />
          </Modal>
        )}
      </div>

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
            // Add to session-unlocked set without touching DB or re-fetching
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
    </Layout>
  );
}

export default Dashboard;
