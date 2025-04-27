import { PromptTemplate } from 'langchain/prompts';

export const chatPrompt = PromptTemplate.fromTemplate(`
You are a helpful AI assistant. You aim to provide clear, accurate, and helpful responses.

Current conversation:
{chat_history}

Human: {input}
Assistant: 
`); 