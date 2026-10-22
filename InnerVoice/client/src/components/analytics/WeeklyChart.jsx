import { useMemo } from "react";
import ChartPanel from "./ChartPanel";
import { computeDailyCounts, dayKey } from "../../utils/journalStats";

function WeeklyChart({ notes = [] }) {
  const activityData = useMemo(() => computeDailyCounts(notes), [notes]);
  const maxCount = Math.max(...activityData.map((d) => d.count), 1);
  const today = dayKey(new Date());

  return (
    <ChartPanel title="Weekly Activity">
      <div className="flex justify-between items-end h-40 sm:h-48 gap-1.5 sm:gap-3 mt-2">
        {activityData.map(({ label, count, dateStr }) => {
          const heightPercent = (count / maxCount) * 100;
          const isToday = today === dateStr;
          return (
            <div key={dateStr} className="flex-1 flex flex-col items-center min-w-0">
              <span className="text-[11px] text-[#9e9990] mb-1 h-4">{count > 0 ? count : ""}</span>
              <div className="w-full h-28 sm:h-36 flex items-end rounded-t-lg bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 ease-out ${
                    isToday ? "bg-[#e2b17a]" : "bg-[#e2b17a]/35"
                  }`}
                  style={{ height: `${Math.max(heightPercent, count > 0 ? 8 : 3)}%` }}
                  title={`${count} ${count === 1 ? "note" : "notes"}`}
                />
              </div>
              <span className={`text-[11px] sm:text-xs mt-2 ${isToday ? "text-[#e2b17a] font-semibold" : "text-[#9e9990]"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </ChartPanel>
  );
}

export default WeeklyChart;
