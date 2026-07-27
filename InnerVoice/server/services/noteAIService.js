import pool from "../config/db.js";

import { analyzePrompt } from "../prompts/analyzePrompt.js";

import { analyzeNoteWithAI } from "./aiService.js";

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

  // Run AI analysis
  const result = await analyzeNoteWithAI(analyzePrompt(content));

  const ai = parseJSONSafely(result);

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
      ai.title,
      ai.summary,
      ai.mood,
      ai.category,
      JSON.stringify(ai.tags),
      ai.confidence,
      noteId,
    ]
  );

  return {
    ...note,
    ai_title: ai.title,
    ai_summary: ai.summary,
    mood: ai.mood,
    category: ai.category,
    ai_tags: ai.tags,
    ai_confidence: ai.confidence,
  };
};
