// ============================================================
// utils/journalInsights.js
// Pure helpers for three features: daily writing prompts,
// "On this day" memories and the activity heatmap.
// No React, no network, so they are easy to test.
// ============================================================

const DAY_MS = 24 * 60 * 60 * 1000;

export const WRITING_PROMPTS = [
  "What is one small thing that made you smile today?",
  "What are you carrying right now that you could put down for a while?",
  "Describe today in three words, then say why.",
  "Who made your week easier, and what would you like to tell them?",
  "What did you learn about yourself recently?",
  "What would a calm version of tomorrow look like?",
  "What are you avoiding, and what is the smallest first step?",
  "Write about a place where you feel safe.",
  "What are three things you are grateful for right now?",
  "What did you need today that you did not get?",
  "Which moment from this week do you want to remember?",
  "What is a worry you can let go of tonight?",
  "What made you proud of yourself lately, even if it was small?",
  "If your best friend felt like you do now, what would you tell them?",
  "What is one thing you want more of in your life?",
  "What is one thing you want less of?",
  "Write a letter to yourself one year from now.",
  "What does a good day look like for you?",
  "What song matches your mood today, and why?",
  "What is something you forgave yourself for recently?",
  "What did you do today just for yourself?",
  "What is a habit you want to start, and what is stopping you?",
  "Describe a memory that still makes you feel warm.",
  "What is on your mind that you have not said out loud?",
  "What are you looking forward to?",
  "What was the hardest part of today, and how did you get through it?",
  "What would you do this week if you were not afraid of failing?",
  "Who do you miss, and what do you remember about them?",
  "What is one boundary you want to keep?",
  "What does rest mean to you right now?",
];

// Day of the year (1-366) in local time
const dayOfYear = (d) => {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / DAY_MS);
};

// Same prompt all day, a different one tomorrow. `shift` lets the user shuffle.
export function getDailyPrompt(date = new Date(), shift = 0) {
  const idx = (dayOfYear(date) + shift) % WRITING_PROMPTS.length;
  return WRITING_PROMPTS[(idx + WRITING_PROMPTS.length) % WRITING_PROMPTS.length];
}

const localKey = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const liveNotes = (notes) => (notes || []).filter((n) => n && !n.is_deleted && n.created_at);

// Notes written on this calendar day in earlier years, plus exactly 1 week and 1 month ago.
// Returns [{ note, label }] with the oldest first. Locked notes are skipped (their text is private).
export function getOnThisDay(notes, now = new Date()) {
  const month = now.getMonth();
  const date = now.getDate();
  const year = now.getFullYear();
  const weekAgo = localKey(new Date(now.getTime() - 7 * DAY_MS));
  const monthAgoDate = new Date(now);
  monthAgoDate.setMonth(month - 1);
  const monthAgo = monthAgoDate.getMonth() === (month + 11) % 12 ? localKey(monthAgoDate) : null;

  const out = [];
  liveNotes(notes).forEach((note) => {
    if (note.is_locked) return;
    const d = new Date(note.created_at);
    if (Number.isNaN(d.getTime())) return;
    const key = localKey(d);
    if (d.getMonth() === month && d.getDate() === date && d.getFullYear() < year) {
      const n = year - d.getFullYear();
      out.push({ note, label: n === 1 ? "1 year ago" : `${n} years ago`, sort: d.getTime() });
    } else if (key === monthAgo) {
      out.push({ note, label: "1 month ago", sort: d.getTime() });
    } else if (key === weekAgo) {
      out.push({ note, label: "1 week ago", sort: d.getTime() });
    }
  });
  return out.sort((a, b) => a.sort - b.sort).map(({ note, label }) => ({ note, label }));
}

// Activity heatmap: `weeks` columns (Sunday to Saturday), oldest first, ending with the current week.
// Cells after today are marked future. level is 0..4 relative to the busiest day in range.
export function getHeatmap(notes, now = new Date(), weeks = 12) {
  const counts = {};
  liveNotes(notes).forEach((n) => {
    const k = localKey(n.created_at);
    if (k) counts[k] = (counts[k] || 0) + 1;
  });

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(today.getTime() - (today.getDay() + (weeks - 1) * 7) * DAY_MS);
  const grid = [];
  let max = 0;
  let total = 0;
  let activeDays = 0;
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start.getTime() + (w * 7 + d) * DAY_MS);
      const dateStr = localKey(day);
      const future = day > today;
      const count = future ? 0 : counts[dateStr] || 0;
      if (count > 0) {
        activeDays++;
        total += count;
        max = Math.max(max, count);
      }
      col.push({ dateStr, count, future, level: 0 });
    }
    grid.push(col);
  }
  grid.forEach((col) =>
    col.forEach((cell) => {
      if (cell.count > 0) cell.level = Math.max(1, Math.ceil((cell.count / max) * 4));
    })
  );
  return { grid, total, activeDays, max };
}
