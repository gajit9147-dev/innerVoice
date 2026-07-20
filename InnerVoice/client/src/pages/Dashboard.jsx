import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import NoteCard from "../components/notes/NoteCard";
import NoteForm from "../components/notes/NoteForm";
import Modal from "../components/common/Modal";
import { getNotes, createNote, deleteNote } from "../api/note";

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await getNotes();
      setNotes(res.data.notes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

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

  const handleDeleteNote = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this note?");
    if (!confirmDelete) return;

    try {
      await deleteNote(id);
      fetchNotes();
    } catch (error) {
      console.error(error);
      alert("Unable to delete note");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">

        <div className="flex justify-between items-center mb-8">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Notes
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-lg shadow-md transition"
          >
            + New Note
          </button>

        </div>

        {loading ? (
          <p className="text-gray-500 dark:text-slate-400">Loading...</p>
        ) : notes.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400">No notes found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}

        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Create Note
            </h2>

            <NoteForm
              onSave={handleCreateNote}
              onCancel={() => setShowModal(false)}
            />
          </Modal>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;