import { PromptTemplate } from '@langchain/core/prompts';

export const chatPrompt = PromptTemplate.fromTemplate(`
You are Chatty, a helpful and friendly AI assistant. You aim to provide clear, accurate, and helpful responses.

Current conversation:
{chat_history}

H: {input}
Chatty: 
`); 