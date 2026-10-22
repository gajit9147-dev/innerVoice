import {
  BookOpen,
  Pin,
  Star,
  Archive,
  Trash2,
  Lock,
  Flame,
  PenLine,
  CalendarDays,
  Type,
} from "lucide-react";

import AnalyticsCard from "./AnalyticsCard";
import {
  computeStreak,
  computeWeekTotals,
  computeAverageWords,
} from "../../utils/journalStats";

function AnalyticsGrid({ stats, notes = [] }) {
  const streak = computeStreak(notes);
  const week = computeWeekTotals(notes);
  const avgWords = computeAverageWords(notes);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Writing habits (computed from your real notes) */}
      <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Current Streak"
          value={`${streak.current} ${streak.current === 1 ? "day" : "days"}`}
          hint={`Longest: ${streak.longest} ${streak.longest === 1 ? "day" : "days"}`}
          icon={<Flame />}
        />
        <AnalyticsCard
          title="Notes This Week"
          value={week.noteCount}
          hint="Last 7 days"
          icon={<CalendarDays />}
        />
        <AnalyticsCard
          title="Words This Week"
          value={week.words.toLocaleString()}
          hint="Last 7 days"
          icon={<PenLine />}
        />
        <AnalyticsCard
          title="Avg. Words / Note"
          value={avgWords.toLocaleString()}
          hint="All notes"
          icon={<Type />}
        />
      </div>

      {/* Library counts */}
      <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-3">
        <AnalyticsCard title="Total Notes" value={stats?.total} icon={<BookOpen />} />
        <AnalyticsCard title="Pinned" value={stats?.pinned} icon={<Pin />} />
        <AnalyticsCard title="Favorites" value={stats?.favorite} icon={<Star />} />
        <AnalyticsCard title="Archived" value={stats?.archived} icon={<Archive />} />
        <AnalyticsCard title="Trash" value={stats?.trash} icon={<Trash2 />} />
        <AnalyticsCard title="Locked" value={stats?.locked} icon={<Lock />} />
      </div>
    </div>
  );
}

export default AnalyticsGrid;
