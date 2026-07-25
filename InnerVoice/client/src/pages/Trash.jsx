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
              <NoteCard
                key={note.id}
                note={note}
                mode="trash"
                onRestore={handleRestore}
                onDeleteForever={handleDeleteForever}
              />
            ))}

          </div>
        )}

      </div>
    </Layout>
  );
}

export default Trash;
