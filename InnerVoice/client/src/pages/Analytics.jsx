import { useEffect, useState } from "react";
import { getMoodStats, getCategoryStats, getWeeklyStats } from "../api/note";
import MoodChart from "../components/analytics/MoodChart";
import CategoryChart from "../components/analytics/CategoryChart";
import WeeklyChart from "../components/analytics/WeeklyChart";

function Analytics() {
  const [moods, setMoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [weekly, setWeekly] = useState([]);

  useEffect(() => {
    fetchMoodStats();
    fetchCategoryStats();
    fetchWeeklyStats();
  }, []);

  const fetchMoodStats = async () => {
    try {
      const res = await getMoodStats();
      setMoods(res.data.moods);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategoryStats = async () => {
    try {
      const res = await getCategoryStats();
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const res = await getWeeklyStats();

      const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      const chartData = weekDays.map((day) => ({
        day,
        count: 0,
      }));

      res.data.weekly.forEach((item) => {
        const jsDay = new Date(item.date).getDay();
        const index = jsDay === 0 ? 6 : jsDay - 1;

        chartData[index].count = Number(item.count);
      });

      setWeekly(chartData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">
        📊 Analytics
      </h1>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <MoodChart data={moods} />
        <CategoryChart data={categories} />
      </div>

      <div className="w-full">
        <WeeklyChart data={weekly} />
      </div>
    </div>
  );
}

export default Analytics;