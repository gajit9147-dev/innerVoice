import { useMemo } from "react";
import GlassSurface from "../glass/GlassSurface";
import { getHeatmap } from "../../utils/journalInsights";

const LEVEL_CLASS = [
  "bg-white/[0.05]",
  "bg-[#e2b17a]/25",
  "bg-[#e2b17a]/45",
  "bg-[#e2b17a]/70",
  "bg-[#e2b17a]",
];

// Last 12 weeks of writing, one square per day (like a contribution graph)
export default function ActivityHeatmap({ notes = [] }) {
  const { grid, total, activeDays } = useMemo(() => getHeatmap(notes, new Date(), 12), [notes]);

  return (
    <GlassSurface level={1} className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/[0.08] min-w-0">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="font-serif text-lg sm:text-xl text-[#f5f2eb] font-normal">Writing Activity</h2>
        <span className="text-xs text-[#9e9990] text-right">
          {total} {total === 1 ? "note" : "notes"} on {activeDays} {activeDays === 1 ? "day" : "days"}, last 12 weeks
        </span>
      </div>
      <div className="flex gap-1 sm:gap-1.5" role="img" aria-label="Writing activity for the last 12 weeks">
        {grid.map((col, i) => (
          <div key={i} className="flex-1 flex flex-col gap-1 sm:gap-1.5 min-w-0">
            {col.map((cell) => (
              <div
                key={cell.dateStr}
                title={`${cell.dateStr}: ${cell.count} ${cell.count === 1 ? "note" : "notes"}`}
                className={`aspect-square rounded-[3px] sm:rounded-md ${cell.future ? "opacity-0" : LEVEL_CLASS[cell.level]}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-3 text-[11px] text-[#9e9990]">
        <span>Less</span>
        {LEVEL_CLASS.map((c, i) => (
          <span key={i} className={`w-3 h-3 rounded-[3px] ${c}`} />
        ))}
        <span>More</span>
      </div>
    </GlassSurface>
  );
}
