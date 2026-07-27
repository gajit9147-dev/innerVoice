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
} from "../services/aiService.js";

import { analyzeNoteById } from "../services/noteAIService.js";

const parseJSONSafely = (text) => {
  let clean = text.trim();
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }
  return JSON.parse(clean);
};

export const summarizeNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || note.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Note content is required.",
      });
    }

    const prompt = summarizePrompt(note);

    const summary = await generateSummary(prompt);

    res.status(200).json({
      success: true,
      summary,
    });

  } catch (error) {
    console.error("AI Summary Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate summary.",
    });
  }
};

export const detectMoodFromNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note content is required.",
      });
    }

    const prompt = moodPrompt(note);

    const result = await detectMood(prompt);

    // Gemini returns JSON as text, so parse it robustly
    let cleanResult = result.trim();
    if (cleanResult.startsWith("```")) {
      cleanResult = cleanResult.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    }
    const moodData = JSON.parse(cleanResult);

    return res.status(200).json({
      success: true,
      mood: moodData.mood,
      confidence: moodData.confidence,
    });

  } catch (error) {
    console.error("AI Mood Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to detect mood.",
    });
  }
};

export const generateTitleFromNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note content is required.",
      });
    }

    const prompt = titlePrompt(note);
    const result = await generateTitle(prompt);

    // Gemini returns JSON as text, so parse it robustly
    let cleanResult = result.trim();
    if (cleanResult.startsWith("```")) {
      cleanResult = cleanResult.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    }
    const titleData = JSON.parse(cleanResult);

    return res.status(200).json({
      success: true,
      title: titleData.title,
    });

  } catch (error) {
    console.error("AI Title Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate title.",
    });
  }
};

export const detectCategoryFromNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note content is required.",
      });
    }

    const prompt = categoryPrompt(note);
    const result = await detectCategory(prompt);

    // Gemini returns JSON as text, so parse it robustly
    let cleanResult = result.trim();
    if (cleanResult.startsWith("```")) {
      cleanResult = cleanResult.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    }
    const categoryData = JSON.parse(cleanResult);

    return res.status(200).json({
      success: true,
      category: categoryData.category,
    });

  } catch (error) {
    console.error("AI Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to detect category.",
    });
  }
};

export const generateTagsFromNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note content is required.",
      });
    }

    const prompt = tagsPrompt(note);
    const result = await generateTags(prompt);

    // Gemini returns JSON as text, so parse it robustly
    let cleanResult = result.trim();
    if (cleanResult.startsWith("```")) {
      cleanResult = cleanResult.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    }
    const tagsData = JSON.parse(cleanResult);

    return res.status(200).json({
      success: true,
      tags: tagsData.tags,
    });

  } catch (error) {
    console.error("AI Tags Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate tags.",
    });
  }
};

export const analyzeNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await analyzeNoteById(noteId, userId);

    return res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("Analyze AI Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "AI analysis failed.",
    });
  }
};