import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import NoteCard from "../components/notes/NoteCard";
import { getNotes } from "../api/note";

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const res = await getNotes();
      setNotes(res.data.notes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">

        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          My Notes
        </h1>

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
              />
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
}

export default Dashboard;