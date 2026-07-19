function NoteCard({ note, onEdit, onDelete }) {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2>{note.title}</h2>
      <p>{note.content}</p>
      <span>{note.category}</span>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onEdit(note)}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(note.id)}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default NoteCard;
