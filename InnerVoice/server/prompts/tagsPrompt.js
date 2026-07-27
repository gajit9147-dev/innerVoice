export const tagsPrompt = (note) => `
You are an AI assistant.

Generate up to 5 short tags for this note.

Rules:
- Return ONLY valid JSON.
- Tags must be one or two words.
- Do not use markdown.
- Do not explain.

Format:

{
  "tags": [
    "React",
    "JWT",
    "Gemini",
    "Programming"
  ]
}

Note:
${note}
`;
