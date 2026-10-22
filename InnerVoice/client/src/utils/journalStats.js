// ============================================================
// utils/journalStats.js
// Single source of truth for writing-habit numbers (streak,
// words, notes per week). Everything is computed from the real
// notes list, so no page shows made-up values.
// ============================================================

const DAY_MS = 24 * 60 * 60 * 1000;

// Local calendar day key, e.g. "2026-10-22" (not UTC, so late-night notes count for the right day)
export const dayKey = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const activeNotes = (notes) =>
  (notes || []).filter((n) => n && !n.is_deleted && n.created_at);

export const countWords = (text) =>
  typeof text === "string" ? text.split(/\s+/).filter(Boolean).length : 0;

// Current streak: consecutive days with at least one note, ending today.
// If nothing was written today yet, a streak that ended yesterday still counts.
export function computeStreak(notes, now = new Date()) {
  const days = new Set(activeNotes(notes).map((n) => dayKey(n.created_at)).filter(Boolean));
  if (days.size === 0) return { current: 0, longest: 0 };

  let cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor = new Date(cursor.getTime() - DAY_MS);
  let current = 0;
  while (days.has(dayKey(cursor))) {
    current++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }

  const sorted = [...days].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(`${sorted[i - 1]}T12:00:00`);
    const next = new Date(`${sorted[i]}T12:00:00`);
    run = Math.round((next - prev) / DAY_MS) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  return { current, longest };
}

// Notes and words written in the last 7 days (today included)
export function computeWeekTotals(notes, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setTime(start.getTime() - 6 * DAY_MS);
  let noteCount = 0;
  let words = 0;
  activeNotes(notes).forEach((n) => {
    if (new Date(n.created_at) >= start) {
      noteCount++;
      words += countWords(n.content);
    }
  });
  return { noteCount, words };
}

export function computeAverageWords(notes) {
  const list = activeNotes(notes);
  if (list.length === 0) return 0;
  return Math.round(list.reduce((sum, n) => sum + countWords(n.content), 0) / list.length);
}

// Last 7 days as [{ dateStr, label, count }], oldest first
export function computeDailyCounts(notes, now = new Date()) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY_MS);
    days.push({
      dateStr: dayKey(d),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      count: 0,
    });
  }
  activeNotes(notes).forEach((n) => {
    const hit = days.find((d) => d.dateStr === dayKey(n.created_at));
    if (hit) hit.count++;
  });
  return days;
}

// Notes that carry a photo, voice memo or the "Memories" category
export function countMemories(notes) {
  return activeNotes(notes).filter(
    (n) =>
      n.category === "Memories" ||
      (n.photos && n.photos.length > 0) ||
      n.photo_url ||
      n.voice_memo ||
      n.voice_url ||
      n.audio_url
  ).length;
}
