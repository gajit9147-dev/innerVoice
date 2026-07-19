import { useEffect, useState } from "react";
import { Save } from "lucide-react";

function EditNote({ note, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  if (!note) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...note,
      title,
      content,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-8 border border-transparent dark:border-slate-700 transition-colors">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          ✏️ Edit Note
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
             <input
               type="text"
               placeholder="Title"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white transition placeholder-gray-400 dark:placeholder-gray-500"
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
             <textarea
               rows="6"
               placeholder="Write your thoughts..."
               value={content}
               onChange={(e) => setContent(e.target.value)}
               className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white transition resize-none placeholder-gray-400 dark:placeholder-gray-500"
             />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 font-medium transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 transition"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditNote;
