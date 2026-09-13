import React from "react";
import {
  Home,
  BookOpen,
  Image as ImageIcon,
  Music2,
  Archive,
  Search,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GlassSurface from "../glass/GlassSurface";

export default function Sidebar({
  activeTab = "today",
  onSelectTab,
  onCloseMobile,
  onOpenSettings,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { key: "today", label: "Today", icon: Home },
    { key: "journal", label: "Journal", icon: BookOpen },
    { key: "memories", label: "Memories", icon: ImageIcon },
    { key: "music", label: "Music", icon: Music2 },
    { key: "archive", label: "Archive", icon: Archive },
    { key: "search", label: "Search", icon: Search },
  ];

  const userName = user?.name || user?.full_name || "Ajeet";
  const userAvatar = user?.profile_image || "/assets/avatar.png";

  return (
    <GlassSurface
      level={1}
      className="w-64 h-[calc(100vh-2rem)] my-4 ml-4 flex flex-col justify-between p-5 select-none shrink-0 overflow-y-auto"
    >
      {/* Top Header & Logo */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-[#f5f2eb] font-normal">
              InnerVoice
            </h1>
            <p className="text-[12px] text-[#9e9990] mt-1 font-sans">
              A safe space for your real self.
            </p>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-stone-400 hover:text-white rounded-lg transition"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  if (onSelectTab) onSelectTab(item.key);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "nav-item-active text-[#f5f2eb]"
                    : "text-[#9e9990] hover:text-[#f5f2eb] hover:bg-white/[0.04]"
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-[#e2b17a]" : "text-[#9e9990]"}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Center / Decorative Artistic Flourish */}
      <div className="my-6 px-2 py-4 flex items-center justify-between border-t border-b border-white/[0.04]">
        {/* Botanical sprig SVG */}
        <svg
          className="w-8 h-14 text-[#9e9990]/40 shrink-0"
          viewBox="0 0 40 70"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 65 C20 40, 22 25, 20 5" />
          <path d="M20 48 C28 42, 34 45, 33 50 C31 54, 25 52, 20 48" />
          <path d="M20 36 C12 30, 6 33, 7 38 C9 42, 15 40, 20 36" />
          <path d="M20 24 C27 18, 33 21, 32 26 C30 29, 24 28, 20 24" />
          <path d="M20 12 C14 8, 9 10, 10 14 C12 17, 16 16, 20 12" />
        </svg>

        <div className="font-handwriting text-right leading-tight pr-1">
          <span className="block text-lg text-[#d1cdc7]/85 tracking-wide">
            Better
          </span>
          <span className="block text-xl text-[#e2b17a] font-medium">
            Thoughts
          </span>
          <span className="block text-base text-[#9e9990]">
            Brighter You
          </span>
        </div>
      </div>

      {/* Bottom Settings & User Profile */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={() => {
            if (onOpenSettings) onOpenSettings();
            else if (onSelectTab) onSelectTab("settings");
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
            activeTab === "settings"
              ? "nav-item-active text-[#f5f2eb]"
              : "text-[#9e9990] hover:text-[#f5f2eb] hover:bg-white/[0.04]"
          }`}
        >
          <Settings size={18} className="text-[#9e9990]" />
          <span>Settings</span>
        </button>

        {/* Profile Pill */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#242228] border border-white/10 shrink-0 flex items-center justify-center text-xs font-semibold text-[#e2b17a]">
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
            <div className="min-w-0">
              <div className="text-sm font-medium text-[#f5f2eb] truncate">
                {userName}
              </div>
              <div className="text-[11px] text-[#9e9990] truncate font-sans">
                Stay kind to yourself.
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 text-[#9e9990] hover:text-rose-400 rounded-lg transition shrink-0"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </GlassSurface>
  );
}