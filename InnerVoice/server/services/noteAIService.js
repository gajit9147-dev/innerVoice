import pool from "../config/db.js";

import { summarizePrompt } from "../prompts/summarizePrompt.js";
import { moodPrompt } from "../prompts/moodPrompt.js";
import { titlePrompt } from "../prompts/titlePrompt.js";
import { categoryPrompt } from "../prompts/categoryPrompt.js";
import { tagsPrompt } from "../prompts/tagsPrompt.js";

import {
  generateSummary,
  detectMood,
  generateTitle,
  detectCategory,
  generateTags,
} from "./aiService.js";

const parseJSONSafely = (text) => {
  let clean = text.trim();
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }
  return JSON.parse(clean);
};

export const analyzeNoteById = async (noteId, userId) => {
  // Fetch the note
  const [rows] = await pool.query(
    `
    SELECT *
    FROM notes
    WHERE id = ? AND user_id = ?
    `,
    [noteId, userId]
  );

  if (rows.length === 0) {
    throw new Error("Note not found.");
  }

  const note = rows[0];

  const content = `
Title: ${note.title}

Content:
${note.content}
`;

  // Run all AI tasks in parallel
  const [
    summaryText,
    moodText,
    titleText,
    categoryText,
    tagsText,
  ] = await Promise.all([
    generateSummary(summarizePrompt(content)),
    detectMood(moodPrompt(content)),
    generateTitle(titlePrompt(content)),
    detectCategory(categoryPrompt(content)),
    generateTags(tagsPrompt(content)),
  ]);

  const summary = summaryText;

  const mood = parseJSONSafely(moodText);
  const aiTitle = parseJSONSafely(titleText);
  const category = parseJSONSafely(categoryText);
  const tags = parseJSONSafely(tagsText);

  await pool.query(
    `
    UPDATE notes
    SET
      ai_title = ?,
      ai_summary = ?,
      mood = ?,
      category = ?,
      ai_tags = ?,
      ai_confidence = ?
    WHERE id = ?
    `,
    [
      aiTitle.title,
      summary,
      mood.mood,
      category.category,
      JSON.stringify(tags.tags),
      mood.confidence,
      noteId,
    ]
  );

  return {
    ...note,
    ai_title: aiTitle.title,
    ai_summary: summary,
    mood: mood.mood,
    category: category.category,
    ai_tags: tags.tags,
    ai_confidence: mood.confidence,
  };
};
