import { useState, useEffect } from "react";
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
  { name: "Favorites", path: "/dashboard?filter=favorites", icon: <Star size={20} /> },
  { name: "Archive", path: "/dashboard?filter=archive", icon: <Archive size={20} /> },
  { name: "Trash", path: "/trash", icon: <Trash2 size={20} /> },
  { name: "Analytics", path: "/analytics", icon: <BarChart3 size={20} /> },
  { name: "Profile", path: "/profile", icon: <Settings size={20} /> },
];

import { useAuth } from "../../context/AuthContext";

function Sidebar({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

  const user = authUser || { full_name: "User", email: "" };
  const initials = user.full_name ? user.full_name.substring(0, 2).toUpperCase() : "GU";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-[#080f19]/95 backdrop-blur-2xl shadow-2xl border-r border-white/5 flex flex-col transition-colors duration-300">
      
      {/* Logo */}
      <div className="p-6 border-b border-white/5 transition-colors flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 h-7">
            <span className="w-1 h-3.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
            <span className="w-1 h-6 bg-cyan-300 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.9)]"></span>
            <span className="w-1 h-4 bg-teal-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]"></span>
            <span className="w-1 h-7 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.9)]"></span>
            <span className="w-1 h-3 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              InnerVoice
            </h1>
            <p className="text-slate-400 text-xs">
              Express your thoughts
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:bg-white/5 rounded-xl transition">
            <X size={22} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menu.map((item) => {
          const currentPath = location.pathname + location.search;
          const isCurrent = 
            currentPath === item.path || 
            (location.pathname === '/' && item.path === '/dashboard' && !location.search);

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isCurrent 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-medium' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-cyan-300 border border-transparent'
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
      <div className="border-t border-white/5 p-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
              {user.profile_image ? (
                <img
                  src={user.profile_image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-semibold text-slate-100 text-sm truncate">
                {user.full_name}
              </h3>
              <p className="text-slate-400 text-xs truncate">
                {user.email}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-2 cursor-pointer"
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