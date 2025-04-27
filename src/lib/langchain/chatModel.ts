import { ChatGroq } from '@langchain/groq';

if (!process.env.GROQ_API_KEY) {
  throw new Error('Missing GROQ_API_KEY environment variable');
}

export const chatModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile", // Llama 3.3 70B Versatile model
  temperature: 0.7,
  maxTokens: 4096,
}); 