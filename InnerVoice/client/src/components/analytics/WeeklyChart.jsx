import { useMemo } from "react";

function WeeklyChart({ notes = [] }) {
  const activityData = useMemo(() => {
    const days = [];
    const locale = "en-US";
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
      const label = d.toLocaleDateString(locale, { weekday: "short" }); // e.g. "Mon"
      days.push({ dateStr, label, count: 0 });
    }

    notes.forEach((note) => {
      if (!note.created_at) return;
      const noteDateStr = new Date(note.created_at).toISOString().split("T")[0];
      const match = days.find((day) => day.dateStr === noteDateStr);
      if (match) {
        match.count++;
      }
    });

    return days;
  }, [notes]);

  const maxCount = Math.max(...activityData.map((d) => d.count), 1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-transparent dark:border-slate-700 transition-colors w-full">
      <h3 className="text-gray-800 dark:text-white font-bold text-lg mb-6 flex items-center gap-2">
        <span>📅</span> Weekly Activity
      </h3>

      <div className="relative flex justify-between items-end h-48 px-2 gap-2 mt-8">
        {activityData.map(({ label, count, dateStr }) => {
          const heightPercent = (count / maxCount) * 100;
          const isToday = new Date().toISOString().split("T")[0] === dateStr;

          return (
            <div key={dateStr} className="flex-1 flex flex-col items-center group relative">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-md py-1.5 px-3 mb-2 absolute -top-10 shadow-lg pointer-events-none select-none font-semibold whitespace-nowrap z-10 border border-slate-700 dark:border-slate-600 scale-90 group-hover:scale-100">
                {count} {count === 1 ? "note" : "notes"}
              </div>

              {/* Bar Container */}
              <div className="w-full bg-gray-50 dark:bg-slate-900/50 rounded-t-lg h-36 flex items-end overflow-hidden border border-gray-100 dark:border-slate-800">
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 ease-out ${
                    isToday
                      ? "bg-gradient-to-t from-blue-600 to-cyan-400 shadow-md shadow-blue-500/20"
                      : "bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-700 dark:to-slate-600 group-hover:from-blue-400 group-hover:to-blue-300"
                  }`}
                  style={{ height: `${Math.max(heightPercent, count > 0 ? 8 : 4)}%` }}
                />
              </div>

              {/* Label */}
              <span className={`text-xs mt-3 font-semibold ${isToday ? "text-blue-500 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklyChart;
