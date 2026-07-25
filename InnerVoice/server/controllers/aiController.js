import { generateSummary } from "../services/aiService.js";
import { summarizePrompt } from "../prompts/summarizePrompt.js";

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
