import { useEffect, useState } from "react";
import StatsGrid from "./StatsGrid";
import MoodChart from "./MoodChart";
import CategoryChart from "./CategoryChart";
import WeeklyActivity from "./WeeklyActivity";
import { getDashboardStats, getNotes } from "../../api/note";

function DashboardOverview({ notes: initialNotes }) {
  const [stats, setStats] = useState(null);
  const [notes, setNotes] = useState(initialNotes || []);
  const [loading, setLoading] = useState(true);

  const fetchOverviewData = async () => {
    try {
      const [statsRes, notesRes] = await Promise.all([
        getDashboardStats(),
        initialNotes ? Promise.resolve(null) : getNotes(),
      ]);

      setStats(statsRes.data.stats);
      if (notesRes) {
        setNotes(notesRes.data.notes || []);
      }
    } catch (error) {
      console.error("Overview data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialNotes) {
      setNotes(initialNotes);
    }
    fetchOverviewData();
  }, [initialNotes]);

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500 dark:text-gray-400 font-medium">
        Loading analytics overview...
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Stats Cards Row */}
      <StatsGrid stats={stats} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MoodChart notes={notes} />
        <CategoryChart notes={notes} />
      </div>

      {/* Weekly Activity Row */}
      <div className="w-full">
        <WeeklyActivity notes={notes} />
      </div>
    </div>
  );
}

export default DashboardOverview;
