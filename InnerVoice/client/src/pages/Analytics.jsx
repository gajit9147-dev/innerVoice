import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import AnalyticsGrid from "../components/analytics/AnalyticsGrid";
import MoodChart from "../components/analytics/MoodChart";
import CategoryChart from "../components/analytics/CategoryChart";
import WeeklyChart from "../components/analytics/WeeklyChart";
import ActivityHeatmap from "../components/analytics/ActivityHeatmap";
import InsightCard from "../components/analytics/InsightCard";
import { getDashboardStats, getMoodStats, getCategoryStats, getNotes } from "../api/note";
import { TrendingUp, Loader2 } from "lucide-react";

function Analytics() {
  const [stats, setStats] = useState(null);
  const [moods, setMoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(false);
      const [statsRes, moodsRes, categoriesRes, notesRes] = await Promise.all([
        getDashboardStats(),
        getMoodStats(),
        getCategoryStats(),
        getNotes(),
      ]);

      setStats(statsRes.data.stats);
      setMoods(moodsRes.data.moods || []);
      setCategories(categoriesRes.data.categories || []);
      setNotes(notesRes.data.notes || []);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh] text-[#9e9990] gap-2">
          <Loader2 className="animate-spin text-[#e2b17a]" size={24} />
          <span>Loading analytics...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-4 space-y-5 sm:space-y-8 animate-fade-scale">
        <div className="pb-3 border-b border-white/[0.06]">
          <h1 className="font-serif text-2xl sm:text-3xl text-[#f5f2eb] font-normal tracking-tight flex items-center gap-2">
            <TrendingUp className="text-[#e2b17a] shrink-0" size={26} />
            <span>Analytics</span>
          </h1>
          <p className="text-xs text-[#9e9990] mt-1">
            Your writing habits, moods and notebooks, calculated from your real notes.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 text-red-200 text-sm p-4 flex items-center justify-between gap-3">
            <span>Could not load all analytics data.</span>
            <button onClick={fetchAnalyticsData} className="px-3 py-1 rounded-lg border border-red-300/30 hover:bg-red-500/20 text-xs">
              Retry
            </button>
          </div>
        )}

        <AnalyticsGrid stats={stats} notes={notes} />

        <InsightCard moods={moods} categories={categories} notes={notes} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <MoodChart data={moods} />
          <CategoryChart data={categories} />
        </div>

        <ActivityHeatmap notes={notes} />

        <WeeklyChart notes={notes} />
      </div>
    </Layout>
  );
}

export default Analytics;
