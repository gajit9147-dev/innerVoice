import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GlassSurface from "../glass/GlassSurface";

export default function Header({
  onMenuClick,
  searchQuery = "",
  setSearchQuery,
  placeholder = "Search notes, memories...",
  notes = [],
  onSelectNote,
  onAIAssist,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Time of day greeting
  const [greeting, setGreeting] = useState("Good evening,");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good morning,");
    else if (hour >= 12 && hour < 17) setGreeting("Good afternoon,");
    else setGreeting("Good evening,");
  }, []);

  const userName = user?.name || user?.full_name || "Ajeet";

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <header className="w-full pt-3 pb-4 sm:pt-4 sm:pb-5 px-1 sm:px-2 flex flex-col gap-3 select-none">
      {/* Mobile Top App Bar (Only visible on small screens) */}
      <div className="flex lg:hidden items-center justify-between py-1 border-b border-white/[0.06] pb-3 mb-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="p-2 text-[#9e9990] hover:text-[#f5f2eb] rounded-xl bg-white/[0.04] transition"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-serif text-2xl text-[#f5f2eb] font-normal tracking-tight">
            InnerVoice
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 text-[#9e9990] hover:text-[#f5f2eb] rounded-xl bg-white/[0.04] transition"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#242228] border border-white/10 flex items-center justify-center text-xs font-semibold text-[#e2b17a]">
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              userName.substring(0, 2).toUpperCase()
            )}
          </div>
        </div>
      </div>

      {/* Main Desktop Header Row */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Editorial Greeting */}
        <div>
          <span className="text-xs sm:text-sm font-serif italic text-[#9e9990] tracking-wide block">
            {greeting}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#f5f2eb] font-normal tracking-tight">
              {userName}
            </h1>
            <span className="text-xl sm:text-2xl text-[#e2b17a]">🌙</span>
          </div>
          <p className="text-xs sm:text-sm text-[#9e9990] mt-0.5 font-sans">
            How are you feeling today?
          </p>
        </div>

        {/* Right: Mindful Serif Quote + Actions (Desktop) */}
        <div className="hidden sm:flex flex-col items-end gap-2.5">
          <div className="flex items-center gap-4">
            <p className="font-serif italic text-sm md:text-base text-[#d1cdc7]/85 tracking-wide pr-2">
              “ A quiet mind is a more creative mind. ”
            </p>

            <div className="flex items-center gap-2 relative">
              {/* Quick Search Trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isSearchOpen
                    ? "bg-[#e2b17a]/20 text-[#e2b17a] border-[#e2b17a]/40"
                    : "bg-white/[0.04] text-[#9e9990] hover:text-[#f5f2eb] border-white/[0.07]"
                }`}
                title="Search notes"
                aria-label="Search notes"
              >
                <Search size={17} />
              </button>

              {/* Notification Bell */}
              <button
                type="button"
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#9e9990] hover:text-[#f5f2eb] border border-white/[0.07] transition cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={17} />
              </button>

              {/* User Avatar Menu */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-9 h-9 rounded-full overflow-hidden bg-[#242228] border border-white/10 hover:border-[#e2b17a]/50 transition flex items-center justify-center text-xs font-semibold text-[#e2b17a] cursor-pointer shadow-md"
                  aria-label="User profile menu"
                >
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userName.substring(0, 2).toUpperCase()
                  )}
                </button>

                {isProfileMenuOpen && (
                  <GlassSurface
                    level={3}
                    className="absolute right-0 top-11 w-48 py-2 z-50 rounded-xl"
                  >
                    <div className="px-3.5 py-2 border-b border-white/[0.06]">
                      <div className="text-xs font-semibold text-[#f5f2eb] truncate">
                        {userName}
                      </div>
                      <div className="text-[11px] text-[#9e9990] truncate">
                        {user?.email || "Stay kind to yourself."}
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#d1cdc7] hover:text-white hover:bg-white/[0.05] transition"
                    >
                      <User size={14} />
                      <span>Profile & Account</span>
                    </Link>

                    {onAIAssist && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onAIAssist();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#e2b17a] hover:bg-white/[0.05] transition"
                      >
                        <Sparkles size={14} />
                        <span>AI Reflection</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </GlassSurface>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Glass Search Bar */}
      {isSearchOpen && (
        <div className="pt-2 animate-fade-scale">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9e9990]"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-[#13141a]/85 border border-white/[0.12] focus:border-[#e2b17a]/50 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-[#f5f2eb] placeholder-[#6f6b64] focus:outline-none focus:ring-1 focus:ring-[#e2b17a]/30 transition shadow-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery && setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9e9990] hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
