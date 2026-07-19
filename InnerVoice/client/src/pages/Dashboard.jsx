import { useEffect, useState } from "react";
import AddNote from "../components/AddNote";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../api/note";

function Dashboard() {
  const [notes, setNotes] = useState([]);

  // Fetch Notes
  const fetchNotes = async () => {
    try {
      const res = await getNotes();
      setNotes(res.data.notes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Add Note
  const handleAddNote = async (note) => {
    try {
      await createNote(note);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Note
  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Note
  const handleEdit = async (note) => {
    const title = prompt("Edit title", note.title);
    const content = prompt("Edit content", note.content);

    if (title === null || content === null) return;

    try {
      await updateNote(note.id, {
        title,
        content,
      });

      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8">
        📝 InnerVoice Dashboard
      </h1>

      <AddNote onAdd={handleAddNote} />

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">
          Your Notes
        </h2>

        {notes.length === 0 ? (
          <p>No notes yet.</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-lg shadow p-4 mb-4"
            >
              <h3 className="font-bold text-xl">
                {note.title}
              </h3>

              <p className="text-gray-600 mt-2">
                {note.content}
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleEdit(note)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(note.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;