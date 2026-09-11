import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Plus,
  ArrowRight,
  AlertCircle,
  RotateCw,
} from "lucide-react";

/**
 * Helper to get local YYYY-MM-DD string from a Date object
 */
function toDateKey(date) {
  if (!date || isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format timestamp to 12-hour time (e.g. "09:15 AM")
 */
function formatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format date for display (e.g. "September 11, 2026")
 */
function formatDisplayDate(date) {
  if (!date || isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function CalendarView({
  notes = [],
  onSelectNote,
  onNewNote,
  isLoading = false,
  error = null,
  onRetry,
}) {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // Group real notes by YYYY-MM-DD of note.created_at
  const notesByDate = useMemo(() => {
    const map = {};
    notes.forEach((note) => {
      if (!note.created_at) return;
      const noteDate = new Date(note.created_at);
      if (isNaN(noteDate.getTime())) return;
      const key = toDateKey(noteDate);
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(note);
    });

    // Sort notes inside each date chronologically by created_at (newest first)
    Object.keys(map).forEach((key) => {
      map[key].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return map;
  }, [notes]);

  // Calendar month math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const calendarCells = useMemo(() => {
    const cells = [];

    // Leading days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const cellDate = new Date(year, month - 1, dayNum);
      cells.push({
        date: cellDate,
        dateKey: toDateKey(cellDate),
        dayNumber: dayNum,
        isCurrentMonth: false,
      });
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      cells.push({
        date: cellDate,
        dateKey: toDateKey(cellDate),
        dayNumber: day,
        isCurrentMonth: true,
      });
    }

    // Trailing days of next month to complete 6-row or 5-row grid (fill to multiple of 7)
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remaining = totalCells - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const cellDate = new Date(year, month + 1, day);
      cells.push({
        date: cellDate,
        dateKey: toDateKey(cellDate),
        dayNumber: day,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [year, month, startingDayOfWeek, daysInMonth, prevMonthLastDay]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const selectedDateKey = toDateKey(selectedDate);
  const todayKey = toDateKey(today);
  const selectedDayNotes = notesByDate[selectedDateKey] || [];

  const monthTitle = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-6 pb-8 animate-in fade-in duration-200">
      {/* Top Header & Month Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 sm:p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{monthTitle}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Browse your journal entries by actual creation date
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={handleJumpToday}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 border border-white/10 text-xs font-semibold transition cursor-pointer"
            title="Go to Today"
          >
            Today
          </button>
          <div className="flex items-center gap-1 bg-slate-900/80 rounded-xl border border-white/10 p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-8 text-center glass-panel rounded-2xl">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading your notes calendar...</p>
        </div>
      )}

      {/* Error State with Retry */}
      {error && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-rose-300 text-xs">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition cursor-pointer"
            >
              <RotateCw size={13} />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Main Responsive Grid: Calendar on Left, Day Notes on Right (or Stacked on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid Container (7 Cols on desktop, 12 on mobile) */}
        <div className="lg:col-span-7 xl:col-span-8 glass-panel p-4 sm:p-6 rounded-2xl">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-[11px] sm:text-xs font-semibold text-slate-400 py-1 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Date Cells Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarCells.map((cell) => {
              const isSelected = cell.dateKey === selectedDateKey;
              const isToday = cell.dateKey === todayKey;
              const cellNotes = notesByDate[cell.dateKey] || [];
              const hasNotes = cellNotes.length > 0;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  onClick={() => setSelectedDate(cell.date)}
                  className={`relative min-h-[50px] sm:min-h-[64px] md:min-h-[72px] p-1.5 sm:p-2 rounded-xl flex flex-col justify-between items-start transition-all cursor-pointer text-left ${
                    !cell.isCurrentMonth
                      ? "opacity-30 hover:opacity-70 bg-white/[0.01]"
                      : isSelected
                      ? "bg-cyan-500/20 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                      : isToday
                      ? "bg-white/[0.05] border border-cyan-400/50 hover:bg-white/10"
                      : "bg-slate-900/40 border border-white/5 hover:border-white/20 hover:bg-white/5"
                  }`}
                  aria-label={`${formatDisplayDate(cell.date)}, ${cellNotes.length} notes`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-semibold ${
                        isSelected
                          ? "text-cyan-200"
                          : isToday
                          ? "text-cyan-400 font-bold"
                          : cell.isCurrentMonth
                          ? "text-slate-200"
                          : "text-slate-500"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Today indicator badge */}
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,1)]" />
                    )}
                  </div>

                  {/* Notes Indicator Pill */}
                  {hasNotes && (
                    <div className="w-full mt-1">
                      <div
                        className={`w-full flex items-center justify-center gap-1 py-0.5 px-1 rounded-md text-[10px] font-mono transition ${
                          isSelected
                            ? "bg-cyan-400/30 text-cyan-100 font-bold"
                            : "bg-cyan-950/70 text-cyan-300 border border-cyan-500/30"
                        }`}
                        title={`${cellNotes.length} note${cellNotes.length > 1 ? "s" : ""}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span className="truncate">
                          {cellNotes.length} {cellNotes.length === 1 ? "note" : "notes"}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details & Notes List (5 Cols on desktop, 12 on mobile) */}
        <div className="lg:col-span-5 xl:col-span-4 glass-panel p-4 sm:p-6 rounded-2xl space-y-5">
          {/* Header of Selected Date */}
          <div className="border-b border-white/10 pb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
              Selected Day
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              {formatDisplayDate(selectedDate)}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <BookOpen size={13} className="text-cyan-400" />
              <span>
                {selectedDayNotes.length === 0
                  ? "No notes created on this date"
                  : `${selectedDayNotes.length} note${selectedDayNotes.length > 1 ? "s" : ""} recorded`}
              </span>
            </p>
          </div>

          {/* Notes List on Selected Date */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {selectedDayNotes.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <p className="text-xs text-slate-400">
                  You haven't written any reflections on this day.
                </p>
                {onNewNote && (
                  <button
                    type="button"
                    onClick={onNewNote}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 text-xs font-semibold transition cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Create a Note</span>
                  </button>
                )}
              </div>
            ) : (
              selectedDayNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onSelectNote && onSelectNote(note)}
                  className="group p-3.5 rounded-xl bg-slate-900/60 hover:bg-cyan-950/30 border border-white/5 hover:border-cyan-400/50 transition-all cursor-pointer space-y-2 shadow-sm"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectNote && onSelectNote(note);
                    }
                  }}
                  aria-label={`Open note: ${note.title || "Untitled"}`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono text-cyan-400 flex items-center gap-1 font-semibold">
                      <Clock size={12} />
                      {formatTime(note.created_at)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {note.category || "General"}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition truncate">
                    {note.title || "Untitled Note"}
                  </h4>

                  {note.content && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {note.content.replace(/[#*`_]/g, "").slice(0, 120)}
                    </p>
                  )}

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-cyan-400 transition">
                    <span>Click to open in editor</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
