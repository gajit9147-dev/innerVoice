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
    <div className="glass-primary border border-white/[0.08] rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
      <div className="p-2.5 sm:p-3 rounded-xl bg-[#e2b17a]/15 border border-[#e2b17a]/30 text-[#e2b17a] shrink-0">
        <Sparkles size={22} />
      </div>
      <div className="min-w-0">
        <h4 className="font-serif text-lg text-[#f5f2eb]">Journaling Insight</h4>
        <p className="text-[#9e9990] text-sm mt-1.5 leading-relaxed">{insight}</p>
      </div>
    </div>
  );
}

export default InsightCard;
