import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
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
      fetchTrash();
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
      fetchTrash();
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

        <h1 className="text-3xl font-bold mb-6">
          🗑 Trash
        </h1>

        {notes.length === 0 ? (
          <p>No deleted notes.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-xl border p-5 bg-white dark:bg-slate-900"
              >
                <h2 className="font-bold text-lg">
                  {note.title}
                </h2>

                <p className="mt-3 text-gray-500">
                  {note.content}
                </p>

                <div className="flex gap-3 mt-5">

                  <button
                    onClick={() => handleRestore(note.id)}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white"
                  >
                    Restore
                  </button>

                  <button
                    onClick={() => handleDeleteForever(note.id)}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white"
                  >
                    Delete Forever
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </Layout>
  );
}

export default Trash;
