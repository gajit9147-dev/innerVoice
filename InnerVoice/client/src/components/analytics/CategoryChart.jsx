import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function CategoryChart({ data }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
        📂 Category Distribution
      </h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="category" />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Bar
              dataKey="count"
              radius={[8, 8, 0, 0]}
              fill="#3B82F6"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CategoryChart;
