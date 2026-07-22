import { useState } from "react";
import { Pencil, Trash2, Pin, Star, Lock } from "lucide-react";
import SecurityMenu from "./SecurityMenu";

function NoteCard({ note, onDelete, onEdit, onPin, onFavorite, onLock, onSetPassword, onRemovePassword }) {
  const [showSecurityMenu, setShowSecurityMenu] = useState(false);
  const categoryColors = {
    General: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
    Work: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    Study: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    Personal:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    Ideas:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    Journal: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  };

  const categoryEmojis = {
    General: "📒",
    Work: "💼",
    Study: "📚",
    Personal: "👤",
    Ideas: "💡",
    Journal: "📝",
  };

  const feelingColors = {
    Neutral: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",

    Happy:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    Excited:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    Grateful:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    Motivated:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    Proud: "bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300",
    Hopeful: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
    Peaceful: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
    Inspired:
      "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",

    Lonely:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    Sad: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    Heartbroken:
      "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
    Disappointed:
      "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    Anxious: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    Worried:
      "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    Overwhelmed:
      "bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    Exhausted:
      "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300",

    Angry: "bg-red-200 text-red-800 dark:bg-red-950 dark:text-red-300",
    Frustrated:
      "bg-orange-200 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    Confused:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    Overthinking:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    Stressed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",

    Love: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    Crush:
      "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900 dark:text-fuchsia-300",
    Friendship: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
    Family: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    Breakup:
      "bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300",

    Healing:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    Learning: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    Focused:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    "Self Growth":
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",

    Dream: "bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    Goal: "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300",
    Career: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
    Finance:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    Fitness:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",

    Secret: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    Confession:
      "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
    Fantasy:
      "bg-purple-200 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    Memory:
      "bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    "Random Thoughts":
      "bg-teal-50 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
    Private: "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300",

    Travel: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
    Food: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    Gaming:
      "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
    Music:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    Movies:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    Photography:
      "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    Pets: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  };

  const feelingEmojis = {
    Neutral: "😐",
    Happy: "😊",
    Excited: "🤩",
    Grateful: "🙏",
    Motivated: "🔥",
    Proud: "🏆",
    Hopeful: "✨",
    Peaceful: "🕊️",
    Inspired: "💡",

    Lonely: "🥺",
    Sad: "😔",
    Heartbroken: "💔",
    Disappointed: "😞",
    Anxious: "😰",
    Worried: "😟",
    Overwhelmed: "🤯",
    Exhausted: "😫",

    Angry: "😡",
    Frustrated: "😤",
    Confused: "😕",
    Overthinking: "🌀",
    Stressed: "⚡",

    Love: "❤️",
    Crush: "💖",
    Friendship: "🤝",
    Family: "🏠",
    Breakup: "🌧️",

    Healing: "🌱",
    Learning: "📖",
    Focused: "🎯",
    "Self Growth": "📈",

    Dream: "🌙",
    Goal: "🚀",
    Career: "💼",
    Finance: "💰",
    Fitness: "💪",

    Secret: "🤫",
    Confession: "🗣️",
    Fantasy: "🔮",
    Memory: "📷",
    "Random Thoughts": "💭",
    Private: "🔒",

    Travel: "✈️",
    Food: "🍔",
    Gaming: "🎮",
    Music: "🎵",
    Movies: "🎬",
    Photography: "📸",
    Pets: "🐾",
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border border-gray-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {note.title}
          </h2>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                categoryColors[note.category] || categoryColors.General
              }`}
            >
              {categoryEmojis[note.category] || "📒"}{" "}
              {note.category || "General"}
            </span>

            {note.feeling && (
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  feelingColors[note.feeling] || feelingColors.Neutral
                }`}
              >
                {feelingEmojis[note.feeling] || "😊"} {note.feeling}
              </span>
            )}
          </div>
        </div>

        {onLock && (
          <div className="relative">
            <button
              onClick={() => {
                if (note.is_locked) {
                  onLock(note);
                } else {
                  setShowSecurityMenu(!showSecurityMenu);
                }
              }}
              className={`transition duration-200 ${
                note.is_locked
                  ? "text-red-500 scale-110"
                  : "text-gray-400 hover:text-red-500"
              }`}
              title={note.is_locked ? "Unlock Note" : "Lock Options"}
            >
              <Lock size={20} fill={note.is_locked ? "currentColor" : "none"} />
            </button>

            {showSecurityMenu && (
              <SecurityMenu
                note={note}
                onClose={() => setShowSecurityMenu(false)}
                onLockPIN={() => onLock(note)}
                onLockPassword={() => onSetPassword(note.id)}
                onRemovePassword={() => onRemovePassword(note.id)}
              />
            )}
          </div>
        )}

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
              title={note.is_favorite ? "Remove Favorite" : "Add Favorite"}
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
              <Pin size={20} fill={note.is_pinned ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {note.is_locked ? (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4 text-center">
          <div className="text-3xl mb-2">🔒</div>
          <p className="text-red-600 dark:text-red-300 font-semibold">
            This note is locked
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Unlock it to view its contents.
          </p>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-4 leading-relaxed">
          {note.content}
        </p>
      )}

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
