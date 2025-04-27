import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatConversation {
  _id?: ObjectId;
  conversationId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  preview?: string;
  assistantPreview?: string;
}

const COLLECTION = 'chat_conversations';

export async function saveMessage(conversationId: string, message: ChatMessage) {
  const db = await getDb();
  const now = new Date();
  await db.collection(COLLECTION).updateOne(
    { conversationId },
    {
      $setOnInsert: { conversationId, createdAt: now },
      $push: { messages: message },
      $set: { updatedAt: now },
    },
    { upsert: true }
  );
}

export async function getConversations() {
  const db = await getDb();
  // Get conversations and their first user message as preview
  const conversations = await db.collection<ChatConversation>(COLLECTION)
    .find({}, { projection: { messages: { $slice: 2 }, conversationId: 1, createdAt: 1, updatedAt: 1 } })
    .sort({ updatedAt: -1 })
    .toArray();
  // Add preview fields
  return conversations.map(convo => {
    const firstMsg = convo.messages?.[0];
    const firstAssistant = convo.messages?.find(m => m.role === 'assistant');
    return {
      ...convo,
      preview: firstMsg && firstMsg.role === 'user' ? firstMsg.content : 'New Chat',
      assistantPreview: firstAssistant ? firstAssistant.content : '',
    };
  });
}

export async function getConversationMessages(conversationId: string) {
  const db = await getDb();
  const convo = await db.collection<ChatConversation>(COLLECTION).findOne({ conversationId });
  return convo?.messages || [];
} 