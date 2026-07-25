import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import DashboardOverview from "../components/dashboard/DashboardOverview";
import { getNotes } from "../api/note";
import { TrendingUp } from "lucide-react";

function Analytics() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await getNotes();
        setNotes(res.data.notes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mt-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <TrendingUp className="text-blue-600 dark:text-blue-500" />
            Analytics Overview
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Track your journaling habits and insights over time.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 font-medium">
            Loading analytics data...
          </div>
        ) : (
          <DashboardOverview notes={notes} />
        )}
      </div>
    </Layout>
  );
}

export default Analytics;