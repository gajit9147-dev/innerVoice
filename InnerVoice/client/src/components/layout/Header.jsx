import { useState, useEffect } from "react";
import { Search, Settings, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";
import { getProfileInfo } from "../../api/profile";

export default function Header({
  onMenuClick,
  searchQuery = "",
  setSearchQuery,
  placeholder = "Search",
}) {
  const { theme, toggleTheme } = useTheme();

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
    const syncProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await getProfileInfo();
        const profile = res?.data?.profile;
        if (profile) {
          const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
          const updatedUser = {
            ...savedUser,
            full_name: profile.full_name,
            email: profile.email,
            profile_image: profile.profile_image,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch (err) {
        // Silently catch profile sync
      }
    };
    syncProfile();
  }, []);

  useEffect(() => {
    const handleStorage = () => setUser(readUser());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const initials = user.full_name
    ? user.full_name.substring(0, 2).toUpperCase()
    : "AJ";

  return (
    <header className="flex items-center justify-between gap-4 py-3 px-2 w-full select-none">
      {/* Mobile Menu Button (hidden on desktop) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-xl transition cursor-pointer"
        title="Open Menu"
      >
        <Menu size={22} />
      </button>

      {/* Center / Left: Search Bar (pill input matching screenshot) */}
      <div className="flex-1 max-w-2xl relative">
        <div className="relative flex items-center w-full">
          <Search
            size={18}
            className="absolute left-4 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#0c1624]/70 hover:bg-[#0c1624]/90 focus:bg-[#0e1a2b] border border-white/10 focus:border-cyan-500/50 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right: Settings Cog & Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Dark / Light toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition cursor-pointer"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {/* Settings button */}
        <Link
          to="/profile"
          className="p-2.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition cursor-pointer"
          title="Settings"
        >
          <Settings size={19} />
        </Link>

        {/* User Profile Avatar */}
        <Link
          to="/profile"
          className="w-10 h-10 rounded-full overflow-hidden border border-white/20 hover:border-cyan-400 transition-all shadow-md flex items-center justify-center bg-gradient-to-tr from-cyan-600 to-blue-600 text-xs font-bold text-white cursor-pointer ml-1"
          title={user.full_name}
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
    </header>
  );
}
