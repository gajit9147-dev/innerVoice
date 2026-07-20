import { Pencil, Trash2 } from "lucide-react";

function NoteCard({ note, onDelete, onEdit }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-5 hover:shadow-xl transition">

      <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white truncate">
        {note.title}
      </h2>

      <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-4 leading-relaxed">
        {note.content}
      </p>

      <div className="flex justify-end gap-3">

        {onEdit && (
          <button
            onClick={() => onEdit(note)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
          >
            <Pencil size={18} />
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(note.id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
          >
            <Trash2 size={18} />
          </button>
        )}

      </div>
    </div>
  );
}

export default NoteCard;