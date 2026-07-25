import { useMemo } from "react";

function MoodChart({ notes }) {
  const moodData = useMemo(() => {
    const counts = {};
    notes.forEach((note) => {
      if (note.feeling) {
        counts[note.feeling] = (counts[note.feeling] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [notes]);

  const feelingEmojis = {
    Neutral: "😐", Happy: "😊", Excited: "🤩", Grateful: "🙏", Motivated: "🔥",
    Proud: "🏆", Hopeful: "✨", Peaceful: "🕊️", Inspired: "💡", Lonely: "🥺",
    Sad: "😔", Heartbroken: "💔", Disappointed: "😞", Anxious: "😰", Worried: "😟",
    Overwhelmed: "🤯", Exhausted: "😫", Angry: "😡", Frustrated: "😤", Confused: "😕",
    Overthinking: "🌀", Stressed: "⚡", Love: "❤️", Crush: "💖", Friendship: "🤝",
    Family: "🏠", Breakup: "🌧️", Healing: "🌱", Learning: "📖", Focused: "🎯",
    "Self Growth": "📈", Secret: "🤫", Confession: "🗣️", Fantasy: "🔮", Memory: "📷",
    "Random Thoughts": "💭", Private: "🔒", Travel: "✈️", Food: "🍔", Gaming: "🎮",
    Music: "🎵", Movies: "🎬", Photography: "📸", Pets: "🐾",
  };

  const maxCount = moodData.length > 0 ? Math.max(...moodData.map((d) => d.count)) : 1;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-transparent dark:border-slate-700 transition-colors flex-1">
      <h3 className="text-gray-800 dark:text-white font-bold text-lg mb-6 flex items-center gap-2">
        <span>🎭</span> Mood Analytics
      </h3>

      {moodData.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-10">
          No mood entries logged yet.
        </p>
      ) : (
        <div className="space-y-4">
          {moodData.map(({ mood, count }) => {
            const percentage = (count / maxCount) * 100;
            return (
              <div key={mood} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="text-lg">{feelingEmojis[mood] || "😐"}</span> {mood}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">{count} {count === 1 ? "note" : "notes"}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-900 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MoodChart;
