import React from "react";

function StatsCard({ title, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
            {value}
          </h2>
        </div>

        <div className={`text-4xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
