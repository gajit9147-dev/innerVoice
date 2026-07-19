function StatsCard({ title, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 flex items-center justify-between border border-transparent dark:border-slate-700 transition-colors">
      <div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
      </div>
      <div className={`w-12 h-12 flex items-center justify-center rounded-full text-white text-xl ${color}`}>
        {icon}
      </div>
    </div>
  );
}

export default StatsCard;
