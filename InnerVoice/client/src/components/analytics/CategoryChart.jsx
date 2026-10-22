import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import ChartPanel from "./ChartPanel";

function CategoryChart({ data = [] }) {
  return (
    <ChartPanel
      title="Category Distribution"
      empty={data.length === 0}
      emptyText="Notes you write will be grouped by notebook here."
    >
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="category" tick={{ fill: "#9e9990", fontSize: 11 }} interval={0} />
            <YAxis allowDecimals={false} tick={{ fill: "#9e9990", fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{ background: "#14151a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#f5f2eb" }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#e2b17a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
}

export default CategoryChart;
