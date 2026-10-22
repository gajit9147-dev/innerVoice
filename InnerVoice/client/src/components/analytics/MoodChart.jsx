import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import ChartPanel from "./ChartPanel";

const COLORS = ["#e2b17a", "#7fb8a4", "#a78bda", "#d98c8c", "#7aa7e2", "#c9d97a", "#e2a0c4", "#9e9990"];

function MoodChart({ data = [] }) {
  return (
    <ChartPanel
      title="Mood Distribution"
      empty={data.length === 0}
      emptyText="Add a feeling to your notes to see your mood mix."
    >
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="feeling"
              cx="50%"
              cy="45%"
              outerRadius="70%"
              stroke="rgba(0,0,0,0.3)"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#14151a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#f5f2eb" }}
              itemStyle={{ color: "#f5f2eb" }}
            />
            <Legend wrapperStyle={{ color: "#9e9990", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
}

export default MoodChart;
