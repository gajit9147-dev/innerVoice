import { useMemo } from "react";

function CategoryChart({ categories = [] }) {
  const categoryData = useMemo(() => {
    const counts = {
      General: 0,
      Work: 0,
      Study: 0,
      Personal: 0,
      Ideas: 0,
      Journal: 0,
    };

    let total = 0;
    categories.forEach((item) => {
      const name = item.category || "General";
      if (counts[name] !== undefined) {
        counts[name] = item.count;
        total += item.count;
      }
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    })).sort((a, b) => b.count - a.count);
  }, [categories]);

  const categoryColors = {
    General: "from-slate-400 to-slate-500",
    Work: "from-blue-400 to-blue-500",
    Study: "from-green-400 to-green-500",
    Personal: "from-purple-400 to-purple-500",
    Ideas: "from-yellow-400 to-yellow-500",
    Journal: "from-pink-400 to-pink-500",
  };

  const categoryEmojis = {
    General: "📒",
    Work: "💼",
    Study: "📚",
    Personal: "👤",
    Ideas: "💡",
    Journal: "📝",
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-transparent dark:border-slate-700 transition-colors flex-1">
      <h3 className="text-gray-800 dark:text-white font-bold text-lg mb-6 flex items-center gap-2">
        <span>📊</span> Category Breakdown
      </h3>

      <div className="space-y-4">
        {categoryData.map(({ name, count, percentage }) => {
          const colorClass = categoryColors[name] || categoryColors.General;
          return (
            <div key={name} className="flex items-center gap-4">
              <div className="text-2xl w-8 text-center">{categoryEmojis[name]}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center text-sm font-medium mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{name}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">{count} {count === 1 ? "note" : "notes"} ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${colorClass} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryChart;
