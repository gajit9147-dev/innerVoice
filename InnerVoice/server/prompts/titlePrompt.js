export const titlePrompt = (note) => `
You are an AI assistant for the InnerVoice note-taking application.

Generate a short and meaningful title for the following note.

Rules:
- Return ONLY valid JSON.
- Do not include markdown.
- Do not include explanations.
- Title should be between 3 and 8 words.

Format:

{
  "title": "Learning React Hooks"
}

Note:
${note}
`;
