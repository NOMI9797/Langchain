import { BufferMemory } from 'langchain/memory';
import { getDb } from '../db/mongodb';
import { ChatMessage } from '../db/chatHistory';
import { BaseMemory, InputValues } from '@langchain/core/memory';

export interface MemoryConfig {
  conversationId: string;
  maxTokens?: number;
  returnMessages?: boolean;
}

export class ChatMemory extends BufferMemory {
  private conversationId: string;

  constructor(config: MemoryConfig) {
    super({
      returnMessages: config.returnMessages ?? true,
      memoryKey: "chat_history",
      inputKey: "input",
      outputKey: "response",
    });
    this.conversationId = config.conversationId;
  }

  async loadMemoryVariables(): Promise<{ chat_history: string }> {
    const db = await getDb();
    const conversation = await db.collection('chat_conversations').findOne({ 
      conversationId: this.conversationId 
    });

    if (!conversation?.messages) {
      return { chat_history: '' };
    }

    // Format messages for the memory
    const formattedHistory = conversation.messages
      .map((msg: ChatMessage) => `${msg.role}: ${msg.content}`)
      .join('\n');

    return { chat_history: formattedHistory };
  }

  async saveContext(
    inputValues: InputValues,
    outputValues: Record<string, any>
  ): Promise<void> {
    await super.saveContext(inputValues, outputValues);
    
    // Save to MongoDB
    const db = await getDb();
    const input = inputValues.input as string;
    const output = outputValues.response as string;

    const message: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    await db.collection('chat_conversations').updateOne(
      { conversationId: this.conversationId },
      {
        $push: { messages: message },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    );

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: output,
      timestamp: new Date()
    };

    await db.collection('chat_conversations').updateOne(
      { conversationId: this.conversationId },
      {
        $push: { messages: assistantMessage },
        $set: { updatedAt: new Date() }
      }
    );
  }
}

export const createMemory = (config: MemoryConfig) => {
  return new ChatMemory(config);
}; 