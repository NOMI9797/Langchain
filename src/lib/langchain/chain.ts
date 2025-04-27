import { ConversationChain } from 'langchain/chains';
import { chatModel } from './chatModel';
import { memory } from './memory';
import { chatPrompt } from './prompt';

export const chain = new ConversationChain({
  llm: chatModel as any,
  memory: memory,
  prompt: chatPrompt,
  verbose: process.env.NODE_ENV === 'development',
}); 