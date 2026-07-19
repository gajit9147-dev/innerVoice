import { useState } from "react";

function AddNote({ onAdd }) {
  const [note, setNote] = useState({
    title: "",
    content: "",
    category: "General",
  });

  const handleChange = (e) => {
    setNote({
      ...note,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(note);

    setNote({
      title: "",
      content: "",
      category: "General",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={note.title}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />

      <textarea
        name="content"
        placeholder="Write your thoughts..."
        value={note.content}
        onChange={handleChange}
        className="w-full border p-2 rounded h-40"
        required
      />

      <select
        name="category"
        value={note.category}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      >
        <option>General</option>
        <option>Personal</option>
        <option>Study</option>
        <option>Work</option>
        <option>Ideas</option>
      </select>

      <button
        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
      >
        Save Note
      </button>
    </form>
  );
}

export default AddNote;