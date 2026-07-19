import { Calendar, NotebookPen, Flame } from "lucide-react";

function ProfileStats() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-slate-700 transition-colors">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
        Account Statistics
      </h3>
      
      <div className="space-y-5">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl transition-colors hover:shadow-sm">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <NotebookPen size={20} className="text-blue-500" />
            <span className="font-medium">Total Notes</span>
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-white">42</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl transition-colors hover:shadow-sm">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <Calendar size={20} className="text-purple-500" />
            <span className="font-medium">Member Since</span>
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-white">Jul 2026</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl transition-colors hover:shadow-sm">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <Flame size={20} className="text-orange-500" />
            <span className="font-medium">Current Streak</span>
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-white">5 Days</span>
        </div>
      </div>
    </div>
  );
}

export default ProfileStats;
