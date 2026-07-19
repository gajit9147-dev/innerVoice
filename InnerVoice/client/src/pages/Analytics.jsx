import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import StatsCard from "../components/dashboard/StatsCard";
import { getNotes } from "../api/note";
import { PieChart, BarChart, TrendingUp, FolderHeart } from "lucide-react";

function Analytics() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await getNotes();
        setNotes(res.data.notes);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotes();
  }, []);

  // Compute Metrics
  const totalNotes = notes.length;

  const now = new Date();
  
  const notesThisWeek = notes.filter((note) => {
    if (!note.created_at) return false;
    const noteDate = new Date(note.created_at);
    const diffTime = Math.abs(now - noteDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  const notesThisMonth = notes.filter((note) => {
    if (!note.created_at) return false;
    const noteDate = new Date(note.created_at);
    return noteDate.getMonth() === now.getMonth() && noteDate.getFullYear() === now.getFullYear();
  }).length;

  // Most used category
  const categoryCount = {};
  let mostUsedCategory = "None";
  let maxCount = 0;

  notes.forEach((note) => {
    categoryCount[note.category] = (categoryCount[note.category] || 0) + 1;
    if (categoryCount[note.category] > maxCount) {
      maxCount = categoryCount[note.category];
      mostUsedCategory = note.category;
    }
  });

  return (
    <Layout>
        <div className="mt-8 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <TrendingUp className="text-blue-600 dark:text-blue-500" />
            Analytics Overview
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Track your journaling habits and insights over time.</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatsCard
            title="Total Notes"
            value={totalNotes}
            icon="📝"
            color="bg-blue-500"
          />
          <StatsCard
            title="Notes This Week"
            value={notesThisWeek}
            icon="📅"
            color="bg-green-500"
          />
          <StatsCard
            title="Notes This Month"
            value={notesThisMonth}
            icon="🗓️"
            color="bg-purple-500"
          />
          <StatsCard
            title="Top Category"
            value={mostUsedCategory}
            icon={<FolderHeart size={20} />}
            color="bg-orange-500"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          {/* Mood Distribution Placeholder */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center min-h-[300px] transition-colors">
            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-5 transition-colors">
              <PieChart size={40} className="text-gray-400 dark:text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-100">Mood Distribution</h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-3 max-w-sm text-center leading-relaxed">
              Start tagging your notes with moods to unlock insights into your emotional journey. (Coming soon)
            </p>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center min-h-[300px] transition-colors">
            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-5 transition-colors">
              <BarChart size={40} className="text-gray-400 dark:text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-100">Writing Frequency</h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-3 max-w-sm text-center leading-relaxed">
              Visual charts and graphs of your daily and weekly writing habits will appear here in a future update. (Coming soon)
            </p>
          </div>
        </div>
    </Layout>
  );
}

export default Analytics;