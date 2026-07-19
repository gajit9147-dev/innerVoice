import {
  LayoutDashboard,
  NotebookPen,
  Star,
  Archive,
  Trash2,
  BarChart3,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "Notes", path: "/dashboard", icon: <NotebookPen size={20} /> },
  { name: "Favorites", path: "/dashboard", icon: <Star size={20} /> },
  { name: "Archive", path: "/dashboard", icon: <Archive size={20} /> },
  { name: "Trash", path: "/dashboard", icon: <Trash2 size={20} /> },
  { name: "Analytics", path: "/analytics", icon: <BarChart3 size={20} /> },
  { name: "Settings", path: "/dashboard", icon: <Settings size={20} /> },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-800 shadow-lg border-r border-gray-100 dark:border-slate-700 flex flex-col transition-colors duration-300">
      
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-slate-700 transition-colors">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-500">
          📝 InnerVoice
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Express your thoughts
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menu.map((item) => {
          const isCurrent = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isCurrent 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 dark:border-slate-700 p-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md">
            AG
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              Ajeet Gupta
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              AI/ML Student
            </p>
          </div>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;