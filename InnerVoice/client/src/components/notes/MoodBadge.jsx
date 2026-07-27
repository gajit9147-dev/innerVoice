import React from "react";

const moodStyles = {
  Happy: "bg-green-100 text-green-700",
  Calm: "bg-blue-100 text-blue-700",
  Sad: "bg-indigo-100 text-indigo-700",
  Angry: "bg-red-100 text-red-700",
  Motivated: "bg-orange-100 text-orange-700",
  Excited: "bg-purple-100 text-purple-700",
};

const MoodBadge = ({ mood, confidence }) => {
  const style =
    moodStyles[mood] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${style}`}
    >
      {mood || "Unknown"}

      {confidence && (
        <span className="ml-2 opacity-70">
          ({confidence}%)
        </span>
      )}
    </span>
  );
};

export default MoodBadge;
