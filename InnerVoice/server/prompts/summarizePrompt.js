export const summarizePrompt = (note) => `
You are an AI assistant for the InnerVoice note-taking application.

Summarize the following note in 2–3 concise sentences.
Keep the important information and remove unnecessary details.

Note:
${note}
`;

export const moodPrompt = (content) => `
  Analyze the emotional tone of this journal entry. Choose exactly one mood from the following list:
  Neutral, Happy, Excited, Grateful, Motivated, Proud, Hopeful, Peaceful, Inspired, Lonely, Sad, Heartbroken, Disappointed, Anxious, Worried, Overwhelmed, Exhausted, Angry, Frustrated, Confused, Overthinking, Stressed, Love, Crush, Friendship, Family, Breakup, Healing, Learning, Focused, Self Growth.
  
  Return ONLY the single word mood (from the list above), and absolutely nothing else.
  
  Journal Entry:
  "${content}"
`;

export const tagsPrompt = (content) => `
  Generate 2-4 relevant hashtags (e.g., #personal, #thoughts) based on the following journal entry. 
  Return them as a comma-separated list. Keep them lowercase and clean.
  
  Journal Entry:
  "${content}"
`;
