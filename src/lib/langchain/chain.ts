import { ConversationChain } from 'langchain/chains';
import { chatModel } from './chatModel';
import { createMemory, MemoryConfig } from './memory';
import { chatPrompt } from './prompt';

export interface ChainConfig {
  conversationId: string;
  maxTokens?: number;
  returnMessages?: boolean;
}

export const createChain = (config: ChainConfig) => {
  const memory = createMemory({
    conversationId: config.conversationId,
    maxTokens: config.maxTokens,
    returnMessages: config.returnMessages,
  });

  return new ConversationChain({
    llm: chatModel,
    memory,
    prompt: chatPrompt,
    verbose: process.env.NODE_ENV === 'development',
  });
}; 