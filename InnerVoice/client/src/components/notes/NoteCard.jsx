import { Pencil, Trash2, Pin, Star } from "lucide-react";

function NoteCard({ note, onDelete, onEdit, onPin, onFavorite }) {
  const categoryColors = {
    General:
      "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
    Work:
      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    Study:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    Personal:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    Ideas:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    Journal:
      "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border border-gray-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {note.title}
          </h2>

          {/* Category Badge */}
          <span
            className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
              categoryColors[note.category] || categoryColors.General
            }`}
          >
            {note.category || "General"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite */}
          {onFavorite && (
            <button
              onClick={() => onFavorite(note.id)}
              className={`transition duration-200 ${
                note.is_favorite
                  ? "text-yellow-400 scale-110"
                  : "text-gray-400 hover:text-yellow-400"
              }`}
              title={
                note.is_favorite
                  ? "Remove Favorite"
                  : "Add Favorite"
              }
            >
              <Star
                size={20}
                fill={note.is_favorite ? "currentColor" : "none"}
              />
            </button>
          )}

          {/* Pin */}
          {onPin && (
            <button
              onClick={() => onPin(note.id)}
              className={`transition duration-200 ${
                note.is_pinned
                  ? "text-blue-500 rotate-45"
                  : "text-gray-400 hover:text-blue-500"
              }`}
              title={note.is_pinned ? "Unpin" : "Pin"}
            >
              <Pin
                size={20}
                fill={note.is_pinned ? "currentColor" : "none"}
              />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-4 leading-relaxed">
        {note.content}
      </p>

      {/* Footer */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => onEdit(note)}
          className="text-blue-500 hover:text-blue-700 transition"
        >
          <Pencil size={18} />
        </button>

        <button
          onClick={() => onDelete(note.id)}
          className="text-red-500 hover:text-red-700 transition"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default NoteCard;