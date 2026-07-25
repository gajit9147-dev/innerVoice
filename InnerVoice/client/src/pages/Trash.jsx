import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import NoteCard from "../components/notes/NoteCard";
import { getTrashNotes, restoreNote, deleteForever } from "../api/note";
import { Trash2 } from "lucide-react";

function Trash() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrashNotes = async () => {
    try {
      setLoading(true);
      const res = await getTrashNotes();
      setNotes(res.data.notes || []);
    } catch (error) {
      console.error("Error fetching trash notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashNotes();
  }, []);

  const handleRestore = async (id) => {
    try {
      await restoreNote(id);
      fetchTrashNotes();
    } catch (error) {
      console.error(error);
      alert("Unable to restore note.");
    }
  };

  const handleDeleteForever = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this note? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await deleteForever(id);
      fetchTrashNotes();
    } catch (error) {
      console.error(error);
      alert("Unable to delete note permanently.");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Trash2 className="text-red-500" size={30} />
              Trash Folder
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Trashed notes will show up here. You can restore them or delete them permanently.
            </p>
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <p className="text-gray-500 dark:text-slate-400">Loading...</p>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-800">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Trash is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Deleted notes will remain in the database until they are permanently removed.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={handleDeleteForever}
                onRestore={handleRestore}
                isSessionUnlocked={false}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Trash;
