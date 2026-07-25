import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import NoteCard from "../components/notes/NoteCard";
import {
  getTrashNotes,
  restoreNote,
  deleteForever,
} from "../api/note";

function Trash() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrash = async () => {
    try {
      const res = await getTrashNotes();
      setNotes(res.data.notes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id) => {
    try {
      await restoreNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (error) {
      console.error(error);
      alert("Unable to restore note.");
    }
  };

  const handleDeleteForever = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this note permanently?"
    );

    if (!confirmDelete) return;

    try {
      await deleteForever(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (error) {
      console.error(error);
      alert("Unable to delete note.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">

        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              🗑 Trash
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Restore deleted notes or remove them permanently.
            </p>
          </div>
        </div>

        {notes.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">🗑️</div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">
              Trash is Empty
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Deleted notes will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Deleted Counter */}
            <div className="mb-6">
              <span className="px-4 py-2 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 font-semibold text-sm">
                {notes.length} Deleted Notes
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  mode="trash"
                  onRestore={handleRestore}
                  onDeleteForever={handleDeleteForever}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </Layout>
  );
}

export default Trash;
