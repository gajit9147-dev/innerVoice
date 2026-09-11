import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Sun,
  Moon,
  Menu,
  X,
  ArrowLeft,
  Sparkles,
  User,
  Settings,
  LogOut,
  BookMarked,
  Tag,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getProfileInfo } from "../../api/profile";
import OnlineStatusBadge from "../common/OnlineStatusBadge";

export default function Header({
  onMenuClick,
  searchQuery = "",
  setSearchQuery,
  placeholder = "Search notes, feelings, ideas, or tags...",
  notes = [],
  notebooks = [],
  onSelectNote,
  onSelectNotebook,
  onAIAssist,
}) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user: authUser, logout } = useAuth();

  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const profileRef = useRef(null);

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Platform detection for Ctrl K / ⌘ K badge
  const isMac = useMemo(() => {
    return (
      typeof navigator !== "undefined" &&
      /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
    );
  }, []);
  const shortcutText = isMac ? "⌘ K" : "Ctrl K";

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
    navigate("/login");
  };

  const readUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : { full_name: "User", email: "" };
    } catch {
      return { full_name: "User", email: "" };
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
      } catch {
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

  // Global Ctrl/Cmd + K and Escape keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.innerWidth < 640) {
          setIsMobileSearchOpen(true);
          setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
        } else {
          searchInputRef.current?.focus();
          setIsSearchFocused(true);
        }
      } else if (e.key === "Escape") {
        setIsSearchFocused(false);
        setIsMobileSearchOpen(false);
        setIsProfileOpen(false);
        searchInputRef.current?.blur();
        mobileSearchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Outside click handler to dismiss profile and search suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute real search results for dropdown from existing user data
  const searchResults = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) {
      return { notes: [], notebooks: [], tags: [] };
    }
    const q = searchQuery.toLowerCase().trim();

    const matchedNotes = (notes || [])
      .filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q) ||
          n.category?.toLowerCase().includes(q)
      )
      .slice(0, 4);

    const matchedNotebooks = (notebooks || [])
      .filter((nb) => nb.name?.toLowerCase().includes(q))
      .slice(0, 2);

    const tagSet = new Set();
    (notes || []).forEach((n) => {
      if (Array.isArray(n.tags)) {
        n.tags.forEach((t) => {
          if (t && t.toLowerCase().includes(q)) tagSet.add(t);
        });
      }
    });
    const matchedTags = Array.from(tagSet).slice(0, 3);

    return {
      notes: matchedNotes,
      notebooks: matchedNotebooks,
      tags: matchedTags,
    };
  }, [notes, notebooks, searchQuery]);

  const hasSuggestions =
    isSearchFocused &&
    searchQuery.trim().length > 0 &&
    (searchResults.notes.length > 0 ||
      searchResults.notebooks.length > 0 ||
      searchResults.tags.length > 0);

  const initials = user.full_name
    ? user.full_name.substring(0, 2).toUpperCase()
    : "AJ";

  return (
    <header className="sticky top-0 z-30 w-full bg-[#060b11]/85 backdrop-blur-xl border-b border-white/5 py-2.5 sm:py-3 px-3 sm:px-6 select-none transition-colors">
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full min-w-0 max-w-7xl mx-auto">
        {/* =================================================== */}
        {/* LEFT: Menu Button + InnerVoice Branding            */}
        {/* =================================================== */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          {/* Menu button (controls sidebar on desktop, tablet, and mobile) */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Toggle navigation"
            title="Toggle navigation"
            className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-white/5 active:scale-95 rounded-xl transition cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
          >
            <Menu size={20} />
          </button>

          {/* InnerVoice Branding */}
          <Link
            to="/dashboard"
            aria-label="InnerVoice Dashboard"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
          >
            {/* Audio Pulse Waveform Logo */}
            <div className="flex items-center gap-0.5 h-6 shrink-0">
              <span className="w-0.5 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span className="w-0.5 h-5 bg-cyan-300 rounded-full shadow-[0_0_10px_rgba(6,182,212,1)]" />
              <span className="w-0.5 h-3.5 bg-teal-400 rounded-full animate-pulse" />
              <span className="w-0.5 h-5.5 bg-cyan-400 rounded-full" />
              <span className="w-0.5 h-2.5 bg-cyan-500 rounded-full" />
            </div>

            <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans group-hover:text-cyan-200 transition-colors">
              InnerVoice
            </span>

            {/* Desktop Tagline */}
            <span className="hidden xl:inline-flex items-center pl-3 ml-1 border-l border-white/10 text-[9px] tracking-widest uppercase font-mono text-cyan-400/60 font-semibold select-none">
              THINK • WRITE • GROW
            </span>
          </Link>
        </div>

        {/* =================================================== */}
        {/* CENTER: Primary Search Pill (Tablet & Desktop)      */}
        {/* =================================================== */}
        <div
          ref={searchContainerRef}
          className="hidden sm:block flex-1 min-w-0 max-w-md lg:max-w-lg xl:max-w-xl mx-2 sm:mx-4 relative"
        >
          <div
            className={`relative flex items-center w-full rounded-2xl bg-[#0c1624]/60 hover:bg-[#0c1624]/85 border transition-all duration-200 shadow-inner ${
              isSearchFocused
                ? "bg-[#0c1624]/95 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <Search
              size={16}
              className={`absolute left-3.5 transition-colors shrink-0 pointer-events-none ${
                isSearchFocused ? "text-cyan-400" : "text-slate-400"
              }`}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder={placeholder}
              aria-label="Search notes, feelings, ideas, or tags"
              className="w-full bg-transparent pl-10 pr-16 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400/80 focus:outline-none"
            />
            {/* Clear Query or Keyboard Shortcut Badge */}
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery && setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-3 p-1 text-slate-400 hover:text-white rounded-md transition cursor-pointer"
              >
                <X size={14} />
              </button>
            ) : (
              <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono rounded-md bg-white/5 border border-white/10 text-slate-400 select-none pointer-events-none">
                {shortcutText}
              </kbd>
            )}
          </div>

          {/* Search Suggestions Glass Dropdown */}
          {hasSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-[#09111c]/95 backdrop-blur-2xl border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.8)] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
              {/* Notes */}
              {searchResults.notes.length > 0 && (
                <div>
                  <span className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400/70 font-mono">
                    Notes
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {searchResults.notes.map((note) => (
                      <button
                        key={note.id}
                        type="button"
                        onClick={() => {
                          if (onSelectNote) onSelectNote(note);
                          setIsSearchFocused(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-white/5 hover:text-cyan-200 transition cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-xs font-medium text-slate-200 group-hover:text-cyan-200 truncate">
                            {note.title || "Untitled Note"}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {note.category || "General"}
                          </p>
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-slate-500 group-hover:text-cyan-400 shrink-0 transition-transform group-hover:translate-x-0.5"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notebooks */}
              {searchResults.notebooks.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <span className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400/70 font-mono">
                    Notebooks
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {searchResults.notebooks.map((nb) => (
                      <button
                        key={nb.id || nb.name}
                        type="button"
                        onClick={() => {
                          if (onSelectNotebook) onSelectNotebook(nb.name);
                          setIsSearchFocused(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left hover:bg-white/5 text-xs text-slate-300 hover:text-cyan-300 transition cursor-pointer"
                      >
                        <BookMarked size={14} className="text-cyan-400 shrink-0" />
                        <span className="truncate">{nb.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {searchResults.tags.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <span className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400/70 font-mono">
                    Tags
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 px-2">
                    {searchResults.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (setSearchQuery) setSearchQuery(tag);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-[11px] text-cyan-300 transition cursor-pointer"
                      >
                        <Tag size={11} />
                        <span>#{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =================================================== */}
        {/* RIGHT: [Online Status] [Mobile Search] [AI Assist] [Theme] [Profile]*/}
        {/* =================================================== */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Real-time Connectivity Badge */}
          <OnlineStatusBadge />

          {/* Mobile Search Trigger Icon (< sm only) */}
          <button
            type="button"
            onClick={() => {
              setIsMobileSearchOpen(true);
              setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
            }}
            aria-label="Search"
            title="Search"
            className="sm:hidden p-2 text-slate-400 hover:text-cyan-300 hover:bg-white/5 active:scale-95 rounded-xl transition cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
          >
            <Search size={18} />
          </button>

          {/* AI Assist Action Button (Tablet & Desktop, hidden on mobile to avoid overcrowding) */}
          <button
            type="button"
            onClick={onAIAssist}
            aria-label="Open AI assistant"
            title="✨ AI Assist — Journaling Copilot"
            className="hidden sm:flex group relative items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-purple-900/30 via-cyan-950/40 to-slate-900/60 hover:from-purple-900/50 hover:via-cyan-900/50 hover:to-slate-800/80 border border-purple-500/30 hover:border-cyan-400/60 shadow-[0_0_12px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-200 cursor-pointer text-xs font-semibold active:scale-95"
          >
            <Sparkles
              size={15}
              className="text-purple-300 group-hover:text-cyan-300 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110 shrink-0"
            />
            <span className="bg-gradient-to-r from-purple-200 to-cyan-200 bg-clip-text text-transparent">
              AI Assist
            </span>
          </button>

          {/* Theme Toggle Button (Tablet & Desktop, available inside Profile dropdown on mobile) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
            className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 active:scale-95 transition cursor-pointer min-w-[38px] min-h-[38px] items-center justify-center"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Profile Trigger & Glass Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-label="Open profile menu"
              aria-expanded={isProfileOpen}
              className="w-9 h-9 rounded-full overflow-hidden border border-white/20 hover:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 active:scale-95 transition-all shadow-md flex items-center justify-center bg-gradient-to-tr from-cyan-600 to-blue-600 text-xs font-bold text-white cursor-pointer shrink-0 aspect-square"
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
            </button>

            {/* Profile Glass Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-[#09111c]/95 backdrop-blur-2xl border border-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.85)] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Authenticated User Header */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-cyan-400/40 bg-gradient-to-tr from-cyan-600 to-blue-600 text-sm font-bold text-white flex items-center justify-center shrink-0">
                    {user.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.full_name || "InnerVoice User"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user.email || ""}
                    </p>
                  </div>
                </div>

                {/* Dropdown Navigation Links */}
                <div className="py-1.5 px-1.5 space-y-0.5 text-xs font-medium">
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition"
                  >
                    <User size={15} className="text-cyan-400" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition"
                  >
                    <Settings size={15} className="text-slate-400" />
                    <span>Settings</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="pt-1 px-1.5 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-xs font-semibold transition cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =================================================== */}
      {/* MOBILE FULL-WIDTH SEARCH OVERLAY (< sm)             */}
      {/* =================================================== */}
      {isMobileSearchOpen && (
        <div className="sm:hidden absolute inset-0 bg-[#060b11] z-40 flex items-center gap-2 px-3 py-2 animate-in fade-in duration-150">
          <button
            type="button"
            onClick={() => {
              setIsMobileSearchOpen(false);
              setIsSearchFocused(false);
            }}
            aria-label="Close search"
            className="p-2 text-slate-400 hover:text-white rounded-xl active:scale-95 transition cursor-pointer shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="relative flex-1 flex items-center">
            <Search size={16} className="absolute left-3 text-cyan-400 pointer-events-none" />
            <input
              ref={mobileSearchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search notes, feelings, ideas, or tags..."
              aria-label="Search notes, feelings, ideas, or tags"
              className="w-full bg-[#0c1624] border border-cyan-500/40 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none shadow-inner"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery && setSearchQuery("");
                  mobileSearchInputRef.current?.focus();
                }}
                aria-label="Clear query"
                className="absolute right-2.5 text-slate-400 hover:text-white p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Mobile Search Suggestions Dropdown */}
          {hasSuggestions && (
            <div className="absolute top-full left-3 right-3 mt-1.5 rounded-2xl bg-[#09111c]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-2.5 z-50 space-y-2.5 max-h-[60vh] overflow-y-auto">
              {searchResults.notes.length > 0 && (
                <div>
                  <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-cyan-400/70 font-mono">
                    Notes
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {searchResults.notes.map((note) => (
                      <button
                        key={note.id}
                        type="button"
                        onClick={() => {
                          if (onSelectNote) onSelectNote(note);
                          setIsMobileSearchOpen(false);
                          setIsSearchFocused(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-white/5 hover:text-cyan-200 transition"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-xs font-medium text-slate-200 truncate">
                            {note.title || "Untitled Note"}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {note.category || "General"}
                          </p>
                        </div>
                        <ChevronRight size={14} className="text-slate-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.notebooks.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-cyan-400/70 font-mono">
                    Notebooks
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {searchResults.notebooks.map((nb) => (
                      <button
                        key={nb.id || nb.name}
                        type="button"
                        onClick={() => {
                          if (onSelectNotebook) onSelectNotebook(nb.name);
                          setIsMobileSearchOpen(false);
                          setIsSearchFocused(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left hover:bg-white/5 text-xs text-slate-300"
                      >
                        <BookMarked size={14} className="text-cyan-400 shrink-0" />
                        <span className="truncate">{nb.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
