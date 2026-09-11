import { useState, useEffect } from "react";
import { Search, Settings, Sun, Moon, Menu, LogOut } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getProfileInfo } from "../../api/profile";

export default function Header({
  onMenuClick,
  searchQuery = "",
  setSearchQuery,
  placeholder = "Search",
}) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user: authUser, setUser: setAuthUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const readUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : { full_name: "User" };
    } catch {
      return { full_name: "User" };
    }
  };

  const [user, setUser] = useState(authUser || readUser);

  useEffect(() => {
    if (authUser) setUser(authUser);
  }, [authUser]);

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
    <header className="flex items-center justify-between gap-2 sm:gap-4 py-2.5 sm:py-3 px-1 sm:px-2 w-full select-none">
      {/* Mobile Menu Button (hidden on desktop) */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation sidebar"
        className="lg:hidden p-2 sm:p-2.5 text-slate-300 hover:text-cyan-400 hover:bg-white/5 rounded-xl transition cursor-pointer shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
        title="Open Menu"
      >
        <Menu size={22} />
      </button>

      {/* Center / Left: Search Bar (fluid width matching viewport) */}
      <div className="flex-1 min-w-0 max-w-2xl relative">
        <div className="relative flex items-center w-full">
          <Search
            size={17}
            className="absolute left-3.5 sm:left-4 text-slate-400 pointer-events-none shrink-0"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder={placeholder}
            aria-label="Search notes and tags"
            className="w-full bg-[#0c1624]/70 hover:bg-[#0c1624]/90 focus:bg-[#0e1a2b] border border-white/10 focus:border-cyan-500/50 rounded-2xl pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right: Controls & Profile Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Dark / Light toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Settings button (hidden on extra small screens, accessible via drawer or avatar) */}
        <Link
          to="/profile"
          aria-label="Settings"
          className="hidden sm:flex p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition cursor-pointer min-w-[36px] min-h-[36px] items-center justify-center"
          title="Settings"
        >
          <Settings size={18} />
        </Link>

        {/* Logout button (hidden on extra small screens, accessible via drawer) */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sign Out"
          className="hidden md:flex p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer min-w-[36px] min-h-[36px] items-center justify-center"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>

        {/* User Profile Avatar */}
        <Link
          to="/profile"
          aria-label={`Profile: ${user.full_name}`}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-white/20 hover:border-cyan-400 transition-all shadow-md flex items-center justify-center bg-gradient-to-tr from-cyan-600 to-blue-600 text-xs font-bold text-white cursor-pointer shrink-0"
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
