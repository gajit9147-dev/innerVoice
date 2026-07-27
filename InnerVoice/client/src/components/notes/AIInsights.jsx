import React from "react";
import MoodBadge from "./MoodBadge";
import Tag from "./Tag";

const AIInsights = ({ note }) => {
  if (!note) return null;

  return (
    <div className="mt-6 rounded-2xl border border-violet-200 bg-white p-6 shadow-lg dark:border-violet-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-2xl">✨</span>
        <h2 className="text-xl font-bold text-violet-700 dark:text-violet-400">
          AI Insights
        </h2>
      </div>

      {/* AI Title */}
      <div className="mb-5">
        <h3 className="mb-1 font-semibold text-gray-700 dark:text-gray-300">
          🤖 AI Title
        </h3>

        <p className="text-lg font-medium text-violet-600 dark:text-violet-400">
          {note.ai_title || "Not available"}
        </p>
      </div>

      {/* Summary */}
      <div className="mb-5">
        <h3 className="mb-1 font-semibold text-gray-700 dark:text-gray-300">
          📄 Summary
        </h3>

        <p className="leading-7 text-gray-600 dark:text-gray-400">
          {note.ai_summary || "Summary not generated yet."}
        </p>
      </div>

      {/* Mood */}
      <div className="mb-5">
        <h3 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
          😊 Mood
        </h3>

        <MoodBadge
          mood={note.mood}
          confidence={note.ai_confidence}
        />
      </div>

      {/* Category */}
      <div className="mb-5">
        <h3 className="mb-1 font-semibold text-gray-700 dark:text-gray-300">
          📂 Category
        </h3>

        <p className="font-medium text-blue-600 dark:text-blue-400">
          {note.category}
        </p>
      </div>

      {/* Tags */}
      <div>
        <h3 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
          🏷 Tags
        </h3>

        <div className="flex flex-wrap gap-2">
          {Array.isArray(note.ai_tags) && note.ai_tags.length > 0 ? (
            note.ai_tags.map((tag) => (
              <Tag key={tag} text={tag} />
            ))
          ) : (
            <span className="text-gray-500">
              No tags available
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
