import ai from "../config/gemini.js";

export const generateSummary = async (prompt) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  return response.text;
};