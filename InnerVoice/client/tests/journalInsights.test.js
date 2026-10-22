import test from "node:test";
import assert from "node:assert/strict";
import { getDailyPrompt, getOnThisDay, getHeatmap, WRITING_PROMPTS } from "../src/utils/journalInsights.js";

const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).toISOString();

test("daily prompt is stable within a day and changes with shuffle", () => {
  const a = getDailyPrompt(new Date(2026, 9, 22, 8));
  const b = getDailyPrompt(new Date(2026, 9, 22, 23));
  assert.equal(a, b);
  assert.notEqual(getDailyPrompt(new Date(2026, 9, 22), 1), a);
  assert.ok(WRITING_PROMPTS.includes(getDailyPrompt(new Date(2026, 0, 1), -5)));
});

test("on this day finds earlier years, 1 week and 1 month ago, skips locked and deleted", () => {
  const now = new Date(2026, 9, 22, 10); // Oct 22 2026
  const notes = [
    { id: 1, created_at: at(2025, 10, 22) },
    { id: 2, created_at: at(2024, 10, 22) },
    { id: 3, created_at: at(2026, 10, 15) }, // 1 week ago
    { id: 4, created_at: at(2026, 9, 22) }, // 1 month ago
    { id: 5, created_at: at(2025, 10, 22), is_locked: 1 },
    { id: 6, created_at: at(2025, 10, 22), is_deleted: 1 },
    { id: 7, created_at: at(2026, 10, 22) }, // today, not "on this day"
    { id: 8, created_at: at(2026, 10, 10) },
  ];
  const res = getOnThisDay(notes, now);
  assert.deepEqual(res.map((r) => r.note.id), [2, 1, 4, 3]);
  assert.deepEqual(res.map((r) => r.label), ["2 years ago", "1 year ago", "1 month ago", "1 week ago"]);
});

test("one month ago is skipped when the month has no such day", () => {
  const now = new Date(2026, 2, 31, 10); // Mar 31, Feb has no 31st
  const res = getOnThisDay([{ id: 1, created_at: at(2026, 3, 3) }], now);
  assert.equal(res.length, 0);
});

test("heatmap has 12 weeks x 7 days, counts notes and marks future cells", () => {
  const now = new Date(2026, 9, 22, 10); // Thursday
  const notes = [
    { created_at: at(2026, 10, 22) },
    { created_at: at(2026, 10, 22) },
    { created_at: at(2026, 10, 20) },
    { created_at: at(2026, 7, 1) }, // outside range
    { created_at: at(2026, 10, 21), is_deleted: 1 },
  ];
  const h = getHeatmap(notes, now, 12);
  assert.equal(h.grid.length, 12);
  assert.ok(h.grid.every((c) => c.length === 7));
  assert.equal(h.total, 3);
  assert.equal(h.activeDays, 2);
  assert.equal(h.max, 2);
  const flat = h.grid.flat();
  assert.equal(flat.find((c) => c.dateStr === "2026-10-22").level, 4);
  assert.equal(flat.find((c) => c.dateStr === "2026-10-20").level, 2);
  assert.equal(flat.find((c) => c.dateStr === "2026-10-23").future, true);
  assert.equal(h.grid[11][0].dateStr, "2026-10-18"); // current week starts Sunday
});
