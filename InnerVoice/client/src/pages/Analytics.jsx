import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import AnalyticsGrid from "../components/analytics/AnalyticsGrid";
import MoodChart from "../components/analytics/MoodChart";
import CategoryChart from "../components/analytics/CategoryChart";
import WeeklyChart from "../components/analytics/WeeklyChart";
import InsightCard from "../components/analytics/InsightCard";
import { getDashboardStats, getMoodStats, getCategoryStats, getNotes } from "../api/note";
import { TrendingUp } from "lucide-react";

function Analytics() {
  const [stats, setStats] = useState(null);
  const [moods, setMoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
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
        <div className="max-w-6xl mx-auto p-6 text-center py-20 text-gray-500 dark:text-gray-400 font-medium">
          Loading analytics data...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="mt-4 mb-2">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <TrendingUp className="text-blue-600 dark:text-blue-500" />
            Analytics Overview
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Track your journaling habits, emotional distribution, and category breakdowns.
          </p>
        </div>

        {/* Stats Summary Grid */}
        {stats && <AnalyticsGrid stats={stats} />}

        {/* AI Insight Card */}
        <InsightCard moods={moods} categories={categories} notes={notes} />

        {/* Breakdown Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MoodChart data={moods} />
          <CategoryChart data={categories} />
        </div>

        {/* Weekly Writing Frequency Chart */}
        <div className="w-full">
          <WeeklyChart notes={notes} />
        </div>
      </div>
    </Layout>
  );
}

export default Analytics;