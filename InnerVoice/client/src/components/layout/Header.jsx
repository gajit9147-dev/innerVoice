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
    <header className="w-full flex flex-col py-2 sm:py-3 px-1 sm:px-2 select-none">
      {/* Top Controls Row */}
      <div className="flex items-center justify-between gap-2.5 w-full min-w-0">
        {/* Left: Mobile Menu Trigger + Brand Identity on Mobile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation sidebar"
            className="lg:hidden p-2 text-slate-300 hover:text-cyan-400 hover:bg-white/5 rounded-xl transition cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Open Menu"
          >
            <Menu size={22} />
          </button>

          {/* InnerVoice Branding on screens < lg (where desktop rail is hidden) */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="flex items-center gap-0.5 h-6">
              <span className="w-0.5 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
              <span className="w-0.5 h-5 bg-cyan-300 rounded-full shadow-[0_0_10px_rgba(6,182,212,1)]" />
              <span className="w-0.5 h-3.5 bg-teal-400 rounded-full animate-pulse" />
              <span className="w-0.5 h-5.5 bg-cyan-400 rounded-full" />
              <span className="w-0.5 h-2.5 bg-cyan-500 rounded-full" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">
              InnerVoice
            </span>
          </div>
        </div>

        {/* Center: Search Bar on tablet & desktop (sm: and up) */}
        <div className="hidden sm:block flex-1 min-w-0 max-w-xl mx-2 sm:mx-4">
          <div className="relative flex items-center w-full">
            <Search
              size={16}
              className="absolute left-3.5 text-slate-400 pointer-events-none shrink-0"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              placeholder={placeholder}
              aria-label="Search notes and tags"
              className="w-full bg-[#0c1624]/70 hover:bg-[#0c1624]/90 focus:bg-[#0e1a2b] border border-white/10 focus:border-cyan-500/50 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Right: Controls & Profile Avatar (Always strictly within viewport, never clipped) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Dark / Light toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Desktop/Tablet Settings link */}
          <Link
            to="/profile"
            aria-label="Settings"
            className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition cursor-pointer min-w-[38px] min-h-[38px] items-center justify-center"
            title="Settings"
          >
            <Settings size={18} />
          </Link>

          {/* Desktop Logout link */}
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign Out"
            className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer min-w-[38px] min-h-[38px] items-center justify-center"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>

          {/* User Profile Avatar */}
          <Link
            to="/profile"
            aria-label={`Profile: ${user.full_name}`}
            className="w-9 h-9 rounded-full overflow-hidden border border-white/20 hover:border-cyan-400 transition-all shadow-md flex items-center justify-center bg-gradient-to-tr from-cyan-600 to-blue-600 text-xs font-bold text-white cursor-pointer shrink-0 aspect-square"
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
      </div>

      {/* Mobile-Only Search Bar (Full width below header on screens < sm) */}
      <div className="sm:hidden w-full mt-2.5">
        <div className="relative flex items-center w-full">
          <Search
            size={16}
            className="absolute left-3.5 text-slate-400 pointer-events-none shrink-0"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder={placeholder}
            aria-label="Search notes and tags"
            className="w-full bg-[#0c1624]/80 border border-white/10 focus:border-cyan-500/50 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all min-h-[40px] shadow-inner"
          />
        </div>
      </div>
    </header>
  );
}
