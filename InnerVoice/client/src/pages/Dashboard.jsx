import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import NoteCard from "../components/notes/NoteCard";
import NoteForm from "../components/notes/NoteForm";
import Modal from "../components/common/Modal";
import UnlockNoteModal from "../components/notes/UnlockNoteModal";
import VerifyPasswordModal from "../components/notes/VerifyPasswordModal";
import SetNotePasswordModal from "../components/notes/SetNotePasswordModal";
import SetVaultPinModal from "../components/notes/SetVaultPinModal";
import ProtectNoteModal from "../components/notes/ProtectNoteModal";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  togglePinNote,
  toggleFavoriteNote,
  toggleLockNote,
} from "../api/note";

function Dashboard() {
  const [notes, setNotes] = useState([]);
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

  const fetchNotes = async () => {
    try {
      const res = await getNotes();

      const sortedNotes = [...res.data.notes].sort(
        (a, b) => b.is_pinned - a.is_pinned,
      );

      setNotes(sortedNotes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);
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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?",
    );

    if (!confirmDelete) return;

    try {
      await deleteNote(id);

      fetchNotes();
    } catch (error) {
      console.error(error);
      alert("Unable to delete note.");
    }
  };
  // Toggle Pin Note

  const handlePin = async (id) => {
    try {
      await togglePinNote(id);
      fetchNotes();
    } catch (error) {
      console.error(error);
      alert("Unable to pin note.");
    }
  };
  // Toggle Favorite Note

  const handleFavorite = async (id) => {
    try {
      await toggleFavoriteNote(id);
      fetchNotes();
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
      setSelectedNote(note);
      if (note.security_type === "password") {
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
  const handleSearch = async (query) => {
    setSearchQuery(query);

    try {
      if (query.trim() === "") {
        fetchNotes();
        return;
      }

      const res = await searchNotes(query);

      const sortedNotes = [...res.data.notes].sort(
        (a, b) => b.is_pinned - a.is_pinned,
      );

      setNotes(sortedNotes);
    } catch (error) {
      console.error(error);
    }
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

  const filteredNotes =
    selectedCategory === "All"
      ? notes
      : notes.filter((note) => note.category === selectedCategory);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Notes
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

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search notes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
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
                onEdit={(noteToEdit) => {
                  setEditingNote(noteToEdit);
                  setShowModal(true);
                }}
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
            fetchNotes();
            setShowVerifyPasswordModal(false);
            setSelectedNote(null);
          }}
        />
      )}

      {showSetPasswordModal && (
        <SetNotePasswordModal
          noteId={selectedNoteId}
          onClose={() => {
            setShowSetPasswordModal(false);
            setSelectedNoteId(null);
          }}
          onSuccess={() => {
            fetchNotes();
            setShowSetPasswordModal(false);
            setSelectedNoteId(null);
          }}
        />
      )}

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
          onSelectCustom={() => {
            setSelectedNoteId(selectedNote.id);
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
