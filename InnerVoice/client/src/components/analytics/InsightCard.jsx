import { useMemo } from "react";
import { Sparkles } from "lucide-react";

function InsightCard({ moods = [], categories = [], notes = [] }) {
  const insight = useMemo(() => {
    if (notes.length === 0) {
      return "Start writing notes to unlock personalized analytics insights!";
    }

    const topMood = moods[0]?.feeling;
    const topCategory = categories[0]?.category;

    let message = "";
    if (topMood && topCategory) {
      message = `You've been logging mostly "${topMood}" feelings, often focusing on your "${topCategory}" category.`;
    } else if (topCategory) {
      message = `You spend most of your time writing in your "${topCategory}" notebook.`;
    } else if (topMood) {
      message = `You've been feeling mostly "${topMood}" lately.`;
    }

    // Activity advice
    const activeDays = {};
    notes.forEach((note) => {
      if (note.created_at) {
        const day = new Date(note.created_at).toLocaleDateString("en-US", { weekday: "long" });
        activeDays[day] = (activeDays[day] || 0) + 1;
      }
    });

    const topDay = Object.entries(activeDays).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topDay) {
      message += ` Your most productive day of the week is ${topDay}.`;
    }

    return message || "Keep up your daily journaling habit to track your personal growth!";
  }, [moods, categories, notes]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950 border border-blue-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-start gap-4 transition-all duration-300">
      <div className="p-3 rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/20">
        <Sparkles size={24} />
      </div>
      <div>
        <h4 className="font-bold text-gray-800 dark:text-white text-lg">Journaling Insight</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1.5 leading-relaxed font-medium">
          {insight}
        </p>
      </div>
    </div>
  );
}

export default InsightCard;
