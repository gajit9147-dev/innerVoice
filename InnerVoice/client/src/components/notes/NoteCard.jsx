import {
  Pencil,
  Trash2,
  Calendar,
  Tag,
  Pin
} from "lucide-react";

function NoteCard({ note, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group">
      
      {/* Optional Pin Icon (shows on hover) */}
      <button className="absolute top-5 right-5 text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 transition opacity-0 group-hover:opacity-100" title="Pin Note">
        <Pin size={18} />
      </button>

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-800 dark:text-white pr-8 truncate">
        {note.title}
      </h2>

      {/* Content (Truncated) */}
      <p className="text-gray-600 dark:text-gray-400 mt-3 line-clamp-4 leading-relaxed">
        {note.content}
      </p>

      {/* Category + Date */}
      <div className="flex items-center justify-between mt-5">
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-semibold bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full transition-colors">
          <Tag size={14} />
          <span>{note.category}</span>
        </div>

        <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-xs font-medium">
          <Calendar size={14} />
          <span>
            {(() => {
              if (!note.created_at) return "Today";
              const d = new Date(note.created_at);
              return isNaN(d.getTime())
                ? "Today"
                : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            })()}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 border-t border-gray-50 dark:border-slate-700 pt-4 transition-colors">
        <button
          onClick={() => onEdit(note)}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2.5 rounded-xl transition font-medium text-sm"
        >
          <Pencil size={16} />
          Edit
        </button>

        <button
          onClick={() => onDelete(note.id)}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-slate-700/50 hover:bg-red-50 dark:hover:bg-red-900/40 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 py-2.5 rounded-xl transition font-medium text-sm"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

    </div>
  );
}

export default NoteCard;