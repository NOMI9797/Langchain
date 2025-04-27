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
  return db.collection<ChatConversation>(COLLECTION)
    .find({}, { projection: { messages: 0 } })
    .sort({ updatedAt: -1 })
    .toArray();
}

export async function getConversationMessages(conversationId: string) {
  const db = await getDb();
  const convo = await db.collection<ChatConversation>(COLLECTION).findOne({ conversationId });
  return convo?.messages || [];
} 