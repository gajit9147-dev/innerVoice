import { useState, useEffect } from "react";
import {
  Menu,
  LayoutGrid,
  Layers,
  PenTool,
  Calendar,
  Settings,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SlimRail({
  activeTab = "overview",
  onSelectTab,
  onToggleDrawer,
  onOpenNewNote,
  onOpenGuide,
  onOpenHelp,
}) {
  const readUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : { full_name: "Ajeet" };
    } catch {
      return { full_name: "Ajeet" };
    }
  };

  const [user, setUser] = useState(readUser);

  useEffect(() => {
    const handleStorage = () => setUser(readUser());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const initials = user.full_name
    ? user.full_name.substring(0, 2).toUpperCase()
    : "AJ";

  const handleTabClick = (tabKey) => {
    if (onSelectTab) onSelectTab(tabKey);
  };

  return (
    <aside className="w-16 h-screen flex flex-col items-center justify-between py-5 border-r border-white/5 bg-[#070d15]/90 backdrop-blur-2xl z-30 select-none shrink-0">
      {/* Top Icons */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Menu toggle */}
        <button
          onClick={onToggleDrawer}
          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-xl transition-all cursor-pointer"
          title="Toggle Notebooks Sidebar"
        >
          <Menu size={22} />
        </button>

        {/* Nav Items */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          {/* Active Grid Launcher (Glowing cyan pill in reference image) */}
          <button
            onClick={() => handleTabClick("overview")}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.5)]"
                : "text-slate-400 hover:text-cyan-300 hover:bg-white/5"
            }`}
            title="Dashboard Overview"
          >
            <LayoutGrid size={20} />
          </button>

          {/* Notes Grid Toggle */}
          <button
            onClick={() => handleTabClick("notes")}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeTab === "notes"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.5)]"
                : "text-slate-400 hover:text-cyan-300 hover:bg-white/5"
            }`}
            title="Browse All Notes"
          >
            <Layers size={20} />
          </button>

          {/* Quick Create Note */}
          <button
            onClick={() => {
              handleTabClick("editor");
              if (onOpenNewNote) onOpenNewNote();
            }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeTab === "editor"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.5)]"
                : "text-slate-400 hover:text-cyan-300 hover:bg-white/5"
            }`}
            title="Create New Note"
          >
            <PenTool size={19} />
          </button>

          {/* Calendar / Timeline */}
          <button
            onClick={() => handleTabClick("calendar")}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeTab === "calendar"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.5)]"
                : "text-slate-400 hover:text-cyan-300 hover:bg-white/5"
            }`}
            title="Timeline & Calendar"
          >
            <Calendar size={19} />
          </button>

          {/* Settings */}
          <Link
            to="/profile"
            className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-all cursor-pointer"
            title="Account & Settings"
          >
            <Settings size={19} />
          </Link>
        </div>
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center gap-3.5 w-full px-2">
        {/* Guides & Tips */}
        <button
          onClick={onOpenGuide}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-all cursor-pointer"
          title="Journaling Tips & Guide"
        >
          <BookOpen size={19} />
        </button>

        {/* Help & Support */}
        <button
          onClick={onOpenHelp}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-all cursor-pointer"
          title="Help & Shortcuts"
        >
          <HelpCircle size={19} />
        </button>

        {/* Small Profile Avatar at the very bottom */}
        <Link
          to="/profile"
          className="mt-1 w-9 h-9 rounded-full overflow-hidden border border-white/20 hover:border-cyan-400 transition-all shadow-md flex items-center justify-center bg-gradient-to-tr from-cyan-600 to-blue-600 text-xs font-bold text-white cursor-pointer"
          title={user.full_name || "Profile"}
        >
          {user.profile_image ? (
            <img
              src={user.profile_image}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </Link>
      </div>
    </aside>
  );
}
