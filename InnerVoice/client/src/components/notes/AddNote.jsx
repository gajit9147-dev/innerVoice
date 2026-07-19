import { useState } from "react";
import { Save, Loader2, StickyNote } from "lucide-react";

function AddNote({ onAdd }) {
  const [note, setNote] = useState({
    title: "",
    content: "",
    category: "General",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setNote({
      ...note,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.title.trim() || !note.content.trim()) return;

    setIsSaving(true);
    
    await onAdd(note);

    setNote({
      title: "",
      content: "",
      category: "General",
    });
    setIsSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 space-y-5 border border-transparent dark:border-slate-700 transition-colors"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <StickyNote className="text-blue-500" size={24} />
          Create New Note
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Capture your ideas before they disappear.
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title
        </label>
        <input
          type="text"
          name="title"
          value={note.title}
          onChange={handleChange}
          placeholder="Enter a catchy title..."
          className="w-full bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-600 px-4 py-3 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition placeholder-gray-400 dark:placeholder-gray-500"
          required
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex justify-between items-center">
          <span>Content</span>
          <span className="text-gray-500 dark:text-gray-400 text-xs font-normal bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-md transition-colors">{note.content.length} chars</span>
        </label>
        <textarea
          name="content"
          value={note.content}
          onChange={handleChange}
          placeholder="Write your thoughts here..."
          rows={8}
          className="w-full bg-white dark:bg-slate-900 resize-none rounded-xl border border-gray-300 dark:border-slate-600 px-4 py-3 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition placeholder-gray-400 dark:placeholder-gray-500"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <select
          name="category"
          value={note.category}
          onChange={handleChange}
          className="w-full bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-600 px-4 py-3 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition appearance-none"
        >
          <option>General</option>
          <option>Personal</option>
          <option>Study</option>
          <option>Work</option>
          <option>Ideas</option>
        </select>
      </div>

      {/* Button */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save size={18} />
            Save Note
          </>
        )}
      </button>
    </form>
  );
}

export default AddNote;
