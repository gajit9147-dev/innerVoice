import {
  Pencil,
  Trash2,
  Calendar,
  Tag,
} from "lucide-react";

function NoteCard({ note, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-800">
        {note.title}
      </h2>

      {/* Content */}
      <p className="text-gray-600 mt-3 line-clamp-4">
        {note.content}
      </p>

      {/* Category + Date */}
      <div className="flex items-center justify-between mt-5">

        <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
          <Tag size={16} />
          <span>{note.category}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Calendar size={16} />
          <span>
            {note.created_at
              ? new Date(note.created_at).toLocaleDateString()
              : "Today"}
          </span>
        </div>

      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6">

        <button
          onClick={() => onEdit(note)}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
        >
          <Pencil size={18} />
          Edit
        </button>

        <button
          onClick={() => onDelete(note.id)}
          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
        >
          <Trash2 size={18} />
          Delete
        </button>

      </div>

    </div>
  );
}

export default NoteCard;