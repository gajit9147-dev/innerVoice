import {
  LayoutDashboard,
  NotebookPen,
  Star,
  Archive,
  Trash2,
  BarChart3,
  Settings,
  X,
  LogOut,
  ShieldAlert
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "Notes", path: "/dashboard", icon: <NotebookPen size={20} /> },
  { name: "Favorites", path: "/dashboard", icon: <Star size={20} /> },
  { name: "Archive", path: "/dashboard", icon: <Archive size={20} /> },
  { name: "Trash", path: "/dashboard", icon: <Trash2 size={20} /> },
  { name: "Analytics", path: "/analytics", icon: <BarChart3 size={20} /> },
  { name: "Profile", path: "/profile", icon: <Settings size={20} /> },
];

function Sidebar({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { full_name: "Guest", email: "guest@example.com" };
  const initials = user.full_name ? user.full_name.substring(0, 2).toUpperCase() : "GU";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-800 shadow-lg border-r border-gray-100 dark:border-slate-700 flex flex-col transition-colors duration-300">
      
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-slate-700 transition-colors flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-500">
            📝 InnerVoice
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Express your thoughts
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition">
            <X size={24} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menu.map((item) => {
          const isCurrent = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
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

        {user.role === 'admin' && (
          <div className="px-4 mt-6">
            <Link
              to="/admin"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                location.pathname === "/admin"
                  ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <ShieldAlert size={20} />
              Admin Panel
            </Link>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 dark:border-slate-700 p-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
              {initials}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">
                {user.full_name}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                {user.email}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors ml-2"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;