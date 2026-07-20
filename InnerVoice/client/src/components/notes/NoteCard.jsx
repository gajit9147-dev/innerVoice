import { Pencil, Trash2, Calendar } from "lucide-react";

function NoteCard({ note, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 hover:shadow-xl transition border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white truncate">
          {note.title}
        </h2>

        <p className="text-gray-600 dark:text-gray-300 line-clamp-4 leading-relaxed">
          {note.content}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <Calendar size={13} />
          <span>
            {(() => {
              if (!note.created_at) return "Today";
              const d = new Date(note.created_at);
              return isNaN(d.getTime())
                ? "Today"
                : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
            })()}
          </span>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(note)}
                className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition"
                title="Edit Note"
              >
                <Pencil size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(note.id)}
                className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition"
                title="Delete Note"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteCard;